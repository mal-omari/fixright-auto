import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { resend } from '@/lib/resend'
import { generateReceiptEmail } from '@/lib/emails/generateReceiptEmail'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if (auth.response) return auth.response
    const supabase = auth.supabase

    const { invoiceId } = await req.json()

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

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
        // TODO: change to ofomari59@gmail.com after domain verified
        to: ['12mfao@gmail.com'],
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
    console.error('Invoice receipt error:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
