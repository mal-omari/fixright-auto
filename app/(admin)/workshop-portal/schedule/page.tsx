'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
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

function fmtHeader(date: Date): string {
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

const STATUS_BORDER: Record<string, string> = {
  pending:     '#FFC107',
  confirmed:   '#4A9EFF',
  in_progress: '#FF9500',
  completed:   '#28C850',
  cancelled:   '#FF4444',
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
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
    createClient()
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

  const dayBookings = (date: Date) => bookings.filter(b => b.preferred_date === toISO(date))
  const dayHours = (date: Date) => dayBookings(date).reduce((s, b) => s + (b.estimated_hours ?? 0), 0)

  const weekLabel = `Week of ${fmtHeader(weekDays[0])} — ${fmtHeader(weekDays[5])}`

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', color: '#6B6560', textTransform: 'uppercase', marginBottom: 4 }}>
            Schedule
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#F0EDE8' }}>{weekLabel}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={prevWeek}
            style={{ background: '#1E1C18', border: '1px solid #2A2420', color: '#9A8E82', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToday}
            style={{ background: '#1E1C18', border: '1px solid #2A2420', color: '#9A8E82', padding: '8px 16px', fontSize: '12px', fontWeight: 500, borderRadius: 8, cursor: 'pointer' }}
          >
            Today
          </button>
          <button
            onClick={nextWeek}
            style={{ background: '#1E1C18', border: '1px solid #2A2420', color: '#9A8E82', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#6B6560', fontSize: '13px' }}>Loading schedule…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {weekDays.map((day, i) => {
            const iso = toISO(day)
            const isToday = iso === today
            const hours = dayHours(day)
            const pct = Math.min((hours / SHOP_CAPACITY) * 100, 100)
            const overCapacity = pct >= 80
            const barColor = pct >= 80 ? '#FF4444' : '#FF9500'
            const bks = dayBookings(day)

            return (
              <div
                key={iso}
                style={{
                  background: '#1E1C18',
                  border: `1px solid ${isToday ? 'rgba(255,149,0,0.5)' : '#2A2420'}`,
                  borderTop: isToday ? '2px solid #FF9500' : '1px solid #2A2420',
                  borderRadius: 12,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Day header */}
                <div
                  style={{
                    padding: '12px 14px 10px',
                    borderBottom: '1px solid #2A2420',
                    background: isToday ? 'rgba(255,149,0,0.05)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: isToday ? '#FF9500' : '#6B6560', textTransform: 'uppercase' }}>
                        {DAYS[i]}
                        {isToday && (
                          <span style={{
                            marginLeft: 6, background: '#FF9500', color: '#0D0B08',
                            fontSize: '8px', fontWeight: 700, padding: '1px 5px',
                            borderRadius: 4, letterSpacing: '0.08em',
                          }}>
                            TODAY
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: isToday ? '#FF9500' : '#F0EDE8', marginTop: 2 }}>
                        {day.getDate()}
                      </div>
                    </div>
                    {overCapacity && <AlertTriangle size={13} style={{ color: '#FF4444', marginTop: 2 }} />}
                  </div>

                  {/* Capacity bar */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '9px', color: '#4A4540' }}>{hours.toFixed(1)}h / {SHOP_CAPACITY}h</span>
                      {overCapacity && <span style={{ fontSize: '9px', color: '#FF4444', fontWeight: 600 }}>{pct >= 100 ? 'FULL' : 'NEAR CAP'}</span>}
                    </div>
                    <div style={{ height: 6, background: '#2A2420', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                </div>

                {/* Booking cards */}
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 100 }}>
                  {bks.length === 0 ? (
                    <div
                      style={{
                        flex: 1, border: '1px dashed #2A2420', borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        minHeight: 60,
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#3A3430' }}>Available</span>
                    </div>
                  ) : bks.map(b => (
                    <Link
                      key={b.id}
                      href={`/workshop-portal/bookings/${b.id}`}
                      style={{
                        display: 'block', textDecoration: 'none',
                        background: '#141210',
                        borderLeft: `3px solid ${STATUS_BORDER[b.status ?? ''] ?? '#2A2420'}`,
                        borderRadius: '0 8px 8px 0',
                        padding: '8px 10px',
                        border: '1px solid #2A2420',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#F0EDE8', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.customer_name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6B6560', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.service_description ?? '—'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                        <StatusBadge status={b.status} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {b.estimated_hours && (
                            <span style={{
                              fontSize: '9px', color: '#6B6560',
                              background: '#1E1C18', padding: '1px 5px', borderRadius: 3,
                            }}>
                              {b.estimated_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Week summary */}
      <div
        style={{
          marginTop: 20, background: '#1E1C18', border: '1px solid #2A2420',
          borderRadius: 12, padding: '14px 20px',
          display: 'flex', gap: 32, flexWrap: 'wrap',
          fontSize: '12px', color: '#6B6560',
        }}
      >
        <div>
          <span style={{ color: '#F0EDE8', fontWeight: 600 }}>{bookings.length}</span> bookings this week
        </div>
        <div>
          <span style={{ color: '#F0EDE8', fontWeight: 600 }}>
            {bookings.reduce((s, b) => s + (b.estimated_hours ?? 0), 0).toFixed(1)}
          </span> total hours booked
        </div>
        <div>
          Shop capacity: <span style={{ color: '#F0EDE8', fontWeight: 600 }}>{SHOP_CAPACITY * 6}</span> hrs/week
        </div>
      </div>
    </div>
  )
}
