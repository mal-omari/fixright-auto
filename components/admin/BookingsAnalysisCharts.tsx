'use client'

import type { CSSProperties } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarChart2 } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

export interface DayOfWeekCount {
  day: string
  count: number
}

export interface StatusCounts {
  pending: number
  confirmed: number
  in_progress: number
  completed: number
  cancelled: number
}

interface Props {
  byDay: DayOfWeekCount[]
  byStatus: StatusCounts
}

const STATUS_META: { key: keyof StatusCounts; label: string; color: string }[] = [
  { key: 'pending', label: 'Pending', color: '#FFD84D' },
  { key: 'confirmed', label: 'Confirmed', color: '#60A5FA' },
  { key: 'in_progress', label: 'In Progress', color: '#FF9500' },
  { key: 'completed', label: 'Completed', color: '#4ADE80' },
  { key: 'cancelled', label: 'Cancelled', color: '#EF4444' },
]

const CARD_STYLE: CSSProperties = {
  background: '#1E1C18',
  border: '1px solid #2A2420',
  borderRadius: 12,
  padding: 24,
}

const TITLE_STYLE: CSSProperties = {
  fontFamily: 'var(--font-heading), sans-serif',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.15em',
  color: '#6B6560',
  textTransform: 'uppercase',
  marginBottom: 20,
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 0', color: '#4A4540',
    }}>
      <BarChart2 size={28} style={{ color: '#2A2420', marginBottom: 10 }} />
      <div style={{ fontSize: '13px' }}>No bookings for this period</div>
    </div>
  )
}

function CountTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: '#141210', border: '1px solid #3A3430', borderRadius: 6,
      padding: '8px 12px', fontSize: '12px', color: '#F0EDE8',
    }}>
      {label && <div style={{ color: '#9A8E82', marginBottom: 2 }}>{label}</div>}
      <div style={{ fontWeight: 600 }}>{payload[0].value} booking{payload[0].value === 1 ? '' : 's'}</div>
    </div>
  )
}

export function BookingsAnalysisCharts({ byDay, byStatus }: Props) {
  const isMobile = useIsMobile()
  const hasDayData = byDay.some(d => d.count > 0)
  const maxCount = Math.max(0, ...byDay.map(d => d.count))

  const statusData = STATUS_META.map(meta => ({ ...meta, count: byStatus[meta.key] }))
  const hasStatusData = statusData.some(d => d.count > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {/* Bookings per day of week */}
      <div style={CARD_STYLE}>
        <div style={TITLE_STYLE}>Bookings Per Day of Week</div>
        {hasDayData ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDay} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#2A2420" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#9A8E82', fontSize: 12 }}
                axisLine={{ stroke: '#2A2420' }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(255,149,0,0.06)' }} content={<CountTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48} label={{
                position: 'top', fill: '#F0EDE8', fontSize: 12, fontWeight: 600,
              }}>
                {byDay.map(entry => (
                  <Cell key={entry.day} fill={entry.count === maxCount && maxCount > 0 ? '#FF9500' : '#4A4540'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </div>

      {/* Bookings by status */}
      <div style={CARD_STYLE}>
        <div style={TITLE_STYLE}>Bookings by Status</div>
        {hasStatusData ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={statusData}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="#2A2420" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                width={90}
                tick={{ fill: '#9A8E82', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: 'rgba(255,149,0,0.06)' }} content={<CountTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20} label={{
                position: 'right', fill: '#F0EDE8', fontSize: 12, fontWeight: 600,
              }}>
                {statusData.map(entry => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState />}
      </div>
    </div>
  )
}
