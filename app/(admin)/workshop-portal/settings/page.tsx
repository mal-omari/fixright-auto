'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Check } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Mechanic = Tables<'mechanics'>

const SHOP_INFO = {
  name: 'FixRight Automotive',
  address: '123 Industrial Rd, London, ON N6A 2W5',
  phone: '519.471.9462',
}

const iStyle: React.CSSProperties = {
  width: '100%', background: '#1A1714', border: '1px solid #2A2420',
  borderRadius: '3px', color: '#F0EDE8', padding: '10px 12px',
  fontSize: '13px', outline: 'none', fontFamily: 'inherit',
}
const lStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: 600,
  letterSpacing: '0.1em', color: '#4A4540', marginBottom: '5px',
  textTransform: 'uppercase',
}
const card: React.CSSProperties = {
  background: '#111008', border: '1px solid #1F1C17',
  borderRadius: '4px', padding: '28px', marginBottom: '16px',
}
const secTitle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: '#F0EDE8', marginBottom: '20px',
  paddingBottom: '12px', borderBottom: '1px solid #1A1714',
}

function SaveBtn({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: saved ? 'rgba(40,200,80,0.15)' : '#FF9500',
        color: saved ? '#28C850' : '#111008',
        border: saved ? '1px solid rgba(40,200,80,0.3)' : 'none',
        borderRadius: '3px', padding: '9px 18px',
        fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {saved ? <><Check size={13} /> Saved</> : 'Save'}
    </button>
  )
}

export default function SettingsPage() {
  const [labourRate, setLabourRate] = useState('95')
  const [rateSaved, setRateSaved] = useState(false)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [mechSaved, setMechSaved] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)
  const [notifs, setNotifs] = useState({ newBooking: true, cancellation: true })

  useEffect(() => {
    const saved = localStorage.getItem('fixright_labour_rate')
    if (saved) setLabourRate(saved)
    createClient().from('mechanics').select('*').order('name').then(({ data }) => {
      setMechanics(data ?? [])
    })
  }, [])

  function saveRate() {
    localStorage.setItem('fixright_labour_rate', labourRate)
    setRateSaved(true)
    setTimeout(() => setRateSaved(false), 2500)
  }

  async function toggleMechanic(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('mechanics').update({ is_active: !current }).eq('id', id)
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, is_active: !current } : m))
  }

  function saveNotifs() {
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  return (
    <div style={{ padding: '32px', maxWidth: '680px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F0EDE8', marginBottom: '28px' }}>Settings</h1>

      {/* Shop Info */}
      <div style={card}>
        <div style={secTitle}>Shop Info</div>
        {[
          { label: 'Shop Name', value: SHOP_INFO.name },
          { label: 'Address', value: SHOP_INFO.address },
          { label: 'Phone', value: SHOP_INFO.phone },
        ].map(row => (
          <div key={row.label} style={{ marginBottom: '16px' }}>
            <label style={lStyle}>{row.label}</label>
            <div style={{
              background: '#1A1714', border: '1px solid #1A1714',
              borderRadius: '3px', padding: '10px 12px',
              fontSize: '13px', color: '#4A4540',
            }}>
              {row.value}
            </div>
          </div>
        ))}
        <p style={{ fontSize: '11px', color: '#3A3430', margin: 0 }}>
          Shop info is managed via the codebase. Contact your developer to update.
        </p>
      </div>

      {/* Labour Rate */}
      <div style={card}>
        <div style={secTitle}>Labour Rate</div>
        <div style={{ marginBottom: '20px' }}>
          <label style={lStyle}>Default Hourly Rate (CAD)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '160px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4A4540', fontSize: '14px' }}>$</span>
              <input
                type="number" min="0" step="5"
                value={labourRate}
                onChange={e => setLabourRate(e.target.value)}
                style={{ ...iStyle, paddingLeft: '24px' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#4A4540' }}>/ hr</span>
          </div>
          <p style={{ fontSize: '11px', color: '#3A3430', marginTop: '8px' }}>
            Stored locally. Will be used when generating invoices.
          </p>
        </div>
        <SaveBtn onClick={saveRate} saved={rateSaved} />
      </div>

      {/* Mechanics */}
      <div style={card}>
        <div style={secTitle}>Mechanics</div>
        {mechanics.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#3A3430', marginBottom: '16px' }}>
            No mechanics found. Add them via Supabase.
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            {mechanics.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid #1A1714',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', color: '#F0EDE8', fontWeight: 500 }}>{m.name}</div>
                  {m.email && <div style={{ fontSize: '11px', color: '#4A4540', marginTop: '2px' }}>{m.email}</div>}
                </div>
                <button
                  onClick={() => toggleMechanic(m.id, m.is_active ?? false)}
                  style={{
                    background: m.is_active ? 'rgba(40,200,80,0.15)' : 'rgba(255,68,68,0.1)',
                    border: `1px solid ${m.is_active ? 'rgba(40,200,80,0.3)' : 'rgba(255,68,68,0.3)'}`,
                    color: m.is_active ? '#28C850' : '#FF4444',
                    padding: '5px 12px', fontSize: '11px', fontWeight: 600,
                    borderRadius: '12px', cursor: 'pointer', letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {m.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => {
            setMechSaved(true)
            setTimeout(() => setMechSaved(false), 2000)
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: mechSaved ? 'rgba(40,200,80,0.15)' : '#FF9500',
            color: mechSaved ? '#28C850' : '#111008',
            border: mechSaved ? '1px solid rgba(40,200,80,0.3)' : 'none',
            borderRadius: '3px', padding: '9px 18px',
            fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          {mechSaved ? <><Check size={13} /> Saved</> : 'Save'}
        </button>
      </div>

      {/* Notifications */}
      <div style={card}>
        <div style={secTitle}>Notification Preferences</div>
        <div style={{ marginBottom: '20px' }}>
          {[
            { key: 'newBooking' as const, label: 'Email on new booking', sub: 'Receive an email whenever a new booking is submitted' },
            { key: 'cancellation' as const, label: 'Email on cancellation', sub: 'Receive an email when a booking is cancelled' },
          ].map(pref => (
            <div
              key={pref.key}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid #1A1714' }}
            >
              <div>
                <div style={{ fontSize: '13px', color: '#F0EDE8', fontWeight: 500 }}>{pref.label}</div>
                <div style={{ fontSize: '11px', color: '#4A4540', marginTop: '3px' }}>{pref.sub}</div>
              </div>
              <button
                onClick={() => setNotifs(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                style={{
                  width: '40px', height: '22px', borderRadius: '11px', border: 'none',
                  background: notifs[pref.key] ? '#FF9500' : '#2A2420',
                  cursor: 'pointer', position: 'relative', flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: notifs[pref.key] ? '21px' : '3px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#F0EDE8', transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: '#3A3430', marginBottom: '16px' }}>
          Email delivery requires Resend integration. These toggles are placeholders.
        </p>
        <SaveBtn onClick={saveNotifs} saved={notifSaved} />
      </div>
    </div>
  )
}
