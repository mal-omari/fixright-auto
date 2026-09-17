import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { resend } from '@/lib/resend'
import { generateInvoiceEmail } from '@/lib/emails/generateInvoiceEmail'
import { SITE_CONFIG } from '@/lib/site-config'
import { DEMO_API_RESPONSE, LIVE_OPERATIONS_ENABLED } from '@/lib/server-mode'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || `${SITE_CONFIG.business.name} <onboarding@resend.dev>`

export async function POST(req: NextRequest) {
  if (!LIVE_OPERATIONS_ENABLED) {
    return NextResponse.json(DEMO_API_RESPONSE, { status: 200 })
  }

  try {
    const auth = await requireAdmin(req)
    if (auth.response) return auth.response
    const supabase = auth.supabase

    const { invoiceId } = await req.json()

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    const [{ data: invoice, error: invoiceError }, { data: lineItems }] = await Promise.all([
      supabase.from('invoices').select('*').eq('id', invoiceId).single(),
      supabase.from('invoice_line_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
    ])

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.customer_email) {
      return NextResponse.json({ error: 'No customer email on file' }, { status: 400 })
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [invoice.customer_email],
      subject: `Your Invoice ${invoice.invoice_number} from ${SITE_CONFIG.business.name} — $${invoice.total.toFixed(2)} due`,
      html: generateInvoiceEmail(invoice, lineItems ?? []),
    })

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', invoiceId)

    if (updateError) {
      return NextResponse.json({ error: 'Email sent but failed to update invoice status' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Invoice send error:', e instanceof Error ? e.message : 'unknown')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
