'use client'

import { BarChart2 } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

export interface DailyBreakdownRow {
  date: string
  jobsCompleted: number
  revenue: number
  invoicesSent: number
}

interface Props {
  rows: DailyBreakdownRow[]
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function dayName(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'short' })
}

const COLUMNS = ['Date', 'Day', 'Jobs Completed', 'Revenue', 'Invoices Sent']
const MOBILE_COLUMNS = ['Date', 'Jobs Completed', 'Revenue']

export function DailyBreakdownTable({ rows }: Props) {
  const isMobile = useIsMobile()
  const columns = isMobile ? MOBILE_COLUMNS : COLUMNS
  const totals = rows.reduce((acc, r) => ({
    jobsCompleted: acc.jobsCompleted + r.jobsCompleted,
    revenue: acc.revenue + r.revenue,
    invoicesSent: acc.invoicesSent + r.invoicesSent,
  }), { jobsCompleted: 0, revenue: 0, invoicesSent: 0 })

  return (
    <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '20px 24px 16px' }}>
        <div style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
          color: '#F0EDE8', textTransform: 'uppercase',
        }}>
          DAILY BREAKDOWN
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <BarChart2 size={28} style={{ color: '#2A2420', marginBottom: 10 }} />
          <div style={{ color: '#4A4540', fontSize: '13px' }}>No activity for this period</div>
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
                      textAlign: (isMobile ? i < 1 : i < 2) ? 'left' : 'right', padding: '10px 16px',
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
              {rows.map(r => (
                <tr key={r.date} style={{ borderTop: '1px solid #1E1C18' }}>
                  <td style={{ padding: '12px 16px', color: '#F0EDE8', whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                  {!isMobile && <td style={{ padding: '12px 16px', color: '#9A8E82' }}>{dayName(r.date)}</td>}
                  <td style={{ padding: '12px 16px', color: '#9A8E82', textAlign: 'right' }}>{r.jobsCompleted}</td>
                  <td style={{ padding: '12px 16px', color: '#F0EDE8', fontWeight: 600, textAlign: 'right' }}>{fmtAmount(r.revenue)}</td>
                  {!isMobile && <td style={{ padding: '12px 16px', color: '#9A8E82', textAlign: 'right' }}>{r.invoicesSent}</td>}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #2A2420', background: '#141210' }}>
                <td colSpan={isMobile ? 1 : 2} style={{
                  padding: '12px 16px',
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
                  color: '#F0EDE8', textTransform: 'uppercase',
                }}>
                  Total
                </td>
                <td style={{ padding: '12px 16px', color: '#F0EDE8', fontWeight: 700, textAlign: 'right' }}>{totals.jobsCompleted}</td>
                <td style={{ padding: '12px 16px', color: '#FF9500', fontWeight: 700, textAlign: 'right' }}>{fmtAmount(totals.revenue)}</td>
                {!isMobile && <td style={{ padding: '12px 16px', color: '#F0EDE8', fontWeight: 700, textAlign: 'right' }}>{totals.invoicesSent}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
