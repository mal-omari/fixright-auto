'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import GarageScene from './GarageScene'

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-text',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      )
      gsap.fromTo(
        '.about-visual',
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="px-6 py-24"
      style={{
        background: '#242424',
        borderTop: '1px solid #333333',
      }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        {/* Text column */}
        <div className="about-text">
          <span
            className="mb-4 block text-xs tracking-[0.3em] uppercase"
            style={{ color: '#FF9500', fontFamily: 'monospace' }}
          >
            Our Story
          </span>
          <h2
            className="mb-8 text-5xl font-bold leading-none tracking-tight"
            style={{ color: '#F5F5F5' }}
          >
            MEET YOUR
            <br />
            MECHANIC
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: '#A0A0A0' }}>
            <p>
              Hi, I'm Omar — owner of FixRight Automotive. With over 28 years of combined
              experience, our team treats every vehicle like it's our own. We built this garage
              on a simple promise: honest work, fair prices, and respect for our customers.
            </p>
            <p>
              No pressure. No runaround. Just results you can count on.
            </p>
            <p style={{ color: '#F5F5F5', fontWeight: 500 }}>
              Currently serving London, Ontario for 19 years and counting.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <span style={{ color: '#FF9500', fontSize: '16px' }}>★★★★★</span>
            <span className="text-sm" style={{ color: '#A0A0A0' }}>
              Trusted by 6,000+ London families
            </span>
          </div>

          <div className="mt-10 flex gap-10">
            <div className="flex gap-3">
              <div
                className="mt-1 w-0.5"
                style={{ background: '#FF9500', minHeight: '42px', alignSelf: 'stretch' }}
              />
              <div>
                <div className="font-semibold" style={{ color: '#F5F5F5' }}>
                  Ontario Certified
                </div>
                <div className="text-sm" style={{ color: '#A0A0A0' }}>
                  MTO Safety Inspections
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className="mt-1 w-0.5"
                style={{ background: '#FF9500', minHeight: '42px', alignSelf: 'stretch' }}
              />
              <div>
                <div className="font-semibold" style={{ color: '#F5F5F5' }}>
                  Fair & Transparent
                </div>
                <div className="text-sm" style={{ color: '#A0A0A0' }}>
                  No surprise charges
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual column */}
        <div className="about-visual">
          <GarageScene />
        </div>
      </div>
    </section>
  )
}
