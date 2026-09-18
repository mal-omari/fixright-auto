import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

const STORAGE_KEY = 'fixright_demo_workshop_v1'
const DATA_VERSION = 1

const TABLE_NAMES = [
  'bookings',
  'customers',
  'invoice_line_items',
  'invoices',
  'mechanics',
  'services',
] as const

type DemoTableName = (typeof TABLE_NAMES)[number]
type DemoRow = Record<string, unknown>
type QueryOperation = 'select' | 'insert' | 'update' | 'delete'
type Cardinality = 'many' | 'single' | 'maybeSingle'
type FilterOperator = 'eq' | 'in' | 'gte' | 'lte'

export interface DemoStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

interface DemoState {
  version: number
  nextInvoiceNumber: number
  tables: Record<DemoTableName, DemoRow[]>
}

interface DemoClientOptions {
  storage?: DemoStorage
}

interface QueryResult {
  data: unknown
  error: DemoError | null
  count?: number | null
  status?: number
  statusText?: string
}

interface DemoError {
  message: string
  code: string
  details: string | null
  hint: string | null
}

interface Filter {
  column: string
  operator: FilterOperator
  value: unknown
  negate?: boolean
}

interface OrderRule {
  column: string
  ascending: boolean
  nullsFirst?: boolean
}

interface SelectionField {
  name: string
  relationFields?: SelectionField[]
}

const memoryValues = new Map<string, string>()
const memoryStorage: DemoStorage = {
  getItem: key => memoryValues.get(key) ?? null,
  setItem: (key, value) => memoryValues.set(key, value),
  removeItem: key => memoryValues.delete(key),
}

function resolveStorage(storage?: DemoStorage): DemoStorage {
  if (storage) return storage
  if (typeof window !== 'undefined') return window.localStorage
  return memoryStorage
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function demoError(message: string, code = 'DEMO_ERROR'): DemoError {
  return { message, code, details: null, hint: null }
}

function easternDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function timestamp(date: string, hour: number): string {
  return `${date}T${String(hour).padStart(2, '0')}:00:00.000Z`
}

function createSeedState(): DemoState {
  const today = easternDate()
  const yesterday = addDays(today, -1)
  const fourDaysAgo = addDays(today, -4)
  const tomorrow = addDays(today, 1)
  const twoDaysAway = addDays(today, 2)
  const threeDaysAway = addDays(today, 3)
  const createdWeekAgo = addDays(today, -7)

  const customers: DemoRow[] = [
    { id: 'customer-jamie', name: 'Jamie Carter', phone: '416-555-0112', email: 'jamie@example.invalid', address: '18 Cedar Lane, Toronto, ON', notes: 'Prefers text updates.', is_vip: true, created_at: timestamp(createdWeekAgo, 14), updated_at: timestamp(today, 9) },
    { id: 'customer-priya', name: 'Priya Shah', phone: '647-555-0144', email: 'priya@example.invalid', address: '204 King Street W, Toronto, ON', notes: null, is_vip: false, created_at: timestamp(addDays(today, -20), 15), updated_at: timestamp(today, 10) },
    { id: 'customer-alex', name: 'Alex Nguyen', phone: '905-555-0187', email: 'alex@example.invalid', address: '77 Lakeshore Road, Mississauga, ON', notes: 'Call before replacing additional parts.', is_vip: false, created_at: timestamp(addDays(today, -35), 16), updated_at: timestamp(yesterday, 11) },
    { id: 'customer-morgan', name: 'Morgan Lee', phone: '416-555-0171', email: 'morgan@example.invalid', address: '9 Bathurst Street, Toronto, ON', notes: null, is_vip: true, created_at: timestamp(addDays(today, -50), 12), updated_at: timestamp(fourDaysAgo, 13) },
    { id: 'customer-samir', name: 'Samir Patel', phone: '647-555-0163', email: 'samir@example.invalid', address: '320 Danforth Avenue, Toronto, ON', notes: 'Fleet vehicle.', is_vip: false, created_at: timestamp(addDays(today, -12), 10), updated_at: timestamp(yesterday, 15) },
  ]

  const services: DemoRow[] = [
    { id: 'service-oil', name: 'Oil Change & Inspection', description: 'Oil, filter, and multi-point inspection.', category: 'maintenance', base_price: 89, estimated_hours: 1, is_active: true, show_price_publicly: true, created_at: timestamp(addDays(today, -90), 12) },
    { id: 'service-brakes', name: 'Brake Service', description: 'Brake inspection and repair.', category: 'safety', base_price: 349, estimated_hours: 2.5, is_active: true, show_price_publicly: false, created_at: timestamp(addDays(today, -90), 12) },
    { id: 'service-diagnostic', name: 'Diagnostic Inspection', description: 'Computer scan and technician diagnosis.', category: 'electrical', base_price: 149, estimated_hours: 1.5, is_active: true, show_price_publicly: true, created_at: timestamp(addDays(today, -90), 12) },
    { id: 'service-tires', name: 'Tire Changeover', description: 'Seasonal tire changeover and pressure check.', category: 'maintenance', base_price: 129, estimated_hours: 1, is_active: true, show_price_publicly: true, created_at: timestamp(addDays(today, -90), 12) },
    { id: 'service-ac', name: 'A/C Service', description: 'Air-conditioning performance diagnosis.', category: 'electrical', base_price: 189, estimated_hours: 2, is_active: true, show_price_publicly: false, created_at: timestamp(addDays(today, -80), 12) },
    { id: 'service-alignment', name: 'Wheel Alignment', description: 'Four-wheel alignment and steering inspection.', category: 'safety', base_price: 159, estimated_hours: 1.5, is_active: true, show_price_publicly: true, created_at: timestamp(addDays(today, -70), 12) },
  ]

  const mechanics: DemoRow[] = [
    { id: 'mechanic-elena', name: 'Elena Ruiz', phone: '416-555-0128', email: 'elena@example.invalid', is_active: true, created_at: timestamp(addDays(today, -120), 12) },
    { id: 'mechanic-marcus', name: 'Marcus Chen', phone: '416-555-0136', email: 'marcus@example.invalid', is_active: true, created_at: timestamp(addDays(today, -110), 12) },
    { id: 'mechanic-noah', name: 'Noah Williams', phone: '416-555-0155', email: 'noah@example.invalid', is_active: true, created_at: timestamp(addDays(today, -100), 12) },
  ]

  const bookings: DemoRow[] = [
    { id: 'booking-jamie', customer_id: 'customer-jamie', customer_name: 'Jamie Carter', customer_phone: '416-555-0112', customer_email: 'jamie@example.invalid', vehicle_year: 2020, vehicle_make: 'Toyota', vehicle_model: 'RAV4', vehicle_vin: 'DEMO0000000000001', service_id: 'service-brakes', service_description: 'Brake Service', mechanic_id: 'mechanic-elena', preferred_date: today, preferred_time: '9:00 AM', confirmed_date: today, confirmed_time: '9:00 AM', estimated_hours: 2.5, actual_hours: null, status: 'confirmed', source: 'website', notes: 'Customer reports brake vibration.', created_at: timestamp(yesterday, 14), updated_at: timestamp(today, 8) },
    { id: 'booking-priya', customer_id: 'customer-priya', customer_name: 'Priya Shah', customer_phone: '647-555-0144', customer_email: 'priya@example.invalid', vehicle_year: 2019, vehicle_make: 'Honda', vehicle_model: 'Civic', vehicle_vin: 'DEMO0000000000002', service_id: 'service-diagnostic', service_description: 'Diagnostic Inspection', mechanic_id: 'mechanic-marcus', preferred_date: today, preferred_time: '10:30 AM', confirmed_date: today, confirmed_time: '10:30 AM', estimated_hours: 1.5, actual_hours: null, status: 'in_progress', source: 'phone', notes: 'Check-engine light is intermittent.', created_at: timestamp(yesterday, 16), updated_at: timestamp(today, 10) },
    { id: 'booking-alex', customer_id: 'customer-alex', customer_name: 'Alex Nguyen', customer_phone: '905-555-0187', customer_email: 'alex@example.invalid', vehicle_year: 2022, vehicle_make: 'Subaru', vehicle_model: 'Outback', vehicle_vin: 'DEMO0000000000003', service_id: 'service-tires', service_description: 'Tire Changeover', mechanic_id: null, preferred_date: tomorrow, preferred_time: '1:00 PM', confirmed_date: null, confirmed_time: null, estimated_hours: 1, actual_hours: null, status: 'pending', source: 'website', notes: null, created_at: timestamp(today, 9), updated_at: timestamp(today, 9) },
    { id: 'booking-morgan', customer_id: 'customer-morgan', customer_name: 'Morgan Lee', customer_phone: '416-555-0171', customer_email: 'morgan@example.invalid', vehicle_year: 2017, vehicle_make: 'Ford', vehicle_model: 'Escape', vehicle_vin: 'DEMO0000000000004', service_id: 'service-oil', service_description: 'Oil Change & Inspection', mechanic_id: 'mechanic-noah', preferred_date: yesterday, preferred_time: '8:30 AM', confirmed_date: yesterday, confirmed_time: '8:30 AM', estimated_hours: 1, actual_hours: 0.9, status: 'completed', source: 'phone', notes: null, created_at: timestamp(addDays(today, -3), 12), updated_at: timestamp(yesterday, 11) },
    { id: 'booking-samir', customer_id: 'customer-samir', customer_name: 'Samir Patel', customer_phone: '647-555-0163', customer_email: 'samir@example.invalid', vehicle_year: 2021, vehicle_make: 'Chevrolet', vehicle_model: 'Express', vehicle_vin: 'DEMO0000000000005', service_id: 'service-alignment', service_description: 'Wheel Alignment', mechanic_id: 'mechanic-marcus', preferred_date: fourDaysAgo, preferred_time: '2:00 PM', confirmed_date: fourDaysAgo, confirmed_time: '2:00 PM', estimated_hours: 1.5, actual_hours: 1.4, status: 'completed', source: 'phone', notes: 'Fleet unit 12.', created_at: timestamp(addDays(today, -6), 10), updated_at: timestamp(fourDaysAgo, 16) },
    { id: 'booking-cancelled', customer_id: 'customer-alex', customer_name: 'Alex Nguyen', customer_phone: '905-555-0187', customer_email: 'alex@example.invalid', vehicle_year: 2016, vehicle_make: 'Mazda', vehicle_model: '3', vehicle_vin: 'DEMO0000000000006', service_id: 'service-ac', service_description: 'A/C Service', mechanic_id: null, preferred_date: twoDaysAway, preferred_time: '11:00 AM', confirmed_date: null, confirmed_time: null, estimated_hours: 2, actual_hours: null, status: 'cancelled', source: 'website', notes: 'Customer rescheduled.', created_at: timestamp(addDays(today, -2), 13), updated_at: timestamp(yesterday, 10) },
    { id: 'booking-jamie-next', customer_id: 'customer-jamie', customer_name: 'Jamie Carter', customer_phone: '416-555-0112', customer_email: 'jamie@example.invalid', vehicle_year: 2020, vehicle_make: 'Toyota', vehicle_model: 'RAV4', vehicle_vin: 'DEMO0000000000001', service_id: 'service-oil', service_description: 'Oil Change & Inspection', mechanic_id: 'mechanic-elena', preferred_date: tomorrow, preferred_time: '3:00 PM', confirmed_date: tomorrow, confirmed_time: '3:00 PM', estimated_hours: 1, actual_hours: null, status: 'confirmed', source: 'phone', notes: null, created_at: timestamp(today, 11), updated_at: timestamp(today, 11) },
    { id: 'booking-priya-next', customer_id: 'customer-priya', customer_name: 'Priya Shah', customer_phone: '647-555-0144', customer_email: 'priya@example.invalid', vehicle_year: 2019, vehicle_make: 'Honda', vehicle_model: 'Civic', vehicle_vin: 'DEMO0000000000002', service_id: 'service-brakes', service_description: 'Brake Service', mechanic_id: null, preferred_date: threeDaysAway, preferred_time: '8:00 AM', confirmed_date: null, confirmed_time: null, estimated_hours: 2.5, actual_hours: null, status: 'pending', source: 'website', notes: 'Front brakes squeal when cold.', created_at: timestamp(today, 12), updated_at: timestamp(today, 12) },
  ]

  const invoices: DemoRow[] = [
    { id: 'invoice-1045', invoice_number: 'DEMO-1045', booking_id: 'booking-morgan', customer_name: 'Morgan Lee', customer_phone: '416-555-0171', customer_email: 'morgan@example.invalid', vehicle_year: 2017, vehicle_make: 'Ford', vehicle_model: 'Escape', vehicle_mileage: '112,450 km', status: 'paid', labour_subtotal: 95, parts_subtotal: 69.5, subtotal: 164.5, hst_rate: 0.13, hst_amount: 21.385, total: 185.885, due_date: addDays(yesterday, 30), paid_date: yesterday, notes: 'Thank you for your business.', created_at: timestamp(yesterday, 10), updated_at: timestamp(yesterday, 12) },
    { id: 'invoice-1046', invoice_number: 'DEMO-1046', booking_id: 'booking-samir', customer_name: 'Samir Patel', customer_phone: '647-555-0163', customer_email: 'samir@example.invalid', vehicle_year: 2021, vehicle_make: 'Chevrolet', vehicle_model: 'Express', vehicle_mileage: '78,210 km', status: 'sent', labour_subtotal: 142.5, parts_subtotal: 0, subtotal: 142.5, hst_rate: 0.13, hst_amount: 18.525, total: 161.025, due_date: addDays(today, 14), paid_date: null, notes: null, created_at: timestamp(fourDaysAgo, 16), updated_at: timestamp(fourDaysAgo, 16) },
    { id: 'invoice-1047', invoice_number: 'DEMO-1047', booking_id: 'booking-priya', customer_name: 'Priya Shah', customer_phone: '647-555-0144', customer_email: 'priya@example.invalid', vehicle_year: 2019, vehicle_make: 'Honda', vehicle_model: 'Civic', vehicle_mileage: '93,820 km', status: 'draft', labour_subtotal: 142.5, parts_subtotal: 0, subtotal: 142.5, hst_rate: 0.13, hst_amount: 18.525, total: 161.025, due_date: addDays(today, 30), paid_date: null, notes: 'Diagnosis in progress.', created_at: timestamp(today, 10), updated_at: timestamp(today, 10) },
    { id: 'invoice-1048', invoice_number: 'DEMO-1048', booking_id: 'booking-jamie', customer_name: 'Jamie Carter', customer_phone: '416-555-0112', customer_email: 'jamie@example.invalid', vehicle_year: 2020, vehicle_make: 'Toyota', vehicle_model: 'RAV4', vehicle_mileage: '64,100 km', status: 'overdue', labour_subtotal: 237.5, parts_subtotal: 319, subtotal: 556.5, hst_rate: 0.13, hst_amount: 72.345, total: 628.845, due_date: addDays(today, -2), paid_date: null, notes: 'Fictional overdue example for the demo.', created_at: timestamp(addDays(today, -32), 15), updated_at: timestamp(addDays(today, -2), 9) },
  ]

  const invoiceLineItems: DemoRow[] = [
    { id: 'line-1045-labour', invoice_id: 'invoice-1045', type: 'labour', description: 'Oil change and inspection labour', quantity: 1, unit_price: 95, total: 95, sort_order: 0, created_at: timestamp(yesterday, 10) },
    { id: 'line-1045-parts', invoice_id: 'invoice-1045', type: 'parts', description: 'Synthetic oil and filter', quantity: 1, unit_price: 69.5, total: 69.5, sort_order: 1, created_at: timestamp(yesterday, 10) },
    { id: 'line-1046-labour', invoice_id: 'invoice-1046', type: 'labour', description: 'Four-wheel alignment', quantity: 1.5, unit_price: 95, total: 142.5, sort_order: 0, created_at: timestamp(fourDaysAgo, 16) },
    { id: 'line-1047-labour', invoice_id: 'invoice-1047', type: 'labour', description: 'Diagnostic inspection', quantity: 1.5, unit_price: 95, total: 142.5, sort_order: 0, created_at: timestamp(today, 10) },
    { id: 'line-1048-labour', invoice_id: 'invoice-1048', type: 'labour', description: 'Brake service labour', quantity: 2.5, unit_price: 95, total: 237.5, sort_order: 0, created_at: timestamp(addDays(today, -32), 15) },
    { id: 'line-1048-parts', invoice_id: 'invoice-1048', type: 'parts', description: 'Front brake pad set', quantity: 1, unit_price: 189, total: 189, sort_order: 1, created_at: timestamp(addDays(today, -32), 15) },
    { id: 'line-1048-rotors', invoice_id: 'invoice-1048', type: 'parts', description: 'Front brake rotors', quantity: 2, unit_price: 65, total: 130, sort_order: 2, created_at: timestamp(addDays(today, -32), 15) },
  ]

  return {
    version: DATA_VERSION,
    nextInvoiceNumber: 1049,
    tables: {
      bookings,
      customers,
      invoice_line_items: invoiceLineItems,
      invoices,
      mechanics,
      services,
    },
  }
}

function isDemoState(value: unknown): value is DemoState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<DemoState>
  if (candidate.version !== DATA_VERSION || !candidate.tables || typeof candidate.nextInvoiceNumber !== 'number') return false
  return TABLE_NAMES.every(table => Array.isArray(candidate.tables?.[table]))
}

function readState(storage: DemoStorage): DemoState {
  const saved = storage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed: unknown = JSON.parse(saved)
      if (isDemoState(parsed)) return parsed
    } catch {
      // A corrupt demo snapshot is safely replaced by the fictional seed.
    }
  }
  const seed = createSeedState()
  storage.setItem(STORAGE_KEY, JSON.stringify(seed))
  return seed
}

function createId(table: DemoTableName): string {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${table.replaceAll('_', '-')}-${suffix}`
}

function defaultRow(table: DemoTableName, input: DemoRow): DemoRow {
  const now = `${easternDate()}T12:00:00.000Z`
  const base: DemoRow = { ...input, id: input.id ?? createId(table) }

  switch (table) {
    case 'customers':
      return { address: null, email: null, notes: null, is_vip: false, created_at: now, updated_at: now, ...base }
    case 'bookings':
      return { actual_hours: null, confirmed_date: null, confirmed_time: null, created_at: now, customer_email: null, customer_id: null, estimated_hours: null, mechanic_id: null, notes: null, preferred_date: null, preferred_time: null, service_description: null, service_id: null, source: 'manual', status: 'pending', updated_at: now, vehicle_make: null, vehicle_model: null, vehicle_vin: null, vehicle_year: null, ...base }
    case 'services':
      return { base_price: null, category: null, created_at: now, description: null, is_active: true, show_price_publicly: false, ...base }
    case 'mechanics':
      return { created_at: now, email: null, is_active: true, phone: null, ...base }
    case 'invoices':
      return { booking_id: null, created_at: now, customer_email: null, customer_name: null, customer_phone: null, due_date: null, hst_amount: 0, hst_rate: 0.13, labour_subtotal: 0, notes: null, paid_date: null, parts_subtotal: 0, status: 'draft', subtotal: 0, total: 0, updated_at: now, vehicle_make: null, vehicle_mileage: null, vehicle_model: null, vehicle_year: null, ...base }
    case 'invoice_line_items': {
      const row: DemoRow = { created_at: now, sort_order: 0, ...base }
      const quantity = Number(row.quantity ?? 0)
      const unitPrice = Number(row.unit_price ?? 0)
      return { ...row, total: quantity * unitPrice }
    }
  }
}

function parseSelection(selection: string): SelectionField[] | null {
  if (!selection.trim() || selection.trim() === '*') return null
  const fields: string[] = []
  let depth = 0
  let current = ''
  for (const character of selection) {
    if (character === '(') depth += 1
    if (character === ')') depth -= 1
    if (character === ',' && depth === 0) {
      if (current.trim()) fields.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }
  if (current.trim()) fields.push(current.trim())

  return fields.map(field => {
    const relation = field.match(/^([a-zA-Z0-9_]+)\s*\(([\s\S]*)\)$/)
    if (!relation) return { name: field.trim() }
    return { name: relation[1], relationFields: parseSelection(relation[2]) ?? [] }
  })
}

function projectRelation(state: DemoState, table: DemoTableName, row: DemoRow, field: SelectionField): unknown {
  if (table !== 'bookings') return null
  const relationship = field.name === 'services'
    ? { foreignKey: 'service_id', table: 'services' as const }
    : field.name === 'mechanics'
      ? { foreignKey: 'mechanic_id', table: 'mechanics' as const }
      : null
  if (!relationship) return null
  const foreignId = row[relationship.foreignKey]
  if (foreignId == null) return null
  const related = state.tables[relationship.table].find(candidate => candidate.id === foreignId)
  if (!related) return null
  return projectRow(state, relationship.table, related, field.relationFields ?? null)
}

function projectRow(state: DemoState, table: DemoTableName, row: DemoRow, fields: SelectionField[] | null): DemoRow {
  if (!fields) return clone(row)
  const projected: DemoRow = {}
  for (const field of fields) {
    projected[field.name] = field.relationFields
      ? projectRelation(state, table, row, field)
      : clone(row[field.name])
  }
  return projected
}

function compareValue(actual: unknown, expected: unknown, operator: FilterOperator): boolean {
  if (operator === 'in') return Array.isArray(expected) && expected.some(value => compareValue(actual, value, 'eq'))
  if (operator === 'eq') {
    if (expected === 'null') return actual == null
    if (typeof actual === 'boolean' && typeof expected === 'string') return actual === (expected === 'true')
    if (typeof actual === 'number' && typeof expected === 'string' && expected.trim() !== '') return actual === Number(expected)
    return actual === expected
  }
  if (actual == null || expected == null) return false
  if (operator === 'gte') return actual >= expected
  return actual <= expected
}

function matchesFilter(row: DemoRow, filter: Filter): boolean {
  const matches = compareValue(row[filter.column], filter.value, filter.operator)
  return filter.negate ? !matches : matches
}

function parseOrGroup(expression: string): Filter[] {
  return expression.split(',').flatMap(condition => {
    const match = condition.trim().match(/^([^.]+)\.(eq|gte|lte)\.([\s\S]*)$/)
    if (!match) return []
    return [{ column: match[1], operator: match[2] as FilterOperator, value: match[3] }]
  })
}

function compareRows(left: DemoRow, right: DemoRow, rule: OrderRule): number {
  const a = left[rule.column]
  const b = right[rule.column]
  if (a == null && b == null) return 0
  if (a == null) return rule.nullsFirst ? -1 : 1
  if (b == null) return rule.nullsFirst ? 1 : -1
  const direction = rule.ascending ? 1 : -1
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * direction
  return String(a).localeCompare(String(b)) * direction
}

class DemoQueryBuilder implements PromiseLike<QueryResult> {
  private readonly client: DemoClient
  private readonly table: DemoTableName | string
  private operation: QueryOperation = 'select'
  private selection: SelectionField[] | null = null
  private payload: DemoRow[] = []
  private filters: Filter[] = []
  private orGroups: Filter[][] = []
  private orderRules: OrderRule[] = []
  private maximumRows: number | null = null
  private cardinality: Cardinality = 'many'
  private returnRepresentation = false
  private countMode: 'exact' | null = null
  private head = false
  private execution: Promise<QueryResult> | null = null

  constructor(client: DemoClient, table: DemoTableName | string) {
    this.client = client
    this.table = table
  }

  select(columns = '*', options?: { count?: 'exact'; head?: boolean }): this {
    this.selection = parseSelection(columns)
    this.countMode = options?.count ?? null
    this.head = options?.head ?? false
    if (this.operation !== 'select') this.returnRepresentation = true
    return this
  }

  insert(values: DemoRow | DemoRow[]): this {
    this.operation = 'insert'
    this.payload = (Array.isArray(values) ? values : [values]).map(value => clone(value))
    return this
  }

  update(values: DemoRow): this {
    this.operation = 'update'
    this.payload = [clone(values)]
    return this
  }

  delete(): this {
    this.operation = 'delete'
    return this
  }

  eq(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'eq', value })
    return this
  }

  in(column: string, values: unknown[]): this {
    this.filters.push({ column, operator: 'in', value: values })
    return this
  }

  gte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'gte', value })
    return this
  }

  lte(column: string, value: unknown): this {
    this.filters.push({ column, operator: 'lte', value })
    return this
  }

  not(column: string, operator: 'eq' | 'gte' | 'lte', value: unknown): this {
    this.filters.push({ column, operator, value, negate: true })
    return this
  }

  or(expression: string): this {
    const group = parseOrGroup(expression)
    if (group.length > 0) this.orGroups.push(group)
    return this
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this.orderRules.push({
      column,
      ascending: options?.ascending ?? true,
      nullsFirst: options?.nullsFirst,
    })
    return this
  }

  limit(count: number): this {
    this.maximumRows = Math.max(0, count)
    return this
  }

  single(): Promise<QueryResult> {
    this.cardinality = 'single'
    return this.execute()
  }

  maybeSingle(): Promise<QueryResult> {
    this.cardinality = 'maybeSingle'
    return this.execute()
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private isMatch(row: DemoRow): boolean {
    return this.filters.every(filter => matchesFilter(row, filter))
      && this.orGroups.every(group => group.some(filter => matchesFilter(row, filter)))
  }

  private formatRows(rows: DemoRow[], count?: number): QueryResult {
    const selected = rows.map(row => projectRow(this.client.state, this.table as DemoTableName, row, this.selection))
    const resultCount = this.countMode === 'exact' ? count ?? selected.length : null
    if (this.head) return { data: null, error: null, count: resultCount, status: 200, statusText: 'OK' }
    if (this.cardinality === 'single') {
      if (selected.length !== 1) return { data: null, error: demoError(`Expected one row, received ${selected.length}`, 'PGRST116'), count: resultCount, status: 406, statusText: 'Not Acceptable' }
      return { data: selected[0], error: null, count: resultCount, status: 200, statusText: 'OK' }
    }
    if (this.cardinality === 'maybeSingle') {
      if (selected.length === 0) return { data: null, error: null, count: resultCount, status: 200, statusText: 'OK' }
      if (selected.length > 1) return { data: null, error: demoError(`Expected zero or one row, received ${selected.length}`, 'PGRST116'), count: resultCount, status: 406, statusText: 'Not Acceptable' }
      return { data: selected[0], error: null, count: resultCount, status: 200, statusText: 'OK' }
    }
    return { data: selected, error: null, count: resultCount, status: 200, statusText: 'OK' }
  }

  private async run(): Promise<QueryResult> {
    if (!TABLE_NAMES.includes(this.table as DemoTableName)) {
      return { data: null, error: demoError(`Unknown demo table: ${this.table}`, '42P01'), count: null, status: 404, statusText: 'Not Found' }
    }
    const table = this.table as DemoTableName
    const source = this.client.state.tables[table]

    if (this.operation === 'select') {
      let matches = source.filter(row => this.isMatch(row))
      const count = matches.length
      if (this.orderRules.length > 0) {
        matches = [...matches].sort((left, right) => {
          for (const rule of this.orderRules) {
            const compared = compareRows(left, right, rule)
            if (compared !== 0) return compared
          }
          return 0
        })
      }
      if (this.maximumRows != null) matches = matches.slice(0, this.maximumRows)
      return this.formatRows(matches, count)
    }

    if (this.operation === 'insert') {
      const inserted = this.payload.map(value => defaultRow(table, value))
      source.push(...inserted)
      this.client.persist()
      return this.returnRepresentation
        ? this.formatRows(inserted, inserted.length)
        : { data: null, error: null, count: null, status: 201, statusText: 'Created' }
    }

    if (this.operation === 'update') {
      const updated: DemoRow[] = []
      for (let index = 0; index < source.length; index += 1) {
        if (!this.isMatch(source[index])) continue
        const next = { ...source[index], ...this.payload[0] }
        if (table === 'customers' || table === 'bookings' || table === 'invoices') {
          next.updated_at = this.payload[0].updated_at ?? new Date().toISOString()
        }
        if (table === 'invoice_line_items') {
          next.total = Number(next.quantity ?? 0) * Number(next.unit_price ?? 0)
        }
        source[index] = next
        updated.push(next)
      }
      this.client.persist()
      return this.returnRepresentation
        ? this.formatRows(updated, updated.length)
        : { data: null, error: null, count: null, status: 204, statusText: 'No Content' }
    }

    const removed = source.filter(row => this.isMatch(row))
    this.client.state.tables[table] = source.filter(row => !this.isMatch(row))
    this.client.persist()
    return this.returnRepresentation
      ? this.formatRows(removed, removed.length)
      : { data: null, error: null, count: null, status: 204, statusText: 'No Content' }
  }

  private execute(): Promise<QueryResult> {
    this.execution ??= this.run().catch(reason => ({
      data: null,
      error: demoError(reason instanceof Error ? reason.message : 'Unexpected demo adapter error'),
      count: null,
      status: 500,
      statusText: 'Internal Server Error',
    }))
    return this.execution
  }
}

class DemoClient {
  readonly state: DemoState
  private readonly storage: DemoStorage
  readonly auth = {
    getUser: async () => ({ data: { user: demoUser() }, error: null }),
    getSession: async () => ({ data: { session: demoSession() }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }),
    signInWithPassword: async () => ({ data: { user: demoUser(), session: demoSession() }, error: null }),
    signOut: async () => ({ error: null }),
  }

  constructor(storage: DemoStorage) {
    this.storage = storage
    this.state = readState(storage)
  }

  from(table: DemoTableName | string): DemoQueryBuilder {
    return new DemoQueryBuilder(this, table)
  }

  async rpc(functionName: string): Promise<QueryResult> {
    if (functionName !== 'next_invoice_number') {
      return { data: null, error: demoError(`Unsupported demo RPC: ${functionName}`, '42883'), count: null, status: 404, statusText: 'Not Found' }
    }
    const invoiceNumber = `DEMO-${String(this.state.nextInvoiceNumber).padStart(4, '0')}`
    this.state.nextInvoiceNumber += 1
    this.persist()
    return { data: invoiceNumber, error: null, count: null, status: 200, statusText: 'OK' }
  }

  persist(): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state))
  }
}

function demoUser() {
  return {
    id: 'demo-user',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@example.invalid',
    app_metadata: { provider: 'demo', providers: ['demo'] },
    user_metadata: { name: 'Demo Administrator' },
    created_at: '2026-01-01T00:00:00.000Z',
  }
}

function demoSession() {
  return {
    access_token: 'demo-local-session',
    token_type: 'bearer',
    expires_in: 31_536_000,
    expires_at: 4_102_444_800,
    refresh_token: 'demo-local-refresh',
    user: demoUser(),
  }
}

export function createDemoClient(options: DemoClientOptions = {}): SupabaseClient<Database> {
  const storage = resolveStorage(options.storage)
  return new DemoClient(storage) as unknown as SupabaseClient<Database>
}

export function resetDemoData(storage?: DemoStorage): void {
  const target = resolveStorage(storage)
  target.removeItem(STORAGE_KEY)
  target.setItem(STORAGE_KEY, JSON.stringify(createSeedState()))
}
