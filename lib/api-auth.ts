import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

type AdminCheck =
  | { response: NextResponse; supabase: null }
  | { response: null; supabase: Awaited<ReturnType<typeof createClient>> }

// Gate for admin-only API routes: same-origin check (cheap CSRF guard for
// cookie-authenticated POSTs) plus a real Supabase Auth session.
export async function requireAdmin(req: NextRequest): Promise<AdminCheck> {
  const origin = req.headers.get('origin')
  if (origin) {
    let originHost: string
    try {
      originHost = new URL(origin).host
    } catch {
      return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), supabase: null }
    }
    if (originHost !== req.headers.get('host')) {
      return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), supabase: null }
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), supabase: null }
  }

  return { response: null, supabase }
}
