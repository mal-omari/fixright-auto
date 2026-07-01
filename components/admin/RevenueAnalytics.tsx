'use client'

import type { CSSProperties } from 'react'
import { BarChart2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts'

export interface MonthRevenue {
  thisMonth: number
  lastMonth: number
}

export interface ServiceCount {
  name: string
  count: number
}

export interface DayCount {
  day: string
  count: number
}

interface RevenueAnalyticsProps {
  revenue: MonthRevenue
  topServices: ServiceCount[]
  busiestDays: DayCount[]
  outstandingCount: number
  outstandingTotal: number
  avgJobValue: number
}

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

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 0', color: '#4A4540',
    }}>
      <BarChart2 size={28} style={{ color: '#2A2420', marginBottom: 10 }} />
      <div style={{ fontSize: '13px' }}>No data yet — bookings will appear here</div>
    </div>
  )
}

function ChartTooltip({ active, payload, label, formatter }: {
  active?: boolean
  payload?: Array<{ value: number; payload?: Record<string, unknown> }>
  label?: string
  formatter?: (v: number) => string
}) {
  if (!active || !payload || !payload.length) return null
  const value = payload[0].value
  return (
    <div style={{
      background: '#141210', border: '1px solid #3A3430', borderRadius: 6,
      padding: '8px 12px', fontSize: '12px', color: '#F0EDE8',
    }}>
      {label && <div style={{ color: '#9A8E82', marginBottom: 2 }}>{label}</div>}
      <div style={{ fontWeight: 600 }}>{formatter ? formatter(value) : value}</div>
    </div>
  )
}

export function RevenueAnalytics({
  revenue, topServices, busiestDays, outstandingCount, outstandingTotal, avgJobValue,
}: RevenueAnalyticsProps) {
  const revenueData = [
    { label: 'This Month', value: revenue.thisMonth, fill: '#FF9500' },
    { label: 'Last Month', value: revenue.lastMonth, fill: '#4A4540' },
  ]
  const hasRevenue = revenue.thisMonth > 0 || revenue.lastMonth > 0
  const hasServices = topServices.length > 0
  const hasDays = busiestDays.some(d => d.count > 0)

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: 'var(--font-heading), sans-serif',
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
        color: '#F0EDE8', textTransform: 'uppercase', marginBottom: 12,
      }}>
        ANALYTICS
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <div style={CARD_STYLE}>
          <div style={TITLE_STYLE}>Revenue This Month</div>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '32px', fontWeight: 700, color: '#FF9500', lineHeight: 1,
          }}>
            {fmtAmount(revenue.thisMonth)}
          </div>
        </div>
        <div style={CARD_STYLE}>
          <div style={TITLE_STYLE}>Outstanding Invoices</div>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '32px', fontWeight: 700, color: '#F0EDE8', lineHeight: 1,
          }}>
            {outstandingCount}
          </div>
          <div style={{ fontSize: '13px', color: '#9A8E82', marginTop: 6 }}>
            {fmtAmount(outstandingTotal)} total
          </div>
        </div>
        <div style={CARD_STYLE}>
          <div style={TITLE_STYLE}>Avg Job Value</div>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '32px', fontWeight: 700, color: '#F0EDE8', lineHeight: 1,
          }}>
            {fmtAmount(avgJobValue)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={CARD_STYLE}>
          <div style={TITLE_STYLE}>Revenue vs Last Month</div>
          {hasRevenue ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#2A2420" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#9A8E82', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2420' }}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,149,0,0.06)' }}
                  content={<ChartTooltip formatter={fmtAmount} />}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={64} label={{
                  position: 'top', fill: '#F0EDE8', fontSize: 12, fontWeight: 600,
                  formatter: (v: string | number | boolean | null | undefined) => fmtAmount(Number(v ?? 0)),
                }}>
                  {revenueData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>

        <div style={CARD_STYLE}>
          <div style={TITLE_STYLE}>Top Services This Month</div>
          {hasServices ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topServices}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#2A2420" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fill: '#9A8E82', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: 'rgba(255,149,0,0.06)' }} content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#FF9500" radius={[0, 4, 4, 0]} maxBarSize={20} label={{
                  position: 'right', fill: '#F0EDE8', fontSize: 12, fontWeight: 600,
                }} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>

        <div style={CARD_STYLE}>
          <div style={TITLE_STYLE}>Busiest Days</div>
          {hasDays ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={busiestDays} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="busiestDaysFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF9500" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#FF9500" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#2A2420" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#9A8E82', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2420' }}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip cursor={{ stroke: '#FF9500', strokeWidth: 1 }} content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#FF9500"
                  strokeWidth={2}
                  fill="url(#busiestDaysFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </div>
      </div>
    </div>
  )
}
