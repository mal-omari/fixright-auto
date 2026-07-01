import { Toaster } from 'react-hot-toast'
import { AdminShell } from '@/components/admin/AdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E1C18',
            color: '#F0EDE8',
            border: '1px solid #3A3430',
          },
          success: { iconTheme: { primary: '#FF9500', secondary: '#1E1C18' } },
        }}
      />
      <AdminShell>{children}</AdminShell>
    </>
  )
}
