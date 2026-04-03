# Edge Functions: Compute at the Speed of the Network

Most compute is regional. You pick a datacenter — Virginia, Frankfurt, Tokyo — and your code runs there. Requests from the other side of the world wait for the round trip. For most workloads this is an acceptable tradeoff. For others, that latency is the product. Edge Functions exist for the latter case: logic that needs to execute as physically close to the user as possible, on every request, before anything is served from cache.

The pitch is straightforward. Instead of one region, your function runs across Vercel's entire global CDN network. A request from Sydney hits a Sydney edge node. A request from São Paulo hits a São Paulo edge node. The function executes, then either returns a response or forwards the request onward. The total overhead is measured in single-digit milliseconds. At that speed, the compute stops being a bottleneck and starts being invisible.

Edge Functions power Vercel's Middleware system — the code that runs before every request, deciding what to serve and to whom. They're also available as standalone request handlers for workloads that genuinely need to be everywhere at once. But they come with real constraints that matter for architectural decisions. Understanding when to reach for Edge Functions — and when to use regular Node.js Functions instead — is one of the more important choices in a Vercel deployment.

## How It Works

Edge Functions run in **V8 isolates**, not containers or virtual machines. A V8 isolate is the same execution environment as a browser tab: a lightweight JavaScript context that starts up in microseconds rather than the hundreds of milliseconds a container requires. There's no operating system to boot, no network stack to initialize. The isolate starts, your code runs, the isolate is discarded. Cold starts are effectively zero.

The execution environment is built on the **V8 engine** and exposes the Web Platform APIs: `fetch`, `Request`, `Response`, `Headers`, the Streams API, the Crypto API, `TextEncoder`, `TextDecoder`. Standard ES modules work normally. What's missing is almost everything Node.js-specific: no `fs` module, no native binaries, no `require()`, no dynamic `eval`. The runtime enforces these restrictions deliberately — isolates need to be lightweight to start instantly, and native I/O would break that guarantee.

**Code size limits** enforce the lightweight constraint. Hobby plans allow 1 MB after gzip compression, Pro plans 2 MB, Enterprise 4 MB. This includes your JavaScript, imported libraries, fonts, and bundled assets. Packages with heavy Node.js dependencies either won't work at all or will push you over the limit.

By default, an Edge Function runs in the **region closest to the incoming request** — Vercel automatically picks from its global CDN nodes. You can constrain this with `preferredRegion` or `regions` configuration when the function needs to be near a specific data source rather than the user. There's also automatic failover: if the nearest region is unavailable, Vercel reroutes to the next closest.

The **maximum initial response time** is 25 seconds. After that, streaming can continue for up to 300 seconds. This is more than enough for the tasks Edge Functions are designed for — request inspection, header manipulation, A/B routing, geolocation logic — which typically complete in single-digit milliseconds.

One important note: Vercel now recommends **migrating from Edge Runtime to Node.js** for most workloads. With Fluid Compute, Node.js Functions have closed much of the cold-start gap that originally motivated Edge Runtime adoption, while offering the full Node.js API surface and better library compatibility. Edge Runtime remains the right choice when you specifically need zero-latency global execution — primarily for Middleware.

## In the Wild

- **Geolocation-based routing**: Detect a request's country from headers and rewrite the URL to a localized version of the site — all before any content is served from cache.
- **A/B testing without client flicker**: Assign users to experiment buckets at the edge, rewrite the request to the appropriate variant, and set a cookie — no JavaScript required on the client side.
- **Authentication checks on every request**: Verify a JWT or session cookie before forwarding the request to protected routes, redirecting unauthenticated users before the page function even runs.
- **Bot filtering and header injection**: Inspect the User-Agent and request headers, block known bad actors, inject custom headers for downstream services.
- **Dynamic redirects from a database**: Fetch redirect rules from a low-latency KV store at the edge, then redirect the user instantly — without a round trip to an origin server.

## What It Doesn't Do

Edge Functions cannot use most of the Node.js ecosystem. Libraries that depend on `fs`, native addons, or any Node-specific API will either error at build time or at runtime. The 2 MB code size limit on Pro plans rules out libraries like `aws-sdk`, large ORM packages, or anything that bundles substantial dependencies. Dynamic code execution — `eval`, `new Function()`, dynamically compiled WebAssembly — is disabled for security reasons. If your function needs to query a traditional relational database using a TCP connection pool, it won't work in the Edge Runtime; use Node.js instead.

## Further Reading

- [Edge Runtime documentation](https://vercel.com/docs/functions/runtimes/edge)
- [Vercel Middleware](https://vercel.com/docs/routing-middleware)
- [Supported Web APIs in Edge Runtime](https://vercel.com/docs/functions/runtimes/edge#edge-runtime-supported-apis)
- [Regions and global deployment](https://vercel.com/docs/regions)
- [Fluid Compute — the Node.js alternative](https://vercel.com/docs/fluid-compute)
- [Streaming with Edge Functions](https://vercel.com/docs/functions/streaming-functions)

*Next: [Fluid Compute](#/fluid-compute) — the evolution beyond cold-start serverless.*
