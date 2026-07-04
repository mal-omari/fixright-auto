'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { StatCard } from '@/components/admin/StatCard'
import { AnalyticsDateFilter } from '@/components/admin/AnalyticsDateFilter'
import type { PresetKey } from '@/components/admin/AnalyticsDateFilter'
import { RevenueOverTimeChart } from '@/components/admin/RevenueOverTimeChart'
import type { DailyRevenuePoint } from '@/components/admin/RevenueOverTimeChart'
import { RevenueBreakdownCharts } from '@/components/admin/RevenueBreakdownCharts'
import type { ServiceRevenueSlice } from '@/components/admin/RevenueBreakdownCharts'
import { BookingsAnalysisCharts } from '@/components/admin/BookingsAnalysisCharts'
import type { DayOfWeekCount, StatusCounts } from '@/components/admin/BookingsAnalysisCharts'
import { TopServicesTable } from '@/components/admin/TopServicesTable'
import type { ServiceStat } from '@/components/admin/TopServicesTable'
import { DailyBreakdownTable } from '@/components/admin/DailyBreakdownTable'
import type { DailyBreakdownRow } from '@/components/admin/DailyBreakdownTable'
import { DollarSign, CheckCircle, TrendingUp, FileText } from 'lucide-react'
import { useIsMobile } from '@/lib/hooks'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const OTHER_LABEL = 'Other'
const MAX_SERVICE_SLICES = 6

interface BookingRow {
  id: string
  service_description: string | null
  preferred_date: string | null
  status: string | null
}

interface InvoiceRow {
  id: string
  booking_id: string | null
  status: string
  total: number
  labour_subtotal: number
  parts_subtotal: number
  paid_date: string | null
  created_at: string
}

function getTodayEastern(): string {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }))
  return toDateStr(easternTime)
}

function toDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function mondayOfWeek(todayStr: string): string {
  const d = new Date(todayStr + 'T12:00:00')
  const dow = d.getDay()
  const diff = (dow + 6) % 7
  d.setDate(d.getDate() - diff)
  return toDateStr(d)
}

function firstDayOfMonthOffset(todayStr: string, monthsAgo: number): string {
  const [y, m] = todayStr.split('-').map(Number)
  const d = new Date(y, m - 1 - monthsAgo, 1)
  return toDateStr(d)
}

function computeRange(preset: PresetKey): { start: string; end: string } {
  const today = getTodayEastern()
  switch (preset) {
    case 'today': return { start: today, end: today }
    case 'week': return { start: mondayOfWeek(today), end: today }
    case 'month': return { start: today.slice(0, 7) + '-01', end: today }
    case '3months': return { start: firstDayOfMonthOffset(today, 2), end: today }
    case 'year': return { start: today.slice(0, 4) + '-01-01', end: today }
  }
}

function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  const d = new Date(start + 'T12:00:00')
  const endD = new Date(end + 'T12:00:00')
  while (d <= endD) {
    days.push(toDateStr(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function inRange(dateStr: string | null | undefined, start: string, end: string): boolean {
  return !!dateStr && dateStr >= start && dateStr <= end
}

function fmtMoney(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function AnalyticsPage() {
  const isMobile = useIsMobile()
  const [preset, setPreset] = useState<PresetKey>('month')
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: bookingsData }, { data: invoicesData }] = await Promise.all([
        supabase.from('bookings').select('id, service_description, preferred_date, status'),
        supabase.from('invoices').select('id, booking_id, status, total, labour_subtotal, parts_subtotal, paid_date, created_at'),
      ])
      setBookings(bookingsData ?? [])
      setInvoices((invoicesData ?? []) as InvoiceRow[])
      setLoading(false)
    }
    load()
  }, [])

  const { start, end } = useMemo(() => computeRange(preset), [preset])

  const bookingsById = useMemo(() => new Map(bookings.map(b => [b.id, b])), [bookings])

  const bookingsInRange = useMemo(
    () => bookings.filter(b => inRange(b.preferred_date, start, end)),
    [bookings, start, end]
  )

  const paidInvoicesInRange = useMemo(
    () => invoices.filter(i => i.status === 'paid' && inRange(i.paid_date, start, end)),
    [invoices, start, end]
  )

  // Section 2 — stat cards
  const stats = useMemo(() => {
    const totalRevenue = paidInvoicesInRange.reduce((s, i) => s + i.total, 0)
    const totalJobs = bookingsInRange.filter(b => b.status === 'completed').length
    const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0
    const outstanding = invoices
      .filter(i => ['draft', 'sent'].includes(i.status) && inRange(i.created_at.slice(0, 10), start, end))
      .reduce((s, i) => s + i.total, 0)
    return { totalRevenue, totalJobs, avgJobValue, outstanding }
  }, [paidInvoicesInRange, bookingsInRange, invoices, start, end])

  // Section 3 — revenue over time
  const revenueOverTime = useMemo<DailyRevenuePoint[]>(() => {
    const revenueByDay = new Map<string, number>()
    paidInvoicesInRange.forEach(i => {
      const day = i.paid_date as string
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + i.total)
    })
    return eachDay(start, end).map(date => ({ date, revenue: revenueByDay.get(date) ?? 0 }))
  }, [paidInvoicesInRange, start, end])

  // Section 4 — revenue breakdown
  const serviceRevenue = useMemo<ServiceRevenueSlice[]>(() => {
    const byService = new Map<string, number>()
    paidInvoicesInRange.forEach(inv => {
      const booking = inv.booking_id ? bookingsById.get(inv.booking_id) : undefined
      const name = booking?.service_description || OTHER_LABEL
      byService.set(name, (byService.get(name) ?? 0) + inv.total)
    })
    const sorted = Array.from(byService.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    if (sorted.length <= MAX_SERVICE_SLICES) return sorted
    const top = sorted.slice(0, MAX_SERVICE_SLICES)
    const otherTotal = sorted.slice(MAX_SERVICE_SLICES).reduce((s, d) => s + d.value, 0)
    return [...top, { name: OTHER_LABEL, value: otherTotal }]
  }, [paidInvoicesInRange, bookingsById])

  const labourParts = useMemo(() => ({
    labour: paidInvoicesInRange.reduce((s, i) => s + i.labour_subtotal, 0),
    parts: paidInvoicesInRange.reduce((s, i) => s + i.parts_subtotal, 0),
  }), [paidInvoicesInRange])

  // Section 5 — bookings analysis
  const byDay = useMemo<DayOfWeekCount[]>(() => {
    const counts = new Array(6).fill(0)
    bookingsInRange
      .filter(b => b.status !== 'cancelled' && b.preferred_date)
      .forEach(b => {
        const dow = new Date(`${b.preferred_date}T12:00:00`).getDay()
        if (dow >= 1 && dow <= 6) counts[dow - 1] += 1
      })
    return DAY_LABELS.map((day, i) => ({ day, count: counts[i] }))
  }, [bookingsInRange])

  const byStatus = useMemo<StatusCounts>(() => ({
    pending: bookingsInRange.filter(b => b.status === 'pending').length,
    confirmed: bookingsInRange.filter(b => b.status === 'confirmed').length,
    in_progress: bookingsInRange.filter(b => b.status === 'in_progress').length,
    completed: bookingsInRange.filter(b => b.status === 'completed').length,
    cancelled: bookingsInRange.filter(b => b.status === 'cancelled').length,
  }), [bookingsInRange])

  // Section 6 — top services table
  const topServices = useMemo<ServiceStat[]>(() => {
    const byService = new Map<string, ServiceStat>()
    bookingsInRange
      .filter(b => b.status !== 'cancelled' && b.service_description)
      .forEach(b => {
        const name = b.service_description as string
        const entry = byService.get(name) ?? { name, bookings: 0, completed: 0, revenue: 0, avgJobValue: 0 }
        entry.bookings += 1
        if (b.status === 'completed') entry.completed += 1
        byService.set(name, entry)
      })
    paidInvoicesInRange.forEach(inv => {
      const booking = inv.booking_id ? bookingsById.get(inv.booking_id) : undefined
      const name = booking?.service_description
      if (!name) return
      const entry = byService.get(name) ?? { name, bookings: 0, completed: 0, revenue: 0, avgJobValue: 0 }
      entry.revenue += inv.total
      byService.set(name, entry)
    })
    return Array.from(byService.values())
      .map(s => ({ ...s, avgJobValue: s.completed > 0 ? s.revenue / s.completed : 0 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [bookingsInRange, paidInvoicesInRange, bookingsById])

  // Section 7 — daily breakdown table
  const dailyBreakdown = useMemo<DailyBreakdownRow[]>(() => {
    const rows: DailyBreakdownRow[] = eachDay(start, end).map(date => {
      const jobsCompleted = bookings.filter(b => b.status === 'completed' && b.preferred_date === date).length
      const revenue = invoices
        .filter(i => i.status === 'paid' && i.paid_date === date)
        .reduce((s, i) => s + i.total, 0)
      const invoicesSent = invoices
        .filter(i => i.status !== 'draft' && i.created_at.slice(0, 10) === date)
        .length
      return { date, jobsCompleted, revenue, invoicesSent }
    })
    return rows
      .filter(r => r.jobsCompleted > 0 || r.revenue > 0 || r.invoicesSent > 0)
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [bookings, invoices, start, end])

  if (loading) {
    return (
      <div style={{ padding: 40, color: '#4A4540', fontSize: '13px' }}>
        Loading analytics…
      </div>
    )
  }

  return (
    <div style={{ padding: isMobile ? 16 : 24, maxWidth: 1200 }}>
      <div style={{
        fontFamily: 'var(--font-heading), sans-serif',
        fontSize: '22px', fontWeight: 700, color: '#F0EDE8', marginBottom: 20,
      }}>
        Analytics
      </div>

      <AnalyticsDateFilter value={preset} onChange={setPreset} />

      {/* Stat cards */}
      <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          iconBg="#3D2800"
          iconColor="#FF9500"
          format={fmtMoney}
        />
        <StatCard
          label="Total Jobs"
          value={stats.totalJobs}
          icon={CheckCircle}
          iconBg="#1A3320"
          iconColor="#4ADE80"
        />
        <StatCard
          label="Average Job Value"
          value={stats.avgJobValue}
          icon={TrendingUp}
          iconBg="#2D1B4E"
          iconColor="#A78BFA"
          format={fmtMoney}
        />
        <StatCard
          label="Outstanding"
          value={stats.outstanding}
          icon={FileText}
          iconBg="#1E3A5F"
          iconColor="#60A5FA"
          format={fmtMoney}
        />
      </div>

      <RevenueOverTimeChart data={revenueOverTime} />

      <RevenueBreakdownCharts serviceRevenue={serviceRevenue} labourParts={labourParts} />

      <BookingsAnalysisCharts byDay={byDay} byStatus={byStatus} />

      <TopServicesTable services={topServices} />

      <DailyBreakdownTable rows={dailyBreakdown} />
    </div>
  )
}
