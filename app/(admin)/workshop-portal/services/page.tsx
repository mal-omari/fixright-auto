'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Wrench, Layers, Search } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Service = Tables<'services'>

const CATEGORY_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  maintenance: { color: '#4A9EFF', bg: 'rgba(74,158,255,0.15)', label: 'Maintenance' },
  electrical:  { color: '#FF9500', bg: 'rgba(255,149,0,0.15)',  label: 'Electrical' },
  safety:      { color: '#28C850', bg: 'rgba(40,200,80,0.15)', label: 'Safety' },
  body:        { color: '#A78BFA', bg: 'rgba(167,139,250,0.15)', label: 'Body' },
}

const CATEGORY_PILLS = [
  { key: 'All', label: 'All', color: '#9A8E82' },
  { key: 'maintenance', label: 'Maintenance', color: '#4A9EFF' },
  { key: 'electrical', label: 'Electrical', color: '#FF9500' },
  { key: 'safety', label: 'Safety', color: '#28C850' },
  { key: 'body', label: 'Body', color: '#A78BFA' },
]

const STATUS_PILLS = [
  { key: 'active', label: 'Active Only', color: '#28C850' },
  { key: 'inactive', label: 'Inactive Only', color: '#FF4444' },
  { key: 'All', label: 'All', color: '#9A8E82' },
]

function categoryStyle(category: string | null) {
  return CATEGORY_COLORS[category ?? ''] ?? { color: '#9A8E82', bg: 'rgba(155,142,130,0.15)', label: category ?? '—' }
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newService, setNewService] = useState({
    name: '', category: 'maintenance', estimated_hours: '', base_price: '', description: '',
  })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

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

  async function toggleActive(id: string, current: boolean | null) {
    const next = !current
    const { error } = await createClient().from('services').update({ is_active: next }).eq('id', id)
    if (error) {
      toast.error('Failed to update status')
      return
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: next } : s))
    toast.success(next ? 'Service activated' : 'Service deactivated')
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault()
    if (!newService.name.trim() || !newService.estimated_hours) {
      toast.error('Name and estimated hours are required')
      return
    }
    setSubmitting(true)
    const { error } = await createClient().from('services').insert({
      name: newService.name.trim(),
      category: newService.category,
      estimated_hours: parseFloat(newService.estimated_hours),
      base_price: newService.base_price ? parseFloat(newService.base_price) : 0,
      description: newService.description.trim() || null,
      is_active: true,
    })
    setSubmitting(false)
    if (error) {
      toast.error('Failed to add service')
      return
    }
    toast.success('Service added')
    setShowAddForm(false)
    setNewService({ name: '', category: 'maintenance', estimated_hours: '', base_price: '', description: '' })
    loadServices()
  }

  const activeCount = useMemo(() => services.filter(s => s.is_active).length, [services])
  const categoryCount = useMemo(() => new Set(services.map(s => s.category).filter(Boolean)).size, [services])

  const filteredServices = useMemo(() => {
    let rows = services
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(s => s.name.toLowerCase().includes(q))
    }
    if (categoryFilter !== 'All') rows = rows.filter(s => s.category === categoryFilter)
    if (statusFilter === 'active') rows = rows.filter(s => s.is_active)
    else if (statusFilter === 'inactive') rows = rows.filter(s => !s.is_active)
    return rows
  }, [services, search, categoryFilter, statusFilter])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EDE8', margin: 0 }}>Services Management</h1>
          <p style={{ fontSize: '12px', color: '#6B6560', marginTop: 4 }}>
            Showing {filteredServices.length} of {services.length} services
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
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

      {/* Filter bar */}
      <div
        style={{
          background: '#1E1C18', border: '1px solid #2A2420',
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}
      >
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540' }} />
          <input
            placeholder="Search services…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => (e.currentTarget.style.borderColor = '#FF9500')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2A2420')}
            style={{
              width: '100%', background: '#141210', border: '1px solid #2A2420',
              borderRadius: 8, color: '#F0EDE8', padding: '9px 12px 9px 32px',
              fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {CATEGORY_PILLS.map(({ key, label, color }) => {
            const active = categoryFilter === key
            return (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                style={{
                  padding: '5px 14px', borderRadius: 20,
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '11px', fontWeight: active ? 600 : 500,
                  background: active ? `${color}20` : 'transparent',
                  border: `1px solid ${active ? color : '#2A2420'}`,
                  color: active ? color : '#6B6560',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_PILLS.map(({ key, label, color }) => {
            const active = statusFilter === key
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                style={{
                  padding: '5px 14px', borderRadius: 20,
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: '11px', fontWeight: active ? 600 : 500,
                  background: active ? `${color}20` : 'transparent',
                  border: `1px solid ${active ? color : '#2A2420'}`,
                  color: active ? color : '#6B6560',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
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
              ) : filteredServices.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center', color: '#4A4540' }}>No services found</td></tr>
              ) : filteredServices.map(svc => {
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
                      <button
                        onClick={() => toggleActive(svc.id, svc.is_active)}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none',
                          background: svc.is_active ? '#28C850' : '#2A2420',
                          cursor: 'pointer', position: 'relative',
                          flexShrink: 0, transition: 'background 0.2s',
                          padding: 0,
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute', top: 3,
                            left: svc.is_active ? 23 : 3,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#F0EDE8', transition: 'left 0.2s',
                          }}
                        />
                      </button>
                    </td>
                    <td style={{ padding: '0 16px', height: 56, color: '#4A4540', fontSize: '12px' }}>—</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div
          onClick={() => setShowAddForm(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 420, maxWidth: '100%', height: '100%', background: '#1A1714',
              borderLeft: '1px solid #2A2420', padding: 28, overflowY: 'auto',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '18px', fontWeight: 700, color: '#F0EDE8', marginBottom: 20 }}>
              Add Service
            </h2>
            <form onSubmit={addService}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6, textTransform: 'uppercase' }}>
                  Service Name *
                </label>
                <input
                  value={newService.name}
                  onChange={e => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', background: '#141210', border: '1px solid #2A2420', borderRadius: 8, color: '#F0EDE8', padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                  placeholder="e.g. Brake Pad Replacement"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6, textTransform: 'uppercase' }}>
                  Category
                </label>
                <select
                  value={newService.category}
                  onChange={e => setNewService(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', background: '#141210', border: '1px solid #2A2420', borderRadius: 8, color: '#F0EDE8', padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="electrical">Electrical</option>
                  <option value="safety">Safety</option>
                  <option value="body">Body</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6, textTransform: 'uppercase' }}>
                    Estimated Hours *
                  </label>
                  <input
                    type="number" step="0.5" min="0"
                    value={newService.estimated_hours}
                    onChange={e => setNewService(prev => ({ ...prev, estimated_hours: e.target.value }))}
                    style={{ width: '100%', background: '#141210', border: '1px solid #2A2420', borderRadius: 8, color: '#F0EDE8', padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6, textTransform: 'uppercase' }}>
                    Base Rate ($/hr)
                  </label>
                  <input
                    type="number" step="0.01" min="0"
                    value={newService.base_price}
                    onChange={e => setNewService(prev => ({ ...prev, base_price: e.target.value }))}
                    style={{ width: '100%', background: '#141210', border: '1px solid #2A2420', borderRadius: 8, color: '#F0EDE8', padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                    placeholder="95.00"
                  />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6, textTransform: 'uppercase' }}>
                  Description
                </label>
                <textarea
                  value={newService.description}
                  onChange={e => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', background: '#141210', border: '1px solid #2A2420', borderRadius: 8, color: '#F0EDE8', padding: '10px 12px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Internal notes about this service…"
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: submitting ? '#CC7700' : '#FF9500', color: '#0D0B08', border: 'none',
                    borderRadius: 8, padding: '12px 20px', fontSize: '12px', fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-heading), sans-serif',
                  }}
                >
                  {submitting ? 'Adding…' : 'Add Service'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    background: 'none', border: '1px solid #2A2420', color: '#9A8E82',
                    borderRadius: 8, padding: '12px 20px', fontSize: '12px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
