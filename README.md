# FinTrack — Financial Tracker Dashboard

Personal finance dashboard yang visualisasikan data dari Google Spreadsheet.

**Stack:** SvelteKit + Tailwind CSS v4 + Material Design 3  
**Data Source:** Google Sheets API v4  
**Deploy:** Cloudflare Pages

---

## 🚀 Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🌐 Environment

Copy `.env.example` ke `.env`:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
```

**Auth — pilih salah satu:**

- **Local dev** → set `GOOGLE_TOKEN_PATH` (path ke OAuth token file)
- **Cloudflare** → set `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON service account key)

## ☁️ Deploy

Build otomatis via Cloudflare Pages (GitHub integration):

1. Push ke GitHub
2. Connect repo ke Cloudflare Pages
3. Set **Environment Variables (encrypted)**:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
4. Share spreadsheet dengan service account email sebagai Editor

## 📁 Project Structure

```
src/
├── routes/
│   ├── +layout.svelte          # Shell: nav rail + header
│   ├── +page.svelte            # Dashboard overview
│   ├── transactions/+page.svelte
│   ├── categories/+page.svelte
│   └── api/transactions/+server.ts  # Google Sheets proxy
├── lib/
│   ├── sheets.ts               # Google Sheets API bridge (dual-mode auth)
│   ├── stores.svelte.ts        # Reactive state (Svelte 5 runes)
│   ├── utils.ts                # Format currency, dates
│   └── components/
│       ├── NavRail.svelte       # Desktop nav / mobile bottom nav
│       ├── SummaryCard.svelte   # Metric cards
│       ├── DonutChart.svelte    # Category breakdown
│       ├── TrendChart.svelte    # Monthly income vs expense
│       ├── TransactionTable.svelte
│       └── FilterBar.svelte     # Filter chips
├── app.css                      # Tailwind + M3 design tokens
└── app.html
```
