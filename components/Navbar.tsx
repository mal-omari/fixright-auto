'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current
      if (currentY < 100) {
        setVisible(true)
      } else if (delta > 8) {
        setVisible(false)
        setMenuOpen(false)
      } else if (delta < -8) {
        setVisible(true)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(30,26,22,0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #3A3430',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Wordmark */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'baseline', gap: '6px', textDecoration: 'none' }}
          >
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em', color: '#FF9500', lineHeight: 1 }}>
              FIXRIGHT
            </span>
            <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: '#F0EDE8', lineHeight: 1 }}>
              AUTOMOTIVE
            </span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {navLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: active ? '#F0EDE8' : '#9A8E82',
                    textDecoration: 'none',
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s',
                    position: 'relative',
                    paddingBottom: '2px',
                    borderBottom: active ? '2px solid #FF9500' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#F0EDE8' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#9A8E82' }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="tel:5194719462"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#FF9500',
                textDecoration: 'none',
                fontSize: '12px',
                letterSpacing: '0.06em',
                fontWeight: 600,
              }}
            >
              <Phone size={13} />
              519.471.9462
            </a>
            <div style={{ width: '1px', height: '18px', background: '#3A3430' }} />
            <Link
              href="/book"
              style={{
                background: '#FF9500',
                color: '#111111',
                padding: '9px 20px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '3px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#E08400')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FF9500')}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex md:hidden"
            style={{ background: 'none', border: 'none', color: '#F0EDE8', cursor: 'pointer', padding: '8px' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'rgba(30,26,22,0.98)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '36px',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', textDecoration: 'none', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#FF9500' }}>FIXRIGHT</span>
          <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.2em', color: '#F0EDE8' }}>AUTOMOTIVE</span>
        </Link>

        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? '#FF9500' : '#F0EDE8',
              textDecoration: 'none',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/book"
          style={{
            background: '#FF9500',
            color: '#111111',
            padding: '14px 48px',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '3px',
            marginTop: '8px',
          }}
        >
          Book Now
        </Link>

        <a
          href="tel:5194719462"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9A8E82', textDecoration: 'none', fontSize: '16px' }}
        >
          <Phone size={16} />
          519.471.9462
        </a>
      </div>
    </>
  )
}
