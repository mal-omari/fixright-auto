# FixRight Auto — Project Context

## What This Is
A futuristic automotive service website for FixRight Automotive, London Ontario.
Owner: Omar (ofomari59@gmail.com). Shop has 3 mechanics, 28 years experience, 
6,000+ customers. Family owned and operated.
Public site currently at fixright-auto.vercel.app (moving to fixrightauto.ca).
Admin portal at /workshop-portal (hidden from public, not linked anywhere on site).

## Tech Stack
- Next.js 15, App Router, TypeScript
- Tailwind CSS v4
- Supabase (project ID: bkbvmjubjjmuoveqeecj, region: us-east-2)
- GSAP + ScrollTrigger for animations
- Framer Motion for page transitions
- Barlow Condensed + Inter fonts (Google Fonts via next/font)
- jsPDF for invoice PDF generation
- Resend for email notifications
- react-hot-toast for admin toast notifications
- Vercel for deployment
- GitHub: mal-omari/fixright-auto

## Design System
### Public Site
- Background: #1E1A16 (warm dark charcoal)
- Surface cards: #2A2420
- Alternate sections: #242424
- Primary accent: #FF9500 (amber — garage warmth)
- Secondary accent: #E8C547 (gold)
- Cyan: #00D4FF (used sparingly, tech/diagnostic only)
- Text primary: #F0EDE8 (warm white)
- Text secondary: #9A8E82 (warm grey)
- Border: #3A3430
- Heading font: Barlow Condensed (700/600/500/400)
- Body font: Inter
- Hero background: Unsplash photo-1625047509168-a7026f36de04 (CSS background-image)

### Admin Panel
- Background: #1A1714
- Surface: #1E1C18
- Sidebar: linear-gradient #0D0B08 to #141210
- Same accent colors as public site

## Database Schema (Supabase)
### Tables
- bookings: id, customer_name, customer_phone, customer_email, vehicle_year, 
  vehicle_make, vehicle_model, vehicle_mileage, vehicle_vin, service_id, 
  service_description (holds service name), estimated_hours, actual_hours,
  status (pending/confirmed/in_progress/completed/cancelled), mechanic_id,
  notes, source (web/phone/walkin), preferred_date, preferred_time,
  confirmed_date, confirmed_time, created_at, updated_at
- services: id, name, description, estimated_hours, category, is_active
- mechanics: id, name, email, phone, is_active
- invoices: id, invoice_number (FR-YYYY-NNNN), booking_id, customer_name,
  customer_phone, customer_email, vehicle_year, vehicle_make, vehicle_model,
  status (draft/sent/paid/overdue), labour_subtotal, parts_subtotal,
  subtotal, hst_rate (0.13), hst_amount, total, notes, due_date, paid_date
- invoice_line_items: id, invoice_id, type (labour/parts), description,
  quantity, unit_price, total, sort_order

### Views
- workload: booked hours per day for confirmed + in_progress bookings

### Important Notes
- service_description field holds the service NAME not a description
- Customer issue description goes in notes field
- /book form never sets service_id — only service_description
- confirmed_date/confirmed_time are set by Omar when he calls customer
- Sequential invoice numbers via next_invoice_number() Supabase function

## What's Been Built

### Public Site
- Homepage: hero (garage photo + HUD overlay + GSAP animations + mouse spotlight)
- Sticky navbar with magnetic Book Now button
- Trust bar with odometer-style animated counters
- Services grid with 3D tilt cards and engine rumble hover
- Why FixRight section (3 feature cards)
- About section with SVG garage scene
- Booking CTA strip
- Footer with hours
- /services — full services page
- /about — Omar's story + team placeholders
- /contact — address, phone, hours, Google Maps embed
- /book — 5-step booking form with cascading vehicle dropdowns
  (year/make/model for all Canadian vehicles)

### Admin Panel (/workshop-portal)
- Login: real Supabase Auth (Omar: ofomari59@gmail.com)
- Collapsible sidebar (260px expanded / 68px collapsed, localStorage persisted)
- Dashboard: live stats cards with count-up animation, per-mechanic FuelGauge 
  workload bars, recent bookings table, clickable stat cards filter bookings
- Bookings list: status pill filters, search, date range, sortable, pagination
- Booking detail: status management, mechanic assignment, auto-fill hours,
  confirmed date/time fields, Create Invoice button (shows when completed)
- New booking form: phone-ins, pre-confirmed, mechanic assignment
- Schedule: weekly Mon-Sat view, timezone-aware (America/Toronto),
  solid cards (confirmed) vs dashed cards (preferred only)
- Invoices list: outstanding/paid/overdue summary bar, status pills
- Invoice editor: inline editable labour + parts tables (React.memo fix done),
  live HST 13% calculation, PDF download via jsPDF
- Settings: labour rate (localStorage), mechanic management + add new mechanic,
  notification toggles

### Email Notifications (Phase 5)
- New booking → email sent to 12mfao@gmail.com (TEMPORARY until domain verified)
- Booking confirmed → confirmation email to customer (if email provided)
- Using Resend sandbox (onboarding@resend.dev from address)
- TEMPORARY: emails go to 12mfao@gmail.com until fixrightauto.ca verified
- TODO: verify fixrightauto.ca in Resend, update to address to ofomari59@gmail.com,
  update from address to bookings@fixrightauto.ca

## Phase Status
- ✅ Phase 1: Public website
- ✅ Phase 2: Admin panel  
- ✅ Phase 3: Invoicing system
- ✅ Phase 4: Supabase Auth
- ✅ Phase 5: Email notifications (partial — sandbox until domain verified)
- ⬜ Phase 6: Domain cutover to fixrightauto.ca (BLOCKED — need Netfirms access)
  Call Netfirms: 1-888-638-3476 to recover account
  Domain expires: September 2026 — URGENT

## Still To Build
- Phase 6: Domain cutover (Netfirms access required first)
- Revenue/workload reporting charts in admin dashboard
- Polish pass: public site hero enhancements, reactive elements
- AI scheduler (after 2-3 weeks of real booking data)
- Customer profiles and vehicle service history
- Ruflo integration for better Claude Code sessions

## Rules — Always Follow These
1. NEVER add admin links to the public navbar or footer
2. NEVER hardcode colors — always use CSS variables from globals.css
3. Always run npm run build before committing — zero TypeScript errors
4. Admin routes all live under /workshop-portal
5. Public navbar lives in app/(public)/layout.tsx — NEVER in root layout
6. Supabase browser client for client components, server client for server components
7. Use getTodayEastern() for all date calculations (timezone: America/Toronto)
8. Commit message format: "feat:", "fix:", "refactor:", "docs:" prefix always
9. Omar's phone: 519.471.9462 — never use placeholder
10. Address: 2117 Aldersbrook Rd, London ON N6G 3X1
11. Hero background is CSS background-image NOT next/image
12. Invoice line items use React.memo to prevent input re-render bug
13. Email TO address is 12mfao@gmail.com temporarily (update after domain verified)
14. Never block booking submission due to email failure — catch Resend errors silently

## Environment Variables Required
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- RESEND_API_KEY
- RESEND_FROM_EMAIL (empty until domain verified)
