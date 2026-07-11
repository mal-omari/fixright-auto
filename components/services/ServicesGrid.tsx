'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Wrench, Settings, Thermometer, Zap, RotateCcw, ShieldCheck, Layers, Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Service {
  icon: LucideIcon
  name: string
  description: string
  iconBg: string
  iconColor: string
}

// Icon accents follow DESIGN.md: amber is the working color; cyan is reserved
// for the diagnostic signal; gold marks certification. No other hues.
const services: Service[] = [
  { icon: Wrench,      name: 'Oil Change',               description: 'Full synthetic or conventional oil changes with filter replacement and fluid top-up.',                       iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
  { icon: Activity,    name: 'Brake Service',             description: 'Pads, rotors, calipers, and brake fluid flush. We inspect the full brake system.',                          iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
  { icon: Settings,    name: 'Engine & Transmission',     description: 'Complete engine diagnostics, repair, and full transmission service by certified technicians.',             iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
  { icon: Thermometer, name: 'Heating & A/C',             description: 'Full HVAC diagnostics, refrigerant recharge, and climate control repair. Ready for every season.',         iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
  { icon: Zap,         name: 'Electrical & Diagnostics',  description: 'OBD-II scanning, starter, alternator, ignition, and complete electrical diagnostics.',                     iconBg: 'rgba(0,212,255,0.1)',  iconColor: 'var(--color-accent-cyan)' },
  { icon: RotateCcw,   name: 'Tire Services',             description: 'Tire sales, installation, rotation, and repair. Right tires at fair prices, installed properly.',          iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
  { icon: ShieldCheck, name: 'Safety Certification',      description: 'Ontario MTO safety inspections to keep your vehicle road-legal and fully compliant.',                      iconBg: 'rgba(232,197,71,0.12)', iconColor: 'var(--color-accent-gold)' },
  { icon: Layers,      name: 'Body & Rust Work',          description: 'Rust removal, underbody protection, undercoating, and accident repair to restore structural integrity.',    iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
]

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ServiceCard({ service }: { service: Service }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = service.icon

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card || prefersReducedMotion()) return
    const rect = card.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    const tiltX = -dy * 6
    const tiltY = dx * 6
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02) translateY(-3px)`

    const highlight = card.querySelector('.card-highlight') as HTMLElement | null
    if (highlight) {
      const hx = 50 + dx * 30
      const hy = 50 + dy * 30
      highlight.style.background = `radial-gradient(circle at ${hx}% ${hy}%, rgba(255,149,0,0.1), transparent 70%)`
      highlight.style.boxShadow = `inset ${-dx * 4}px ${-dy * 4}px 12px rgba(255,255,255,0.04)`
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current
    if (!card || prefersReducedMotion()) return
    card.style.animation = 'rumble 0.3s ease-out 1'
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)'
    card.style.transition = 'transform 0.5s ease, border-color 0.3s, box-shadow 0.3s'
    card.style.animation = ''
    const highlight = card.querySelector('.card-highlight') as HTMLElement | null
    if (highlight) {
      highlight.style.background = 'transparent'
      highlight.style.boxShadow = 'none'
    }
  }, [])

  return (
    <Card
      ref={cardRef}
      variant="public"
      interactive
      className="service-card group relative cursor-default"
      style={{ willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-highlight absolute inset-0 rounded pointer-events-none" style={{ transition: 'background 0.3s, box-shadow 0.3s', borderRadius: '3px' }} />
      <div className="relative">
        <div
          className="mb-4"
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: service.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={20} strokeWidth={1.5} style={{ color: service.iconColor }} />
        </div>
        <h3
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', color: 'var(--color-text-primary)', marginBottom: 4,
          }}
        >
          {service.name}
        </h3>
        <p style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
          {service.description}
        </p>
      </div>
    </Card>
  )
}

export default function ServicesGrid() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (prefersReducedMotion()) return
    let ctx: gsap.Context | undefined
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          '.service-card',
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.65, stagger: { each: 0.08 }, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 78%', once: true },
          }
        )
      }, gridRef)
    })
    return () => {
      cancelAnimationFrame(raf)
      ctx?.revert()
    }
  }, [])

  return (
    <section id="services" style={{ background: 'var(--color-bg-primary)' }} className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
