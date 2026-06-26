'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DollarSign, Search, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: DollarSign,
    title: 'No Dealer Markup',
    body: 'Get dealership-level service at fair, honest prices. We tell you what your car needs — nothing more.',
  },
  {
    icon: Search,
    title: 'Honest Diagnostics',
    body: 'We explain everything before we touch your car. No surprise charges, no upselling.',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty on All Work',
    body: 'Every repair is backed by our workmanship guarantee. We stand behind what we do.',
  },
]

export default function WhyFixRight() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.why-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ background: '#1E1A16', borderTop: '1px solid #2A2420' }}
      className="px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold tracking-tight" style={{ color: '#F0EDE8' }}>
            WHY CHOOSE FIXRIGHT?
          </h2>
          <div className="mx-auto mt-4 h-1 w-16" style={{ background: '#FF9500', borderRadius: '1px' }} />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <div
                key={i}
                className="why-card p-8"
                style={{
                  background: '#2A2420',
                  borderRadius: '3px',
                  border: '1px solid #3A3430',
                  borderTopColor: '#FF9500',
                  borderTopWidth: '3px',
                }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center"
                  style={{ background: 'rgba(255,149,0,0.1)', borderRadius: '3px' }}
                >
                  <Icon size={24} color="#FF9500" strokeWidth={1.5} />
                </div>
                <h3 className="mb-3 text-lg font-bold tracking-wide" style={{ color: '#F0EDE8' }}>
                  {feat.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9A8E82' }}>
                  {feat.body}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
