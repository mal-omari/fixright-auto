'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function AboutPreview() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-preview-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="px-6 py-20"
      style={{ background: '#2A2420', borderTop: '1px solid #3A3430' }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <span className="about-preview-item mb-3 block text-xs tracking-[0.3em] uppercase" style={{ color: '#FF9500', fontFamily: 'monospace' }}>
          Our Story
        </span>
        <h2 className="about-preview-item mb-6 text-4xl font-bold leading-tight" style={{ color: '#F0EDE8' }}>
          MEET YOUR MECHANIC
        </h2>
        <p className="about-preview-item mx-auto mb-4 max-w-2xl text-base leading-relaxed" style={{ color: '#9A8E82' }}>
          Hi, I&apos;m Omar — owner of FixRight Automotive. With over 28 years of combined experience, our team treats every vehicle like it&apos;s our own. We built this garage on a simple promise: honest work, fair prices, and respect for our customers.
        </p>
        <p className="about-preview-item mb-8 text-sm font-medium" style={{ color: '#F0EDE8' }}>
          No pressure. No runaround. Just results you can count on.
        </p>
        <div className="about-preview-item flex items-center justify-center gap-3 mb-8">
          <span style={{ color: '#FF9500', fontSize: '18px' }}>★★★★★</span>
          <span className="text-sm" style={{ color: '#9A8E82' }}>Trusted by 6,000+ London families</span>
        </div>
        <Link
          href="/about"
          className="about-preview-item inline-flex items-center gap-2"
          style={{
            color: '#FF9500', textDecoration: 'none', fontSize: '13px',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            borderBottom: '1px solid rgba(255,149,0,0.4)', paddingBottom: '2px',
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.color = '#E8C547'
            el.style.borderColor = '#E8C547'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.color = '#FF9500'
            el.style.borderColor = 'rgba(255,149,0,0.4)'
          }}
        >
          Learn More About Us
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
