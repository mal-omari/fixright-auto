'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    const mouse = { x: -9999, y: -9999 }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const init = () => {
      particles = Array.from({ length: 70 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
      }))
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${p.opacity})`
        ctx.fill()
      }

      // Particle-to-particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${(1 - dist / 110) * 0.1})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
        // Mouse connections
        const dx = particles[i].x - mouse.x
        const dy = particles[i].y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 160) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = `rgba(0,212,255,${(1 - dist / 160) * 0.28})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      animId = requestAnimationFrame(tick)
    }

    const onResize = () => { resize(); init() }
    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }

    resize()
    init()
    tick()
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  // GSAP fade-in
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-item',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.18,
          ease: 'power3.out',
          delay: 0.3,
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex h-screen items-center justify-center overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Scan line */}
      <div
        className="scan-line-anim pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, #00D4FF 25%, #00D4FF 75%, transparent 100%)',
          opacity: 0.55,
        }}
      />

      {/* Radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 35%, #0A0A0A 100%)',
        }}
      />

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, #0A0A0A, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="hero-item mb-5">
          <span
            className="font-mono text-xs tracking-[0.35em] uppercase"
            style={{ color: '#00D4FF' }}
          >
            London, Ontario · Est. 1996
          </span>
        </div>

        <h1
          className="hero-item mb-6 font-bold leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #00D4FF 0%, #0097B5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PRECISION
          </span>
          <br />
          <span style={{ color: '#FFFFFF' }}>AUTO CARE</span>
        </h1>

        <p
          className="hero-item mx-auto mb-10 max-w-xl text-lg leading-relaxed"
          style={{ color: '#8B8B8B' }}
        >
          London's most trusted garage. 28 years. 6,000+ satisfied customers.
        </p>

        <div className="hero-item flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#book"
            className="inline-block px-8 py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-colors duration-200"
            style={{
              background: '#00D4FF',
              color: '#0A0A0A',
              borderRadius: '2px',
            }}
            onMouseEnter={e =>
              ((e.currentTarget as HTMLAnchorElement).style.background = '#33DDFF')
            }
            onMouseLeave={e =>
              ((e.currentTarget as HTMLAnchorElement).style.background = '#00D4FF')
            }
          >
            Book a Service
          </a>
          <a
            href="#services"
            className="inline-block px-8 py-4 text-sm font-semibold tracking-[0.15em] uppercase transition-all duration-200"
            style={{
              border: '1px solid rgba(0,212,255,0.4)',
              color: '#00D4FF',
              borderRadius: '2px',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = '#00D4FF'
              el.style.background = 'rgba(0,212,255,0.05)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(0,212,255,0.4)'
              el.style.background = 'transparent'
            }}
          >
            Our Services
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-item absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span
          className="font-mono text-[10px] tracking-[0.25em] uppercase"
          style={{ color: '#8B8B8B' }}
        >
          Scroll
        </span>
        <div
          className="h-10 w-px"
          style={{ background: 'linear-gradient(to bottom, #8B8B8B, transparent)' }}
        />
      </div>
    </section>
  )
}
