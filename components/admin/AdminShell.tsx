'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const TITLE_MAP: Record<string, string> = {
  '/workshop-portal/dashboard':   'Dashboard',
  '/workshop-portal/bookings':    'Bookings',
  '/workshop-portal/new-booking': 'New Booking',
  '/workshop-portal/invoices':    'Invoices',
  '/workshop-portal/schedule':    'Schedule',
  '/workshop-portal/settings':    'Settings',
}

function getPageTitle(pathname: string): string {
  if (TITLE_MAP[pathname]) return TITLE_MAP[pathname]
  if (/\/bookings\/[^/]+/.test(pathname)) return 'Booking Detail'
  if (/\/invoices\/[^/]+/.test(pathname)) return 'Invoice'
  return 'Workshop Portal'
}

const MOBILE_BREAKPOINT = 1024

function useDateTime() {
  const [dt, setDt] = useState<Date | null>(null)
  useEffect(() => {
    setDt(new Date())
    const id = setInterval(() => setDt(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return dt
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/workshop-portal'
  const [checking, setChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const dt = useDateTime()

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsAuth(false)
        setChecking(false)
        if (!isLoginPage) router.push('/workshop-portal')
        return
      }
      setIsAuth(true)
      setChecking(false)
    }
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setIsAuth(false)
          router.push('/workshop-portal')
        }
      }
    )

    const mobile = window.innerWidth < MOBILE_BREAKPOINT
    setIsMobile(mobile)
    if (mobile) {
      setSidebarOpen(false)
    } else {
      const saved = localStorage.getItem('fixright_sidebar_open')
      if (saved !== null) setSidebarOpen(saved === 'true')
    }

    function handleResize() {
      const m = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(m)
      if (m) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      subscription.unsubscribe()
    }
  }, [pathname, router, isLoginPage])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => {
      const next = !prev
      if (window.innerWidth >= MOBILE_BREAKPOINT) localStorage.setItem('fixright_sidebar_open', String(next))
      return next
    })
  }, [])

  if (checking) {
    return (
      <div style={{ background: '#1A1714', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#3A3430', fontSize: '13px' }}>Loading…</div>
      </div>
    )
  }

  if (isLoginPage) return <>{children}</>
  if (!isAuth) return null

  const formattedDate = dt
    ? dt.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
    : ''
  const formattedTime = dt
    ? dt.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', hour12: true })
    : ''

  const contentOffset = isMobile ? 68 : (sidebarOpen ? 260 : 68)

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714' }}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 40,
          }}
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main area */}
      <div
        style={{
          marginLeft: contentOffset,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header bar */}
        <header
          style={{
            height: 60,
            background: '#141210',
            borderBottom: '1px solid #1E1C18',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 500, color: '#F0EDE8' }}>
            {getPageTitle(pathname)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {formattedDate && (
              <span style={{ fontSize: '12px', color: '#6B6560' }}>
                {formattedDate} · {formattedTime}
              </span>
            )}
            <button
              className="admin-touch-target"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6B6560', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Bell size={18} />
            </button>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: '#0D0B08', flexShrink: 0,
              }}
            >
              O
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', overflowX: 'hidden', maxWidth: '100%', background: '#1A1714' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
