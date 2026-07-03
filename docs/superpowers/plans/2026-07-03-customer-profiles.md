# Customer Profiles System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give FixRight's admin panel a `customers` table plus phone-number lookup on new bookings, a searchable customers list, and a per-customer detail page with service/vehicle history — so Omar can see who's calling before he picks up.

**Architecture:** One new Supabase table (`customers`) plus a nullable `customer_id` FK on `bookings`. All new admin UI is plain client components using the existing inline-style convention (no Tailwind, no CSS vars) and the existing "fetch everything client-side, aggregate in JS" pattern already used on the dashboard and invoices pages. Both the admin new-booking form and the public `/book` → `/api/bookings` route link (or create) a customer record by phone number.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase (browser + server clients already in `lib/supabase.ts` / `lib/supabase-server.ts`), lucide-react icons, react-hot-toast.

## Global Constraints

- This repo has no test runner (`package.json` scripts are only `dev`/`build`/`start`/`lint`). Verification is `npm run build` producing zero TypeScript errors, per CLAUDE.md rule 3 — every task below verifies with a build/typecheck step instead of unit tests.
- Follow the existing admin-panel visual convention exactly: inline `style={{}}` objects with hardcoded hex colors (`#1E1C18`, `#2A2420`, `#FF9500`, `#9A8E82`, `#6B6560`, `#F0EDE8`, `#28C850`, `#FF4444`, `#4A9EFF`), Barlow Condensed via `var(--font-heading), sans-serif` for headings/labels, Inter (default) for body text. Do not introduce Tailwind classes or CSS variables into admin pages — the existing admin pages don't use them, and CLAUDE.md rule 2 is honored by not hardcoding *new* one-off colors not already in the existing palette.
- Admin routes live under `/workshop-portal` (rule 4). Never add customer-facing links to the public navbar/footer (rule 1).
- Client components use `createClient` from `@/lib/supabase`; server routes use `createClient` from `@/lib/supabase-server` (rule 6).
- Use the local `getTodayEastern()` pattern (copy the function into any file that needs "today", matching `schedule/page.tsx` and `dashboard/page.tsx` — there is no shared util for it in this codebase) for any month/date-bucketing logic (rule 7).
- Commit message prefixes: `feat:`, `fix:`, `refactor:`, `docs:` (rule 8). **Per the user's explicit instructions for this feature, make exactly one commit at the end (Task 8) with message `feat: customer profiles — lookup, history, detail page`** — do not commit after each task.
- Never block booking submission on a non-critical side effect (rule 14) — customer link/create calls on the booking-insert paths must be wrapped in `try/catch` and must never prevent navigation or the booking API from returning success.
- RLS: enable it on `customers` but keep an allow-all policy, consistent with every other table in this project (see project memory: RLS hardening is a deferred, tracked follow-up — do not scope-creep into fixing it here).

---

### Task 1: `customers` table, `bookings.customer_id`, regenerated types

**Files:**
- Modify (regenerate in full): `types/database.types.ts`
- No local migration file — this project applies schema changes directly via the Supabase MCP tools (the `supabase/migrations/` folder is empty even though other tables like `invoices` already exist, confirming this project's convention).

**Interfaces:**
- Produces: `customers` table with columns `id, name, phone, email, address, notes, is_vip, created_at, updated_at`; `bookings.customer_id` (nullable uuid FK to `customers.id`). Later tasks rely on `Tables<'customers'>` and `Tables<'bookings'>['customer_id']` being present in `types/database.types.ts`.

- [ ] **Step 1: Inspect current schema**

Call `mcp__supabase__list_tables` (schema: `public`) and confirm `bookings` exists without a `customer_id` column and there is no `customers` table yet.

- [ ] **Step 2: Apply the migration**

Call `mcp__supabase__apply_migration` with `name: "add_customers_table"` and this exact SQL:

```sql
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  address text,
  notes text,
  is_vip boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings
  add column if not exists customer_id uuid references public.customers(id);

create index if not exists bookings_customer_id_idx on public.bookings(customer_id);

alter table public.customers enable row level security;

create policy "Allow all on customers"
  on public.customers
  for all
  using (true)
  with check (true);
```

- [ ] **Step 3: Verify the migration applied**

Call `mcp__supabase__list_tables` again. Confirm:
- `customers` table exists with the 9 columns above
- `bookings` table now has a `customer_id` column (uuid, nullable)

Also call `mcp__supabase__get_advisors` (type: `security`) and confirm no new critical advisory was introduced beyond the pre-existing "RLS allows public access" warnings already present on other tables (expected — matches every other table in this project).

- [ ] **Step 4: Regenerate TypeScript types**

Call `mcp__supabase__generate_typescript_types`. Take the full returned file content and overwrite `types/database.types.ts` with it in its entirety (use Write, not Edit, since this is a full regeneration).

- [ ] **Step 5: Verify the types file**

Run:
```bash
grep -n "customers:" types/database.types.ts
grep -n "customer_id" types/database.types.ts
```
Expected: `customers:` appears as a table key under `Tables`, and `customer_id` appears in the `bookings` table's `Row`, `Insert`, and `Update` types.

Run `npx tsc --noEmit` (or `npm run build` if faster to just do it once at the end — but a quick `tsc --noEmit` here catches type regressions early before later tasks build on top of it). Expected: no new errors beyond what existed before this change (there should be none, since nothing consumes the new fields yet).

---

### Task 2: Add "Customers" to the sidebar

**Files:**
- Modify: `components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nav link to `/workshop-portal/customers`, which Task 4 will create. Until Task 4 lands, this link 404s — acceptable mid-plan state, resolved by the end of the plan.

- [ ] **Step 1: Add the `Users` icon import**

In `components/admin/AdminSidebar.tsx:5-8`, the import currently reads:

```tsx
import {
  LayoutDashboard, Calendar, Plus, Clock, Settings,
  LogOut, FileText, ChevronLeft, ChevronRight, Wrench, BarChart2,
} from 'lucide-react'
```

Change to:

```tsx
import {
  LayoutDashboard, Calendar, Plus, Clock, Settings,
  LogOut, FileText, ChevronLeft, ChevronRight, Wrench, BarChart2, Users,
} from 'lucide-react'
```

- [ ] **Step 2: Insert the nav entry between Bookings and Invoices**

In `components/admin/AdminSidebar.tsx:12-21`, the `NAV` array currently reads:

```tsx
const NAV = [
  { href: '/workshop-portal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/workshop-portal/analytics',   label: 'Analytics',   icon: BarChart2 },
  { href: '/workshop-portal/bookings',    label: 'Bookings',    icon: Calendar },
  { href: '/workshop-portal/new-booking', label: 'New Booking', icon: Plus },
  { href: '/workshop-portal/services',    label: 'Services',    icon: Wrench },
  { href: '/workshop-portal/invoices',    label: 'Invoices',    icon: FileText },
  { href: '/workshop-portal/schedule',    label: 'Schedule',    icon: Clock },
  { href: '/workshop-portal/settings',    label: 'Settings',    icon: Settings },
]
```

Change to:

```tsx
const NAV = [
  { href: '/workshop-portal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/workshop-portal/analytics',   label: 'Analytics',   icon: BarChart2 },
  { href: '/workshop-portal/bookings',    label: 'Bookings',    icon: Calendar },
  { href: '/workshop-portal/customers',   label: 'Customers',   icon: Users },
  { href: '/workshop-portal/new-booking', label: 'New Booking', icon: Plus },
  { href: '/workshop-portal/services',    label: 'Services',    icon: Wrench },
  { href: '/workshop-portal/invoices',    label: 'Invoices',    icon: FileText },
  { href: '/workshop-portal/schedule',    label: 'Schedule',    icon: Clock },
  { href: '/workshop-portal/settings',    label: 'Settings',    icon: Settings },
]
```

- [ ] **Step 3: Verify**

Run `npx tsc --noEmit`. Expected: no errors. (Full route verification happens once `customers/page.tsx` exists in Task 4 — for now this is a static array change.)

---

### Task 3: Phone lookup on the New Booking form

**Files:**
- Modify: `app/(admin)/workshop-portal/new-booking/page.tsx`

**Interfaces:**
- Consumes: `Tables<'customers'>` from `types/database.types.ts` (Task 1).
- Produces: booking inserts now carry `customer_id`; new customers are auto-created via `upsert(..., { onConflict: 'phone' })`. The page also accepts a `?phone=` query param (consumed by Task 5's "New Booking" button) to prefill and auto-run the lookup.

- [ ] **Step 1: Add the `Customer` type and `Suspense`/`useSearchParams` scaffolding**

In `app/(admin)/workshop-portal/new-booking/page.tsx`, the imports at the top currently read (lines 1–10):

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { vehicleMakes, vehicleModels, vehicleYears } from '@/lib/vehicleData'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Mechanic = Tables<'mechanics'>
type Service = Tables<'services'>
```

Change to:

```tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { vehicleMakes, vehicleModels, vehicleYears } from '@/lib/vehicleData'
import { ArrowLeft, CheckCircle, Search } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Mechanic = Tables<'mechanics'>
type Service = Tables<'services'>
type Customer = Tables<'customers'>
```

(This follows the same `Suspense` + `useSearchParams` pattern already used in `app/(admin)/workshop-portal/bookings/page.tsx`, which is required because `useSearchParams` opts a client component out of static rendering unless wrapped.)

- [ ] **Step 2: Rename the component and change the default export**

The function is currently declared as:

```tsx
export default function NewBookingPage() {
```

Change the declaration to a non-exported inner component:

```tsx
function NewBookingForm() {
```

At the very end of the file, after the closing `}` of that function, add a new default export:

```tsx
export default function NewBookingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#4A4540', fontSize: '13px' }}>Loading…</div>}>
      <NewBookingForm />
    </Suspense>
  )
}
```

- [ ] **Step 3: Add `customer_id` to form state**

The `form` state initializer currently reads:

```tsx
const [form, setForm] = useState({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  vehicle_year: '',
  vehicle_make: '',
  vehicle_model: '',
  vehicle_vin: '',
  service_id: '',
  service_description: '',
  preferred_date: '',
  preferred_time: 'Morning (8:00am – 11:00am)',
  source: 'phone',
  mechanic_id: '',
  estimated_hours: '',
  notes: '',
  status: 'confirmed',
})
```

Add `customer_id: ''` as the first field:

```tsx
const [form, setForm] = useState({
  customer_id: '',
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  vehicle_year: '',
  vehicle_make: '',
  vehicle_model: '',
  vehicle_vin: '',
  service_id: '',
  service_description: '',
  preferred_date: '',
  preferred_time: 'Morning (8:00am – 11:00am)',
  source: 'phone',
  mechanic_id: '',
  estimated_hours: '',
  notes: '',
  status: 'confirmed',
})
```

- [ ] **Step 4: Add lookup state and the `lookupCustomer` function**

Right after the `const [serviceAutoFilled, setServiceAutoFilled] = useState(false)` line, add:

```tsx
const searchParams = useSearchParams()
const [lookupPhone, setLookupPhone] = useState('')
const [looking, setLooking] = useState(false)
const [searchedOnce, setSearchedOnce] = useState(false)
const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null)
const [visitCount, setVisitCount] = useState(0)

async function lookupCustomer(phoneArg?: string) {
  const phone = (phoneArg ?? lookupPhone).trim()
  if (!phone) return
  setLooking(true)
  const supabase = createClient()
  const { data: customer } = await supabase.from('customers').select('*').eq('phone', phone).maybeSingle()

  if (customer) {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
    setFoundCustomer(customer)
    setVisitCount(count ?? 0)
    setForm(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email ?? '',
    }))
  } else {
    setFoundCustomer(null)
    setVisitCount(0)
    setForm(prev => ({ ...prev, customer_id: '', customer_phone: phone }))
  }
  setSearchedOnce(true)
  setLooking(false)
}

useEffect(() => {
  const phoneParam = searchParams.get('phone')
  if (phoneParam) {
    setLookupPhone(phoneParam)
    lookupCustomer(phoneParam)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

(The `eslint-disable` line matches this codebase's existing convention of intentionally-empty dependency arrays for mount-only effects — see the pattern already used for `mechanics`/`services` loading a few lines above.)

- [ ] **Step 5: Insert the Customer Lookup card into the JSX**

The form currently opens with:

```tsx
<form onSubmit={submit}>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

    {/* Left column */}
    <div>
      {/* Customer */}
      <div style={card}>
```

Change to insert a full-width lookup card before the two-column grid:

```tsx
<form onSubmit={submit}>
  <div style={card}>
    <div style={secTitle}>Customer Lookup</div>
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: searchedOnce ? 14 : 0 }}>
      <div style={{ flex: 1 }}>
        <label style={lStyle}>Phone Number</label>
        <input
          value={lookupPhone}
          onChange={e => setLookupPhone(e.target.value)}
          style={iStyle}
          placeholder="519-555-0100"
        />
      </div>
      <button
        type="button"
        onClick={() => lookupCustomer()}
        disabled={looking || !lookupPhone.trim()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#2A2420', color: '#F0EDE8', border: '1px solid #3A3430',
          borderRadius: 8, padding: '10px 20px', fontSize: '13px', fontWeight: 600,
          cursor: looking ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <Search size={14} />
        {looking ? 'Searching…' : 'Search'}
      </button>
    </div>
    {searchedOnce && foundCustomer && (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        background: 'rgba(40,200,80,0.08)', border: '1px solid rgba(40,200,80,0.25)',
        borderRadius: 8, padding: '12px 14px',
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#F0EDE8' }}>{foundCustomer.name}</div>
          <div style={{ fontSize: '12px', color: '#9A8E82', marginTop: 2 }}>{foundCustomer.email || 'No email on file'}</div>
        </div>
        <span style={{
          background: 'rgba(40,200,80,0.15)', color: '#28C850',
          padding: '4px 12px', borderRadius: 20, fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>
          Returning customer — {visitCount} previous visit{visitCount === 1 ? '' : 's'}
        </span>
      </div>
    )}
    {searchedOnce && !foundCustomer && (
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.25)',
        borderRadius: 8, padding: '12px 14px',
      }}>
        <span style={{
          background: 'rgba(255,149,0,0.15)', color: '#FF9500',
          padding: '4px 12px', borderRadius: 20, fontSize: '11px', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          New customer
        </span>
      </div>
    )}
  </div>

  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

    {/* Left column */}
    <div>
      {/* Customer */}
      <div style={card}>
```

(Everything from `{/* Customer */}` onward is unchanged — only the new lookup card and its wrapping `<div>`/opening `<form>` context above it are new.)

- [ ] **Step 6: Include `customer_id` in the insert and auto-create/link new customers**

The `submit` function currently reads:

```tsx
async function submit(e: React.FormEvent) {
  e.preventDefault()
  if (!form.customer_name.trim() || !form.customer_phone.trim()) {
    setError('Customer name and phone are required')
    return
  }
  setSubmitting(true); setError('')
  const supabase = createClient()
  const { data, error: err } = await supabase.from('bookings').insert({
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    customer_email: form.customer_email.trim() || null,
    vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year) : null,
    vehicle_make: form.vehicle_make || null,
    vehicle_model: form.vehicle_model || null,
    vehicle_vin: form.vehicle_vin.trim() || null,
    service_id: form.service_id || null,
    service_description: form.service_description || null,
    preferred_date: form.preferred_date || null,
    preferred_time: form.preferred_time || null,
    source: form.source || null,
    mechanic_id: form.mechanic_id || null,
    estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
    notes: form.notes.trim() || null,
    status: form.status,
  }).select().single()

  setSubmitting(false)
  if (err) { setError(err.message); toast.error(err.message); return }
  toast.success('Booking created successfully')
  router.push(`/workshop-portal/bookings/${data.id}`)
}
```

Change to:

```tsx
async function submit(e: React.FormEvent) {
  e.preventDefault()
  if (!form.customer_name.trim() || !form.customer_phone.trim()) {
    setError('Customer name and phone are required')
    return
  }
  setSubmitting(true); setError('')
  const supabase = createClient()
  const { data, error: err } = await supabase.from('bookings').insert({
    customer_id: form.customer_id || null,
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    customer_email: form.customer_email.trim() || null,
    vehicle_year: form.vehicle_year ? parseInt(form.vehicle_year) : null,
    vehicle_make: form.vehicle_make || null,
    vehicle_model: form.vehicle_model || null,
    vehicle_vin: form.vehicle_vin.trim() || null,
    service_id: form.service_id || null,
    service_description: form.service_description || null,
    preferred_date: form.preferred_date || null,
    preferred_time: form.preferred_time || null,
    source: form.source || null,
    mechanic_id: form.mechanic_id || null,
    estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
    notes: form.notes.trim() || null,
    status: form.status,
  }).select().single()

  if (err) {
    setSubmitting(false)
    setError(err.message); toast.error(err.message); return
  }

  if (!form.customer_id) {
    try {
      const { data: customer } = await supabase
        .from('customers')
        .upsert(
          { name: form.customer_name.trim(), phone: form.customer_phone.trim(), email: form.customer_email.trim() || null },
          { onConflict: 'phone' }
        )
        .select()
        .single()
      if (customer) {
        await supabase.from('bookings').update({ customer_id: customer.id }).eq('id', data.id)
      }
    } catch (customerErr) {
      console.error('Customer link error:', customerErr)
    }
  }

  setSubmitting(false)
  toast.success('Booking created successfully')
  router.push(`/workshop-portal/bookings/${data.id}`)
}
```

- [ ] **Step 7: Build check**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors. Then run `npm run dev`, open `http://localhost:3000/workshop-portal/new-booking` (log in as Omar first if prompted), and manually verify:
1. Typing a phone number that has no matching customer and clicking Search shows the amber "New customer" badge.
2. Creating a booking from that state, then re-opening New Booking and searching the same phone number now shows the green "Returning customer — 1 previous visit" badge with the name/email auto-filled.
3. Visiting `/workshop-portal/new-booking?phone=<that same number>` auto-runs the search on load.

---

### Task 4: Customers list page

**Files:**
- Create: `app/(admin)/workshop-portal/customers/page.tsx`

**Interfaces:**
- Consumes: `Tables<'customers'>`, `Tables<'bookings'>`, `Tables<'invoices'>` from `types/database.types.ts`.
- Produces: `/workshop-portal/customers` route, linking to `/workshop-portal/customers/[id]` (Task 5).

- [ ] **Step 1: Write the page**

Create `app/(admin)/workshop-portal/customers/page.tsx`:

```tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Search, X, Users, UserPlus, Repeat, Star } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Customer = Tables<'customers'>
type Booking = Tables<'bookings'>
type Invoice = Tables<'invoices'>

interface Row {
  customer: Customer
  visits: number
  lastVisit: string | null
  totalSpent: number
}

function getTodayEastern(): string {
  const now = new Date()
  const easternTime = new Date(now.toLocaleString('en-US', {
    timeZone: 'America/Toronto',
  }))
  const year = easternTime.getFullYear()
  const month = String(easternTime.getMonth() + 1).padStart(2, '0')
  const day = String(easternTime.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: c }, { data: b }, { data: i }] = await Promise.all([
        supabase.from('customers').select('*'),
        supabase.from('bookings').select('*'),
        supabase.from('invoices').select('*'),
      ])
      setCustomers(c ?? [])
      setBookings(b ?? [])
      setInvoices(i ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const rows = useMemo<Row[]>(() => {
    const bookingIdToCustomerId = new Map<string, string>()
    const customerBookings = new Map<string, Booking[]>()

    for (const b of bookings) {
      if (!b.customer_id) continue
      bookingIdToCustomerId.set(b.id, b.customer_id)
      const list = customerBookings.get(b.customer_id) ?? []
      list.push(b)
      customerBookings.set(b.customer_id, list)
    }

    const spentByCustomer = new Map<string, number>()
    for (const inv of invoices) {
      if (inv.status !== 'paid' || !inv.booking_id) continue
      const customerId = bookingIdToCustomerId.get(inv.booking_id)
      if (!customerId) continue
      spentByCustomer.set(customerId, (spentByCustomer.get(customerId) ?? 0) + inv.total)
    }

    return customers.map(customer => {
      const theirBookings = customerBookings.get(customer.id) ?? []
      const dates = theirBookings.map(b => b.preferred_date).filter((d): d is string => !!d).sort()
      return {
        customer,
        visits: theirBookings.length,
        lastVisit: dates.length ? dates[dates.length - 1] : null,
        totalSpent: spentByCustomer.get(customer.id) ?? 0,
      }
    })
  }, [customers, bookings, invoices])

  const filtered = useMemo(() => {
    let list = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.customer.name.toLowerCase().includes(q) ||
        r.customer.phone.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      if (!a.lastVisit && !b.lastVisit) return 0
      if (!a.lastVisit) return 1
      if (!b.lastVisit) return -1
      return b.lastVisit.localeCompare(a.lastVisit)
    })
  }, [rows, search])

  const today = getTodayEastern()
  const thisMonth = today.slice(0, 7)
  const newThisMonth = customers.filter(c => (c.created_at ?? '').startsWith(thisMonth)).length
  const returningCount = rows.filter(r => r.visits >= 2).length

  async function toggleVip(customerId: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('customers').update({ is_vip: !current, updated_at: new Date().toISOString() }).eq('id', customerId)
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, is_vip: !current } : c))
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#F0EDE8', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: '12px', color: '#6B6560', marginTop: 4 }}>
            {filtered.length} of {customers.length} customers
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Customers', value: customers.length.toString(), icon: Users, color: '#4A9EFF' },
          { label: 'New This Month', value: newThisMonth.toString(), icon: UserPlus, color: '#28C850' },
          { label: 'Returning Customers', value: returningCount.toString(), icon: Repeat, color: '#FF9500' },
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

      {/* Search bar */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 220, flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4A4540' }} />
            <input
              placeholder="Search by name or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#141210', border: '1px solid #2A2420',
                borderRadius: 8, color: '#F0EDE8', padding: '9px 12px 9px 32px',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit', width: '100%',
              }}
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: '#6B6560', padding: '8px 12px', fontSize: '12px', borderRadius: 8, cursor: 'pointer' }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#141210' }}>
                {['Name', 'Phone', 'Email', 'Total Visits', 'Last Visit', 'Total Spent', 'VIP', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left', padding: '11px 16px',
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
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#4A4540' }}>Loading…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                    <Users size={32} style={{ color: '#2A2420', marginBottom: 12 }} />
                    <div style={{ color: '#4A4540', fontSize: '14px' }}>No customers yet</div>
                  </td>
                </tr>
              ) : filtered.map(row => (
                <tr
                  key={row.customer.id}
                  style={{ borderTop: '1px solid #2A2420', transition: 'background 0.1s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,149,0,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => window.location.href = `/workshop-portal/customers/${row.customer.id}`}
                >
                  <td style={{ padding: '0 16px', height: 60, fontWeight: 600, color: '#F0EDE8' }}>{row.customer.name}</td>
                  <td style={{ padding: '0 16px', height: 60, color: '#9A8E82', whiteSpace: 'nowrap' }}>{row.customer.phone}</td>
                  <td style={{ padding: '0 16px', height: 60, color: '#9A8E82' }}>{row.customer.email || '—'}</td>
                  <td style={{ padding: '0 16px', height: 60, color: '#F0EDE8' }}>{row.visits}</td>
                  <td style={{ padding: '0 16px', height: 60, color: '#9A8E82', whiteSpace: 'nowrap' }}>{fmtDate(row.lastVisit)}</td>
                  <td style={{ padding: '0 16px', height: 60, fontWeight: 700, color: '#F0EDE8' }}>{fmtAmount(row.totalSpent)}</td>
                  <td style={{ padding: '0 16px', height: 60 }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => toggleVip(row.customer.id, row.customer.is_vip ?? false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
                      aria-label={row.customer.is_vip ? 'Remove VIP' : 'Mark VIP'}
                    >
                      <Star
                        size={16}
                        style={{ color: row.customer.is_vip ? '#FF9500' : '#3A3430' }}
                        fill={row.customer.is_vip ? '#FF9500' : 'none'}
                      />
                    </button>
                  </td>
                  <td style={{ padding: '0 16px', height: 60 }} onClick={e => e.stopPropagation()}>
                    <Link
                      href={`/workshop-portal/customers/${row.customer.id}`}
                      style={{
                        fontSize: '12px', color: '#FF9500', textDecoration: 'none',
                        border: '1px solid rgba(255,149,0,0.3)', borderRadius: 6,
                        padding: '4px 10px', fontWeight: 500,
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run `npx tsc --noEmit`. Expected: no errors.

Run `npm run dev`, visit `/workshop-portal/customers`. Expected: stats bar renders, table lists any customers created in Task 3's manual test, search filters by name/phone, clicking the star toggles VIP (persisted — refresh the page and it stays), "View" navigates to `/workshop-portal/customers/<id>` (will 404 until Task 5 lands — that's expected at this point in the plan).

---

### Task 5: Customer detail page

**Files:**
- Create: `app/(admin)/workshop-portal/customers/[id]/page.tsx`

**Interfaces:**
- Consumes: `Tables<'customers'>`, `Tables<'bookings'>`, `Tables<'invoices'>`, `StatusBadge` from `@/components/admin/StatusBadge`.
- Produces: `/workshop-portal/customers/[id]` route. Links to `/workshop-portal/new-booking?phone=<phone>` (consumed by Task 3) and `/workshop-portal/invoices/[id]` (existing route).

- [ ] **Step 1: Write the page**

Create `app/(admin)/workshop-portal/customers/[id]/page.tsx`:

```tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ArrowLeft, Star, Plus, Pencil, Check, X, Car, Wrench, Calendar, DollarSign } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Customer = Tables<'customers'>
type Booking = Tables<'bookings'>
type Invoice = Tables<'invoices'>

interface VehicleGroup {
  key: string
  year: number | null
  make: string | null
  model: string | null
  visits: number
  lastService: string | null
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
const secTitle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
  color: '#6B6560', textTransform: 'uppercase', marginBottom: 20,
}

function fmtAmount(n: number) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTimestamp(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const [notesDraft, setNotesDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: c } = await supabase.from('customers').select('*').eq('id', id).single()
      if (!c) { setLoading(false); return }
      setCustomer(c)
      setEditName(c.name)
      setEditEmail(c.email ?? '')
      setEditAddress(c.address ?? '')
      setEditNotes(c.notes ?? '')
      setNotesDraft(c.notes ?? '')

      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', id)
        .order('preferred_date', { ascending: false })
      setBookings(b ?? [])

      const bookingIds = (b ?? []).map(x => x.id)
      if (bookingIds.length) {
        const { data: i } = await supabase.from('invoices').select('*').in('booking_id', bookingIds)
        setInvoices(i ?? [])
      }

      setLoading(false)
    }
    load()
  }, [id])

  const invoiceByBooking = useMemo(() => {
    const map = new Map<string, Invoice>()
    for (const inv of invoices) {
      if (inv.booking_id) map.set(inv.booking_id, inv)
    }
    return map
  }, [invoices])

  const totalSpent = useMemo(
    () => invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    [invoices]
  )

  const lastVisit = useMemo(() => {
    const dates = bookings.map(b => b.preferred_date).filter((d): d is string => !!d).sort()
    return dates.length ? dates[dates.length - 1] : null
  }, [bookings])

  const vehicleGroups = useMemo<VehicleGroup[]>(() => {
    const map = new Map<string, VehicleGroup>()
    for (const b of bookings) {
      const key = `${b.vehicle_year ?? ''}|${b.vehicle_make ?? ''}|${b.vehicle_model ?? ''}`
      if (!b.vehicle_make && !b.vehicle_model && !b.vehicle_year) continue
      const existing = map.get(key)
      if (existing) {
        existing.visits += 1
        if (b.preferred_date && (!existing.lastService || b.preferred_date > existing.lastService)) {
          existing.lastService = b.preferred_date
        }
      } else {
        map.set(key, {
          key, year: b.vehicle_year, make: b.vehicle_make, model: b.vehicle_model,
          visits: 1, lastService: b.preferred_date,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.lastService ?? '').localeCompare(a.lastService ?? ''))
  }, [bookings])

  async function saveEdit() {
    if (!customer) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('customers').update({
      name: editName.trim(),
      email: editEmail.trim() || null,
      address: editAddress.trim() || null,
      notes: editNotes.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', customer.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setCustomer(prev => prev ? { ...prev, name: editName.trim(), email: editEmail.trim() || null, address: editAddress.trim() || null, notes: editNotes.trim() || null } : prev)
    setNotesDraft(editNotes.trim())
    setEditing(false)
    toast.success('Customer updated')
  }

  async function toggleVip() {
    if (!customer) return
    const next = !customer.is_vip
    const supabase = createClient()
    await supabase.from('customers').update({ is_vip: next, updated_at: new Date().toISOString() }).eq('id', customer.id)
    setCustomer(prev => prev ? { ...prev, is_vip: next } : prev)
  }

  async function saveNotes() {
    if (!customer) return
    setSavingNotes(true)
    const supabase = createClient()
    const { error } = await supabase.from('customers').update({
      notes: notesDraft.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq('id', customer.id)
    setSavingNotes(false)
    if (error) { toast.error(error.message); return }
    setCustomer(prev => prev ? { ...prev, notes: notesDraft.trim() || null } : prev)
    setEditNotes(notesDraft.trim())
    toast.success('Notes saved')
  }

  if (loading) {
    return <div style={{ padding: 40, color: '#4A4540', fontSize: '13px' }}>Loading…</div>
  }

  if (!customer) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ color: '#6B6560', fontSize: '13px' }}>Customer not found.</div>
        <Link href="/workshop-portal/customers" style={{ color: '#FF9500', fontSize: '13px' }}>← Back to Customers</Link>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <Link
        href="/workshop-portal/customers"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B6560', textDecoration: 'none', fontSize: '12px', marginBottom: 20 }}
      >
        <ArrowLeft size={13} /> Back to Customers
      </Link>

      {/* Header card */}
      <div style={card}>
        {editing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lStyle}>Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Email</label>
                <input value={editEmail} onChange={e => setEditEmail(e.target.value)} style={iStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lStyle}>Address</label>
              <input value={editAddress} onChange={e => setEditAddress(e.target.value)} style={iStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lStyle}>Notes</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} style={{ ...iStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={saveEdit}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FF9500', color: '#0D0B08', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Check size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setEditName(customer.name)
                  setEditEmail(customer.email ?? '')
                  setEditAddress(customer.address ?? '')
                  setEditNotes(customer.notes ?? '')
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: '#9A8E82', borderRadius: 8, padding: '9px 16px', fontSize: '12px', cursor: 'pointer' }}
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '26px', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
                  {customer.name}
                </h1>
                {customer.is_vip && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'rgba(255,149,0,0.15)', color: '#FF9500',
                    padding: '3px 10px', borderRadius: 20, fontSize: '11px', fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>
                    <Star size={11} fill="#FF9500" /> VIP Customer
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#9A8E82' }}>{customer.phone}{customer.email ? ` · ${customer.email}` : ''}</div>
              {customer.address && <div style={{ fontSize: '13px', color: '#6B6560', marginTop: 4 }}>{customer.address}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={toggleVip}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: customer.is_vip ? '#FF9500' : '#9A8E82', borderRadius: 8, padding: '9px 14px', fontSize: '12px', cursor: 'pointer' }}
              >
                <Star size={13} fill={customer.is_vip ? '#FF9500' : 'none'} /> {customer.is_vip ? 'Remove VIP' : 'Mark VIP'}
              </button>
              <button
                onClick={() => setEditing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #2A2420', color: '#9A8E82', borderRadius: 8, padding: '9px 14px', fontSize: '12px', cursor: 'pointer' }}
              >
                <Pencil size={13} /> Edit
              </button>
              <Link
                href={`/workshop-portal/new-booking?phone=${encodeURIComponent(customer.phone)}`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FF9500', color: '#0D0B08', textDecoration: 'none', borderRadius: 8, padding: '9px 16px', fontSize: '12px', fontWeight: 700 }}
              >
                <Plus size={13} /> New Booking
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        {[
          { label: 'Total Visits', value: bookings.length.toString(), icon: Calendar, color: '#4A9EFF' },
          { label: 'Total Spent', value: fmtAmount(totalSpent), icon: DollarSign, color: '#28C850' },
          { label: 'Last Visit', value: fmtDate(lastVisit), icon: Wrench, color: '#FF9500' },
          { label: 'Member Since', value: fmtTimestamp(customer.created_at), icon: Star, color: '#9A8E82' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6B6560', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#F0EDE8', marginTop: 2 }}>{item.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Service history */}
      <div style={card}>
        <div style={secTitle}>Service History</div>
        {bookings.length === 0 ? (
          <div style={{ color: '#4A4540', fontSize: '13px', padding: '12px 0' }}>No bookings yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['Date', 'Service', 'Vehicle', 'Status', 'Invoice', 'Amount'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: '#6B6560', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const inv = invoiceByBooking.get(b.id)
                  return (
                    <tr key={b.id} style={{ borderTop: '1px solid #2A2420' }}>
                      <td style={{ padding: '10px 12px', color: '#9A8E82', whiteSpace: 'nowrap' }}>{fmtDate(b.preferred_date)}</td>
                      <td style={{ padding: '10px 12px', color: '#F0EDE8' }}>{b.service_description || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#9A8E82', whiteSpace: 'nowrap' }}>
                        {[b.vehicle_year, b.vehicle_make, b.vehicle_model].filter(Boolean).join(' ') || '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}><StatusBadge status={b.status} /></td>
                      <td style={{ padding: '10px 12px' }}>
                        {inv ? (
                          <Link href={`/workshop-portal/invoices/${inv.id}`} style={{ color: '#FF9500', fontSize: '12px', textDecoration: 'none' }}>
                            View Invoice
                          </Link>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#F0EDE8', fontWeight: 600 }}>
                        {inv && inv.status === 'paid' ? fmtAmount(inv.total) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vehicle history */}
      <div style={card}>
        <div style={secTitle}>Vehicle History</div>
        {vehicleGroups.length === 0 ? (
          <div style={{ color: '#4A4540', fontSize: '13px', padding: '12px 0' }}>No vehicles on file</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vehicleGroups.map(v => (
              <div key={v.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#141210', borderRadius: 8, border: '1px solid #2A2420' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Car size={16} style={{ color: '#6B6560' }} />
                  <span style={{ color: '#F0EDE8', fontSize: '13px', fontWeight: 600 }}>
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unknown vehicle'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#9A8E82' }}>
                  <span>{v.visits} visit{v.visits === 1 ? '' : 's'}</span>
                  <span>Last service: {fmtDate(v.lastService)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Internal notes */}
      <div style={card}>
        <div style={secTitle}>Internal Notes</div>
        <textarea
          value={notesDraft}
          onChange={e => setNotesDraft(e.target.value)}
          rows={4}
          placeholder="Notes about this customer, visible to shop staff only…"
          style={{ ...iStyle, resize: 'vertical', marginBottom: 12 }}
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          style={{ background: '#2A2420', color: '#F0EDE8', border: '1px solid #3A3430', borderRadius: 8, padding: '9px 18px', fontSize: '12px', fontWeight: 600, cursor: savingNotes ? 'not-allowed' : 'pointer' }}
        >
          {savingNotes ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run `npx tsc --noEmit`. Expected: no errors.

Run `npm run dev`, from `/workshop-portal/customers` click "View" on a customer created earlier. Verify:
1. Header shows name, phone/email, VIP toggle, Edit button, New Booking button.
2. Clicking Edit switches to inline name/email/address/notes fields; Save persists and Cancel reverts.
3. Stats row shows correct visit count / total spent / last visit / member since.
4. Service History table lists the booking(s) created in Task 3's manual test.
5. Vehicle History groups by year/make/model with correct visit counts.
6. Typing in Internal Notes and clicking Save Notes persists across a page refresh.
7. "New Booking" button navigates to `/workshop-portal/new-booking?phone=<phone>` and auto-populates the lookup (verifies Task 3 Step 4's query-param effect).

---

### Task 6: Auto-link/create customers from the public `/book` form

**Files:**
- Modify: `app/api/bookings/route.ts`

**Interfaces:**
- Consumes: `customer_name`, `customer_phone`, `customer_email` already destructured from the request body (existing code).
- Produces: every public booking now has a linked `customers` row.

- [ ] **Step 1: Add the customer link/create block**

In `app/api/bookings/route.ts`, the booking insert's error check currently reads (lines 61–65):

```ts
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
```

Change to insert a new `try/catch` block for the customer link between the error check and the existing email-sending `try`:

```ts
    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      const { data: customer } = await supabase
        .from('customers')
        .upsert(
          { name: customer_name, phone: customer_phone, email: customer_email ?? null },
          { onConflict: 'phone' }
        )
        .select()
        .single()
      if (customer) {
        await supabase.from('bookings').update({ customer_id: customer.id }).eq('id', data.id)
      }
    } catch (customerError) {
      console.error('Customer link error:', customerError)
    }

    try {
```

Everything below the newly-inserted block (the existing Resend email-sending `try/catch`) is unchanged.

- [ ] **Step 2: Build check**

Run `npx tsc --noEmit`. Expected: no errors.

Run `npm run dev`, submit a booking through the public `/book` flow (`http://localhost:3000/book`) using a phone number not yet in `customers`. Then check `/workshop-portal/customers` — the new customer should appear with 1 visit. Submit a second booking from `/book` reusing the same phone number and confirm the *same* customer's visit count becomes 2 (not a duplicate customer row — this confirms the `upsert(..., { onConflict: 'phone' })` path works).

---

### Task 7: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- None — documentation only.

- [ ] **Step 1: Add `customers` to the Database Schema section**

In `CLAUDE.md`, under `## Database Schema (Supabase)` → `### Tables`, after the `bookings` entry (which should now mention `customer_id`) and before `services`, add:

```
- customers: id, name, phone (unique), email, address, notes, is_vip,
  created_at, updated_at
```

Also update the `bookings` table bullet to include the new column — find:

```
- bookings: id, customer_name, customer_phone, customer_email, vehicle_year, 
  vehicle_make, vehicle_model, vehicle_mileage, vehicle_vin, service_id, 
  service_description (holds service name), estimated_hours, actual_hours,
  status (pending/confirmed/in_progress/completed/cancelled), mechanic_id,
  notes, source (web/phone/walkin), preferred_date, preferred_time,
  confirmed_date, confirmed_time, created_at, updated_at
```

Change to:

```
- bookings: id, customer_id (FK to customers, nullable), customer_name,
  customer_phone, customer_email, vehicle_year, vehicle_make, vehicle_model,
  vehicle_mileage, vehicle_vin, service_id, service_description (holds
  service name), estimated_hours, actual_hours,
  status (pending/confirmed/in_progress/completed/cancelled), mechanic_id,
  notes, source (web/phone/walkin), preferred_date, preferred_time,
  confirmed_date, confirmed_time, created_at, updated_at
```

- [ ] **Step 2: Add to the "What's Been Built" Admin Panel list**

Under `## What's Been Built` → `### Admin Panel (/workshop-portal)`, after the "New booking form" bullet and before "Schedule", add:

```
- Customers list (/workshop-portal/customers): search by name/phone, stats
  bar (total/new this month/returning), sortable table (visits, last visit,
  total spent), VIP star toggle
- Customer detail (/workshop-portal/customers/[id]): inline-editable profile,
  VIP toggle, service history, vehicle history grouped by year/make/model,
  internal notes
- Phone-number lookup on New Booking: search by phone auto-fills returning
  customers and links the booking's customer_id; unmatched numbers get a
  new customers row created on save
- Public /book submissions and admin-created bookings both auto-link (or
  auto-create) a customers row by phone via upsert(onConflict: 'phone')
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "customers" CLAUDE.md
```
Expected: the new lines appear in both the schema and built-list sections.

---

### Task 8: Build, fix errors, commit, push

**Files:** none new — this task only runs commands.

- [ ] **Step 1: Full production build**

Run:
```bash
npm run build
```
Expected: build completes with zero TypeScript errors. If there are errors, fix them in the relevant file from Tasks 1–7 (most likely culprits: a stale field name from `database.types.ts`, or a missed `Suspense` wrap for `useSearchParams`) and re-run until clean.

- [ ] **Step 2: Review the diff**

Run:
```bash
git status
git diff --stat
```
Expected: modified files are `types/database.types.ts`, `components/admin/AdminSidebar.tsx`, `app/(admin)/workshop-portal/new-booking/page.tsx`, `app/api/bookings/route.ts`, `CLAUDE.md`; new files are `app/(admin)/workshop-portal/customers/page.tsx`, `app/(admin)/workshop-portal/customers/[id]/page.tsx`, and this plan file under `docs/superpowers/plans/`.

- [ ] **Step 3: Commit**

```bash
git add types/database.types.ts components/admin/AdminSidebar.tsx \
  "app/(admin)/workshop-portal/new-booking/page.tsx" \
  "app/(admin)/workshop-portal/customers/page.tsx" \
  "app/(admin)/workshop-portal/customers/[id]/page.tsx" \
  app/api/bookings/route.ts CLAUDE.md \
  docs/superpowers/plans/2026-07-03-customer-profiles.md
git commit -m "$(cat <<'EOF'
feat: customer profiles — lookup, history, detail page
EOF
)"
```

- [ ] **Step 4: Push**

Confirm with the user before pushing (per this project's risk posture — pushing to `main` is a shared-state action). Once confirmed:
```bash
git push origin main
```

- [ ] **Step 5: Final verification**

Run `git status` and confirm the working tree is clean and `main` is up to date with `origin/main`.
