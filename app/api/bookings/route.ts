import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'
import { generateBookingReceivedEmail } from '@/lib/emails/generateBookingReceived'
import { rateLimit } from '@/lib/rate-limit'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[0-9+()./\-\s]{7,30}$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Single-line text: collapse control chars (also defuses email header injection).
function cleanLine(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[\r\n\t\0]+/g, ' ').trim().slice(0, maxLen).trim()
  return cleaned || null
}

function cleanMultiline(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/\0/g, '').trim().slice(0, maxLen).trim()
  return cleaned || null
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!rateLimit(`bookings:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many booking requests. Please call us at 519.471.9462.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const customer_name = cleanLine(body.customer_name, 200)
    const customer_phone = cleanLine(body.customer_phone, 30)
    const customer_email = cleanLine(body.customer_email, 254)
    const vehicle_make = cleanLine(body.vehicle_make, 100)
    const vehicle_model = cleanLine(body.vehicle_model, 100)
    const notes = cleanMultiline(body.notes, 5000)
    const service_description = cleanLine(body.service_description, 200)
    const preferred_date = cleanLine(body.preferred_date, 10)
    const preferred_time = cleanLine(body.preferred_time, 100)
    const source = cleanLine(body.source, 100)

    if (!customer_name || !customer_phone) {
      return NextResponse.json(
        { error: 'customer_name and customer_phone are required' },
        { status: 400 }
      )
    }
    if (!PHONE_RE.test(customer_phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    if (customer_email && !EMAIL_RE.test(customer_email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (preferred_date && !DATE_RE.test(preferred_date)) {
      return NextResponse.json({ error: 'Invalid preferred date' }, { status: 400 })
    }

    const vehicle_year = Number.isInteger(body.vehicle_year) &&
      body.vehicle_year >= 1900 && body.vehicle_year <= 2100
      ? (body.vehicle_year as number)
      : null
    const estimated_hours = typeof body.estimated_hours === 'number' &&
      Number.isFinite(body.estimated_hours) &&
      body.estimated_hours >= 0 && body.estimated_hours <= 100
      ? body.estimated_hours
      : null

    const supabase = await createClient()

    // SECURITY DEFINER RPC: forces status='pending', links/creates the
    // customer row, and is the only anon-writable path into bookings.
    const { data: bookingId, error } = await supabase.rpc('create_public_booking', {
      p_customer_name: customer_name,
      p_customer_phone: customer_phone,
      p_customer_email: customer_email ?? undefined,
      p_vehicle_year: vehicle_year ?? undefined,
      p_vehicle_make: vehicle_make ?? undefined,
      p_vehicle_model: vehicle_model ?? undefined,
      p_notes: notes ?? undefined,
      p_service_description: service_description ?? undefined,
      p_estimated_hours: estimated_hours ?? undefined,
      p_preferred_date: preferred_date ?? undefined,
      p_preferred_time: preferred_time ?? undefined,
      p_source: source ?? undefined,
    })

    if (error || !bookingId) {
      console.error('Booking create error:', error?.code, error?.message)
      return NextResponse.json(
        { error: 'Unable to save your booking. Please call us at 519.471.9462.' },
        { status: 500 }
      )
    }

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        // TODO: change to ofomari59@gmail.com after domain verified
        to: ['12mfao@gmail.com'],
        subject: `New Booking Request — ${customer_name} — ${service_description ?? 'Service'}`,
        html: generateBookingReceivedEmail({
          customerName: customer_name,
          customerPhone: customer_phone,
          customerEmail: customer_email,
          vehicleYear: vehicle_year,
          vehicleMake: vehicle_make,
          vehicleModel: vehicle_model,
          serviceName: service_description,
          notes,
          preferredDate: preferred_date,
          preferredTime: preferred_time,
          source,
        }),
      })
    } catch (emailError) {
      console.error('Booking notification email failed:', emailError instanceof Error ? emailError.message : 'unknown')
    }

    return NextResponse.json({ success: true, id: bookingId }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
