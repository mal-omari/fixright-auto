'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Search, X, Plus, TrendingUp, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import type { Tables } from '@/types/database.types'
import { useIsMobile } from '@/lib/hooks'

type Invoice = Tables<'invoices'>

const STATUS_PILLS = [
  { key: 'All',     label: 'All',     color: '#9A8E82' },
  { key: 'draft',   label: 'Draft',   color: '#6B6560' },
  { key: 'sent',    label: 'Sent',    color: '#4A9EFF' },
  { key: 'paid',    label: 'Paid',    color: '#28C850' },
  { key: 'overdue', label: 'Overdue', color: '#FF4444' },
]

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  draft:   { color: '#9A8E82', bg: 'rgba(155,142,130,0.15)' },
  sent:    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)' },
  paid:    { color: '#28C850', bg: 'rgba(40,200,80,0.15)' },
  overdue: { color: '#FF4444', bg: 'rgba(255,68,68,0.15)' },
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InvoicesPage() {
  const isMobile = useIsMobile()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    createClient()
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvoices(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let rows = invoices
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(inv =>
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.customer_name ?? '').toLowerCase().includes(q) ||
        (inv.vehicle_make ?? '').toLowerCase().includes(q) ||
        (inv.vehicle_model ?? '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'All') rows = rows.filter(inv => inv.status === statusFilter)
    return rows
  }, [invoices, search, statusFilter])

  // Summary metrics
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalOutstanding = invoices
    .filter(inv => ['draft', 'sent', 'overdue'].includes(inv.status))
    .reduce((s, inv) => s + inv.total, 0)

  const totalPaidThisMonth = invoices
    .filter(inv => inv.status === 'paid' && inv.paid_date && inv.paid_date.startsWith(thisMonth))
    .reduce((s, inv) => s + inv.total, 0)

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length

  async function markPaid(id: string) {
    const paidDate = new Date().toISOString().split('T')[0]
    await createClient().from('invoices').update({ status: 'paid', paid_date: paidDate }).eq('id', id)
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'paid', paid_date: paidDate } : inv))
  }

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EDE8', margin: 0 }}>Invoices</h1>
          <p style={{ fontSize: '12px', color: '#6B6560', marginTop: 4 }}>
            {filtered.length} of {invoices.length} invoices
          </p>
        </div>
        <Link
          href="/workshop-portal/bookings"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: '#9A8E82', textDecoration: 'none',
            padding: '10px 18px', fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8,
            border: '1px solid #2A2420',
          }}
        >
          <Plus size={14} /> Create via Booking
        </Link>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Outstanding', value: fmtAmount(totalOutstanding), icon: TrendingUp, color: '#FFC107' },
          { label: 'Paid This Month', value: fmtAmount(totalPaidThisMonth), icon: CheckCircle, color: '#28C850' },
          { label: 'Overdue', value: overdueCount.toString(), icon: AlertCircle, color: '#FF4444' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B6560', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#F0EDE8', marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter bar */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, alignItems: isMobile ? 'stretch' : 'center', marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 220, flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540' }} />
            <input
              placeholder="Search invoice #, customer, vehicle…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#141210', border: '1px solid #2A2420',
                borderRadius: 8, color: '#F0EDE8', padding: '9px 12px 9px 32px',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '100%',
              }}
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: '#6B6560', padding: '8px 12px', fontSize: '12px', borderRadius: 8, cursor: 'pointer' }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_PILLS.map(({ key, label, color }) => {
            const active = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '5px 14px', borderRadius: 20,
                  fontSize: '12px', fontWeight: active ? 600 : 400,
                  background: active ? `${color}20` : 'transparent',
                  border: `1px solid ${active ? color : '#2A2420'}`,
                  color: active ? color : '#6B6560',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                {(isMobile
                  ? ['Invoice #', 'Customer', 'Amount', 'Status']
                  : ['Invoice #', 'Customer', 'Vehicle', 'Date', 'Due Date', 'Amount', 'Status', 'Actions']
                ).map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left', padding: '11px 16px',
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
              {loading ? (
                <tr>
                  <td colSpan={isMobile ? 4 : 8} style={{ padding: 40, textAlign: 'center', color: '#4A4540' }}>Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isMobile ? 4 : 8} style={{ padding: 48, textAlign: 'center' }}>
                    <DollarSign size={32} style={{ color: '#2A2420', marginBottom: 12 }} />
                    <div style={{ color: '#4A4540', fontSize: '14px' }}>No invoices found</div>
                    <div style={{ color: '#3A3430', fontSize: '12px', marginTop: 6 }}>Create invoices from completed bookings</div>
                  </td>
                </tr>
              ) : filtered.map(inv => {
                const cfg = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft
                return (
                  <tr
                    key={inv.id}
                    style={{ borderTop: '1px solid #2A2420', transition: 'background 0.1s', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,149,0,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => window.location.href = `/workshop-portal/invoices/${inv.id}`}
                  >
                    <td style={{ padding: '0 16px', height: 60 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#FF9500', fontFamily: 'monospace' }}>
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', height: 60 }}>
                      <div style={{ fontWeight: 600, color: '#F0EDE8' }}>{inv.customer_name ?? '—'}</div>
                      {inv.customer_phone && <div style={{ fontSize: '11px', color: '#6B6560', marginTop: 2 }}>{inv.customer_phone}</div>}
                    </td>
                    {!isMobile && (
                      <td style={{ padding: '0 16px', height: 60, color: '#9A8E82', whiteSpace: 'nowrap' }}>
                        {[inv.vehicle_year, inv.vehicle_make, inv.vehicle_model].filter(Boolean).join(' ') || '—'}
                      </td>
                    )}
                    {!isMobile && (
                      <td style={{ padding: '0 16px', height: 60, color: '#9A8E82', whiteSpace: 'nowrap' }}>
                        {fmtDate(inv.created_at.split('T')[0])}
                      </td>
                    )}
                    {!isMobile && (
                      <td style={{ padding: '0 16px', height: 60, whiteSpace: 'nowrap' }}>
                        <span style={{ color: inv.status === 'overdue' ? '#FF4444' : '#9A8E82' }}>
                          {fmtDate(inv.due_date)}
                        </span>
                      </td>
                    )}
                    <td style={{ padding: '0 16px', height: 60 }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#F0EDE8' }}>
                        {fmtAmount(inv.total)}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', height: 60 }}>
                      <span
                        style={{
                          background: cfg.bg, color: cfg.color,
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: '11px', fontWeight: 600,
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                    {!isMobile && (
                      <td style={{ padding: '0 16px', height: 60 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link
                            href={`/workshop-portal/invoices/${inv.id}`}
                            style={{
                              fontSize: '12px', color: '#FF9500', textDecoration: 'none',
                              border: '1px solid rgba(255,149,0,0.3)', borderRadius: 6,
                              padding: '4px 10px', fontWeight: 500,
                            }}
                          >
                            View
                          </Link>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markPaid(inv.id)}
                              style={{
                                fontSize: '12px', color: '#28C850',
                                border: '1px solid rgba(40,200,80,0.3)', borderRadius: 6,
                                padding: '4px 10px', fontWeight: 500,
                                background: 'none', cursor: 'pointer',
                              }}
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
