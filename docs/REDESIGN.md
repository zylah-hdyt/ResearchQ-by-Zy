# Cinematic redesign (black + emerald)

Direction taken from four reference boards: deep black surfaces, emerald `#20C975` and turquoise `#20C9B4`, atmospheric green light, dimensional objects, pill buttons, SF Pro / Geist type.

## What changed
- **Tokens** (`app/src/styles/tokens.css`): dark is now the default identity (`#000` background, `#191919` surfaces, `#232323` elevated). Light stays available with the same emerald accent. Contrast was checked for text, secondary text, links, brand-on-dark, input borders and data colours in both themes (all ≥ 4.5:1, input borders ≥ 3:1).
- **Identity**: pill buttons with a green glow, emerald-tinted active states, floating mobile navigation and hero surfaces live in the component and page stylesheets; ambient light, illustrated objects and the welcome, sign-in and reset screens live in `styles/scenes.css`.
- **Illustrated objects** (`components/Scene.tsx`): coin, tilted card and rising bars as inline SVG/CSS. No images are downloaded, they follow the theme, they are decorative (`aria-hidden`) and the floating animation stops under reduced motion.
- **New screens**: first-visit welcome story (three slides, skip, language switch, Start / Sign in); sign-in and sign-up restyled around the card object. The welcome shows once per browser (`myfi.welcomed`).
- **Typeface**: SF Pro on Apple devices, Geist Variable (bundled, `@fontsource-variable/geist`, no CDN) elsewhere.
- **Brand mark and icons**: Flow M recoloured to emerald with a mint coin; favicon, app icons and manifest colours updated.
- Default theme for new accounts and visitors is dark; existing accounts keep their saved choice.

## Kept on purpose
- Data colours stay blue (income) and orange (expense): they were validated for colour-blind safety, and green is reserved for the brand and positive change.
- No functional change: authentication, Supabase, financial calculations and Excel export are untouched (77 unit tests and the browser suites pass).

## Limits
- The "cinematic 3D" objects are illustrations built in code, not rendered 3D or photography. Photographic hero imagery like the references would need licensed assets.
- Supabase mode was not re-tested with this UI; the redesign does not touch it.
