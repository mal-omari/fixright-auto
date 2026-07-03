'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ArrowLeft, Star, Plus, Pencil, Check, X, Car, Wrench, Calendar, DollarSign } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Customer = Tables<'customers'>
type Booking = Tables<'bookings'>
type Invoice = Tables<'invoices'>

interface VehicleGroup {
  key: string
  year: number | null
  make: string | null
  model: string | null
  visits: number
  lastService: string | null
}

const iStyle: React.CSSProperties = {
  width: '100%', background: '#141210', border: '1px solid #2A2420',
  borderRadius: 8, color: '#F0EDE8', padding: '10px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
}
const lStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 600,
  letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6,
  textTransform: 'uppercase',
}
const card: React.CSSProperties = {
  background: '#1E1C18', border: '1px solid #2A2420',
  borderRadius: 12, padding: 24, marginBottom: 16,
}
const secTitle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
  color: '#6B6560', textTransform: 'uppercase', marginBottom: 20,
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTimestamp(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const [notesDraft, setNotesDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: c } = await supabase.from('customers').select('*').eq('id', id).single()
      if (!c) { setLoading(false); return }
      setCustomer(c)
      setEditName(c.name)
      setEditEmail(c.email ?? '')
      setEditAddress(c.address ?? '')
      setEditNotes(c.notes ?? '')
      setNotesDraft(c.notes ?? '')

      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', id)
        .order('preferred_date', { ascending: false })
      setBookings(b ?? [])

      const bookingIds = (b ?? []).map(x => x.id)
      if (bookingIds.length) {
        const { data: i } = await supabase.from('invoices').select('*').in('booking_id', bookingIds)
        setInvoices(i ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  const invoiceByBooking = useMemo(() => {
    const map = new Map<string, Invoice>()
    for (const inv of invoices) {
      if (inv.booking_id) map.set(inv.booking_id, inv)
    }
    return map
  }, [invoices])

  const totalSpent = useMemo(
    () => invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    [invoices]
  )

  const lastVisit = useMemo(() => {
    const dates = bookings.map(b => b.preferred_date).filter((d): d is string => !!d).sort()
    return dates.length ? dates[dates.length - 1] : null
  }, [bookings])

  const vehicleGroups = useMemo<VehicleGroup[]>(() => {
    const map = new Map<string, VehicleGroup>()
    for (const b of bookings) {
      const key = `${b.vehicle_year ?? ''}|${b.vehicle_make ?? ''}|${b.vehicle_model ?? ''}`
      if (!b.vehicle_make && !b.vehicle_model && !b.vehicle_year) continue
      const existing = map.get(key)
      if (existing) {
        existing.visits += 1
        if (b.preferred_date && (!existing.lastService || b.preferred_date > existing.lastService)) {
          existing.lastService = b.preferred_date
        }
      } else {
        map.set(key, {
          key, year: b.vehicle_year, make: b.vehicle_make, model: b.vehicle_model,
          visits: 1, lastService: b.preferred_date,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.lastService ?? '').localeCompare(a.lastService ?? ''))
  }, [bookings])

  async function saveEdit() {
    if (!customer) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('customers').update({
      name: editName.trim(),
      email: editEmail.trim() || null,
      address: editAddress.trim() || null,
      notes: editNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', customer.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setCustomer(prev => prev ? { ...prev, name: editName.trim(), email: editEmail.trim() || null, address: editAddress.trim() || null, notes: editNotes.trim() || null } : prev)
    setNotesDraft(editNotes.trim())
    setEditing(false)
    toast.success('Customer updated')
  }

  async function toggleVip() {
    if (!customer) return
    const next = !customer.is_vip
    const supabase = createClient()
    await supabase.from('customers').update({ is_vip: next, updated_at: new Date().toISOString() }).eq('id', customer.id)
    setCustomer(prev => prev ? { ...prev, is_vip: next } : prev)
  }

  async function saveNotes() {
    if (!customer) return
    setSavingNotes(true)
    const supabase = createClient()
    const { error } = await supabase.from('customers').update({
      notes: notesDraft.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', customer.id)
    setSavingNotes(false)
    if (error) { toast.error(error.message); return }
    setCustomer(prev => prev ? { ...prev, notes: notesDraft.trim() || null } : prev)
    setEditNotes(notesDraft.trim())
    toast.success('Notes saved')
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#4A4540', fontSize: '13px' }}>Loading…</div>
  }

  if (!customer) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ color: '#6B6560', fontSize: '13px' }}>Customer not found.</div>
        <Link href="/workshop-portal/customers" style={{ color: '#FF9500', fontSize: '13px' }}>← Back to Customers</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <Link
        href="/workshop-portal/customers"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6560', textDecoration: 'none', fontSize: '12px', marginBottom: 20 }}
      >
        <ArrowLeft size={13} /> Back to Customers
      </Link>

      {/* Header card */}
      <div style={card}>
        {editing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lStyle}>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Email</label>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={iStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lStyle}>Address</label>
              <input value={editAddress} onChange={e => setEditAddress(e.target.value)} style={iStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lStyle}>Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} style={{ ...iStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={saveEdit}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FF9500', color: '#0D0B08', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Check size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setEditName(customer.name)
                  setEditEmail(customer.email ?? '')
                  setEditAddress(customer.address ?? '')
                  setEditNotes(customer.notes ?? '')
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: '#9A8E82', borderRadius: 8, padding: '9px 16px', fontSize: '12px', cursor: 'pointer' }}
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '26px', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
                  {customer.name}
                </h1>
                {customer.is_vip && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,149,0,0.15)', color: '#FF9500',
                    padding: '3px 10px', borderRadius: 20, fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    <Star size={11} fill="#FF9500" /> VIP Customer
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#9A8E82' }}>{customer.phone}{customer.email ? ` · ${customer.email}` : ''}</div>
              {customer.address && <div style={{ fontSize: '13px', color: '#6B6560', marginTop: 4 }}>{customer.address}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={toggleVip}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: customer.is_vip ? '#FF9500' : '#9A8E82', borderRadius: 8, padding: '9px 14px', fontSize: '12px', cursor: 'pointer' }}
              >
                <Star size={13} fill={customer.is_vip ? '#FF9500' : 'none'} /> {customer.is_vip ? 'Remove VIP' : 'Mark VIP'}
              </button>
              <button
                onClick={() => setEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: '#9A8E82', borderRadius: 8, padding: '9px 14px', fontSize: '12px', cursor: 'pointer' }}
              >
                <Pencil size={13} /> Edit
              </button>
              <Link
                href={`/workshop-portal/new-booking?phone=${encodeURIComponent(customer.phone)}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FF9500', color: '#0D0B08', textDecoration: 'none', borderRadius: 8, padding: '9px 16px', fontSize: '12px', fontWeight: 700 }}
              >
                <Plus size={13} /> New Booking
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        {[
          { label: 'Total Visits', value: bookings.length.toString(), icon: Calendar, color: '#4A9EFF' },
          { label: 'Total Spent', value: fmtAmount(totalSpent), icon: DollarSign, color: '#28C850' },
          { label: 'Last Visit', value: fmtDate(lastVisit), icon: Wrench, color: '#FF9500' },
          { label: 'Member Since', value: fmtTimestamp(customer.created_at), icon: Star, color: '#9A8E82' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B6560', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#F0EDE8', marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Service history */}
      <div style={card}>
        <div style={secTitle}>Service History</div>
        {bookings.length === 0 ? (
          <div style={{ color: '#4A4540', fontSize: '13px', padding: '12px 0' }}>No bookings yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Date', 'Service', 'Vehicle', 'Status', 'Invoice', 'Amount'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: '#6B6560', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const inv = invoiceByBooking.get(b.id)
                  return (
                    <tr key={b.id} style={{ borderTop: '1px solid #2A2420' }}>
                      <td style={{ padding: '10px 12px', color: '#9A8E82', whiteSpace: 'nowrap' }}>{fmtDate(b.preferred_date)}</td>
                      <td style={{ padding: '10px 12px', color: '#F0EDE8' }}>{b.service_description || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#9A8E82', whiteSpace: 'nowrap' }}>
                        {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={b.status} /></td>
                      <td style={{ padding: '10px 12px' }}>
                        {inv ? (
                          <Link href={`/workshop-portal/invoices/${inv.id}`} style={{ color: '#FF9500', fontSize: '12px', textDecoration: 'none' }}>
                            View Invoice
                          </Link>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#F0EDE8', fontWeight: 600 }}>
                        {inv && inv.status === 'paid' ? fmtAmount(inv.total) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vehicle history */}
      <div style={card}>
        <div style={secTitle}>Vehicle History</div>
        {vehicleGroups.length === 0 ? (
          <div style={{ color: '#4A4540', fontSize: '13px', padding: '12px 0' }}>No vehicles on file</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vehicleGroups.map(v => (
              <div key={v.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#141210', borderRadius: 8, border: '1px solid #2A2420' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Car size={16} style={{ color: '#6B6560' }} />
                  <span style={{ color: '#F0EDE8', fontSize: '13px', fontWeight: 600 }}>
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unknown vehicle'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#9A8E82' }}>
                  <span>{v.visits} visit{v.visits === 1 ? '' : 's'}</span>
                  <span>Last service: {fmtDate(v.lastService)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Internal notes */}
      <div style={card}>
        <div style={secTitle}>Internal Notes</div>
        <textarea
          value={notesDraft}
          onChange={e => setNotesDraft(e.target.value)}
          rows={4}
          placeholder="Notes about this customer, visible to shop staff only…"
          style={{ ...iStyle, resize: 'vertical', marginBottom: 12 }}
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          style={{ background: '#2A2420', color: '#F0EDE8', border: '1px solid #3A3430', borderRadius: 8, padding: '9px 18px', fontSize: '12px', fontWeight: 600, cursor: savingNotes ? 'not-allowed' : 'pointer' }}
        >
          {savingNotes ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}
