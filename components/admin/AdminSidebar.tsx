'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, Plus, Clock, Settings, LogOut } from 'lucide-react'

const NAV = [
  { href: '/workshop-portal/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/workshop-portal/bookings',    label: 'Bookings',     icon: Calendar },
  { href: '/workshop-portal/new-booking', label: 'New Booking',  icon: Plus },
  { href: '/workshop-portal/schedule',    label: 'Schedule',     icon: Clock },
  { href: '/workshop-portal/settings',    label: 'Settings',     icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    localStorage.removeItem('fixright_admin_auth')
    router.push('/workshop-portal')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex"
        style={{
          width: '240px', background: '#111008', minHeight: '100vh',
          flexDirection: 'column', flexShrink: 0,
          borderRight: '1px solid #1A1714',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid #1A1714' }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#FF9500', letterSpacing: '0.12em' }}>
            FIXRIGHT
          </div>
          <div style={{ fontSize: '10px', color: '#3A3430', letterSpacing: '0.25em', fontWeight: 600, marginTop: '3px' }}>
            ADMIN
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 24px',
                  fontSize: '13px', fontWeight: active ? 600 : 400,
                  color: active ? '#FF9500' : '#5A5450',
                  textDecoration: 'none',
                  borderLeft: active ? '2px solid #FF9500' : '2px solid transparent',
                  background: active ? 'rgba(255,149,0,0.07)' : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #1A1714' }}>
          <div style={{ fontSize: '11px', color: '#3A3430', marginBottom: '12px', letterSpacing: '0.05em' }}>
            Logged in as Omar
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: '1px solid #2A2420',
              color: '#5A5450', padding: '8px 12px',
              fontSize: '12px', borderRadius: '3px',
              cursor: 'pointer', width: '100%',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#111008', borderTop: '1px solid #1A1714',
          display: 'flex', zIndex: 100,
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', padding: '10px 4px', gap: '3px',
                color: active ? '#FF9500' : '#3A3430',
                textDecoration: 'none',
                fontSize: '9px', fontWeight: active ? 600 : 400,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
