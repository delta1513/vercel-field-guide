# Functions: Server-Side Code Without the Server

There's a moment in every web project when you need a backend — a place to query a database, call a third-party API, or handle a form submission without exposing credentials to the browser. Before serverless, that meant provisioning a server, configuring a runtime, managing deployments, and paying for uptime even when traffic was zero. Vercel Functions eliminate all of that. You write a file, you deploy, and Vercel handles the rest.

Functions are the execution layer underneath most of what Vercel does. Server-rendered pages, API routes, authentication handlers, AI streaming endpoints — they all run as Functions. The model is deceptively simple: a request comes in, a function handles it, a response goes out. Everything between those two moments — scaling, routing, cold start mitigation, regional placement — is managed by the platform.

The product has matured considerably since the early days of basic Node.js lambdas. Today, Functions support multiple runtimes, stream responses, handle long-running AI workloads through Fluid Compute, and integrate natively with every major framework Vercel supports. What hasn't changed is the core proposition: write code, not infrastructure.

## How It Works

When a user hits a route that requires server-side execution, Vercel routes the request to a **function invocation** — a running instance of your server code. Each incoming request is, conceptually, a new invocation. But Vercel doesn't spin up a fresh process for every request. If a prior invocation is idle and a new request arrives, Vercel reuses the same instance. This **instance reuse** is the foundation of the Fluid Compute model and is what separates modern Vercel Functions from older single-invocation serverless architectures.

The primary runtime is **Node.js**, executing in Washington D.C. (`iad1`) by default — chosen because it's close to many popular external data sources like databases and third-party APIs. You can override the region through project settings or in code. Python, Go, Ruby, Bun, and Rust are also available, each with their own runtime characteristics. For JavaScript and TypeScript, you write standard Web APIs: `Request`, `Response`, `fetch`. No proprietary wrapper required.

**Cold starts** — the latency penalty when a new instance boots from scratch — are reduced through several mechanisms. **Bytecode caching** stores compiled JavaScript after the first execution, so subsequent cold starts skip recompilation. On production deployments, functions are pre-warmed before they receive traffic. And through Fluid Compute's **in-function concurrency**, multiple requests can share the same running instance simultaneously, which means fewer instances need to boot at all.

Scaling is automatic and bidirectional. Traffic spikes? More instances come online. Traffic drops to zero? Instances are released. You're billed for **active CPU time** — the time your code is actually computing — not wall-clock time. Idle wait time while a function is blocked on a database query or API call doesn't count against you.

Functions run in a single region by default. For workloads that need to be physically close to globally distributed users, you can configure **multi-region execution** — available on Pro (up to three regions) and Enterprise (all regions). The key principle: functions should run near their data source, not necessarily near the user. Placing a function in Tokyo to be close to a Tokyo user, but querying a database in Virginia, produces worse results than placing both function and database in Virginia.

Execution time limits are generous: 300 seconds on all plans by default, extendable to 800 seconds on Pro and Enterprise. This makes Functions viable for AI inference, file processing, and other long-running workloads that would have required a persistent server in an earlier era.

## In the Wild

- **API routes in Next.js**: Every `route.ts` file in the App Router becomes a Function automatically. Authentication endpoints, form handlers, webhook receivers — all deployed and scaled without configuration.
- **AI streaming endpoints**: An LLM inference route that streams tokens back to the browser as they're generated. Functions support streaming responses natively; the client sees output before the model finishes.
- **Database-backed server rendering**: A product page that queries a Postgres database on each request, personalizes based on session data, and returns a fully rendered HTML response.
- **Webhook processors**: A Stripe webhook handler that verifies the signature, updates the database, and sends a confirmation email — all in a function that runs in milliseconds and costs fractions of a cent per invocation.
- **Scheduled background tasks**: Combined with `waitUntil`, a function can return a response immediately while continuing to run logging, analytics, or cache warming operations in the background.

## What It Doesn't Do

Functions are not a replacement for long-running servers. They have a maximum execution duration (800 seconds on paid plans), so workloads that require indefinite uptime — WebSocket servers, background job workers that run for hours — need a different architecture. There's also no persistent local filesystem between invocations; any file I/O needs to go through an external service like Vercel Blob or a mounted volume. Functions don't support native binary modules that require compilation at install time unless the runtime and architecture match exactly.

## Further Reading

- [Vercel Functions documentation](https://vercel.com/docs/functions)
- [Fluid Compute overview](https://vercel.com/docs/fluid-compute)
- [Configuring function regions](https://vercel.com/docs/functions/configuring-functions/region)
- [Streaming functions](https://vercel.com/docs/functions/streaming-functions)
- [Function runtimes](https://vercel.com/docs/functions/runtimes)
- [Usage and pricing](https://vercel.com/docs/functions/usage-and-pricing)

*Next: [Edge Functions](#/edge-functions) — lightweight compute at the CDN edge.*
