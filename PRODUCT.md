# Product

## Register

brand

Public marketing site is the primary register. The `/workshop-portal` admin panel is a secondary **product** surface (design serves Omar's and his mechanics' daily workflow) — override to `product` when working specifically inside `/workshop-portal`.

## Users

**Public site**: Prospective and returning customers in London, Ontario searching for auto service — from first-time visitors sizing up whether FixRight is trustworthy, to the shop's 6,000+ existing customers rebooking. The job to be done is fast: understand FixRight is credible and experienced, then book a service through the 5-step `/book` flow with minimal friction.

**Admin portal** (secondary): Omar and his 3 mechanics, managing bookings, schedules, invoices, and customer history during the workday. The job is operational speed and accuracy, not persuasion.

## Product Purpose

FixRight Automotive is a real, family-owned auto shop (28 years experience, 3 mechanics, 6,000+ customers) in London, Ontario. The public site exists to convert visitors into booked appointments and to project the credibility of an established, trustworthy shop. The admin portal exists to let Omar run the shop's day-to-day operations — bookings, scheduling, invoicing — without needing a third-party tool. Success on the public site is booking conversions; success in the admin portal is Omar and his mechanics moving through their daily workflow without friction.

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
