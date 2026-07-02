'use client'

import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2 } from 'lucide-react'

export interface DailyRevenuePoint {
  date: string
  revenue: number
}

interface Props {
  data: DailyRevenuePoint[]
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtAxisDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function ChartTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; payload: DailyRevenuePoint }>
}) {
  if (!active || !payload || !payload.length) return null
  const point = payload[0].payload
  return (
    <div style={{
      background: '#141210', border: '1px solid #3A3430', borderRadius: 6,
      padding: '8px 12px', fontSize: '12px', color: '#F0EDE8',
    }}>
      <div style={{ color: '#9A8E82', marginBottom: 2 }}>{fmtAxisDate(point.date)}</div>
      <div style={{ fontWeight: 600 }}>{fmtAmount(point.revenue)}</div>
    </div>
  )
}

export function RevenueOverTimeChart({ data }: Props) {
  const hasData = data.some(d => d.revenue > 0)

  return (
    <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: 24, marginBottom: 24 }}>
      <div style={{
        fontFamily: 'var(--font-heading), sans-serif',
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
        color: '#6B6560', textTransform: 'uppercase', marginBottom: 20,
      }}>
        REVENUE OVER TIME
      </div>

      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueOverTimeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9500" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#FF9500" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#2A2420" />
            <XAxis
              dataKey="date"
              tickFormatter={fmtAxisDate}
              tick={{ fill: '#9A8E82', fontSize: 11 }}
              axisLine={{ stroke: '#2A2420' }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={v => '$' + v.toLocaleString()}
              tick={{ fill: '#9A8E82', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip cursor={{ stroke: '#FF9500', strokeWidth: 1 }} content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF9500"
              strokeWidth={2}
              fill="url(#revenueOverTimeFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 0', color: '#4A4540',
        }}>
          <BarChart2 size={28} style={{ color: '#2A2420', marginBottom: 10 }} />
          <div style={{ fontSize: '13px' }}>No revenue data for this period</div>
        </div>
      )}
    </div>
  )
}
