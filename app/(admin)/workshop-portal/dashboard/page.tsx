'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Plus, Calendar, FileText, CalendarDays, Clock, Wrench, CheckCircle } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>
type Mechanic = Tables<'mechanics'>

const SHOP_CAPACITY_PER_MECHANIC = 8
const TOTAL_MECHANICS = 3

interface MechanicWorkload {
  mechanic: Mechanic
  hours: number
}

interface Stats {
  todayCount: number
  yesterdayCount: number
  pendingCount: number
  inProgressCount: number
  completedWeekCount: number
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Booking[]>([])
  const [workload, setWorkload] = useState<MechanicWorkload[]>([])
  const [totalTodayHours, setTotalTodayHours] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().split('T')[0]

      const [{ data: allBookings }, { data: recentBookings }, { data: mechanics }] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('mechanics').select('*').eq('is_active', true).order('name'),
      ])

      const all = allBookings ?? []
      const todayBookings = all.filter(b => b.preferred_date === today && b.status !== 'cancelled')
      const hours = todayBookings.reduce((s, b) => s + (b.estimated_hours ?? 0), 0)

      setStats({
        todayCount: todayBookings.length,
        yesterdayCount: all.filter(b => b.preferred_date === yesterday && b.status !== 'cancelled').length,
        pendingCount: all.filter(b => b.status === 'pending').length,
        inProgressCount: all.filter(b => b.status === 'in_progress').length,
        completedWeekCount: all.filter(b => b.status === 'completed' && b.preferred_date && b.preferred_date >= weekAgo).length,
      })

      const mechList = mechanics ?? []
      setWorkload(
        mechList.map(m => ({
          mechanic: m,
          hours: todayBookings
            .filter(b => b.mechanic_id === m.id)
            .reduce((s, b) => s + (b.estimated_hours ?? 0), 0),
        }))
      )
      setTotalTodayHours(hours)
      setRecent(recentBookings ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const totalCapacity = TOTAL_MECHANICS * SHOP_CAPACITY_PER_MECHANIC

  const METRIC_CARDS = stats ? [
    {
      label: "Today's Bookings",
      value: stats.todayCount,
      trend: stats.todayCount - stats.yesterdayCount,
      icon: CalendarDays,
      iconBg: 'rgba(74,158,255,0.15)',
      iconColor: '#4A9EFF',
    },
    {
      label: 'Pending Confirmation',
      value: stats.pendingCount,
      trend: null,
      icon: Clock,
      iconBg: 'rgba(255,193,7,0.15)',
      iconColor: '#FFC107',
    },
    {
      label: 'In Progress',
      value: stats.inProgressCount,
      trend: null,
      icon: Wrench,
      iconBg: 'rgba(40,200,80,0.15)',
      iconColor: '#28C850',
    },
    {
      label: 'Completed This Week',
      value: stats.completedWeekCount,
      trend: null,
      icon: CheckCircle,
      iconBg: 'rgba(139,92,246,0.15)',
      iconColor: '#8B5CF6',
    },
  ] : []

  if (loading) {
    return (
      <div style={{ padding: 40, color: '#4A4540', fontSize: '13px' }}>
        Loading dashboard…
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {METRIC_CARDS.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              style={{
                background: '#1E1C18',
                border: '1px solid #2A2420',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: card.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={18} style={{ color: card.iconColor }} />
                </div>
                <span style={{ fontSize: '12px', color: '#6B6560', fontWeight: 500, textAlign: 'right', maxWidth: 100 }}>
                  {card.label}
                </span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: 600, color: '#F0EDE8', lineHeight: 1 }}>
                {card.value}
              </div>
              {card.trend !== null && (
                <div style={{
                  marginTop: 8, fontSize: '11px',
                  color: card.trend > 0 ? '#28C850' : card.trend < 0 ? '#FF4444' : '#6B6560',
                }}>
                  {card.trend > 0 ? `+${card.trend}` : card.trend === 0 ? 'Same as yesterday' : String(card.trend)} vs yesterday
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Workload */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', color: '#6B6560', textTransform: 'uppercase' }}>
            SHOP CAPACITY — TODAY
          </div>
          <div style={{ fontSize: '12px', color: '#4A4540', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {workload.map(({ mechanic, hours }) => {
            const pct = Math.min((hours / SHOP_CAPACITY_PER_MECHANIC) * 100, 100)
            const barColor = hours >= 7 ? '#FF4444' : '#FF9500'
            return (
              <div key={mechanic.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700, color: '#0D0B08',
                      }}
                    >
                      {initials(mechanic.name)}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#F0EDE8' }}>{mechanic.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: hours >= 7 ? '#FF4444' : '#6B6560' }}>
                    {hours} hrs / {SHOP_CAPACITY_PER_MECHANIC} hrs
                  </span>
                </div>
                <div style={{ height: 8, background: '#2A2420', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%', width: `${pct}%`,
                      background: barColor, borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}

          {workload.length === 0 && (
            <div style={{ fontSize: '13px', color: '#4A4540' }}>No active mechanics found.</div>
          )}

          {/* Total bar */}
          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #2A2420' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#9A8E82' }}>Total Shop Capacity</span>
              <span style={{ fontSize: '12px', color: '#6B6560' }}>
                {totalTodayHours} hrs / {totalCapacity} hrs
              </span>
            </div>
            <div style={{ height: 8, background: '#2A2420', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((totalTodayHours / totalCapacity) * 100, 100)}%`,
                  background: totalTodayHours / totalCapacity >= 0.8 ? '#FF4444' : '#FF9500',
                  borderRadius: 4,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#F0EDE8', letterSpacing: '0.02em' }}>
            RECENT BOOKINGS
          </div>
          <Link href="/workshop-portal/bookings" style={{ fontSize: '12px', color: '#FF9500', textDecoration: 'none', fontWeight: 500 }}>
            View All →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <Wrench size={32} style={{ color: '#2A2420', marginBottom: 12 }} />
            <div style={{ color: '#4A4540', fontSize: '14px', marginBottom: 4 }}>No bookings yet.</div>
            <div style={{ color: '#3A3430', fontSize: '12px', marginBottom: 20 }}>Add your first booking to get started.</div>
            <Link
              href="/workshop-portal/new-booking"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#FF9500', color: '#0D0B08', textDecoration: 'none',
                padding: '10px 20px', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 6,
              }}
            >
              <Plus size={14} /> New Booking
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#141210' }}>
                  {['Customer', 'Vehicle', 'Service', 'Date', 'Status', ''].map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left', padding: '10px 16px',
                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                        color: '#6B6560', textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(b => (
                  <tr
                    key={b.id}
                    style={{ borderTop: '1px solid #1E1C18', transition: 'background 0.12s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,149,0,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => window.location.href = `/workshop-portal/bookings/${b.id}`}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EDE8' }}>{b.customer_name}</div>
                      {b.customer_phone && (
                        <div style={{ fontSize: '11px', color: '#6B6560', marginTop: 2 }}>{b.customer_phone}</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9A8E82', whiteSpace: 'nowrap' }}>
                      {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 160 }}>
                      <span style={{ color: '#9A8E82', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.service_description ?? '—'}
                      </span>
                      {b.estimated_hours && (
                        <span style={{
                          display: 'inline-block', marginTop: 3,
                          background: 'rgba(255,149,0,0.1)', color: '#FF9500',
                          fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                        }}>
                          {b.estimated_hours}h
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#9A8E82', whiteSpace: 'nowrap' }}>
                      {fmtDate(b.preferred_date)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <StatusBadge status={b.status} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', color: '#FF9500', fontWeight: 500 }}>View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href="/workshop-portal/new-booking"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FF9500', color: '#0D0B08', textDecoration: 'none',
            padding: '11px 20px', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8,
          }}
        >
          <Plus size={15} /> New Booking
        </Link>
        <Link
          href="/workshop-portal/schedule"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: '#9A8E82', textDecoration: 'none',
            padding: '11px 20px', fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8,
            border: '1px solid #2A2420',
          }}
        >
          <Calendar size={15} /> View Schedule
        </Link>
        <Link
          href="/workshop-portal/invoices"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: '#9A8E82', textDecoration: 'none',
            padding: '11px 20px', fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8,
            border: '1px solid #2A2420',
          }}
        >
          <FileText size={15} /> Generate Invoice
        </Link>
      </div>
    </div>
  )
}
