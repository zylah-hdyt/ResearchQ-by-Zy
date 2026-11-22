# MyFi — Audit (22 Nov 2026)

Full review of the live app (code + browser tests on desktop and an iPhone viewport, light and dark, Indonesian and English).

## Fixed in this round
| # | Finding | Severity | Fix |
|---|---|---|---|
| 1 | Typing Rupiah the Indonesian way saved wrong values: `1.250.000` → **Rp 0**, `12.500` → Rp 12,5 | **Critical** | New `parseAmount`/`parseNumber` (reads both conventions); live-grouped `AmountInput` for Rupiah; used in transactions, wallets, budgets, exchange rates; unit-tested |
| 2 | **No way to sign out on phones** (button existed only in the desktop sidebar) | High | Account menu (⋮ / avatar) on every page, plus Sign out on Profile and Settings |
| 3 | App started in the browser's language, USD and "system" theme | High | Indonesian is the default (also on the sign-in page), IDR for every new account, light theme by default; DB trigger updated (`20261122000000_…sql`) |
| 4 | No quick theme switch (buried in Settings) | Medium | Light ⇄ dark toggle on the sign-in page, dashboard header and top bar; also in the account menu; works before sign-in |
| 5 | Rupiah shown as "IDR 107,325,000" in English | Medium | Always "Rp 1.250.000" / "Rp 1,250,000" |
| 6 | Sample data was English ("Ride", "Lunch") in the Indonesian UI | Medium | Sample data localised (ID/EN) |
| 7 | Dark mode: white text on bright teal (balance card, + button) | Medium | Fixed gradient / text colours for dark |
| 8 | Greeting name truncated on phones | Low | Wraps to two lines |
| 9 | No way to change password | Medium | Settings → Change password (cloud and local) |
| 10 | Blank screen on an unexpected error | Medium | Error boundary with reload button |
| 11 | Transactions list rendered every row (slow for large histories) | Medium | Shows 100 at a time, "Show more" |
| 12 | No Content-Security-Policy / HSTS | Medium | Added in `netlify.toml`; export verified under the CSP |
| 13 | Missing page meta | Low | Theme-colour for light/dark, Open Graph tags |

## Data-viz and UI polish pass (dashboard, reports, charts)
Applied the `dataviz` skill (form choice, validated colour, mark specs, interaction, accessibility):

- **Colour-blind-safe palette, validated with the skill's script.** The old green/orange income/expense pair scored ΔE 7.0 (below the 8 target; dark mode failed the lightness band). Now **income = blue, expense = orange** (ΔE 24.7 light / 26.8 dark, all checks pass). Transfers moved to violet so they never look like income. Brand teal stays for chrome and "on track".
- **Cashflow chart rebuilt:** bars ≤ 24px with 4px rounded ends on one baseline, 2px gap between the pair, hairline solid grid, round axis ticks, legend, hover **and keyboard-focus** tooltip listing every series plus the net, and a **table view** twin.
- **Stat tiles** now carry a change versus the *same period* last month (like-for-like), a 6-month sparkline (gray line, current month in the accent) and proportional digits; the balance is a ≥ 48px hero figure.
- **Part-to-whole:** the donut was replaced by **ranked horizontal bars** (largest first, value at the bar tip, one hue = the measure, tail folded into "Other").
- **Budget meters:** fill carries severity (teal → amber → red), track is a lighter step of the same colour, and warning/exceeded also get an icon + text (never colour alone).
- **Accessibility/touch:** visible focus rings, focus trap and focus return in dialogs, 44px tap targets on touch devices, reduced-motion support, page title per screen, subtle entrance animation.

## Still missing — before a public launch (P0)
1. **Forgot / reset password.** Needs a custom email sender (SMTP): Supabase's built-in email is for testing only and does not reliably deliver to ordinary users. Also required to turn **Confirm email** back on safely.
2. **Terms of Service and Privacy Policy** pages plus consent at sign-up (the app stores financial data; Indonesian PDP law applies).
3. **Self-service account deletion** (SQL function + button).
4. **Supabase → Authentication → URL Configuration:** set *Site URL* to the Netlify address (needed for email links).
5. **Bot protection on sign-up** (CAPTCHA such as Cloudflare Turnstile) and rate limits — sign-up is open and email confirmation is currently off.
6. **Backups.** The free Supabase plan has no automatic backups; users can export to Excel, but a scheduled database backup is advisable before real users arrive.
7. Delete the two test accounts (`e2e-test-a@example.com`, `e2e-test-b@example.com`) if still present.

## Still missing — product (P1)
- Custom categories screen (the database already supports it).
- Recurring transactions (salary, rent, subscriptions); CSV/Excel **import** (bank statements).
- Bulk actions in Transactions (multi-select, bulk delete); search by amount.
- Google sign-in.
- Offline use / install prompt (manifest exists; no service worker yet).
- Avatars in a storage bucket (currently a ≤ 300 kB data URL in the profile row).
- Export in a Web Worker for > 20 000 rows.
- Accessibility pass (focus trap in dialogs, keyboard flows, WCAG 2.2 AA review).
- CI (GitHub Actions: typecheck, tests, build) and error monitoring.

## Later (P2)
Dark-surface logo variant, 1200×630 share image, marketing page, store listings, trademark / domain / app-store availability checks for the name and logo.

## Known limitations
Budgets are monthly only; credit cards have no statement cycle; investments have no price tracking; exchange rates are entered manually; no shared / family accounts.
