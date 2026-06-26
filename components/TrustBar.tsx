'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const stats = [
  { value: 28, suffix: '', display: '', label: 'Years Experience' },
  { value: 6000, suffix: '+', display: '', label: 'Customers Served' },
  { value: 3, suffix: '', display: '', label: 'Expert Mechanics' },
  { value: null, suffix: '', display: 'CERTIFIED', label: 'Ontario Safety' },
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
            el.textContent = Math.round(obj.n).toLocaleString() + suffix
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
        background: '#0D0D0D',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <span
              ref={el => {
                countRefs.current[i] = el
              }}
              className="text-4xl font-bold md:text-5xl"
              style={{ color: '#00D4FF', fontVariantNumeric: 'tabular-nums' }}
            >
              {stat.value !== null ? `0${stat.suffix}` : stat.display}
            </span>
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: '#8B8B8B' }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
