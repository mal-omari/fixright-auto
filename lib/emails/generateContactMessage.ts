import { escapeHtml } from './escapeHtml'

interface ContactMessageData {
  name: string
  phone: string
  message: string
}

export function generateContactMessageEmail(data: ContactMessageData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
      <div style="background:#1A1714;padding:32px;text-align:center;">
        <div style="color:#FF9500;font-size:24px;font-weight:bold;letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
        <div style="color:#F0EDE8;font-size:16px;margin-top:8px;">New Contact Message</div>
      </div>
      <div style="background:#ffffff;padding:32px;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:0;">Contact Details</h2>
        <p style="color:#1A1714;"><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p style="color:#1A1714;"><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Message</h2>
        <p style="color:#1A1714;white-space:pre-line;">${escapeHtml(data.message)}</p>
      </div>
      <div style="background:#1A1714;padding:24px;text-align:center;color:#9A8E82;font-size:12px;">
        FixRight Automotive — 519.471.9462 — 2117 Aldersbrook Rd, London ON
      </div>
    </body>
    </html>
  `
}
