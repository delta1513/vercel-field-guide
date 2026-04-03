# Deployments: The Atomic Unit of Everything

Vercel is fundamentally a deployment machine. Every other feature — preview URLs, edge functions, domain management, caching — exists in service of one core idea: you push code, and something live appears on the internet. Quickly. Reliably. Without you thinking about servers.

A **deployment** on Vercel is the result of a successful build. Not a file transfer, not a server restart — a complete, self-contained snapshot of your project at a specific commit. Each deployment gets its own immutable URL, lives independently of every other deployment, and never changes once it's built. That last part matters more than it sounds.

The immutability guarantee is what makes instant rollbacks possible. When you promote a new deployment to production and something breaks, reverting is not a rebuild — it's a pointer swap. Vercel just reassigns your production domain to point at the previous deployment, which never stopped existing. The old build is still there, still running, ready to receive traffic the moment you need it.

## How It Works

Every deployment begins with a trigger. The most common path is a git push: Vercel's integration with GitHub, GitLab, Bitbucket, or Azure DevOps detects the commit and kicks off a build automatically. Alternatively, you can trigger deployments from the CLI, from **Deploy Hooks** (unique URLs that accept HTTP GET or POST requests), or directly from the Vercel REST API by uploading file SHAs and creating a deployment record.

The build runs in Vercel's infrastructure. Vercel detects your **framework preset** — Next.js, SvelteKit, Nuxt, Astro, and 30+ others — and applies the correct build command without configuration. The output is analyzed and split into its component types: **static assets** (HTML, CSS, JavaScript files served directly from the CDN), **serverless functions** (your API routes and server-rendered pages), and **edge middleware** (lightweight code that runs at the network edge before requests hit your functions).

Each deployment exists in one of three **environments**: Local (your machine, not a deployment at all), **Preview** (everything that isn't your production branch), and **Production** (your live, user-facing deployment). Environments are not just labels — they carry their own environment variables, which means your preview deployments can connect to a staging database while production connects to the real one. Pro and Enterprise teams can create up to 12 **custom environments** per project for more complex workflows like QA or staging.

The **production branch** defaults to `main`, then `master`, then your repository's default branch. Merging to that branch creates a production deployment. Every other branch creates a preview deployment. This is the git-centered workflow Vercel is built around — it's not a setting you configure, it's the default behavior.

Once built, deployments are immutable. Vercel stores the build output and generates a permanent URL. The **deployment summary** in the dashboard shows you the detected framework, build time, static asset inventory, function count and sizes, and any middleware matchers — a full accounting of what was actually built and deployed.

## In the Wild

- **Zero-downtime releases**: A team ships a redesign. The new deployment builds in parallel while the old one continues serving traffic. Only after the build succeeds does Vercel update the production domain — users never see a 502 during the transition.

- **Emergency rollback in seconds**: An e-commerce site pushes a bug to production on Black Friday. Rather than scrambling to revert code and rebuild, the on-call engineer promotes the previous deployment from the Vercel dashboard. Traffic shifts instantly. The bad deployment is still there for post-mortem inspection, untouched.

- **Headless CMS previews**: A content team updates a marketing page in their CMS. A Deploy Hook fires on every publish event, triggering a fresh Vercel build without any engineer involvement. Writers see their changes live within minutes, on the production URL.

- **Custom CI/CD integration**: A team running Jenkins or GitHub Actions uses `vercel --prod` in their pipeline after their own test suite passes. Vercel's build runs only when the team's quality gates have been cleared, combining their existing workflow with Vercel's deployment infrastructure.

- **Multi-region inspection**: A startup debugging latency issues uses the deployment's Resources tab to see exactly which functions are deployed to which regions, their sizes, and links directly into logs and analytics — all from one deployment detail page.

## What It Doesn't Do

Vercel deployments are stateless by design. They don't run persistent processes, maintain open connections between requests (unless you're using Fluid Compute), or store data locally. If your application needs something like a background job scheduler or a long-lived WebSocket server with in-memory state, that belongs outside Vercel's deployment model.

The REST API path for deployments — uploading file SHAs and constructing a deployment manifest — requires more scaffolding than the git integration. It's powerful for multi-tenant platforms that programmatically generate sites, but it's not a shortcut to avoid understanding the deployment model.

## Further Reading

- [Deployment Environments](https://vercel.com/docs/deployments/environments) — The full breakdown of Local, Preview, Production, and custom environments, including environment variable scoping.
- [Generated URLs](https://vercel.com/docs/deployments/generated-urls) — How Vercel constructs deployment URLs from project name, branch, commit hash, and team slug.
- [Managing Deployments](https://vercel.com/docs/deployments/managing-deployments) — Redeploying, promoting, inspecting, and assigning custom domains to specific deployments.
- [Deploy Hooks](https://vercel.com/docs/deploy-hooks) — Trigger deployments from external systems without a git push.
- [Vercel REST API: Create a Deployment](https://vercel.com/docs/rest-api/reference/endpoints/deployments/create-a-new-deployment) — The API reference for programmatic deployments, including file upload and SHA generation.

*Next: [Preview Deployments](#/preview-deployments) — every pull request gets its own URL.*
