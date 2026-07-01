'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Wrench, Layers } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Service = Tables<'services'>

const CATEGORY_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  maintenance: { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', label: 'Maintenance' },
  electrical:  { color: '#FF9500', bg: 'rgba(255,149,0,0.15)',  label: 'Electrical' },
  safety:      { color: '#28C850', bg: 'rgba(40,200,80,0.15)', label: 'Safety' },
  body:        { color: '#A78BFA', bg: 'rgba(167,139,250,0.15)', label: 'Body' },
}

function categoryStyle(category: string | null) {
  return CATEGORY_COLORS[category ?? ''] ?? { color: '#9A8E82', bg: 'rgba(155,142,130,0.15)', label: category ?? '—' }
}

function fmtRate(n: number | null) {
  return `$${(n ?? 0).toFixed(2)}/hr`
}

interface EditableCellProps {
  value: number
  suffix: string
  onSave: (next: number) => void
}

function EditableCell({ value, suffix, onSave }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  useEffect(() => { setDraft(String(value)) }, [value])

  function commit() {
    const parsed = parseFloat(draft)
    setEditing(false)
    if (!Number.isNaN(parsed) && parsed !== value) onSave(parsed)
    else setDraft(String(value))
  }

  if (editing) {
    return (
      <input
        type="number" step="0.5" min="0" autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) } }}
        style={{
          width: 80, background: '#141210', border: '1px solid #FF9500',
          borderRadius: 6, color: '#F0EDE8', padding: '4px 8px',
          fontSize: '13px', outline: 'none', fontFamily: 'inherit',
        }}
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        background: 'none', border: 'none', color: '#9A8E82', cursor: 'pointer',
        padding: '4px 8px', fontSize: '13px', fontFamily: 'inherit', borderRadius: 6,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,149,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {value}{suffix}
    </button>
  )
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadServices()
  }, [])

  function loadServices() {
    setLoading(true)
    createClient()
      .from('services')
      .select('*')
      .order('category')
      .order('name')
      .then(({ data, error }) => {
        if (error) toast.error('Failed to load services')
        setServices(data ?? [])
        setLoading(false)
      })
  }

  async function updateField(id: string, field: 'estimated_hours' | 'base_price', value: number) {
    const updateData = field === 'estimated_hours' ? { estimated_hours: value } : { base_price: value }
    const { error } = await createClient().from('services').update(updateData).eq('id', id)
    if (error) {
      toast.error('Failed to update service')
      return
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    toast.success('Service updated')
  }

  const activeCount = useMemo(() => services.filter(s => s.is_active).length, [services])
  const categoryCount = useMemo(() => new Set(services.map(s => s.category).filter(Boolean)).size, [services])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EDE8', margin: 0 }}>Services Management</h1>
          <p style={{ fontSize: '12px', color: '#6B6560', marginTop: 4 }}>
            {services.length} total services
          </p>
        </div>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#FF9500', color: '#0D0B08', border: 'none',
            padding: '10px 18px', fontSize: '12px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 8,
            cursor: 'pointer', fontFamily: 'var(--font-heading), sans-serif',
          }}
        >
          <Plus size={14} /> Add Service
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Active Services', value: activeCount.toString(), icon: Wrench, color: '#28C850' },
          { label: 'Categories', value: categoryCount.toString(), icon: Layers, color: '#4A9EFF' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B6560', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#F0EDE8', marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                {['Name', 'Category', 'Est. Hours', 'Base Rate', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left', padding: '11px 16px',
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em',
                      color: '#6B6560', textTransform: 'uppercase', whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#4A4540' }}>Loading…</td></tr>
              ) : services.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#4A4540' }}>No services found</td></tr>
              ) : services.map(svc => {
                const cat = categoryStyle(svc.category)
                return (
                  <tr key={svc.id} style={{ borderTop: '1px solid #2A2420' }}>
                    <td style={{ padding: '0 16px', height: 56, fontFamily: 'var(--font-heading), sans-serif', fontWeight: 600, color: '#F0EDE8' }}>
                      {svc.name}
                    </td>
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <span style={{
                        background: cat.bg, color: cat.color,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                        {cat.label}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <EditableCell value={svc.estimated_hours} suffix="h" onSave={v => updateField(svc.id, 'estimated_hours', v)} />
                    </td>
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <EditableCell value={svc.base_price ?? 0} suffix="/hr ($)" onSave={v => updateField(svc.id, 'base_price', v)} />
                    </td>
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <span style={{ fontSize: '12px', color: svc.is_active ? '#28C850' : '#6B6560' }}>
                        {svc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '0 16px', height: 56, color: '#4A4540', fontSize: '12px' }}>—</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
