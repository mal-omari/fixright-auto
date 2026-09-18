import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, test } from 'node:test'

import { createDemoClient, resetDemoData } from '../lib/demo-supabase.ts'
import { resolveLiveOperationsMode } from '../lib/deployment-mode.ts'

class MemoryStorage {
  #values = new Map()

  get length() {
    return this.#values.size
  }

  clear() {
    this.#values.clear()
  }

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null
  }

  key(index) {
    return [...this.#values.keys()][index] ?? null
  }

  removeItem(key) {
    this.#values.delete(key)
  }

  setItem(key, value) {
    this.#values.set(key, String(value))
  }
}

async function rows(client, table) {
  const result = await client.from(table).select('*')
  assert.equal(result.error, null, `expected ${table} query to succeed`)
  assert.ok(Array.isArray(result.data), `expected ${table} to return an array`)
  return result.data
}

describe('deployment mode boundary', () => {
  test('defaults to demo and activates live operations only when both modes are live', () => {
    assert.equal(resolveLiveOperationsMode(undefined, undefined), false)
    assert.equal(resolveLiveOperationsMode('demo', 'demo'), false)
    assert.equal(resolveLiveOperationsMode('live', 'live'), true)
  })

  test('rejects both split configurations and invalid values', () => {
    assert.throws(() => resolveLiveOperationsMode('live', 'demo'), /Unsafe split app mode/)
    assert.throws(() => resolveLiveOperationsMode('demo', 'live'), /Unsafe split app mode/)
    assert.throws(() => resolveLiveOperationsMode('preview', 'preview'), /must be either/)
  })
})

describe('browser-local demo Supabase adapter', () => {
  let storage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  test('seeds a useful, relationally consistent workshop dataset', async () => {
    const client = createDemoClient({ storage })
    const [customers, services, mechanics, bookings, invoices, lineItems] = await Promise.all([
      rows(client, 'customers'),
      rows(client, 'services'),
      rows(client, 'mechanics'),
      rows(client, 'bookings'),
      rows(client, 'invoices'),
      rows(client, 'invoice_line_items'),
    ])

    assert.ok(customers.length >= 4, 'seed should contain several customers')
    assert.ok(services.length >= 4, 'seed should contain several services')
    assert.ok(mechanics.length >= 2, 'seed should contain multiple mechanics')
    assert.ok(bookings.length >= 6, 'seed should populate list, schedule, and analytics views')
    assert.ok(invoices.length >= 4, 'seed should demonstrate the invoice workflow')
    assert.ok(lineItems.length >= invoices.length, 'seed invoices should contain line items')

    const customerIds = new Set(customers.map(({ id }) => id))
    const serviceIds = new Set(services.map(({ id }) => id))
    const mechanicIds = new Set(mechanics.map(({ id }) => id))
    const bookingIds = new Set(bookings.map(({ id }) => id))
    const invoiceIds = new Set(invoices.map(({ id }) => id))

    for (const booking of bookings) {
      if (booking.customer_id) assert.ok(customerIds.has(booking.customer_id), `missing customer for booking ${booking.id}`)
      if (booking.service_id) assert.ok(serviceIds.has(booking.service_id), `missing service for booking ${booking.id}`)
      if (booking.mechanic_id) assert.ok(mechanicIds.has(booking.mechanic_id), `missing mechanic for booking ${booking.id}`)
    }
    for (const invoice of invoices) {
      assert.ok(invoice.booking_id && bookingIds.has(invoice.booking_id), `missing booking for invoice ${invoice.id}`)
      assert.ok(lineItems.some(({ invoice_id }) => invoice_id === invoice.id), `missing line items for invoice ${invoice.id}`)
    }
    for (const item of lineItems) {
      assert.ok(invoiceIds.has(item.invoice_id), `missing invoice for line item ${item.id}`)
      assert.equal(item.total, item.quantity * item.unit_price)
    }

    assert.deepEqual(
      new Set(bookings.map(({ status }) => status)),
      new Set(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
      'bookings should demonstrate every portal status',
    )
    assert.deepEqual(
      new Set(invoices.map(({ status }) => status)),
      new Set(['draft', 'sent', 'paid', 'overdue']),
      'invoices should demonstrate every portal status',
    )
  })

  test('supports Supabase-style filters, ordering, limiting, and row helpers', async () => {
    const client = createDemoClient({ storage })

    const activeServices = await client
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(3)

    assert.equal(activeServices.error, null)
    assert.equal(activeServices.data.length, 3)
    assert.deepEqual(
      activeServices.data.map(({ name }) => name),
      activeServices.data.map(({ name }) => name).toSorted(),
    )

    const projected = await client
      .from('services')
      .select('id, name')
      .eq('id', activeServices.data[0].id)
      .single()
    assert.equal(projected.error, null)
    assert.deepEqual(Object.keys(projected.data).toSorted(), ['id', 'name'])

    const visibleBookings = await client
      .from('bookings')
      .select('*')
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })

    assert.equal(visibleBookings.error, null)
    assert.ok(visibleBookings.data.length >= 2)
    assert.ok(visibleBookings.data.every(({ status }) => status === 'pending' || status === 'confirmed'))
    assert.deepEqual(
      visibleBookings.data.map(({ created_at }) => created_at),
      visibleBookings.data.map(({ created_at }) => created_at).toSorted().toReversed(),
    )

    const target = visibleBookings.data[0]
    const found = await client.from('bookings').select('*').eq('id', target.id).single()
    assert.equal(found.error, null)
    assert.equal(found.data.id, target.id)

    const missing = await client.from('bookings').select('*').eq('id', 'missing-booking').maybeSingle()
    assert.equal(missing.error, null)
    assert.equal(missing.data, null)

    const missingRequired = await client.from('bookings').select('*').eq('id', 'missing-booking').single()
    assert.equal(missingRequired.data, null)
    assert.ok(missingRequired.error)
  })

  test('supports exact head counts, grouped range filters, exclusions, and schedule relations', async () => {
    const client = createDemoClient({ storage })
    const allBookings = await rows(client, 'bookings')
    const pendingCount = allBookings.filter(({ status }) => status === 'pending').length

    const countResult = await client
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    assert.equal(countResult.error, null)
    assert.equal(countResult.data, null)
    assert.equal(countResult.count, pendingCount)

    const activeDates = allBookings
      .filter(({ status }) => status !== 'cancelled')
      .flatMap(({ confirmed_date, preferred_date }) => [confirmed_date, preferred_date])
      .filter(Boolean)
      .toSorted()
    const weekFrom = activeDates[0]
    const weekTo = activeDates.at(-1)

    const schedule = await client
      .from('bookings')
      .select(`
        id,
        status,
        service_id,
        mechanic_id,
        confirmed_date,
        preferred_date,
        services (name),
        mechanics (name)
      `)
      .or(`confirmed_date.gte.${weekFrom},preferred_date.gte.${weekFrom}`)
      .or(`confirmed_date.lte.${weekTo},preferred_date.lte.${weekTo}`)
      .not('status', 'eq', 'cancelled')

    assert.equal(schedule.error, null)
    assert.ok(schedule.data.length > 0)
    assert.ok(schedule.data.every(({ status }) => status !== 'cancelled'))
    for (const booking of schedule.data) {
      assert.ok(Object.hasOwn(booking, 'services'))
      assert.ok(Object.hasOwn(booking, 'mechanics'))
      if (booking.service_id) assert.match(booking.services.name, /\S+/)
      if (booking.mechanic_id) assert.match(booking.mechanics.name, /\S+/)
    }
  })

  test('inserts, updates, and deletes records with Supabase-compatible result shapes', async () => {
    const client = createDemoClient({ storage })

    const insertedCustomer = await client
      .from('customers')
      .insert({
        name: 'Demo Driver',
        phone: '416-555-0199',
        email: 'driver@example.invalid',
      })
      .select()
      .single()

    assert.equal(insertedCustomer.error, null)
    assert.match(insertedCustomer.data.id, /\S+/)
    assert.equal(insertedCustomer.data.name, 'Demo Driver')
    assert.equal(insertedCustomer.data.is_vip, false)
    assert.match(insertedCustomer.data.created_at, /^\d{4}-\d{2}-\d{2}T/)

    const insertedBooking = await client
      .from('bookings')
      .insert({
        customer_id: insertedCustomer.data.id,
        customer_name: insertedCustomer.data.name,
        customer_phone: insertedCustomer.data.phone,
        customer_email: insertedCustomer.data.email,
        vehicle_year: 2021,
        vehicle_make: 'Honda',
        vehicle_model: 'Civic',
        service_description: 'Diagnostic inspection',
        status: 'pending',
      })
      .select()
      .single()

    assert.equal(insertedBooking.error, null)
    assert.equal(insertedBooking.data.customer_id, insertedCustomer.data.id)

    const update = await client
      .from('bookings')
      .update({ status: 'confirmed', notes: 'Customer approved the time.' })
      .eq('id', insertedBooking.data.id)

    assert.equal(update.error, null)
    const updated = await client.from('bookings').select('*').eq('id', insertedBooking.data.id).single()
    assert.equal(updated.data.status, 'confirmed')
    assert.equal(updated.data.notes, 'Customer approved the time.')

    const deletion = await client.from('bookings').delete().eq('id', insertedBooking.data.id)
    assert.equal(deletion.error, null)
    const deleted = await client.from('bookings').select('*').eq('id', insertedBooking.data.id).maybeSingle()
    assert.equal(deleted.error, null)
    assert.equal(deleted.data, null)
  })

  test('generates sequential invoice numbers and persists the sequence', async () => {
    const firstClient = createDemoClient({ storage })
    const first = await firstClient.rpc('next_invoice_number')
    const second = await firstClient.rpc('next_invoice_number')

    assert.equal(first.error, null)
    assert.equal(second.error, null)
    assert.match(first.data, /^DEMO-\d{4}$/)
    assert.match(second.data, /^DEMO-\d{4}$/)
    assert.equal(Number(second.data.slice(5)), Number(first.data.slice(5)) + 1)

    const reloadedClient = createDemoClient({ storage })
    const third = await reloadedClient.rpc('next_invoice_number')
    assert.equal(third.error, null)
    assert.equal(Number(third.data.slice(5)), Number(second.data.slice(5)) + 1)
  })

  test('persists mutations across clients and restores the original seed on reset', async () => {
    const firstClient = createDemoClient({ storage })
    const seeded = await firstClient.from('bookings').select('*').order('created_at').limit(1).single()
    assert.equal(seeded.error, null)
    const originalStatus = seeded.data.status

    await firstClient.from('bookings').update({ status: 'completed' }).eq('id', seeded.data.id)
    await firstClient.from('services').insert({
      name: 'Temporary Demo Service',
      estimated_hours: 1,
      is_active: true,
    })

    const reloadedClient = createDemoClient({ storage })
    const persistedBooking = await reloadedClient.from('bookings').select('*').eq('id', seeded.data.id).single()
    const persistedService = await reloadedClient.from('services').select('*').eq('name', 'Temporary Demo Service').single()
    assert.equal(persistedBooking.data.status, 'completed')
    assert.equal(persistedService.data.name, 'Temporary Demo Service')

    resetDemoData(storage)

    const resetClient = createDemoClient({ storage })
    const resetBooking = await resetClient.from('bookings').select('*').eq('id', seeded.data.id).single()
    const removedService = await resetClient.from('services').select('*').eq('name', 'Temporary Demo Service').maybeSingle()
    assert.equal(resetBooking.data.status, originalStatus)
    assert.equal(removedService.data, null)
  })

  test('completes a linked booking-to-paid-invoice sales workflow and resets it', async () => {
    const client = createDemoClient({ storage })
    const customer = await client.from('customers').insert({
      name: 'Fictional Workflow Customer',
      phone: '519-555-0188',
      email: 'workflow@example.invalid',
    }).select().single()
    assert.equal(customer.error, null)

    const booking = await client.from('bookings').insert({
      customer_id: customer.data.id,
      customer_name: customer.data.name,
      customer_phone: customer.data.phone,
      customer_email: customer.data.email,
      vehicle_year: 2022,
      vehicle_make: 'Toyota',
      vehicle_model: 'Corolla',
      service_description: 'Fictional brake inspection',
      status: 'completed',
    }).select().single()
    assert.equal(booking.error, null)

    const invoiceNumber = await client.rpc('next_invoice_number')
    const invoice = await client.from('invoices').insert({
      invoice_number: invoiceNumber.data,
      booking_id: booking.data.id,
      customer_name: customer.data.name,
      customer_phone: customer.data.phone,
      customer_email: customer.data.email,
      status: 'draft',
      labour_subtotal: 190,
      parts_subtotal: 0,
      subtotal: 190,
      hst_rate: 0.13,
      hst_amount: 24.7,
      total: 214.7,
    }).select().single()
    assert.equal(invoice.error, null)

    const item = await client.from('invoice_line_items').insert({
      invoice_id: invoice.data.id,
      type: 'labour',
      description: 'Brake inspection labour',
      quantity: 2,
      unit_price: 95,
      sort_order: 0,
    }).select().single()
    assert.equal(item.error, null)
    assert.equal(item.data.total, 190)

    // A send/payment action persists status only. Unsaved editor totals must never
    // become the receipt source; receipts use the invoice totals in storage.
    const unsavedEditorTotal = 999.99
    await client.from('invoices').update({ status: 'sent' }).eq('id', invoice.data.id)
    await client.from('invoices').update({ status: 'paid', paid_date: '2026-09-17' }).eq('id', invoice.data.id)

    const reloaded = createDemoClient({ storage })
    const paid = await reloaded.from('invoices').select('*').eq('id', invoice.data.id).single()
    assert.equal(paid.data.status, 'paid')
    assert.equal(paid.data.paid_date, '2026-09-17')
    assert.equal(paid.data.total, 214.7)
    assert.notEqual(paid.data.total, unsavedEditorTotal)

    resetDemoData(storage)
    const removed = await createDemoClient({ storage }).from('invoices').select('*').eq('id', invoice.data.id).maybeSingle()
    assert.equal(removed.data, null)
  })

  test('provides authenticated, side-effect-free auth stubs for the demo portal', async () => {
    const client = createDemoClient({ storage })
    const user = await client.auth.getUser()
    const session = await client.auth.getSession()
    const listener = client.auth.onAuthStateChange(() => {
      assert.fail('demo auth listener should not emit remote events')
    })

    assert.equal(user.error, null)
    assert.equal(user.data.user.id, 'demo-user')
    assert.equal(session.error, null)
    assert.equal(session.data.session.user.id, 'demo-user')
    assert.equal(typeof listener.data.subscription.unsubscribe, 'function')
    assert.doesNotThrow(() => listener.data.subscription.unsubscribe())
    assert.deepEqual(await client.auth.signOut(), { error: null })
  })

  describe('network isolation', () => {
    let originalFetch

    beforeEach(() => {
      originalFetch = globalThis.fetch
      globalThis.fetch = async () => {
        throw new Error('demo adapter attempted a network request')
      }
    })

    afterEach(() => {
      globalThis.fetch = originalFetch
    })

    test('performs reads, writes, RPC calls, and reset entirely in browser storage', async () => {
      const client = createDemoClient({ storage })
      const bookings = await client.from('bookings').select('*').limit(1)
      assert.equal(bookings.error, null)

      const inserted = await client
        .from('services')
        .insert({ name: 'Offline Test', estimated_hours: 0.5 })
        .select()
        .single()
      assert.equal(inserted.error, null)

      const updated = await client.from('services').update({ is_active: false }).eq('id', inserted.data.id)
      assert.equal(updated.error, null)

      const invoiceNumber = await client.rpc('next_invoice_number')
      assert.equal(invoiceNumber.error, null)

      const deleted = await client.from('services').delete().eq('id', inserted.data.id)
      assert.equal(deleted.error, null)

      resetDemoData(storage)
    })
  })
})
