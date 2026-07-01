'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

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
  const bookBtnRef = useRef<HTMLAnchorElement>(null)

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

  // Magnetic effect on Book Now button
  const handleNavMouseMove = (e: React.MouseEvent) => {
    const btn = bookBtnRef.current
    if (!btn) return
    const br = btn.getBoundingClientRect()
    const bx = br.left + br.width / 2
    const by = br.top + br.height / 2
    const dx = e.clientX - bx
    const dy = e.clientY - by
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 100) {
      const s = (100 - dist) / 100
      btn.style.transform = `translate(${dx * s * 0.2}px, ${dy * s * 0.2}px)`
    } else {
      btn.style.transform = ''
    }
  }

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
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
          borderBottom: '1px solid #3A3430',
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease',
          willChange: 'transform',
        }}
        onMouseMove={handleNavMouseMove}
        onMouseLeave={() => {
          if (bookBtnRef.current) bookBtnRef.current.style.transform = ''
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
            <span style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '20px', fontWeight: 700, letterSpacing: '0.05em', color: '#FF9500', lineHeight: 1,
            }}>
              FIXRIGHT
            </span>
            <span style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '11px', fontWeight: 400, letterSpacing: '0.2em', color: '#F0EDE8', lineHeight: 1,
            }}>
              AUTOMOTIVE
            </span>
          </Link>

          {/* Desktop center nav */}
          <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '32px' }}>
            {navLinks.map(link => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    color: active ? '#F0EDE8' : '#9A8E82',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
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
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '20px' }}>
            <a
              href="tel:5194719462"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#FF9500',
                textDecoration: 'none',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '13px',
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}
            >
              <Phone size={13} />
              519.471.9462
            </a>
            <div style={{ width: '1px', height: '18px', background: '#3A3430' }} />
            <Link
              ref={bookBtnRef}
              href="/book"
              style={{
                background: '#FF9500',
                color: '#111111',
                padding: '9px 20px',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: '3px',
                transition: 'background 0.2s, transform 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#E08400')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FF9500')}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex lg:hidden"
            style={{ background: 'none', border: 'none', color: '#FF9500', cursor: 'pointer', padding: '8px' }}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              background: 'rgba(14,12,10,0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              aria-label="Close menu"
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                background: 'none',
                border: 'none',
                color: '#FF9500',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              <X size={24} />
            </button>

            <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: '32px',
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#F0EDE8',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FF9500')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#F0EDE8')}
                  >
                    {link.label.toUpperCase()}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: navLinks.length * 0.05 }}
              style={{
                width: '100%',
                maxWidth: '280px',
                marginTop: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '100%', height: '1px', background: '#3A3430', marginBottom: '32px' }} />
              <Link
                href="/book"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  background: '#FF9500',
                  color: '#111111',
                  padding: '16px 0',
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderRadius: '3px',
                }}
              >
                Book Your Appointment
              </Link>
              <a
                href="tel:5194719462"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '24px',
                  fontFamily: 'var(--font-heading), sans-serif',
                  color: '#FF9500',
                  textDecoration: 'none',
                  fontSize: '16px',
                  fontWeight: 500,
                }}
              >
                <Phone size={16} />
                519.471.9462
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
