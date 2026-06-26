# Salesstripe Brain — Spec

> Single source of truth for what the app is, how it works today, and what's next.
> Keep this updated when behaviour changes. For bugs and their fixes, see [memory.md](memory.md).

## 1. Overview
Salesstripe Brain is an internal tool for running a **B2B outbound agency**. Each client/project lives
in a **workspace**. A workspace holds the ICP strategy, the campaigns built from it, a visual strategy
map, and live Lemlist reporting. Everything is local-first (browser localStorage) with JSON
import/export for backup and sharing.

It is a **single HTML file** with vanilla JavaScript — no framework, no build step.

## 2. Stack & deployment
- **`index.html`** — the entire app (markup, CSS, JS in one file, ~1180 lines).
- **`api/lemlist.js`** — Vercel serverless function that proxies the Lemlist API (fixes CORS, holds the
  API key server-side).
- **`vercel.json`** — routes `/api/*` to serverless functions and everything else to `index.html`.
- **Hosting** — Vercel, connected to GitHub for version control. Push to deploy.
- **Storage** — browser `localStorage`, single key **`ss-v6`**. No backend database (yet).

## 3. Data model
All state lives under the `ss-v6` localStorage key as one JSON object:

```
home = {
  folders:    [ { id, name } ],
  workspaces: [ Workspace ]
}
```

```
Workspace = {
  id, folderId|null, name,
  tabNames: [string x4],        // editable tab labels
  updatedAt,                    // ms timestamp
  t1: { cols: [Col], rows: [Row] },   // Tab 1 — Discovery / ICP
  t2: { cols: [Col], rows: [Row] },   // Tab 2 — Campaigns
  flows: [Flow],                // Tab 3 — Strategy map flows
  nodePositions: {}             // legacy/workspace-level node positions
}
```

```
Col = { id, name, type, colour, t3role, opts? }
  type    = "tag" | "text" | "dropdown"   // tag = pills, dropdown uses opts[]
  colour  = 1..12                          // see CBG/CTX/CBD palettes in index.html
  t3role  = "node" | "filter" | "none"     // how the column appears on the strategy map
  opts    = [string]                       // dropdown options only

Row = { id, cells: { [colId]: [values] } }  // every cell is an array of strings
```

```
Flow = { id, name, nodeCols: [colId], filterCols: [colId], nodePositions: { [nodeKey]: {x,y} } }
  nodeKey = `${flow.id}|${colId}|${value}|${valueIndex}`
```

**Defaults** are defined once and deep-cloned per workspace:
- `DEFAULT_T1_COLS` — [index.html:369](index.html#L369) (ICP, Roles, GEO, Size, Signals, Signal detail,
  Sources, Campaign type, Notes).
- `DEFAULT_T2_COLS` — [index.html:380](index.html#L380) (Campaign name, ICP, Campaign type, Signal,
  Source, Status, launch dates, Leads/Contacted/Reply%/Meeting%, Notes).
- `DEFAULT_TAB_NAMES` — [index.html:395](index.html#L395).
- The four locked Tab 2 columns (mirrored from Tab 1) are listed in `CORE_T2_LOCKED`
  [index.html:368](index.html#L368).

## 4. Features by tab

### Home screen
Folders and workspace cards. Create/rename/delete/duplicate folders and workspaces.
**Export** downloads the full `ss-v6` blob as `salesstripe-YYYY-MM-DD.json`; **Import** replaces all data
(with a confirm) and migrates older formats (string-array columns → object columns). See `exportData` /
`importData` [index.html:442](index.html#L442).

### Tab 1 — Discovery & menu (ICP strategy)
Editable table of ICPs. Cells are tags (comma creates pills, with autocomplete from existing tags),
free text, or dropdowns. Columns can be added, renamed, retyped, recoloured, reordered (drag), deleted,
and assigned a strategy-map role. Adding a Tab 1 column also adds it to Tab 2.

### Tab 2 — Campaigns
Campaigns table. The ICP / Campaign type / Signal / Source columns are **locked** (sourced from Tab 1).
**+ Create campaign** opens a step-wizard (`openCampaignCreator` [index.html:950](index.html#L950)) that
offers only the values valid for the chosen ICP(s), auto-names the campaign, and creates it as `Draft`.
Clicking any pill opens the **performance panel** for that tag.

### Tab 3 — Strategy map
Canvas of flows. **+ Add flow** (`openFlowSetup` [index.html:987](index.html#L987)) lets you pick columns,
set each as Node/Filter/Off, and drag to order (left = parent → right = child). Nodes are values from the
node columns; edges connect consecutive columns. Pan (drag), zoom (scroll), and drag nodes to reposition
(positions persist per flow). Node borders/badges show active (green) vs draft (amber) campaign counts via
`getTagInfo` [index.html:880](index.html#L880).

### Tab 4 — Reporting (live Lemlist)
Loads campaigns and per-campaign lead activity from Lemlist through the proxy, then renders a funnel
summary per campaign. See `loadLemlistReport` [index.html:570](index.html#L570).

## 5. Lemlist integration
- Client calls the proxy: **`/api/lemlist?path=<encoded lemlist path>`**.
- The proxy ([api/lemlist.js](api/lemlist.js)) authenticates with **`process.env.LEMLIST_API_KEY`**
  (Basic auth, key as username) and forwards to `https://api.lemlist.com`. **GET only.**
- Endpoints used today: `/api/campaigns` and `/api/activities?campaignId=...&limit=200`.
- Auth is **server-side only**: there is no API-key field in the UI. The client sends no credentials;
  the proxy attaches Basic auth from `LEMLIST_API_KEY`. (Set this env var in Vercel — Production + Preview.)

## 6. Rules / invariants (never break)
- **Never rewrite the whole file.** Surgical edits only.
- **Always keep a working backup** before adding anything new.
- **Never touch `vercel.json`** unless specifically asked.
- **Never add `@vercel/node` runtime to `vercel.json`** — it has broken deployment before.
- **Single HTML file only** — no build tools, no npm, no frameworks.
- **No Supabase yet.**

(Use the `safe-edit` skill before any change to `index.html`.)

## 7. Roadmap (what's next)
1. **LLM report builder** in the Reporting tab.
2. **Security** — ✅ done in the code (key removed from `index.html` + CLAUDE.md; proxy uses
   `LEMLIST_API_KEY`). ⚠️ **Still required:** rotate the exposed key in Lemlist and update the Vercel env
   var — the old key remains in git history. See [memory.md](memory.md).
3. **Supabase** — cloud persistence (later; not yet).
