# Garage Platform Demo

A configurable Next.js garage website, booking flow, and workshop-management portal.

The repository defaults to a fictional, read-only demonstration. In demo mode it does not read or write production records, send email, or process payments. Read [DEMO-MODE.md](./DEMO-MODE.md) before configuring a client deployment.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the customer website and `http://localhost:3000/workshop-portal/dashboard` for the fictional admin portal.

## Checks

```bash
npm run lint
npm run build
```

Garage identity and public-facing contact details live in `lib/site-config.ts`. Real operations require both `NEXT_PUBLIC_APP_MODE=live` and `APP_MODE=live`, plus isolated client database and email configuration.
