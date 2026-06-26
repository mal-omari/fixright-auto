'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const stats = [
  { value: 28, suffix: '', label: 'Years Experience' },
  { value: 6000, suffix: '+', label: 'Vehicles Serviced' },
  { value: 3, suffix: '', label: 'Certified Mechanics' },
  { value: null, display: 'CERTIFIED', label: 'Ontario Safety' },
  { value: null, display: 'FAMILY', label: 'Owned & Operated' },
]

export default function TrustBar() {
  const barRef = useRef<HTMLDivElement>(null)
  const countRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      stats.forEach((stat, i) => {
        if (stat.value === null) return
        const el = countRefs.current[i]
        if (!el) return
        const obj = { n: 0 }
        const { suffix } = stat
        gsap.to(obj, {
          n: stat.value,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = Math.round(obj.n).toLocaleString() + (suffix ?? '')
          },
          scrollTrigger: {
            trigger: barRef.current,
            start: 'top 85%',
            once: true,
          },
        })
      })
    }, barRef)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={barRef}
      style={{
        background: '#242424',
        borderTop: '1px solid #333333',
        borderBottom: '1px solid #333333',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <span
                ref={el => {
                  countRefs.current[i] = el
                }}
                className="text-3xl font-bold md:text-4xl"
                style={{ color: '#FF9500', fontVariantNumeric: 'tabular-nums' }}
              >
                {stat.value !== null ? `0${stat.suffix ?? ''}` : (stat.display ?? '')}
              </span>
              <span
                className="text-xs tracking-[0.18em] uppercase"
                style={{ color: '#A0A0A0' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
