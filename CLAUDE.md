# Salesstripe Brain — Project Context

## What this is

A single-file B2B outbound agency management tool. One HTML file (index.html) deployed on Vercel, connected to GitHub for version control.

## Stack

- index.html — entire app, single file, no framework

- api/lemlist.js — Vercel serverless function proxying Lemlist API (fixes CORS)

- vercel.json — routes /api/* to serverless functions, everything else to index.html

- Storage: localStorage, key ss-v6

- Lemlist API key: d704fee750fc91bf88a581be96392151

## Rules — never break these

- Never rewrite the whole file. Make surgical edits only.

- Always keep a working version before adding anything new

- Never touch vercel.json routes unless specifically asked

- Never add Supabase — not yet

- Single HTML file only — no build tools, no npm, no frameworks

## What's built

- Home screen with workspaces and folders

- Tab 1: Discovery & menu (ICP strategy table)

- Tab 2: Campaigns (campaign management)

- Tab 3: Strategy map (flow canvas)

- Tab 4: Reporting (live Lemlist data via proxy)

## What's next

- LLM-powered report builder in reporting tab

- Funnel charts from Lemlist activity data

- Supabase integration (later)
