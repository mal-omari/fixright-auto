# Services Management, Invoice Emails & Booking Step 4 Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Services management admin page, wire up invoice "send to customer" and "paid receipt" emails via Resend, redesign booking-form Step 4 (timing), and clean up duplicate admin header dates.

**Architecture:** All new admin UI follows the existing single-file, inline-`style`-object convention already used throughout `app/(admin)/workshop-portal/**` (see `invoices/page.tsx`, `settings/page.tsx`) — no new component library, no Tailwind for admin pages. New Resend email routes mirror the existing `app/api/bookings/confirm/route.ts` pattern: a shared `resend` client from `lib/resend.ts`, HTML built by a pure function in `lib/emails/`, server-side Supabase client from `lib/supabase-server.ts`. The public `/book` form keeps its existing Tailwind-utility + inline-style hybrid style.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase (JS client v2, project `bkbvmjubjjmuoveqeecj`), Resend, react-hot-toast, lucide-react, jsPDF (unaffected).

## Global Constraints

- Zero TypeScript errors: run `npm run build` before every commit (CLAUDE.md rule 3).
- No hardcoded colors — reuse the exact hex values already used on the page you're editing (CLAUDE.md rule 2). This plan copies real values from existing files, not the generic design-system list.
- Admin routes live under `/workshop-portal` (CLAUDE.md rule 4).
- Never block booking submission on email failure — wrap Resend calls in try/catch that never throws to the caller (CLAUDE.md rule 14, already the pattern in `app/api/bookings/route.ts`).
- Commit message prefix convention: `feat:`, `fix:`, `refactor:`, `docs:` (CLAUDE.md rule 8).
- No automated test suite exists in this repo (`package.json` has no test script, no jest/vitest config). Verification for every task is: `npm run build` (zero errors) + a manual check via `npm run dev` in the browser, matching existing project practice.
- Omar's phone `519.471.9462`, address `2117 Aldersbrook Rd, London ON N6G 3X1` — never placeholder these (CLAUDE.md rules 9–10).

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| Supabase `services` table | migrate | add `base_price`, `show_price_publicly` columns |
| `types/database.types.ts` | regenerate | pick up new columns |
| `components/admin/AdminSidebar.tsx` | modify | add "Services" nav entry + `Wrench` icon |
| `app/(admin)/workshop-portal/services/page.tsx` | create | services management page (stats, table, inline edit, toggle, add-service panel) |
| `lib/emails/generateInvoiceEmail.ts` | create | invoice HTML email builder |
| `app/api/invoices/send/route.ts` | create | POST: email invoice to customer, set status `sent` |
| `lib/emails/generateReceiptEmail.ts` | create | payment receipt HTML email builder |
| `app/api/invoices/receipt/route.ts` | create | POST: email payment receipt, set `paid_date` |
| `app/(admin)/workshop-portal/invoices/[id]/page.tsx` | modify | add "Send Invoice to Customer" button + paid-receipt confirm |
| `app/(admin)/workshop-portal/dashboard/page.tsx` | modify | remove duplicate date line under "SHOP CAPACITY — TODAY" |
| `app/(public)/book/page.tsx` | modify | Step 4 redesign: date section styling, icon time cards, store full display-string time value |
| `app/(admin)/workshop-portal/new-booking/page.tsx` | modify | align `TIMES` values with the new display-string format so `preferred_time` is consistent regardless of booking source |
| `lib/emails/generateBookingReceived.ts` | modify | simplify `formatTime` now that `preferred_time` already arrives as a display string |
| `lib/emails/generateBookingConfirmed.ts` | modify | same simplification |
| `CLAUDE.md` | modify | document Services page + invoice email features |

---

### Task 1: Add `base_price` / `show_price_publicly` to `services` table + regenerate types

**Files:**
- Supabase migration (via MCP `apply_migration`, project_id `bkbvmjubjjmuoveqeecj`)
- Modify: `types/database.types.ts` (regenerated, not hand-edited)

**Interfaces:**
- Produces: `services.base_price: number | null`, `services.show_price_publicly: boolean | null` — consumed by Task 2–6 (Services page) as `Tables<'services'>`.

- [ ] **Step 1: Apply the migration**

Call `mcp__supabase__apply_migration` with `project_id: "bkbvmjubjjmuoveqeecj"`, `name: "add_service_pricing_fields"`, and:

```sql
alter table public.services
  add column base_price numeric default 0,
  add column show_price_publicly boolean default false;
```

This matches the existing nullable-with-default pattern used by `services.is_active`.

- [ ] **Step 2: Verify the columns exist**

Call `mcp__supabase__execute_sql` with:

```sql
select column_name, data_type, column_default
from information_schema.columns
where table_name = 'services' and column_name in ('base_price', 'show_price_publicly');
```

Expected: two rows, `base_price` (`numeric`, default `0`), `show_price_publicly` (`boolean`, default `false`).

- [ ] **Step 3: Regenerate TypeScript types**

Call `mcp__supabase__generate_typescript_types` with `project_id: "bkbvmjubjjmuoveqeecj"`. Overwrite `/Users/farouq/fixright-auto/types/database.types.ts` with the returned content (it's fully generated — no hand-written code lives in this file, safe to replace wholesale). Confirm the `services.Row` type now includes:

```ts
base_price: number | null
show_price_publicly: boolean | null
```

- [ ] **Step 4: Build check**

Run: `cd /Users/farouq/fixright-auto && npm run build`
Expected: build succeeds with zero TypeScript errors (no code references the new columns yet, so this just confirms the regenerated types file itself is syntactically valid and nothing else broke).

- [ ] **Step 5: Commit**

```bash
git add types/database.types.ts
git commit -m "feat: add base_price and show_price_publicly to services table"
```

(The migration itself is already live in Supabase — nothing else to stage for that part.)

---

### Task 2: Add "Services" to the admin sidebar

**Files:**
- Modify: `components/admin/AdminSidebar.tsx:5-19`

**Interfaces:**
- Produces: route `/workshop-portal/services` becomes a valid nav target for Task 3.

- [ ] **Step 1: Add the `Wrench` icon import**

In `/Users/farouq/fixright-auto/components/admin/AdminSidebar.tsx`, change the import block (currently lines 5-8):

```tsx
import {
  LayoutDashboard, Calendar, Plus, Clock, Settings,
  LogOut, FileText, ChevronLeft, ChevronRight,
} from 'lucide-react'
```

to:

```tsx
import {
  LayoutDashboard, Calendar, Plus, Clock, Settings,
  LogOut, FileText, ChevronLeft, ChevronRight, Wrench,
} from 'lucide-react'
```

- [ ] **Step 2: Insert the Services nav entry**

Change the `NAV` array (currently lines 12-19):

```tsx
const NAV = [
  { href: '/workshop-portal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/workshop-portal/bookings',    label: 'Bookings',    icon: Calendar },
  { href: '/workshop-portal/new-booking', label: 'New Booking', icon: Plus },
  { href: '/workshop-portal/invoices',    label: 'Invoices',    icon: FileText },
  { href: '/workshop-portal/schedule',    label: 'Schedule',    icon: Clock },
  { href: '/workshop-portal/settings',    label: 'Settings',    icon: Settings },
]
```

to:

```tsx
const NAV = [
  { href: '/workshop-portal/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/workshop-portal/bookings',    label: 'Bookings',    icon: Calendar },
  { href: '/workshop-portal/new-booking', label: 'New Booking', icon: Plus },
  { href: '/workshop-portal/services',    label: 'Services',    icon: Wrench },
  { href: '/workshop-portal/invoices',    label: 'Invoices',    icon: FileText },
  { href: '/workshop-portal/schedule',    label: 'Schedule',    icon: Clock },
  { href: '/workshop-portal/settings',    label: 'Settings',    icon: Settings },
]
```

Services sits immediately before Invoices — satisfying "between Bookings and Invoices" while keeping New Booking adjacent to Bookings. No change needed to `isActive()` (`AdminSidebar.tsx:38-41`) — the generic `pathname.startsWith(href + '/')` branch already covers `/workshop-portal/services`.

- [ ] **Step 3: Build check**

Run: `npm run build` — expect zero errors (the route doesn't exist yet, but a `Link href` to a future route is not a build error in Next.js).

- [ ] **Step 4: Commit**

Hold this commit — combine with Task 3's commit once the route exists, so the sidebar link isn't pointing at a 404 in the history. Proceed directly to Task 3.

---

### Task 3: Services page — data, stats bar, and read-only table

**Files:**
- Create: `app/(admin)/workshop-portal/services/page.tsx`

**Interfaces:**
- Consumes: `Tables<'services'>` from `@/types/database.types` (now includes `base_price`, `show_price_publicly` from Task 1).
- Produces: `Service` type alias, `CATEGORY_COLORS` map, `fmtRate()` helper — reused by Tasks 4–6 in the same file.

- [ ] **Step 1: Create the page with fetch + stats + static table**

Create `/Users/farouq/fixright-auto/app/(admin)/workshop-portal/services/page.tsx`:

```tsx
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
  body:        { color: '#A855F7', bg: 'rgba(168,85,247,0.15)', label: 'Body' },
}

function categoryStyle(category: string | null) {
  return CATEGORY_COLORS[category ?? ''] ?? { color: '#9A8E82', bg: 'rgba(155,142,130,0.15)', label: category ?? '—' }
}

function fmtRate(n: number | null) {
  return `$${(n ?? 0).toFixed(2)}/hr`
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
                    <td style={{ padding: '0 16px', height: 56, color: '#9A8E82' }}>{svc.estimated_hours}h</td>
                    <td style={{ padding: '0 16px', height: 56, color: '#9A8E82' }}>{fmtRate(svc.base_price)}</td>
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
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 3: Manual check**

Run `npm run dev`, log into `/workshop-portal`, click "Services" in the sidebar. Expect: page loads, shows the 20 existing seeded services grouped/sorted by category then name, stats bar shows correct active count and distinct category count.

- [ ] **Step 4: Commit**

```bash
git add components/admin/AdminSidebar.tsx "app/(admin)/workshop-portal/services/page.tsx"
git commit -m "feat: add services management page with sidebar nav entry"
```

---

### Task 4: Inline-editable Est. Hours and Base Rate cells

**Files:**
- Modify: `app/(admin)/workshop-portal/services/page.tsx`

**Interfaces:**
- Consumes: `Service` type, `services`/`setServices` state from Task 3.
- Produces: `EditableCell` component, `updateField()` handler — used by Task 5/6 nowhere else, self-contained to this file.

- [ ] **Step 1: Add the `EditableCell` component and wire it into the table**

In the same file, add this component above `export default function ServicesPage()`:

```tsx
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
```

Then, in `ServicesPage`, add an update handler right after `loadServices`:

```tsx
  async function updateField(id: string, field: 'estimated_hours' | 'base_price', value: number) {
    const { error } = await createClient().from('services').update({ [field]: value }).eq('id', id)
    if (error) {
      toast.error('Failed to update service')
      return
    }
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    toast.success('Service updated')
  }
```

Replace the static "Est. Hours" and "Base Rate" `<td>` cells:

```tsx
                    <td style={{ padding: '0 16px', height: 56, color: '#9A8E82' }}>{svc.estimated_hours}h</td>
                    <td style={{ padding: '0 16px', height: 56, color: '#9A8E82' }}>{fmtRate(svc.base_price)}</td>
```

with:

```tsx
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <EditableCell value={svc.estimated_hours} suffix="h" onSave={v => updateField(svc.id, 'estimated_hours', v)} />
                    </td>
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <EditableCell value={svc.base_price ?? 0} suffix="/hr ($)" onSave={v => updateField(svc.id, 'base_price', v)} />
                    </td>
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 3: Manual check**

On `/workshop-portal/services`, click an Est. Hours or Base Rate value, change it, press Enter — expect an inline update, a success toast, and the new value persisted (confirm via Supabase table editor or a page refresh).

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/workshop-portal/services/page.tsx"
git commit -m "feat: inline-editable hours and rate on services page"
```

---

### Task 5: Active/Inactive toggle switch

**Files:**
- Modify: `app/(admin)/workshop-portal/services/page.tsx`

**Interfaces:**
- Consumes: `services`/`setServices` state, `createClient` from Task 3.

- [ ] **Step 1: Add the toggle handler**

Add next to `updateField`:

```tsx
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
```

- [ ] **Step 2: Replace the static Status cell with a toggle switch**

Replace:

```tsx
                    <td style={{ padding: '0 16px', height: 56 }}>
                      <span style={{ fontSize: '12px', color: svc.is_active ? '#28C850' : '#6B6560' }}>
                        {svc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
```

with:

```tsx
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
```

(Green `#28C850` when active, matching the spec — deliberately not reusing the mechanic-list toggle's amber, since that page's convention differs from this spec's explicit color.)

- [ ] **Step 3: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 4: Manual check**

Toggle a service off on `/workshop-portal/services` — expect the switch to turn grey, a "Service deactivated" toast, and (separately) that the same service disappears from the `/book` form's service list on refresh, since `/book` already filters `is_active: true` (`app/(public)/book/page.tsx:119`) — though note the public form's `SERVICES` label list is currently hardcoded (Task 14 does not change this; it only affects which services contribute hours to `serviceHours`, not which buttons render — this is pre-existing behavior, out of scope here).

- [ ] **Step 5: Commit**

```bash
git add "app/(admin)/workshop-portal/services/page.tsx"
git commit -m "feat: add active/inactive toggle to services page"
```

---

### Task 6: Add Service slide-in form

**Files:**
- Modify: `app/(admin)/workshop-portal/services/page.tsx`

**Interfaces:**
- Consumes: `loadServices()` from Task 3 to refresh the table after insert.

- [ ] **Step 1: Add form state and the slide-in panel**

Add state near the top of `ServicesPage`:

```tsx
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newService, setNewService] = useState({
    name: '', category: 'maintenance', estimated_hours: '', base_price: '', description: '',
  })
```

Add the submit handler next to `toggleActive`:

```tsx
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
```

Wire the "Add Service" button's `onClick`:

```tsx
        <button
          onClick={() => setShowAddForm(true)}
          style={{
```

(keep the rest of that button's existing `style`/children unchanged from Task 3).

Add the slide-in panel just before the final closing `</div>` of the component's returned JSX (i.e. right after the table's closing `</div>`, still inside the outermost `<div style={{ padding: 24 }}>`):

```tsx
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
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 3: Manual check**

Click "Add Service", fill in name + hours, submit — expect the panel to close, a "Service added" toast, and the new row to appear in the table (defaults to Active).

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/workshop-portal/services/page.tsx"
git commit -m "feat: add new-service slide-in form"
```

---

### Task 7: Invoice email HTML builder

**Files:**
- Create: `lib/emails/generateInvoiceEmail.ts`

**Interfaces:**
- Consumes: `Tables<'invoices'>`, `Tables<'invoice_line_items'>` from `@/types/database.types`.
- Produces: `generateInvoiceEmail(invoice, lineItems): string` — consumed by Task 8's API route.

- [ ] **Step 1: Create the template file**

Create `/Users/farouq/fixright-auto/lib/emails/generateInvoiceEmail.ts`:

```ts
import type { Tables } from '@/types/database.types'

type Invoice = Tables<'invoices'>
type LineItem = Tables<'invoice_line_items'>

export function generateInvoiceEmail(invoice: Invoice, lineItems: LineItem[]): string {
  const labourItems = lineItems.filter(i => i.type === 'labour')
  const partsItems = lineItems.filter(i => i.type === 'parts')

  return `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;">
    <div style="background:#1A1714;padding:32px;text-align:center;">
      <div style="color:#FF9500;font-size:24px;font-weight:bold;
        letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
      <div style="color:#F0EDE8;font-size:14px;margin-top:4px;">
        2117 Aldersbrook Rd, London ON N6G 3X1 | 519.471.9462</div>
    </div>
    <div style="background:#fff;padding:32px;max-width:600px;margin:0 auto;">
      <table width="100%">
        <tr>
          <td>
            <div style="font-size:11px;color:#888;text-transform:uppercase;
              letter-spacing:1px;">Invoice</div>
            <div style="font-size:28px;font-weight:bold;color:#1A1714;">
              ${invoice.invoice_number}</div>
          </td>
          <td align="right">
            <div style="font-size:11px;color:#888;">Date</div>
            <div style="color:#1A1714;">${new Date(invoice.created_at).toLocaleDateString('en-CA')}</div>
            <div style="font-size:11px;color:#888;margin-top:8px;">Due Date</div>
            <div style="color:#1A1714;">${invoice.due_date || 'Upon Receipt'}</div>
          </td>
        </tr>
      </table>

      <div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:4px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;">Bill To</div>
        <div style="font-weight:bold;color:#1A1714;">${invoice.customer_name}</div>
        <div style="color:#555;">${invoice.customer_phone}</div>
        <div style="color:#555;">${invoice.vehicle_year} ${invoice.vehicle_make} ${invoice.vehicle_model}</div>
      </div>

      ${labourItems.length > 0 ? `
      <div style="margin-top:24px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;
          letter-spacing:1px;border-bottom:2px solid #FF9500;padding-bottom:4px;">
          Labour</div>
        <table width="100%" style="border-collapse:collapse;margin-top:8px;">
          <tr style="font-size:11px;color:#888;">
            <td>Description</td>
            <td align="center">Hours</td>
            <td align="right">Rate</td>
            <td align="right">Amount</td>
          </tr>
          ${labourItems.map(item => `
          <tr style="border-top:1px solid #eee;">
            <td style="padding:8px 0;color:#1A1714;">${item.description}</td>
            <td align="center" style="color:#1A1714;">${item.quantity}</td>
            <td align="right" style="color:#1A1714;">$${item.unit_price}/hr</td>
            <td align="right" style="color:#1A1714;">$${(item.total ?? 0).toFixed(2)}</td>
          </tr>`).join('')}
        </table>
      </div>` : ''}

      ${partsItems.length > 0 ? `
      <div style="margin-top:24px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;
          letter-spacing:1px;border-bottom:2px solid #FF9500;padding-bottom:4px;">
          Parts</div>
        <table width="100%" style="border-collapse:collapse;margin-top:8px;">
          <tr style="font-size:11px;color:#888;">
            <td>Description</td>
            <td align="center">Qty</td>
            <td align="right">Unit Price</td>
            <td align="right">Amount</td>
          </tr>
          ${partsItems.map(item => `
          <tr style="border-top:1px solid #eee;">
            <td style="padding:8px 0;color:#1A1714;">${item.description}</td>
            <td align="center" style="color:#1A1714;">${item.quantity}</td>
            <td align="right" style="color:#1A1714;">$${item.unit_price}</td>
            <td align="right" style="color:#1A1714;">$${(item.total ?? 0).toFixed(2)}</td>
          </tr>`).join('')}
        </table>
      </div>` : ''}

      <div style="margin-top:24px;border-top:2px solid #eee;padding-top:16px;">
        <table width="100%">
          <tr>
            <td align="right" style="color:#888;font-size:13px;">Labour Subtotal</td>
            <td align="right" width="120" style="color:#1A1714;">
              $${invoice.labour_subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td align="right" style="color:#888;font-size:13px;">Parts Subtotal</td>
            <td align="right" style="color:#1A1714;">
              $${invoice.parts_subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td align="right" style="color:#888;font-size:13px;">HST (13%)</td>
            <td align="right" style="color:#1A1714;">
              $${invoice.hst_amount.toFixed(2)}</td>
          </tr>
          <tr style="border-top:2px solid #1A1714;">
            <td align="right" style="font-weight:bold;font-size:16px;
              padding-top:8px;">TOTAL DUE</td>
            <td align="right" style="font-weight:bold;font-size:16px;
              color:#FF9500;padding-top:8px;">
              $${invoice.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      ${invoice.notes ? `
      <div style="margin-top:24px;padding:12px;background:#f9f9f9;border-radius:4px;">
        <div style="font-size:11px;color:#888;">Notes</div>
        <div style="color:#555;margin-top:4px;">${invoice.notes}</div>
      </div>` : ''}
    </div>
    <div style="background:#1A1714;padding:24px;text-align:center;
      color:#9A8E82;font-size:12px;">
      <div style="color:#FF9500;margin-bottom:8px;">Thank you for choosing FixRight Automotive</div>
      All workmanship warranted for 90 days or 5,000km
    </div>
  </body>
  </html>`
}
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors (file isn't imported anywhere yet, but must still type-check standalone).

- [ ] **Step 3: Commit**

```bash
git add lib/emails/generateInvoiceEmail.ts
git commit -m "feat: add invoice email HTML template"
```

---

### Task 8: `POST /api/invoices/send` route

**Files:**
- Create: `app/api/invoices/send/route.ts`

**Interfaces:**
- Consumes: `generateInvoiceEmail` (Task 7), `resend` from `@/lib/resend`, `createClient` from `@/lib/supabase-server`.
- Produces: `POST` handler expecting `{ invoiceId: string }`, returns `{ success: true }` or `{ error: string }`.

- [ ] **Step 1: Create the route**

Create `/Users/farouq/fixright-auto/app/api/invoices/send/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'
import { generateInvoiceEmail } from '@/lib/emails/generateInvoiceEmail'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const [{ data: invoice, error: invoiceError }, { data: lineItems, error: itemsError }] = await Promise.all([
      supabase.from('invoices').select('*').eq('id', invoiceId).single(),
      supabase.from('invoice_line_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
    ])

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (!invoice.customer_email) {
      return NextResponse.json({ error: 'No customer email on file' }, { status: 400 })
    }

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: [invoice.customer_email],
      subject: `Your Invoice ${invoice.invoice_number} from FixRight Automotive — $${invoice.total.toFixed(2)} due`,
      html: generateInvoiceEmail(invoice, lineItems ?? []),
    })

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', invoiceId)

    if (updateError) {
      return NextResponse.json({ error: 'Email sent but failed to update invoice status' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Invoice send error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/invoices/send/route.ts
git commit -m "feat: add invoice send API route"
```

---

### Task 9: "Send Invoice to Customer" button on invoice detail page

**Files:**
- Modify: `app/(admin)/workshop-portal/invoices/[id]/page.tsx`

**Interfaces:**
- Consumes: `invoice` state, `setInvoice`, `Send`/`Loader2` icons (add `Send` to the existing `lucide-react` import at line 8).

- [ ] **Step 1: Add the `Send` icon import and sending state**

Change the import at `app/(admin)/workshop-portal/invoices/[id]/page.tsx:8`:

```tsx
import { ArrowLeft, Plus, Trash2, Download, Check, Loader2 } from 'lucide-react'
```

to:

```tsx
import { ArrowLeft, Plus, Trash2, Download, Check, Loader2, Send } from 'lucide-react'
```

Add state alongside `downloading` (currently line 205):

```tsx
  const [downloading, setDownloading] = useState(false)
  const [sending, setSending] = useState(false)
```

- [ ] **Step 2: Add the send handler**

Add this function near `downloadPDF` (after it, before the `if (loading)` guard around line 500):

```tsx
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
```

- [ ] **Step 3: Add the button next to Download PDF**

In the action-button block (`app/(admin)/workshop-portal/invoices/[id]/page.tsx:649-680`), insert the new button directly after the "Download PDF" button and before the "Mark as Paid" conditional block:

```tsx
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
            {status !== 'paid' && (
```

(the trailing `{status !== 'paid' && (` line already exists — this insertion sits between the PDF button and that existing conditional, no other lines change.)

- [ ] **Step 4: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 5: Manual check**

Open an invoice that has a `customer_email` set — expect the blue "Send Invoice to Customer" button to appear and, on click, show "Sending…", then a "Invoice sent to customer" toast and the status pill flipping to "Sent" without a page reload. Open an invoice with no `customer_email` — expect a disabled button reading "No Customer Email" with a native tooltip on hover.

- [ ] **Step 6: Commit**

```bash
git add "app/(admin)/workshop-portal/invoices/[id]/page.tsx"
git commit -m "feat: add send-invoice-to-customer button on invoice detail page"
```

---

### Task 10: Payment receipt email HTML builder

**Files:**
- Create: `lib/emails/generateReceiptEmail.ts`

**Interfaces:**
- Produces: `generateReceiptEmail(data): string` — consumed by Task 11.

- [ ] **Step 1: Create the template file**

Create `/Users/farouq/fixright-auto/lib/emails/generateReceiptEmail.ts`:

```ts
interface ReceiptEmailData {
  invoiceNumber: string
  vehicle: string
  amountPaid: number
  paidDate: string
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export function generateReceiptEmail(data: ReceiptEmailData): string {
  return `<!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
    <div style="background:#1A1714;padding:32px;text-align:center;">
      <div style="color:#FF9500;font-size:24px;font-weight:bold;letter-spacing:2px;">FIXRIGHT AUTOMOTIVE</div>
      <div style="color:#F0EDE8;font-size:16px;margin-top:8px;">Payment Received</div>
    </div>
    <div style="background:#ffffff;padding:32px;max-width:600px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:16px;">
        <span style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:rgba(40,200,80,0.12);color:#28C850;font-size:28px;font-weight:bold;">&#10003;</span>
      </div>
      <p style="color:#1A1714;font-size:15px;text-align:center;">Thank you! We've received your payment.</p>

      <h2 style="color:#1A1714;border-bottom:2px solid #FF9500;padding-bottom:8px;margin-top:24px;">Payment Details</h2>
      <p style="color:#1A1714;"><strong>Invoice:</strong> ${data.invoiceNumber}</p>
      <p style="color:#1A1714;"><strong>Vehicle:</strong> ${data.vehicle}</p>
      <p style="color:#1A1714;"><strong>Amount Paid:</strong> $${data.amountPaid.toFixed(2)}</p>
      <p style="color:#1A1714;"><strong>Date Paid:</strong> ${formatDate(data.paidDate)}</p>

      <p style="color:#1A1714;margin-top:24px;">Thank you for choosing FixRight Automotive.</p>
      <p style="color:#1A1714;">See you next time!</p>
    </div>
    <div style="background:#1A1714;padding:24px;text-align:center;color:#9A8E82;font-size:12px;">
      FixRight Automotive — 519.471.9462 — 2117 Aldersbrook Rd, London ON
    </div>
  </body>
  </html>`
}
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 3: Commit**

```bash
git add lib/emails/generateReceiptEmail.ts
git commit -m "feat: add payment receipt email HTML template"
```

---

### Task 11: `POST /api/invoices/receipt` route

**Files:**
- Create: `app/api/invoices/receipt/route.ts`

**Interfaces:**
- Consumes: `generateReceiptEmail` (Task 10), `resend`, `createClient` from `@/lib/supabase-server`.
- Produces: `POST` handler expecting `{ invoiceId: string }`.

- [ ] **Step 1: Create the route**

Create `/Users/farouq/fixright-auto/app/api/invoices/receipt/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { resend } from '@/lib/resend'
import { generateReceiptEmail } from '@/lib/emails/generateReceiptEmail'

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'FixRight Auto <onboarding@resend.dev>'

export async function POST(req: NextRequest) {
  try {
    const { invoiceId } = await req.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const paidDate = invoice.paid_date || new Date().toISOString().split('T')[0]
    const vehicle = [invoice.vehicle_year, invoice.vehicle_make, invoice.vehicle_model].filter(Boolean).join(' ') || '—'

    if (invoice.customer_email) {
      await resend.emails.send({
        from: FROM_ADDRESS,
        to: [invoice.customer_email],
        subject: `Payment Received — FixRight Automotive — ${invoice.invoice_number}`,
        html: generateReceiptEmail({
          invoiceNumber: invoice.invoice_number,
          vehicle,
          amountPaid: invoice.total,
          paidDate,
        }),
      })
    }

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ paid_date: paidDate, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update paid_date' }, { status: 500 })
    }

    return NextResponse.json({ success: true, skipped: invoice.customer_email ? undefined : 'no customer email on file' })
  } catch (e) {
    console.error('Invoice receipt error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/invoices/receipt/route.ts
git commit -m "feat: add payment receipt API route"
```

---

### Task 12: "Mark as Paid" receipt confirmation on invoice detail page

**Files:**
- Modify: `app/(admin)/workshop-portal/invoices/[id]/page.tsx`

**Interfaces:**
- Consumes: `setStatus`, `invoice.id`.

- [ ] **Step 1: Add confirm-panel state**

Add next to `sending` (from Task 9):

```tsx
  const [showPaidConfirm, setShowPaidConfirm] = useState(false)
```

- [ ] **Step 2: Add the receipt-send handler**

Add near `sendInvoiceEmail`:

```tsx
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
```

- [ ] **Step 3: Replace the "Mark as Paid" button with the confirm flow**

Replace the existing block (`app/(admin)/workshop-portal/invoices/[id]/page.tsx:665-679`):

```tsx
            {status !== 'paid' && (
              <button
                onClick={() => setStatus('paid')}
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
```

with:

```tsx
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
```

- [ ] **Step 4: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 5: Manual check**

On an unpaid invoice with a `customer_email`, click "Mark as Paid" — expect the button to be replaced by a "Send payment receipt to customer?" panel with Yes/No. Click "Yes" — expect status flips to Paid (still must click "SAVE INVOICE" to persist the status/paid_date on the invoice row itself, matching existing save-button behavior) and a "Receipt sent to customer" toast. Click "No" on a fresh invoice — expect status flips to Paid with no email sent.

- [ ] **Step 6: Commit**

```bash
git add "app/(admin)/workshop-portal/invoices/[id]/page.tsx"
git commit -m "feat: confirm-before-send payment receipt flow on mark-as-paid"
```

---

### Task 13: Remove duplicate date under "SHOP CAPACITY — TODAY"

**Files:**
- Modify: `app/(admin)/workshop-portal/dashboard/page.tsx:186-199`

- [ ] **Step 1: Remove the redundant date line**

The admin header (`components/admin/AdminShell.tsx:110-115,162-167`) already shows the live date + time once, globally, in every admin page's header bar. The dashboard's "SHOP CAPACITY — TODAY" card additionally prints today's full date directly underneath, which is a duplicate. Remove just that inner date `<div>`, keeping the section label:

Change (`app/(admin)/workshop-portal/dashboard/page.tsx:187-199`):

```tsx
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
            color: '#6B6560', textTransform: 'uppercase',
          }}>
            SHOP CAPACITY — TODAY
          </div>
          <div style={{ fontSize: '12px', color: '#4A4540', marginTop: 2 }}>
            {new Date(getTodayEastern() + 'T12:00:00').toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
```

to:

```tsx
      <div style={{ background: '#1E1C18', border: '1px solid #2A2420', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em',
            color: '#6B6560', textTransform: 'uppercase',
          }}>
            SHOP CAPACITY — TODAY
          </div>
        </div>
```

`getTodayEastern()` (`dashboard/page.tsx:41-50`) stays — it's still used elsewhere in this file's stats-fetching logic. Only the JSX line that prints it is removed.

- [ ] **Step 2: Build check**

Run: `npm run build` — expect zero errors (`getTodayEastern` remains referenced elsewhere in the file, so no unused-variable error).

- [ ] **Step 3: Manual check**

Open `/workshop-portal/dashboard` — expect the "SHOP CAPACITY — TODAY" card to no longer show a second date line, while the header bar's date/time (top right) is unchanged and still the only date/time visible on the page.

- [ ] **Step 4: Commit**

```bash
git add "app/(admin)/workshop-portal/dashboard/page.tsx"
git commit -m "fix: remove duplicate date display on dashboard"
```

---

### Task 14: Booking form Step 4 redesign — date section + icon time cards

**Files:**
- Modify: `app/(public)/book/page.tsx`

**Interfaces:**
- Produces: `TIME_OPTIONS[].value` becomes the full display string (e.g. `"Morning (8:00am – 11:00am)"`) instead of a slug — this is what gets written to `bookings.preferred_time`. Task 15 must mirror this format in the admin new-booking form; Task 16 depends on this for the email template cleanup.

- [ ] **Step 1: Add the `Sun`/`Clock`/`CheckCircle` icon imports**

Change `app/(public)/book/page.tsx:5`:

```tsx
import { Phone, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
```

to:

```tsx
import { Phone, CheckCircle, ArrowLeft, ArrowRight, Sun, Clock, CalendarDays } from 'lucide-react'
```

(`CheckCircle` is already imported and reused for the Flexible card, per the icon list in the spec; `CalendarDays` is added for the date-section header icon.)

- [ ] **Step 2: Change `TIME_OPTIONS` to store full display strings as the value**

Change `app/(public)/book/page.tsx:61-65`:

```tsx
const TIME_OPTIONS = [
  { value: 'morning', label: 'Morning', sub: '8:00am – 11:00am' },
  { value: 'afternoon', label: 'Afternoon', sub: '12:00pm – 4:00pm' },
  { value: 'flexible', label: 'Flexible', sub: 'Any time works' },
]
```

to:

```tsx
const TIME_OPTIONS = [
  { value: 'Morning (8:00am – 11:00am)', label: 'MORNING', sub: '8:00am – 11:00am', icon: Sun },
  { value: 'Afternoon (12:00pm – 4:00pm)', label: 'AFTERNOON', sub: '12:00pm – 4:00pm', icon: Clock },
  { value: 'Flexible', label: 'FLEXIBLE', sub: 'Any time works', icon: CheckCircle },
]
```

Every other reference to `TIME_OPTIONS` in this file (`form.preferredTime === opt.value` at line 503, `TIME_OPTIONS.find(t => t.value === form.preferredTime)?.label` at line 560) keeps working unchanged since they only ever compare local form state against this same array — no other file reads this array.

- [ ] **Step 3: Redesign the Step 4 date section and time cards**

Replace the Step 4 block (`app/(public)/book/page.tsx:489-544`):

```tsx
          {/* Step 4 — Timing */}
          {step === 3 && (
            <div>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: '#F0EDE8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Timing</h2>
              <div className="mb-4">
                <label style={labelStyle()}>Preferred Date *</label>
                <input style={inputStyle(!!errors.preferredDate)} value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} type="date" min={today}
                  onFocus={e => (e.target.style.borderColor = '#FF9500')} onBlur={e => (e.target.style.borderColor = errors.preferredDate ? '#FF4444' : '#3A3430')} />
                {errors.preferredDate && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.preferredDate}</p>}
              </div>
              <div className="mb-4">
                <label style={labelStyle()}>Preferred Time *</label>
                {errors.preferredTime && <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '8px' }}>{errors.preferredTime}</p>}
                <div className="grid gap-3 sm:grid-cols-3">
                  {TIME_OPTIONS.map(opt => {
                    const selected = form.preferredTime === opt.value
                    return (
                      <button key={opt.value} type="button" onClick={() => set('preferredTime', opt.value)}
                        style={{
                          padding: '14px 12px', textAlign: 'center',
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1E1A16',
                          border: `1px solid ${selected ? '#FF9500' : '#3A3430'}`,
                          borderRadius: '3px', cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        <div style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '13px', fontWeight: 600, color: selected ? '#FF9500' : '#F0EDE8' }}>{opt.label}</div>
                        <div style={{ fontSize: '11px', color: '#9A8E82', marginTop: '3px' }}>{opt.sub}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle()}>How did you hear about us? *</label>
                {errors.source && <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '8px' }}>{errors.source}</p>}
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map(opt => {
                    const selected = form.source === opt
                    return (
                      <button key={opt} type="button" onClick={() => set('source', opt)}
                        style={{
                          padding: '8px 16px', fontSize: '12px',
                          fontFamily: 'var(--font-heading), sans-serif',
                          fontWeight: selected ? 600 : 500,
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1E1A16',
                          border: `1px solid ${selected ? '#FF9500' : '#3A3430'}`,
                          borderRadius: '3px',
                          color: selected ? '#FF9500' : '#9A8E82',
                          cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
```

with:

```tsx
          {/* Step 4 — Timing */}
          {step === 3 && (
            <div>
              <h2 className="mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '20px', fontWeight: 700, color: '#F0EDE8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Timing</h2>
              <div className="mb-6">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontFamily: 'var(--font-heading), sans-serif', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF9500' }}>
                  <CalendarDays size={16} /> Select Your Preferred Date
                </label>
                <input
                  style={{ ...inputStyle(!!errors.preferredDate), height: '56px', fontSize: '15px' }}
                  value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} type="date" min={today}
                  onFocus={e => (e.target.style.borderColor = '#FF9500')} onBlur={e => (e.target.style.borderColor = errors.preferredDate ? '#FF4444' : '#3A3430')} />
                {errors.preferredDate && <p style={{ color: '#FF4444', fontSize: '12px', marginTop: '4px' }}>{errors.preferredDate}</p>}
                <p style={{ fontSize: '12px', color: '#9A8E82', marginTop: '6px' }}>We&apos;ll confirm the exact time when we call you.</p>
              </div>
              <div className="mb-4">
                <label style={labelStyle()}>Preferred Time *</label>
                {errors.preferredTime && <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '8px' }}>{errors.preferredTime}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {TIME_OPTIONS.map(opt => {
                    const selected = form.preferredTime === opt.value
                    const Icon = opt.icon
                    return (
                      <button key={opt.value} type="button" onClick={() => set('preferredTime', opt.value)}
                        style={{
                          padding: '16px 12px', textAlign: 'center',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                          background: selected ? 'rgba(255,149,0,0.12)' : '#1E1C18',
                          border: `${selected ? '2px' : '1px'} solid ${selected ? '#FF9500' : '#3A3430'}`,
                          borderRadius: '3px', cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                        }}>
                        <Icon size={28} color="#FF9500" />
                        <div style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: '14px', fontWeight: 600, color: selected ? '#FF9500' : '#F0EDE8' }}>{opt.label}</div>
                        <div style={{ fontSize: '12px', color: '#9A8E82' }}>{opt.sub}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle()}>How did you hear about us? *</label>
                {errors.source && <p style={{ color: '#FF4444', fontSize: '12px', marginBottom: '8px' }}>{errors.source}</p>}
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map(opt => {
                    const selected = form.source === opt
                    return (
                      <button key={opt} type="button" onClick={() => set('source', opt)}
                        style={{
                          padding: '8px 16px', fontSize: '12px',
                          fontFamily: 'var(--font-heading), sans-serif',
                          fontWeight: selected ? 600 : 500,
                          background: selected ? 'rgba(255,149,0,0.1)' : '#1E1A16',
                          border: `1px solid ${selected ? '#FF9500' : '#3A3430'}`,
                          borderRadius: '3px',
                          color: selected ? '#FF9500' : '#9A8E82',
                          cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
```

Required-field validation for time preference already exists unchanged at `app/(public)/book/page.tsx:164` (`if (!form.preferredTime) errs.preferredTime = 'Required'`) and fires from the same `next()` → `validateStep()` path — no code change needed there, it already blocks advancing past Step 4 without a time selection.

- [ ] **Step 4: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 5: Manual check**

On `/book`, reach Step 4 — expect a larger amber-focused date input with a "We'll confirm the exact time when we call you." helper line, and three icon cards (Sun/Clock/CheckCircle) for Morning/Afternoon/Flexible that highlight amber on click. Click "Next" without picking a time — expect the red "Required" error under "Preferred Time". Complete the booking and check the new row in Supabase — expect `preferred_time` to read `"Morning (8:00am – 11:00am)"` (or Afternoon/Flexible) rather than a raw slug.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/book/page.tsx"
git commit -m "feat: redesign booking form step 4 with icon time cards"
```

---

### Task 15: Align admin "New Booking" time dropdown with the new format

**Files:**
- Modify: `app/(admin)/workshop-portal/new-booking/page.tsx`

**Interfaces:**
- Consumes: the display-string format established in Task 14, so `preferred_time` is consistent across both booking-entry paths (public web form and admin phone-in form).

- [ ] **Step 1: Replace the `TIMES` slug array with the shared display-string values**

Change `app/(admin)/workshop-portal/new-booking/page.tsx:15`:

```tsx
const TIMES = ['morning', 'afternoon', 'flexible']
```

to:

```tsx
const TIMES = ['Morning (8:00am – 11:00am)', 'Afternoon (12:00pm – 4:00pm)', 'Flexible']
```

- [ ] **Step 2: Update the default form value**

Change `app/(admin)/workshop-portal/new-booking/page.tsx:64`:

```tsx
    preferred_time: 'morning',
```

to:

```tsx
    preferred_time: 'Morning (8:00am – 11:00am)',
```

- [ ] **Step 3: Simplify the `<select>` options since values are already display-ready**

Change `app/(admin)/workshop-portal/new-booking/page.tsx:273-275`:

```tsx
                    <select value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)} style={sel}>
                      {TIMES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
```

to:

```tsx
                    <select value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)} style={sel}>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
```

- [ ] **Step 4: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 5: Manual check**

On `/workshop-portal/new-booking`, check the "Preferred Time" dropdown shows "Morning (8:00am – 11:00am)" / "Afternoon (12:00pm – 4:00pm)" / "Flexible" and defaults to Morning. Submit a booking and confirm the stored `preferred_time` matches the public form's format exactly.

- [ ] **Step 6: Commit**

```bash
git add "app/(admin)/workshop-portal/new-booking/page.tsx"
git commit -m "fix: align admin new-booking time options with public form format"
```

---

### Task 16: Simplify `formatTime` in booking email templates

**Files:**
- Modify: `lib/emails/generateBookingReceived.ts`
- Modify: `lib/emails/generateBookingConfirmed.ts`

**Interfaces:**
- Consumes: the fact that `preferredTime`/`confirmedTime` now always arrive as ready-to-display strings (Task 14/15) — the `TIME_LABELS` slug lookup is now dead code (its fallback already returns the input unchanged when the key isn't found, so behavior was safe either way, but the dict itself no longer does anything).

- [ ] **Step 1: Simplify `generateBookingReceived.ts`**

Change `lib/emails/generateBookingReceived.ts:15-31`:

```ts
const TIME_LABELS: Record<string, string> = {
  morning: 'Morning (8:00am – 11:00am)',
  afternoon: 'Afternoon (12:00pm – 4:00pm)',
  flexible: 'Flexible — any time works',
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '—'
  return TIME_LABELS[timeStr] ?? timeStr
}
```

to:

```ts
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr?: string | null): string {
  return timeStr ?? '—'
}
```

- [ ] **Step 2: Simplify `generateBookingConfirmed.ts`**

Change `lib/emails/generateBookingConfirmed.ts:14-30`:

```ts
const TIME_LABELS: Record<string, string> = {
  morning: 'Morning (8:00am – 11:00am)',
  afternoon: 'Afternoon (12:00pm – 4:00pm)',
  flexible: 'Flexible',
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '—'
  return TIME_LABELS[timeStr] ?? timeStr
}
```

to:

```ts
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatTime(timeStr?: string | null): string {
  return timeStr ?? '—'
}
```

- [ ] **Step 3: Build check**

Run: `npm run build` — expect zero errors.

- [ ] **Step 4: Manual check**

Submit a test booking via `/book`, confirm the "New Booking Request" email (sent to `12mfao@gmail.com` per the current temporary TO address) shows `Time: Morning (8:00am – 11:00am)` (or whichever was picked) correctly. Confirm the booking from the admin bookings detail page and check the confirmation email (if a `customer_email` was provided) shows the same correctly formatted time.

- [ ] **Step 5: Commit**

```bash
git add lib/emails/generateBookingReceived.ts lib/emails/generateBookingConfirmed.ts
git commit -m "refactor: simplify time formatting in booking email templates"
```

---

### Task 17: Update CLAUDE.md

**Files:**
- Modify: `/Users/farouq/fixright-auto/CLAUDE.md`

- [ ] **Step 1: Add the Services page to the Admin Panel built-list**

In the "### Admin Panel (/workshop-portal)" section, after the "Invoices list" bullet and before "Invoice editor", add:

```markdown
- Services management: stats bar (active count, category count), inline-editable
  estimated hours + base rate, active/inactive toggle (hides from /book form),
  add-service slide-in panel
```

- [ ] **Step 2: Note the invoice email features**

In the same section, after the "Invoice editor" bullet, add:

```markdown
- Invoice emails: "Send Invoice to Customer" button emails the full invoice
  (sets status to sent), "Mark as Paid" offers to send a payment receipt email
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document services management page and invoice email features"
```

---

### Task 18: Final full build and push

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

Run: `cd /Users/farouq/fixright-auto && npm run build`
Expected: `✓ Compiled successfully` with zero TypeScript errors across every file touched in Tasks 1–17.

- [ ] **Step 2: Push**

```bash
git push origin main
```

(Confirm with the user before this step if not already granted blanket push approval for this session.)
