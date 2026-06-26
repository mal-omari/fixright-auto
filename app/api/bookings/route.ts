import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    return NextResponse.json({ success: true, booking: data }, { status: 201 })
  } catch (e) {
    console.error('Booking POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
