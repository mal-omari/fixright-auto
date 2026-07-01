'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { Check, Building2, DollarSign, Wrench, Bell } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Mechanic = Tables<'mechanics'>

const SHOP_INFO = {
  name: 'FixRight Automotive',
  address: '123 Industrial Rd, London, ON N6A 2W5',
  phone: '519.471.9462',
}

const iStyle: React.CSSProperties = {
  width: '100%', background: '#141210', border: '1px solid #2A2420',
  borderRadius: 8, color: '#F0EDE8', padding: '10px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
}
const lStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 600,
  letterSpacing: '0.12em', color: '#6B6560', marginBottom: 6,
  textTransform: 'uppercase',
}
const card: React.CSSProperties = {
  background: '#1E1C18', border: '1px solid #2A2420',
  borderRadius: 12, padding: 24, marginBottom: 16,
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function SaveBtn({ onClick, saved, label = 'Save' }: { onClick: () => void; saved: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: saved ? 'rgba(40,200,80,0.12)' : '#FF9500',
        color: saved ? '#28C850' : '#0D0B08',
        border: saved ? '1px solid rgba(40,200,80,0.3)' : 'none',
        borderRadius: 8, padding: '9px 20px',
        fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {saved ? <><Check size={13} /> Saved</> : label}
    </button>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #2A2420' }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,149,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} style={{ color: '#FF9500' }} />
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color: '#F0EDE8' }}>{title}</span>
    </div>
  )
}

export default function SettingsPage() {
  const [labourRate, setLabourRate] = useState('95')
  const [editingRate, setEditingRate] = useState(false)
  const [rateInput, setRateInput] = useState('95')
  const [rateSaved, setRateSaved] = useState(false)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [notifSaved, setNotifSaved] = useState(false)
  const [notifs, setNotifs] = useState({ newBooking: true, cancellation: true })
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [addStatus, setAddStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [nameError, setNameError] = useState('')
  const [addingMechanic, setAddingMechanic] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fixright_labour_rate')
    if (saved) { setLabourRate(saved); setRateInput(saved) }
    createClient().from('mechanics').select('*').order('name').then(({ data }) => {
      setMechanics(data ?? [])
    })
  }, [])

  function saveRate() {
    localStorage.setItem('fixright_labour_rate', rateInput)
    setLabourRate(rateInput)
    setEditingRate(false)
    setRateSaved(true)
    setTimeout(() => setRateSaved(false), 2500)
  }

  async function toggleMechanic(id: string, current: boolean) {
    await createClient().from('mechanics').update({ is_active: !current }).eq('id', id)
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m))
  }

  async function addMechanic() {
    if (!newName.trim()) { setNameError('Name is required'); return }
    setNameError('')
    setAddingMechanic(true)
    const { data, error } = await createClient()
      .from('mechanics')
      .insert({ name: newName.trim(), phone: newPhone.trim() || null, email: newEmail.trim() || null, is_active: true })
      .select()
      .single()
    setAddingMechanic(false)
    if (error) {
      setAddStatus({ type: 'error', message: error.message })
      setTimeout(() => setAddStatus(null), 4000)
      toast.error(error.message)
    } else {
      setMechanics(prev => [...prev, data])
      setNewName(''); setNewPhone(''); setNewEmail('')
      setAddStatus({ type: 'success', message: 'Mechanic added successfully' })
      setTimeout(() => setAddStatus(null), 3000)
      toast.success('Mechanic added successfully')
    }
  }

  function saveNotifs() {
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>

      {/* Shop Info */}
      <div style={card}>
        <SectionHeader icon={Building2} title="Shop Info" />
        {[
          { label: 'Shop Name', value: SHOP_INFO.name },
          { label: 'Address', value: SHOP_INFO.address },
          { label: 'Phone', value: SHOP_INFO.phone },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: 16 }}>
            <label style={lStyle}>{row.label}</label>
            <div style={{
              background: '#141210', border: '1px solid #1E1C18',
              borderRadius: 8, padding: '10px 12px',
              fontSize: '13px', color: '#4A4540',
            }}>
              {row.value}
            </div>
          </div>
        ))}
        <p style={{ fontSize: '11px', color: '#3A3430', margin: 0 }}>
          Shop info is managed in the codebase. Contact your developer to update.
        </p>
      </div>

      {/* Labour Rate */}
      <div style={card}>
        <SectionHeader icon={DollarSign} title="Labour Rate" />
        <div style={{ marginBottom: 20 }}>
          <label style={lStyle}>Default Hourly Rate (CAD)</label>
          {editingRate ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 180 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B6560', fontSize: '14px' }}>$</span>
                <input
                  type="number" min="0" step="5"
                  value={rateInput}
                  onChange={e => setRateInput(e.target.value)}
                  style={{ ...iStyle, paddingLeft: 26 }}
                  autoFocus
                />
              </div>
              <span style={{ fontSize: '12px', color: '#6B6560' }}>/ hr</span>
              <SaveBtn onClick={saveRate} saved={rateSaved} />
              <button
                onClick={() => { setEditingRate(false); setRateInput(labourRate) }}
                style={{ background: 'none', border: '1px solid #2A2420', color: '#6B6560', padding: '9px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '12px' }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#F0EDE8' }}>
                ${parseFloat(labourRate).toFixed(2)}<span style={{ fontSize: '16px', color: '#6B6560', fontWeight: 400 }}>/hr</span>
              </div>
              <button
                onClick={() => setEditingRate(true)}
                style={{
                  background: 'none', border: '1px solid #2A2420', color: '#9A8E82',
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '12px',
                }}
              >
                Edit
              </button>
              {rateSaved && <span style={{ fontSize: '12px', color: '#28C850' }}>✓ Saved</span>}
            </div>
          )}
          <p style={{ fontSize: '11px', color: '#4A4540', marginTop: 8 }}>
            Stored locally. Used when generating invoices.
          </p>
        </div>
      </div>

      {/* Mechanics */}
      <div style={card}>
        <SectionHeader icon={Wrench} title="Mechanics" />
        {mechanics.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#4A4540', marginBottom: 16 }}>
            No mechanics found. Add them via Supabase.
          </div>
        ) : (
          <div style={{ marginBottom: 4 }}>
            {mechanics.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid #2A2420',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: m.is_active ? '#FF9500' : '#2A2420',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, color: m.is_active ? '#0D0B08' : '#4A4540',
                      transition: 'background 0.2s, color 0.2s',
                    }}
                  >
                    {initials(m.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#F0EDE8', fontWeight: 500 }}>{m.name}</div>
                    {m.email && <div style={{ fontSize: '11px', color: '#4A4540', marginTop: 2 }}>{m.email}</div>}
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => toggleMechanic(m.id, m.is_active ?? false)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none',
                    background: m.is_active ? '#FF9500' : '#2A2420',
                    cursor: 'pointer', position: 'relative',
                    flexShrink: 0, transition: 'background 0.2s',
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute', top: 3,
                      left: m.is_active ? 23 : 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#F0EDE8', transition: 'left 0.2s',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Mechanic */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #2A2420' }}>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
            color: '#FF9500', textTransform: 'uppercase', marginBottom: 12,
          }}>
            ADD NEW MECHANIC
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 160px', minWidth: 140 }}>
              <input
                placeholder="Name *"
                value={newName}
                onChange={e => { setNewName(e.target.value); if (nameError) setNameError('') }}
                style={iStyle}
              />
              {nameError && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: 4 }}>{nameError}</div>
              )}
            </div>
            <div style={{ flex: '1 1 140px', minWidth: 120 }}>
              <input
                placeholder="Phone"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                style={iStyle}
              />
            </div>
            <div style={{ flex: '1 1 180px', minWidth: 150 }}>
              <input
                placeholder="Email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                style={iStyle}
              />
            </div>
            <button
              onClick={addMechanic}
              disabled={addingMechanic}
              style={{
                background: '#FF9500', color: '#0D0B08',
                border: 'none', borderRadius: 8,
                padding: '10px 18px',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: '12px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: addingMechanic ? 'not-allowed' : 'pointer',
                opacity: addingMechanic ? 0.6 : 1,
                whiteSpace: 'nowrap',
                alignSelf: 'flex-start',
              }}
            >
              + Add Mechanic
            </button>
          </div>
          {addStatus && (
            <div style={{
              marginTop: 10, fontSize: '12px', fontWeight: 500,
              color: addStatus.type === 'success' ? '#28C850' : '#EF4444',
            }}>
              {addStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div style={card}>
        <SectionHeader icon={Bell} title="Notification Preferences" />
        <div style={{ marginBottom: 20 }}>
          {[
            { key: 'newBooking' as const, label: 'Email on new booking', sub: 'Receive an email whenever a new booking is submitted' },
            { key: 'cancellation' as const, label: 'Email on cancellation', sub: 'Receive an email when a booking is cancelled' },
          ].map(pref => (
            <div
              key={pref.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #2A2420' }}
            >
              <div>
                <div style={{ fontSize: '13px', color: '#F0EDE8', fontWeight: 500 }}>{pref.label}</div>
                <div style={{ fontSize: '11px', color: '#4A4540', marginTop: 3 }}>{pref.sub}</div>
              </div>
              <button
                onClick={() => setNotifs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none',
                  background: notifs[pref.key] ? '#FF9500' : '#2A2420',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  transition: 'background 0.2s', padding: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute', top: 3,
                    left: notifs[pref.key] ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#F0EDE8', transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: '#3A3430', marginBottom: 16 }}>
          Email delivery requires Resend integration. These toggles are placeholders.
        </p>
        <SaveBtn onClick={saveNotifs} saved={notifSaved} label="Save Preferences" />
      </div>
    </div>
  )
}
