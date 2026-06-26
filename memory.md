# Memory — bugs, issues & fixes

> A running log so the **same problem never bites twice**. Whenever a bug is found or fixed, add an
> entry here (the `log-issue` skill does this for you). Read this file before editing `index.html` or
> deploying — `safe-edit` and `deploy-check` both point here.

## Entry format
```
### [YYYY-MM-DD] Short title
- **Symptom:** what went wrong / how it showed up.
- **Cause:** the root cause.
- **Fix:** what resolved it (or "OPEN — not yet fixed").
- **Prevention:** the rule/check that stops it recurring.
```

---

## Known landmines & issues

### [2026-06-26] `@vercel/node` in vercel.json breaks deployment
- **Symptom:** deployments fail / app stops working; repeated `restore working version` and
  `Revert "..."` commits in git history point at deploy breakage.
- **Cause:** `vercel.json` uses the `@vercel/node` runtime in both the `builds` block
  ([vercel.json:4](vercel.json#L4)) and the `functions` block ([vercel.json:9](vercel.json#L9)).
  CLAUDE.md explicitly says this runtime breaks deployment.
- **Fix:** OPEN — left as-is for now because `vercel.json` is a protected file (never touch unless
  asked). Flagged for a follow-up. If deploys break, this is suspect #1.
- **Prevention:** Never add or keep `@vercel/node` in `vercel.json`. `deploy-check` verifies this before
  every push. Don't edit `vercel.json` without explicit approval.

### [2026-06-26] Hardcoded Lemlist API key in the client
- **Symptom:** the Lemlist API key is committed in plaintext and shipped to every browser.
- **Cause:** the key is hardcoded in [index.html:243](index.html#L243) (and in CLAUDE.md). The proxy
  already authenticates with `process.env.LEMLIST_API_KEY` ([api/lemlist.js:19](api/lemlist.js#L19)) and
  **ignores** the client-supplied key — so the client field is both dead code and a credential leak.
- **Fix:** [2026-06-26] Removed from the client — deleted the API-key input, made `getLemlistHeaders`
  not require a client key, and stopped reading the field in `loadLemlistReport`; the proxy adds auth
  server-side via the env var. Removed the key from CLAUDE.md too. The working-tree `api/lemlist.js`
  already uses `process.env.LEMLIST_API_KEY` (commit it to retire the hardcoded value in HEAD).
  **STILL REQUIRED (user action):** the old key is in git history and a Vercel build — **rotate it in
  Lemlist** and set the new value as `LEMLIST_API_KEY` in Vercel (Production + Preview). Until rotated,
  treat the old key as compromised.
- **Prevention:** Never hardcode secrets in `index.html`, `api/*`, or CLAUDE.md. Secrets live only in
  Vercel env vars. `deploy-check` greps for the key shape before pushing.

### [2026-06-26] Malformed inline onclick handlers (quote-doubling)
- **Symptom:** generated HTML has a stray `>` before some icons and brittle handlers; the flow
  Duplicate/Delete buttons are the most likely to actually misfire.
- **Cause:** a recurring quote-doubling pattern in string-built handlers — `...)''>` and the heavier
  `onclick=\'...\")'\'>` escaping. Seen at [index.html:706](index.html#L706),
  [494](index.html#L494), [509](index.html#L509), and [1093-1094](index.html#L1093-L1094).
- **Fix:** OPEN — not yet corrected (documenting first). When touched, normalise to a single clean
  attribute quote and remove the stray characters.
- **Prevention:** When building handlers as strings, use exactly one quote style per attribute and avoid
  manual `\'` escaping inside `"..."`. Watch for `''>` and `')'\'>` when reviewing diffs.

---

<!-- Add new entries above this line, newest first, using the format at the top. -->
