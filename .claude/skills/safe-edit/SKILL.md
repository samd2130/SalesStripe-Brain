---
name: safe-edit
description: Load BEFORE editing index.html (or any app file) in Salesstripe Brain. Enforces the project's non-negotiable rules — surgical edits only, back up the working version first, never rewrite the whole file, never touch vercel.json, no build tools/frameworks/Supabase. Use whenever asked to change, fix, add to, or refactor the app.
---

# safe-edit — guardrails for changing Salesstripe Brain

Salesstripe Brain is a **single-file vanilla-JS app** (`index.html`) with a long history of edits
breaking a working build. Follow this checklist for **every** change. See [spec.md](../../../spec.md)
for how the app works and [memory.md](../../../memory.md) for known landmines.

## Before you edit
1. **Read [memory.md](../../../memory.md)** — check the change isn't re-triggering a known bug.
2. **Back up the working file.** Copy `index.html` to a timestamped backup so you can restore instantly:
   - PowerShell: `Copy-Item index.html "index.html.bak-$(Get-Date -Format yyyyMMdd-HHmmss)"`
   - (Backups are local safety copies — don't commit them.)
3. **Confirm scope is surgical.** You should be making a small, targeted `Edit`, not a rewrite.

## Hard rules — never break these
- **Never rewrite the whole file.** Use `Edit` with a tight `old_string`/`new_string`. If you feel the
  urge to regenerate `index.html`, stop and make a smaller edit instead.
- **Never touch `vercel.json`** unless the user explicitly asks.
- **Never add `@vercel/node` runtime** anywhere — it has broken deployment before (memory.md #1).
- **Single HTML file only** — no npm, no build step, no frameworks, no bundler.
- **No Supabase yet.**
- **No secrets in `index.html`** — keep the Lemlist key in the Vercel env var.

## While editing
- **Reuse existing helpers** instead of inventing new ones: `uid()`, `esc()`, `saveHome()`,
  `getCurrentWs()`, `renderTable()`, `pStyle()`, `getCell()`. (Search `index.html` to confirm signatures.)
- **Match the surrounding style** — the file uses `var`, compact one-liners, and string-built DOM.
- **Persist + re-render** after state changes: call `saveHome()` then the relevant `render*()`.
- When building inline handlers as strings, use **one** quote style per attribute and avoid manual
  `\'` escaping — that's the source of the `''>` bug in memory.md.

## After editing
1. Open `index.html` in a browser and confirm the change works with **no console errors**.
2. If anything broke and you can't fix it quickly, **restore the backup** and try a smaller edit.
3. If you fixed or discovered a bug, run the **`log-issue`** skill to record it in `memory.md`.
4. Before pushing/deploying, run **`deploy-check`**.
