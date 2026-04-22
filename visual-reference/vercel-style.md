---
type: visual-reference
source: vercel.com (2026-04 homepage screenshot)
captured: 2026-04-21
target: v0-cli.crafter.run (Astro static site)
---

# Vercel 2026 — Dark Design-Engineering Aesthetic

Reference extracted from the April 2026 vercel.com homepage for application to an agent-first dev-tool marketing site (v0-cli).

## 1. Core aesthetic

**Style name**: Dark Hairline Design-Engineering.

**Philosophy**: pure black canvas + a faint technical grid + iMessage-style speech bubbles that feel conversational but rendered at pixel-perfect hairlines. The page reads like a CAD drawing: the content is the bubble; the grid is the drafting paper; crosshair `+` marks emphasize registration.

**Influences / hybrid**: Apple iMessage bubble grammar × Vercel/Geist typographic voice × technical drawing / drafting-paper chrome. Zero decorative color; all accent comes from typography hierarchy and hairline contrast.

## 2. Color palette

| Role | Name | Hex / value | Usage |
|------|------|-------------|-------|
| bg / canvas | Black | `#000000` | Page background, dominant surface |
| bg / elevated | Near black | `#0A0A0A` | Nav bar background, dark bubble fill |
| bg / bubble light | Pure white | `#FFFFFF` | iMessage-style highlight bubble (hero headline) |
| border / hairline | `rgba(255,255,255,0.08)` | ~ `#141414` opaque | Bubble borders, button borders, pill dividers |
| border / grid | `rgba(255,255,255,0.04)` | ~ `#0F0F0F` opaque | Background grid lines |
| border / crosshair | `rgba(255,255,255,0.35)` | ~ `#595959` opaque | `+` registration marks at grid intersections |
| text / on-dark primary | `#EDEDED` | near-white | Body on dark bubbles, headings on black |
| text / on-dark secondary | `#A1A1A1` | mid grey | Subtitles, descriptor clauses (`with the cloud built for AI.`) |
| text / on-dark muted | `#666666` | dim grey | Nav items, timestamps, metadata |
| text / on-light | `#000000` | pure black | Inside the white hero bubble |
| accent / link | `#EDEDED` | reuses text primary | Links underline on hover only |

Deliberate absence: no blue, no gradient, no saturation. The only "color" is the contrast between pure white bubble and pure black canvas.

## 3. Typography system

**Font families**
- **Display + body**: `Geist` (Vercel's in-house sans). Fallbacks: `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Inter`, `system-ui`, `sans-serif`.
- **Mono**: `Geist Mono`. Fallbacks: `ui-monospace`, `SFMono-Regular`, `Menlo`, `Consolas`, `monospace`.

**Scale** (eyeballed from screenshot; rem-based)

| Token | Size | Weight | Line height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| `hero` | 56px / 3.5rem | 600 | 1.05 | -0.02em | "Infrastructure for AI." hero bubble |
| `h1` | 48px / 3rem | 600 | 1.1 | -0.02em | Secondary heros |
| `h2` | 32px / 2rem | 600 | 1.2 | -0.015em | Section heads |
| `h3` | 24px / 1.5rem | 600 | 1.3 | -0.01em | Card / bubble heads |
| `body-lg` | 20px / 1.25rem | 400 | 1.4 | -0.005em | Descriptor lines below hero |
| `body` | 16px / 1rem | 400 | 1.55 | 0 | Default paragraph |
| `small` | 14px / 0.875rem | 400 | 1.5 | 0 | Nav items, metadata |
| `micro` | 12px / 0.75rem | 500 | 1.4 | 0.02em | Badges, labels, pill text |
| `mono` | 14px / 0.875rem | 400 | 1.5 | 0 | Code snippets, CLI output |

**Conventions**
- Negative letter-spacing on display sizes (classic Geist look).
- Period at the end of hero phrase is intentional (`Infrastructure for AI.`).
- Bubble hero text sits **inside** the bubble padding, not flowing to its edges — 40-48px horizontal padding on desktop.

## 4. Key design elements

### Background grid
- 12-column × 8-row grid visible across the hero.
- Cell size ≈ 82px × 82px on desktop (fixed pixel grid, not responsive).
- Line color: `rgba(255,255,255,0.04)`.
- Crosshair `+` at the top-left and bottom-right corners of the grid region, `rgba(255,255,255,0.35)` ~14px long strokes.
- Slug: `hairline-grid-background`.

### Speech bubbles (iMessage grammar)
- **White bubble** (hero emphasis): `#FFFFFF` fill, text `#000000`, corner radius `28px`, tail pointing bottom-right (classic iMessage right-send tail).
- **Dark bubble** (paired reply): `#0F0F0F` fill, `1px` hairline border `rgba(255,255,255,0.1)`, text primary `#EDEDED`, secondary `#A1A1A1`, tail pointing bottom-left, corner radius `28px`.
- Bubbles overlap the grid; they do not sit in a container with padding.
- Slug: `imessage-bubble-pair`.

### Hairline pills (buttons, badges, CTAs)
- Fill: transparent or `#0A0A0A` when on black.
- Border: `1px solid rgba(255,255,255,0.12)`.
- Border-radius: `9999px` (full pill).
- Padding: `10px 16px` for buttons, `6px 14px` for badges.
- Hover: border brightens to `rgba(255,255,255,0.25)`, no color change.
- Icon-and-text arrangement: leading icon (▲ or ✦) with 8px gap.
- Slug: `hairline-pill-button`.

### Nav bar
- Transparent/black, no shadow, no border.
- Logo wordmark "▲Vercel" in Geist semibold, `#FFFFFF`.
- Nav items `#A1A1A1` default → `#FFFFFF` on hover/active. Active item rendered as hairline pill.
- Right side: two CTAs (Ask AI, Dashboard) as hairline pills; user avatar to the far right.
- Slug: `hairline-nav`.

### Announcement banner (above hero)
- Centered, small (14px): `Vercel April 2026 security incident` + hairline-pill link `Read the bulletin ›`.
- Slug: `announcement-hairline-pill`.

### Sparkle accent
- `✦` glyph before section kicker (`✦ The AI Cloud`).
- Color matches the section text, no special hue.
- Slug: `sparkle-prefix`.

### Periods in marketing copy
- Single period terminating hero (`Infrastructure for AI.`, `…built for AI.`, `…AI models`).
- Creates the authoritative, quiet, already-decided tone Vercel cultivates.
- Not a graphic element per se but a typographic mannerism worth copying.

## 5. Visual concept

**Bridge**: the page is a conversation between the product (white bubble, declaration) and the customer (dark bubble, context). The hairline grid is the drafting paper the designer sketched on — it stays visible to signal engineered, not decorated.

**Element relationships**:
- Canvas (black) and grid (hairlines) are the constants.
- Bubbles are the content primitive — every section should be expressible as a bubble (or pair of bubbles).
- Hairline pills are the interaction primitive — every tappable thing is a pill with a hairline border, never a filled CTA unless it's a product-demo trigger.
- Typography is the emotional primitive — size and period carry the weight that color usually would.

**Ideal use cases**
- Dev tools aimed at engineers who value precision over decoration.
- Infra / platform products whose story is "we got the boring stuff right".
- Documentation entrypoints (a doc site with this chrome reads as authoritative without being cold).

**What to avoid when adapting**
- Do not add color accents (Vercel has zero saturated color in this layout; a single blue CTA would destroy it).
- Do not fill buttons. Hairline borders only.
- Do not drop the grid. The grid IS the aesthetic; a plain black page without it reads as a blank template.
- Do not use rounded corners smaller than `20px` on bubble-like containers. The generous radius is load-bearing.
- Do not use serif or display-novelty fonts. Geist (or `Inter`) is the voice; anything else breaks the engineering frame.

## Adaptation notes for v0-cli.crafter.run

This site is a CLI marketing page, not a cloud-infra home. Translate the grammar as:

- Hero bubble: `v0-cli.` (pure white bubble, black text, period intentional).
- Dark paired bubble: the subtitle / positioning line ("Agent-first command-line wrapper for the v0 Platform API.").
- Hairline grid + crosshairs in the hero viewport.
- Hairline-pill CTAs: `npx skills add Railly/v0-cli` (primary, but **copy-to-clipboard** interaction — no fill, just hairline), `View on GitHub ↗` (secondary hairline).
- Section kickers with `✦` or `▲` prefix.
- Trust ladder rendered as a **quartet of dark bubbles** (T0/T1/T2/T3) — same bubble grammar, scaled down.
- Command examples in `Geist Mono`, inline in bubbles or in a single dark-canvas code block with hairline border and no syntax-highlight color (monochromatic, weight-based emphasis only — commands bold, args regular).

Deliberate divergences (because a CLI is not infra):
- Add one small monospace-heavy section (terminal pane) that the Vercel site wouldn't have.
- Keep the announcement banner slot for future "v0-cli V6 shipped" style updates.
