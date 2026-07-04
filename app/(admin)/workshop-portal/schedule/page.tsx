'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

const SHOP_CAPACITY = 24
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface ScheduleBooking {
  id: string
  customer_name: string
  vehicle_year: number | null
  vehicle_make: string | null
  vehicle_model: string | null
  service_id: string | null
  estimated_hours: number | null
  status: string | null
  mechanic_id: string | null
  preferred_date: string | null
  confirmed_date: string | null
  preferred_time: string | null
  confirmed_time: string | null
  services: { name: string } | null
  mechanics: { name: string } | null
}

function getTodayEastern(): string {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString('en-US', {
    timeZone: 'America/Toronto',
  }))
  const year = easternTime.getFullYear()
  const month = String(easternTime.getMonth() + 1).padStart(2, '0')
  const day = String(easternTime.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekStart(todayStr: string): string {
  const today = new Date(todayStr + 'T12:00:00')
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday.toISOString().split('T')[0]
}

function addDaysStr(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function fmtHeader(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function dayOfMonth(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDate()
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
  const isMobile = useIsMobile()
  const [weekStart, setWeekStart] = useState(() => getWeekStart(getTodayEastern()))
  const [mobilePage, setMobilePage] = useState(0)
  const [bookings, setBookings] = useState<ScheduleBooking[]>([])
  const [loading, setLoading] = useState(true)

  const weekDays = Array.from({ length: 6 }, (_, i) => addDaysStr(weekStart, i))
  const weekFrom = weekDays[0]
  const weekTo = weekDays[5]
  const today = getTodayEastern()
  const visibleDayIndices = isMobile
    ? [mobilePage * 3, mobilePage * 3 + 1, mobilePage * 3 + 2]
    : [0, 1, 2, 3, 4, 5]

  useEffect(() => {
    setLoading(true)
    createClient()
      .from('bookings')
      .select(`
        id,
        customer_name,
        vehicle_year,
        vehicle_make,
        vehicle_model,
        service_id,
        estimated_hours,
        status,
        mechanic_id,
        preferred_date,
        confirmed_date,
        preferred_time,
        confirmed_time,
        services (name),
        mechanics (name)
      `)
      .or(`confirmed_date.gte.${weekFrom},preferred_date.gte.${weekFrom}`)
      .or(`confirmed_date.lte.${weekTo},preferred_date.lte.${weekTo}`)
      .not('status', 'eq', 'cancelled')
      .then(({ data }) => {
        setBookings((data as unknown as ScheduleBooking[]) ?? [])
        setLoading(false)
      })
  }, [weekFrom, weekTo])

  function prevWeek() { setWeekStart(d => addDaysStr(d, -7)); setMobilePage(0) }
  function nextWeek() { setWeekStart(d => addDaysStr(d, 7)); setMobilePage(0) }
  function goToday() { setWeekStart(getWeekStart(getTodayEastern())); setMobilePage(0) }

  const dayBookings = (dateStr: string) => bookings.filter(b =>
    b.confirmed_date === dateStr || (!b.confirmed_date && b.preferred_date === dateStr)
  )
  const dayHours = (dateStr: string) => dayBookings(dateStr).reduce((s, b) => s + (b.estimated_hours ?? 0), 0)

  const weekLabel = `Week of ${fmtHeader(weekDays[0])} — ${fmtHeader(weekDays[5])}`

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
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

      {isMobile && !loading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button
            onClick={() => setMobilePage(p => Math.max(0, p - 1))}
            disabled={mobilePage === 0}
            style={{
              background: '#1E1C18', border: '1px solid #2A2420',
              color: mobilePage === 0 ? '#2A2420' : '#9A8E82',
              padding: '8px 10px', borderRadius: 8,
              cursor: mobilePage === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '12px', color: '#6B6560' }}>
            {fmtHeader(weekDays[visibleDayIndices[0]])} – {fmtHeader(weekDays[visibleDayIndices[visibleDayIndices.length - 1]])}
          </span>
          <button
            onClick={() => setMobilePage(p => Math.min(1, p + 1))}
            disabled={mobilePage === 1}
            style={{
              background: '#1E1C18', border: '1px solid #2A2420',
              color: mobilePage === 1 ? '#2A2420' : '#9A8E82',
              padding: '8px 10px', borderRadius: 8,
              cursor: mobilePage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#6B6560', fontSize: '13px' }}>Loading schedule…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${visibleDayIndices.length}, 1fr)`, gap: 12 }}>
          {visibleDayIndices.map(i => {
            const iso = weekDays[i]
            const isToday = iso === today
            const hours = dayHours(iso)
            const pct = Math.min((hours / SHOP_CAPACITY) * 100, 100)
            const overCapacity = pct >= 80
            const barColor = pct >= 80 ? '#FF4444' : '#FF9500'
            const bks = dayBookings(iso)

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
                        {dayOfMonth(iso)}
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
                  ) : bks.map(b => {
                    const isConfirmed = !!b.confirmed_date
                    const mechanicName = b.mechanics?.name
                    const vehicle = [b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ')

                    return (
                      <Link
                        key={b.id}
                        href={`/workshop-portal/bookings/${b.id}`}
                        style={{
                          display: 'block', textDecoration: 'none',
                          background: isConfirmed ? '#1E1C18' : 'transparent',
                          borderLeft: isConfirmed ? `3px solid ${STATUS_BORDER[b.status ?? ''] ?? '#2A2420'}` : undefined,
                          border: isConfirmed ? undefined : '1px dashed #3A3430',
                          borderRadius: isConfirmed ? '0 8px 8px 0' : 8,
                          padding: '8px 10px',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: isConfirmed ? '#F0EDE8' : '#6B6560', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.customer_name}
                          </div>
                          {mechanicName && (
                            <span style={{
                              flexShrink: 0,
                              width: 18, height: 18, borderRadius: '50%',
                              background: isConfirmed ? 'rgba(255,149,0,0.15)' : 'rgba(106,101,96,0.15)',
                              color: isConfirmed ? '#FF9500' : '#6B6560',
                              fontSize: '8px', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {initials(mechanicName)}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '10px', color: isConfirmed ? '#6B6560' : '#6B6560', marginTop: 2, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.services?.name ?? vehicle ?? '—'}
                        </div>

                        {!isConfirmed && (
                          <div style={{ fontSize: '9px', color: '#4A4540', marginBottom: 5 }}>
                            Preferred: {b.preferred_time ? b.preferred_time.charAt(0).toUpperCase() + b.preferred_time.slice(1) : 'Flexible'}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
                          <StatusBadge status={b.status} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isConfirmed && b.confirmed_time && (
                              <span style={{
                                fontSize: '9px', color: '#FF9500',
                                background: 'rgba(255,149,0,0.1)', padding: '1px 5px', borderRadius: 3,
                              }}>
                                {b.confirmed_time}
                              </span>
                            )}
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
                    )
                  })}
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
