# AI Cost Explainer — Summary

## What’s been done

### App and dependencies
- **Next.js 14** (App Router), TypeScript, Tailwind, Recharts, Papa Parse, Supabase SSR, Stripe, Resend.
- **package.json** fixed (no trailing comma), Next.js on **14.2.35** (security-patched).
- **npm install** and **npm run dev** work; middleware no longer crashes when Supabase env vars are missing.

### Database (code only — you run the SQL)
- **001_initial_schema.sql**: `csv_uploads`, `analysis_results`, `concierge_deliverables`, RLS.
- **002_storage_and_spend_by_day.sql**: Storage bucket `csv-uploads`, RLS for Storage, `spend_by_day` on `analysis_results`.

### Auth
- **Supabase Auth** via `@supabase/ssr`: `/login`, `/signup`, middleware protecting `/dashboard` and `/admin`.
- **lib/supabase**: browser client, server client (cookies), middleware (session refresh). Graceful when URL/key are unset.

### CSV upload and storage
- **CSVUploader**: drag-and-drop, client-side parse with Papa Parse, POST to `/api/upload`.
- **API /api/upload**: session check, parse CSV, upload file to Supabase Storage `{userId}/{uploadId}/{filename}`, insert `csv_uploads` + `analysis_results` (recommendations + `spend_by_day`).

### Free analysis and recommendations
- **lib/recommendations.ts**: three rules — GPT-4→3.5 for small requests, batching, caching repeated prompts.
- **AnalysisViewer**: Recharts **bar chart** (cost by model), **line chart** (spend over time), list of recommendations with severity and code snippets.

### Concierge tier ($299)
- **Stripe**: `/api/stripe/create-concierge-session` — Checkout “AI Cost Audit + Implementation Guide” $299, metadata `uploadId`.
- **Webhook** `/api/stripe/webhook`: on `checkout.session.completed` → set `tier = 'concierge_pending'`, email admin via Resend with link `/admin/concierge/[id]`.
- **ConciergeStatus**: upsell CTA; after payment shows “In progress”; when delivered shows Loom link, report, savings, code snippets with **Download** / **Download all**.

### Admin panel
- **/admin/concierge/[id]**: admin-only (email === `ADMIN_EMAIL`), CSV data preview, form: Loom URL, markdown report, code snippets (JSON), estimated savings.
- **/api/concierge/deliver**: writes `concierge_deliverables`, updates `csv_uploads` to `concierge_delivered`, sends Resend email to customer with link to view results.

### Customer view (delivered concierge)
- Upload detail page shows Loom video link, written report, estimated savings, and code snippets with per-snippet and “Download all” buttons.

### Docs and config
- **README.md**: setup order, env vars, run commands, file structure, schema reference, troubleshooting (require-hook, clean reinstall, Node 20).
- **.env.example**: list of required env vars.

---

## What needs doing

### 1. Environment (required for full flow)
- Create **.env.local** from `.env.example`.
- Fill in at minimum:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- For upload + Storage + API: also `SUPABASE_SERVICE_ROLE_KEY`.
- For Concierge: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `ADMIN_EMAIL`, `NEXT_PUBLIC_APP_URL`.

### 2. Supabase project
- Create a Supabase project (free tier).
- In **SQL Editor**, run **001_initial_schema.sql** then **002_storage_and_spend_by_day.sql**.
- **Authentication → Providers**: enable Email (and optional Magic Link).
- **Authentication → URL Configuration**: set Site URL (e.g. `http://localhost:3000`).
- Copy Project URL, anon key, and service_role key into `.env.local`.

### 3. Stripe (for Concierge)
- In Stripe Dashboard: product “AI Cost Audit + Implementation Guide” — $299 one-time (or use existing).
- Add webhook endpoint: `https://your-domain.com/api/stripe/webhook`, event `checkout.session.completed`; copy signing secret into `STRIPE_WEBHOOK_SECRET`.
- Put Stripe secret key in `STRIPE_SECRET_KEY`.

### 4. Resend (for emails)
- Get API key from Resend; set `RESEND_API_KEY` and `RESEND_FROM` (verified sender).
- Admin email on payment and customer email on deliver will work once these are set.

### 5. Admin email
- Set `ADMIN_EMAIL` to the Supabase Auth email you use for admin; that user can access `/admin/concierge/[id]`.

### 6. Optional / later
- Run **npm audit fix** (or **npm audit fix --force** with care) for reported vulnerabilities.
- Deploy to Vercel; set env vars in project settings; use same webhook URL for Stripe.
- Add a “Download CSV” link on the admin concierge page if you want to pull the file from Storage by path (logic exists via `storage_path` on `csv_uploads`).

---

## Quick reference

| Done | Not done (you do it) |
|------|----------------------|
| Full app code, migrations, auth, upload, analysis, Stripe, Resend, admin, customer view | Create Supabase project, run SQL, configure Auth |
| Middleware + graceful missing env | Add `.env.local` and all keys |
| README + troubleshooting | Stripe product + webhook, Resend domain/from, set `ADMIN_EMAIL` |
| Next 14.2.35, deps installed, dev runs | Deploy + production env (optional) |
