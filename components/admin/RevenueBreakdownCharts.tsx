'use client'

import type { CSSProperties } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart2 } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

export interface ServiceRevenueSlice {
  name: string
  value: number
}

export interface LabourPartsSplit {
  labour: number
  parts: number
}

interface Props {
  serviceRevenue: ServiceRevenueSlice[]
  labourParts: LabourPartsSplit
}

const SERVICE_COLORS = ['#FF9500', '#E8C547', '#FF7A1A', '#D4A017', '#C77D00', '#B8860B']
const OTHER_COLOR = '#6B6560'

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

function truncateLabel(name: string, isMobile: boolean) {
  if (!isMobile || name.length <= 12) return name
  return name.slice(0, 12) + '…'
}

function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 0', color: '#4A4540',
    }}>
      <BarChart2 size={28} style={{ color: '#2A2420', marginBottom: 10 }} />
      <div style={{ fontSize: '13px' }}>No revenue data for this period</div>
    </div>
  )
}

function SliceTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: '#141210', border: '1px solid #3A3430', borderRadius: 6,
      padding: '8px 12px', fontSize: '12px', color: '#F0EDE8',
    }}>
      <div style={{ color: '#9A8E82', marginBottom: 2 }}>{payload[0].name}</div>
      <div style={{ fontWeight: 600 }}>{fmtAmount(payload[0].value)}</div>
    </div>
  )
}

export function RevenueBreakdownCharts({ serviceRevenue, labourParts }: Props) {
  const isMobile = useIsMobile()
  const serviceTotal = serviceRevenue.reduce((s, d) => s + d.value, 0)
  const lpTotal = labourParts.labour + labourParts.parts
  const labourPct = lpTotal > 0 ? Math.round((labourParts.labour / lpTotal) * 100) : 0
  const partsPct = lpTotal > 0 ? 100 - labourPct : 0
  const donutHeight = isMobile ? 180 : 220

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
      {/* Revenue by Service Type */}
      <div style={CARD_STYLE}>
        <div style={TITLE_STYLE}>Revenue by Service Type</div>
        {serviceTotal > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: '55%', flexShrink: 0, maxWidth: isMobile ? 180 : undefined }}>
              <ResponsiveContainer width="100%" height={donutHeight}>
                <PieChart>
                  <Pie
                    data={serviceRevenue}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isMobile ? 45 : 55}
                    outerRadius={isMobile ? 75 : 90}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {serviceRevenue.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={entry.name === 'Other' ? OTHER_COLOR : SERVICE_COLORS[i % SERVICE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<SliceTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
              {serviceRevenue.map((entry, i) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px' }}>
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    background: entry.name === 'Other' ? OTHER_COLOR : SERVICE_COLORS[i % SERVICE_COLORS.length],
                  }} />
                  <span style={{
                    color: '#9A8E82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {truncateLabel(entry.name, isMobile)}
                  </span>
                  <span style={{ color: '#F0EDE8', fontWeight: 600, flexShrink: 0 }}>
                    {Math.round((entry.value / serviceTotal) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : <EmptyState />}
      </div>

      {/* Labour vs Parts Split */}
      <div style={CARD_STYLE}>
        <div style={TITLE_STYLE}>Labour vs Parts Split</div>
        {lpTotal > 0 ? (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={donutHeight}>
              <PieChart>
                <Pie
                  data={[{ name: 'Labour', value: labourParts.labour }, { name: 'Parts', value: labourParts.parts }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="none"
                >
                  <Cell fill="#FF9500" />
                  <Cell fill="#E8C547" />
                </Pie>
                <Tooltip content={<SliceTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '18px', fontWeight: 700, color: '#FF9500' }}>
                {labourPct}%
              </div>
              <div style={{ fontSize: '10px', color: '#6B6560', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '2px 0' }}>
                Labour
              </div>
              <div style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '18px', fontWeight: 700, color: '#E8C547', marginTop: 6 }}>
                {partsPct}%
              </div>
              <div style={{ fontSize: '10px', color: '#6B6560', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                Parts
              </div>
            </div>
          </div>
        ) : <EmptyState />}
      </div>
    </div>
  )
}
