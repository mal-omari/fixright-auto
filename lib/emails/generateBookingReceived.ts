interface BookingReceivedData {
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  vehicleYear?: number | string | null
  vehicleMake?: string | null
  vehicleModel?: string | null
  serviceName?: string | null
  notes?: string | null
  preferredDate?: string | null
  preferredTime?: string | null
  source?: string | null
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr?: string | null): string {
  return timeStr ?? '—'
}

export function generateBookingReceivedEmail(data: BookingReceivedData): string {
  const vehicle = [data.vehicleYear, data.vehicleMake, data.vehicleModel].filter(Boolean).join(' ') || '—'

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
      <div style="background:#1A1714;padding:32px;text-align:center;">
        <div style="color:#FF9500;font-size:24px;font-weight:bold;letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
        <div style="color:#F0EDE8;font-size:16px;margin-top:8px;">New Booking Request</div>
      </div>
      <div style="background:#ffffff;padding:32px;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:0;">Customer Information</h2>
        <p style="color:#1A1714;"><strong>Name:</strong> ${data.customerName}</p>
        <p style="color:#1A1714;"><strong>Phone:</strong> ${data.customerPhone}</p>
        ${data.customerEmail ? `<p style="color:#1A1714;"><strong>Email:</strong> ${data.customerEmail}</p>` : ''}

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Vehicle</h2>
        <p style="color:#1A1714;"><strong>Vehicle:</strong> ${vehicle}</p>

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Service Requested</h2>
        <p style="color:#1A1714;"><strong>Service:</strong> ${data.serviceName || '—'}</p>
        ${data.notes ? `<p style="color:#1A1714;white-space:pre-line;"><strong>Notes:</strong> ${data.notes}</p>` : ''}

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Preferred Timing</h2>
        <p style="color:#1A1714;"><strong>Date:</strong> ${formatDate(data.preferredDate)}</p>
        <p style="color:#1A1714;"><strong>Time:</strong> ${formatTime(data.preferredTime)}</p>
        ${data.source ? `<p style="color:#1A1714;"><strong>How they heard about us:</strong> ${data.source}</p>` : ''}

        <div style="margin-top:32px;text-align:center;">
          <a href="https://fixright-auto.vercel.app/workshop-portal/dashboard"
            style="background:#FF9500;color:#ffffff;padding:14px 28px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block;">
            LOG IN TO CONFIRM THIS BOOKING
          </a>
        </div>
      </div>
      <div style="background:#1A1714;padding:24px;text-align:center;color:#9A8E82;font-size:12px;">
        FixRight Automotive — 519.471.9462 — 2117 Aldersbrook Rd, London ON
      </div>
    </body>
    </html>
  `
}
