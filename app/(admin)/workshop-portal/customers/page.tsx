'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Search, X, Users, UserPlus, Repeat, Star } from 'lucide-react'
import type { Tables } from '@/types/database.types'
import { useIsMobile } from '@/lib/hooks'

type Customer = Tables<'customers'>
type Booking = Tables<'bookings'>
type Invoice = Tables<'invoices'>

interface Row {
  customer: Customer
  visits: number
  lastVisit: string | null
  totalSpent: number
}

function getTodayEastern(): string {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString('en-US', {
    timeZone: 'America/Toronto',
  }))
  const year = easternTime.getFullYear()
  const month = String(easternTime.getMonth() + 1).padStart(2, '0')
  const day = String(easternTime.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomersPage() {
  const isMobile = useIsMobile()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: b }, { data: i }] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('invoices').select('*'),
      ])
      setCustomers(c ?? [])
      setBookings(b ?? [])
      setInvoices(i ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const rows = useMemo<Row[]>(() => {
    const bookingIdToCustomerId = new Map<string, string>()
    const customerBookings = new Map<string, Booking[]>()

    for (const b of bookings) {
      if (!b.customer_id) continue
      bookingIdToCustomerId.set(b.id, b.customer_id)
      const list = customerBookings.get(b.customer_id) ?? []
      list.push(b)
      customerBookings.set(b.customer_id, list)
    }

    const spentByCustomer = new Map<string, number>()
    for (const inv of invoices) {
      if (inv.status !== 'paid' || !inv.booking_id) continue
      const customerId = bookingIdToCustomerId.get(inv.booking_id)
      if (!customerId) continue
      spentByCustomer.set(customerId, (spentByCustomer.get(customerId) ?? 0) + inv.total)
    }

    return customers.map(customer => {
      const theirBookings = customerBookings.get(customer.id) ?? []
      const dates = theirBookings.map(b => b.preferred_date).filter((d): d is string => !!d).sort()
      return {
        customer,
        visits: theirBookings.length,
        lastVisit: dates.length ? dates[dates.length - 1] : null,
        totalSpent: spentByCustomer.get(customer.id) ?? 0,
      }
    })
  }, [customers, bookings, invoices])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.customer.name.toLowerCase().includes(q) ||
        r.customer.phone.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (!a.lastVisit && !b.lastVisit) return 0
      if (!a.lastVisit) return 1
      if (!b.lastVisit) return -1
      return b.lastVisit.localeCompare(a.lastVisit)
    })
  }, [rows, search])

  const today = getTodayEastern()
  const thisMonth = today.slice(0, 7)
  const newThisMonth = customers.filter(c => (c.created_at ?? '').startsWith(thisMonth)).length
  const returningCount = rows.filter(r => r.visits >= 2).length

  async function toggleVip(customerId: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('customers').update({ is_vip: !current, updated_at: new Date().toISOString() }).eq('id', customerId)
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, is_vip: !current } : c))
  }

  return (
    <div style={{ padding: isMobile ? 16 : 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EDE8', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: '12px', color: '#6B6560', marginTop: 4 }}>
            {filtered.length} of {customers.length} customers
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Customers', value: customers.length.toString(), icon: Users, color: '#4A9EFF' },
          { label: 'New This Month', value: newThisMonth.toString(), icon: UserPlus, color: '#28C850' },
          { label: 'Returning Customers', value: returningCount.toString(), icon: Repeat, color: '#FF9500' },
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

      {/* Search bar */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 220, flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540' }} />
            <input
              placeholder="Search by name or phone…"
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
      </div>

      {/* Table */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                {(isMobile
                  ? ['Name', 'Phone', 'Last Visit']
                  : ['Name', 'Phone', 'Email', 'Total Visits', 'Last Visit', 'Total Spent', 'VIP', 'Actions']
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
                  <td colSpan={isMobile ? 3 : 8} style={{ padding: 40, textAlign: 'center', color: '#4A4540' }}>Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isMobile ? 3 : 8} style={{ padding: 48, textAlign: 'center' }}>
                    <Users size={32} style={{ color: '#2A2420', marginBottom: 12 }} />
                    <div style={{ color: '#4A4540', fontSize: '14px' }}>No customers yet</div>
                  </td>
                </tr>
              ) : filtered.map(row => (
                <tr
                  key={row.customer.id}
                  style={{ borderTop: '1px solid #2A2420', transition: 'background 0.1s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,149,0,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => window.location.href = `/workshop-portal/customers/${row.customer.id}`}
                >
                  <td style={{ padding: '0 16px', height: 60, fontWeight: 600, color: '#F0EDE8' }}>{row.customer.name}</td>
                  <td style={{ padding: '0 16px', height: 60, color: '#9A8E82', whiteSpace: 'nowrap' }}>{row.customer.phone}</td>
                  {!isMobile && <td style={{ padding: '0 16px', height: 60, color: '#9A8E82' }}>{row.customer.email || '—'}</td>}
                  {!isMobile && <td style={{ padding: '0 16px', height: 60, color: '#F0EDE8' }}>{row.visits}</td>}
                  <td style={{ padding: '0 16px', height: 60, color: '#9A8E82', whiteSpace: 'nowrap' }}>{fmtDate(row.lastVisit)}</td>
                  {!isMobile && <td style={{ padding: '0 16px', height: 60, fontWeight: 700, color: '#F0EDE8' }}>{fmtAmount(row.totalSpent)}</td>}
                  {!isMobile && (
                    <td style={{ padding: '0 16px', height: 60 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleVip(row.customer.id, row.customer.is_vip ?? false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                        aria-label={row.customer.is_vip ? 'Remove VIP' : 'Mark VIP'}
                      >
                        <Star
                          size={16}
                          style={{ color: row.customer.is_vip ? '#FF9500' : '#3A3430' }}
                          fill={row.customer.is_vip ? '#FF9500' : 'none'}
                        />
                      </button>
                    </td>
                  )}
                  {!isMobile && (
                    <td style={{ padding: '0 16px', height: 60 }} onClick={e => e.stopPropagation()}>
                      <Link
                        href={`/workshop-portal/customers/${row.customer.id}`}
                        style={{
                          fontSize: '12px', color: '#FF9500', textDecoration: 'none',
                          border: '1px solid rgba(255,149,0,0.3)', borderRadius: 6,
                          padding: '4px 10px', fontWeight: 500,
                        }}
                      >
                        View
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
