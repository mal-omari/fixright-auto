import Footer from "@/components/Footer"
import ContactForm from "@/components/ContactForm"
import { Phone, MapPin, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Contact Us | FixRight Automotive London Ontario",
  description: "Visit FixRight Automotive at 2117 Aldersbrook Rd, London ON, call 519.471.9462, or send us a message. Open Monday to Saturday.",
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
                    2117 Aldersbrook Rd<br />
                    (At Wonderland Rd &amp; Fanshawe Park Rd)<br />
                    London ON N6G 3X1
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
                    href="tel:5194719462"
                    style={{ color: 'var(--color-accent-amber)', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}
                  >
                    519.471.9462
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

            {/* Google Maps embed */}
            <div style={{ marginTop: '36px', borderRadius: 'var(--radius-sharp)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <iframe
                src="https://maps.google.com/maps?q=2117+Aldersbrook+Rd,+London+ON+N6G+3X1&output=embed&iwloc=B"
                width="100%"
                height="280"
                style={{ border: 0, display: 'block', filter: 'grayscale(0.3) invert(0.9) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="FixRight Automotive location"
              />
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
              Send a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
