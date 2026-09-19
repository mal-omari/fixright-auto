# Garage Platform Demo — Project Context

## Current purpose

This repository is a configurable garage website, booking flow, and workshop-management portal. It is currently a fictional sales demonstration called **Demo Motorworks**.

The identity used by the garage for which the prototype was first created is archival only. Do not restore any former business name, owner identity, phone number, address, email address, domain, customer claim, record, or testimonial to the application or sales demo.

Read these files before changing behaviour or UI:

- `/Users/farouq/Projects/portfolio/company/sales/fixright/HANDOFF-2026-09-16.md` — canonical cross-session product and sales state; update it before ending meaningful work.
- `DEMO-MODE.md` — safety boundary and live activation requirements.
- `PRODUCT.md` — users, product purpose, and interaction principles.
- `DESIGN.md` — visual language and accessibility requirements.
- `lib/site-config.ts` — single source of public-facing demo identity.

## Technology

- Next.js 16 App Router and TypeScript
- Tailwind CSS v4
- Supabase for isolated live client deployments
- Resend for isolated live client email delivery
- GSAP and Framer Motion for public-site motion
- jsPDF for client invoice exports
- Vercel deployment

## Non-negotiable demo rules

1. Demo mode is the default. Missing mode variables must fail closed.
2. Real operations require both `NEXT_PUBLIC_APP_MODE=live` and `APP_MODE=live`; split or invalid mode values must fail the build.
3. Demo mode must not query Supabase, require a production auth session, store records, mutate records, send email, or process payments.
4. All displayed people, bookings, customers, invoices, contact details, reviews, statistics, and addresses must be fictional and labelled as such.
5. The public demo may not link to a live client's private admin portal. The fictional read-only portal may be shared directly for sales demonstrations.
6. Each paying garage receives isolated Vercel, Supabase, authentication, email, and environment configuration.
7. Do not enable live mode until client information is verified and an end-to-end test has passed.
8. Public booking success must never depend on notification-email success in a live deployment.
9. Preserve existing accessibility: keyboard operation, visible focus, useful labels, sufficient contrast, and reduced-motion behaviour.
10. Run `npm run build` before commit or deployment.

## Current surfaces

### Public site

- `/` — fictional garage home page
- `/services` — fictional service catalogue
- `/about` — fictional owner and team story
- `/contact` — fictional contact details and safe demo form
- `/book` — five-step safe demo booking flow

### Workshop portal

- `/workshop-portal/dashboard`
- `/workshop-portal/analytics`
- `/workshop-portal/bookings`
- `/workshop-portal/customers`
- `/workshop-portal/new-booking`
- `/workshop-portal/services`
- `/workshop-portal/invoices`
- `/workshop-portal/schedule`
- `/workshop-portal/settings`

In demo mode, the original portal routes use the browser-local adapter in `lib/demo-supabase.ts` and render linked fictional data without contacting Supabase.

## Client configuration

Public-facing identity belongs in `lib/site-config.ts`, not scattered string literals. Deployment variables are documented in `.env.example` and `DEMO-MODE.md`.

The current database types and live admin pages remain available for future isolated client deployments. Treat them as dormant in demo mode; never connect this sales demo to a former client's production database.
