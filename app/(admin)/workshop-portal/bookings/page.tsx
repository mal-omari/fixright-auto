'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Search, X, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>
type SortKey = 'customer_name' | 'preferred_date' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

const STATUS_PILLS = [
  { key: 'All',         label: 'All',         color: '#9A8E82' },
  { key: 'pending',     label: 'Pending',     color: '#FFC107' },
  { key: 'confirmed',   label: 'Confirmed',   color: '#4A9EFF' },
  { key: 'in_progress', label: 'In Progress', color: '#FF9500' },
  { key: 'completed',   label: 'Completed',   color: '#28C850' },
  { key: 'cancelled',   label: 'Cancelled',   color: '#FF4444' },
]

const PAGE_SIZE = 20

function formatDate(d: string | null) {
  if (!d) return '—'
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    createClient()
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let rows = bookings
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(b =>
        b.customer_name.toLowerCase().includes(q) ||
        (b.customer_phone ?? '').toLowerCase().includes(q) ||
        (b.vehicle_make ?? '').toLowerCase().includes(q) ||
        (b.vehicle_model ?? '').toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'All') rows = rows.filter(b => b.status === statusFilter)
    if (dateFrom) rows = rows.filter(b => b.preferred_date && b.preferred_date >= dateFrom)
    if (dateTo) rows = rows.filter(b => b.preferred_date && b.preferred_date <= dateTo)

    return [...rows].sort((a, b) => {
      const av = (a[sortKey] ?? '') as string
      const bv = (b[sortKey] ?? '') as string
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [bookings, search, statusFilter, dateFrom, dateTo, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  function clearFilters() {
    setSearch(''); setStatusFilter('All'); setDateFrom(''); setDateTo(''); setPage(1)
  }

  const hasFilters = search || statusFilter !== 'All' || dateFrom || dateTo

  const inputStyle: React.CSSProperties = {
    background: '#141210', border: '1px solid #2A2420',
    borderRadius: 8, color: '#F0EDE8', padding: '9px 12px',
    fontSize: '13px', outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '20px', fontWeight: 600, color: '#F0EDE8', margin: 0, letterSpacing: '0.05em',
          }}>
            ALL BOOKINGS
          </h1>
          <p style={{ fontSize: '12px', color: '#6B6560', marginTop: 4 }}>
            Showing {filtered.length} of {bookings.length} bookings
          </p>
        </div>
        <Link
          href="/workshop-portal/new-booking"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FF9500', color: '#0D0B08', textDecoration: 'none',
            padding: '10px 18px',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8,
          }}
        >
          <Plus size={14} /> New Booking
        </Link>
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: '#1E1C18', border: '1px solid #2A2420',
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ position: 'relative', minWidth: 240, flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540' }} />
            <input
              placeholder="Search name, phone, vehicle…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ ...inputStyle, paddingLeft: 32, width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              style={{ ...inputStyle, width: 148 }}
            />
            <span style={{ color: '#3A3430', fontSize: '12px' }}>—</span>
            <input
              type="date" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              style={{ ...inputStyle, width: 148 }}
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: '1px solid #2A2420',
                color: '#6B6560', padding: '8px 12px', fontSize: '12px',
                borderRadius: 8, cursor: 'pointer',
              }}
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
                onClick={() => { setStatusFilter(key); setPage(1) }}
                style={{
                  padding: '5px 14px', borderRadius: 20,
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '11px', fontWeight: active ? 600 : 500,
                  background: active ? `${color}20` : 'transparent',
                  border: `1px solid ${active ? color : '#2A2420'}`,
                  color: active ? color : '#6B6560',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
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
                {[
                  { label: 'Customer', key: 'customer_name' as SortKey, sortable: true },
                  { label: 'Vehicle', key: null, sortable: false },
                  { label: 'Service', key: null, sortable: false },
                  { label: 'Date', key: 'preferred_date' as SortKey, sortable: true },
                  { label: 'Status', key: 'status' as SortKey, sortable: true },
                  { label: 'Actions', key: null, sortable: false },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={col.sortable && col.key ? () => toggleSort(col.key!) : undefined}
                    style={{
                      textAlign: 'left', padding: '11px 16px',
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                      color: '#6B6560', textTransform: 'uppercase',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}
                    {col.sortable && col.key && sortKey === col.key && (
                      sortDir === 'asc'
                        ? <ChevronUp size={11} style={{ marginLeft: 4, display: 'inline', verticalAlign: 'middle' }} />
                        : <ChevronDown size={11} style={{ marginLeft: 4, display: 'inline', verticalAlign: 'middle' }} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#4A4540' }}>Loading…</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ color: '#4A4540', fontSize: '14px' }}>No bookings found</div>
                    <div style={{ color: '#3A3430', fontSize: '12px', marginTop: 6 }}>Try adjusting your filters</div>
                  </td>
                </tr>
              ) : paginated.map((b, rowIdx) => (
                <tr
                  key={b.id}
                  style={{
                    borderTop: '1px solid #2A2420',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
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
                  <td style={{ padding: '0 16px', height: 64 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#F0EDE8' }}>{b.customer_name}</div>
                    {b.customer_phone && (
                      <div style={{ fontSize: '12px', color: '#6B6560', marginTop: 2 }}>{b.customer_phone}</div>
                    )}
                  </td>
                  <td style={{ padding: '0 16px', height: 64, color: '#9A8E82', whiteSpace: 'nowrap' }}>
                    {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={{ padding: '0 16px', height: 64, maxWidth: 160 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#9A8E82' }}>
                      {b.service_description ?? '—'}
                    </span>
                    {b.estimated_hours && (
                      <span style={{
                        display: 'inline-block', marginTop: 3,
                        background: 'rgba(255,149,0,0.1)', color: '#FF9500',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                      }}>
                        {b.estimated_hours}h
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0 16px', height: 64 }}>
                    <div style={{ color: '#9A8E82', whiteSpace: 'nowrap' }}>{formatDate(b.preferred_date)}</div>
                    {b.preferred_time && (
                      <div style={{ fontSize: '11px', color: '#4A4540', marginTop: 2, textTransform: 'capitalize' }}>
                        {b.preferred_time}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0 16px', height: 64 }}>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: '0 16px', height: 64 }} onClick={e => e.stopPropagation()}>
                    <Link
                      href={`/workshop-portal/bookings/${b.id}`}
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: '11px', color: '#FF9500', textDecoration: 'none',
                        border: '1px solid rgba(255,149,0,0.3)', borderRadius: 6,
                        padding: '5px 12px', display: 'inline-block', fontWeight: 600,
                        letterSpacing: '0.06em',
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: '1px solid #2A2420',
              fontSize: '12px', color: '#6B6560',
            }}
          >
            <span>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: 'none', border: '1px solid #2A2420',
                  color: page === 1 ? '#2A2420' : '#9A8E82',
                  padding: '6px 12px', borderRadius: 6, cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '12px',
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: 'none', border: '1px solid #2A2420',
                  color: page === totalPages ? '#2A2420' : '#9A8E82',
                  padding: '6px 12px', borderRadius: 6, cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
