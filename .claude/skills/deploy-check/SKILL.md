---
name: deploy-check
description: Pre/post Vercel deploy verification for Salesstripe Brain. Use before pushing or deploying, or after a deploy looks broken. Confirms vercel.json is untouched and free of the @vercel/node landmine, that the Lemlist proxy path still resolves, and that index.html loads without console errors. Reminds you to log any breakage to memory.md.
---

# deploy-check — verify before & after deploying

Deployment breakage is this project's #1 recurring pain (see the `restore working version` commits and
[memory.md](../../../memory.md)). Run these checks around every push.

## Pre-deploy
1. **`vercel.json` unchanged.** Unless the user explicitly asked to change it, it must have no diff:
   - `git diff --stat vercel.json` → should be empty.
2. **No `@vercel/node` regression.** This runtime has broken deploys before:
   - `git diff vercel.json` and confirm nothing newly introduces `@vercel/node`.
   - (It currently exists in the file — memory.md #1. Don't *add more*; don't "fix" it without approval.)
3. **Only intended files changed.** `git status` — confirm the diff is just your feature/fix
   (plus, ideally, updated `spec.md` / `memory.md`). No stray `index.html.bak-*` backups committed.
4. **No secrets added** to `index.html`. The Lemlist key belongs in the Vercel env var only.
5. **App loads clean.** Open `index.html` in a browser; no console errors; core flows work
   (create workspace → add ICP → create campaign → strategy map renders → reporting tab opens).

## Proxy sanity (if you touched reporting or `api/lemlist.js`)
- The client must call `/api/lemlist?path=<encoded path>` (e.g. `/api/campaigns`).
- The proxy is **GET-only** and authenticates via `process.env.LEMLIST_API_KEY`. Confirm
  `LEMLIST_API_KEY` is set in the Vercel project env (Production + Preview).

## Push / deploy
- Push to GitHub (Vercel auto-deploys). Only commit/push when the user asks.
- Default branch is `main`; if asked to open a PR, branch first.

## Post-deploy
- Load the deployed URL: home renders, a workspace opens, the **Reporting** tab can load Lemlist data
  (exercises the serverless proxy end-to-end).
- **If the deploy is broken:** restore the last known-good `index.html` (or `git revert`), confirm the
  site recovers, then run **`log-issue`** to record symptom → cause → fix in `memory.md`.
