# Claude Code Instruction Set: vercel-add-page

This is an automation workflow for adding articles to a Vercel Field Guide study site at `/Users/mark/personal/vercel-field-guide`.

## Overview

The task involves writing one technical magazine-style article explaining a Vercel product to an engineer audience — focusing on how it works, not configuration steps.

## Four-Step Process

**Step 1: Identify the next article**
- Check `index.html` for nav links marked `coming-soon`
- Verify which `.md` files exist in `content/`
- Select one product (prefer core platform products first)
- Stop if all articles are complete

**Step 2: Research the product**
- Fetch markdown docs from `https://vercel.com/docs/{slug}.md` (adding .md to the docs URL returns the raw markdown)
- Common URL patterns:
  - `https://vercel.com/docs/deployments.md`
  - `https://vercel.com/docs/deployments/preview-deployments.md`
  - `https://vercel.com/docs/git.md`
  - `https://vercel.com/docs/cli.md`
  - `https://vercel.com/docs/projects/domains.md`
  - `https://vercel.com/docs/functions.md`
  - `https://vercel.com/docs/functions/edge-functions.md`
  - `https://vercel.com/docs/fluid-compute.md`
  - `https://vercel.com/docs/frameworks/nextjs.md`
  - `https://vercel.com/docs/frameworks.md`
  - `https://vercel.com/docs/cdn.md`
  - `https://vercel.com/docs/image-optimization.md`
  - `https://vercel.com/docs/incremental-static-regeneration.md`
  - `https://vercel.com/docs/caching.md`
  - `https://vercel.com/docs/storage/vercel-blob.md`
  - `https://vercel.com/docs/storage/vercel-kv.md`
  - `https://vercel.com/docs/storage/vercel-postgres.md`
  - `https://vercel.com/docs/ai.md`
  - `https://vercel.com/docs/ai/ai-gateway.md`
  - `https://vercel.com/docs/v0.md`
  - `https://vercel.com/docs/security/vercel-waf.md`
  - `https://vercel.com/docs/security/ddos-mitigation.md`
  - `https://vercel.com/docs/security/bot-protection.md`
  - `https://vercel.com/docs/analytics.md`
  - `https://vercel.com/docs/speed-insights.md`
  - `https://vercel.com/docs/observability/runtime-logs.md`
  - `https://vercel.com/docs/workflow-collaboration/vercel-toolbar.md`
  - `https://vercel.com/docs/workflow-collaboration/feature-flags.md`
  - `https://vercel.com/docs/monorepos.md`
- Review 1–2 related sub-pages for technical details
- Gather information on: function, technical model, pricing, integrations, design tradeoffs

**Step 3: Write the article**
- Save to `content/{slug}.md`
- Structure: Opening lede → "How It Works" section → "In the Wild" use cases → optional "What It Doesn't Do" → "Further Reading"
- Style: Magazine prose (varied sentence length, bold key concepts), no bullet lists except in "In the Wild," 600–900 words
- End with italic link to next logical article
- Tone: concrete over abstract, technical depth for engineers, honest about limitations

**Step 4: Update the site**
- Remove `coming-soon` class from the corresponding nav link in `index.html`
- No other changes needed — routes are already defined in `app.js`

## Deliverable

Report the product name, file path, and one sentence on its significance.
