import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'
import { generateBookingConfirmedEmail } from '@/lib/emails/generateBookingConfirmed'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!booking.customer_email) {
      return NextResponse.json({ success: true, skipped: 'no customer email on file' })
    }

    let serviceName = booking.service_description
    if (booking.service_id) {
      const { data: service } = await supabase
        .from('services')
        .select('name')
        .eq('id', booking.service_id)
        .single()
      if (service) serviceName = service.name
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [booking.customer_email],
      subject: 'Your Appointment is Confirmed — FixRight Automotive',
      html: generateBookingConfirmedEmail({
        customerName: booking.customer_name,
        serviceName,
        vehicleYear: booking.vehicle_year,
        vehicleMake: booking.vehicle_make,
        vehicleModel: booking.vehicle_model,
        confirmedDate: booking.confirmed_date,
        confirmedTime: booking.confirmed_time,
        preferredDate: booking.preferred_date,
        preferredTime: booking.preferred_time,
        estimatedHours: booking.estimated_hours,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Booking confirm email error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
