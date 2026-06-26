'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Phone, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const delta = currentY - lastScrollY.current
      if (currentY < 80) {
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
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: '#1A1A1A',
          borderBottom: '1px solid #333333',
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
          {/* Logo */}
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'baseline', gap: '8px', textDecoration: 'none' }}
          >
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#FF9500',
                lineHeight: 1,
              }}
            >
              FIXRIGHT
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.2em',
                color: '#F5F5F5',
                lineHeight: 1,
              }}
            >
              AUTOMOTIVE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
            }}
            className="hidden md:flex"
          >
            <a
              href="tel:5194719462"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#A0A0A0',
                textDecoration: 'none',
                fontSize: '13px',
                letterSpacing: '0.05em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#F5F5F5')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A0A0A0')}
            >
              <Phone size={14} />
              519.471.9462
            </a>

            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: '#A0A0A0',
                  textDecoration: 'none',
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#F5F5F5')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A0A0A0')}
              >
                {link.label}
              </a>
            ))}

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
                borderRadius: '2px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FFa930')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FF9500')}
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: '#F5F5F5',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
            className="flex md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: '#1A1A1A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#FF9500' }}>FIXRIGHT</span>
            <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.2em', color: '#F5F5F5' }}>
              AUTOMOTIVE
            </span>
          </Link>

          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: '#F5F5F5',
                textDecoration: 'none',
                fontSize: '24px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {link.label}
            </a>
          ))}

          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            style={{
              background: '#FF9500',
              color: '#111111',
              padding: '14px 40px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
            }}
          >
            Book Now
          </Link>

          <a
            href="tel:5194719462"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#A0A0A0',
              textDecoration: 'none',
              fontSize: '16px',
            }}
          >
            <Phone size={16} />
            519.471.9462
          </a>
        </div>
      )}
    </>
  )
}
