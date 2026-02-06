# AI Cost Explainer

Next.js 14 (App Router) + Supabase + Stripe + Resend. Analyze OpenAI usage CSVs with free automated recommendations and an optional $299 Concierge tier (manual expert review with Loom video + report).

## Setup order

Follow this order: **database → auth → file upload → analysis display → Stripe → admin panel**.

### 1. Database (Supabase)

1. Create a [Supabase](https://supabase.com) project (free tier).
2. In **SQL Editor**, run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql` — `csv_uploads`, `analysis_results`, `concierge_deliverables`, RLS.
   - `supabase/migrations/002_storage_and_spend_by_day.sql` — Storage bucket `csv-uploads`, policies, `spend_by_day` column.
3. Copy **Project URL** and **anon key**; for the API you’ll also need the **service_role** key (Settings → API).

### 2. Auth (Supabase Auth)

1. In Supabase: **Authentication → Providers** — enable Email (and optionally Magic Link).
2. **Authentication → URL Configuration**: set **Site URL** to your app URL (e.g. `http://localhost:3000`) and add redirect URLs if needed.
3. App uses `@supabase/ssr`: login/signup at `/login` and `/signup`, middleware protects `/dashboard` and `/admin`.

### 3. File upload (Supabase Storage)

1. The `csv-uploads` bucket is created by `002_storage_and_spend_by_day.sql`.
2. Upload flow: client parses CSV with Papa Parse → POST to `/api/upload` with file + `userId` → API verifies session, uploads file to Storage at `{userId}/{uploadId}/{filename}`, saves row in `csv_uploads` and runs analysis (recommendations + `spend_by_day`).

### 4. Analysis display

- **Dashboard** (`/dashboard`): list of uploads; drag-and-drop CSV upload.
- **Upload detail** (`/dashboard/upload/[id]`): Recharts **bar chart** (cost by model), **line chart** (spend over time from `spend_by_day`), and **automated recommendations** (rule-based: GPT-4→3.5 for small requests, batching, caching repeated prompts).

### 5. Stripe integration

1. [Stripe Dashboard](https://dashboard.stripe.com): create product **"AI Cost Audit + Implementation Guide"** — $299 one-time (or use existing).
2. **Webhook**: add endpoint `https://your-domain.com/api/stripe/webhook`, event `checkout.session.completed`. Copy **Signing secret** (`whsec_...`).
3. Flow: user clicks “Get Expert Analysis” → `/api/stripe/create-concierge-session` returns Stripe Checkout URL → after payment, **webhook** sets `tier = 'concierge_pending'` and sends **Resend** email to `ADMIN_EMAIL` with link to `/admin/concierge/[id]`.

### 6. Admin panel

1. Set `ADMIN_EMAIL` in env (must match the admin user’s Supabase Auth email).
2. When you get a Concierge order:
   - Open the link from the email: `/admin/concierge/[id]`.
   - View CSV data preview, download from Supabase Storage if needed, analyze locally (Excel/Python).
   - Record a ~10‑min Loom video; write markdown report and optional code snippets (JSON array).
   - Submit form: Loom URL, report, code snippets (JSON), estimated savings.
3. On submit: row in `concierge_deliverables`, `csv_uploads.tier` → `concierge_delivered`, and **Resend** sends the customer an email with link to view results. Customer sees video link, report, and **downloadable code snippets** on `/dashboard/upload/[id]`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (API + Storage uploads) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | From address for Resend (e.g. `AI Cost Explainer <notify@yourdomain.com>`) |
| `NEXT_PUBLIC_APP_URL` | App URL (e.g. `https://your-app.vercel.app`) |
| `ADMIN_EMAIL` | Your email (admin Concierge access + notification recipient) |

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, upload a CSV, view analysis and Concierge CTA.

## File structure

```
app/
├── (dashboard)/          # Customer area (auth required)
│   ├── dashboard/
│   │   ├── page.tsx       # Upload history + CSVUploader
│   │   └── upload/[id]/page.tsx  # Analysis + ConciergeStatus
│   ├── layout.tsx
│   └── components/
│       ├── CSVUploader.tsx
│       ├── AnalysisViewer.tsx   # Recharts bar + line + recommendations
│       ├── ConciergeStatus.tsx # Upsell / pending / delivered (video + snippets download)
│       └── DashboardNav.tsx
├── (admin)/
│   └── admin/concierge/[id]/   # Deliver Concierge (admin email check)
│       ├── page.tsx
│       └── ConciergeDeliveryForm.tsx
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── api/
│   ├── upload/route.ts    # Parse + Storage + analysis
│   ├── analyze/route.ts  # Optional re-run analysis
│   ├── stripe/create-concierge-session/route.ts
│   ├── stripe/webhook/route.ts  # concierge_pending + admin email
│   └── concierge/deliver/route.ts  # Deliver + customer email
└── page.tsx              # Home
lib/
├── csv-parser.ts          # Papa Parse, client-side compatible
├── recommendations.ts     # Rule engine (GPT-4→3.5, batching, caching)
├── supabase.ts            # Browser + server Supabase clients
├── supabase/server.ts     # SSR client (cookies)
├── supabase/client.ts     # Browser client
├── supabase/middleware.ts # Session refresh + route protection
└── types.ts
```

## Database schema (reference)

- **csv_uploads**: `user_id`, `filename`, `storage_path`, `raw_data`, `status`, `tier` (`self_serve` \| `concierge_pending` \| `concierge_delivered`), `loom_video_url`, `consultant_notes`, `savings_estimate`, etc.
- **analysis_results**: `upload_id` (unique), `total_spend`, `total_requests`, `top_models` (jsonb), `recommendations` (jsonb), `spend_by_day` (jsonb) for line chart.
- **concierge_deliverables**: `upload_id`, `loom_video_url`, `written_report`, `code_snippets` (jsonb), `top_savings`.

RLS: users see only their own uploads and analysis; admin delivery uses service role in API.

## Troubleshooting

### `Cannot find module '../server/require-hook'` when running `npm run dev`

This usually means the Next.js install is incomplete or corrupted, or you're on a very new Node version (e.g. Node 24) that Next 14 doesn't fully support yet.

1. **Clean reinstall** (PowerShell):
   - Close Cursor/VS Code (or at least close the project folder) and any running `npm run dev` or Node process so nothing locks `node_modules`.
   - In a **new** PowerShell window, `cd` to the project, then run:
   ```powershell
   Remove-Item -Recurse -Force node_modules; Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue; npm install
   ```
   Then run `npm run dev` again.

2. **If it still fails**, use **Node 20 LTS** (recommended for Next 14):
   - Install from [nodejs.org](https://nodejs.org) (LTS), or
   - With nvm: `nvm install 20` then `nvm use 20`
   Then delete `node_modules` and `package-lock.json`, run `npm install`, and `npm run dev`.
