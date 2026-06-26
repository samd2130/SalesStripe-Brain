---
name: deploy-check
description: Pre/post Vercel deploy verification for Salesstripe Brain. Use before pushing or deploying, or after a deploy looks broken. Confirms vercel.json stays zero-config (no builds/functions/@vercel/node), that the Lemlist proxy returns JSON, and — critically — that index.html's inline JS actually parses (one syntax error blanks the whole app). Reminds you to log any breakage to memory.md.
---

# deploy-check — verify before & after deploying

Deployment breakage is this project's #1 recurring pain (see the `restore working version` commits and
[memory.md](../../../memory.md)). Run these checks around every push.

## Pre-deploy
1. **`vercel.json` unchanged.** Unless the user explicitly asked to change it, it must have no diff:
   - `git diff --stat vercel.json` → should be empty.
2. **vercel.json stays zero-config.** It is now `{ "rewrites": [...] }` only (fixed 2026-06-26). Never
   reintroduce a `builds` or `functions` block or the `@vercel/node` runtime — that combo broke deploys
   for months (memory.md). `git diff vercel.json` should be empty unless you deliberately changed routing.
3. **The inline JS actually parses** — THE most important check. A single syntax error anywhere in the
   one `<script>` blanks the ENTIRE app (blank screen, dead buttons). Grepping that a function "exists"
   proves nothing. Extract and check:
   - `awk '/<script>/{f=1;next} /<\/script>/{f=0} f{print}' index.html > /tmp/app.js && node --check /tmp/app.js`
   - Must exit 0 with no output.
4. **Only intended files changed.** `git status` — confirm the diff is just your feature/fix
   (plus, ideally, updated `spec.md` / `memory.md`). No stray `index.html.bak-*` backups committed.
5. **No secrets added** to `index.html`. The Lemlist key belongs in the Vercel env var only.
6. **App loads clean.** Open `index.html` in a browser; no console errors; core flows work
   (create workspace → add ICP → create campaign → strategy map renders → reporting tab opens).

## Proxy sanity (if you touched reporting or `api/lemlist.js`)
- The client must call `/api/lemlist?path=<encoded path>` (e.g. `/api/campaigns`).
- The proxy is **GET-only** and authenticates via `process.env.LEMLIST_API_KEY`. Confirm
  `LEMLIST_API_KEY` is set in the Vercel project env (Production + Preview).

## Push / deploy
- Push to GitHub (Vercel auto-deploys). Only commit/push when the user asks.
- Default branch is `main`; if asked to open a PR, branch first.

## Post-deploy (verify the LIVE site, not just the build)
Vercel reports a build "Ready" even when the page is blank or the proxy is misrouted — so check behaviour:
- **Live JS parses:** `curl -s <prod-url> > /tmp/live.html`, extract the `<script>`, `node --check` it.
  This is the only thing that catches a blank-screen deploy.
- **Proxy returns JSON, not HTML:** `curl "<prod-url>/api/lemlist?path=%2Fapi%2Fcampaigns"` must start
  with `[` or `{`. A 200 that returns index.html means the function isn't routed at `/api/lemlist`.
- Then open the URL: home renders, a workspace opens, the **Reporting** tab loads Lemlist data.
- **If the deploy is broken:** `vercel rollback` (the CLI is logged in as samd2130) or restore the last
  known-good `index.html`, confirm recovery, then run **`log-issue`** to record it in `memory.md`.
