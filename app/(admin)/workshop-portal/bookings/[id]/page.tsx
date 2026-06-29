'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ArrowLeft, Save, Trash2, FileText } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>
type Mechanic = Tables<'mechanics'>

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

const input: React.CSSProperties = {
  width: '100%', background: '#1A1714', border: '1px solid #2A2420',
  borderRadius: '3px', color: '#F0EDE8', padding: '9px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
}
const label: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 600,
  letterSpacing: '0.1em', color: '#4A4540', marginBottom: '5px',
  textTransform: 'uppercase',
}
const infoRow = (k: string, v: string | number | null) => ({
  key: k, val: v ?? '—',
})

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  // Editable shop management fields
  const [status, setStatus] = useState('')
  const [mechanicId, setMechanicId] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [actualHours, setActualHours] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: b }, { data: m }] = await Promise.all([
        supabase.from('bookings').select('*').eq('id', id).single(),
        supabase.from('mechanics').select('*').eq('is_active', true).order('name'),
      ])
      if (b) {
        setBooking(b)
        setStatus(b.status ?? 'pending')
        setMechanicId(b.mechanic_id ?? '')
        setEstimatedHours(b.estimated_hours?.toString() ?? '')
        setActualHours(b.actual_hours?.toString() ?? '')
        setNotes(b.notes ?? '')
      }
      setMechanics(m ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function save() {
    if (!booking) return
    setSaving(true)
    setSaveMsg('')
    const supabase = createClient()
    const { error } = await supabase.from('bookings').update({
      status,
      mechanic_id: mechanicId || null,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
      actual_hours: actualHours ? parseFloat(actualHours) : null,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', booking.id)

    setSaving(false)
    if (error) {
      setSaveMsg('Error: ' + error.message)
    } else {
      setBooking(prev => prev ? { ...prev, status, mechanic_id: mechanicId || null } : prev)
      setSaveMsg('Saved successfully')
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  async function cancelBooking() {
    if (!booking) return
    const supabase = createClient()
    await supabase.from('bookings').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', booking.id)
    router.push('/workshop-portal/bookings')
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#4A4540', fontSize: '13px' }}>Loading booking…</div>
    )
  }

  if (!booking) {
    return (
      <div style={{ padding: '40px' }}>
        <div style={{ color: '#FF4444', fontSize: '14px', marginBottom: '16px' }}>Booking not found</div>
        <Link href="/workshop-portal/bookings" style={{ color: '#FF9500', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Bookings
        </Link>
      </div>
    )
  }

  const vehicle = [booking.vehicle_year, booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(' ') || '—'
  const customerInfo = [
    infoRow('Name', booking.customer_name),
    infoRow('Phone', booking.customer_phone),
    infoRow('Email', booking.customer_email),
  ]
  const vehicleInfo = [
    infoRow('Year', booking.vehicle_year),
    infoRow('Make', booking.vehicle_make),
    infoRow('Model', booking.vehicle_model),
    infoRow('VIN', booking.vehicle_vin),
  ]
  const bookingInfo = [
    infoRow('Service', booking.service_description),
    infoRow('Preferred Date', booking.preferred_date),
    infoRow('Preferred Time', booking.preferred_time),
    infoRow('Source', booking.source),
    infoRow('Created', booking.created_at ? new Date(booking.created_at).toLocaleString() : null),
  ]

  const card: React.CSSProperties = {
    background: '#111008', border: '1px solid #1F1C17',
    borderRadius: '4px', padding: '24px', marginBottom: '16px',
  }
  const sectionTitle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
    color: '#3A3430', textTransform: 'uppercase', marginBottom: '16px',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/workshop-portal/bookings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4A4540', textDecoration: 'none', fontSize: '12px', marginBottom: '16px' }}
        >
          <ArrowLeft size={13} /> Back to Bookings
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
            {booking.customer_name}
          </h1>
          <StatusBadge status={booking.status} />
          <span style={{ fontSize: '13px', color: '#4A4540' }}>{vehicle}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left — Booking Info */}
        <div>
          <div style={card}>
            <div style={sectionTitle}>Customer</div>
            {customerInfo.map(({ key, val }) => (
              <div key={key} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <span style={{ minWidth: '60px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#3A3430', textTransform: 'uppercase' }}>{key}</span>
                <span style={{ fontSize: '13px', color: '#F0EDE8' }}>{String(val)}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={sectionTitle}>Vehicle</div>
            {vehicleInfo.map(({ key, val }) => (
              <div key={key} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <span style={{ minWidth: '60px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#3A3430', textTransform: 'uppercase' }}>{key}</span>
                <span style={{ fontSize: '13px', color: '#F0EDE8' }}>{String(val)}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={sectionTitle}>Booking Details</div>
            {bookingInfo.map(({ key, val }) => (
              <div key={key} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                <span style={{ minWidth: '90px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#3A3430', textTransform: 'uppercase' }}>{key}</span>
                <span style={{ fontSize: '13px', color: '#F0EDE8' }}>{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Shop Management */}
        <div>
          <div style={card}>
            <div style={sectionTitle}>Shop Management</div>

            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Status</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{ ...input, paddingRight: '28px', cursor: 'pointer', appearance: 'none' as const }}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4A4540', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Assigned Mechanic</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={mechanicId}
                  onChange={e => setMechanicId(e.target.value)}
                  style={{ ...input, paddingRight: '28px', cursor: 'pointer', appearance: 'none' as const }}
                >
                  <option value="">— Unassigned —</option>
                  {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4A4540', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={label}>Est. Hours</label>
                <input
                  type="number" step="0.5" min="0"
                  value={estimatedHours}
                  onChange={e => setEstimatedHours(e.target.value)}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Actual Hours</label>
                <input
                  type="number" step="0.5" min="0"
                  value={actualHours}
                  onChange={e => setActualHours(e.target.value)}
                  style={input}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={label}>Internal Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                style={{ ...input, resize: 'vertical' }}
                placeholder="Notes visible only to shop staff…"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: saving ? '#CC7700' : '#FF9500', color: '#111008',
                border: 'none', borderRadius: '3px', padding: '11px 20px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', width: '100%',
                justifyContent: 'center',
              }}
            >
              <Save size={14} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>

            {saveMsg && (
              <div style={{
                marginTop: '10px', fontSize: '12px', textAlign: 'center',
                color: saveMsg.startsWith('Error') ? '#FF4444' : '#28C850',
              }}>
                {saveMsg}
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {status === 'completed' && (
              <button style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(74,158,255,0.1)', color: '#4A9EFF',
                border: '1px solid rgba(74,158,255,0.3)', borderRadius: '3px',
                padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer',
              }}>
                <FileText size={14} />
                Create Invoice
              </button>
            )}

            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,68,68,0.1)', color: '#FF4444',
                  border: '1px solid rgba(255,68,68,0.3)', borderRadius: '3px',
                  padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} />
                Cancel Booking
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#FF4444' }}>Are you sure?</span>
                <button
                  onClick={cancelBooking}
                  style={{
                    background: '#FF4444', color: '#fff', border: 'none',
                    borderRadius: '3px', padding: '8px 14px', fontSize: '12px',
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Yes, Cancel
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  style={{
                    background: 'none', border: '1px solid #2A2420', color: '#9A8E82',
                    borderRadius: '3px', padding: '8px 14px', fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Keep
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
