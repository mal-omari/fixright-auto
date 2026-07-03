'use client'

import { useEffect, useState, useCallback, useRef, memo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Download, Check, Loader2, Send } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Invoice = Tables<'invoices'>
type LineItem = Tables<'invoice_line_items'>

interface DraftItem {
  id: string
  type: 'labour' | 'parts'
  description: string
  quantity: number
  unit_price: number
  sort_order: number
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft:   { color: '#9A8E82', bg: 'rgba(155,142,130,0.15)', label: 'Draft' },
  sent:    { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)',  label: 'Sent' },
  paid:    { color: '#28C850', bg: 'rgba(40,200,80,0.15)',   label: 'Paid' },
  overdue: { color: '#EF4444', bg: 'rgba(255,68,68,0.15)',   label: 'Overdue' },
}

const STATUS_OPTIONS = ['draft', 'sent', 'paid', 'overdue'] as const

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

let _idCounter = 0
function newId() { return `draft-${++_idCounter}` }

const iBase: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #3A3430',
  color: '#F0EDE8',
  padding: '6px 4px',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-bottom-color 0.15s',
}

// ── Memoized row components to prevent re-render on sibling keystroke ────────

interface LabourRowProps {
  item: DraftItem
  onChange: (id: string, field: keyof DraftItem, value: string | number) => void
  onRemove: (id: string) => void
}

const LabourRow = memo(function LabourRow({ item, onChange, onRemove }: LabourRowProps) {
  const lineTotal = item.quantity * item.unit_price
  return (
    <tr
      style={{ borderTop: '1px solid #2A2420' }}
      onMouseEnter={e => {
        const btn = e.currentTarget.querySelector('.del-btn') as HTMLElement | null
        if (btn) btn.style.opacity = '1'
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget.querySelector('.del-btn') as HTMLElement | null
        if (btn) btn.style.opacity = '0'
      }}
    >
      <td style={{ padding: '8px 4px' }}>
        <input
          value={item.description}
          onChange={e => onChange(item.id, 'description', e.target.value)}
          placeholder="Labour description…"
          style={{ ...iBase, width: '100%' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = '#FF9500')}
          onBlur={e => (e.currentTarget.style.borderBottomColor = '#3A3430')}
        />
      </td>
      <td style={{ padding: '8px 4px', width: 80 }}>
        <input
          type="number" step="0.5" min="0"
          value={item.quantity}
          onChange={e => onChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
          style={{ ...iBase, width: '100%', textAlign: 'right', fontFamily: 'var(--font-heading), sans-serif' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = '#FF9500')}
          onBlur={e => (e.currentTarget.style.borderBottomColor = '#3A3430')}
        />
      </td>
      <td style={{ padding: '8px 4px', width: 100 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', color: '#6B6560', fontSize: '12px' }}>$</span>
          <input
            type="number" step="0.01" min="0"
            value={item.unit_price}
            onChange={e => onChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
            style={{ ...iBase, width: '100%', paddingLeft: 16, textAlign: 'right', fontFamily: 'var(--font-heading), sans-serif' }}
            onFocus={e => (e.currentTarget.style.borderBottomColor = '#FF9500')}
            onBlur={e => (e.currentTarget.style.borderBottomColor = '#3A3430')}
          />
        </div>
      </td>
      <td style={{ padding: '8px 4px', width: 100, textAlign: 'right', color: '#FF9500', fontFamily: 'var(--font-heading), sans-serif', fontSize: '13px', fontWeight: 600 }}>
        {fmtAmount(lineTotal)}
      </td>
      <td style={{ padding: '8px 4px', width: 32 }}>
        <button
          className="del-btn"
          onClick={() => onRemove(item.id)}
          style={{ background: 'none', border: 'none', color: '#4A4540', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, opacity: 0, transition: 'color 0.15s, opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4A4540')}
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
})

interface PartsRowProps {
  item: DraftItem
  onChange: (id: string, field: keyof DraftItem, value: string | number) => void
  onRemove: (id: string) => void
}

const PartsRow = memo(function PartsRow({ item, onChange, onRemove }: PartsRowProps) {
  const lineTotal = item.quantity * item.unit_price
  return (
    <tr
      style={{ borderTop: '1px solid #2A2420' }}
      onMouseEnter={e => {
        const btn = e.currentTarget.querySelector('.del-btn') as HTMLElement | null
        if (btn) btn.style.opacity = '1'
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget.querySelector('.del-btn') as HTMLElement | null
        if (btn) btn.style.opacity = '0'
      }}
    >
      <td style={{ padding: '8px 4px' }}>
        <input
          value={item.description}
          onChange={e => onChange(item.id, 'description', e.target.value)}
          placeholder="Part description…"
          style={{ ...iBase, width: '100%' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = '#FF9500')}
          onBlur={e => (e.currentTarget.style.borderBottomColor = '#3A3430')}
        />
      </td>
      <td style={{ padding: '8px 4px', width: 80 }}>
        <input
          type="number" step="1" min="0"
          value={item.quantity}
          onChange={e => onChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
          style={{ ...iBase, width: '100%', textAlign: 'right', fontFamily: 'var(--font-heading), sans-serif' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = '#FF9500')}
          onBlur={e => (e.currentTarget.style.borderBottomColor = '#3A3430')}
        />
      </td>
      <td style={{ padding: '8px 4px', width: 100 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', color: '#6B6560', fontSize: '12px' }}>$</span>
          <input
            type="number" step="0.01" min="0"
            value={item.unit_price}
            onChange={e => onChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
            style={{ ...iBase, width: '100%', paddingLeft: 16, textAlign: 'right', fontFamily: 'var(--font-heading), sans-serif' }}
            onFocus={e => (e.currentTarget.style.borderBottomColor = '#FF9500')}
            onBlur={e => (e.currentTarget.style.borderBottomColor = '#3A3430')}
          />
        </div>
      </td>
      <td style={{ padding: '8px 4px', width: 100, textAlign: 'right', color: '#FF9500', fontFamily: 'var(--font-heading), sans-serif', fontSize: '13px', fontWeight: 600 }}>
        {fmtAmount(lineTotal)}
      </td>
      <td style={{ padding: '8px 4px', width: 32 }}>
        <button
          className="del-btn"
          onClick={() => onRemove(item.id)}
          style={{ background: 'none', border: 'none', color: '#4A4540', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, opacity: 0, transition: 'color 0.15s, opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4A4540')}
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
})

// ── Main page ────────────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [labourItems, setLabourItems] = useState<DraftItem[]>([])
  const [partsItems, setPartsItems] = useState<DraftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showPaidConfirm, setShowPaidConfirm] = useState(false)

  const [status, setStatus] = useState('draft')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [hstRate] = useState(0.13)

  const prevTotalRef = useRef<number | null>(null)
  const totalFlashRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: inv }, { data: items }] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', id).single(),
        supabase.from('invoice_line_items').select('*').eq('invoice_id', id).order('sort_order'),
      ])
      if (inv) {
        setInvoice(inv)
        setStatus(inv.status)
        setDueDate(inv.due_date ?? '')
        setNotes(inv.notes ?? '')
        const allItems: DraftItem[] = (items ?? []).map(item => ({
          id: item.id,
          type: item.type as 'labour' | 'parts',
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          sort_order: item.sort_order,
        }))
        setLabourItems(allItems.filter(i => i.type === 'labour'))
        setPartsItems(allItems.filter(i => i.type === 'parts'))
      }
      setLoading(false)
    }
    load()
  }, [id])

  const labourSubtotal = labourItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const partsSubtotal = partsItems.reduce((s, i) => s + i.quantity * i.unit_price, 0)
  const subtotal = labourSubtotal + partsSubtotal
  const hstAmount = subtotal * hstRate
  const total = subtotal + hstAmount

  // Flash total on change
  useEffect(() => {
    if (prevTotalRef.current !== null && prevTotalRef.current !== total) {
      const el = totalFlashRef.current
      if (el) {
        el.style.animation = 'none'
        void el.offsetWidth
        el.style.animation = 'amountFlash 0.4s ease'
      }
    }
    prevTotalRef.current = total
  }, [total])

  function addLabourItem() {
    const labourRate = parseFloat(localStorage.getItem('fixright_labour_rate') ?? '95')
    setLabourItems(prev => [...prev, { id: newId(), type: 'labour', description: '', quantity: 1, unit_price: labourRate, sort_order: prev.length }])
  }

  function addPartsItem() {
    setPartsItems(prev => [...prev, { id: newId(), type: 'parts', description: '', quantity: 1, unit_price: 0, sort_order: prev.length }])
  }

  const updateLabour = useCallback((itemId: string, field: keyof DraftItem, value: string | number) => {
    setLabourItems(prev => prev.map(item => item.id === itemId ? { ...item, [field]: value } : item))
  }, [])

  const updateParts = useCallback((itemId: string, field: keyof DraftItem, value: string | number) => {
    setPartsItems(prev => prev.map(item => item.id === itemId ? { ...item, [field]: value } : item))
  }, [])

  const removeLabour = useCallback((itemId: string) => {
    setLabourItems(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const removeParts = useCallback((itemId: string) => {
    setPartsItems(prev => prev.filter(item => item.id !== itemId))
  }, [])

  const save = useCallback(async () => {
    if (!invoice) return
    setSaving(true); setSaveState('saving')
    const supabase = createClient()

    await supabase.from('invoice_line_items').delete().eq('invoice_id', id)

    const allItems: Omit<LineItem, 'id' | 'total' | 'created_at'>[] = [
      ...labourItems.map((item, i) => ({ invoice_id: id, type: 'labour' as const, description: item.description, quantity: item.quantity, unit_price: item.unit_price, sort_order: i })),
      ...partsItems.map((item, i) => ({ invoice_id: id, type: 'parts' as const, description: item.description, quantity: item.quantity, unit_price: item.unit_price, sort_order: i + labourItems.length })),
    ]

    if (allItems.length > 0) {
      await supabase.from('invoice_line_items').insert(allItems)
    }

    const { error } = await supabase.from('invoices').update({
      status,
      due_date: dueDate || null,
      notes: notes || null,
      labour_subtotal: labourSubtotal,
      parts_subtotal: partsSubtotal,
      subtotal,
      hst_rate: hstRate,
      hst_amount: hstAmount,
      total,
      paid_date: status === 'paid' ? (invoice.paid_date || new Date().toISOString().split('T')[0]) : null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    setSaving(false)
    if (!error) {
      setInvoice(prev => prev ? { ...prev, status, labour_subtotal: labourSubtotal, parts_subtotal: partsSubtotal, subtotal, hst_amount: hstAmount, total, due_date: dueDate || null, notes: notes || null } : prev)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
      toast.success('Invoice saved')
    } else {
      setSaveState('idle')
      toast.error('Failed to save invoice')
    }
  }, [invoice, id, labourItems, partsItems, status, dueDate, notes, labourSubtotal, partsSubtotal, subtotal, hstRate, hstAmount, total])

  async function downloadPDF() {
    if (!invoice) return
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageW = 210
      const margin = 20
      let y = 20

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.text('FIXRIGHT AUTOMOTIVE', margin, y)

      doc.setFontSize(20)
      doc.text('INVOICE', pageW - margin, y, { align: 'right' })

      y += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text('2117 Aldersbrook Rd, London ON N6G 3X1', margin, y)
      doc.text('519.471.9462', pageW - margin, y, { align: 'right' })
      y += 4
      doc.text('fixrightauto.ca', margin, y)
      doc.text(invoice.invoice_number, pageW - margin, y, { align: 'right' })
      y += 3
      doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}`, pageW - margin, y, { align: 'right' })
      if (invoice.due_date) {
        y += 4
        doc.setTextColor(200, 50, 50)
        doc.text(`Due: ${new Date(invoice.due_date + 'T00:00:00').toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}`, pageW - margin, y, { align: 'right' })
      }

      doc.setTextColor(0, 0, 0)
      y += 6
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text('BILL TO', margin, y)
      doc.text('VEHICLE', 120, y)

      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text(invoice.customer_name ?? '—', margin, y)

      const veh = [invoice.vehicle_year, invoice.vehicle_make, invoice.vehicle_model].filter(Boolean).join(' ')
      doc.text(veh || '—', 120, y)

      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      if (invoice.customer_phone) { doc.text(invoice.customer_phone, margin, y); y += 4 }
      if (invoice.customer_email) { doc.text(invoice.customer_email, margin, y); y += 4 }
      if (invoice.vehicle_mileage) { doc.text(`Mileage: ${invoice.vehicle_mileage}`, 120, y - 4) }

      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      if (labourItems.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(50, 50, 50)
        doc.text('LABOUR', margin, y)
        y += 5
        doc.setFillColor(245, 245, 245)
        doc.rect(margin, y - 3, pageW - margin * 2, 7, 'F')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Description', margin + 1, y + 1)
        doc.text('Hours', 130, y + 1)
        doc.text('Rate/hr', 155, y + 1)
        doc.text('Amount', pageW - margin, y + 1, { align: 'right' })
        y += 8
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        labourItems.forEach(item => {
          const lineTotal = item.quantity * item.unit_price
          doc.setFontSize(9)
          doc.text(item.description || '—', margin + 1, y)
          doc.text(item.quantity.toString(), 130, y)
          doc.text(`$${item.unit_price.toFixed(2)}`, 155, y)
          doc.text(fmtAmount(lineTotal), pageW - margin, y, { align: 'right' })
          y += 6
        })
        y += 2
      }

      if (partsItems.length > 0) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(50, 50, 50)
        doc.text('PARTS', margin, y)
        y += 5
        doc.setFillColor(245, 245, 245)
        doc.rect(margin, y - 3, pageW - margin * 2, 7, 'F')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Description', margin + 1, y + 1)
        doc.text('Qty', 130, y + 1)
        doc.text('Unit Price', 155, y + 1)
        doc.text('Amount', pageW - margin, y + 1, { align: 'right' })
        y += 8
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        partsItems.forEach(item => {
          const lineTotal = item.quantity * item.unit_price
          doc.setFontSize(9)
          doc.text(item.description || '—', margin + 1, y)
          doc.text(item.quantity.toString(), 130, y)
          doc.text(`$${item.unit_price.toFixed(2)}`, 155, y)
          doc.text(fmtAmount(lineTotal), pageW - margin, y, { align: 'right' })
          y += 6
        })
      }

      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y + 2, pageW - margin, y + 2)
      y += 10

      const totalsX = 140
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text('Labour Subtotal:', totalsX, y)
      doc.text(fmtAmount(labourSubtotal), pageW - margin, y, { align: 'right' })
      y += 5
      doc.text('Parts Subtotal:', totalsX, y)
      doc.text(fmtAmount(partsSubtotal), pageW - margin, y, { align: 'right' })
      y += 5
      doc.text('Subtotal:', totalsX, y)
      doc.text(fmtAmount(subtotal), pageW - margin, y, { align: 'right' })
      y += 5
      doc.text('HST (13%):', totalsX, y)
      doc.text(fmtAmount(hstAmount), pageW - margin, y, { align: 'right' })
      y += 2
      doc.line(totalsX, y, pageW - margin, y)
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL DUE:', totalsX, y)
      doc.text(fmtAmount(total), pageW - margin, y, { align: 'right' })

      const footerY = 270
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, footerY, pageW - margin, footerY)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.text('Thank you for choosing FixRight Automotive', pageW / 2, footerY + 6, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text('All workmanship warranted for 90 days or 5,000km', pageW / 2, footerY + 10, { align: 'center' })

      doc.save(`${invoice.invoice_number}.pdf`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast.error('Failed to generate PDF')
    }
    setDownloading(false)
  }

  async function sendInvoiceEmail() {
    if (!invoice) return
    setSending(true)
    try {
      const res = await fetch('/api/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send invoice')
      setInvoice(prev => prev ? { ...prev, status: 'sent' } : prev)
      setStatus('sent')
      toast.success('Invoice sent to customer')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invoice')
    }
    setSending(false)
  }

  async function confirmMarkPaid(sendReceipt: boolean) {
    setStatus('paid')
    setShowPaidConfirm(false)
    if (sendReceipt && invoice) {
      try {
        const res = await fetch('/api/invoices/receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: invoice.id }),
        })
        if (!res.ok) throw new Error()
        toast.success('Receipt sent to customer')
      } catch {
        toast.error('Failed to send receipt')
      }
    }
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#6B6560', fontSize: '13px' }}>Loading invoice…</div>
  }
  if (!invoice) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: 16 }}>Invoice not found</div>
        <Link href="/workshop-portal/invoices" style={{ color: '#FF9500', textDecoration: 'none', fontSize: '13px' }}>← Back to Invoices</Link>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  const vehicle = [invoice.vehicle_year, invoice.vehicle_make, invoice.vehicle_model].filter(Boolean).join(' ')

  const card: React.CSSProperties = {
    background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: 24, marginBottom: 16,
  }
  const sectionHead: React.CSSProperties = {
    fontFamily: 'var(--font-heading), sans-serif',
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
    color: '#6B6560', textTransform: 'uppercase', marginBottom: 16, display: 'block',
  }
  const metaLabel: React.CSSProperties = {
    fontFamily: 'var(--font-heading), sans-serif',
    fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em',
    color: '#6B6560', textTransform: 'uppercase', display: 'block', marginBottom: 4,
  }
  const colHeader: React.CSSProperties = {
    textAlign: 'left', padding: '8px 4px',
    fontFamily: 'var(--font-heading), sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
    color: '#6B6560', textTransform: 'uppercase',
  }

  return (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/workshop-portal/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6560', textDecoration: 'none', fontSize: '12px', marginBottom: 10 }}>
          <ArrowLeft size={13} /> Invoices
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '32px', fontWeight: 700, color: '#FF9500', margin: 0, letterSpacing: '0.03em',
          }}>
            {invoice.invoice_number}
          </h1>
          <span style={{
            background: statusCfg.bg, color: statusCfg.color,
            padding: '6px 16px', borderRadius: 6,
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {statusCfg.label}
          </span>
          <span style={{ fontSize: '12px', color: '#6B6560' }}>
            Created {new Date(invoice.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Two column */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 16 }}>
        {/* Left */}
        <div style={card}>
          <span style={sectionHead}>Customer &amp; Vehicle</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
            <div>
              <span style={metaLabel}>Bill To</span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#F0EDE8', marginBottom: 4 }}>{invoice.customer_name ?? '—'}</div>
              {invoice.customer_phone && <div style={{ fontSize: '13px', color: '#9A8E82', marginBottom: 2 }}>{invoice.customer_phone}</div>}
              {invoice.customer_email && <div style={{ fontSize: '12px', color: '#6B6560' }}>{invoice.customer_email}</div>}
            </div>
            <div>
              <span style={metaLabel}>Vehicle</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#F0EDE8', marginBottom: 4 }}>{vehicle || '—'}</div>
              {invoice.vehicle_mileage && <div style={{ fontSize: '12px', color: '#6B6560' }}>Mileage: {invoice.vehicle_mileage}</div>}
            </div>
          </div>
          <div style={{ paddingTop: 16, borderTop: '1px solid #2A2420' }}>
            <span style={metaLabel}>Billed By</span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F0EDE8' }}>FixRight Automotive</div>
            <div style={{ fontSize: '12px', color: '#6B6560', marginTop: 2 }}>2117 Aldersbrook Rd, London ON N6G 3X1</div>
            <div style={{ fontSize: '12px', color: '#6B6560', marginTop: 1 }}>519.471.9462</div>
          </div>
        </div>

        {/* Right */}
        <div style={card}>
          <span style={sectionHead}>Invoice Management</span>

          <div style={{ marginBottom: 16 }}>
            <span style={metaLabel}>Status</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUS_OPTIONS.map(s => {
                const cfg = STATUS_CONFIG[s]
                const active = status === s
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: '5px 12px', borderRadius: 6,
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: '11px', fontWeight: active ? 700 : 500,
                      background: active ? cfg.bg : 'transparent',
                      border: `1px solid ${active ? cfg.color : '#2A2420'}`,
                      color: active ? cfg.color : '#6B6560',
                      cursor: 'pointer', transition: 'all 0.15s', textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={metaLabel}>Due Date</label>
            <input
              type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={{
                width: '100%', background: '#141210', border: '1px solid #2A2420',
                borderRadius: 6, color: '#F0EDE8', padding: '8px 12px',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
              onFocus={e => (e.target.style.borderColor = '#FF9500')}
              onBlur={e => (e.target.style.borderColor = '#2A2420')}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={metaLabel}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Payment terms, notes to customer…"
              style={{
                width: '100%', background: '#141210', border: '1px solid #2A2420',
                borderRadius: 6, color: '#F0EDE8', padding: '8px 10px',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'rgba(74,158,255,0.1)', color: '#4A9EFF',
                border: '1px solid rgba(74,158,255,0.3)', borderRadius: 8,
                padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                cursor: downloading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-heading), sans-serif', letterSpacing: '0.06em',
              }}
            >
              <Download size={14} />
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
            {invoice.customer_email ? (
              <button
                onClick={sendInvoiceEmail}
                disabled={sending}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                  border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8,
                  padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-heading), sans-serif', letterSpacing: '0.06em',
                }}
              >
                <Send size={14} />
                {sending ? 'Sending…' : 'Send Invoice to Customer'}
              </button>
            ) : (
              <button
                disabled
                title="No customer email on file"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(59,130,246,0.05)', color: '#3B4655',
                  border: '1px solid rgba(59,130,246,0.1)', borderRadius: 8,
                  padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                  cursor: 'not-allowed',
                  fontFamily: 'var(--font-heading), sans-serif', letterSpacing: '0.06em',
                }}
              >
                <Send size={14} /> No Customer Email
              </button>
            )}
            {status !== 'paid' && !showPaidConfirm && (
              <button
                onClick={() => setShowPaidConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(40,200,80,0.1)', color: '#28C850',
                  border: '1px solid rgba(40,200,80,0.3)', borderRadius: 8,
                  padding: '10px 16px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading), sans-serif', letterSpacing: '0.06em',
                }}
              >
                <Check size={14} /> Mark as Paid
              </button>
            )}
            {status !== 'paid' && showPaidConfirm && (
              <div style={{
                background: 'rgba(40,200,80,0.06)', border: '1px solid rgba(40,200,80,0.25)',
                borderRadius: 8, padding: 12,
              }}>
                <div style={{ fontSize: '12px', color: '#F0EDE8', marginBottom: 10 }}>
                  Send payment receipt to customer?
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => confirmMarkPaid(true)}
                    style={{
                      flex: 1, background: '#28C850', color: '#0D0B08', border: 'none',
                      borderRadius: 6, padding: '8px 12px', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'var(--font-heading), sans-serif',
                    }}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => confirmMarkPaid(false)}
                    style={{
                      flex: 1, background: 'none', color: '#9A8E82', border: '1px solid #2A2420',
                      borderRadius: 6, padding: '8px 12px', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={card}>
        {/* Labour */}
        <div style={{ marginBottom: 28 }}>
          <span style={sectionHead}>Labour</span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                <th style={colHeader}>Description</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Hours</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Rate / hr</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Total</th>
                <th style={{ ...colHeader, width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {labourItems.map(item => (
                <LabourRow key={item.id} item={item} onChange={updateLabour} onRemove={removeLabour} />
              ))}
              {labourItems.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '16px 4px', color: '#4A4540', fontSize: '12px', fontStyle: 'italic' }}>
                    No labour items yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            onClick={addLabourItem}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
              background: 'none', border: 'none',
              color: '#6B6560', padding: '4px 0', fontSize: '12px',
              cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF9500')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B6560')}
          >
            <Plus size={13} /> Add Labour Line
          </button>
        </div>

        {/* Parts */}
        <div style={{ paddingTop: 20, borderTop: '1px solid #2A2420' }}>
          <span style={sectionHead}>Parts</span>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                <th style={colHeader}>Description</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Qty</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Unit Price</th>
                <th style={{ ...colHeader, textAlign: 'right' }}>Total</th>
                <th style={{ ...colHeader, width: 32 }} />
              </tr>
            </thead>
            <tbody>
              {partsItems.map(item => (
                <PartsRow key={item.id} item={item} onChange={updateParts} onRemove={removeParts} />
              ))}
              {partsItems.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '16px 4px', color: '#4A4540', fontSize: '12px', fontStyle: 'italic' }}>
                    No parts items yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <button
            onClick={addPartsItem}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
              background: 'none', border: 'none',
              color: '#6B6560', padding: '4px 0', fontSize: '12px',
              cursor: 'pointer', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF9500')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B6560')}
          >
            <Plus size={13} /> Add Parts Line
          </button>
        </div>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <div style={{
          background: '#1E1C18', border: '1px solid #2A2420',
          borderRadius: 12, padding: '20px 28px', minWidth: 280,
        }}>
          {[
            { label: 'Labour Subtotal', value: labourSubtotal },
            { label: 'Parts Subtotal', value: partsSubtotal },
            { label: 'Subtotal', value: subtotal },
            { label: 'HST (13%)', value: hstAmount },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560' }}>
                {row.label}
              </span>
              <span style={{ fontSize: '13px', color: '#F0EDE8', fontWeight: 500 }}>{fmtAmount(row.value)}</span>
            </div>
          ))}
          <div style={{ height: 1, background: '#2A2420', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F0EDE8' }}>
              TOTAL DUE
            </span>
            <span
              ref={totalFlashRef}
              style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '24px', fontWeight: 700, color: '#FF9500' }}
            >
              {fmtAmount(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        style={{
          width: '100%', height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: saveState === 'saved' ? '#28C850' : '#FF9500',
          color: '#0D0B08', border: 'none', borderRadius: 10,
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background 0.3s',
        }}
      >
        {saving ? (
          <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> SAVING…</>
        ) : saveState === 'saved' ? (
          <><Check size={16} /> SAVED</>
        ) : (
          'SAVE INVOICE'
        )}
      </button>
    </div>
  )
}
