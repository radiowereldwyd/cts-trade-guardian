# CTS Trade Guardian

CTS Trade Guardian is a premium dark-theme trading bot dashboard built for GitHub Pages with a Supabase-ready data layer and full offline fallback mode.

## Pages
- `index.html` — Dashboard with live AI signal panel, chart, current trade summary, and alert modal.
- `journal.html` — Trade Journal with filters, stats, and trade card history.
- `settings.html` — Settings page with strategy toggles, stats, and support/legal menu items.

## Stack
- Vanilla HTML/CSS/JavaScript
- [Chart.js](https://www.chartjs.org/) for signal visualizations
- [Supabase JS](https://supabase.com/docs/reference/javascript/introduction) for optional cloud data

## Supabase setup
1. Open `js/config.js`
2. Replace:
   - `YOUR_SUPABASE_URL_HERE`
   - `YOUR_SUPABASE_ANON_KEY_HERE`
3. Create tables:
   - `trade_logs`
   - `settings`

> If Supabase is not configured or unavailable, the app automatically runs with built-in demo data.

## Run locally
Open `index.html` directly in a browser or serve the repository root with any static web server.

## Footer
© 2026 CTS Cyber Solutions - All Rights Reserved.
