'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — Contact
  firstName: string
  lastName: string
  phone: string
  email: string
  // Step 2 — Vehicle
  year: string
  make: string
  model: string
  mileage: string
  issue: string
  // Step 3 — Service
  service: string
  // Step 4 — Timing
  preferredDate: string
  preferredTime: string
  source: string
}

const INITIAL: FormData = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  year: '',
  make: '',
  model: '',
  mileage: '',
  issue: '',
  service: '',
  preferredDate: '',
  preferredTime: '',
  source: '',
}

const SERVICES = [
  'Oil Change',
  'Brake Service',
  'Engine & Transmission',
  'Heating & A/C',
  'Electrical & Diagnostics',
  'Tire Services',
  'Safety Certification',
  'Body & Rust Work',
  'Not sure — need diagnostic',
]

const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', sub: '8:00am – 11:00am' },
  { value: 'afternoon', label: 'Afternoon', sub: '12:00pm – 4:00pm' },
  { value: 'flexible', label: 'Flexible', sub: 'Any time works' },
]

const SOURCE_OPTIONS = [
  'Google',
  'Referral',
  'Returning Customer',
  'Drive-by',
  'Other',
]

const STEPS = ['Contact', 'Vehicle', 'Service', 'Timing', 'Confirm']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function inputStyle(hasError?: boolean) {
  return {
    width: '100%',
    background: '#1A1A1A',
    border: `1px solid ${hasError ? '#FF4444' : '#333333'}`,
    borderRadius: '2px',
    color: '#F5F5F5',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
  } as React.CSSProperties
}

function labelStyle() {
  return {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#A0A0A0',
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BookPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function set(key: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function validateStep(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {}
    if (step === 0) {
      if (!form.firstName.trim()) errs.firstName = 'Required'
      if (!form.lastName.trim()) errs.lastName = 'Required'
      if (!form.phone.trim()) errs.phone = 'Required'
    }
    if (step === 1) {
      if (!form.year.trim()) errs.year = 'Required'
      if (!form.make.trim()) errs.make = 'Required'
      if (!form.model.trim()) errs.model = 'Required'
    }
    if (step === 2) {
      if (!form.service) errs.service = 'Please select a service'
    }
    if (step === 3) {
      if (!form.preferredDate) errs.preferredDate = 'Required'
      if (!form.preferredTime) errs.preferredTime = 'Required'
      if (!form.source) errs.source = 'Required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() {
    if (validateStep()) setStep(s => Math.min(s + 1, 4))
  }

  function back() {
    setStep(s => Math.max(s - 1, 0))
  }

  async function submit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: `${form.firstName} ${form.lastName}`.trim(),
          customer_phone: form.phone,
          customer_email: form.email || null,
          vehicle_year: form.year ? parseInt(form.year) : null,
          vehicle_make: form.make || null,
          vehicle_model: form.model || null,
          notes: [
            form.mileage ? `Mileage: ${form.mileage}` : '',
            form.issue ? `Issue: ${form.issue}` : '',
          ].filter(Boolean).join('\n') || null,
          service_description: form.service,
          preferred_date: form.preferredDate || null,
          preferred_time: form.preferredTime || null,
          source: form.source || null,
          status: 'pending',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Something went wrong. Please call us directly.')
      }
      setSubmitted(true)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Confirmation screen ──────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6 py-24"
        style={{ background: '#1A1A1A' }}
      >
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle size={72} color="#FF9500" strokeWidth={1} />
          </div>
          <h1 className="mb-4 text-3xl font-bold" style={{ color: '#F5F5F5' }}>
            Booking Received!
          </h1>
          <p className="mb-6 leading-relaxed" style={{ color: '#A0A0A0' }}>
            Thanks {form.firstName}! We&apos;ll call you within the hour to confirm your appointment.
          </p>
          <div
            className="mb-8 rounded p-4"
            style={{ background: '#242424', border: '1px solid #333' }}
          >
            <p className="text-sm" style={{ color: '#A0A0A0' }}>
              Questions? Call us directly:
            </p>
            <a
              href="tel:5194719462"
              className="mt-1 flex items-center justify-center gap-2 text-xl font-bold"
              style={{ color: '#FF9500', textDecoration: 'none' }}
            >
              <Phone size={20} />
              519.471.9462
            </a>
          </div>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: '#FF9500',
              color: '#111',
              padding: '12px 28px',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen px-6 py-24" style={{ background: '#1A1A1A' }}>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            style={{ color: '#FF9500', textDecoration: 'none', fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em' }}
          >
            FIXRIGHT <span style={{ color: '#F5F5F5', fontSize: '13px', fontWeight: 500, letterSpacing: '0.2em' }}>AUTOMOTIVE</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold" style={{ color: '#F5F5F5' }}>
            Book a Service
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#A0A0A0' }}>
            Fill in the form below — we&apos;ll confirm by phone within the hour.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-3 flex justify-between">
            {STEPS.map((label, i) => (
              <span
                key={label}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: i === step ? '#FF9500' : i < step ? '#555' : '#444',
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <div style={{ height: '3px', background: '#2A2A2A', borderRadius: '2px' }}>
            <div
              style={{
                height: '100%',
                width: `${((step) / (STEPS.length - 1)) * 100}%`,
                background: '#FF9500',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Form card */}
        <div
          style={{
            background: '#242424',
            border: '1px solid #333333',
            borderRadius: '2px',
            padding: '32px',
          }}
        >
          {/* Step 1 — Contact */}
          {step === 0 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F5F5F5' }}>
                Contact Info
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label style={labelStyle()}>First Name *</label>
                  <input
                    style={inputStyle(!!errors.firstName)}
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    placeholder="John"
                  />
                  {errors.firstName && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label style={labelStyle()}>Last Name *</label>
                  <input
                    style={inputStyle(!!errors.lastName)}
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    placeholder="Smith"
                  />
                  {errors.lastName && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.lastName}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label style={labelStyle()}>Phone Number *</label>
                <input
                  style={inputStyle(!!errors.phone)}
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="519-555-0100"
                  type="tel"
                />
                {errors.phone && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
              </div>
              <div className="mt-4">
                <label style={labelStyle()}>Email (optional)</label>
                <input
                  style={inputStyle()}
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="john@example.com"
                  type="email"
                />
              </div>
            </div>
          )}

          {/* Step 2 — Vehicle */}
          {step === 1 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F5F5F5' }}>
                Vehicle Info
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label style={labelStyle()}>Year *</label>
                  <input
                    style={inputStyle(!!errors.year)}
                    value={form.year}
                    onChange={e => set('year', e.target.value)}
                    placeholder="2018"
                    type="number"
                    min="1960"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.year}</p>}
                </div>
                <div>
                  <label style={labelStyle()}>Make *</label>
                  <input
                    style={inputStyle(!!errors.make)}
                    value={form.make}
                    onChange={e => set('make', e.target.value)}
                    placeholder="Honda"
                  />
                  {errors.make && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.make}</p>}
                </div>
                <div>
                  <label style={labelStyle()}>Model *</label>
                  <input
                    style={inputStyle(!!errors.model)}
                    value={form.model}
                    onChange={e => set('model', e.target.value)}
                    placeholder="Civic"
                  />
                  {errors.model && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.model}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label style={labelStyle()}>Approximate Mileage</label>
                <input
                  style={inputStyle()}
                  value={form.mileage}
                  onChange={e => set('mileage', e.target.value)}
                  placeholder="e.g. 95,000 km"
                />
              </div>
              <div className="mt-4">
                <label style={labelStyle()}>Known Issues / Description</label>
                <textarea
                  style={{
                    ...inputStyle(),
                    resize: 'vertical',
                    minHeight: '100px',
                    fontFamily: 'inherit',
                  }}
                  value={form.issue}
                  onChange={e => set('issue', e.target.value)}
                  placeholder="Describe any symptoms or what the car is doing..."
                />
              </div>
            </div>
          )}

          {/* Step 3 — Service */}
          {step === 2 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F5F5F5' }}>
                Select a Service
              </h2>
              {errors.service && (
                <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '12px' }}>
                  {errors.service}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {SERVICES.map(svc => {
                  const selected = form.service === svc
                  return (
                    <button
                      key={svc}
                      type="button"
                      onClick={() => set('service', svc)}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        background: selected ? 'rgba(255,149,0,0.1)' : '#1A1A1A',
                        border: `1px solid ${selected ? '#FF9500' : '#333333'}`,
                        borderRadius: '2px',
                        color: selected ? '#FF9500' : '#A0A0A0',
                        fontSize: '13px',
                        fontWeight: selected ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        width: '100%',
                      }}
                    >
                      {svc}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 4 — Timing */}
          {step === 3 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F5F5F5' }}>
                Preferred Timing
              </h2>
              <div className="mb-4">
                <label style={labelStyle()}>Preferred Date *</label>
                <input
                  style={inputStyle(!!errors.preferredDate)}
                  value={form.preferredDate}
                  onChange={e => set('preferredDate', e.target.value)}
                  type="date"
                  min={today}
                />
                {errors.preferredDate && (
                  <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.preferredDate}</p>
                )}
              </div>

              <div className="mb-4">
                <label style={labelStyle()}>Preferred Time *</label>
                {errors.preferredTime && (
                  <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '8px' }}>{errors.preferredTime}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-3">
                  {TIME_OPTIONS.map(opt => {
                    const selected = form.preferredTime === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('preferredTime', opt.value)}
                        style={{
                          padding: '14px 12px',
                          textAlign: 'center',
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1A1A1A',
                          border: `1px solid ${selected ? '#FF9500' : '#333333'}`,
                          borderRadius: '2px',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: selected ? '#FF9500' : '#F5F5F5',
                          }}
                        >
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#A0A0A0', marginTop: '3px' }}>
                          {opt.sub}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle()}>How did you hear about us? *</label>
                {errors.source && (
                  <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '8px' }}>{errors.source}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map(opt => {
                    const selected = form.source === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => set('source', opt)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: selected ? 600 : 400,
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1A1A1A',
                          border: `1px solid ${selected ? '#FF9500' : '#333333'}`,
                          borderRadius: '2px',
                          color: selected ? '#FF9500' : '#A0A0A0',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Confirmation Summary */}
          {step === 4 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F5F5F5' }}>
                Confirm Your Booking
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                  { label: 'Phone', value: form.phone },
                  { label: 'Email', value: form.email || '—' },
                  { label: 'Vehicle', value: `${form.year} ${form.make} ${form.model}` },
                  { label: 'Mileage', value: form.mileage || '—' },
                  { label: 'Issue', value: form.issue || '—' },
                  { label: 'Service', value: form.service },
                  { label: 'Date', value: form.preferredDate },
                  { label: 'Time', value: TIME_OPTIONS.find(t => t.value === form.preferredTime)?.label ?? '—' },
                  { label: 'Heard via', value: form.source },
                ].map(row => (
                  <div
                    key={row.label}
                    className="flex gap-4"
                    style={{ borderBottom: '1px solid #2A2A2A', paddingBottom: '10px' }}
                  >
                    <span
                      style={{
                        minWidth: '90px',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#A0A0A0',
                      }}
                    >
                      {row.label}
                    </span>
                    <span style={{ fontSize: '14px', color: '#F5F5F5' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {submitError && (
                <p
                  className="mt-4 rounded p-3 text-sm"
                  style={{ background: 'rgba(255,68,68,0.1)', color: '#FF6666', border: '1px solid rgba(255,68,68,0.2)' }}
                >
                  {submitError}
                </p>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid #333',
                  color: '#A0A0A0',
                  padding: '10px 18px',
                  fontSize: '13px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FF9500',
                  border: 'none',
                  color: '#111',
                  padding: '11px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
              >
                Next
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: submitting ? '#CC7700' : '#FF9500',
                  border: 'none',
                  color: '#111',
                  padding: '11px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  borderRadius: '2px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>

        {/* Footer call */}
        <p className="mt-8 text-center text-sm" style={{ color: '#555' }}>
          Prefer to call?{' '}
          <a href="tel:5194719462" style={{ color: '#FF9500', textDecoration: 'none' }}>
            519.471.9462
          </a>
        </p>
      </div>
    </div>
  )
}
