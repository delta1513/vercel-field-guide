# Fluid Compute: The End of the Cold Start Era

Traditional serverless compute has a clean mental model: one request, one function invocation, one isolated execution environment. No shared state, no concurrency concerns, no server to manage. For simple workloads this simplicity is a genuine virtue. But the model has a structural flaw — it wastes enormous amounts of compute on idleness. A function waiting for a database response isn't doing anything useful, but it's still consuming a dedicated execution slot. That idle time is billed, and the architecture spins up new instances even when existing ones have capacity to spare.

Vercel's answer to this is Fluid Compute, a hybrid execution model that became the default for new projects in April 2025. The idea is to blend the operational simplicity of serverless — no servers to manage, automatic scaling, pay only for what you use — with the efficiency of a persistent server that can handle multiple requests concurrently. The result is an architecture that's particularly well-suited for the types of workloads modern applications actually run: AI inference, database queries, external API calls, and anything else that spends most of its time waiting for I/O.

The name signals the intent. Traditional serverless is rigid — each invocation is sealed in its own box. Fluid Compute is permeable. Instances share work, adapt to load, and reclaim capacity that would otherwise sit idle.

## How It Works

The core mechanism is **in-function concurrency**: multiple requests can execute within the same running function instance simultaneously. In the traditional serverless model, if ten requests arrive at the same time, ten separate instances spin up. With Fluid Compute, those ten requests can share one or a few instances, each waiting for its own I/O operations independently. The Node.js event loop, already designed for concurrent I/O, handles this naturally.

This matters most for **I/O-bound workloads**. An AI application that calls an external embedding API, queries a vector database, and streams results to a client might spend 90% of its time waiting for network responses. In the old model, all that waiting happened inside isolated, dedicated invocations. In Fluid Compute, the waiting happens in the event loop of a shared instance, freeing the CPU for requests that actually need it. Vercel's observability dashboard surfaces this directly: it shows the ratio of compute saved through optimized concurrency, measured in GB-Hours.

**Cold starts** are attacked from multiple directions. **Bytecode caching** stores the compiled output of your JavaScript after the first execution, eliminating recompilation on subsequent cold starts. This applies to Node.js 20 and above on production deployments, and is particularly effective for functions that invoke infrequently. On production deployments, Vercel also **pre-warms** functions before they receive traffic, so the first real request doesn't pay the full initialization cost.

Error isolation is handled carefully. When an unhandled exception occurs in Node.js, Fluid Compute logs the error and allows in-flight requests to complete before stopping the process. One broken request doesn't cascade into failures for every concurrent request on the same instance — behavior that mirrors a well-designed application server but without the operational overhead of running one.

Beyond performance, Fluid Compute adds **background processing** via the `waitUntil` API. A function can return a response to the user immediately and then continue executing — sending analytics events, warming caches, updating secondary data stores — without making the user wait. The response is fast; the housekeeping happens asynchronously.

Scaling is still automatic. When existing instances are saturated, new ones come online. When traffic falls, instances are released. The difference is that Fluid Compute **maximizes the utilization of existing instances** before spinning up new ones, which means fewer total instances for the same workload. Pricing reflects this: you're billed for active CPU time, not wall-clock invocation time. Idle waiting doesn't cost you.

Fluid Compute is available for Node.js, Python, Edge, Bun, and Rust runtimes. The in-function concurrency optimization specifically requires Node.js or Python.

## In the Wild

- **AI chat applications**: An endpoint that calls an LLM API, streams the response, and logs usage data — hundreds of concurrent requests sharing a pool of warm instances rather than spinning up a new process for each.
- **E-commerce product pages**: Server-rendered pages that query inventory, pricing, and personalization APIs. Concurrent requests share warm instances, reducing both latency and compute cost at peak.
- **Webhook processors**: High-volume webhook endpoints that do mostly network I/O — verifying signatures, queuing events, calling other services. In-function concurrency means a handful of instances handles traffic that would have required dozens under the old model.
- **Background analytics**: A function that returns an API response immediately and uses `waitUntil` to send detailed telemetry to a logging service without adding latency to the primary request.
- **Multi-region API deployments**: On Pro plans, functions configured to run in up to three regions simultaneously, with automatic availability zone failover within each region.

## What It Doesn't Do

Fluid Compute doesn't make every function faster in isolation. A CPU-bound function that runs a heavy computation on every request benefits less from concurrency than an I/O-bound one. Shared instances also mean shared global state — module-level variables and caches persist across requests, which can be an advantage (warm connection pools) or a gotcha (accidentally mutable state). Code that assumes a clean process per request needs review before enabling concurrency.

## Further Reading

- [Fluid Compute documentation](https://vercel.com/docs/fluid-compute)
- [What is compute? — conceptual overview](https://vercel.com/docs/fundamentals/what-is-compute)
- [In-function concurrency blog post](https://vercel.com/blog/serverless-servers-node-js-with-in-function-concurrency)
- [Fluid Compute pricing](https://vercel.com/docs/functions/usage-and-pricing)
- [Configuring function regions](https://vercel.com/docs/functions/configuring-functions/region)
- [The waitUntil API](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#waituntil)

*Next: [Next.js](#/nextjs) — the framework Vercel built and optimizes for.*
