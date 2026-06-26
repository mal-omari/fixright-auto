'use client'

import Link from 'next/link'
import { Phone, MapPin, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#111111',
        borderTop: '1px solid #222222',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Metal grid texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.015) 39px, rgba(255,255,255,0.015) 40px)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand column */}
          <div>
            <div className="mb-4">
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  color: '#FF9500',
                }}
              >
                FIXRIGHT
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.25em',
                  color: '#F5F5F5',
                  marginTop: '2px',
                }}
              >
                AUTOMOTIVE
              </span>
            </div>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>
              London Ontario&apos;s trusted independent garage since 1996. Honest work, fair prices,
              every single time.
            </p>
            <p
              className="text-xs italic"
              style={{ color: '#666', letterSpacing: '0.05em' }}
            >
              &quot;Honest work. Fair prices. Every time.&quot;
            </p>
          </div>

          {/* Hours & Contact */}
          <div>
            <h3
              className="mb-5 text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: '#FF9500' }}
            >
              Hours & Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock size={14} color="#A0A0A0" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div className="text-sm" style={{ color: '#A0A0A0' }}>
                  <div>Mon – Fri: 8:00am – 5:00pm</div>
                  <div>Saturday: 9:00am – 2:00pm</div>
                  <div>Sunday: Closed</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} color="#A0A0A0" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div className="text-sm" style={{ color: '#A0A0A0' }}>
                  2117 Aldersbrook Rd
                  <br />
                  (At Wonderland Rd &amp; Fanshawe Park Rd)
                  <br />
                  London ON N6G 3X1
                </div>
              </div>
              <a
                href="tel:5194719462"
                className="flex items-center gap-3 text-sm transition-colors"
                style={{ color: '#A0A0A0', textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FF9500')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A0A0A0')}
              >
                <Phone size={14} />
                519.471.9462
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="mb-5 text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: '#FF9500' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/#services' },
                { label: 'Book a Service', href: '/book' },
                { label: 'About Us', href: '/#about' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: '#A0A0A0', textDecoration: 'none' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FF9500')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#A0A0A0')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center sm:flex-row"
          style={{ borderColor: '#222222' }}
        >
          <p className="text-xs" style={{ color: '#555' }}>
            © {new Date().getFullYear()} FixRight Automotive. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#555' }}>
            London, Ontario · Est. 1996
          </p>
        </div>
      </div>
    </footer>
  )
}
