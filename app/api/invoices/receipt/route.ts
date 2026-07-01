import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'
import { generateReceiptEmail } from '@/lib/emails/generateReceiptEmail'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const paidDate = invoice.paid_date || new Date().toISOString().split('T')[0]
    const vehicle = [invoice.vehicle_year, invoice.vehicle_make, invoice.vehicle_model].filter(Boolean).join(' ') || '—'

    if (invoice.customer_email) {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: [invoice.customer_email],
        subject: `Payment Received — FixRight Automotive — ${invoice.invoice_number}`,
        html: generateReceiptEmail({
          invoiceNumber: invoice.invoice_number,
          vehicle,
          amountPaid: invoice.total,
          paidDate,
        }),
      })
    }

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ paid_date: paidDate, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update paid_date' }, { status: 500 })
    }

    return NextResponse.json({ success: true, skipped: invoice.customer_email ? undefined : 'no customer email on file' })
  } catch (e) {
    console.error('Invoice receipt error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
