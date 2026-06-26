'use client'

import Link from 'next/link'
import { Phone, MapPin, Clock } from 'lucide-react'

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer
      style={{
        background: '#111008',
        borderTop: '1px solid #2A2420',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand column */}
          <div>
            <div className="mb-4">
              <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em', color: '#FF9500' }}>
                FIXRIGHT
              </span>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', color: '#F0EDE8', marginTop: '2px' }}>
                AUTOMOTIVE
              </span>
            </div>
            <p className="mb-4 text-sm leading-relaxed" style={{ color: '#9A8E82' }}>
              London Ontario&apos;s trusted independent garage since 1996.
            </p>
            <p className="mb-6 text-sm italic font-medium" style={{ color: '#FF9500' }}>
              &quot;Honest work. Fair prices. Every time.&quot;
            </p>
            {/* Social placeholders */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '4px',
                  background: '#2A2420', border: '1px solid #3A3430',
                  color: '#9A8E82', cursor: 'default',
                }}
                title="Facebook (coming soon)"
              >
                <FacebookIcon />
              </button>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', borderRadius: '4px',
                  background: '#2A2420', border: '1px solid #3A3430',
                  color: '#9A8E82', cursor: 'default',
                }}
                title="Google (coming soon)"
              >
                <GoogleIcon />
              </button>
            </div>
          </div>

          {/* Hours & Contact */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#FF9500' }}>
              Hours & Contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock size={14} color="#9A8E82" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div className="text-sm" style={{ color: '#9A8E82' }}>
                  <div>Mon – Fri: 8:00am – 5:00pm</div>
                  <div>Saturday: 9:00am – 2:00pm</div>
                  <div>Sunday: Closed</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={14} color="#9A8E82" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div className="text-sm" style={{ color: '#9A8E82' }}>
                  2117 Aldersbrook Rd<br />
                  (At Wonderland Rd &amp; Fanshawe Park Rd)<br />
                  London ON N6G 3X1
                </div>
              </div>
              <a
                href="tel:5194719462"
                className="flex items-center gap-3 text-sm transition-colors"
                style={{ color: '#9A8E82', textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FF9500')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#9A8E82')}
              >
                <Phone size={14} />
                519.471.9462
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#FF9500' }}>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Services', href: '/services' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Book a Service', href: '/book' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: '#9A8E82', textDecoration: 'none' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#FF9500')}
                    onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#9A8E82')}
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
          style={{ borderColor: '#2A2420' }}
        >
          <p className="text-xs" style={{ color: '#4A4540' }}>
            © {new Date().getFullYear()} FixRight Automotive. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: '#4A4540' }}>
            London, Ontario · Est. 1996
          </p>
        </div>
      </div>
    </footer>
  )
}
