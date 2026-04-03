# ISR: Static Pages That Update Themselves

The old tradeoff in web architecture went like this: you could have a fast static site or you could have fresh dynamic content, but not both at the same time. Static sites were blazing fast — pre-rendered HTML served from a CDN — but stale by definition. Dynamic sites were always current but paid for it in server latency, database load, and unpredictable scaling costs. For a long time, the only way to get the benefits of both was to build two separate systems and cobble them together.

Incremental Static Regeneration is Vercel and Next.js's answer to that tradeoff. The core idea is elegant: serve the cached static version of a page to every visitor while simultaneously regenerating a fresh version in the background. The visitor gets sub-millisecond CDN response times. The page gets updated without anyone sitting through a build. The only cost is that the very first visitor after content changes sees a version that's slightly stale — which, for most content on the internet, is perfectly acceptable.

The concept has spread. SvelteKit, Nuxt, Astro, and Gatsby all have their own ISR implementations now. But Vercel's platform gives it infrastructure features that framework-level ISR alone can't provide: durable cache storage that survives deployments, global propagation within 300 milliseconds, request collapsing that absorbs traffic spikes, and on-demand revalidation that can be triggered by a CMS webhook.

## How It Works

ISR is built on the **stale-while-revalidate** HTTP caching pattern, applied at the page level rather than just the asset level. When a visitor requests an ISR route, the CDN checks whether a cached version exists. If it does, that version is served immediately — no function invocation, no database query, just a CDN hit. Behind the scenes, if the cached version has aged past its revalidation interval, Vercel kicks off a background regeneration: a serverless function runs, fetches fresh data, renders the new HTML, and stores the result.

The next visitor gets the updated version. The current visitor gets the fast cached response. No one waits.

**At build time**, your framework code declares which routes are ISR-enabled — in Next.js App Router, by exporting a `revalidate` constant from a route segment; in the Pages Router, by returning a `revalidate` value from `getStaticProps`. Vercel reads this configuration during the build and distributes route metadata to every CDN region. Before the first request ever arrives, every PoP in the network already knows which paths are cacheable and with what TTL.

This pre-deployment knowledge is what separates ISR from basic `Cache-Control` header caching. With `Cache-Control`, the CDN learns a route is cacheable only after receiving the first response. With ISR, the CDN knows in advance — and that enables several things that aren't otherwise possible: **request collapsing** (multiple simultaneous requests to the same uncached path get collapsed into one function invocation), **globally consistent purges** (when you revalidate, all CDN regions update within 300ms, atomically including HTML and data payloads), and **instant rollbacks** (cached pages persist across deployments, so rolling back to a previous version doesn't cold-start your ISR cache).

**The durable ISR cache** sits in your project's function region — the same region where your serverless functions run. When a CDN region gets a miss, it doesn't immediately invoke your function. It first checks the durable ISR cache. If the content is there (even if stale), it serves it and schedules a background regeneration. Your function only runs when content genuinely needs to be produced for the first time or refreshed.

**On-demand revalidation** breaks the time-based model when you need it. Instead of waiting for a TTL to expire, you can call Vercel's revalidation API — from a CMS webhook, a deployment script, an admin interface — to immediately mark specific paths or cache **tags** as stale. The next request to those paths triggers regeneration. This is how large publishing platforms make ISR practical: content editors hit publish, a webhook fires, the relevant pages are marked stale, and visitors see fresh content within seconds — without a deploy.

**Failure handling** is conservative. If a background revalidation fails — due to a network timeout, a function error, or a non-200 response from your backend — Vercel keeps serving the existing stale content and retries after 30 seconds. Content is never replaced with an error page.

## In the Wild

- **E-commerce product pages**: A catalog of 500,000 products can't be rebuilt on every price change. ISR pre-renders popular pages, revalidates on a schedule, and handles tail-traffic pages on first request.
- **News and publishing platforms**: Articles are rendered statically on first publish, and breaking-news pages can be revalidated on demand when editors update the story.
- **Event and conference sites**: Schedule pages update as session details change. A `revalidate` of 60 seconds means the schedule is never more than a minute stale without any manual intervention.
- **Documentation sites with API data**: Reference docs that embed live examples or version information can use ISR to stay current without rebuilding 10,000 pages on every deploy.
- **SaaS marketing and pricing pages**: Pricing tiers, feature comparisons, and testimonials can be managed through a CMS and pushed live via on-demand revalidation — no engineer involvement required.

## What It Doesn't Do

ISR is not real-time. If you need a page to reflect data as it changes — a live dashboard, a sports scoreboard, a stock ticker — ISR is the wrong tool. The stale window is intentional; real-time content belongs in client-side fetching or streaming server components. ISR also only applies to the domain and deployment where revalidation is triggered — subdomains and preview deployments are not automatically updated. And while ISR durable storage persists across deployments, the ISR cache lives in a single function region, which means the first request from distant CDN regions still involves a round-trip to that region before the cached content replicates outward.

## Further Reading

- [ISR overview](https://vercel.com/docs/incremental-static-regeneration) — full documentation including quickstart and framework-specific guides
- [On-demand revalidation](https://vercel.com/docs/incremental-static-regeneration/quickstart#on-demand-revalidation) — triggering revalidation from CMS webhooks and external systems
- [Request collapsing](https://vercel.com/docs/incremental-static-regeneration/request-collapsing) — how Vercel protects your origin from thundering herd problems
- [ISR limits and pricing](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing) — ISR writes, reads, function invocations, and region pricing
- [Next.js revalidation documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating) — the App Router API for time-based and on-demand revalidation
- [Runtime Cache](https://vercel.com/docs/caching/runtime-cache) — caching individual fetch calls and data queries inside ISR functions

*Next: [Caching](#/caching) — the three tiers that determine your app's performance.*
