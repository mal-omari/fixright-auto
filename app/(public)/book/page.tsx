'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { vehicleMakes, vehicleModels, vehicleYears } from '@/lib/vehicleData'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  year: string
  make: string
  model: string
  mileage: string
  issue: string
  useCustomVehicle: boolean
  customVehicle: string
  service: string
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
  useCustomVehicle: false,
  customVehicle: '',
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

const SOURCE_OPTIONS = ['Google', 'Referral', 'Returning Customer', 'Drive-by', 'Other']

const STEPS = ['Contact', 'Vehicle', 'Service', 'Timing', 'Confirm']

// ─── Styles ──────────────────────────────────────────────────────────────────

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: '#1E1A16',
    border: `1px solid ${hasError ? '#FF4444' : '#3A3430'}`,
    borderRadius: '3px',
    color: '#F0EDE8',
    padding: '12px 14px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
  }
}

function labelStyle(): React.CSSProperties {
  return {
    display: 'block',
    marginBottom: '6px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#9A8E82',
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

  function set(key: keyof FormData, value: string | boolean) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'make') next.model = ''
      return next
    })
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
      if (!form.year) errs.year = 'Required'
      if (!form.useCustomVehicle) {
        if (!form.make) errs.make = 'Required'
        if (!form.model) errs.model = 'Required'
      } else {
        if (!form.customVehicle.trim()) errs.customVehicle = 'Please describe your vehicle'
      }
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
      const vehicleDesc = form.useCustomVehicle
        ? form.customVehicle
        : `${form.year} ${form.make} ${form.model}`.trim()
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: `${form.firstName} ${form.lastName}`.trim(),
          customer_phone: form.phone,
          customer_email: form.email || null,
          vehicle_year: form.year ? parseInt(form.year) : null,
          vehicle_make: form.useCustomVehicle ? form.customVehicle : (form.make || null),
          vehicle_model: form.useCustomVehicle ? null : (form.model || null),
          notes: [
            form.mileage ? `Mileage: ${form.mileage}` : '',
            form.issue ? `Issue: ${form.issue}` : '',
            form.useCustomVehicle ? `Vehicle: ${form.customVehicle}` : '',
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

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-24" style={{ background: '#1E1A16' }}>
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle size={72} color="#FF9500" strokeWidth={1} />
          </div>
          <h1 className="mb-4 text-3xl font-bold" style={{ color: '#F0EDE8' }}>
            Booking Received!
          </h1>
          <p className="mb-6 leading-relaxed" style={{ color: '#9A8E82' }}>
            Thanks {form.firstName}! We&apos;ll call you within the hour to confirm your appointment.
          </p>
          <div className="mb-8 rounded p-4" style={{ background: '#2A2420', border: '1px solid #3A3430' }}>
            <p className="text-sm" style={{ color: '#9A8E82' }}>Questions? Call us directly:</p>
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
              display: 'inline-block', background: '#FF9500', color: '#111008',
              padding: '12px 28px', fontWeight: 700, fontSize: '13px',
              letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '3px',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const availableModels = form.make ? (vehicleModels[form.make] ?? []) : []

  return (
    <div className="min-h-screen px-6 py-24" style={{ background: '#1E1A16' }}>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" style={{ color: '#FF9500', textDecoration: 'none', fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em' }}>
            FIXRIGHT{' '}
            <span style={{ color: '#F0EDE8', fontSize: '13px', fontWeight: 500, letterSpacing: '0.2em' }}>
              AUTOMOTIVE
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold" style={{ color: '#F0EDE8' }}>
            Book a Service
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#9A8E82' }}>
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
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: i === step ? '#FF9500' : i < step ? '#9A8E82' : '#4A4540',
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <div style={{ height: '3px', background: '#2A2420', borderRadius: '2px' }}>
            <div
              style={{
                height: '100%',
                width: `${(step / (STEPS.length - 1)) * 100}%`,
                background: '#FF9500',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Form card */}
        <div style={{ background: '#2A2420', border: '1px solid #3A3430', borderRadius: '3px', padding: '32px' }}>

          {/* Step 1 — Contact */}
          {step === 0 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F0EDE8' }}>Contact Info</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label style={labelStyle()}>First Name *</label>
                  <input
                    style={inputStyle(!!errors.firstName)}
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    placeholder="John"
                    onFocus={e => (e.target.style.borderColor = '#FF9500')}
                    onBlur={e => (e.target.style.borderColor = errors.firstName ? '#FF4444' : '#3A3430')}
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
                    onFocus={e => (e.target.style.borderColor = '#FF9500')}
                    onBlur={e => (e.target.style.borderColor = errors.lastName ? '#FF4444' : '#3A3430')}
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
                  onFocus={e => (e.target.style.borderColor = '#FF9500')}
                  onBlur={e => (e.target.style.borderColor = errors.phone ? '#FF4444' : '#3A3430')}
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
                  onFocus={e => (e.target.style.borderColor = '#FF9500')}
                  onBlur={e => (e.target.style.borderColor = '#3A3430')}
                />
              </div>
            </div>
          )}

          {/* Step 2 — Vehicle */}
          {step === 1 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F0EDE8' }}>Vehicle Info</h2>

              {!form.useCustomVehicle ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Year */}
                    <div>
                      <label style={labelStyle()}>Year *</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={{ ...inputStyle(!!errors.year), paddingRight: '36px', cursor: 'pointer' }}
                          value={form.year}
                          onChange={e => set('year', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = '#FF9500')}
                          onBlur={e => (e.target.style.borderColor = errors.year ? '#FF4444' : '#3A3430')}
                        >
                          <option value="">Year</option>
                          {vehicleYears.map(y => (
                            <option key={y} value={String(y)}>{y}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9A8E82', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.year && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.year}</p>}
                    </div>

                    {/* Make */}
                    <div>
                      <label style={labelStyle()}>Make *</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={{ ...inputStyle(!!errors.make), paddingRight: '36px', cursor: 'pointer' }}
                          value={form.make}
                          onChange={e => set('make', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = '#FF9500')}
                          onBlur={e => (e.target.style.borderColor = errors.make ? '#FF4444' : '#3A3430')}
                        >
                          <option value="">Make</option>
                          {vehicleMakes.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9A8E82', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.make && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.make}</p>}
                    </div>

                    {/* Model */}
                    <div>
                      <label style={labelStyle()}>Model *</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={{
                            ...inputStyle(!!errors.model),
                            paddingRight: '36px',
                            cursor: form.make ? 'pointer' : 'not-allowed',
                            opacity: form.make ? 1 : 0.5,
                          }}
                          value={form.model}
                          onChange={e => set('model', e.target.value)}
                          disabled={!form.make}
                          onFocus={e => (e.target.style.borderColor = '#FF9500')}
                          onBlur={e => (e.target.style.borderColor = errors.model ? '#FF4444' : '#3A3430')}
                        >
                          <option value="">{form.make ? 'Model' : 'Select make first'}</option>
                          {availableModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9A8E82', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.model && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.model}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => set('useCustomVehicle', true)}
                    style={{
                      marginTop: '12px', background: 'none', border: 'none', padding: 0,
                      color: '#FF9500', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
                      textDecorationColor: 'rgba(255,149,0,0.4)',
                    }}
                  >
                    Don&apos;t see your vehicle? Just describe it below
                  </button>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3 mb-4">
                    <div>
                      <label style={labelStyle()}>Year *</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          style={{ ...inputStyle(!!errors.year), paddingRight: '36px', cursor: 'pointer' }}
                          value={form.year}
                          onChange={e => set('year', e.target.value)}
                          onFocus={e => (e.target.style.borderColor = '#FF9500')}
                          onBlur={e => (e.target.style.borderColor = errors.year ? '#FF4444' : '#3A3430')}
                        >
                          <option value="">Year</option>
                          {vehicleYears.map(y => (
                            <option key={y} value={String(y)}>{y}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9A8E82', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.year && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.year}</p>}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle()}>Vehicle Description *</label>
                    <input
                      style={inputStyle(!!errors.customVehicle)}
                      value={form.customVehicle}
                      onChange={e => set('customVehicle', e.target.value)}
                      placeholder="e.g. 2008 Ford F-150 SuperCrew"
                      onFocus={e => (e.target.style.borderColor = '#FF9500')}
                      onBlur={e => (e.target.style.borderColor = errors.customVehicle ? '#FF4444' : '#3A3430')}
                    />
                    {errors.customVehicle && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.customVehicle}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => set('useCustomVehicle', false)}
                    style={{
                      marginTop: '10px', background: 'none', border: 'none', padding: 0,
                      color: '#9A8E82', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline',
                    }}
                  >
                    ← Use dropdown instead
                  </button>
                </>
              )}

              <div className="mt-4">
                <label style={labelStyle()}>Approximate Mileage</label>
                <input
                  style={inputStyle()}
                  value={form.mileage}
                  onChange={e => set('mileage', e.target.value)}
                  placeholder="e.g. 95,000 km"
                  onFocus={e => (e.target.style.borderColor = '#FF9500')}
                  onBlur={e => (e.target.style.borderColor = '#3A3430')}
                />
              </div>
              <div className="mt-4">
                <label style={labelStyle()}>Known Issues / Description</label>
                <textarea
                  style={{ ...inputStyle(), resize: 'vertical', minHeight: '100px' }}
                  value={form.issue}
                  onChange={e => set('issue', e.target.value)}
                  placeholder="Describe any symptoms or what the car is doing..."
                  onFocus={e => (e.target.style.borderColor = '#FF9500')}
                  onBlur={e => (e.target.style.borderColor = '#3A3430')}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Service */}
          {step === 2 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F0EDE8' }}>Select a Service</h2>
              {errors.service && (
                <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '12px' }}>{errors.service}</p>
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
                        textAlign: 'left', padding: '14px 16px',
                        background: selected ? 'rgba(255,149,0,0.1)' : '#1E1A16',
                        border: `1px solid ${selected ? '#FF9500' : '#3A3430'}`,
                        borderRadius: '3px',
                        color: selected ? '#FF9500' : '#9A8E82',
                        fontSize: '13px', fontWeight: selected ? 600 : 400,
                        cursor: 'pointer', transition: 'all 0.15s', width: '100%',
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
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F0EDE8' }}>Preferred Timing</h2>
              <div className="mb-4">
                <label style={labelStyle()}>Preferred Date *</label>
                <input
                  style={inputStyle(!!errors.preferredDate)}
                  value={form.preferredDate}
                  onChange={e => set('preferredDate', e.target.value)}
                  type="date"
                  min={today}
                  onFocus={e => (e.target.style.borderColor = '#FF9500')}
                  onBlur={e => (e.target.style.borderColor = errors.preferredDate ? '#FF4444' : '#3A3430')}
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
                          padding: '14px 12px', textAlign: 'center',
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1E1A16',
                          border: `1px solid ${selected ? '#FF9500' : '#3A3430'}`,
                          borderRadius: '3px', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, color: selected ? '#FF9500' : '#F0EDE8' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9A8E82', marginTop: '3px' }}>
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
                          padding: '8px 16px', fontSize: '12px',
                          fontWeight: selected ? 600 : 400,
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1E1A16',
                          border: `1px solid ${selected ? '#FF9500' : '#3A3430'}`,
                          borderRadius: '3px',
                          color: selected ? '#FF9500' : '#9A8E82',
                          cursor: 'pointer', transition: 'all 0.15s',
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

          {/* Step 5 — Confirm */}
          {step === 4 && (
            <div>
              <h2 className="mb-6 text-xl font-bold" style={{ color: '#F0EDE8' }}>Confirm Your Booking</h2>
              <div className="space-y-4">
                {[
                  { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                  { label: 'Phone', value: form.phone },
                  { label: 'Email', value: form.email || '—' },
                  {
                    label: 'Vehicle',
                    value: form.useCustomVehicle
                      ? `${form.year} ${form.customVehicle}`
                      : `${form.year} ${form.make} ${form.model}`,
                  },
                  { label: 'Mileage', value: form.mileage || '—' },
                  { label: 'Issue', value: form.issue || '—' },
                  { label: 'Service', value: form.service },
                  { label: 'Date', value: form.preferredDate },
                  {
                    label: 'Time',
                    value: TIME_OPTIONS.find(t => t.value === form.preferredTime)?.label ?? '—',
                  },
                  { label: 'Heard via', value: form.source },
                ].map(row => (
                  <div
                    key={row.label}
                    className="flex gap-4"
                    style={{ borderBottom: '1px solid #2A2420', paddingBottom: '10px' }}
                  >
                    <span
                      style={{
                        minWidth: '90px', fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8E82',
                      }}
                    >
                      {row.label}
                    </span>
                    <span style={{ fontSize: '14px', color: '#F0EDE8' }}>{row.value}</span>
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
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: '1px solid #3A3430', color: '#9A8E82',
                  padding: '10px 18px', fontSize: '13px', borderRadius: '3px', cursor: 'pointer',
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
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#FF9500', border: 'none', color: '#111008',
                  padding: '11px 24px', fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px', cursor: 'pointer',
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
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: submitting ? '#CC7700' : '#FF9500', border: 'none', color: '#111008',
                  padding: '11px 24px', fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-sm" style={{ color: '#4A4540' }}>
          Prefer to call?{' '}
          <a href="tel:5194719462" style={{ color: '#FF9500', textDecoration: 'none' }}>
            519.471.9462
          </a>
        </p>
      </div>
    </div>
  )
}
