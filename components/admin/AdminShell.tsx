'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/workshop-portal'
  const [checking, setChecking] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('fixright_admin_auth') === 'true'
    setIsAuth(auth)
    setChecking(false)
    if (!auth && !isLoginPage) {
      router.push('/workshop-portal')
    }
  }, [pathname, router, isLoginPage])

  if (checking) {
    return (
      <div style={{
        background: '#1A1714', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#3A3430', fontSize: '13px' }}>Loading…</div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!isAuth) {
    return null
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1A1714' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflow: 'auto', paddingBottom: '64px' }}>
        {children}
      </main>
    </div>
  )
}
