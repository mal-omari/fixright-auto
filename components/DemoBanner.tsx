import { SITE_CONFIG } from '@/lib/site-config'

export function DemoBanner() {
  if (!SITE_CONFIG.demo.enabled) return null

  return (
    <div
      role="note"
      style={{
        position: 'fixed',
        inset: '0 0 auto 0',
        zIndex: 140,
        minHeight: 30,
        padding: '7px 16px',
        background: '#FF9500',
        color: '#111008',
        fontFamily: 'var(--font-heading), sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        lineHeight: 1.4,
        textAlign: 'center',
        textTransform: 'uppercase',
      }}
    >
      {SITE_CONFIG.demo.label} · {SITE_CONFIG.demo.notice}
    </div>
  )
}
