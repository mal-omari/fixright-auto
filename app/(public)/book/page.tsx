'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Phone, CheckCircle, ArrowLeft, ArrowRight, Sun, Clock, CalendarDays } from 'lucide-react'
import { vehicleMakes, vehicleModels, vehicleYears } from '@/lib/vehicleData'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'

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
  estimatedHours: number | null
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
  estimatedHours: null,
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
  { value: 'Morning (8:00am – 11:00am)', label: 'MORNING', sub: '8:00am – 11:00am', icon: Sun },
  { value: 'Afternoon (12:00pm – 4:00pm)', label: 'AFTERNOON', sub: '12:00pm – 4:00pm', icon: Clock },
  { value: 'Flexible', label: 'FLEXIBLE', sub: 'Any time works', icon: CheckCircle },
]

const SOURCE_OPTIONS = ['Google', 'Referral', 'Returning Customer', 'Drive-by', 'Other']

const STEPS = ['Contact', 'Vehicle', 'Service', 'Timing', 'Confirm']

// Mirrors app/api/bookings/route.ts so invalid input is caught before the
// user reaches the confirm step instead of failing on final submit.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+()./\-\s]{7,30}$/

const MAX = {
  name: 100,
  phone: 30,
  email: 254,
  customVehicle: 100,
  mileage: 50,
  issue: 800,
}

function getTodayEastern(): string {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Toronto' }))
  const year = easternTime.getFullYear()
  const month = String(easternTime.getMonth() + 1).padStart(2, '0')
  const day = String(easternTime.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    width: '100%',
    background: 'var(--color-bg-primary)',
    border: `1px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: '3px',
    color: 'var(--color-text-primary)',
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
    fontFamily: 'var(--font-heading), sans-serif',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-secondary)',
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
  const [serviceHours, setServiceHours] = useState<Record<string, number>>({})

  // Fetch service hours on mount
  useEffect(() => {
    createClient()
      .from('services')
      .select('name, estimated_hours')
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, number> = {}
          for (const s of data) {
            map[s.name] = s.estimated_hours
          }
          setServiceHours(map)
        }
      })
  }, [])

  function set(key: keyof FormData, value: string | boolean | number | null) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'make') next.model = ''
      if (key === 'service' && typeof value === 'string') {
        next.estimatedHours = serviceHours[value] ?? null
      }
      return next
    })
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  function validateStep(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {}
    const order: (keyof FormData)[] = []
    if (step === 0) {
      order.push('firstName', 'lastName', 'phone', 'email')
      if (!form.firstName.trim()) errs.firstName = 'Required'
      if (!form.lastName.trim()) errs.lastName = 'Required'
      if (!form.phone.trim()) errs.phone = 'Required'
      else if (!PHONE_RE.test(form.phone.trim())) errs.phone = 'Enter a valid phone number'
      if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errs.email = 'Enter a valid email address'
    }
    if (step === 1) {
      order.push('year', 'make', 'model', 'customVehicle')
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
      order.push('preferredDate')
      if (!form.preferredDate) errs.preferredDate = 'Required'
      if (!form.preferredTime) errs.preferredTime = 'Required'
      if (!form.source) errs.source = 'Required'
    }
    setErrors(errs)
    const firstInvalid = order.find(key => errs[key])
    if (firstInvalid) document.getElementById(firstInvalid)?.focus()
    return Object.keys(errs).length === 0
  }

  function next() {
    if (validateStep()) setStep(s => Math.min(s + 1, 4))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step < 4) next()
    else if (!submitting) submit()
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
          vehicle_make: form.useCustomVehicle ? form.customVehicle : (form.make || null),
          vehicle_model: form.useCustomVehicle ? null : (form.model || null),
          notes: [
            form.mileage ? `Mileage: ${form.mileage}` : '',
            form.issue ? `Issue: ${form.issue}` : '',
            form.useCustomVehicle ? `Vehicle: ${form.customVehicle}` : '',
          ].filter(Boolean).join('\n') || null,
          service_description: form.service,
          estimated_hours: form.estimatedHours ?? null,
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
      if (e instanceof TypeError) {
        setSubmitError('Network error — check your connection and try again, or call us at 519.471.9462.')
      } else {
        setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please call us at 519.471.9462.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 py-24" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle size={72} color="var(--color-accent-amber)" strokeWidth={1} />
          </div>
          <h1 className="mb-4 text-3xl" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading), sans-serif', fontWeight: 700 }}>
            BOOKING RECEIVED!
          </h1>
          <p className="mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Thanks {form.firstName}! We&apos;ll call you within the hour to confirm your appointment.
          </p>
          <div className="mb-8 rounded p-4" style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Questions? Call us directly:</p>
            <a
              href="tel:5194719462"
              className="mt-1 flex items-center justify-center gap-2 text-xl font-bold"
              style={{ color: 'var(--color-accent-amber)', textDecoration: 'none' }}
            >
              <Phone size={20} />
              519.471.9462
            </a>
          </div>
          <Link
            href="/"
            style={{
              display: 'inline-block', background: 'var(--color-accent-amber)', color: '#111008',
              padding: '12px 28px',
              fontFamily: 'var(--font-heading), sans-serif',
              fontWeight: 600, fontSize: '13px',
              letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '3px',
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const today = getTodayEastern()
  const availableModels = form.make ? (vehicleModels[form.make] ?? []) : []

  return (
    <div className="min-h-screen px-6 py-24" style={{ background: 'var(--color-bg-primary)' }}>
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--color-accent-amber)', fontSize: '22px', fontWeight: 700, letterSpacing: '0.05em' }}>
              FIXRIGHT{' '}
            </span>
            <span style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: 400, letterSpacing: '0.2em' }}>
              AUTOMOTIVE
            </span>
          </Link>
          <h1 className="mt-6" style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Book a Service
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
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
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: i === step ? 'var(--color-accent-amber)' : i < step ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <div style={{ height: '3px', background: 'var(--color-bg-surface)' }}>
            <div
              style={{
                height: '100%',
                width: '100%',
                transform: `scaleX(${step / (STEPS.length - 1)})`,
                transformOrigin: 'left',
                background: 'var(--color-accent-amber)',
                transition: 'transform 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '3px', padding: '32px' }}>

          {/* Step 1 — Contact */}
          {step === 0 && (
            <div>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label style={labelStyle()} htmlFor="firstName">First Name *</label>
                  <Input id="firstName" error={!!errors.firstName} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" maxLength={MAX.name} aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'firstName-error' : undefined} />
                  {errors.firstName && <p id="firstName-error" role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label style={labelStyle()} htmlFor="lastName">Last Name *</label>
                  <Input id="lastName" error={!!errors.lastName} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" maxLength={MAX.name} aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'lastName-error' : undefined} />
                  {errors.lastName && <p id="lastName-error" role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.lastName}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label style={labelStyle()} htmlFor="phone">Phone Number *</label>
                <Input id="phone" error={!!errors.phone} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="519-555-0100" type="tel" maxLength={MAX.phone} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} />
                {errors.phone && <p id="phone-error" role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
              </div>
              <div className="mt-4">
                <label style={labelStyle()} htmlFor="email">Email (optional)</label>
                <Input id="email" error={!!errors.email} value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" type="email" maxLength={MAX.email} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                {errors.email && <p id="email-error" role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
              </div>
            </div>
          )}

          {/* Step 2 — Vehicle */}
          {step === 1 && (
            <div>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Info</h2>

              {!form.useCustomVehicle ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label style={labelStyle()} htmlFor="year">Year *</label>
                      <div style={{ position: 'relative' }}>
                        <select id="year" style={{ ...inputStyle(!!errors.year), paddingRight: '36px', cursor: 'pointer' }} value={form.year} aria-invalid={!!errors.year}
                          onChange={e => set('year', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--color-accent-amber)')} onBlur={e => (e.target.style.borderColor = errors.year ? 'var(--color-danger)' : 'var(--color-border)')}>
                          <option value="">Year</option>
                          {vehicleYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.year && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.year}</p>}
                    </div>
                    <div>
                      <label style={labelStyle()} htmlFor="make">Make *</label>
                      <div style={{ position: 'relative' }}>
                        <select id="make" style={{ ...inputStyle(!!errors.make), paddingRight: '36px', cursor: 'pointer' }} value={form.make} aria-invalid={!!errors.make}
                          onChange={e => set('make', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--color-accent-amber)')} onBlur={e => (e.target.style.borderColor = errors.make ? 'var(--color-danger)' : 'var(--color-border)')}>
                          <option value="">Make</option>
                          {vehicleMakes.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.make && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.make}</p>}
                    </div>
                    <div>
                      <label style={labelStyle()} htmlFor="model">Model *</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          id="model"
                          style={{ ...inputStyle(!!errors.model), paddingRight: '36px', cursor: form.make ? 'pointer' : 'not-allowed', opacity: form.make ? 1 : 0.5 }}
                          value={form.model} onChange={e => set('model', e.target.value)} disabled={!form.make} aria-invalid={!!errors.model}
                          onFocus={e => (e.target.style.borderColor = 'var(--color-accent-amber)')} onBlur={e => (e.target.style.borderColor = errors.model ? 'var(--color-danger)' : 'var(--color-border)')}>
                          <option value="">Model</option>
                          {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.model && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.model}</p>}
                    </div>
                  </div>
                  <button type="button" onClick={() => set('useCustomVehicle', true)}
                    style={{ marginTop: '12px', background: 'none', border: 'none', padding: 0, color: 'var(--color-accent-amber)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(255,149,0,0.4)' }}>
                    Don&apos;t see your vehicle? Just describe it below
                  </button>
                </>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3 mb-4">
                    <div>
                      <label style={labelStyle()} htmlFor="year">Year *</label>
                      <div style={{ position: 'relative' }}>
                        <select id="year" style={{ ...inputStyle(!!errors.year), paddingRight: '36px', cursor: 'pointer' }} value={form.year} aria-invalid={!!errors.year}
                          onChange={e => set('year', e.target.value)} onFocus={e => (e.target.style.borderColor = 'var(--color-accent-amber)')} onBlur={e => (e.target.style.borderColor = errors.year ? 'var(--color-danger)' : 'var(--color-border)')}>
                          <option value="">Year</option>
                          {vehicleYears.map(y => <option key={y} value={String(y)}>{y}</option>)}
                        </select>
                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-secondary)', fontSize: '10px' }}>▼</div>
                      </div>
                      {errors.year && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.year}</p>}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle()} htmlFor="customVehicle">Vehicle Description *</label>
                    <input id="customVehicle" style={{ ...inputStyle(!!errors.customVehicle), wordBreak: 'break-word' }} value={form.customVehicle} onChange={e => set('customVehicle', e.target.value)}
                      placeholder="e.g. 2008 Ford F-150 SuperCrew" maxLength={MAX.customVehicle} aria-invalid={!!errors.customVehicle}
                      onFocus={e => (e.target.style.borderColor = 'var(--color-accent-amber)')} onBlur={e => (e.target.style.borderColor = errors.customVehicle ? 'var(--color-danger)' : 'var(--color-border)')} />
                    {errors.customVehicle && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.customVehicle}</p>}
                  </div>
                  <button type="button" onClick={() => set('useCustomVehicle', false)}
                    style={{ marginTop: '10px', background: 'none', border: 'none', padding: 0, color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                    ← Use dropdown instead
                  </button>
                </>
              )}

              <div className="mt-4">
                <label style={labelStyle()} htmlFor="mileage">Approximate Mileage</label>
                <Input id="mileage" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="e.g. 95,000 km" maxLength={MAX.mileage} />
              </div>
              <div className="mt-4">
                <label style={labelStyle()} htmlFor="issue">Known Issues / Description</label>
                <textarea id="issue" style={{ ...inputStyle(), resize: 'vertical', minHeight: '100px' }} value={form.issue}
                  onChange={e => set('issue', e.target.value)} placeholder="Describe any symptoms or what the car is doing..." maxLength={MAX.issue}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-accent-amber)')} onBlur={e => (e.target.style.borderColor = 'var(--color-border)')} />
              </div>
            </div>
          )}

          {/* Step 3 — Service */}
          {step === 2 && (
            <div>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select a Service</h2>
              {errors.service && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginBottom: '12px' }}>{errors.service}</p>}
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
                        background: selected ? 'rgba(255,149,0,0.1)' : 'var(--color-bg-primary)',
                        border: `1px solid ${selected ? 'var(--color-accent-amber)' : 'var(--color-border)'}`,
                        borderRadius: '3px',
                        color: selected ? 'var(--color-accent-amber)' : 'var(--color-text-secondary)',
                        fontSize: '13px', fontWeight: selected ? 600 : 400,
                        cursor: 'pointer', transition: 'all 0.15s', width: '100%',
                        height: '52px', display: 'flex', alignItems: 'center',
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
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Timing</h2>
              <div className="mb-6">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontFamily: 'var(--font-heading), sans-serif', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-accent-amber)' }}>
                  <CalendarDays size={16} /> Select Your Preferred Date
                </label>
                <Input
                  id="preferredDate"
                  error={!!errors.preferredDate}
                  aria-invalid={!!errors.preferredDate}
                  style={{ height: '56px', fontSize: '15px', paddingRight: '14px' }}
                  value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} type="date" min={today} />
                {errors.preferredDate && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.preferredDate}</p>}
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>We&apos;ll confirm the exact time when we call you.</p>
              </div>
              <div className="mb-4">
                <label style={labelStyle()}>Preferred Time *</label>
                {errors.preferredTime && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginBottom: '8px' }}>{errors.preferredTime}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {TIME_OPTIONS.map(opt => {
                    const selected = form.preferredTime === opt.value
                    const Icon = opt.icon
                    return (
                      <button key={opt.value} type="button" onClick={() => set('preferredTime', opt.value)}
                        style={{
                          padding: '16px 12px', textAlign: 'center',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                          background: selected ? 'rgba(255,149,0,0.12)' : '#1E1C18',
                          border: `${selected ? '2px' : '1px'} solid ${selected ? 'var(--color-accent-amber)' : 'var(--color-border)'}`,
                          borderRadius: '3px', cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                        }}>
                        <Icon size={28} color="var(--color-accent-amber)" />
                        <div style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '14px', fontWeight: 600, color: selected ? 'var(--color-accent-amber)' : 'var(--color-text-primary)' }}>{opt.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{opt.sub}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle()}>How did you hear about us? *</label>
                {errors.source && <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '12px', marginBottom: '8px' }}>{errors.source}</p>}
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map(opt => {
                    const selected = form.source === opt
                    return (
                      <button key={opt} type="button" onClick={() => set('source', opt)}
                        style={{
                          padding: '8px 16px', minHeight: '44px', fontSize: '12px',
                          fontFamily: 'var(--font-heading), sans-serif',
                          fontWeight: selected ? 600 : 500,
                          background: selected ? 'rgba(255,149,0,0.1)' : 'var(--color-bg-primary)',
                          border: `1px solid ${selected ? 'var(--color-accent-amber)' : 'var(--color-border)'}`,
                          borderRadius: '3px',
                          color: selected ? 'var(--color-accent-amber)' : 'var(--color-text-secondary)',
                          cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
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
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm Your Booking</h2>
              <div className="space-y-4">
                {[
                  { label: 'Name', value: `${form.firstName} ${form.lastName}` },
                  { label: 'Phone', value: form.phone },
                  { label: 'Email', value: form.email || '—' },
                  { label: 'Vehicle', value: form.useCustomVehicle ? `${form.year} ${form.customVehicle}` : `${form.year} ${form.make} ${form.model}` },
                  { label: 'Mileage', value: form.mileage || '—' },
                  { label: 'Issue', value: form.issue || '—' },
                  { label: 'Service', value: form.service },
                  { label: 'Date', value: form.preferredDate },
                  { label: 'Time', value: TIME_OPTIONS.find(t => t.value === form.preferredTime)?.label ?? '—' },
                  { label: 'Heard via', value: form.source },
                ].map(row => (
                  <div key={row.label} className="flex gap-4" style={{ borderBottom: '1px solid var(--color-bg-surface)', paddingBottom: '10px' }}>
                    <span style={{ minWidth: '90px', flexShrink: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', wordBreak: 'break-word', overflowWrap: 'anywhere', minWidth: 0 }}>{row.value}</span>
                  </div>
                ))}
              </div>
              {submitError && (
                <p role="alert" className="mt-4 rounded p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {submitError}
                </p>
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? (
              <button type="button" onClick={back}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                  padding: '0 18px', height: 40,
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '13px', borderRadius: '3px', cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}>
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button type="submit"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'var(--color-accent-amber)', border: 'none', color: '#111008',
                  padding: '0 24px', height: 40,
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px', cursor: 'pointer',
                }}>
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button type="submit" disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: submitting ? 'var(--color-accent-amber-hover)' : 'var(--color-accent-amber)', border: 'none', color: '#111008',
                  padding: '0 24px', height: 40,
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '3px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}>
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </form>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Prefer to call?{' '}
          <a href="tel:5194719462" style={{ color: 'var(--color-accent-amber)', textDecoration: 'none' }}>519.471.9462</a>
        </p>
      </div>
    </div>
  )
}
