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

// ── HUD element definitions ─────────────────────────────────────────────────
const HUD_DEFS = [
  {
    id: 'diag',
    style: { top: '8%', left: '1.5%' },
    label: 'DIAGNOSTIC SYSTEM',
    values: ['ACTIVE'],
    dot: true,
    color: '#00FF88',
  },
  {
    id: 'brake',
    style: { top: '8%', right: '1.5%' },
    label: 'BRAKE SYSTEM',
    values: ['▓▓▓▓░░ 67%', '▓▓▓▓▓░ 83%', '▓▓░░░░ 34%'],
    dot: false,
    color: '#FF9500',
  },
  {
    id: 'temp',
    style: { bottom: '22%', left: '1.5%' },
    label: 'ENGINE TEMP',
    values: ['94°C', '87°C', '101°C', '91°C'],
    dot: false,
    color: '#FF9500',
  },
  {
    id: 'vehicles',
    style: { bottom: '22%', right: '1.5%' },
    label: 'VEHICLES SERVICED TODAY',
    values: ['3', '4', '2'],
    dot: false,
    color: '#00D4FF',
  },
  {
    id: 'oil',
    style: { top: '50%', left: '1.5%', transform: 'translateY(-50%)' },
    label: 'OIL LIFE',
    values: ['12% — SERVICE DUE', '8% — SERVICE DUE', '24% — MONITOR'],
    dot: false,
    color: '#E8C547',
  },
  {
    id: 'battery',
    style: { top: '50%', right: '1.5%', transform: 'translateY(-50%)' },
    label: 'BATTERY',
    values: ['12.6V ✓', '12.4V ✓', '12.8V ✓'],
    dot: false,
    color: '#00D4FF',
  },
]

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLImageElement>(null)
  const bookBtnRef = useRef<HTMLAnchorElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [hudValues, setHudValues] = useState(() =>
    Object.fromEntries(HUD_DEFS.map(h => [h.id, h.values[0]]))
  )

  // ── Spotlight ──────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const section = sectionRef.current
    const spotlight = spotlightRef.current
    if (!section || !spotlight) return
    const rect = section.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    spotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,149,0,0.08), transparent 70%)`

    // Magnetic button
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

  // ── GSAP setup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      // Content stagger fade-in
      gsap.fromTo(
        '.hero-item',
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.18, ease: 'power3.out', delay: 0.4 }
      )
      // Parallax on background image
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          y: '25%',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }
    }, sectionRef)

    const section = sectionRef.current
    section?.addEventListener('mousemove', handleMouseMove)
    section?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      ctx.revert()
      section?.removeEventListener('mousemove', handleMouseMove)
      section?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  // ── HUD cycling ────────────────────────────────────────────────────────────
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
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: '#1E1A16' }}
    >
      {/* Background photo */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={bgRef}
          src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1920&q=80"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-15%',
            left: 0,
            width: '100%',
            height: '130%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>

      {/* Dark warm overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(30,26,22,0.85) 0%, rgba(30,26,22,0.6) 50%, rgba(30,26,22,0.9) 100%)',
        }}
      />

      {/* Mouse spotlight */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none"
        style={{ transition: 'background 0.1s ease', willChange: 'background' }}
      />

      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255,149,0,0.03)',
            animation: 'scanLine 8s linear infinite',
          }}
        />
      </div>

      {/* HUD elements */}
      {HUD_DEFS.map(h => (
        <div
          key={h.id}
          className="absolute pointer-events-none hidden lg:block hud-pulse"
          style={{
            ...h.style,
            background: 'rgba(10,8,5,0.75)',
            border: '1px solid rgba(58,52,48,0.8)',
            borderRadius: '2px',
            padding: '6px 10px',
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '0.06em',
            color: h.color,
            backdropFilter: 'blur(4px)',
            zIndex: 5,
            minWidth: '160px',
          }}
        >
          <div style={{ color: '#9A8E82', fontSize: '9px', marginBottom: '3px', letterSpacing: '0.1em' }}>
            {h.label}
            {h.dot && (
              <span className="hud-blink" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: h.color, marginLeft: '6px', verticalAlign: 'middle' }} />
            )}
          </div>
          <div style={{ fontWeight: 700, color: h.color }}>{hudValues[h.id]}</div>
        </div>
      ))}

      {/* Dust particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
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

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 45%, transparent 20%, rgba(30,26,22,0.65) 100%)',
          zIndex: 3,
        }}
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, #1E1A16, transparent)', zIndex: 4 }}
      />

      {/* Content */}
      <div className="relative px-6 text-center" style={{ maxWidth: '800px', margin: '0 auto', zIndex: 10 }}>
        <p
          className="hero-item mb-3"
          style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#FF9500' }}
        >
          London, Ontario · Est. 1996
        </p>

        <h1
          className="hero-item mb-4 font-bold leading-none"
          style={{ fontSize: 'clamp(3rem, 9vw, 72px)', color: '#F0EDE8', letterSpacing: '0.05em' }}
        >
          FIXRIGHT AUTOMOTIVE
        </h1>

        <p
          className="hero-item mb-3 font-semibold"
          style={{ fontSize: '20px', color: '#FF9500', letterSpacing: '0.02em' }}
        >
          London Ontario&apos;s Most Trusted Independent Garage
        </p>

        <p
          className="hero-item mx-auto mb-10 leading-relaxed"
          style={{ fontSize: '16px', color: '#9A8E82', maxWidth: '520px' }}
        >
          28 years of honest, expert auto care. No dealer markup. No pressure. Just results.
        </p>

        <div className="hero-item flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            ref={bookBtnRef}
            href="/book"
            style={{
              display: 'inline-block',
              background: '#FF9500',
              color: '#111111',
              padding: '15px 36px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '3px',
              transition: 'background 0.2s',
              willChange: 'transform',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#E08400')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FF9500')}
          >
            Book Your Service
          </Link>

          <a
            href="tel:5194719462"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(240,237,232,0.3)',
              color: '#F0EDE8',
              padding: '14px 32px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: '3px',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = '#FF9500'
              el.style.background = 'rgba(255,149,0,0.08)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(240,237,232,0.3)'
              el.style.background = 'transparent'
            }}
          >
            <Phone size={15} />
            Call 519.471.9462
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-item absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2" style={{ zIndex: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9A8E82' }}>
          Scroll
        </span>
        <div className="h-10 w-px" style={{ background: 'linear-gradient(to bottom, #9A8E82, transparent)' }} />
      </div>
    </section>
  )
}
