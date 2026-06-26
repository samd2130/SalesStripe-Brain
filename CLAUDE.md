# Salesstripe Brain — Project Context

## What this is
A single-file B2B outbound agency management tool. One HTML file (index.html) deployed on Vercel, connected to GitHub for version control.

## Stack
- index.html — entire app, single file, no framework
- api/lemlist.js — Vercel serverless function proxying Lemlist API (fixes CORS)
- vercel.json — routes /api/* to serverless functions, everything else to index.html
- Storage: localStorage, key ss-v6
- Lemlist API key: stored only in the Vercel env var `LEMLIST_API_KEY` (used by api/lemlist.js). Never hardcode it in the client or this file. If it ever leaks, rotate it in Lemlist.

## Rules — never break these
- Never rewrite the whole file. Make surgical edits only.
- Always keep a working version before adding anything new
- Never touch vercel.json unless specifically asked
- Never add Supabase yet
- Single HTML file only — no build tools, no npm, no frameworks
- Never add @vercel/node runtime to vercel.json — it breaks deployment

## What's built
- Home screen with workspaces and folders
- Tab 1: Discovery & menu (ICP strategy table)
- Tab 2: Campaigns
- Tab 3: Strategy map
- Tab 4: Reporting — live Lemlist data via proxy at api/lemlist.js

## What's next
- LLM report builder in reporting tab
- Security — move API key to Vercel environment variables
- Supabase (later)
