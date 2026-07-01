import { escapeHtml } from './escapeHtml'

interface ReceiptEmailData {
  invoiceNumber: string
  vehicle: string
  amountPaid: number
  paidDate: string
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function generateReceiptEmail(data: ReceiptEmailData): string {
  return `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
    <div style="background:#1A1714;padding:32px;text-align:center;">
      <div style="color:#FF9500;font-size:24px;font-weight:bold;letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
      <div style="color:#F0EDE8;font-size:16px;margin-top:8px;">Payment Received</div>
    </div>
    <div style="background:#ffffff;padding:32px;max-width:600px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:16px;">
        <span style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:rgba(40,200,80,0.12);color:#28C850;font-size:28px;font-weight:bold;">&#10003;</span>
      </div>
      <p style="color:#1A1714;font-size:15px;text-align:center;">Thank you! We've received your payment.</p>

      <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Payment Details</h2>
      <p style="color:#1A1714;"><strong>Invoice:</strong> ${escapeHtml(data.invoiceNumber)}</p>
      <p style="color:#1A1714;"><strong>Vehicle:</strong> ${escapeHtml(data.vehicle)}</p>
      <p style="color:#1A1714;"><strong>Amount Paid:</strong> $${data.amountPaid.toFixed(2)}</p>
      <p style="color:#1A1714;"><strong>Date Paid:</strong> ${formatDate(data.paidDate)}</p>

      <p style="color:#1A1714;margin-top:24px;">Thank you for choosing FixRight Automotive.</p>
      <p style="color:#1A1714;">See you next time!</p>
    </div>
    <div style="background:#1A1714;padding:24px;text-align:center;color:#9A8E82;font-size:12px;">
      FixRight Automotive — 519.471.9462 — 2117 Aldersbrook Rd, London ON
    </div>
  </body>
  </html>`
}
