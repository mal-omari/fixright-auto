'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { vehicleMakes, vehicleModels, vehicleYears } from '@/lib/vehicleData'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Mechanic = Tables<'mechanics'>
type Service = Tables<'services'>

const TIMES = ['morning', 'afternoon', 'flexible']
const SOURCES = ['phone', 'walkin', 'web', 'referral', 'google', 'other']

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

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
    </div>
  )
}

export default function NewBookingPage() {
  const router = useRouter()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    vehicle_year: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_vin: '',
    service_id: '',
    service_description: '',
    preferred_date: '',
    preferred_time: 'morning',
    source: 'phone',
    mechanic_id: '',
    estimated_hours: '',
    notes: '',
    status: 'confirmed',
  })

  const [serviceAutoFilled, setServiceAutoFilled] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('mechanics').select('*').eq('is_active', true).order('name'),
      supabase.from('services').select('*').eq('is_active', true).order('name'),
    ]).then(([{ data: m }, { data: s }]) => {
      setMechanics(m ?? [])
      setServices(s ?? [])
    })
  }, [])

  function set(k: keyof typeof form, v: string) {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'vehicle_make') next.vehicle_model = ''
      return next
    })
  }

  function handleServiceChange(serviceId: string) {
    const svc = services.find(s => s.id === serviceId)
    setForm(prev => ({
      ...prev,
      service_id: serviceId,
      service_description: svc?.name ?? prev.service_description,
      estimated_hours: svc ? svc.estimated_hours.toString() : prev.estimated_hours,
    }))
    setServiceAutoFilled(!!svc)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError('Customer name and phone are required')
      return
    }
    setSubmitting(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.from('bookings').insert({
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_email: form.customer_email.trim() || null,
      vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year) : null,
      vehicle_make: form.vehicle_make || null,
      vehicle_model: form.vehicle_model || null,
      vehicle_vin: form.vehicle_vin.trim() || null,
      service_id: form.service_id || null,
      service_description: form.service_description || null,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      source: form.source || null,
      mechanic_id: form.mechanic_id || null,
      estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      notes: form.notes.trim() || null,
      status: form.status,
    }).select().single()

    setSubmitting(false)
    if (err) { setError(err.message); return }
    router.push(`/workshop-portal/bookings/${data.id}`)
  }

  const sel: React.CSSProperties = { ...iStyle, paddingRight: 28, cursor: 'pointer', appearance: 'none' }
  const availModels = form.vehicle_make ? (vehicleModels[form.vehicle_make] ?? []) : []

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Link
        href="/workshop-portal/bookings"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6560', textDecoration: 'none', fontSize: '12px', marginBottom: 20 }}
      >
        <ArrowLeft size={13} /> Back to Bookings
      </Link>
      <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EDE8', marginBottom: 24 }}>New Booking</h1>

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Left column */}
          <div>
            {/* Customer */}
            <div style={card}>
              <div style={secTitle}>Customer Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Full Name *</label>
                  <input value={form.customer_name} onChange={e => set('customer_name', e.target.value)} style={iStyle} placeholder="John Smith" required />
                </div>
                <div>
                  <label style={lStyle}>Phone *</label>
                  <input value={form.customer_phone} onChange={e => set('customer_phone', e.target.value)} style={iStyle} placeholder="519-555-0100" required />
                </div>
              </div>
              <div>
                <label style={lStyle}>Email</label>
                <input type="email" value={form.customer_email} onChange={e => set('customer_email', e.target.value)} style={iStyle} placeholder="john@example.com" />
              </div>
            </div>

            {/* Vehicle */}
            <div style={card}>
              <div style={secTitle}>Vehicle Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Year</label>
                  <SelectWrap>
                    <select value={form.vehicle_year} onChange={e => set('vehicle_year', e.target.value)} style={sel}>
                      <option value="">Year</option>
                      {vehicleYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label style={lStyle}>Make</label>
                  <SelectWrap>
                    <select value={form.vehicle_make} onChange={e => set('vehicle_make', e.target.value)} style={sel}>
                      <option value="">Make</option>
                      {vehicleMakes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label style={lStyle}>Model</label>
                  <SelectWrap>
                    <select value={form.vehicle_model} onChange={e => set('vehicle_model', e.target.value)} style={sel} disabled={!form.vehicle_make}>
                      <option value="">{form.vehicle_make ? 'Model' : 'Pick make first'}</option>
                      {availModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </SelectWrap>
                </div>
              </div>
              <div>
                <label style={lStyle}>VIN (optional)</label>
                <input value={form.vehicle_vin} onChange={e => set('vehicle_vin', e.target.value)} style={iStyle} placeholder="1HGBH41JXMN109186" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Service */}
            <div style={card}>
              <div style={secTitle}>Service</div>
              <div style={{ marginBottom: 16 }}>
                <label style={lStyle}>Select Service</label>
                <SelectWrap>
                  <select
                    value={form.service_id}
                    onChange={e => handleServiceChange(e.target.value)}
                    style={sel}
                  >
                    <option value="">— Select a service —</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    <option value="__other">Other / Custom</option>
                  </select>
                </SelectWrap>
              </div>
              {(form.service_id === '__other' || !form.service_id) && (
                <div style={{ marginBottom: 16 }}>
                  <label style={lStyle}>Service Description</label>
                  <input
                    value={form.service_description}
                    onChange={e => set('service_description', e.target.value)}
                    style={iStyle}
                    placeholder="Describe the service needed…"
                  />
                </div>
              )}
              <div>
                <label style={lStyle}>Estimated Hours</label>
                <input
                  type="number" step="0.5" min="0"
                  value={form.estimated_hours}
                  onChange={e => { set('estimated_hours', e.target.value); setServiceAutoFilled(false) }}
                  style={iStyle}
                  placeholder="e.g. 2.5"
                />
                {serviceAutoFilled && (
                  <div style={{ fontSize: '10px', color: '#FF9500', marginTop: 4 }}>
                    default: {form.estimated_hours} hrs (from service)
                  </div>
                )}
              </div>
            </div>

            {/* Timing & Assignment */}
            <div style={card}>
              <div style={secTitle}>Timing & Assignment</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Preferred Date</label>
                  <input type="date" value={form.preferred_date} onChange={e => set('preferred_date', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Preferred Time</label>
                  <SelectWrap>
                    <select value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)} style={sel}>
                      {TIMES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </SelectWrap>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lStyle}>Source</label>
                  <SelectWrap>
                    <select value={form.source} onChange={e => set('source', e.target.value)} style={sel}>
                      {SOURCES.map(s => <option key={s} value={s}>{s === 'walkin' ? 'Walk-in' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </SelectWrap>
                </div>
                <div>
                  <label style={lStyle}>Status</label>
                  <SelectWrap>
                    <select value={form.status} onChange={e => set('status', e.target.value)} style={sel}>
                      {['confirmed', 'pending', 'in_progress'].map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                      ))}
                    </select>
                  </SelectWrap>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lStyle}>Assigned Mechanic</label>
                <SelectWrap>
                  <select value={form.mechanic_id} onChange={e => set('mechanic_id', e.target.value)} style={sel}>
                    <option value="">— Unassigned —</option>
                    {mechanics.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </SelectWrap>
              </div>
              <div>
                <label style={lStyle}>Internal Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...iStyle, resize: 'vertical' }} placeholder="Notes for shop staff only…" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, color: '#FF4444', fontSize: '13px', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: submitting ? '#CC7700' : '#FF9500', color: '#0D0B08',
              border: 'none', borderRadius: 8, padding: '13px 24px',
              fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            <CheckCircle size={15} />
            {submitting ? 'Creating…' : 'Create Booking'}
          </button>
          <Link
            href="/workshop-portal/bookings"
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'none', border: '1px solid #2A2420', color: '#9A8E82',
              borderRadius: 8, padding: '13px 20px', fontSize: '13px', textDecoration: 'none',
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
