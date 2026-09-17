'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  Wrench,
} from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'

const NAV = [
  { href: '/workshop-portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workshop-portal/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/workshop-portal/bookings', label: 'Bookings', icon: Calendar },
  { href: '/workshop-portal/customers', label: 'Customers', icon: Users },
  { href: '/workshop-portal/new-booking', label: 'New Booking', icon: Plus },
  { href: '/workshop-portal/services', label: 'Services', icon: Wrench },
  { href: '/workshop-portal/invoices', label: 'Invoices', icon: FileText },
  { href: '/workshop-portal/schedule', label: 'Schedule', icon: Clock },
  { href: '/workshop-portal/settings', label: 'Settings', icon: Settings },
]

const BOOKINGS = [
  { customer: 'Jamie Carter', vehicle: '2021 Honda Civic', service: 'Brake Service', time: 'Today · 9:00 AM', status: 'Confirmed' },
  { customer: 'Priya Shah', vehicle: '2018 Toyota RAV4', service: 'Oil Change', time: 'Today · 11:30 AM', status: 'In Progress' },
  { customer: 'Alex Nguyen', vehicle: '2022 Ford F-150', service: 'Diagnostics', time: 'Today · 2:00 PM', status: 'Pending' },
  { customer: 'Morgan Lee', vehicle: '2017 Mazda 3', service: 'Tire Service', time: 'Tomorrow · 8:30 AM', status: 'Confirmed' },
]

const INVOICES = [
  { number: 'DEMO-1048', customer: 'Jamie Carter', total: '$684.22', status: 'Sent' },
  { number: 'DEMO-1047', customer: 'Priya Shah', total: '$112.95', status: 'Paid' },
  { number: 'DEMO-1046', customer: 'Morgan Lee', total: '$248.60', status: 'Draft' },
]

const statusColor: Record<string, string> = {
  Confirmed: '#60A5FA',
  'In Progress': '#FF9500',
  Pending: '#FACC15',
  Paid: '#4ADE80',
  Sent: '#60A5FA',
  Draft: '#9A8E82',
}

function Badge({ children }: { children: string }) {
  return (
    <span style={{
      display: 'inline-flex', padding: '4px 8px', borderRadius: 999,
      color: statusColor[children] ?? '#F0EDE8', background: 'rgba(255,255,255,0.05)',
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden' }}>
      {children}
    </section>
  )
}

function TableRows({ rows }: { rows: typeof BOOKINGS }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
        <thead>
          <tr style={{ background: '#181512', color: '#6B6560', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {['Customer', 'Vehicle', 'Service', 'Appointment', 'Status'].map(label => (
              <th key={label} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700 }}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={`${row.customer}-${row.time}`} style={{ borderTop: '1px solid #2A2420', color: '#D8D3CD', fontSize: 13 }}>
              <td style={{ padding: '15px 16px', color: '#F0EDE8', fontWeight: 600 }}>{row.customer}</td>
              <td style={{ padding: '15px 16px' }}>{row.vehicle}</td>
              <td style={{ padding: '15px 16px' }}>{row.service}</td>
              <td style={{ padding: '15px 16px' }}>{row.time}</td>
              <td style={{ padding: '15px 16px' }}><Badge>{row.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DashboardView() {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Today’s bookings', '3'],
          ['Pending confirmation', '1'],
          ['In progress', '1'],
          ['Completed this week', '14'],
        ].map(([label, value]) => (
          <Panel key={label}>
            <div style={{ padding: 20 }}>
              <div style={{ color: '#6B6560', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ color: '#F0EDE8', fontSize: 32, fontWeight: 700, marginTop: 8 }}>{value}</div>
            </div>
          </Panel>
        ))}
      </div>
      <Panel>
        <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#F0EDE8', fontSize: 15, margin: 0 }}>Sample bookings</h2>
          <span style={{ color: '#6B6560', fontSize: 11 }}>Fictional data</span>
        </div>
        <TableRows rows={BOOKINGS} />
      </Panel>
    </div>
  )
}

function InvoicesView() {
  return (
    <Panel>
      <div style={{ padding: '16px 18px', color: '#F0EDE8', fontWeight: 700 }}>Sample invoices</div>
      {INVOICES.map(invoice => (
        <div key={invoice.number} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 16, padding: '16px 18px', borderTop: '1px solid #2A2420', alignItems: 'center', color: '#D8D3CD', fontSize: 13 }}>
          <strong style={{ color: '#F0EDE8' }}>{invoice.number}</strong>
          <span>{invoice.customer}</span>
          <span>{invoice.total}</span>
          <Badge>{invoice.status}</Badge>
        </div>
      ))}
    </Panel>
  )
}

function CustomersView() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        ['Jamie Carter', '2021 Honda Civic', '4 sample visits'],
        ['Priya Shah', '2018 Toyota RAV4', '2 sample visits'],
        ['Alex Nguyen', '2022 Ford F-150', '1 sample visit'],
      ].map(([name, vehicle, visits]) => (
        <Panel key={name}>
          <div style={{ padding: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#3D2800', color: '#FF9500', fontWeight: 700, marginBottom: 14 }}>
              {name.split(' ').map(part => part[0]).join('')}
            </div>
            <div style={{ color: '#F0EDE8', fontWeight: 700 }}>{name}</div>
            <div style={{ color: '#9A8E82', fontSize: 13, marginTop: 6 }}>{vehicle}</div>
            <div style={{ color: '#6B6560', fontSize: 12, marginTop: 4 }}>{visits}</div>
          </div>
        </Panel>
      ))}
    </div>
  )
}

function GenericView({ section }: { section: string }) {
  const copy: Record<string, string> = {
    analytics: 'Revenue, service mix, booking volume, and workload reporting appear here in a client deployment.',
    schedule: 'The production version provides a six-day workshop schedule with mechanic assignments and capacity.',
    services: 'Garages can configure service names, pricing, estimated hours, and availability.',
    settings: 'Business identity, staff, labour rates, email delivery, and deployment settings are configured per garage.',
  }
  return (
    <Panel>
      <div style={{ padding: 28 }}>
        <div style={{ color: '#FF9500', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Read-only demo</div>
        <h2 style={{ color: '#F0EDE8', fontSize: 24, margin: '10px 0' }}>{section.charAt(0).toUpperCase() + section.slice(1)}</h2>
        <p style={{ color: '#9A8E82', lineHeight: 1.7, maxWidth: 650, margin: 0 }}>{copy[section] ?? 'This workflow is available in configured client deployments.'}</p>
      </div>
    </Panel>
  )
}

function NewBookingView() {
  return (
    <Panel>
      <div style={{ padding: 28, maxWidth: 720 }}>
        <div style={{ color: '#FF9500', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Non-writing preview</div>
        <h2 style={{ color: '#F0EDE8', fontSize: 22, margin: '10px 0 22px' }}>Create a booking</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {['Customer name', 'Phone number', 'Vehicle', 'Service', 'Preferred date', 'Assigned mechanic'].map(label => (
            <label key={label} style={{ color: '#9A8E82', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label}
              <input disabled value="Sample value" style={{ display: 'block', width: '100%', marginTop: 7, padding: '11px 12px', borderRadius: 7, border: '1px solid #2A2420', background: '#141210', color: '#6B6560' }} readOnly />
            </label>
          ))}
        </div>
        <button disabled style={{ marginTop: 22, border: 0, borderRadius: 7, padding: '11px 18px', background: '#3D2800', color: '#FF9500', fontWeight: 700, cursor: 'not-allowed' }}>
          Saving disabled in demo mode
        </button>
      </div>
    </Panel>
  )
}

export function DemoAdminPortal() {
  const pathname = usePathname()
  const segment = pathname.split('/').filter(Boolean).at(-1) ?? 'dashboard'
  const section = segment === 'workshop-portal' ? 'dashboard' : segment
  const title = NAV.find(item => item.href.endsWith(`/${section}`))?.label ?? 'Dashboard'

  let content: React.ReactNode = <DashboardView />
  if (section === 'bookings') content = <Panel><TableRows rows={BOOKINGS} /></Panel>
  else if (section === 'customers') content = <CustomersView />
  else if (section === 'invoices') content = <InvoicesView />
  else if (section === 'new-booking') content = <NewBookingView />
  else if (section !== 'dashboard') content = <GenericView section={section} />

  return (
    <div className="grid min-h-screen md:grid-cols-[230px_minmax(0,1fr)]" style={{ background: '#1A1714' }}>
      <aside className="hidden md:flex" style={{ background: '#0D0B08', borderRight: '1px solid #1E1C18', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1E1C18' }}>
          <div style={{ color: '#FF9500', fontSize: 24, fontWeight: 800, letterSpacing: '0.06em' }}>{SITE_CONFIG.business.wordmarkPrimary}</div>
          <div style={{ color: '#9A8E82', fontSize: 11, letterSpacing: '0.16em' }}>{SITE_CONFIG.business.wordmarkSecondary}</div>
          <div style={{ display: 'inline-block', marginTop: 9, padding: '3px 7px', borderRadius: 4, background: '#3D2800', color: '#FF9500', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em' }}>READ-ONLY DEMO</div>
        </div>
        <nav style={{ padding: '14px 10px', display: 'grid', gap: 3 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (section === 'dashboard' && href.endsWith('/dashboard'))
            return (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderRadius: 7, color: active ? '#F0EDE8' : '#9A8E82', background: active ? 'rgba(255,149,0,0.1)' : 'transparent', textDecoration: 'none', fontSize: 13, borderLeft: active ? '2px solid #FF9500' : '2px solid transparent' }}>
                <Icon size={17} color={active ? '#FF9500' : '#6B6560'} /> {label}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: 18, borderTop: '1px solid #1E1C18' }}>
          <Link href="/" style={{ color: '#9A8E82', fontSize: 12, textDecoration: 'none' }}>← View customer website</Link>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header style={{ minHeight: 64, padding: '12px 22px', background: '#141210', borderBottom: '1px solid #1E1C18', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div className="md:hidden" style={{ color: '#FF9500', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', marginBottom: 4 }}>DEMO MOTORWORKS</div>
            <h1 style={{ color: '#F0EDE8', fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h1>
          </div>
          <div style={{ padding: '6px 9px', borderRadius: 999, background: '#3D2800', color: '#FF9500', fontSize: 10, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase' }}>Fictional data</div>
        </header>

        <div className="flex md:hidden" style={{ gap: 8, padding: '10px 14px', overflowX: 'auto', borderBottom: '1px solid #1E1C18' }}>
          {NAV.slice(0, 6).map(({ href, label }) => (
            <Link key={href} href={href} style={{ color: pathname === href ? '#FF9500' : '#9A8E82', textDecoration: 'none', fontSize: 12, whiteSpace: 'nowrap', padding: '6px 8px' }}>{label}</Link>
          ))}
        </div>

        <main style={{ padding: 22 }}>
          <div style={{ marginBottom: 18, padding: '10px 13px', border: '1px solid #3D2800', borderRadius: 8, background: 'rgba(255,149,0,0.06)', color: '#C8B79F', fontSize: 12, lineHeight: 1.5 }}>
            This portal is a safe sales demonstration. It cannot access production records, save changes, send email, or process payments.
          </div>
          {content}
        </main>
      </div>
    </div>
  )
}
