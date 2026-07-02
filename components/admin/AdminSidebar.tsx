'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Plus, Clock, Settings,
  LogOut, FileText, ChevronLeft, ChevronRight, Wrench, BarChart2,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/workshop-portal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/workshop-portal/analytics',   label: 'Analytics',   icon: BarChart2 },
  { href: '/workshop-portal/bookings',    label: 'Bookings',    icon: Calendar },
  { href: '/workshop-portal/new-booking', label: 'New Booking', icon: Plus },
  { href: '/workshop-portal/services',    label: 'Services',    icon: Wrench },
  { href: '/workshop-portal/invoices',    label: 'Invoices',    icon: FileText },
  { href: '/workshop-portal/schedule',    label: 'Schedule',    icon: Clock },
  { href: '/workshop-portal/settings',    label: 'Settings',    icon: Settings },
]

interface Props {
  isOpen: boolean
  isMobile: boolean
  onToggle: () => void
}

export function AdminSidebar({ isOpen, isMobile, onToggle }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [tooltip, setTooltip] = useState<{ label: string; y: number } | null>(null)

  async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/workshop-portal')
  }

  function isActive(href: string) {
    if (href === '/workshop-portal/new-booking') return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  const W = isOpen ? 260 : 68

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        maxWidth: W,
        background: 'linear-gradient(180deg, #0D0B08 0%, #141210 100%)',
        minHeight: '100vh',
        height: isMobile ? '100vh' : undefined,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid #1E1C18',
        position: isMobile ? 'fixed' : 'relative',
        left: 0,
        top: 0,
        zIndex: isMobile ? 50 : undefined,
        transition: 'width 0.3s ease, min-width 0.3s ease, max-width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Tooltip */}
      {!isOpen && tooltip && (
        <div
          style={{
            position: 'fixed',
            left: 76,
            top: tooltip.y,
            transform: 'translateY(-50%)',
            background: '#1E1C18',
            color: '#F0EDE8',
            padding: '6px 12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 200,
            pointerEvents: 'none',
            border: '1px solid #2A2420',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Logo */}
      <div
        style={{
          padding: isOpen ? '24px 20px 20px' : '24px 0 20px',
          borderBottom: '1px solid #1E1C18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {isOpen ? (
          <div>
            <div style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '28px', fontWeight: 700, color: '#FF9500', letterSpacing: '0.05em', lineHeight: 1,
            }}>
              FIXRIGHT
            </div>
            <div style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '12px', color: '#9A8E82', letterSpacing: '0.15em', fontWeight: 400, marginTop: 2,
            }}>
              AUTOMOTIVE
            </div>
            <span
              style={{
                display: 'inline-block', marginTop: 8,
                background: '#3D2800', color: '#FF9500',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em',
                padding: '2px 6px', borderRadius: 4,
              }}
            >
              ADMIN
            </span>
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '15px', fontWeight: 700, color: '#FF9500', letterSpacing: '0.05em',
          }}>
            FR
          </div>
        )}

        <button
          onClick={onToggle}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            position: 'absolute',
            right: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#1E1C18',
            border: '1px solid #2A2420',
            color: '#6B6560',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: 0,
            transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = '#2A2420'
            el.style.color = '#FF9500'
            el.style.borderColor = 'rgba(255,149,0,0.4)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = '#1E1C18'
            el.style.color = '#6B6560'
            el.style.borderColor = '#2A2420'
          }}
        >
          {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Section label */}
      {isOpen && (
        <div
          style={{
            padding: '16px 20px 8px',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: '#4A4540',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          MAIN MENU
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: isOpen ? '4px 0' : '16px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ href, label, icon: Icon }, idx) => {
          const active = isActive(href)
          return (
            <div
              key={href}
              style={{
                position: 'relative',
                animation: `slideInLeft 300ms ease-out ${idx * 40}ms both`,
              }}
              onMouseEnter={e => {
                if (!isOpen) {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                  setTooltip({ label, y: rect.top + rect.height / 2 })
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <Link
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 48,
                  padding: isOpen ? '0 20px' : '0',
                  justifyContent: isOpen ? 'flex-start' : 'center',
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.04em',
                  color: active ? '#F0EDE8' : '#9A8E82',
                  textDecoration: 'none',
                  borderLeft: active ? '3px solid #FF9500' : '3px solid transparent',
                  background: active ? 'rgba(255,149,0,0.08)' : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,149,0,0.05)'
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  style={{ color: active ? '#FF9500' : '#6B6560', flexShrink: 0, transition: 'color 0.15s' }}
                />
                {isOpen && label}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Bottom */}
      <div
        style={{
          borderTop: '1px solid #2A2420',
          padding: isOpen ? '16px 20px' : '12px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOpen ? 'stretch' : 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '14px', fontWeight: 700, color: '#0D0B08', flexShrink: 0,
              }}
            >
              O
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '14px', fontWeight: 600, color: '#F0EDE8',
              }}>
                Omar
              </div>
              <div style={{ fontSize: '11px', color: '#6B6560' }}>Owner</div>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isOpen ? 8 : 0,
            background: 'none',
            border: '1px solid #2A2420',
            color: '#6B6560',
            padding: '8px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            cursor: 'pointer',
            width: isOpen ? '100%' : 40,
            height: 40,
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#FF4444'
            e.currentTarget.style.color = '#FF4444'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#2A2420'
            e.currentTarget.style.color = '#6B6560'
          }}
        >
          <LogOut size={14} />
          {isOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
