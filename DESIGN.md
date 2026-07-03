---
name: FixRight Automotive
description: A night-shift garage lit in amber, running diagnostic-precision UI for booking and shop management.
colors:
  bg-primary: "#1E1A16"
  bg-surface: "#2A2420"
  bg-alternate: "#242424"
  admin-bg-surface: "#1E1C18"
  admin-bg-card-border: "#2A2420"
  admin-sidebar-top: "#0D0B08"
  admin-sidebar-bottom: "#141210"
  accent-amber: "#FF9500"
  accent-amber-hover: "#E08400"
  accent-gold: "#E8C547"
  accent-cyan: "#00D4FF"
  text-primary: "#F0EDE8"
  text-secondary: "#9A8E82"
  text-muted: "#7A7068"
  border: "#3A3430"
  danger: "#EF4444"
  glow-amber: "rgba(255, 149, 0, 0.15)"
typography:
  display:
    fontFamily: "Barlow Condensed, -apple-system, system-ui, sans-serif"
    fontSize: "clamp(64px, 10vw, 96px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Barlow Condensed, -apple-system, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.05em"
  title:
    fontFamily: "Barlow Condensed, -apple-system, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
  body:
    fontFamily: "Inter, -apple-system, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow Condensed, -apple-system, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  public-sharp: "3px"
  admin-card: "12px"
  pill: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-amber}"
    textColor: "#111111"
    rounded: "{rounded.public-sharp}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "{colors.accent-amber-hover}"
    textColor: "#111111"
    rounded: "{rounded.public-sharp}"
  service-card:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.public-sharp}"
    padding: "24px"
  admin-stat-card:
    backgroundColor: "{colors.admin-bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.admin-card}"
    padding: "24px"
---

# Design System: FixRight Automotive

## 1. Overview

**Creative North Star: "The Night Shift Garage"**

FixRight's public site is a garage bay that's still lit and working after the sun's gone down — warm charcoal darkness (#1E1A16) pierced by amber shop-light (#FF9500), with the occasional cyan flicker of a diagnostic scanner. It reads as rugged and precise at once: a shop that's been doing this for 28 years and still runs its diagnostics exactly right. The admin panel is the same garage from the inside — same palette, same materials — but built as a working tool rather than a storefront: rounder corners, denser information, no glow-and-tilt flourish, because Omar and his mechanics need speed, not seduction.

The system explicitly rejects the generic "local auto shop" template look: no stock blue-on-white palettes, no default Bootstrap card grids, no icon-pack-and-stock-photo assembly. Every surface should feel like it was built for this specific shop's specific workflow (phone-in bookings, mechanic assignment, HST invoicing) — not a repurposed CRM or website builder theme.

**Key Characteristics:**
- Dark, warm charcoal base with amber as the dominant signal color — never a light theme
- Flat surfaces at rest; depth communicated through border + glow on interaction, not drop shadows
- Sharp 3px corners on the public site (tool/garage precision); rounder 12px corners in the admin panel (workspace ergonomics)
- Barlow Condensed for anything shouting a label or headline (uppercase, tracked); Inter for anything meant to be read at length
- Cyan is a diagnostic accent only — rare, reserved for scan-line/HUD/tech-signal moments, never a general-purpose color

## 2. Colors

A single warm-charcoal-and-amber system carries both registers; cyan and gold are reserved accents, not alternates to amber.

### Primary
- **Shop-Light Amber** (`#FF9500`): The one color that means "act here." Primary CTAs, active nav state, focus glow, hover borders, brand wordmark. Darkens to `#E08400` on hover/press.

### Secondary
- **Diagnostic Cyan** (`#00D4FF`): Reserved for tech/diagnostic signals only — HUD scan lines, electrical/diagnostics service icon, admin analytics accents. Never used as a general accent or CTA color.

### Tertiary
- **Dash Gold** (`#E8C547`): A warmer secondary accent for premium/VIP signals (VIP star toggle) and select icon accents. Used more sparingly than amber.

### Neutral
- **Garage Charcoal** (`#1E1A16`): Primary background across the public site — the "shop floor" tone everything sits on.
- **Bay Surface** (`#2A2420`): Public-site card and panel background, one step lighter than the charcoal floor.
- **Section Alternate** (`#242424`): Alternating section background for scroll rhythm on long pages.
- **Admin Surface** (`#1E1C18`): Card background inside `/workshop-portal` — slightly cooler/darker than the public bay surface to read as "workspace," not "storefront."
- **Sidebar Steel** (`#0D0B08` → `#141210`): Vertical gradient for the admin sidebar, the darkest surface in the system.
- **Warm White** (`#F0EDE8`): Primary text — never pure white, keeps the warm cast.
- **Warm Grey** (`#9A8E82`): Secondary text, inactive nav labels, captions.
- **Dim Grey** (`#7A7068`): Tertiary/muted text, e.g. hero subcopy under the subtitle.
- **Bay Border** (`#3A3430`): The one border color for the entire system — dividers, card outlines, input borders at rest.
- **Alert Red** (`#EF4444`): Form validation errors and destructive states only.

### Named Rules
**The One Glow Rule.** Amber glow (`box-shadow` with `rgba(255,149,0,0.12–0.15)`) is the system's only elevation signal on hover. Don't invent a second hover-glow color; if something needs to feel "selected" or "active," it uses amber, not a new hue.

**The Cyan Is Rare Rule.** Diagnostic cyan appears in fewer than 10% of any given screen. If cyan starts showing up on buttons or general UI chrome, it's been misused — pull it back to HUD/scan/diagnostic-icon contexts only.

## 3. Typography

**Display Font:** Barlow Condensed (with `-apple-system, system-ui, sans-serif` fallback)
**Body Font:** Inter (with the same system-ui fallback)

**Character:** Barlow Condensed's tall, condensed letterforms read as stenciled/industrial when set uppercase and tracked wide — it's doing the "garage signage" job. Inter carries all reading-length copy so the site never feels shouty at paragraph length. The pairing is a deliberate contrast: condensed/geometric display against a humanist, highly-legible body face.

### Hierarchy
- **Display** (700, `clamp(64px, 10vw, 96px)`, line-height 1): Hero headline only. Sits at the format's 96px ceiling — never larger.
- **Headline** (600, 32px, line-height 1.1): Mobile menu links, major section headers.
- **Title** (600, 14px, line-height 1.3, uppercase, 0.05em tracking): Card headings (service names, stat labels) — always uppercase, always Barlow Condensed.
- **Body** (400, 16px, line-height 1.5): Paragraph copy, form helper text. Cap prose measure at 65–75ch.
- **Label** (500, 12px, 0.12em tracking, uppercase): Buttons, nav pills, badges — the smallest text in the system, always tracked wide to stay legible at that size.

### Named Rules
**The All-Caps-Means-Barlow Rule.** Any uppercase, letter-spaced text in the system is set in Barlow Condensed, never Inter uppercased — Inter's uppercase rendering reads flat and loses the industrial-stencil character that makes labels feel intentional.

## 4. Elevation

Flat by default, everywhere. Neither register uses drop shadows as a base-state depth cue — the system has no `box-shadow` on resting cards. Depth is communicated two ways instead: (1) tonal layering (bg-primary → bg-surface → admin-surface, each a shade lighter than its parent), and (2) an amber glow that appears only in response to interaction (hover, focus, active). A static screenshot of the system should look flat; only a live cursor reveals the glow.

### Shadow Vocabulary
- **Hover Glow** (`box-shadow: 0 0 32px rgba(255,149,0,0.12)`): Service cards and interactive cards on hover, paired with a border color shift to `rgba(255,149,0,0.5)`.
- **Focus Glow** (`box-shadow: 0 0 0 3px rgba(255,149,0,0.15)`-equivalent border/glow treatment): Form inputs on focus.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows and glow exist only as a response to state — hover, focus, or active. Never decorate a static card with a shadow "for depth."

## 5. Components

Public-site components read as tactile, mechanical, precise (sharp corners, tilt/rumble micro-interactions). Admin components read as calm and dense — a real workspace, not a demo.

### Buttons
- **Shape:** Sharp corners on the public site (3px radius); admin buttons inherit the same 3px unless embedded in a 12px-radius card context.
- **Primary:** Amber background (`#FF9500`), near-black text (`#111111` — deliberately not pure black, keeps warmth), uppercase Barlow Condensed label, 0.1–0.12em tracking, `12px 28px` padding (public) / `9px 20px` in the compact navbar variant.
- **Hover / Focus:** Background darkens to `#E08400`; navbar's "Book Now" additionally has a magnetic cursor-attraction effect within 100px. Transition `background 0.2s, transform 0.2s`.
- **Ghost:** Text-only links (phone number, underlined text links) in amber or warm-grey, no background, underline decoration at 0.4 opacity.

### Cards / Containers
- **Public site (Service Card, booking-flow panels):** `border-radius: 3px`, `background: #2A2420`, `1px solid #3A3430` border, no shadow at rest. On hover: border shifts to amber at 50% opacity, amber glow appears, plus a subtle 3D tilt following cursor position (`perspective(1000px) rotateX/rotateY`) and a brief "engine rumble" micro-shake animation.
- **Admin (Stat Card, dashboard panels):** `border-radius: 12px`, `background: #1E1C18`, `1px solid #2A2420` border. On hover: border shifts to amber at 50% opacity; clickable cards additionally scale to 1.02. No tilt effect — admin motion is restrained, not showy.

### Inputs / Fields
- **Style:** `background: #1E1A16`, `1px solid #3A3430` border, `border-radius: 3px`, `12px 14px` padding.
- **Focus / Error:** Border shifts to `#FF4444` on validation error; standard focus treatment shifts border toward amber.

### Navigation
- **Public navbar:** Fixed, `rgba(30,26,22,0.95)` background with `blur(12px) saturate(180%)` backdrop-filter, hides on scroll-down and reappears on scroll-up. Desktop links in Barlow Condensed, 13px, uppercase, 0.08em tracking; active link gets a 2px amber underline. Mobile menu is a full-screen `rgba(14,12,10,0.98)` overlay with staggered link entrance (0.05s delay per item).
- **Admin sidebar:** Fixed-width (260px expanded / 68px collapsed, persisted to localStorage), vertical gradient background (`#0D0B08` → `#141210`), darkest surface in the system. Active route gets the same amber treatment as public nav.

### Fuel Gauge (signature component)
A horizontal bar gauge used on the admin dashboard to show per-mechanic workload as a percentage fill in amber, pulsing (`gaugePulse` animation, 2s ease-in-out) when a mechanic is over capacity — the one place the system uses motion to communicate an operational warning rather than decoration.

## 6. Do's and Don'ts

### Do:
- **Do** keep the base palette dark and warm (`#1E1A16` family) — this is a night-shift-garage system, never a light theme.
- **Do** use the sharp 3px radius on the public site and the rounder 12px radius in `/workshop-portal` as two deliberate, register-specific shape languages — don't unify them.
- **Do** reserve diagnostic cyan (`#00D4FF`) for HUD/scan-line/diagnostic-icon moments only.
- **Do** set uppercase/tracked text in Barlow Condensed, never Inter.
- **Do** communicate depth via tonal layering + interactive amber glow, never a resting-state drop shadow.
- **Do** keep Omar's real phone number (519.471.9462) and shop address specific and visible — the brand's credibility comes from specificity, not generic "quality service" marketing copy.

### Don't:
- **Don't** ship a generic "local auto shop" template look — no stock blue-on-white palettes, no default icon-pack-plus-stock-photo card grids.
- **Don't** let the admin panel read as an off-the-shelf SaaS dashboard template — it should feel purpose-built for phone-in bookings, mechanic assignment, and HST invoicing.
- **Don't** use `border-left`/`border-right` colored stripes as an accent anywhere; this system uses full borders, background tints, or glow instead.
- **Don't** use gradient text (`background-clip: text`) — emphasis comes from Barlow Condensed weight/tracking, not gradient fills.
- **Don't** add drop shadows to cards at rest — if a card looks like it needs a shadow to feel "lifted," add a border + glow-on-hover instead.
- **Don't** use cyan as a general-purpose accent or CTA color — if a button or general UI element is cyan, that's a misuse of the diagnostic accent.
- **Don't** blur the public/admin boundary — admin components should never leak onto public pages and vice versa (the admin portal stays unlinked from public nav/footer per project rules).
