import Footer from "@/components/Footer"
import ContactForm from "@/components/ContactForm"
import { Phone, MapPin, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'

export const metadata: Metadata = {
  title: `Contact Us | ${SITE_CONFIG.business.name} Demo`,
  description: 'Fictional contact page demonstrating configurable garage hours, location, phone, and lead capture.',
}

const HOURS = [
  { day: 'Monday – Friday', time: '8:00am – 5:00pm' },
  { day: 'Saturday', time: '9:00am – 2:00pm' },
  { day: 'Sunday', time: 'Closed' },
]

export default function ContactPage() {
  return (
    <main style={{ background: 'var(--color-bg-primary)' }}>
      {/* Page hero */}
      <section
        style={{
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'block', fontFamily: 'monospace', fontSize: '11px',
            letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-accent-amber)', marginBottom: '16px',
          }}
        >
          We&apos;re here to help
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 56px)', fontWeight: 700,
            color: 'var(--color-text-primary)', letterSpacing: '0.04em', marginBottom: '16px',
          }}
        >
          CONTACT US
        </h1>
        <div style={{ width: '48px', height: '3px', background: 'var(--color-accent-amber)', margin: '0 auto' }} />
      </section>

      {/* Two column layout */}
      <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: '48px', alignItems: 'start' }} className="md:grid-cols-2">
          {/* Left: info */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '28px', letterSpacing: '0.04em' }}>
              FIND US
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: 'var(--radius-sharp)', padding: '10px', flexShrink: 0 }}>
                  <MapPin size={18} color="var(--color-accent-amber)" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px', marginBottom: '4px' }}>Address</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                    {SITE_CONFIG.business.addressLine1}<br />
                    {SITE_CONFIG.business.addressLine2}<br />
                    {SITE_CONFIG.business.city}, {SITE_CONFIG.business.region}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: 'var(--radius-sharp)', padding: '10px', flexShrink: 0 }}>
                  <Phone size={18} color="var(--color-accent-amber)" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px', marginBottom: '4px' }}>Phone</div>
                  <a
                    href={SITE_CONFIG.business.phoneHref}
                    style={{ color: 'var(--color-accent-amber)', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}
                  >
                    {SITE_CONFIG.business.phoneDisplay}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: 'var(--radius-sharp)', padding: '10px', flexShrink: 0 }}>
                  <Clock size={18} color="var(--color-accent-amber)" aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px', marginBottom: '8px' }}>Hours</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {HOURS.map(h => (
                      <div key={h.day} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-text-secondary)', minWidth: '150px' }}>{h.day}</span>
                        <span style={{ color: h.time === 'Closed' ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', fontWeight: h.time === 'Closed' ? 400 : 500, fontStyle: h.time === 'Closed' ? 'italic' : 'normal' }}>
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* A real client deployment replaces this with its verified map. */}
            <div
              style={{
                marginTop: '36px', minHeight: 280, borderRadius: 'var(--radius-sharp)',
                border: '1px solid var(--color-border)', background: 'var(--color-bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
              }}
            >
              <div>
                <MapPin size={32} color="var(--color-accent-amber)" style={{ margin: '0 auto 16px' }} aria-hidden="true" />
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: 8 }}>Map placeholder</p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, lineHeight: 1.6, maxWidth: 320 }}>
                  Client deployments use the garage&apos;s verified address and map listing. This demo does not point to a real business.
                </p>
              </div>
            </div>
          </div>

          {/* Right: contact form */}
          <div
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sharp)',
              padding: '32px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px' }}>
              Try the Contact Form
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
