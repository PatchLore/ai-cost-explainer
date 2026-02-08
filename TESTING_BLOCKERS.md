# Testing the three blockers

## 1. 10MB file size limit

**Client (CSVUploader):**
- Create a CSV file larger than 10MB (e.g. copy a small CSV 1000x in a text editor and save), or use `fs.writeFileSync('large.csv', 'a'.repeat(11*1024*1024))` in Node to generate one.
- Open Dashboard, try to upload it via drag-drop or file picker.
- **Expected:** Error message "File must be 10MB or smaller." immediately (no request sent).

**API:**
- Bypass client check (e.g. with curl or Postman): send a POST to `/api/upload` with a body containing a file > 10MB (and valid auth cookies / session).
- **Expected:** Response `413` with `{ "error": "File must be 10MB or smaller." }`.

---

## 2. Upstash rate limiting (5 requests/minute per IP)

**Prerequisites:** Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local` (create a Redis database at [Upstash Console](https://console.upstash.com/)).

- Without Upstash env vars, rate limiting is **skipped** (no 429).
- With env vars set: make 6 upload requests within 1 minute (same IP). The 6th request should return **429** with body `{ "error": "Too many uploads. Please try again in a minute." }`.
- **Quick test:** Use the Dashboard and upload the same or different CSV 6 times in a row; the 6th should show the rate limit error in the UI.
- Wait ~1 minute and try again; the next request should succeed.

---

## 3. Sentry (error monitoring)

**Prerequisites:** Set `NEXT_PUBLIC_SENTRY_DSN` (and optionally `SENTRY_DSN`) in `.env.local`. Create a project at [sentry.io](https://sentry.io) and copy the DSN.

**Install deps:** Run `npm install` (adds `@sentry/nextjs`, `@upstash/ratelimit`, `@upstash/redis`).

**Test client error:**
- Add a temporary button that throws: e.g. in the dashboard page, a button with `onClick={() => { throw new Error("Sentry test"); }}`.
- Click it. Open Sentry → Issues; the error should appear within a few seconds.

**Test server/API error:**
- In an API route (e.g. `/api/upload`), temporarily add `throw new Error("Sentry API test");` at the top and trigger that route. Check Sentry for the new event.

**Verify:** Without `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN`, the app should run normally and Sentry will not send events (init is skipped).
