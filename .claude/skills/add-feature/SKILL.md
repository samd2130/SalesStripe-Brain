---
name: add-feature
description: Playbook for adding a new feature to Salesstripe Brain's single-file app safely. Use when asked to add a tab, column type, button, modal, report, or any new capability to index.html. Walks through locating the right section, reusing existing helpers, making a minimal edit, and testing locally.
---

# add-feature — safely add capability to Salesstripe Brain

Use this when building something new in `index.html`. It builds on **`safe-edit`** (the hard rules) and
keeps additions consistent with the existing patterns.

## 1. Orient
- Read [spec.md](../../../spec.md) — understand the data model and which tab/feature you're touching.
- Read [memory.md](../../../memory.md) — avoid known traps.
- **Apply the `safe-edit` rules now** (back up `index.html`, surgical edits only, no vercel.json,
  no `@vercel/node`, single file, no npm/frameworks/Supabase).

## 2. Locate the right section
The file is ordered: CSS (`<style>`) → HTML markup → `<script>` (state vars → helpers → render/handlers).
Find the nearest existing feature and mirror it:
- **Table column/cell behaviour** → `renderTable()`, `commitInput()`, `openColModal()`.
- **A new modal** → copy an existing `.modal-bg` block in the HTML + `openModal()/closeModal()`.
- **Home/workspace logic** → `renderHome()`, `createWorkspace()`, `getCurrentWs()`.
- **Strategy map** → `renderT3()`, `openFlowSetup()`.
- **Reporting / Lemlist** → `loadLemlistReport()`, and the proxy at `api/lemlist.js`.

## 3. Reuse, don't reinvent
Prefer these existing helpers (confirm signatures in `index.html`):
- `uid()` — unique ids for rows/cols/flows.
- `esc()` — **always** escape user values before putting them in HTML strings.
- `getCurrentWs()` / `getWs(id)` / `getCell(row, colId)` — read state.
- `saveHome()` — persist to localStorage (`ss-v6`). Call after **every** mutation.
- `renderTable(1|2)`, `renderHome()`, `renderT3()` — re-render after changes.
- `pStyle(colour)`, `cBg/cTx/cBd(colour)` — consistent pill/colour styling (palette 1–12).

## 4. Implement (minimal edit)
- Make the smallest `Edit` that adds the feature. Add new functions next to related ones.
- Use `var` and the file's compact style. Build DOM via strings **only with `esc()`** on dynamic values.
- For inline handlers, use one quote style per attribute — no manual `\'` escaping (see memory.md).
- Mutate state → `saveHome()` → re-render.
- If the feature adds persisted fields, update `importData()`'s migration defaults so old backups still load.

## 5. Test locally
- Open `index.html` in a browser. Exercise the new feature **and** the area around it.
- Check the console for errors. Verify data survives a refresh (localStorage) and an export→import round-trip.

## 6. Finish
- Update [spec.md](../../../spec.md) if behaviour or the data model changed.
- If you hit/fixed a bug, run **`log-issue`**.
- Run **`deploy-check`** before pushing.
