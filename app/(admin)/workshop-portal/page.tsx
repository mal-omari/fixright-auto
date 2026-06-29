'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (localStorage.getItem('fixright_admin_auth') === 'true') {
      router.replace('/workshop-portal/dashboard')
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('fixright_admin_auth', 'true')
    router.push('/workshop-portal/dashboard')
  }

  const input: React.CSSProperties = {
    width: '100%', background: '#1A1714', border: '1px solid #2A2420',
    borderRadius: '3px', color: '#F0EDE8', padding: '11px 14px',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit',
  }
  const label: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.12em', color: '#4A4540', marginBottom: '6px',
    textTransform: 'uppercase',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1A1714',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{
          background: '#111008', border: '1px solid #1F1C17',
          borderRadius: '4px', padding: '44px 40px',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#FF9500', letterSpacing: '0.12em' }}>
              FIXRIGHT AUTOMOTIVE
            </div>
            <div style={{ fontSize: '11px', color: '#3A3430', letterSpacing: '0.2em', marginTop: '8px', fontWeight: 600 }}>
              SHOP MANAGEMENT PORTAL
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={input}
                onFocus={e => (e.target.style.borderColor = '#FF9500')}
                onBlur={e => (e.target.style.borderColor = '#2A2420')}
              />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={input}
                onFocus={e => (e.target.style.borderColor = '#FF9500')}
                onBlur={e => (e.target.style.borderColor = '#2A2420')}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%', background: '#FF9500', color: '#111008',
                border: 'none', borderRadius: '3px', padding: '13px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: '11px', color: '#2A2420', marginTop: '20px' }}>
          Invite-only access
        </p>
      </div>
    </div>
  )
}
