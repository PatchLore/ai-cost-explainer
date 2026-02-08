# Ship Readiness Report — AI Cost Explainer

**Audit date:** 2025  
**Status:** ~90% complete. Core flow works; several items are missing or half-built. **Launch is possible** after addressing blocking issues; conversion and polish gaps remain.

---

## 1. CSV Upload & Processing

| Item | Status | Notes |
|------|--------|--------|
| Drag-drop zone accepts .csv up to 10MB? | **BLOCKING** | No file size check. Client accepts any `.csv`; API has no limit. A 100MB upload could hit Vercel/body limits and hurt UX. |
| PapaParse handles malformed CSVs gracefully? | **DONE** (partial) | Papa’s `complete` always runs; bad rows become normalized with empty/NaN. No validation of row count or required columns; garbage-in can produce empty charts. |
| API parses OpenAI format (model, tokens, cost, timestamp)? | **DONE** | `lib/csv-parser.ts` normalizes `Model`/`model`, `Tokens`/`tokens_used`, `Cost`/`cost`, `Timestamp`/`timestamp`. API uses same parser (receives `File`; works in Next.js Route Handler). |
| Error handling for wrong file format? | **DONE** (partial) | Client rejects non-.csv. API doesn’t validate CSV structure; invalid file can yield 500 or empty analysis. No “This doesn’t look like OpenAI usage” message. |

**Verdict:** Add a **10MB (or 5MB) client + API limit** and basic validation (e.g. require at least one row with `cost`/`model`) so wrong files fail clearly.

---

## 2. Analysis Engine

| Item | Status | Notes |
|------|--------|--------|
| Cost aggregation by model (GPT-4, 3.5, etc.)? | **DONE** | `upload` route builds `modelCosts`, `topModels`; stored in `analysis_results.top_models`. |
| Time-series data for Recharts? | **DONE** | `computeSpendByDay()` builds `spend_by_day`; stored and passed to line chart. |
| Optimization recommendations (3.5, batching, caching)? | **DONE** | Four rules in `lib/recommendations.ts`: GPT-4→3.5 (small requests), batching, cache repeated prompts, diversify models. |
| Edge cases: zero usage, negative, refunds? | **BLOCKING** (low) | No clamping. Negative `cost` would show as negative spend. Zero rows → empty charts and no recs (acceptable). No explicit “zero usage” or “refunded credits” handling. |

**Verdict:** **Ship as-is** for MVP. Add `Math.max(0, cost)` (or filter negative) in parser/aggregation if you see refunds/credits in exports.

---

## 3. Dashboard & Visualization

| Item | Status | Notes |
|------|--------|--------|
| Recharts responsive (cost by model, spend over time)? | **DONE** | Bar chart (cost by model) and line chart (spend over time) use `ResponsiveContainer`; no pie chart (bar only). |
| “Download PDF Report” button? | **BLOCKING** | **Not implemented.** No PDF export. |
| Recommendations with copy-to-clipboard code snippets? | **DONE** (partial) | Snippets shown in `<pre>`; **no copy button**. Concierge code snippets have **Download** / **Download all** only. |

**Verdict:** PDF is a **nice-to-have** for v1.0 if you promised it; otherwise move to “Quick wins.” Add **Copy** on recommendation snippets (and Concierge snippets) as a quick win.

---

## 4. Concierge Tier Flow

| Item | Status | Notes |
|------|--------|--------|
| Stripe checkout session with $299? | **DONE** | Uses `price_data` with `unit_amount: 29900`; no fixed Price ID (dynamic is fine). |
| Webhook for `checkout.session.completed`? | **DONE** | Handled; sets `tier = 'concierge_pending'`, sends admin email. |
| Admin notification when someone buys? | **DONE** | Resend email to `ADMIN_EMAIL` with link to `/admin/concierge/[id]`. |
| DB tracks status (pending → in_progress → delivered)? | **DONE** (partial) | `tier`: `self_serve` \| `concierge_pending` \| `concierge_delivered`. No separate `in_progress`; “pending” covers “paid, not yet delivered.” |
| Admin UI to paste Loom URL and report? | **DONE** | Form: Loom URL, markdown report, code snippets (JSON), estimated savings. |
| Customer email when deliverables ready? | **DONE** | `/api/concierge/deliver` uses Resend to customer (lookup by `upload.user_id` via `auth.admin.getUserById`). |
| Customer dashboard: video + download links? | **DONE** | ConciergeStatus shows Loom link, report (markdown), savings, code snippets with per-snippet and “Download all.” |

**Verdict:** Concierge flow is **ship-ready**. No blocking gaps.

---

## 5. Auth & Security

| Item | Status | Notes |
|------|--------|--------|
| Supabase Auth protecting dashboard routes? | **DONE** | Middleware redirects `/dashboard` and `/admin` to `/login` when no user; graceful when Supabase env missing. |
| RLS so users can’t see others’ data? | **DONE** | Policies: users select/insert/update only own `csv_uploads`; analysis/concierge visible only when `upload_id` belongs to user. Service role used in API bypasses RLS (intended). |
| API rate limiting on upload? | **BLOCKING** | **None.** Upload endpoint can be spammed; risk of abuse and cost (Supabase Storage, DB). |
| Stripe webhook signature verification? | **DONE** | `stripe.webhooks.constructEvent(body, sig, webhookSecret)`; returns 400 on invalid signature. |

**Verdict:** **Add rate limiting** (e.g. Vercel serverless limit or middleware/upstream) before launch to avoid abuse.

---

## 6. Production Polish

| Item | Status | Notes |
|------|--------|--------|
| Env vars documented (.env.example)? | **DONE** | All required vars listed (Supabase, Stripe, Resend, APP_URL, ADMIN_EMAIL). |
| Error monitoring (Sentry etc.)? | **BLOCKING** | **Not installed.** No capture of client or server errors. |
| Vercel config (build, env)? | **DONE** (minimal) | `next build` works; no custom config. Env must be set in Vercel project. No `vercel.json` required for default Next. |
| Loading states on async actions? | **DONE** (partial) | Dashboard: “Loading uploads…”; upload detail: “Loading…”; uploader: “Uploading…”; Concierge CTA: “Redirecting…”. Login/signup could show loading on submit. |
| Empty states (no uploads yet)? | **DONE** | Dashboard shows “No uploads yet. Drop a CSV above to get started.” |
| Meta tags, OG image, favicon? | **BLOCKING** (low) | Only `title` and `description` in root layout. No OG image, no favicon, no twitter card. |

**Verdict:** **Sentry (or equivalent)** is the main production gap. OG/favicon are quick wins for sharing and trust.

---

# Blocking Issues List (must fix before launch)

1. **Upload: no file size limit**  
   - Add client-side check (e.g. 10MB) and reject with clear message.  
   - Add API body size limit (e.g. Next.js `export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }` or route config) so large uploads fail fast.

2. **No rate limiting on `/api/upload`**  
   - Prevents abuse and cost blow-up.  
   - Options: Vercel Pro rate limit, Upstash Redis in middleware, or a simple in-memory throttle per IP (with caveats on serverless).

3. **No error monitoring**  
   - Add Sentry (or similar) for API and client so you see failures and can fix them.

4. **Optional but recommended**  
   - Validate CSV shape after parse (e.g. at least one row with numeric cost); return 400 with “This doesn’t look like an OpenAI usage export” instead of 500 or empty analysis.  
   - Clamp or filter negative costs if you expect refunds/credits in the data.

---

# Quick Wins (~30 min each, higher conversion/trust)

1. **Copy-to-clipboard for code snippets**  
   - Add a “Copy” button next to each recommendation snippet and each Concierge snippet.  
   - Use `navigator.clipboard.writeText(snippet)` and a short “Copied!” state.

2. **File size UX**  
   - Show “Max 10MB” in the upload zone and disable submit or show error when `file.size > 10 * 1024 * 1024`.

3. **Meta + favicon**  
   - Set `openGraph`, `twitter`, and `icons` in root layout; add one OG image (e.g. 1200×630) and a favicon.ico (or in `/app`).

4. **Success feedback after upload**  
   - After upload completes, redirect to `/dashboard/upload/[id]` or show a clear “Uploaded — View analysis” link so users don’t have to find the new row.

5. **Login/signup loading**  
   - Disable button and show “Signing in…” / “Creating account…” on submit to avoid double-submit and confusion.

---

# Post-Launch Roadmap (v1.1 after first $1k revenue)

1. **PDF report download**  
   - Use something like `@react-pdf/renderer` or a server-side PDF from analysis + recommendations; add “Download PDF” on the upload detail page.

2. **Rate limiting**  
   - If not done at launch: proper rate limit (e.g. Upstash) per user or IP on upload and Stripe session creation.

3. **Sentry (or full RUM)**  
   - If not done at launch: add and tune alerts so you see errors and performance.

4. **CSV validation and errors**  
   - Detect non-OpenAI or malformed CSVs; return 400 with a clear message and optional “Expected columns: …”.

5. **Concierge “in progress”**  
   - Optional status (e.g. `concierge_in_progress`) and admin toggle so customers see “We’re working on it” instead of only “Pending.”

6. **Pie chart option**  
   - Add a toggle or second chart (cost by model as pie) for stakeholders who prefer it.

7. **Email reminders**  
   - If Concierge isn’t delivered in N days, remind admin (and optionally offer customer a discount or refund).

8. **Basic analytics**  
   - Track signups, uploads, and Concierge checkout starts in a simple dashboard (e.g. Supabase + admin page or a small analytics stack).

---

# Summary Table

| Category              | DONE | Blocking | Quick wins / Later |
|-----------------------|------|----------|---------------------|
| CSV upload & parsing  | 2.5  | 1 (size) | Validation message  |
| Analysis engine       | 4    | 0 (edge) | Negative cost clamp |
| Dashboard & charts    | 2    | 1 (PDF)  | Copy snippets       |
| Concierge flow        | 7    | 0        | —                   |
| Auth & security       | 3    | 1 (rate) | —                   |
| Production polish     | 4    | 1 (Sentry) | OG, favicon, loading |

**Bottom line:** Fix **file size limit**, **rate limiting**, and **error monitoring** (and optionally CSV validation + negative cost). Add quick wins (copy, meta, favicon, upload success UX, login loading). Then you can ship; PDF and v1.1 items can follow revenue.
