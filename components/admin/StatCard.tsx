'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  trend?: number | null
  icon: LucideIcon
  iconBg: string
  iconColor: string
  delay?: number
  format?: (n: number) => string
  href?: string
}

function defaultFormat(n: number): string {
  if (n >= 1000) return n.toLocaleString()
  return String(Math.round(n))
}

export function StatCard({
  label, value, trend, icon: Icon, iconBg, iconColor, delay = 0, format = defaultFormat, href,
}: StatCardProps) {
  const numRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = numRef.current
    if (!el) return
    const start = performance.now() + delay
    let raf: number

    function tick(now: number) {
      if (now < start) { raf = requestAnimationFrame(tick); return }
      const elapsed = now - start
      const duration = 1200
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      el!.textContent = format(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, delay, format])

  const card = (
    <div
      ref={cardRef}
      style={{
        background: '#1E1C18', border: '1px solid #2A2420',
        borderRadius: 12, padding: 24, minHeight: 120,
        transition: 'border-color 0.2s, transform 0.15s',
        cursor: href ? 'pointer' : 'default',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,149,0,0.5)'
        if (href) e.currentTarget.style.transform = 'scale(1.02)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#2A2420'
        if (href) e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {href && (
        <ArrowUpRight
          size={14}
          style={{ position: 'absolute', top: 12, right: 12, color: '#4A4540' }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {trend !== null && trend !== undefined && (
          <div style={{
            fontSize: '11px', fontWeight: 600,
            color: trend > 0 ? '#4ADE80' : trend < 0 ? '#EF4444' : '#6B6560',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '—'}
            {trend !== 0 && Math.abs(trend)}
          </div>
        )}
      </div>
      <div
        ref={numRef}
        style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '40px', fontWeight: 700, color: '#F0EDE8', lineHeight: 1,
        }}
      >
        0
      </div>
      <div style={{
        fontFamily: 'var(--font-heading), sans-serif',
        fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#6B6560', marginTop: 8,
      }}>
        {label}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
        {card}
      </Link>
    )
  }
  return card
}
