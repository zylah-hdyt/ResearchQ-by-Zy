# MyFi — Brand basics

**Name:** MyFi (short for *My Financial*). Written "MyFi" — "My" regular weight, "Fi" bold.
**Credit:** "Developed by Zy" (ID: "Dikembangkan oleh Zy").
**Tagline (working):** "Manage your money with clarity." / "Kelola keuangan dengan jelas."

## Logo — "Flow M"
An open ring (money in motion) around an **M**, with an amber coin at the ring's head.

| Asset | File |
|---|---|
| Master icon (SVG, rounded square) | `app/public/logo-icon.svg` |
| Favicon | `app/public/favicon.svg` |
| App icons (PNG) | `app/public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` |
| Web manifest ("Add to Home Screen") | `app/public/manifest.webmanifest` |
| React component | `app/src/components/Logo.tsx` (`LogoMark`, `Wordmark`) |

Regenerate the PNGs after editing the SVG: `cd app && node scripts/make-icons.cjs` (needs Playwright's Chromium).

## Colour
| Role | Value |
|---|---|
| Brand teal (gradient) | `#14a89a` → `#0b5c56` |
| UI brand | `#0f766e` (light), `#2dd4bf` (dark theme) |
| Accent coin | `#fbbf24` |
| Icon strokes | `#ffffff` |

## Usage
- Keep clear space around the icon of at least one third of its width.
- Do not recolour the ring or the coin, stretch the logo, or put it on a busy background.
- On dark or teal backgrounds, add a thin light outline (see the sign-in page).
- Minimum size: 16 px (favicon). Below 24 px prefer the icon without the wordmark.

## Status
Name and logo chosen. Not yet done: trademark / domain / app-store availability checks, marketing site, store listings.
