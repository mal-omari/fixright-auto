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
        background: '#0D0D0D',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        {/* Text column */}
        <div className="about-text">
          <span
            className="mb-4 block font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: '#00D4FF' }}
          >
            Our Story
          </span>
          <h2
            className="mb-8 text-5xl font-bold leading-none tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            ABOUT
            <br />
            FIXRIGHT
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: '#8B8B8B' }}>
            <p>
              Omar has been turning wrenches for over 28 years — with 19 of them dedicated
              to the families and drivers of London, Ontario. FixRight Auto isn't a franchise
              or a chain. It's a real garage, run by a real mechanic who takes genuine pride
              in every vehicle that comes through the door.
            </p>
            <p>
              No upsells. No scare tactics. Just honest diagnostics, transparent pricing, and
              work done right the first time. Whether you need a safety certification, an
              engine rebuild, or a simple oil change — you'll get the same level of attention
              and care.
            </p>
          </div>

          <div className="mt-10 flex gap-10">
            <div className="flex gap-3">
              <div
                className="mt-1 w-0.5"
                style={{ background: '#00D4FF', minHeight: '42px', alignSelf: 'stretch' }}
              />
              <div>
                <div className="font-semibold" style={{ color: '#FFFFFF' }}>
                  Ontario Certified
                </div>
                <div className="text-sm" style={{ color: '#8B8B8B' }}>
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
                <div className="font-semibold" style={{ color: '#FFFFFF' }}>
                  Fair & Transparent
                </div>
                <div className="text-sm" style={{ color: '#8B8B8B' }}>
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
