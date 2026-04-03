# Caching: Three Layers Between Your Visitor and Your Backend

When a request arrives at a Vercel deployment, your application code is usually the last thing to run — and often doesn't run at all. Between the visitor and your functions sit several caching layers, each one capable of returning a response on its own. Understanding which layer handles which request, and why, is the difference between an app that scales effortlessly and one that hammers its database on every page load.

The architecture isn't accidental complexity. Each layer exists because different kinds of content have different freshness requirements and different costs. A shared JavaScript bundle can be cached for a year. A product page can be cached for a minute. A user's shopping cart can't be cached at all. Vercel's caching system lets you express each of those requirements precisely, and handles the coordination — across regions, across deployments, across request types — automatically.

There are three primary tiers, checked in order on every request: the CDN cache, the ISR cache, and the runtime cache. A fourth layer, the image cache, handles optimized image variants separately. A miss at each layer falls through to the next, with your function as the final backstop.

## How It Works

The **CDN cache** is the outermost layer. It lives in Vercel's 126+ Points of Presence worldwide. When a visitor makes a request, the nearest PoP checks its regional cache. On a hit, the response is returned immediately — no round trip to any backend, no function invocation. This is the fastest possible response, measured in single-digit milliseconds. You control CDN caching through `Cache-Control` headers (set manually or automatically by your framework) or by using ISR.

The important distinction: with `Cache-Control` headers, the CDN learns a route is cacheable only after the first response. With ISR, the CDN knows routes are cacheable from the moment of deployment. That pre-deployment knowledge is what enables ISR's advanced features — globally consistent purges, request collapsing, durable storage — which aren't available for header-based caching.

The **ISR cache** sits one layer deeper, in durable storage within your project's function region. It's checked when the CDN cache misses. Unlike the CDN cache, which is regional and ephemeral, the ISR cache is persistent — it survives deployments, survives rollbacks, and is shared across CDN regions as the authoritative source of pre-rendered content. When a CDN region gets a miss, it checks the ISR store before ever invoking your function. If the ISR cache has the content (even stale content), it's served immediately while a background regeneration is queued.

**Revalidation** in the ISR cache follows two paths. Time-based revalidation triggers automatically after your configured interval. On-demand revalidation is triggered by an API call — a CMS webhook, a script, a button press in an admin interface. Both paths execute in the background: visitors always get a response from cache while the new content is being generated. When revalidation completes, the updated content propagates to all CDN regions within 300 milliseconds.

The **runtime cache** (also called the data cache or fetch cache) operates inside your serverless functions. It caches the results of individual data fetches — API calls, database queries, computed values — rather than full page responses. In Next.js, it's activated by using `fetch` with `force-cache`, or by using the `unstable_cache` / `cacheTag` API directly. The function region stores these results and reuses them across invocations.

This layer matters most when you have expensive data fetches shared across many routes. Without a runtime cache, every function invocation that needs the same data makes the same database query. With it, the first invocation pays the cost, and subsequent invocations get the cached result. You can apply tags to cached data and invalidate by tag — so when a product is updated, you can purge exactly the cache entries that depend on that product, not the entire cache.

The **image cache** is separate from all three layers. It stores transformed image variants — resized, format-converted — after the image optimization pipeline runs. Cache keys include the source URL, the target width, the quality setting, and the browser's `Accept` header, so WebP and AVIF variants of the same image are stored separately. Image cache entries live for up to 31 days and are not invalidated by redeployment.

**Request collapsing** is a cross-cutting feature that applies at the CDN and ISR layers. When many simultaneous requests hit the same uncached route, Vercel collapses them into a single backend invocation and fans the response out to all waiting requests. This prevents the thundering herd problem — the traffic spike that would otherwise occur when a high-traffic page's cache expires at midnight and every visitor triggers a separate function invocation.

## In the Wild

- **Static marketing pages**: Long-lived CDN cache, `Cache-Control: max-age=31536000, immutable` for hashed assets. The CDN never misses; functions never run.
- **ISR product catalog**: CDN cache for fast delivery, ISR durable store for persistence across deployments, on-demand revalidation when prices change in the CMS.
- **Personalized dashboards**: Dynamic routes bypass the CDN cache (authenticated, user-specific). The runtime cache stores shared API responses — market data, feature flags, config — that are the same for all users.
- **Search results**: CDN caches common queries for seconds; the runtime cache stores the underlying data fetches for minutes; the function runs only for novel queries.
- **High-traffic news articles**: ISR serves cached HTML to millions of readers from the CDN while a single background function regenerates the page when the editor publishes an update.

## What It Doesn't Do

No caching layer on Vercel is a substitute for private, user-specific data — authenticated responses should not be put in the CDN cache or ISR store. Cache invalidation for `Cache-Control`-based routes happens per region as new responses are served, not globally and instantly the way ISR purges work. The runtime cache lives per function region, not globally distributed, so it doesn't benefit requests that route to different regions. And none of these layers store session state or mutable application data — that's the job of a dedicated store like KV or Postgres.

## Further Reading

- [Caching overview](https://vercel.com/docs/caching) — official documentation with request flow diagrams
- [CDN cache](https://vercel.com/docs/caching/cdn-cache) — regional response caching and Cache-Control header behavior
- [Runtime cache](https://vercel.com/docs/caching/runtime-cache) — caching fetch results and database queries inside functions
- [Cache-Control headers](https://vercel.com/docs/caching/cache-control-headers) — the full header reference for controlling CDN behavior
- [ISR](https://vercel.com/docs/incremental-static-regeneration) — the durable ISR cache layer and how revalidation works
- [Purging CDN cache](https://vercel.com/docs/caching/cdn-cache/purge) — manual and programmatic cache invalidation

*Next: [Blob](#/blob) — file and object storage on Vercel.*
