'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontFamily: 'var(--font-heading), sans-serif',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
}

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Request failed')

      setSent(true)
      setForm({ name: '', phone: '', message: '' })
    } catch {
      setError('Something went wrong. Please call us at 519.471.9462')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '40px 0' }}>
        <div aria-hidden="true" style={{ fontSize: '40px', marginBottom: '16px', color: 'var(--color-accent-amber)' }}>✓</div>
        <p style={{ color: 'var(--color-accent-amber)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
          Message sent! Omar will call you back shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <label style={labelStyle} htmlFor="contact-name">Name</label>
        <Input
          id="contact-name"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Your name"
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="contact-phone">Phone</label>
        <Input
          id="contact-phone"
          value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="519-555-0100"
          type="tel"
          autoComplete="tel"
          required
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="contact-message">Message</label>
        <Textarea
          id="contact-message"
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Tell us about your vehicle or what you need..."
          required
        />
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '13px', margin: 0 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: 'var(--color-accent-amber)', color: '#111008', padding: '13px 24px',
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', border: 'none', borderRadius: 'var(--radius-sharp)',
          cursor: submitting ? 'default' : 'pointer',
          opacity: submitting ? 0.7 : 1,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--color-accent-amber-hover)' }}
        onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--color-accent-amber)' }}
      >
        <Send size={14} aria-hidden="true" />
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
