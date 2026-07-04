'use client'

import { BarChart2 } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

export interface ServiceStat {
  name: string
  bookings: number
  completed: number
  revenue: number
  avgJobValue: number
}

interface Props {
  services: ServiceStat[]
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const COLUMNS = ['Service Name', 'Bookings', 'Completed', 'Revenue', 'Avg Job Value']
const MOBILE_COLUMNS = ['Service Name', 'Bookings', 'Revenue']

export function TopServicesTable({ services }: Props) {
  const isMobile = useIsMobile()
  const columns = isMobile ? MOBILE_COLUMNS : COLUMNS
  return (
    <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '20px 24px 16px' }}>
        <div style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
          color: '#F0EDE8', textTransform: 'uppercase',
        }}>
          TOP SERVICES
        </div>
      </div>

      {services.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <BarChart2 size={28} style={{ color: '#2A2420', marginBottom: 10 }} />
          <div style={{ color: '#4A4540', fontSize: '13px' }}>No service data for this period</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                {columns.map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i === 0 ? 'left' : 'right', padding: '10px 16px',
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
              {services.map((s, i) => (
                <tr
                  key={s.name}
                  style={{
                    borderTop: '1px solid #1E1C18',
                    background: i === 0 ? 'rgba(255,149,0,0.06)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '14px 16px', color: '#F0EDE8', fontWeight: i === 0 ? 600 : 500 }}>
                    {s.name}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8E82', textAlign: 'right' }}>{s.bookings}</td>
                  {!isMobile && (
                    <td style={{ padding: '14px 16px', color: '#9A8E82', textAlign: 'right' }}>{s.completed}</td>
                  )}
                  <td style={{
                    padding: '14px 16px', textAlign: 'right', fontWeight: 600,
                    color: i === 0 ? '#FF9500' : '#F0EDE8',
                  }}>
                    {fmtAmount(s.revenue)}
                  </td>
                  {!isMobile && (
                    <td style={{ padding: '14px 16px', color: '#9A8E82', textAlign: 'right' }}>
                      {fmtAmount(s.avgJobValue)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
