interface BookingConfirmedData {
  customerName: string
  serviceName?: string | null
  vehicleYear?: number | string | null
  vehicleMake?: string | null
  vehicleModel?: string | null
  confirmedDate?: string | null
  confirmedTime?: string | null
  preferredDate?: string | null
  preferredTime?: string | null
  estimatedHours?: number | null
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

export function generateBookingConfirmedEmail(data: BookingConfirmedData): string {
  const vehicle = [data.vehicleYear, data.vehicleMake, data.vehicleModel].filter(Boolean).join(' ') || '—'
  const date = formatDate(data.confirmedDate || data.preferredDate)
  const time = formatTime(data.confirmedTime || data.preferredTime)

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
      <div style="background:#1A1714;padding:32px;text-align:center;">
        <div style="color:#FF9500;font-size:24px;font-weight:bold;letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
        <div style="color:#F0EDE8;font-size:16px;margin-top:8px;">Your Appointment is Confirmed &#10003;</div>
      </div>
      <div style="background:#ffffff;padding:32px;max-width:600px;margin:0 auto;">
        <div style="text-align:center;margin-bottom:16px;">
          <span style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:rgba(255,149,0,0.12);color:#FF9500;font-size:28px;font-weight:bold;">&#10003;</span>
        </div>
        <p style="color:#1A1714;font-size:15px;">Hi ${data.customerName},</p>
        <p style="color:#1A1714;font-size:15px;">Great news! We've confirmed your appointment at FixRight Automotive.</p>

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Appointment Details</h2>
        <p style="color:#1A1714;"><strong>Service:</strong> ${data.serviceName || '—'}</p>
        <p style="color:#1A1714;"><strong>Vehicle:</strong> ${vehicle}</p>
        <p style="color:#1A1714;"><strong>Date:</strong> ${date}</p>
        <p style="color:#1A1714;"><strong>Time:</strong> ${time}</p>

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">What to Expect</h2>
        ${data.estimatedHours ? `<p style="color:#1A1714;">Estimated time: ${data.estimatedHours} hours</p>` : ''}
        <p style="color:#1A1714;">Please arrive 5 minutes early.</p>
        <p style="color:#1A1714;">We'll call you if we need anything before your appointment.</p>

        <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Our Location</h2>
        <p style="color:#1A1714;">2117 Aldersbrook Rd (At Wonderland Rd &amp; Fanshawe Park Rd)<br>London, Ontario N6G 3X1<br>519.471.9462</p>
      </div>
      <div style="background:#1A1714;padding:24px;text-align:center;color:#9A8E82;font-size:12px;">
        Questions? Call us at 519.471.9462<br>
        FixRight Automotive — Honest work. Fair prices. Every time.
      </div>
    </body>
    </html>
  `
}
