'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatCard } from '@/components/admin/StatCard'
import { FuelGauge } from '@/components/admin/FuelGauge'
import { Plus, Calendar, FileText, CalendarDays, Clock, Wrench, CheckCircle } from 'lucide-react'
import type { Tables } from '@/types/database.types'
import { useIsMobile } from '@/lib/hooks'

type Booking = Tables<'bookings'>
type Mechanic = Tables<'mechanics'>

const SHOP_CAPACITY_PER_MECHANIC = 8

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

function addDaysToDateStr(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function DashboardPage() {
  const isMobile = useIsMobile()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Booking[]>([])
  const [workload, setWorkload] = useState<MechanicWorkload[]>([])
  const [totalTodayHours, setTotalTodayHours] = useState(0)
  const [totalMechanics, setTotalMechanics] = useState(3)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const today = getTodayEastern()
      const yesterday = addDaysToDateStr(today, -1)
      const weekAgo = addDaysToDateStr(today, -7)

      const [
        { data: allBookings },
        { data: recentBookings },
        { data: mechanics },
        { data: todayBookings },
      ] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('mechanics').select('*').eq('is_active', true).order('name'),
        supabase
          .from('bookings')
          .select('mechanic_id, estimated_hours, status, confirmed_date, preferred_date')
          .in('status', ['confirmed', 'in_progress'])
          .or(`confirmed_date.eq.${today},preferred_date.eq.${today}`),
      ])

      const all = allBookings ?? []
      const activeToday = todayBookings ?? []
      const hours = activeToday.reduce((s, b) => s + (b.estimated_hours ?? 0), 0)

      setStats({
        todayCount: all.filter(b => b.preferred_date === today && b.status !== 'cancelled').length,
        yesterdayCount: all.filter(b => b.preferred_date === yesterday && b.status !== 'cancelled').length,
        pendingCount: all.filter(b => b.status === 'pending').length,
        inProgressCount: all.filter(b => b.status === 'in_progress').length,
        completedWeekCount: all.filter(b => b.status === 'completed' && b.preferred_date && b.preferred_date >= weekAgo).length,
      })

      const mechList = mechanics ?? []
      setTotalMechanics(mechList.length || 3)
      setWorkload(
        mechList.map(m => ({
          mechanic: m,
          hours: activeToday
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

  const totalCapacity = totalMechanics * SHOP_CAPACITY_PER_MECHANIC

  const METRIC_CARDS = stats ? [
    {
      label: "Today's Bookings",
      value: stats.todayCount,
      trend: stats.todayCount - stats.yesterdayCount,
      icon: CalendarDays,
      iconBg: '#1E3A5F',
      iconColor: '#60A5FA',
      delay: 0,
      href: '/workshop-portal/bookings?date=today',
    },
    {
      label: 'Pending Confirmation',
      value: stats.pendingCount,
      trend: null,
      icon: Clock,
      iconBg: '#3D2800',
      iconColor: '#FF9500',
      delay: 150,
      href: '/workshop-portal/bookings?status=pending',
    },
    {
      label: 'In Progress',
      value: stats.inProgressCount,
      trend: null,
      icon: Wrench,
      iconBg: '#1A3320',
      iconColor: '#4ADE80',
      delay: 300,
      href: '/workshop-portal/bookings?status=in_progress',
    },
    {
      label: 'Completed This Week',
      value: stats.completedWeekCount,
      trend: null,
      icon: CheckCircle,
      iconBg: '#2D1B4E',
      iconColor: '#A78BFA',
      delay: 450,
      href: '/workshop-portal/bookings?status=completed',
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
    <div style={{ padding: isMobile ? 16 : 24, maxWidth: 1200 }}>

      {/* Metric cards */}
      <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {METRIC_CARDS.map((card, i) => (
          <StatCard
            key={i}
            label={card.label}
            value={card.value}
            trend={card.trend}
            icon={card.icon}
            iconBg={card.iconBg}
            iconColor={card.iconColor}
            delay={card.delay}
            href={card.href}
          />
        ))}
      </div>

      {/* Workload */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
            color: '#6B6560', textTransform: 'uppercase',
          }}>
            SHOP CAPACITY — TODAY
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {workload.map(({ mechanic, hours }) => (
            <FuelGauge
              key={mechanic.id}
              label={mechanic.name}
              value={hours}
              max={SHOP_CAPACITY_PER_MECHANIC}
            />
          ))}

          {workload.length === 0 && (
            <div style={{ fontSize: '13px', color: '#4A4540' }}>No active mechanics found.</div>
          )}

          <div style={{ paddingTop: 16, borderTop: '1px solid #2A2420' }}>
            <FuelGauge
              label="Total Shop Capacity"
              value={totalTodayHours}
              max={totalCapacity}
            />
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 16px' }}>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
            color: '#F0EDE8', textTransform: 'uppercase',
          }}>
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
                  {(isMobile ? ['Customer', 'Status', 'Date', ''] : ['Customer', 'Vehicle', 'Service', 'Date', 'Status', '']).map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left', padding: '10px 16px',
                        fontFamily: 'var(--font-heading), sans-serif',
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
                {recent.map((b, rowIdx) => (
                  <tr
                    key={b.id}
                    style={{
                      borderTop: '1px solid #1E1C18',
                      cursor: 'pointer',
                      animation: `rowEnter 300ms ease-out ${rowIdx * 50}ms both`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,149,0,0.04)'
                      e.currentTarget.style.borderLeft = '2px solid #FF9500'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderLeft = ''
                    }}
                    onClick={() => window.location.href = `/workshop-portal/bookings/${b.id}`}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0EDE8' }}>{b.customer_name}</div>
                      {b.customer_phone && (
                        <div style={{ fontSize: '12px', color: '#6B6560', marginTop: 2 }}>{b.customer_phone}</div>
                      )}
                    </td>
                    {!isMobile && (
                      <td style={{ padding: '14px 16px', color: '#9A8E82', whiteSpace: 'nowrap' }}>
                        {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                      </td>
                    )}
                    {!isMobile && (
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
                    )}
                    {isMobile && (
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={b.status} />
                      </td>
                    )}
                    <td style={{ padding: '14px 16px', color: '#9A8E82', whiteSpace: 'nowrap' }}>
                      {fmtDate(b.preferred_date)}
                    </td>
                    {!isMobile && (
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={b.status} />
                      </td>
                    )}
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
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, flexWrap: 'wrap' }}>
        <Link
          href="/workshop-portal/new-booking"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FF9500', color: '#0D0B08', textDecoration: 'none',
            padding: '11px 20px',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '13px', fontWeight: 700,
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
            padding: '11px 20px',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '13px', fontWeight: 600,
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
            padding: '11px 20px',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '13px', fontWeight: 600,
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
