'use client'

import { useEffect, useRef } from 'react'

interface FuelGaugeProps {
  value: number
  max: number
  label: string
  showTicks?: boolean
}

export function FuelGauge({ value, max, label, showTicks = true }: FuelGaugeProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isHigh = pct >= 80
  const isMid = pct >= 60 && pct < 80

  let fillColor: string
  if (isHigh) {
    fillColor = '#EF4444'
  } else if (isMid) {
    fillColor = `linear-gradient(90deg, #FF9500, #EF4444)`
  } else {
    fillColor = `linear-gradient(90deg, #FF9500, #FF6B00)`
  }

  useEffect(() => {
    const el = fillRef.current
    if (!el) return
    el.style.width = '0%'
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      el.style.width = `${pct}%`
    })
    return () => cancelAnimationFrame(raf)
  }, [pct])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#9A8E82',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '12px', fontWeight: 600, color: isHigh ? '#EF4444' : '#FF9500',
        }}>
          {value} / {max} hrs
        </span>
      </div>
      <div
        style={{
          position: 'relative', height: 32, background: '#0D0B08',
          border: '1px solid #2A2420', borderRadius: 4, overflow: 'hidden',
        }}
      >
        <div
          ref={fillRef}
          className={isHigh ? 'gauge-pulse' : undefined}
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            background: fillColor,
            borderRadius: 3,
          }}
        />
        {showTicks && [25, 50, 75].map(tick => (
          <div
            key={tick}
            style={{
              position: 'absolute', left: `${tick}%`, top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 1, height: 12,
              background: 'rgba(42,36,32,0.7)',
              zIndex: 2, pointerEvents: 'none',
            }}
          />
        ))}
        {pct > 30 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 700, color: '#fff',
            zIndex: 3, pointerEvents: 'none', letterSpacing: '0.05em',
          }}>
            {Math.round(pct)}%
          </div>
        )}
      </div>
    </div>
  )
}
