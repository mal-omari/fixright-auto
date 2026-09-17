# Product

> **Current product direction (2026-09-16):** This is a reusable garage website and workshop-management demonstration, not the website of the garage named in the historical material below. The active demo identity is fictional, all sample people and records are fictional, and demo mode must never contact a production database or send email. See `DEMO-MODE.md` and `lib/site-config.ts`.

## Register

brand

Public marketing site is the primary register. The `/workshop-portal` admin panel is a secondary **product** surface demonstrating a garage team's daily workflow — override to `product` when working specifically inside `/workshop-portal`.

## Users

**Public site**: Garage owners evaluating the platform and prospective customers testing the fictional storefront. The job to be done is fast: understand the garage's value proposition, then complete the 5-step `/book` flow with minimal friction.

**Admin portal** (secondary): Garage owners, service advisors, and mechanics evaluating bookings, schedules, invoices, and customer-history workflows. The job is operational speed and accuracy, not persuasion.

## Product Purpose

The product is a configurable garage storefront and workshop-management platform. The public site demonstrates customer acquisition and booking; the read-only admin portal demonstrates bookings, scheduling, invoicing, services, and customer history. In demo mode, success means communicating the workflow without accessing or changing real data. In isolated client deployments, success means converting visitors and helping the garage team complete daily work accurately.

## Brand Personality

Rugged, trustworthy, precise. Garage-floor credibility (grease, tools, hands-on experience) combined with diagnostic precision (the "futuristic automotive" HUD/scan-line motifs already in the design system). Family-owned warmth underlies both, but the front-of-house feel is competence first, warmth second — customers should feel like they're handing their car to people who know exactly what they're doing.

## Anti-references

Avoid reading as a generic template: no stock Wix/Squarespace "local auto shop" look (generic card grids, default blue-on-white palettes, stock icon sets with no personality). The admin side should avoid reading as a generic off-the-shelf SaaS dashboard template — it should feel like a tool purpose-built for this shop's actual workflow (phone-in bookings, mechanic assignment, HST invoicing), not a repurposed CRM.

## Design Principles

1. **Precision over decoration.** The HUD/scan-line/diagnostic motifs (amber glow, cyan accents, animated gauges) exist to signal technical competence, not to be decorative flourish — use them where they reinforce "this shop knows what it's doing," not on every element.
2. **Earn trust fast.** A visitor deciding whether to book has seconds, not minutes — lead with credibility signals (experience, customer count, real photos) and a low-friction path to `/book`.
3. **The shop is real, not a stock photo.** Family-owned, specific address, specific phone number, specific owner — keep the site grounded in that specificity rather than generic "quality service" marketing language.
4. **Admin design serves the workflow, not the demo.** In `/workshop-portal`, prioritize speed and clarity for repeated daily tasks (assigning a mechanic, confirming a date, building an invoice) over visual flourish.
5. **Never blur the public/admin boundary.** The admin portal is intentionally unlinked from the public site (see CLAUDE.md rule #1) — design decisions on one side should not leak expectations onto the other.

## Accessibility & Inclusion

WCAG AA baseline: sufficient color contrast (particularly amber/gold/cyan accents on the dark charcoal palette), full keyboard navigation for the `/book` flow and admin tables, and `prefers-reduced-motion` alternatives for GSAP/Framer Motion animations (hero HUD effects, engine rumble hover, count-up stats, sidebar transitions).
