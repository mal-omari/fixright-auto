# Customer Profiles — Design

## Purpose
Give Omar a persistent record of each customer across visits: contact info, vehicle
history, spend, and internal notes — instead of re-entering customer details on every
booking and having no way to see repeat-customer history.

## Data Model

### `customers` table (new)
| column | type | notes |
|---|---|---|
| id | uuid, PK | `gen_random_uuid()` |
| name | text, not null | |
| phone | text, not null, unique | match key for find-or-create |
| email | text | nullable |
| address | text | nullable |
| notes | text | internal notes, Omar-only |
| is_vip | boolean | default false |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

RLS enabled, permissive "allow all" policies — consistent with every other table in
this project today (tracked separately as a hardening TODO, not scope here).

### `bookings` table (altered)
Add `customer_id uuid references customers(id)`, nullable (existing bookings have no
customer until backfilled or matched retroactively — out of scope to backfill).

### Types
Regenerate `types/database.types.ts` via Supabase MCP after migration.

## Customer Matching (find-or-create)

Single source of truth: `lib/customers.ts` exporting
`findOrCreateCustomer(supabase, { name, phone, email })`.

- Look up `customers` where `phone = trimmed input` (exact match, no reformatting).
- Found → return existing customer id.
- Not found → insert new customer with name/phone/email from the booking, return new id.

Used from two call sites, both attaching the resolved id to the booking as
`customer_id`:
1. `app/api/bookings/route.ts` (public `/book` form submissions) — after the booking
   insert succeeds.
2. Admin `new-booking` page — before/at booking insert, once a lookup has resolved a
   customer (existing or new).

Rationale for centralizing: both call sites need identical match/create semantics;
duplicating it risks the two flows drifting (e.g. one normalizing phone format and the
other not).

## New Booking Page — Customer Lookup

New "Customer Lookup" card at the top of the form (above the existing Customer Info
card), matching existing card/input styling in this file:
- Phone input + "Search" button.
- On search, query `customers` where `phone = input`.
  - Match: show green "Returning customer — N previous visits" badge (N = count of
    bookings with that `customer_id`); pre-fill `customer_name`/`customer_email` into
    the form below (still editable — customer info may have changed); store the
    matched `customer_id` in component state.
  - No match: show "New customer" badge; no pre-fill.
- On submit: booking insert includes `customer_id` if matched. If not matched (new
  customer), call `findOrCreateCustomer` after the booking insert (mirrors the public
  API route's post-insert flow) and attach the resulting id.

## Customers List Page (`/workshop-portal/customers`)

Sidebar: `Users` icon, positioned Bookings → **Customers** → New Booking → Services →
Invoices (confirmed placement).

- Search bar: filters by name or phone (client-side filter over fetched rows, matching
  existing list-page patterns in this codebase).
- Stats bar (3 cards): Total Customers / New This Month (created_at in current
  calendar month, Eastern time via `getTodayEastern()`) / Returning Customers (booking
  count > 1).
- Table columns: Name | Phone | Email | Total Visits | Last Visit | Total Spent | VIP |
  Actions.
  - Total Visits: count of bookings with matching `customer_id`.
  - Last Visit: most recent `preferred_date` among their bookings.
  - Total Spent: sum of `invoices.total` where `status = 'paid'` and `booking_id` is
    one of the customer's bookings.
  - VIP: amber star, click toggles `customers.is_vip` in place.
  - Actions: "View" → detail page.
- Default sort: Last Visit descending.
- Empty state: "No customers yet".

## Customer Detail Page (`/workshop-portal/customers/[id]`)

Header card:
- Name (Barlow 700, large), phone, email.
- VIP badge (amber star + "VIP Customer") if `is_vip`.
- "New Booking" button → `/workshop-portal/new-booking` pre-filled with this customer
  (via query params or state, matching existing navigation patterns).
- Edit button → inline-editable name/email/address only (see note below).

Stats row (4 cards): Total Visits, Total Spent (paid invoices only), Last Visit,
Member Since (`created_at`).

Service History table: all bookings for this customer, columns Date | Service |
Vehicle | Status | Invoice | Amount, sorted by date descending, status badge styled
like the existing bookings status pills, "View Invoice" link when an invoice exists,
Amount = invoice total if paid else "—".

Vehicle History: unique vehicles (grouped by year+make+model) with visit count and
last service date per vehicle, derived from the customer's bookings.

Internal Notes section: its own textarea + "Save Notes" button, writing to
`customers.notes`.

**Design decision**: the header Edit button covers name/email/address only; notes has
its own dedicated section/save action. The original request listed notes under both
the header edit and a separate notes section — splitting them avoids two different
controls writing to the same field with two different save flows.

## Out of Scope
- Backfilling `customer_id` on existing historical bookings.
- Fuzzy/normalized phone matching (formatting variants).
- Merging duplicate customer records.
