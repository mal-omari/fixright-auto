'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Phone } from 'lucide-react'
import Link from 'next/link'

// ── Dust particles ──────────────────────────────────────────────────────────
const DUST = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${5 + (i * 4.7) % 90}%`,
  size: 1 + (i % 2),
  delay: `${(i * 0.6) % 8}s`,
  duration: `${8 + (i * 0.35) % 7}s`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (6 + (i % 14))}px`,
}))

// ── HUD definitions ─────────────────────────────────────────────────────────
const HUD_DEFS = [
  {
    id: 'diag',
    style: { top: '8%', left: '24px' } as React.CSSProperties,
    label: 'DIAGNOSTIC SYSTEM',
    values: ['● ACTIVE', '● SCANNING...', '● ALL SYSTEMS OK', '● READY'],
    dotColor: '#00FF88',
    valueColor: '#FF9500',
  },
  {
    id: 'brake',
    style: { top: '8%', right: '24px' } as React.CSSProperties,
    label: 'BRAKE SYSTEM',
    values: ['▓▓▓▓▓▓░░ 78%', '▓▓▓▓░░░░ 52%', '▓▓▓▓▓▓▓░ 91%'],
    dotColor: null,
    valueColor: '#FF9500',
  },
  {
    id: 'temp',
    style: { top: '45%', left: '24px', transform: 'translateY(-50%)' } as React.CSSProperties,
    label: 'ENGINE TEMP',
    values: ['94°C ↑', '87°C', '101°C ↑↑', '91°C'],
    dotColor: null,
    valueColor: '#FF9500',
  },
  {
    id: 'oil',
    style: { top: '45%', right: '24px', transform: 'translateY(-50%)' } as React.CSSProperties,
    label: 'OIL LIFE',
    values: ['12% — SERVICE DUE', '8% — SERVICE DUE', '24% — MONITOR'],
    dotColor: null,
    valueColor: '#EF4444',
  },
  {
    id: 'battery',
    style: { bottom: '120px', left: '24px' } as React.CSSProperties,
    label: 'BATTERY',
    values: ['12.6V ✓', '12.4V ✓', '12.8V ✓'],
    dotColor: null,
    valueColor: '#00D4FF',
  },
  {
    id: 'jobs',
    style: { bottom: '120px', right: '24px' } as React.CSSProperties,
    label: "TODAY'S JOBS",
    values: ['3 VEHICLES', '4 VEHICLES', '2 VEHICLES'],
    dotColor: null,
    valueColor: '#FF9500',
  },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const bookBtnRef = useRef<HTMLAnchorElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [hudValues, setHudValues] = useState(() =>
    Object.fromEntries(HUD_DEFS.map(h => [h.id, h.values[0]]))
  )
  const [hudVisible, setHudVisible] = useState(false)

  // ── Spotlight + magnetic ────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const section = sectionRef.current
    const spotlight = spotlightRef.current
    if (!section || !spotlight) return
    const rect = section.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,149,0,0.06), transparent 60%)`

    const btn = bookBtnRef.current
    if (btn) {
      const br = btn.getBoundingClientRect()
      const bx = br.left + br.width / 2
      const by = br.top + br.height / 2
      const dx = e.clientX - bx
      const dy = e.clientY - by
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 100) {
        const s = (100 - dist) / 100
        gsap.to(btn, { x: dx * s * 0.35, y: dy * s * 0.35, duration: 0.3, ease: 'power2.out' })
      } else {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
      }
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    const btn = bookBtnRef.current
    if (btn) gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
    if (spotlightRef.current) spotlightRef.current.style.background = 'transparent'
  }, [])

  // ── GSAP setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-label', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 })
      gsap.fromTo('.hero-title-1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 })
      gsap.fromTo('.hero-title-2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 })
      gsap.fromTo('.hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.7 })
      gsap.fromTo('.hero-body', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.9 })
      gsap.fromTo('.hero-cta-1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 1.1 })
      gsap.fromTo('.hero-cta-2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 1.2 })
      gsap.fromTo('.hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 1.5 })
    }, sectionRef)

    setTimeout(() => setHudVisible(true), 1300)

    const section = sectionRef.current
    section?.addEventListener('mousemove', handleMouseMove)
    section?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      ctx.revert()
      section?.removeEventListener('mousemove', handleMouseMove)
      section?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  // ── HUD cycling ────────────────────────────────────────────────────────
  useEffect(() => {
    const indices: Record<string, number> = Object.fromEntries(HUD_DEFS.map(h => [h.id, 0]))
    const interval = setInterval(() => {
      const updates: Record<string, string> = {}
      for (const h of HUD_DEFS) {
        if (h.values.length > 1) {
          indices[h.id] = (indices[h.id] + 1) % h.values.length
          updates[h.id] = h.values[indices[h.id]]
        }
      }
      setHudValues(prev => ({ ...prev, ...updates }))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="flex items-center justify-center"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage: "url('https://images.unsplash.com/photo-1632823471565-1ecdf5c6da12?w=1920&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark warm overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(30,26,22,0.92) 0%, rgba(20,18,14,0.75) 100%)',
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,8,5,0.8) 100%)',
          zIndex: 1,
        }}
      />

      {/* Mouse spotlight */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{ transition: 'background 0.1s ease', willChange: 'background', zIndex: 2 }}
      />

      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,149,0,0.015) 2px, rgba(255,149,0,0.015) 4px)',
          zIndex: 3,
        }}
      />

      {/* Scan beam */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 4 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,149,0,0.4), transparent)',
            animation: 'scanBeam 8s linear infinite',
            opacity: 0.6,
          }}
        />
      </div>

      {/* HUD elements */}
      {HUD_DEFS.map((h, idx) => (
        <div
          key={h.id}
          className="absolute pointer-events-none hidden lg:block hud-pulse"
          style={{
            ...h.style,
            background: 'rgba(10,8,5,0.7)',
            border: '1px solid rgba(255,149,0,0.2)',
            borderRadius: 4,
            padding: '8px 12px',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.06em',
            backdropFilter: 'blur(4px)',
            zIndex: 5,
            minWidth: '160px',
            opacity: hudVisible ? 1 : 0,
            transition: `opacity 0.4s ease ${idx * 0.15}s`,
          }}
        >
          <div style={{ color: '#9A8E82', fontSize: '10px', marginBottom: 4, letterSpacing: '0.1em' }}>
            {h.label}
          </div>
          <div style={{ fontWeight: 700, color: h.valueColor, transition: 'opacity 0.3s' }}>
            {hudValues[h.id]}
          </div>
        </div>
      ))}

      {/* Dust particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 6 }}>
        {DUST.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              bottom: '0',
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: '#FF9500',
              opacity: 0,
              ['--drift' as string]: p.drift,
              animation: `dustRise ${p.duration} ease-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, #1E1A16, transparent)', zIndex: 7 }}
      />

      {/* Content */}
      <div className="relative px-6 text-center" style={{ maxWidth: '860px', margin: '0 auto', zIndex: 10 }}>

        {/* Label */}
        <div
          className="hero-label mb-4"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            opacity: 0,
          }}
        >
          <div style={{ flex: 1, maxWidth: 60, height: 1, background: '#FF9500', opacity: 0.5 }} />
          <span style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#FF9500',
          }}>
            LONDON ONTARIO&apos;S TRUSTED GARAGE
          </span>
          <div style={{ flex: 1, maxWidth: 60, height: 1, background: '#FF9500', opacity: 0.5 }} />
        </div>

        {/* Main headline */}
        <h1 style={{ margin: 0 }}>
          <div
            className="hero-title-1"
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 'clamp(64px, 10vw, 96px)',
              fontWeight: 700,
              color: '#F0EDE8',
              letterSpacing: '0.05em',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              opacity: 0,
            }}
          >
            FIXRIGHT
          </div>
          <div
            className="hero-title-2"
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 'clamp(64px, 10vw, 96px)',
              fontWeight: 300,
              color: '#F0EDE8',
              letterSpacing: '0.05em',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              opacity: 0,
              marginBottom: 24,
            }}
          >
            AUTOMOTIVE
          </div>
        </h1>

        <p
          className="hero-sub"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '18px', fontWeight: 400, color: '#9A8E82',
            marginBottom: 8, opacity: 0,
          }}
        >
          28 Years. 6,000+ Vehicles. One Promise.
        </p>

        <p
          className="hero-body"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
            fontSize: '16px', fontWeight: 300, color: '#7A7068',
            marginBottom: 40, opacity: 0,
          }}
        >
          Honest diagnostics. Fair pricing. No dealer markup.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }} className="sm:flex-row">
          <Link
            ref={bookBtnRef}
            href="/book"
            className="hero-cta-1"
            style={{
              display: 'inline-block',
              background: '#FF9500',
              color: '#111111',
              padding: '0 36px',
              height: 48,
              lineHeight: '48px',
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '3px',
              transition: 'background 0.2s',
              willChange: 'transform',
              opacity: 0,
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#E08400')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FF9500')}
          >
            Book Your Service
          </Link>

          <a
            href="tel:5194719462"
            className="hero-cta-2"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #3A3430',
              color: '#F0EDE8',
              padding: '0 32px',
              height: 48,
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: '3px',
              transition: 'border-color 0.2s, background 0.2s',
              opacity: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = '#FF9500'
              el.style.background = 'rgba(255,149,0,0.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = '#3A3430'
              el.style.background = 'transparent'
            }}
          >
            <Phone size={15} />
            Call 519.471.9462
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2" style={{ zIndex: 10, opacity: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9A8E82' }}>
          Scroll
        </span>
        <div className="h-10 w-px" style={{ background: 'linear-gradient(to bottom, #9A8E82, transparent)' }} />
      </div>
    </section>
  )
}
