'use client'

import { useState } from 'react'
import Footer from "@/components/Footer"
import { Phone, MapPin, Clock, Send } from 'lucide-react'
import type { Metadata } from 'next'

// Note: metadata export in 'use client' components is not supported by Next.js;
// this is handled by the parent layout or a separate server component.
// export const metadata: Metadata = { ... }

const HOURS = [
  { day: 'Monday – Friday', time: '8:00am – 5:00pm' },
  { day: 'Saturday', time: '9:00am – 2:00pm' },
  { day: 'Sunday', time: 'Closed' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1E1A16',
    border: '1px solid #3A3430',
    borderRadius: '3px',
    color: '#F0EDE8',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#9A8E82',
  }

  return (
    <main style={{ background: '#1E1A16' }}>
      {/* Page hero */}
      <section
        style={{
          background: '#2A2420',
          borderBottom: '1px solid #3A3430',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'block', fontFamily: 'monospace', fontSize: '11px',
            letterSpacing: '0.35em', textTransform: 'uppercase', color: '#FF9500', marginBottom: '16px',
          }}
        >
          We&apos;re here to help
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 56px)', fontWeight: 800,
            color: '#F0EDE8', letterSpacing: '0.04em', marginBottom: '16px',
          }}
        >
          CONTACT US
        </h1>
        <div style={{ width: '48px', height: '3px', background: '#FF9500', borderRadius: '2px', margin: '0 auto' }} />
      </section>

      {/* Two column layout */}
      <section style={{ padding: '64px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gap: '48px', alignItems: 'start' }} className="md:grid-cols-2">
          {/* Left: info */}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F0EDE8', marginBottom: '28px', letterSpacing: '0.04em' }}>
              FIND US
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: '3px', padding: '10px', flexShrink: 0 }}>
                  <MapPin size={18} color="#FF9500" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F0EDE8', fontSize: '14px', marginBottom: '4px' }}>Address</div>
                  <div style={{ color: '#9A8E82', fontSize: '14px', lineHeight: 1.6 }}>
                    2117 Aldersbrook Rd<br />
                    (At Wonderland Rd &amp; Fanshawe Park Rd)<br />
                    London ON N6G 3X1
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: '3px', padding: '10px', flexShrink: 0 }}>
                  <Phone size={18} color="#FF9500" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F0EDE8', fontSize: '14px', marginBottom: '4px' }}>Phone</div>
                  <a
                    href="tel:5194719462"
                    style={{ color: '#FF9500', textDecoration: 'none', fontSize: '16px', fontWeight: 700 }}
                  >
                    519.471.9462
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: '3px', padding: '10px', flexShrink: 0 }}>
                  <Clock size={18} color="#FF9500" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#F0EDE8', fontSize: '14px', marginBottom: '8px' }}>Hours</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {HOURS.map(h => (
                      <div key={h.day} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                        <span style={{ color: '#9A8E82', minWidth: '150px' }}>{h.day}</span>
                        <span style={{ color: h.time === 'Closed' ? '#4A4540' : '#F0EDE8', fontWeight: h.time === 'Closed' ? 400 : 500 }}>
                          {h.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps embed */}
            <div style={{ marginTop: '36px', borderRadius: '3px', overflow: 'hidden', border: '1px solid #3A3430' }}>
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
              background: '#2A2420',
              border: '1px solid #3A3430',
              borderRadius: '3px',
              padding: '32px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#F0EDE8', marginBottom: '24px' }}>
              Send a Message
            </h2>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>✓</div>
                <p style={{ color: '#FF9500', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Message received!</p>
                <p style={{ color: '#9A8E82', fontSize: '14px' }}>
                  We&apos;ll get back to you shortly. Or call us directly at{' '}
                  <a href="tel:5194719462" style={{ color: '#FF9500', textDecoration: 'none' }}>519.471.9462</a>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    required
                    onFocus={e => (e.target.style.borderColor = '#FF9500')}
                    onBlur={e => (e.target.style.borderColor = '#3A3430')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="519-555-0100"
                    type="tel"
                    onFocus={e => (e.target.style.borderColor = '#FF9500')}
                    onBlur={e => (e.target.style.borderColor = '#3A3430')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us about your vehicle or what you need..."
                    required
                    onFocus={e => (e.target.style.borderColor = '#FF9500')}
                    onBlur={e => (e.target.style.borderColor = '#3A3430')}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: '#FF9500', color: '#111008', padding: '13px 24px',
                    fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', border: 'none', borderRadius: '3px', cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#E08400')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FF9500')}
                >
                  <Send size={14} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
