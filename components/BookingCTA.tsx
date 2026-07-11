'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'

export default function BookingCTA() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, var(--color-accent-amber) 0%, var(--color-accent-amber-hover) 100%)',
        borderTop: '1px solid var(--color-border)',
      }}
      className="px-6 py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-4xl font-bold" style={{ color: '#111008' }}>
          READY TO BOOK?
        </h2>
        <p className="mx-auto mb-10 max-w-md text-base" style={{ color: 'rgba(0,0,0,0.7)' }}>
          Tell us what your car needs. We&apos;ll get back to you within the hour.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/book"
            style={{
              display: 'inline-block',
              background: '#111008',
              color: 'var(--color-text-primary)',
              padding: '14px 36px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '3px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#000')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#111008')}
          >
            Book Online
          </Link>
          <a
            href="tel:5194719462"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: '#111008', fontSize: '15px', fontWeight: 600,
              textDecoration: 'underline', textDecorationColor: 'rgba(17,16,8,0.35)',
              textUnderlineOffset: '3px', transition: 'text-decoration-color 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.textDecorationColor = '#111008')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.textDecorationColor = 'rgba(17,16,8,0.35)')}
          >
            <Phone size={18} />
            Or call us: 519.471.9462
          </a>
        </div>
      </div>
    </section>
  )
}
