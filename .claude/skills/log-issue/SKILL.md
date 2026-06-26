---
name: log-issue
description: Record a bug/issue/fix in memory.md for Salesstripe Brain so it never repeats. Use whenever a bug is discovered, diagnosed, or fixed, when a deploy breaks, or when the user says "remember this issue" / "log this". Appends a structured Symptom → Cause → Fix → Prevention entry.
---

# log-issue — append a bug entry to memory.md

Keeps [memory.md](../../../memory.md) the durable record of what broke and how it was solved.

## When to use
- A bug was found or reproduced.
- A bug was fixed (record it even if the fix was trivial).
- A deploy broke (capture the cause and the recovery).
- The user says "log this", "remember this issue", or "add to memory".

## How to write the entry
1. Open [memory.md](../../../memory.md).
2. Add a new entry **above** the `<!-- Add new entries above this line -->` marker (newest first),
   using the exact format from the top of the file:

```
### [YYYY-MM-DD] Short title
- **Symptom:** what went wrong / how it showed up.
- **Cause:** the root cause (link the file+line, e.g. index.html#L706).
- **Fix:** what resolved it, or "OPEN — not yet fixed".
- **Prevention:** the rule or check that stops it recurring.
```

3. Use today's date. Keep it to a few precise lines — link real files/lines so it's verifiable later.
4. If the root cause is something edits should routinely avoid, also mention it in the relevant skill
   (`safe-edit` / `deploy-check`) so the guardrail catches it next time.

## Guidance
- One entry per distinct issue. If it's a variant of an existing entry, update that entry instead of
  duplicating.
- Be specific about the **Prevention** — that's the part that actually saves future time.
- Don't log transient/environment noise; log things that could plausibly recur.
