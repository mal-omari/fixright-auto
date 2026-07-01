import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'
import { generateBookingReceivedEmail } from '@/lib/emails/generateBookingReceived'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

export async function GET() {
  return NextResponse.json({ message: 'Bookings API' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      customer_name,
      customer_phone,
      customer_email,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      notes,
      service_description,
      estimated_hours,
      preferred_date,
      preferred_time,
      source,
      status,
    } = body

    if (!customer_name || !customer_phone) {
      return NextResponse.json(
        { error: 'customer_name and customer_phone are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_name,
        customer_phone,
        customer_email: customer_email ?? null,
        vehicle_year: vehicle_year ?? null,
        vehicle_make: vehicle_make ?? null,
        vehicle_model: vehicle_model ?? null,
        notes: notes ?? null,
        service_description: service_description ?? null,
        estimated_hours: estimated_hours ?? null,
        preferred_date: preferred_date ?? null,
        preferred_time: preferred_time ?? null,
        source: source ?? null,
        status: status ?? 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      console.log('Attempting to send email via Resend...')
      console.log('API Key exists:', !!process.env.RESEND_API_KEY)
      console.log('API Key prefix:', process.env.RESEND_API_KEY?.substring(0, 8))

      const emailResult = await resend.emails.send({
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

      console.log('Resend full result:', JSON.stringify(emailResult))

      if (emailResult.error) {
        console.error('Resend error details:', JSON.stringify(emailResult.error))
      } else {
        console.log('Email sent successfully, ID:', emailResult.data?.id)
      }
    } catch (emailError) {
      console.error('Resend exception:', emailError)
    }

    return NextResponse.json({ success: true, booking: data }, { status: 201 })
  } catch (e) {
    console.error('Booking POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
