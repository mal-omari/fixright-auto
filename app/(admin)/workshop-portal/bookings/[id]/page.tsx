'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Car, User, FileText } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>
type Mechanic = Tables<'mechanics'>
type Service = Tables<'services'>

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending',     color: '#FFC107' },
  { value: 'confirmed',   label: 'Confirmed',   color: '#4A9EFF' },
  { value: 'in_progress', label: 'In Progress', color: '#FF9500' },
  { value: 'completed',   label: 'Completed',   color: '#28C850' },
  { value: 'cancelled',   label: 'Cancelled',   color: '#FF4444' },
]

const TIME_SLOTS = [
  '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
  '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM',
]

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#141210', border: '1px solid #2A2420',
  borderRadius: 8, color: '#F0EDE8', padding: '10px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading), sans-serif',
  fontSize: '10px', fontWeight: 600,
  letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6,
  textTransform: 'uppercase',
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [creatingInvoice, setCreatingInvoice] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const [status, setStatus] = useState('')
  const [mechanicId, setMechanicId] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [actualHours, setActualHours] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmedDate, setConfirmedDate] = useState('')
  const [confirmedTime, setConfirmedTime] = useState('')
  const [serviceAutoFilled, setServiceAutoFilled] = useState(false)

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setConfirmedDate((b as any).confirmed_date ?? '')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setConfirmedTime((b as any).confirmed_time ?? '')

        if (b.service_id) {
          const { data: svc } = await supabase.from('services').select('*').eq('id', b.service_id).single()
          if (svc) {
            setService(svc)
            if (!b.estimated_hours) {
              setEstimatedHours(svc.estimated_hours.toString())
              setServiceAutoFilled(true)
            }
          }
        }
      }
      setMechanics(m ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  async function save() {
    if (!booking) return
    setSaving(true); setSaveMsg('')
    const supabase = createClient()
    const statusChangedToConfirmed = status === 'confirmed' && booking.status !== 'confirmed'
    const { error } = await supabase.from('bookings').update({
      status,
      mechanic_id: mechanicId || null,
      estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
      actual_hours: actualHours ? parseFloat(actualHours) : null,
      notes: notes || null,
      confirmed_date: confirmedDate || null,
      confirmed_time: confirmedTime || null,
      updated_at: new Date().toISOString(),
    }).eq('id', booking.id)

    setSaving(false)
    if (error) {
      setSaveMsg('Error: ' + error.message)
      toast.error('Error saving booking: ' + error.message)
    } else {
      setBooking(prev => prev ? { ...prev, status, mechanic_id: mechanicId || null } : prev)
      setSaveMsg('Saved successfully')
      setTimeout(() => setSaveMsg(''), 3000)
      toast.success('Booking saved successfully')

      if (statusChangedToConfirmed && booking.customer_email) {
        try {
          const res = await fetch('/api/bookings/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id }),
          })
          if (res.ok) {
            toast.success('Confirmation email sent to customer')
          } else {
            toast.error('Booking saved, but confirmation email failed to send')
          }
        } catch {
          toast.error('Booking saved, but confirmation email failed to send')
        }
      }
    }
  }

  async function createInvoice() {
    if (!booking) return
    setCreatingInvoice(true)
    const supabase = createClient()
    const labourRate = parseFloat(localStorage.getItem('fixright_labour_rate') ?? '95')
    const hrs = estimatedHours ? parseFloat(estimatedHours) : 1

    const { data: invoiceNum } = await supabase.rpc('next_invoice_number')
    if (!invoiceNum) { setCreatingInvoice(false); return }

    const labourSubtotal = hrs * labourRate
    const hstRate = 0.13
    const hstAmount = labourSubtotal * hstRate
    const total = labourSubtotal + hstAmount

    const dueDate = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0]

    const { data: inv, error: invErr } = await supabase.from('invoices').insert({
      invoice_number: invoiceNum as string,
      booking_id: booking.id,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      customer_email: booking.customer_email,
      vehicle_year: booking.vehicle_year,
      vehicle_make: booking.vehicle_make,
      vehicle_model: booking.vehicle_model,
      status: 'draft',
      labour_subtotal: labourSubtotal,
      parts_subtotal: 0,
      subtotal: labourSubtotal,
      hst_rate: hstRate,
      hst_amount: hstAmount,
      total,
      due_date: dueDate,
    }).select().single()

    if (invErr || !inv) {
      setCreatingInvoice(false)
      toast.error('Failed to create invoice')
      return
    }

    await supabase.from('invoice_line_items').insert({
      invoice_id: inv.id,
      type: 'labour',
      description: booking.service_description ?? 'Labour',
      quantity: hrs,
      unit_price: labourRate,
      sort_order: 0,
    })

    router.push(`/workshop-portal/invoices/${inv.id}`)
  }

  async function cancelBooking() {
    if (!booking) return
    const { error } = await createClient().from('bookings').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', booking.id)
    if (error) {
      toast.error('Failed to cancel booking')
      return
    }
    toast.success('Booking cancelled')
    router.push('/workshop-portal/bookings')
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#6B6560', fontSize: '13px' }}>Loading booking…</div>
  }
  if (!booking) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ color: '#FF4444', fontSize: '14px', marginBottom: 16 }}>Booking not found</div>
        <Link href="/workshop-portal/bookings" style={{ color: '#FF9500', textDecoration: 'none', fontSize: '13px' }}>
          ← Back to Bookings
        </Link>
      </div>
    )
  }

  const vehicle = [booking.vehicle_year, booking.vehicle_make, booking.vehicle_model].filter(Boolean).join(' ') || '—'
  const breadcrumb = `#${booking.id.slice(0, 8).toUpperCase()} — ${booking.customer_name}`

  const card: React.CSSProperties = {
    background: '#1E1C18', border: '1px solid #2A2420',
    borderRadius: 12, padding: 24, marginBottom: 16,
  }

  return (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/workshop-portal/bookings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6560', textDecoration: 'none', fontSize: '12px', marginBottom: 10 }}
        >
          <ArrowLeft size={13} /> Bookings
        </Link>
        <div style={{ fontSize: '14px', color: '#4A4540' }}>
          Bookings / <span style={{ color: '#F0EDE8' }}>{breadcrumb}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Left */}
        <div>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '17px', fontWeight: 700, color: '#0D0B08', flexShrink: 0,
                }}
              >
                {initials(booking.customer_name)}
              </div>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#F0EDE8' }}>{booking.customer_name}</div>
                <div style={{ fontSize: '13px', color: '#6B6560', marginTop: 2 }}>{booking.customer_phone}</div>
                {booking.customer_email && (
                  <div style={{ fontSize: '12px', color: '#4A4540', marginTop: 1 }}>{booking.customer_email}</div>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: '#2A2420', marginBottom: 20 }} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Car size={15} style={{ color: '#6B6560' }} />
                <span style={{ ...labelStyle, marginBottom: 0 }}>Vehicle</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#F0EDE8', marginBottom: 8 }}>{vehicle}</div>
              {booking.vehicle_vin && (
                <div style={{ fontSize: '11px', color: '#4A4540' }}>VIN: {booking.vehicle_vin}</div>
              )}
            </div>

            {booking.service_description && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...labelStyle, marginBottom: 8 }}>Issue Described</div>
                <div
                  style={{
                    fontSize: '13px', color: '#9A8E82', fontStyle: 'italic',
                    background: '#141210', border: '1px solid #2A2420', borderRadius: 8,
                    padding: '12px 14px', lineHeight: 1.6,
                    borderLeft: '3px solid rgba(255,149,0,0.3)',
                  }}
                >
                  &ldquo;{booking.service_description}&rdquo;
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {booking.preferred_date && (
                <span style={{
                  background: '#141210', border: '1px solid #2A2420',
                  color: '#9A8E82', padding: '5px 12px', borderRadius: 20,
                  fontSize: '12px',
                }}>
                  {new Date(booking.preferred_date + 'T00:00:00').toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {booking.preferred_time && ` · ${booking.preferred_time}`}
                </span>
              )}
              {booking.source && (
                <span style={{
                  background: '#141210', border: '1px solid #2A2420',
                  color: '#6B6560', padding: '5px 12px', borderRadius: 20,
                  fontSize: '11px', textTransform: 'capitalize',
                }}>
                  {booking.source === 'walkin' ? 'Walk-in' : booking.source === 'web' ? 'Web Booking' : booking.source}
                </span>
              )}
              {booking.created_at && (
                <span style={{ fontSize: '11px', color: '#4A4540', padding: '5px 0' }}>
                  Created {new Date(booking.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <User size={14} style={{ color: '#6B6560' }} />
              <span style={{ ...labelStyle, marginBottom: 0 }}>SHOP MANAGEMENT</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Status</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {STATUS_OPTIONS.map(opt => {
                  const active = status === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      style={{
                        padding: '6px 14px', borderRadius: 20,
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: '11px', fontWeight: active ? 600 : 500,
                        background: active ? `${opt.color}25` : 'transparent',
                        border: `1px solid ${active ? opt.color : '#2A2420'}`,
                        color: active ? opt.color : '#6B6560',
                        cursor: 'pointer', transition: 'all 0.15s',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Assigned Mechanic</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={mechanicId}
                  onChange={e => setMechanicId(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 28, cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="">— Unassigned —</option>
                  {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Confirmed Date</label>
              <input
                type="date"
                value={confirmedDate}
                onChange={e => setConfirmedDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Confirmed Time</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={confirmedTime}
                  onChange={e => setConfirmedTime(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 28, cursor: 'pointer', appearance: 'none' }}
                >
                  <option value="">— Not set —</option>
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Est. Hours</label>
                <input
                  type="number" step="0.5" min="0"
                  value={estimatedHours}
                  onChange={e => { setEstimatedHours(e.target.value); setServiceAutoFilled(false) }}
                  style={inputStyle}
                />
                {service && serviceAutoFilled && (
                  <div style={{ fontSize: '10px', color: '#FF9500', marginTop: 4 }}>
                    auto-filled from service
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Actual Hours</label>
                <input
                  type="number" step="0.5" min="0"
                  value={actualHours}
                  onChange={e => setActualHours(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Internal Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Visible to shop staff only…"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              style={{
                width: '100%', height: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: saving ? '#CC7700' : '#FF9500', color: '#0D0B08',
                border: 'none', borderRadius: 8,
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>

            {saveMsg && (
              <div style={{
                marginTop: 10, fontSize: '12px', textAlign: 'center',
                color: saveMsg.startsWith('Error') ? '#FF4444' : '#28C850',
              }}>
                {saveMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#141210', borderTop: '1px solid #1E1C18',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 30,
        }}
      >
        <Link
          href="/workshop-portal/bookings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6560', textDecoration: 'none', fontSize: '13px' }}
        >
          <ArrowLeft size={14} /> Back to Bookings
        </Link>

        <div style={{ display: 'flex', gap: 10 }}>
          {status === 'completed' && (
            <button
              onClick={createInvoice}
              disabled={creatingInvoice}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(40,200,80,0.1)', color: '#28C850',
                border: '1px solid rgba(40,200,80,0.3)', borderRadius: 8,
                padding: '9px 18px', fontSize: '13px', fontWeight: 600,
                cursor: creatingInvoice ? 'not-allowed' : 'pointer',
              }}
            >
              <FileText size={14} />
              {creatingInvoice ? 'Creating…' : 'Create Invoice'}
            </button>
          )}

          {!confirmCancel ? (
            <button
              onClick={() => setConfirmCancel(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: '#FF4444',
                border: '1px solid rgba(255,68,68,0.3)', borderRadius: 8,
                padding: '9px 18px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel Booking
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#FF4444' }}>Confirm cancel?</span>
              <button
                onClick={cancelBooking}
                style={{
                  background: '#FF4444', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '8px 16px', fontSize: '12px',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setConfirmCancel(false)}
                style={{
                  background: 'none', border: '1px solid #2A2420', color: '#9A8E82',
                  borderRadius: 8, padding: '8px 14px', fontSize: '12px', cursor: 'pointer',
                }}
              >
                Keep
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
