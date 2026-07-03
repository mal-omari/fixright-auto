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

const services: Service[] = [
  { icon: Wrench,      name: 'Oil Change',               description: 'Full synthetic or conventional oil changes with filter replacement and fluid top-up.',                       iconBg: 'rgba(255,149,0,0.12)', iconColor: '#FF9500' },
  { icon: Activity,    name: 'Brake Service',             description: 'Pads, rotors, calipers, and brake fluid flush. We inspect the full brake system.',                          iconBg: 'rgba(239,68,68,0.12)', iconColor: '#EF4444' },
  { icon: Settings,    name: 'Engine & Transmission',     description: 'Complete engine diagnostics, repair, and full transmission service by certified technicians.',             iconBg: 'rgba(74,158,255,0.12)', iconColor: '#4A9EFF' },
  { icon: Thermometer, name: 'Heating & A/C',             description: 'Full HVAC diagnostics, refrigerant recharge, and climate control repair. Ready for every season.',         iconBg: 'rgba(0,212,255,0.12)', iconColor: '#00D4FF' },
  { icon: Zap,         name: 'Electrical & Diagnostics',  description: 'OBD-II scanning, starter, alternator, ignition, and complete electrical diagnostics.',                     iconBg: 'rgba(232,197,71,0.12)', iconColor: '#E8C547' },
  { icon: RotateCcw,   name: 'Tire Services',             description: 'Tire sales, installation, rotation, and repair. Right tires at fair prices, installed properly.',          iconBg: 'rgba(74,222,128,0.12)', iconColor: '#4ADE80' },
  { icon: ShieldCheck, name: 'Safety Certification',      description: 'Ontario MTO safety inspections to keep your vehicle road-legal and fully compliant.',                      iconBg: 'rgba(167,139,250,0.12)', iconColor: '#A78BFA' },
  { icon: Layers,      name: 'Body & Rust Work',          description: 'Rust removal, underbody protection, undercoating, and accident repair to restore structural integrity.',    iconBg: 'rgba(251,146,60,0.12)', iconColor: '#FB923C' },
]

function ServiceCard({ service }: { service: Service }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = service.icon

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
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
    if (!card) return
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
            textTransform: 'uppercase', color: '#F0EDE8', marginBottom: 4,
          }}
        >
          {service.name}
        </h3>
        <p style={{ fontSize: '12px', fontWeight: 400, color: '#9A8E82', lineHeight: 1.5 }}>
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
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.service-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.65, stagger: { each: 0.08 }, ease: 'power2.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 78%', once: true },
        }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="services" style={{ background: '#1E1A16' }} className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', color: '#F0EDE8',
          }}>
            OUR SERVICES
          </h2>
          <div className="mx-auto mt-4 h-1 w-16" style={{ background: '#FF9500', borderRadius: '1px' }} />
        </div>
        <div ref={gridRef} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
