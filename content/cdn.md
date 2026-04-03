# CDN: The Network That Knows Your Code

Every web host eventually bolts on a CDN. You configure your origin, set up cache rules, whitelist some headers, and hope the documentation is current. Vercel took a different approach: instead of treating the CDN as a layer on top of the platform, they made it the platform. When you deploy to Vercel, you're not pushing code to a server that sits behind a cache — you're deploying directly into the edge network itself.

That distinction is more than architectural pride. It changes what the CDN can do. A traditional CDN knows nothing about your application until it sees the first response. Vercel's CDN reads your framework configuration at build time, before any request arrives. It knows which routes are static, which use ISR, which need authentication, where to find your serverless functions. The cache isn't configured by you after the fact — it's an output of the build process.

The result is a network that behaves like infrastructure but thinks like a framework. Push to git, and within seconds, 126 Points of Presence across 51 countries know exactly how to handle every route in your application.

## How It Works

Every request to a Vercel deployment enters through the nearest **Point of Presence (PoP)**. Vercel operates 126 of these globally, routing traffic over a private, low-latency backbone rather than the public internet. The PoP hands off to one of 20+ **compute-capable regions** — data center clusters that can run your serverless functions and maintain durable storage close to your data.

Before checking any cache, the CDN evaluates **routing rules**: redirects, rewrites, and header modifications. A redirect returns a new URL immediately. A rewrite maps a public path to a different backend — including external origins via reverse proxy — transparently. Only after routing does the CDN check its cache.

What makes the cache smart is that it's **framework-aware**. When you deploy a Next.js app, Vercel reads your `next.config.js`, your `revalidate` exports, your middleware — and configures the CDN accordingly. Static pages get aggressive caching. ISR pages get stale-while-revalidate semantics with automatic background regeneration. Dynamic routes skip the cache entirely. None of this requires you to write a single `Cache-Control` header.

For cases where you want manual control, **Cache-Control headers** work exactly as you'd expect. You can also use **external rewrites** to proxy and cache responses from backends you don't own — a headless CMS, a third-party API, a legacy service — letting Vercel's edge network absorb the traffic before it ever reaches your origin.

**Request collapsing** is another CDN-layer feature that pays off during traffic spikes. When hundreds of visitors simultaneously request the same uncached page, Vercel collapses those into a single invocation of your function or a single revalidation request to your ISR cache. One backend call, hundreds of responses served.

Security is handled at the same layer. Every deployment gets automatic HTTPS with provisioned SSL certificates, TLS 1.2 and 1.3 support, and always-on DDoS mitigation — unmetered, on every plan. A WAF with custom rules sits on top if you need it. None of this is configured separately; it comes with the deployment.

The **git-scoped deployment model** extends to CDN configuration. Every branch gets its own preview URL, which means every change to routing rules, caching policies, or rewrite logic is testable before it reaches production. Vercel doesn't just version your code — it versions your network configuration.

## In the Wild

- **Marketing sites and landing pages**: Pre-rendered HTML served from the CDN with no function invocations. Sub-10ms response times globally.
- **E-commerce product catalogs**: ISR caches product pages at the edge, regenerating in the background when inventory or pricing changes — no full rebuild required.
- **Headless CMS setups**: Editors publish content, an on-demand revalidation webhook fires, and updated pages propagate to all CDN regions within 300ms. No deployment needed.
- **SaaS dashboards with shared assets**: Dynamic authenticated routes hit serverless functions while shared CSS, fonts, and JS bundles stay permanently cached at the edge.
- **Reverse-proxying legacy backends**: External rewrites let Vercel cache responses from an existing API or CMS, reducing origin load and improving response times without migrating anything.

## What It Doesn't Do

Vercel's CDN is optimized for web applications, not arbitrary TCP/UDP traffic — it won't replace a traditional CDN for video streaming or large file delivery at scale (that's what Vercel Blob's separate distribution network is for). Cache invalidation for `Cache-Control`-based routes is per-region, not atomic across all regions simultaneously — only ISR routes get the globally-consistent 300ms purge guarantee. And while external rewrites let you proxy almost anything, you're limited to HTTP — WebSocket proxying through the CDN isn't a first-class feature.

## Further Reading

- [Vercel CDN overview](https://vercel.com/docs/cdn) — official documentation with architecture diagrams
- [How a request flows through the CDN](https://vercel.com/docs/how-vercel-cdn-works) — step-by-step request lifecycle
- [Regions and PoP locations](https://vercel.com/docs/regions) — full list of 126 PoPs and 20+ compute regions
- [Cache-Control headers on Vercel](https://vercel.com/docs/caching/cache-control-headers) — manual caching control when framework defaults aren't enough
- [External rewrites and reverse proxy](https://vercel.com/docs/routing/rewrites#external-rewrites) — proxy and cache external backends
- [CDN pricing and usage](https://vercel.com/docs/manage-cdn-usage) — Fast Data Transfer, Fast Origin Transfer, and CDN Requests explained

*Next: [Image Optimization](#/image-optimization) — automatic image resizing and format conversion.*
