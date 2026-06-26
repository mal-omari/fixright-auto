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
  time: string
  description: string
}

const services: Service[] = [
  {
    icon: Wrench,
    name: 'Oil Change',
    time: 'Est. 30 min',
    description: 'Full synthetic or conventional oil changes with filter replacement and fluid top-up.',
  },
  {
    icon: Activity,
    name: 'Brake Service',
    time: 'Est. 2 hrs',
    description: 'Pads, rotors, calipers, and brake fluid flush. We inspect the full brake system.',
  },
  {
    icon: Settings,
    name: 'Engine & Transmission',
    time: 'Est. 1–2 days',
    description: 'Complete engine diagnostics, repair, and full transmission service by certified technicians.',
  },
  {
    icon: Thermometer,
    name: 'Heating & A/C',
    time: 'Est. 3 hrs',
    description: 'Full HVAC diagnostics, refrigerant recharge, and climate control repair. Ready for every season.',
  },
  {
    icon: Zap,
    name: 'Electrical & Diagnostics',
    time: 'Est. 1–2 hrs',
    description: 'OBD-II scanning, starter, alternator, ignition, and complete electrical diagnostics.',
  },
  {
    icon: RotateCcw,
    name: 'Tire Services',
    time: 'Est. 1 hr',
    description: 'Tire sales, installation, rotation, and repair. Right tires at fair prices, installed properly.',
  },
  {
    icon: ShieldCheck,
    name: 'Safety Certification',
    time: 'Est. 2 hrs',
    description: 'Ontario MTO safety inspections to keep your vehicle road-legal and fully compliant.',
  },
  {
    icon: Layers,
    name: 'Body & Rust Work',
    time: 'Est. varies',
    description: 'Rust removal, underbody protection, undercoating, and accident repair to restore structural integrity.',
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
    <section id="services" style={{ background: '#1A1A1A' }} className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold tracking-tight" style={{ color: '#F5F5F5' }}>
            OUR SERVICES
          </h2>
          <div
            className="mx-auto mt-4 h-1 w-16"
            style={{ background: '#FF9500', borderRadius: '1px' }}
          />
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
                  background: '#242424',
                  border: '1px solid #333333',
                  borderRadius: '2px',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = 'rgba(255,149,0,0.5)'
                  el.style.background = '#292929'
                  el.style.boxShadow = '0 0 28px rgba(255,149,0,0.12)'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.borderColor = '#333333'
                  el.style.background = '#242424'
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <div className="mb-3" style={{ color: '#FF9500' }}>
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <h3
                  className="mb-1 text-sm font-semibold leading-tight"
                  style={{ color: '#F5F5F5' }}
                >
                  {service.name}
                </h3>
                <p
                  className="mb-3 text-xs font-medium"
                  style={{ color: '#FF9500', opacity: 0.8 }}
                >
                  {service.time}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#A0A0A0' }}>
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
