# Demo mode and client activation

This repository now defaults to a safe fictional sales demonstration.

## Default behaviour

When both `NEXT_PUBLIC_APP_MODE` and `APP_MODE` are missing or set to `demo`:

- the public website uses the fictional **Demo Motorworks** identity from `lib/site-config.ts`;
- the workshop portal renders linked fictional customers, bookings, services, mechanics, invoices, and line items without contacting Supabase;
- the original dashboard, analytics, booking, customer, schedule, services, settings, invoicing, PDF, and receipt workflows remain interactive;
- portal changes and the demo labour rate persist only in the current tab's `sessionStorage`, and **Reset Demo** restores the seed data;
- booking, contact, confirmation, invoice, and receipt endpoints return a demo acknowledgement;
- simulated records can be created or changed locally for a sales demonstration, but no production record is created or changed;
- invoice and receipt emails are explicitly simulated and no email is sent;
- payment status can be demonstrated, but no payment is processed;
- pages are marked `noindex, nofollow`.

The two-mode check is deliberate. The build derives one immutable browser-visible mode from both values. A split or invalid configuration fails the build instead of creating a hybrid deployment. A deployment must opt into live operation on both the browser and server sides.

The portal does not require authentication in demo mode. Enter fictional information only, reset the demo before and after a presentation, and never use prospect or customer personal information in demo forms or PDFs.

## Activating a real client deployment

Do not activate live mode until the deployment has its own database, authentication users, verified email sender, and client-approved business information.

Required deployment variables:

```text
NEXT_PUBLIC_APP_MODE=live
APP_MODE=live
NEXT_PUBLIC_SITE_URL=https://client-domain.example
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Client Garage <bookings@client-domain.example>
GARAGE_NOTIFICATION_EMAIL=owner@client-domain.example
```

Before activation, replace every value in `lib/site-config.ts`, provide verified claims and contact details, seed the client’s services and mechanics, connect the default labour rate to authenticated client configuration, and complete a controlled end-to-end test. The tab-scoped demo labour setting is deliberately not reused in live mode.

## Archived identity

Earlier commits and historical planning documents contain the identity of the garage for which the application was originally prototyped. That identity is archival only. Do not restore it to application code, deployments, screenshots, demonstrations, sales collateral, or test data without fresh authorization from the current owner of that identity.
