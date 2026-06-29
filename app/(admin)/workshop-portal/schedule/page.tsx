'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>

const SHOP_CAPACITY = 24
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function fmt(date: Date): string {
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i))
  const weekFrom = toISO(weekDays[0])
  const weekTo = toISO(weekDays[5])

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('bookings')
      .select('*')
      .gte('preferred_date', weekFrom)
      .lte('preferred_date', weekTo)
      .neq('status', 'cancelled')
      .order('preferred_date')
      .then(({ data }) => {
        setBookings(data ?? [])
        setLoading(false)
      })
  }, [weekFrom, weekTo])

  const today = toISO(new Date())

  function prevWeek() { setWeekStart(d => addDays(d, -7)) }
  function nextWeek() { setWeekStart(d => addDays(d, 7)) }
  function goToday() { setWeekStart(getWeekStart(new Date())) }

  const dayBookings = (date: Date) =>
    bookings.filter(b => b.preferred_date === toISO(date))

  const dayHours = (date: Date) =>
    dayBookings(date).reduce((s, b) => s + (b.estimated_hours ?? 0), 0)

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>Schedule</h1>
          <p style={{ fontSize: '13px', color: '#4A4540', marginTop: '4px' }}>
            Week of {fmt(weekDays[0])} – {fmt(weekDays[5])}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={prevWeek} style={{ background: '#111008', border: '1px solid #1F1C17', color: '#9A8E82', padding: '8px 10px', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={goToday} style={{ background: '#111008', border: '1px solid #1F1C17', color: '#9A8E82', padding: '8px 14px', fontSize: '12px', borderRadius: '3px', cursor: 'pointer' }}>
            Today
          </button>
          <button onClick={nextWeek} style={{ background: '#111008', border: '1px solid #1F1C17', color: '#9A8E82', padding: '8px 10px', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#4A4540', fontSize: '13px' }}>Loading schedule…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {weekDays.map((day, i) => {
            const iso = toISO(day)
            const isToday = iso === today
            const hours = dayHours(day)
            const pct = Math.min((hours / SHOP_CAPACITY) * 100, 100)
            const barColor = pct >= 80 ? '#FF4444' : '#FF9500'
            const bks = dayBookings(day)

            return (
              <div
                key={iso}
                style={{
                  background: '#111008',
                  border: `1px solid ${isToday ? 'rgba(255,149,0,0.4)' : '#1F1C17'}`,
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* Day header */}
                <div style={{
                  padding: '12px 14px 10px',
                  borderBottom: '1px solid #1A1714',
                  background: isToday ? 'rgba(255,149,0,0.06)' : 'transparent',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: isToday ? '#FF9500' : '#3A3430', textTransform: 'uppercase' }}>
                    {DAYS[i]}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: isToday ? '#FF9500' : '#F0EDE8', marginTop: '2px' }}>
                    {day.getDate()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#4A4540', marginTop: '6px' }}>
                    {hours.toFixed(1)} / {SHOP_CAPACITY} hrs
                  </div>
                  {/* Capacity bar */}
                  <div style={{ height: '4px', background: '#1A1714', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.4s' }} />
                  </div>
                  {pct >= 80 && (
                    <div style={{ fontSize: '9px', color: '#FF4444', marginTop: '4px', fontWeight: 600 }}>
                      {pct >= 100 ? 'FULL' : 'NEAR CAPACITY'}
                    </div>
                  )}
                </div>

                {/* Bookings list */}
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: '80px' }}>
                  {bks.length === 0 ? (
                    <div style={{ fontSize: '11px', color: '#2A2420', textAlign: 'center', paddingTop: '16px' }}>
                      No bookings
                    </div>
                  ) : bks.map(b => (
                    <Link
                      key={b.id}
                      href={`/workshop-portal/bookings/${b.id}`}
                      style={{
                        display: 'block', textDecoration: 'none',
                        background: '#1A1714', border: '1px solid #2A2420',
                        borderRadius: '3px', padding: '8px 10px',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#F0EDE8', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.customer_name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#4A4540', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.service_description ?? '—'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusBadge status={b.status} />
                        {b.estimated_hours && (
                          <span style={{ fontSize: '10px', color: '#4A4540' }}>{b.estimated_hours}h</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary */}
      <div style={{ marginTop: '24px', background: '#111008', border: '1px solid #1F1C17', borderRadius: '4px', padding: '16px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '12px', color: '#4A4540' }}>
          <span style={{ color: '#F0EDE8', fontWeight: 600 }}>{bookings.length}</span> bookings this week
        </div>
        <div style={{ fontSize: '12px', color: '#4A4540' }}>
          <span style={{ color: '#F0EDE8', fontWeight: 600 }}>
            {bookings.reduce((s, b) => s + (b.estimated_hours ?? 0), 0).toFixed(1)}
          </span> total hours booked
        </div>
        <div style={{ fontSize: '12px', color: '#4A4540' }}>
          Shop capacity: <span style={{ color: '#F0EDE8', fontWeight: 600 }}>{SHOP_CAPACITY * 6}</span> hrs/week
        </div>
      </div>
    </div>
  )
}
