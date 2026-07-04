import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { generateContactMessageEmail } from '@/lib/emails/generateContactMessage'
import { rateLimit } from '@/lib/rate-limit'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <bookings@fixrightautomotive.com>'

const PHONE_RE = /^[0-9+()./\-\s]{7,30}$/

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
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please call us at 519.471.9462.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    const name = cleanLine(body.name, 200)
    const phone = cleanLine(body.phone, 30)
    const message = cleanMultiline(body.message, 5000)

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'name, phone, and message are required' },
        { status: 400 }
      )
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    try {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: ['ofomari59@gmail.com'],
        subject: `New Contact Message — ${name}`,
        html: generateContactMessageEmail({ name, phone, message }),
      })
    } catch (emailError) {
      console.error('Contact notification email failed:', emailError instanceof Error ? emailError.message : 'unknown')
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
