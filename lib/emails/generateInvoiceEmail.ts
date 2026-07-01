import type { Tables } from '@/types/database.types'
import { escapeHtml } from './escapeHtml'

type Invoice = Tables<'invoices'>
type LineItem = Tables<'invoice_line_items'>

export function generateInvoiceEmail(invoice: Invoice, lineItems: LineItem[]): string {
  const labourItems = lineItems.filter(i => i.type === 'labour')
  const partsItems = lineItems.filter(i => i.type === 'parts')

  return `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;">
    <div style="background:#1A1714;padding:32px;text-align:center;">
      <div style="color:#FF9500;font-size:24px;font-weight:bold;
        letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
      <div style="color:#F0EDE8;font-size:14px;margin-top:4px;">
        2117 Aldersbrook Rd, London ON N6G 3X1 | 519.471.9462</div>
    </div>
    <div style="background:#fff;padding:32px;max-width:600px;margin:0 auto;">
      <table width="100%">
        <tr>
          <td>
            <div style="font-size:11px;color:#888;text-transform:uppercase;
              letter-spacing:1px;">Invoice</div>
            <div style="font-size:28px;font-weight:bold;color:#1A1714;">
              ${escapeHtml(invoice.invoice_number)}</div>
          </td>
          <td align="right">
            <div style="font-size:11px;color:#888;">Date</div>
            <div style="color:#1A1714;">${new Date(invoice.created_at).toLocaleDateString('en-CA')}</div>
            <div style="font-size:11px;color:#888;margin-top:8px;">Due Date</div>
            <div style="color:#1A1714;">${escapeHtml(invoice.due_date) || 'Upon Receipt'}</div>
          </td>
        </tr>
      </table>

      <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:4px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;">Bill To</div>
        <div style="font-weight:bold;color:#1A1714;">${escapeHtml(invoice.customer_name)}</div>
        <div style="color:#555;">${escapeHtml(invoice.customer_phone)}</div>
        <div style="color:#555;">${escapeHtml(invoice.vehicle_year)} ${escapeHtml(invoice.vehicle_make)} ${escapeHtml(invoice.vehicle_model)}</div>
      </div>

      ${labourItems.length > 0 ? `
      <div style="margin-top:24px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;
          letter-spacing:1px;border-bottom:2px solid #FF9500;padding-bottom:4px;">
          Labour</div>
        <table width="100%" style="border-collapse:collapse;margin-top:8px;">
          <tr style="font-size:11px;color:#888;">
            <td>Description</td>
            <td align="center">Hours</td>
            <td align="right">Rate</td>
            <td align="right">Amount</td>
          </tr>
          ${labourItems.map(item => `
          <tr style="border-top:1px solid #eee;">
            <td style="padding:8px 0;color:#1A1714;">${escapeHtml(item.description)}</td>
            <td align="center" style="color:#1A1714;">${escapeHtml(item.quantity)}</td>
            <td align="right" style="color:#1A1714;">$${escapeHtml(item.unit_price)}/hr</td>
            <td align="right" style="color:#1A1714;">$${(item.total ?? 0).toFixed(2)}</td>
          </tr>`).join('')}
        </table>
      </div>` : ''}

      ${partsItems.length > 0 ? `
      <div style="margin-top:24px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;
          letter-spacing:1px;border-bottom:2px solid #FF9500;padding-bottom:4px;">
          Parts</div>
        <table width="100%" style="border-collapse:collapse;margin-top:8px;">
          <tr style="font-size:11px;color:#888;">
            <td>Description</td>
            <td align="center">Qty</td>
            <td align="right">Unit Price</td>
            <td align="right">Amount</td>
          </tr>
          ${partsItems.map(item => `
          <tr style="border-top:1px solid #eee;">
            <td style="padding:8px 0;color:#1A1714;">${escapeHtml(item.description)}</td>
            <td align="center" style="color:#1A1714;">${escapeHtml(item.quantity)}</td>
            <td align="right" style="color:#1A1714;">$${escapeHtml(item.unit_price)}</td>
            <td align="right" style="color:#1A1714;">$${(item.total ?? 0).toFixed(2)}</td>
          </tr>`).join('')}
        </table>
      </div>` : ''}

      <div style="margin-top:24px;border-top:2px solid #eee;padding-top:16px;">
        <table width="100%">
          <tr>
            <td align="right" style="color:#888;font-size:13px;">Labour Subtotal</td>
            <td align="right" width="120" style="color:#1A1714;">
              $${invoice.labour_subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td align="right" style="color:#888;font-size:13px;">Parts Subtotal</td>
            <td align="right" style="color:#1A1714;">
              $${invoice.parts_subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td align="right" style="color:#888;font-size:13px;">HST (13%)</td>
            <td align="right" style="color:#1A1714;">
              $${invoice.hst_amount.toFixed(2)}</td>
          </tr>
          <tr style="border-top:2px solid #1A1714;">
            <td align="right" style="font-weight:bold;font-size:16px;
              padding-top:8px;">TOTAL DUE</td>
            <td align="right" style="font-weight:bold;font-size:16px;
              color:#FF9500;padding-top:8px;">
              $${invoice.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      ${invoice.notes ? `
      <div style="margin-top:24px;padding:12px;background:#f9f9f9;border-radius:4px;">
        <div style="font-size:11px;color:#888;">Notes</div>
        <div style="color:#555;margin-top:4px;">${escapeHtml(invoice.notes)}</div>
      </div>` : ''}
    </div>
    <div style="background:#1A1714;padding:24px;text-align:center;
      color:#9A8E82;font-size:12px;">
      <div style="color:#FF9500;margin-bottom:8px;">Thank you for choosing FixRight Automotive</div>
      All workmanship warranted for 90 days or 5,000km
    </div>
  </body>
  </html>`
}
