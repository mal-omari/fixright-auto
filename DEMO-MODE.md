# Demo mode and client activation

This repository now defaults to a safe fictional sales demonstration.

## Default behaviour

When either `NEXT_PUBLIC_APP_MODE` or `APP_MODE` is missing or differs from `live`:

- the public website uses the fictional **Demo Motorworks** identity from `lib/site-config.ts`;
- the workshop portal renders seeded fictional data without contacting Supabase;
- booking, contact, confirmation, invoice, and receipt endpoints return a demo acknowledgement;
- no records are created or changed;
- no email is sent;
- pages are marked `noindex, nofollow`.

The two-mode check is deliberate. A deployment must opt into live operation on both the browser and server sides.

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

Before activation, replace every value in `lib/site-config.ts`, provide verified claims and contact details, seed the client’s services and mechanics, and complete a controlled end-to-end test.

## Archived identity

Earlier commits and historical planning documents contain the identity of the garage for which the application was originally prototyped. That identity is archival only. Do not restore it to application code, deployments, screenshots, demonstrations, sales collateral, or test data without fresh authorization from the current owner of that identity.
