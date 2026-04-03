# Monorepos: One Repository, Many Deployments

The appeal of a monorepo is consolidation: one place for all your code, one set of tooling, shared utilities that don't require publishing a package to npm every time you tweak a helper function. The risk is that consolidation creates noise. Every commit touches the entire repository, so every deployment system that watches the repository wants to rebuild everything. For large teams with many projects in a single repo, that quickly becomes unsustainable — slow builds, long queues, and engineers waiting for CI to finish work that has nothing to do with their change.

Vercel handles monorepos by treating the repository as a container and the individual applications inside it as the unit of deployment. Each app in your monorepo becomes a separate Vercel project, each with its own settings, environment variables, and deployment history. They all watch the same repository, but Vercel is smart enough to figure out which ones actually need to rebuild when a commit comes in.

The result is a system where a commit that touches only the marketing site does not trigger a rebuild of the API, the internal dashboard, or the design system package — unless those projects actually depend on what changed.

## How It Works

Setting up a monorepo on Vercel is a matter of creating one project per deployable application. In the Vercel dashboard, you import the repository multiple times, pointing each project at the **Root Directory** of the specific application it represents. That setting tells Vercel where to find the build configuration and output for that app. You can also do this via the CLI with `vercel link --repo`, which links multiple projects at once from the repository root.

The intelligence lives in **automatic dependency detection**. Vercel analyzes the workspace definition — `workspaces` in `package.json` for npm and Yarn, `pnpm-workspace.yaml` for pnpm — to understand which packages exist and how they relate to each other. When a commit comes in, Vercel inspects the diff and traces the dependency graph: it considers a project changed if its own source files changed, if any of its internal workspace dependencies changed, or if there was a relevant change to the package manager lockfile. Projects that are untouched by the commit are **automatically skipped**. Unlike the manual "Ignored Build Step" approach — which still counts against your concurrent build limits — this automatic skipping releases build slots entirely, so a twenty-project repo with one changed app does not hold up the build queue for everything else.

The requirements for automatic skipping are specific: the monorepo must use npm, Yarn, pnpm, or Bun workspaces following standard JavaScript conventions, every package in the workspace must have a unique `name` field in its `package.json`, and **dependencies between packages must be explicitly declared**. That last point is important. If your end-to-end test package runs tests against your core library, but that relationship is not stated in the `package.json` of the test package, Vercel will not know to rebuild the test project when the core library changes. The dependency graph Vercel traverses is exactly the dependency graph you declare.

**Related Projects** solve a different monorepo problem: environment variable management across connected services. In a typical monorepo with a frontend and a backend API, the frontend needs to know the URL of the backend. In production, that URL is stable. In preview deployments, every PR generates a new backend URL — and you would need to manually update environment variables in the frontend project to point at the right preview. Related Projects automate this. You declare the relationship in `vercel.json` inside the frontend app, and Vercel automatically provides the preview and production URLs of the linked backend as an environment variable in every frontend deployment. The `@vercel/related-projects` package gives you typed access to that data at runtime.

**Root-level settings** versus **package-level settings** follow a clear hierarchy. Each Vercel project has its own build settings, environment variables, and domain configuration, independent of the other projects sharing the repository. A team can have different Node.js versions, different build commands, and different deployment protections for each application in the monorepo — all without leaving the repository structure that makes shared code practical in the first place.

For teams using **Turborepo**, Vercel's own monorepo build system, the integration is seamless. Turborepo's task graph and remote caching align with how Vercel thinks about what needs to rebuild, and the two systems compound each other's efficiency.

## In the Wild

- A company runs a marketing site, a SaaS application, and an internal admin panel in one repository. When the engineering team pushes a change to the admin panel, only that project deploys. The marketing site and main app are untouched.
- A design system package sits in the monorepo alongside three consumer apps. When a developer updates the button component, Vercel detects that all three apps depend on the design system and triggers builds for all of them — and only them.
- A frontend project uses Related Projects to reference its backend API. Every preview deployment of the frontend automatically picks up the URL of the corresponding backend preview, without any manual environment variable updates.
- A platform team uses per-project environment variables to give the staging frontend access to a staging API key while the production frontend uses the production key — all in the same repository.
- A team migrates from a multi-repo setup to a monorepo and preserves independent deployment cadences for each app by keeping them as separate Vercel projects. Nothing changes about their deployment workflow except they now share code directly instead of through versioned npm packages.

## What It Doesn't Do

Automatic skipping of unaffected projects is currently limited to repositories hosted on GitHub. Changes outside the workspace definition — at the repository root or in directories not included in any workspace package — are treated as global changes and trigger deployments for all projects. Related Projects are limited to three linked projects per application and do not support CLI-initiated deployments.

## Further Reading

- [Using Monorepos on Vercel](https://vercel.com/docs/monorepos)
- [Related Projects](https://vercel.com/docs/monorepos#how-to-link-projects-together-in-a-monorepo)
- [Root Directory setting](https://vercel.com/docs/deployments/configure-a-build#root-directory)
- [Turborepo documentation](https://turbo.build/repo/docs)
- [Ignored Build Step](https://vercel.com/docs/project-configuration/project-settings#ignored-build-step)
- [Concurrent builds and limits](https://vercel.com/docs/deployments/concurrent-builds)

*Back to the [Index](#/) to explore more.*
