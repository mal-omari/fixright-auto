# FixRight Auto — Project Context

## What This Is
A futuristic automotive service website for FixRight Automotive, London Ontario.
Owner: Omar. Shop has 3 mechanics, 28 years experience, 6,000+ customers.
Public site at fixrightauto.ca (currently fixright-auto.vercel.app).
Admin portal at /workshop-portal (hidden from public, not linked anywhere).

## Tech Stack
- Next.js 15, App Router, TypeScript
- Tailwind CSS v4
- Supabase (project: bkbvmjubjjmuoveqeecj)
- GSAP + ScrollTrigger for animations
- Framer Motion for page transitions
- jsPDF for invoice PDF generation
- Resend for email (not yet wired)
- Vercel for deployment
- GitHub: mal-omari/fixright-auto

## Design System
- Background: #1E1A16 (warm dark charcoal)
- Surface cards: #2A2420
- Alternate sections: #242424
- Primary accent: #FF9500 (amber — garage warmth)
- Secondary accent: #E8C547 (gold)
- Cyan: #00D4FF (used sparingly, tech/diagnostic only)
- Text primary: #F0EDE8 (warm white)
- Text secondary: #9A8E82 (warm grey)
- Border: #3A3430
- Admin background: #1A1714
- Admin surface: #1E1C18
- Admin sidebar: #0D0B08 to #141210 gradient

## Database Schema (Supabase)
Tables: bookings, services, mechanics, invoices, invoice_line_items
Views: workload (booked hours per day)
- bookings: customer info, vehicle, service_id, status, mechanic_id, estimated_hours, actual_hours, notes, source
- services: name, description, estimated_hours, category, is_active
- mechanics: name, email, phone, is_active
- invoices: invoice_number (FR-YYYY-NNNN), booking_id, status, labour_subtotal, parts_subtotal, hst_rate (0.13), total
- invoice_line_items: invoice_id, type (labour/parts), description, quantity, unit_price, total

## What's Been Built
Public site:
- Homepage with hero (Unsplash garage photo + HUD overlay + GSAP animations)
- Sticky navbar (hidden from admin)
- Trust bar with animated counters
- Services grid with tilt cards
- Why FixRight section
- About section with SVG garage scene
- Booking CTA strip
- Footer with hours
- /services page
- /about page  
- /contact page with Google Maps
- /book — multi-step booking form (5 steps, saves to Supabase)

Admin panel (/workshop-portal):
- Login page with real Supabase Auth (email/password), middleware-protected routes
- Dashboard with live stats, per-mechanic workload bars
- Bookings list with status pill filters, search, pagination
- Booking detail with status management, auto-fill hours, Create Invoice
- New booking form (phone-ins)
- Schedule — weekly calendar Mon-Sat
- Settings — labour rate, mechanic toggles
- Invoices list with outstanding/paid/overdue summary
- Invoice editor with inline labour + parts lines, live HST calc, PDF download

## Rules — Always Follow These
1. NEVER add admin links to the public navbar or footer
2. NEVER hardcode colors — always use CSS variables from globals.css
3. Always run npm run build before committing — zero tolerance for TypeScript errors
4. Admin routes all live under /workshop-portal
5. Public navbar lives in app/(public)/layout.tsx — never in root layout
6. Supabase browser client for client components, server client for server components
7. Commit message format: "feat:", "fix:", "refactor:" prefix always
8. Omar's phone: 519.471.9462 — use this everywhere, never placeholder
9. Address: 2117 Aldersbrook Rd, London ON N6G 3X1

## Still To Build
- Phase 5: Resend email notifications (booking confirmation to Omar + customer)
- Phase 6: Domain cutover to fixrightauto.ca
- Polish pass: hero 3D scene, reactive elements, warm color refinements
- Ruflo integration (after build complete)
- CLAUDE.md self-update after each major phase