# KV: Redis Without the Redis Tax

There's a particular kind of developer misery that comes from needing a simple key-value store for a serverless application. You need something fast, globally available, and low-latency — but a traditional Redis cluster requires persistent connections, and serverless functions don't have those. You could manage connection pools, run your own Redis in EC2, wrestle with VPC peering, and eventually get something working. Or you could provision a KV store from the Vercel dashboard in about thirty seconds.

Vercel KV is a Redis-compatible key-value database built for the serverless edge. It handles session tokens, feature flags, rate-limiting counters, leaderboards, and anything else that wants fast reads and a familiar API. The interface is Redis — `GET`, `SET`, `INCR`, `ZADD`, sorted sets, hashes, and the rest of the standard command set. The infrastructure is managed, the connections are HTTP-based so serverless functions can open them without overhead, and the environment variables land in your Vercel project automatically on creation.

Worth saying plainly: Vercel KV is a managed **Upstash Redis** instance. Upstash is a specialist in serverless Redis and Kafka, and Vercel partnered with them rather than building competing infrastructure. When you create a KV store, you're getting an Upstash database provisioned and wired into your Vercel project — with billing through Vercel, credentials injected automatically, and a dashboard view inside the Vercel UI. If that matters to your architecture, it's useful to know. If it doesn't, the experience is seamless.

## How It Works

The key technical distinction between Vercel KV and a traditional Redis deployment is transport. Traditional Redis uses a persistent TCP connection; clients stay connected, and the server can push data without polling. Serverless functions can't hold persistent connections across invocations — each function call starts cold with no socket to hand off to. Vercel KV solves this with an **HTTP-based Redis protocol**, meaning every command goes over a standard HTTPS request. There's no connection pool to manage, no "too many connections" error when your function scales to a thousand concurrent invocations. Each call opens a request, executes a command, and closes.

**Global replication** is the other pillar. Upstash runs KV stores across multiple regions, and reads are served from the nearest replica. You write to a primary region, and replicas catch up in milliseconds. For read-heavy workloads — which most caching and session use cases are — this means low latency regardless of where your function executes.

The SDK ships as `@vercel/kv`, a thin TypeScript wrapper that talks to the HTTP API. It exposes a clean, Promise-based interface that mirrors the Redis command set closely enough that anyone who's used Redis before will be comfortable immediately. For teams already invested in `ioredis` or other Redis clients, the underlying HTTP endpoint is accessible directly — the SDK is convenience, not a requirement.

**Environment variables** are injected automatically when you create a KV store and connect it to a project: `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `KV_REST_API_READ_ONLY_TOKEN`. These are available in production, preview, and development environments without manual configuration. The read-only token is useful for client-side or edge contexts where you don't want write access.

Data persistence is configurable. By default, data is durable — backed by Upstash's storage layer. You can also configure **eviction policies** (LRU, LFU, etc.) and **TTLs** on individual keys, which is standard Redis behavior and important for use cases like session tokens or rate-limiting windows that should expire automatically.

## In the Wild

- **Session storage**: Store user sessions as JSON blobs keyed by session ID. Fast reads on every request, automatic TTL expiration when sessions should end.
- **Rate limiting**: Increment a counter per user per time window using `INCR` and `EXPIRE`. The atomic operations guarantee correctness even under concurrent traffic.
- **Feature flags at the edge**: Store flag states in KV and read them in Edge Middleware — millisecond latency to decide what to show before the page renders.
- **Leaderboards and counters**: Use sorted sets (`ZADD`, `ZRANGE`) to maintain ranked lists — top scores, most-viewed posts, trending items — that update in real time.
- **Caching API responses**: Store the JSON response from a slow external API with a TTL. Subsequent requests within the window return the cached value instantly.

## What It Doesn't Do

KV is optimized for small values and high-throughput reads, not large document storage or complex queries. Storing multi-megabyte blobs per key will work but isn't what the system is designed for — Vercel Blob handles large objects better. There's no pub/sub support through the Vercel interface (though raw Upstash supports it). KV is also not a drop-in replacement for a full Redis cluster in a persistent server environment — the HTTP transport adds latency compared to a socket-based connection, which matters for high-frequency, low-latency use cases like real-time game state.

## Further Reading

- [Redis on Vercel](https://vercel.com/docs/redis) — official overview of Redis options through the Vercel Marketplace
- [Upstash Redis documentation](https://upstash.com/docs/redis/overall/getstarted) — the underlying platform's full feature documentation
- [Vercel Marketplace: Upstash](https://vercel.com/marketplace/upstash) — install and pricing details
- [AI Gateway observability](https://vercel.com/docs/ai-gateway/capabilities/observability) — if you're building AI features, KV pairs naturally with spend tracking
- [Edge Middleware on Vercel](https://vercel.com/docs/functions/edge-middleware) — where KV reads are most useful for routing and personalization
- [Upstash global replication](https://upstash.com/docs/redis/features/globaldatabase) — how multi-region read replicas work under the hood

*Next: [Postgres](#/postgres) — serverless PostgreSQL on Vercel.*
