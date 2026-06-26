'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Wrench,
  Settings,
  Thermometer,
  Zap,
  RotateCcw,
  ShieldCheck,
  Layers,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Service {
  icon: LucideIcon
  name: string
  description: string
}

const services: Service[] = [
  {
    icon: Wrench,
    name: 'Maintenance & Tune-ups',
    description:
      'Oil changes, filters, brake service, and full scheduled maintenance to keep you on the road.',
  },
  {
    icon: Settings,
    name: 'Engine & Transmission',
    description:
      'Complete engine diagnostics, repair, and full transmission service by certified technicians.',
  },
  {
    icon: Thermometer,
    name: 'Heating & A/C',
    description:
      'Full HVAC diagnostics, refrigerant recharge, and climate control repair. Ready for every season.',
  },
  {
    icon: Zap,
    name: 'Electrical Systems',
    description:
      'Starter, alternator, ignition, lighting, and complete electrical diagnostics with precision tools.',
  },
  {
    icon: RotateCcw,
    name: 'Tire Services',
    description:
      'Tire sales, installation, rotation, and repair. Right tires at fair prices, installed properly.',
  },
  {
    icon: ShieldCheck,
    name: 'Safety Certification',
    description:
      'Ontario MTO safety inspections to keep your vehicle road-legal and fully compliant.',
  },
  {
    icon: Layers,
    name: 'Body & Rust Work',
    description:
      'Rust removal, underbody protection, undercoating, and accident repair to restore structural integrity.',
  },
  {
    icon: Activity,
    name: 'Diagnostics',
    description:
      'Advanced OBD-II scanning and computer diagnostics to identify issues before they become expensive.',
  },
]

export default function ServicesGrid() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.service-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: { each: 0.08 },
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 78%',
          },
        }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="services" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <span
            className="mb-3 block font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: '#00D4FF' }}
          >
            Full Service Auto Repair
          </span>
          <h2 className="text-5xl font-bold tracking-tight" style={{ color: '#FFFFFF' }}>
            WHAT WE DO
          </h2>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <div
                key={i}
                className="service-card group relative cursor-default p-6 transition-all duration-300"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '2px',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(0,212,255,0.35)'
                  el.style.background = '#141414'
                  el.style.boxShadow = '0 0 28px rgba(0,212,255,0.1)'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(255,255,255,0.05)'
                  el.style.background = '#111111'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div className="mb-4" style={{ color: '#00D4FF' }}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3
                  className="mb-2 text-sm font-semibold leading-tight"
                  style={{ color: '#FFFFFF' }}
                >
                  {service.name}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#8B8B8B' }}>
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
