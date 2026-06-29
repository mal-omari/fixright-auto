'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Booking = Tables<'bookings'>
type SortKey = 'customer_name' | 'preferred_date' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

const STATUSES = ['All', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']
const PAGE_SIZE = 20

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

const input: React.CSSProperties = {
  background: '#111008', border: '1px solid #1F1C17',
  borderRadius: '3px', color: '#F0EDE8', padding: '9px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
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
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false })
      setBookings(data ?? [])
      setLoading(false)
    }
    load()
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
    if (statusFilter !== 'All') {
      rows = rows.filter(b => b.status === statusFilter)
    }
    if (dateFrom) {
      rows = rows.filter(b => b.preferred_date && b.preferred_date >= dateFrom)
    }
    if (dateTo) {
      rows = rows.filter(b => b.preferred_date && b.preferred_date <= dateTo)
    }
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

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: '#2A2420', marginLeft: '4px' }}>↕</span>
    return sortDir === 'asc'
      ? <ChevronUp size={12} style={{ marginLeft: '4px', display: 'inline' }} />
      : <ChevronDown size={12} style={{ marginLeft: '4px', display: 'inline' }} />
  }

  const thStyle: React.CSSProperties = {
    textAlign: 'left', padding: '9px 14px',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
    color: '#3A3430', textTransform: 'uppercase',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>Bookings</h1>
          <p style={{ fontSize: '13px', color: '#4A4540', marginTop: '4px' }}>
            {filtered.length} {filtered.length === 1 ? 'booking' : 'bookings'} found
          </p>
        </div>
        <Link
          href="/workshop-portal/new-booking"
          style={{
            background: '#FF9500', color: '#111008', textDecoration: 'none',
            padding: '10px 18px', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px',
          }}
        >
          + New Booking
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        background: '#111008', border: '1px solid #1F1C17',
        borderRadius: '4px', padding: '16px 20px', marginBottom: '16px',
        display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4A4540' }} />
          <input
            placeholder="Search name, phone, vehicle…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ ...input, paddingLeft: '32px', width: '100%' }}
          />
        </div>

        {/* Status */}
        <div style={{ position: 'relative' }}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            style={{ ...input, paddingRight: '28px', cursor: 'pointer', appearance: 'none' as const }}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#4A4540', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
        </div>

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          style={{ ...input, width: '140px' }} />
        <span style={{ color: '#3A3430', fontSize: '12px' }}>to</span>
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
          style={{ ...input, width: '140px' }} />

        {(search || statusFilter !== 'All' || dateFrom || dateTo) && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: '1px solid #2A2420',
              color: '#4A4540', padding: '8px 12px', fontSize: '12px',
              borderRadius: '3px', cursor: 'pointer',
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#111008', border: '1px solid #1F1C17', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ borderBottom: '1px solid #1A1714' }}>
              <tr>
                <th style={{ ...thStyle, width: '32px', cursor: 'default' }}>#</th>
                <th style={thStyle} onClick={() => toggleSort('customer_name')}>
                  Customer <SortIcon k="customer_name" />
                </th>
                <th style={{ ...thStyle, cursor: 'default' }}>Phone</th>
                <th style={{ ...thStyle, cursor: 'default' }}>Vehicle</th>
                <th style={{ ...thStyle, cursor: 'default' }}>Service</th>
                <th style={thStyle} onClick={() => toggleSort('preferred_date')}>
                  Date <SortIcon k="preferred_date" />
                </th>
                <th style={thStyle} onClick={() => toggleSort('status')}>
                  Status <SortIcon k="status" />
                </th>
                <th style={{ ...thStyle, cursor: 'default' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#3A3430' }}>Loading…</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ color: '#3A3430', fontSize: '14px' }}>No bookings found</div>
                    <div style={{ color: '#2A2420', fontSize: '12px', marginTop: '6px' }}>Try adjusting your filters</div>
                  </td>
                </tr>
              ) : paginated.map((b, idx) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid #161310', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#161310')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 14px', color: '#3A3430', fontSize: '11px' }}>
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td style={{ padding: '11px 14px', color: '#F0EDE8', fontWeight: 500 }}>{b.customer_name}</td>
                  <td style={{ padding: '11px 14px', color: '#9A8E82' }}>{b.customer_phone}</td>
                  <td style={{ padding: '11px 14px', color: '#9A8E82' }}>
                    {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td style={{ padding: '11px 14px', color: '#9A8E82', maxWidth: '140px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.service_description ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: '#9A8E82', whiteSpace: 'nowrap' }}>{formatDate(b.preferred_date)}</td>
                  <td style={{ padding: '11px 14px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '11px 14px' }}>
                    <Link
                      href={`/workshop-portal/bookings/${b.id}`}
                      style={{
                        fontSize: '12px', color: '#FF9500', textDecoration: 'none',
                        border: '1px solid rgba(255,149,0,0.3)', borderRadius: '3px',
                        padding: '4px 10px', display: 'inline-block',
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px', borderTop: '1px solid #1A1714',
            fontSize: '12px', color: '#4A4540',
          }}>
            <span>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  background: 'none', border: '1px solid #2A2420', color: page === 1 ? '#2A2420' : '#9A8E82',
                  padding: '6px 12px', borderRadius: '3px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '12px',
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  background: 'none', border: '1px solid #2A2420', color: page === totalPages ? '#2A2420' : '#9A8E82',
                  padding: '6px 12px', borderRadius: '3px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '12px',
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
