# Garage Platform Demo

A configurable Next.js garage website, booking flow, and workshop-management portal.

The repository defaults to a fictional, browser-local demonstration. The workshop workflows are interactive, but demo changes stay in the current browser tab and never read or write production records, send email, or process payments. Read [DEMO-MODE.md](./DEMO-MODE.md) before configuring a client deployment.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the customer website and `http://localhost:3000/workshop-portal/dashboard` for the fictional admin portal.

## Checks

```bash
npm run lint
npm run test:demo
npm run build
```

Garage identity and public-facing contact details live in `lib/site-config.ts`. Real operations require both `NEXT_PUBLIC_APP_MODE=live` and `APP_MODE=live`, plus isolated client database and email configuration. Split or invalid mode values fail the build.
