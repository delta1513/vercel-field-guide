# Vercel Field Guide

Vercel started as a hosting platform for Next.js — a way to deploy frontend applications with zero configuration. A few years later it's become something broader: a frontend cloud that handles deployment, compute, storage, security, and AI infrastructure, all optimized for the developer experience.

The unifying thread is the workflow. Push to git, get a production deployment. Open a pull request, get a preview URL. Every feature Vercel has added — serverless functions, edge compute, managed databases, AI tools — slots into that same git-centered loop. The infrastructure is invisible; the developer sees URLs, not servers.

This guide is a plain-language tour. Not how to configure anything, but what each product actually *is*, how it works under the hood, and what people build with it.

---

## Core Platform

The foundation: how code goes from a git repository to a live URL, and the tools around that workflow.

- [**Deployments**](#/deployments) — Push to git, get a production URL. Atomic, immutable, instant rollback. The core primitive everything else builds on. *(coming soon)*
- [**Preview Deployments**](#/preview-deployments) — Every pull request gets its own URL. Share it, test it, comment on it. The feature that made Vercel famous. *(coming soon)*
- [**Git Integration**](#/git-integration) — GitHub, GitLab, Bitbucket, Azure DevOps. Vercel watches your repo and deploys on every push. *(coming soon)*
- [**CLI**](#/cli) — `vercel` on the command line. Deploy from your terminal, pull environment variables, run a local dev server. *(coming soon)*
- [**Domains**](#/domains) — Custom domains with automatic HTTPS, DNS management, and wildcard support. *(coming soon)*

## Compute

The execution layer. Your server-side code runs here — API routes, server-rendered pages, middleware.

- [**Functions**](#/functions) — Serverless API routes in Node.js, Python, Go, or Ruby. Scale to zero, scale to millions. *(coming soon)*
- [**Edge Functions**](#/edge-functions) — Lightweight functions that run at the CDN edge in V8 isolates. Sub-millisecond cold starts, global by default. *(coming soon)*
- [**Fluid Compute**](#/fluid-compute) — Vercel's hybrid model: serverless flexibility with server-like efficiency. Shared instances, in-function concurrency, reduced cold starts. *(coming soon)*

## Frameworks

Vercel supports 30+ frameworks out of the box. Two deserve their own articles.

- [**Next.js**](#/nextjs) — The React framework Vercel created and maintains. First-class support means automatic optimization of every Next.js feature. *(coming soon)*
- [**Framework Support**](#/framework-support) — Astro, SvelteKit, Nuxt, Remix, Vite, and dozens more. Zero-config deploys for each. *(coming soon)*

## CDN & Performance

How Vercel delivers content fast — caching, optimization, and the edge network that powers it all.

- [**CDN**](#/cdn) — A global edge network integrated into the deployment model. Not bolted on — built in. *(coming soon)*
- [**Image Optimization**](#/image-optimization) — Automatic resizing, format conversion, and lazy loading. Serve WebP to browsers that support it, AVIF where possible. *(coming soon)*
- [**ISR**](#/isr) — Incremental Static Regeneration. Build pages at deploy time, then update them in the background without a full rebuild. A concept Vercel pioneered. *(coming soon)*
- [**Caching**](#/caching) — Three tiers: CDN cache, runtime cache, and data cache. How they interact determines your app's performance. *(coming soon)*

## Storage

Managed data services integrated into the Vercel dashboard and environment variables.

- [**Blob**](#/blob) — File and object storage. Upload images, PDFs, assets — get back a URL. *(coming soon)*
- [**KV**](#/kv) — A Redis-compatible key-value store powered by Upstash. Fast reads, global replication, familiar API. *(coming soon)*
- [**Postgres**](#/postgres) — Serverless PostgreSQL powered by Neon. SQL from your serverless functions with connection pooling built in. *(coming soon)*

## AI

Vercel has moved aggressively into AI developer tooling — SDKs, gateways, and a product that generates UI from prompts.

- [**AI SDK**](#/ai-sdk) — An open-source TypeScript toolkit for building AI applications. Streaming, structured output, tool calling, framework-agnostic. *(coming soon)*
- [**AI Gateway**](#/ai-gateway) — A unified API that routes to 200+ AI models from multiple providers. Caching, rate limiting, automatic failover. *(coming soon)*
- [**v0**](#/v0) — Describe a UI in words, get production-ready React code back. Powered by AI, built on shadcn/ui components. *(coming soon)*

## Security

Protection at the edge — firewall rules, DDoS mitigation, and bot management built into the platform.

- [**WAF**](#/waf) — Web Application Firewall with managed rulesets, custom rules, and IP blocking. *(coming soon)*
- [**DDoS Protection**](#/ddos) — Automatic, always-on, unmetered on all plans. Absorbs attacks at the edge before they reach your functions. *(coming soon)*
- [**Bot Management**](#/bot-management) — Detect and filter automated traffic. Control which bots access your site, including AI crawlers. *(coming soon)*

## Observability

See what's happening — performance metrics, error tracking, and logs.

- [**Web Analytics**](#/web-analytics) — Privacy-friendly analytics with no cookies. Page views, visitors, referrers — GDPR-compliant by default. *(coming soon)*
- [**Speed Insights**](#/speed-insights) — Real Core Web Vitals from actual users. Not synthetic lab data — real field measurements. *(coming soon)*
- [**Logs**](#/logs) — Build logs, function logs, and log drains to external services. See what your code did and when. *(coming soon)*

## Developer Experience

Tools that make the development workflow faster and more collaborative.

- [**Toolbar**](#/toolbar) — An in-browser overlay on preview deployments. Leave comments, toggle feature flags, inspect performance — without leaving the page. *(coming soon)*
- [**Feature Flags**](#/feature-flags) — Runtime feature toggles evaluated at the edge. No latency cost, visual management in the toolbar, framework integration. *(coming soon)*
- [**Monorepos**](#/monorepos) — First-class support for Turborepo and other monorepo tools. Automatic dependency detection, per-package builds, shared configuration. *(coming soon)*

---

Start with [Deployments](#/deployments) — it's the foundation everything else builds on.
