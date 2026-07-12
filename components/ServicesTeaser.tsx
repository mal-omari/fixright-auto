'use client'

import Link from 'next/link'
import { Wrench, Zap, ShieldCheck, Layers, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface Category {
  icon: LucideIcon
  name: string
  iconBg: string
  iconColor: string
}

// Icon accents follow DESIGN.md: amber is the working color; cyan is reserved
// for the diagnostic signal; gold marks certification. No other hues.
const categories: Category[] = [
  { icon: Wrench,      name: 'Maintenance', iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
  { icon: Zap,         name: 'Electrical',  iconBg: 'rgba(0,212,255,0.1)',  iconColor: 'var(--color-accent-cyan)' },
  { icon: ShieldCheck, name: 'Safety',      iconBg: 'rgba(232,197,71,0.12)', iconColor: 'var(--color-accent-gold)' },
  { icon: Layers,      name: 'Body',        iconBg: 'rgba(255,149,0,0.12)', iconColor: 'var(--color-accent-amber)' },
]

export default function ServicesTeaser() {
  return (
    <section style={{ background: 'var(--color-bg-primary)' }} className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            WHAT WE SERVICE
          </h2>
          <div className="mx-auto mt-4 h-1 w-16" style={{ background: 'var(--color-accent-amber)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <Card key={category.name} variant="public" interactive className="flex flex-col items-center text-center">
                <div
                  className="mb-4"
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: category.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: category.iconColor }} />
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: '15px', fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase', color: 'var(--color-text-primary)',
                  }}
                >
                  {category.name}
                </h3>
              </Card>
            )
          })}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2"
            style={{
              color: 'var(--color-accent-amber)', textDecoration: 'none', fontSize: '13px',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              borderBottom: '1px solid rgba(255,149,0,0.4)', paddingBottom: '2px',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'var(--color-accent-gold)'
              el.style.borderColor = 'var(--color-accent-gold)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.color = 'var(--color-accent-amber)'
              el.style.borderColor = 'rgba(255,149,0,0.4)'
            }}
          >
            View All Services
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
