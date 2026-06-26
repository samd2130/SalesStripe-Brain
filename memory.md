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

### [2026-06-26] vercel.json: deploys failed, then the API 404'd — fixed with zero-config
- **Symptom:** (1) `git push` deploys failed entirely — GitHub commit status "Deployment failed", Vercel
  error link `vercel.link/functions-and-builds`; the live site stayed stuck on a ~10h-old deploy.
  (2) After a first fix the site built but `/api/lemlist` returned **404**, then returned **index.html
  with status 200** instead of JSON.
- **Cause:** the committed `vercel.json` had a `builds` block **and** a `functions` block together
  (Vercel forbids that combo) and used `"runtime": "@vercel/node"` (invalid — `@vercel/node` is a
  builder, not a runtime). Separately: with an explicit `builds` block the function is served at
  `/api/lemlist.js`, but the app calls `/api/lemlist` (no extension), so requests fell through the
  catch-all route to index.html.
- **Fix:** [2026-06-26] Replaced vercel.json with Vercel's **zero-config** form — no `builds`, no
  `functions`, no `routes`, no `@vercel/node`:
  `{ "rewrites": [ { "source": "/((?!api/).*)", "destination": "/index.html" } ] }`
  Vercel auto-detects `api/lemlist.js` and serves it at `/api/lemlist` (extension stripped). Verified
  live: homepage = new version, and `/api/lemlist?path=/api/campaigns` returns campaign JSON. Deployed
  with `vercel --prod` (the Vercel CLI is logged in as samd2130) after a Preview build returned READY.
- **Prevention:** keep vercel.json zero-config. Never add a `builds`/`functions` block or `@vercel/node`.
  If the API 404s or returns HTML instead of JSON, the function isn't being served at the path the client
  calls — confirm the route is `/api/<file>` with no `.js`. `deploy-check` should curl `/api/lemlist`
  and assert the body is JSON (a 200 alone isn't enough — the catch-all can return index.html as 200).

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

### [2026-06-26] One stray quote in a JS string blanked the entire app
- **Symptom:** once deploys finally worked, the live site loaded **blank with dead buttons**.
- **Cause:** a stray double-quote in `renderLemlistReport`'s funnel code:
  `html+="<div style='padding:4px 0;color:#1a1a1a;">"+count+...` — the `;">` closed the JS string
  early, so the whole single inline `<script>` failed to parse and **nothing** ran. Pre-existing bug; it
  only reached production once the vercel.json fix let the committed index.html actually deploy.
- **Fix:** [2026-06-26] Changed `;">` to `;'>` in that line, confirmed with
  `node --check` on the extracted script, redeployed, and verified the live JS parses clean.
- **Prevention:** a syntax error ANYWHERE in the one inline script kills the WHOLE app — confirming a
  function "exists" via grep proves nothing. Always extract the `<script>` and run `node --check` before
  deploying (now a step in `deploy-check`). When building HTML inside double-quoted JS strings, keep CSS
  attributes single-quoted and never let an unescaped `"` appear inside. Related: [[the onclick
  quote-doubling entry above]].

<!-- Add new entries above this line, newest first, using the format at the top. -->
