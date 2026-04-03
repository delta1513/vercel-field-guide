# Postgres: Serverless SQL Without the Server Overhead

Relational databases and serverless functions have always had an uneasy relationship. The problem is fundamental: PostgreSQL was designed for persistent server processes that maintain long-lived connections. A serverless function is the opposite — it boots, does work, and exits, possibly thousands of times per second. Traditional Postgres poolers like PgBouncer help, but they assume you have a stable server running them. When your entire backend is serverless, you need a database that was built for the same model.

Vercel Postgres is a serverless PostgreSQL database integrated into the Vercel platform. It gives you full SQL — schemas, joins, transactions, indexes, foreign keys — without requiring you to provision or manage a database server. Create a database in the Vercel dashboard, connect it to a project, and the credentials arrive in your environment variables automatically. The rest is standard Postgres.

To be direct about the architecture: Vercel Postgres runs on **Neon**, a serverless Postgres platform that Neon's team spent years building specifically for this problem. When you create a Vercel Postgres database, you're getting a Neon instance with billing through Vercel and integration with the Vercel dashboard and environment variable system. Neon's engineering is what makes the serverless model work — the partnership lets Vercel offer it seamlessly inside the platform. Existing Vercel Postgres databases were migrated to Neon's native integration in December 2024.

## How It Works

The core challenge Neon solved — and what makes Vercel Postgres practical — is **separation of storage and compute**. In a traditional Postgres deployment, the database process holds open connections, manages memory buffers, and keeps the storage layer tightly coupled to the running server. Neon decouples them: storage lives in a durable, distributed layer (built on top of S3-compatible object storage), and compute nodes — the processes that actually execute SQL queries — can start, pause, and resume independently.

This enables **scale-to-zero**. When no queries are running, the compute node pauses, and you're not paying for idle time. When a request arrives, it wakes — the cold start is typically a second or two for a fully stopped database. For development databases and low-traffic applications, this dramatically reduces cost. Production databases can be configured to keep a hot replica available to avoid cold starts entirely.

**Connection pooling** is handled at the platform level via Neon's pooler, which sits between your serverless functions and the Postgres compute layer. Your functions connect to the pooler, which maintains a smaller set of real connections to the database. This allows thousands of concurrent serverless function invocations to share a manageable connection pool — the problem that would otherwise break standard Postgres under serverless load.

The SDK is `@vercel/postgres`, which provides a tagged template literal interface (`sql\`SELECT * FROM users WHERE id = ${id}\``) with automatic parameterization to prevent SQL injection. For teams who prefer an ORM, the connection string works directly with **Drizzle**, **Prisma**, **Kysely**, and any other Postgres-compatible library — the database looks like regular Postgres from the outside.

**Database branching** is one of Neon's most powerful features, carried over into the Vercel integration. A branch is an instant, zero-copy snapshot of a database at a point in time. Creating one doesn't duplicate the underlying data — it uses copy-on-write so the branch only stores pages that change after branching. Combined with Vercel's preview deployments, this enables a compelling workflow: every pull request can get its own database branch, fully isolated from production, with no additional storage cost for unchanged data.

**Point-in-time recovery** lets you restore to any moment in the recent past. Autoscaling adjusts compute allocation up and down based on load. Read replicas can be added to distribute query load for read-heavy workloads.

## In the Wild

- **Full-stack Next.js applications**: User accounts, content, application state — all in SQL, with the database provisioned alongside the deployment in the same dashboard.
- **Preview deployments with isolated databases**: Each PR branch gets a database branch seeded with a copy of production data, so frontend reviewers can test against realistic data without touching production.
- **Multi-tenant SaaS**: Tenant data in separate schemas or tables, with connection pooling handling the concurrency load as the user base grows.
- **Migrating from a managed RDS instance**: Any Postgres application can move without code changes — the connection string is the only thing that changes.
- **AI applications with vector search**: `pgvector` extension support turns the database into a vector store for semantic search and RAG (retrieval-augmented generation) applications.

## What It Doesn't Do

Vercel Postgres is optimized for web application workloads — transactional queries, moderate-sized datasets, typical SaaS patterns. It's not designed for data warehouse workloads, heavy analytical queries across billions of rows, or bulk ETL pipelines. The scale-to-zero cold start, while fast, means latency-sensitive production applications may want to configure always-on compute. And while it's standard Postgres, a small number of Postgres extensions may not be available in the managed environment — check Neon's supported extension list if your application depends on something unusual.

## Further Reading

- [Postgres on Vercel](https://vercel.com/docs/postgres) — official overview of Postgres options via the Marketplace
- [Neon documentation](https://neon.tech/docs) — the underlying platform's full feature documentation including branching and autoscaling
- [Vercel Marketplace: Neon](https://vercel.com/marketplace/neon) — install and pricing details
- [pgvector on Neon](https://neon.tech/docs/extensions/pgvector) — using Postgres as a vector database for AI applications
- [Drizzle ORM with Vercel Postgres](https://orm.drizzle.team/docs/connect-neon) — type-safe SQL with schema inference
- [Preview deployments and database branches](https://neon.tech/docs/guides/vercel) — the full workflow for isolated per-PR databases

*Next: [AI SDK](#/ai-sdk) — the open-source toolkit for building AI applications.*
