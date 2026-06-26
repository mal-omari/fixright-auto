'use client'

import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Wrench, Settings, Thermometer, Zap, RotateCcw, ShieldCheck, Layers, Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Service {
  icon: LucideIcon
  name: string
  time: string
  description: string
}

const services: Service[] = [
  { icon: Wrench, name: 'Oil Change', time: 'Est. 30 min', description: 'Full synthetic or conventional oil changes with filter replacement and fluid top-up.' },
  { icon: Activity, name: 'Brake Service', time: 'Est. 2 hrs', description: 'Pads, rotors, calipers, and brake fluid flush. We inspect the full brake system.' },
  { icon: Settings, name: 'Engine & Transmission', time: 'Est. 1–2 days', description: 'Complete engine diagnostics, repair, and full transmission service by certified technicians.' },
  { icon: Thermometer, name: 'Heating & A/C', time: 'Est. 3 hrs', description: 'Full HVAC diagnostics, refrigerant recharge, and climate control repair. Ready for every season.' },
  { icon: Zap, name: 'Electrical & Diagnostics', time: 'Est. 1–2 hrs', description: 'OBD-II scanning, starter, alternator, ignition, and complete electrical diagnostics.' },
  { icon: RotateCcw, name: 'Tire Services', time: 'Est. 1 hr', description: 'Tire sales, installation, rotation, and repair. Right tires at fair prices, installed properly.' },
  { icon: ShieldCheck, name: 'Safety Certification', time: 'Est. 2 hrs', description: 'Ontario MTO safety inspections to keep your vehicle road-legal and fully compliant.' },
  { icon: Layers, name: 'Body & Rust Work', time: 'Est. varies', description: 'Rust removal, underbody protection, undercoating, and accident repair to restore structural integrity.' },
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
    const tiltX = -dy * 8
    const tiltY = dx * 8
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-3px)`

    const highlight = card.querySelector('.card-highlight') as HTMLElement | null
    if (highlight) {
      const hx = 50 + dx * 30
      const hy = 50 + dy * 30
      highlight.style.background = `radial-gradient(circle at ${hx}% ${hy}%, rgba(255,149,0,0.12), transparent 70%)`
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.borderColor = 'rgba(255,149,0,0.5)'
    card.style.boxShadow = '0 0 32px rgba(255,149,0,0.12)'
    card.style.animation = 'rumble 0.3s ease-out 1'
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)'
    card.style.transition = 'transform 0.5s ease, border-color 0.3s, box-shadow 0.3s'
    card.style.borderColor = '#3A3430'
    card.style.boxShadow = 'none'
    card.style.animation = ''
    const highlight = card.querySelector('.card-highlight') as HTMLElement | null
    if (highlight) highlight.style.background = 'transparent'
  }, [])

  return (
    <div
      ref={cardRef}
      className="service-card group relative cursor-default p-6"
      style={{
        background: '#2A2420',
        border: '1px solid #3A3430',
        borderRadius: '3px',
        transition: 'transform 0.15s ease, border-color 0.3s, box-shadow 0.3s',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-highlight absolute inset-0 rounded pointer-events-none" style={{ transition: 'background 0.3s', borderRadius: '3px' }} />
      <div className="relative">
        <div className="mb-3" style={{ color: '#FF9500' }}>
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <h3 className="mb-1 text-sm font-semibold leading-tight" style={{ color: '#F0EDE8' }}>
          {service.name}
        </h3>
        <p className="mb-3 text-xs font-medium" style={{ color: '#FF9500', opacity: 0.85 }}>
          {service.time}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#9A8E82' }}>
          {service.description}
        </p>
      </div>
    </div>
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
          scrollTrigger: { trigger: gridRef.current, start: 'top 78%' },
        }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="services" style={{ background: '#1E1A16' }} className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold tracking-tight" style={{ color: '#F0EDE8' }}>
            OUR SERVICES
          </h2>
          <div className="mx-auto mt-4 h-1 w-16" style={{ background: '#FF9500', borderRadius: '1px' }} />
        </div>
        <div ref={gridRef} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
