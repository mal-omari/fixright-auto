'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Plus, Calendar, LayoutDashboard } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>

interface Stats {
  todayCount: number
  pendingCount: number
  inProgressCount: number
  completedWeekCount: number
  todayHours: number
}

const SHOP_CAPACITY = 24

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [
        { data: allBookings },
        { data: recentBookings },
      ] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('bookings').select('*').order('created_at', { ascending: false }).limit(10),
      ])

      const all = allBookings ?? []
      const todayCount = all.filter(b => b.preferred_date === today).length
      const pendingCount = all.filter(b => b.status === 'pending').length
      const inProgressCount = all.filter(b => b.status === 'in_progress').length
      const completedWeekCount = all.filter(
        b => b.status === 'completed' && b.preferred_date && b.preferred_date >= weekAgo
      ).length
      const todayHours = all
        .filter(b => b.preferred_date === today && b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.estimated_hours ?? 0), 0)

      setStats({ todayCount, pendingCount, inProgressCount, completedWeekCount, todayHours })
      setRecent(recentBookings ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const card: React.CSSProperties = {
    background: '#111008', border: '1px solid #1F1C17',
    borderRadius: '4px', padding: '24px',
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4A4540' }}>
        <LayoutDashboard size={16} />
        Loading dashboard…
      </div>
    )
  }

  const hoursPercent = stats ? Math.min((stats.todayHours / SHOP_CAPACITY) * 100, 100) : 0
  const barColor = hoursPercent >= 80 ? '#FF4444' : '#FF9500'

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#4A4540', marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { value: stats?.todayCount ?? 0, sub: "Today's Bookings", color: '#F0EDE8' },
          { value: stats?.pendingCount ?? 0, sub: 'Pending Confirmation', color: '#FFC107' },
          { value: stats?.inProgressCount ?? 0, sub: 'In Progress', color: '#FF9500' },
          { value: stats?.completedWeekCount ?? 0, sub: 'Completed This Week', color: '#28C850' },
        ].map((item, i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: '36px', fontWeight: 700, color: item.color, lineHeight: 1 }}>
              {item.value}
            </div>
            <div style={{ fontSize: '12px', color: '#4A4540', marginTop: '8px', lineHeight: 1.4 }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Workload bar */}
      <div style={{ ...card, marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EDE8' }}>Today&apos;s Workload</div>
            <div style={{ fontSize: '12px', color: '#4A4540', marginTop: '2px' }}>3 mechanics × 8 hrs = 24 hrs capacity</div>
          </div>
          <div style={{ fontSize: '13px', color: '#F0EDE8', fontWeight: 600 }}>
            {stats?.todayHours ?? 0} of {SHOP_CAPACITY} hours booked
          </div>
        </div>
        <div style={{ height: '8px', background: '#1A1714', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${hoursPercent}%`,
            background: barColor, borderRadius: '4px',
            transition: 'width 0.6s ease',
          }} />
        </div>
        {hoursPercent >= 80 && (
          <div style={{ fontSize: '11px', color: '#FF4444', marginTop: '8px' }}>
            Warning: Shop is over 80% capacity today
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F0EDE8', margin: 0 }}>Recent Bookings</h2>
          <Link href="/workshop-portal/bookings" style={{ fontSize: '12px', color: '#FF9500', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1714' }}>
                {['Customer', 'Vehicle', 'Service', 'Date', 'Status', 'Created'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px 10px',
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                    color: '#3A3430', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#3A3430', fontSize: '13px' }}>
                    No bookings yet
                  </td>
                </tr>
              ) : recent.map(b => (
                <tr
                  key={b.id}
                  onClick={() => window.location.href = `/workshop-portal/bookings/${b.id}`}
                  style={{
                    borderBottom: '1px solid #1A1714', cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#161310')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 12px', color: '#F0EDE8' }}>{b.customer_name}</td>
                  <td style={{ padding: '11px 12px', color: '#9A8E82' }}>
                    {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#9A8E82', maxWidth: '160px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                      {b.service_description ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 12px', color: '#9A8E82' }}>{formatDate(b.preferred_date)}</td>
                  <td style={{ padding: '11px 12px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '11px 12px', color: '#4A4540' }}>
                    {b.created_at ? new Date(b.created_at).toLocaleDateString('en-CA') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <Link
          href="/workshop-portal/new-booking"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#FF9500', color: '#111008', textDecoration: 'none',
            padding: '11px 20px', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '3px',
          }}
        >
          <Plus size={15} />
          New Booking
        </Link>
        <Link
          href="/workshop-portal/schedule"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'transparent', color: '#9A8E82', textDecoration: 'none',
            padding: '11px 20px', fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '3px',
            border: '1px solid #2A2420',
          }}
        >
          <Calendar size={15} />
          View Schedule
        </Link>
      </div>
    </div>
  )
}
