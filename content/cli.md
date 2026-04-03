# CLI: The Whole Platform in a Terminal

The Vercel dashboard is polished and useful, but the CLI is where the platform reveals its full depth. Nearly every operation available in the browser is also available from the command line, and some operations — deploying from a machine that isn't connected to a git remote, pulling production environment variables into a local `.env` file, performing a binary search across your deployment history to find when a bug was introduced — are only practical from a terminal.

The CLI is also Vercel's escape hatch. Teams that can't use the native git integration, that run their own CI/CD pipelines, or that need to automate deployments from scripts and other tools reach for `vercel` as the universal connector. It authenticates against the same platform as the git integration and the REST API; it just puts the controls in your hands.

## How It Works

The CLI is an npm package — installable with `npm i -g vercel`, `pnpm i vercel`, or the equivalent. Once authenticated via `vercel login` (which handles OAuth against GitHub, GitLab, Google, or email), every command runs against your Vercel account or a specific team scope, switchable with `vercel switch`.

**Linking** a local directory to a Vercel project happens once: `vercel link` creates a `.vercel` directory storing the project and organization IDs. After that, commands like `vercel deploy`, `vercel env pull`, and `vercel logs` know which project they're operating against without you specifying it each time.

The **deploy command** is the heart of the CLI. Running `vercel` from your project directory triggers a preview deployment. Running `vercel --prod` (or `vercel deploy --prod`) promotes it directly to production, updating your production domains. In CI environments where interactive login isn't possible, authentication passes via the `--token` flag with a token generated from the Vercel dashboard's tokens page.

The **dev command** (`vercel dev`) is underappreciated. It runs a local development server that replicates the Vercel deployment environment — including serverless functions, environment variables pulled from your connected project, and routing rules — more faithfully than running your framework's development server alone. If your application has API routes that behave differently in the Vercel runtime than in a plain Node process, `vercel dev` is where you catch that before it hits production.

**Environment variable management** through the CLI covers the full lifecycle: `vercel env ls` lists all variables across all environments, `vercel env add` and `vercel env rm` create and delete them, and `vercel env pull` writes the current environment's variables into a local `.env.local` file. The `vercel env run -- <command>` form injects variables directly into a subprocess — useful for scripts that need production credentials locally without storing them in files.

The CLI's **rollback** and **promote** commands complete the deployment lifecycle loop. `vercel rollback` reverts production to the previous deployment; `vercel promote [deployment-url]` elevates any existing deployment — a preview build, a build from three weeks ago — to be the current production deployment. No rebuild required; it's the same pointer-swap that makes Vercel rollbacks instantaneous.

The **bisect command** deserves special mention. It's a binary search over your deployment history: you mark a known-good deployment and a known-bad deployment, and `vercel bisect` walks you through testing intermediate deployments until it finds where the regression was introduced. The same technique as `git bisect`, but applied to your live deployment history rather than your source commits.

Beyond deployments, the CLI manages domains, DNS records, TLS certificates, blob storage uploads, feature flags, cache purges, webhook registrations, and marketplace integrations. The **cache command** (`vercel cache purge`, `vercel cache invalidate --tag`) is particularly useful for applications using Next.js's data cache or ISR — you can invalidate cached content from a script or CI step without touching the dashboard.

## In the Wild

- **CI/CD without the native git integration**: A team running GitHub Actions calls `vercel --prod --token $VERCEL_TOKEN` as the final step in their workflow, after tests pass and a manual approval is given. Vercel handles the build and deployment; the team keeps their existing pipeline for everything else.

- **Local development with real secrets**: A developer uses `vercel env pull` to fetch the project's preview environment variables into `.env.local`, then runs `vercel dev` to test API routes that call third-party services. The local environment matches the preview deployment exactly — same routing, same runtime, same secrets.

- **Automated cache invalidation**: A Next.js site uses ISR to cache product pages. When inventory data changes in the backend, a script runs `vercel cache invalidate --tag product-listing` to force the CDN and data cache to revalidate. Fresh data, no rebuild.

- **Deployment bisect for a performance regression**: A site's Core Web Vitals score dropped sometime in the last month. An engineer runs `vercel bisect`, marks the last clean deployment as good and the current as bad, and tests five intermediate deployments instead of hunting through 30 commits. The offending PR is identified in under 20 minutes.

- **Multi-project management from one terminal**: A developer managing a monorepo with separate Vercel projects for frontend and backend uses `vercel switch` to hop between team scopes, `vercel project ls` to list deployments across projects, and `vercel promote` to graduate specific builds to production independently.

## What It Doesn't Do

The CLI is not a build orchestrator. It runs your project's build command (or Vercel's detected framework build), but it doesn't replace tools like Turborepo for managing build graphs across a monorepo. For complex multi-package builds, the CLI is the last step in a pipeline, not the whole pipeline.

Interactive commands — `vercel login`, `vercel link`, `vercel init` — are designed for human use. Automation scripts should use the `--token` flag and non-interactive flags to avoid hanging on prompts in CI environments.

## Further Reading

- [CLI Reference](https://vercel.com/docs/cli) — Complete documentation for every command and global option.
- [vercel dev](https://vercel.com/docs/cli/dev) — How the local development server replicates the Vercel runtime environment.
- [vercel env](https://vercel.com/docs/cli/env) — Managing environment variables from the command line, including the `env run` subcommand.
- [vercel rollback](https://vercel.com/docs/cli/rollback) — Rolling back production deployments without a rebuild.
- [Using Vercel CLI for Custom Workflows](https://vercel.com/kb/guide/using-vercel-cli-for-custom-workflows) — How to integrate the CLI into pipelines that don't use the native git integration.

*Next: [Domains](#/domains) — custom domains with automatic HTTPS.*
