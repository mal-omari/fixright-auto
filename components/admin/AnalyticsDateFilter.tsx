'use client'

export type PresetKey = 'today' | 'week' | 'month' | '3months' | 'year'

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '3months', label: 'Last 3 Months' },
  { key: 'year', label: 'This Year' },
]

interface Props {
  value: PresetKey
  onChange: (preset: PresetKey) => void
}

export function AnalyticsDateFilter({ value, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
      {PRESETS.map(({ key, label }) => {
        const active = key === value
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '9px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              border: active ? '1px solid #FF9500' : '1px solid #2A2420',
              background: active ? 'rgba(255,149,0,0.12)' : 'transparent',
              color: active ? '#FF9500' : '#9A8E82',
              transition: 'border-color 0.15s, background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              if (!active) e.currentTarget.style.borderColor = 'rgba(255,149,0,0.4)'
            }}
            onMouseLeave={e => {
              if (!active) e.currentTarget.style.borderColor = '#2A2420'
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
