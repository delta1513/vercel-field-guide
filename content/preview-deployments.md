# Preview Deployments: Every Pull Request Gets a URL

Before Vercel made it mainstream, sharing a work-in-progress with a designer or product manager meant either setting up a staging server (and keeping it in sync), narrating over a screen share, or sending screenshots. Preview deployments changed the workflow: open a pull request, and within minutes a live URL exists that anyone with a browser can visit — no account required, no VPN, no "let me just push that branch for you."

It is, in retrospect, a simple idea. But simple ideas executed well have a way of becoming load-bearing infrastructure. Preview deployments are now the center of how design reviews happen, how QA runs, how stakeholder sign-off gets collected. The pull request becomes a live artifact, not just a diff.

The feature that made Vercel famous has also quietly grown into a full collaboration layer. The URL is just the starting point.

## How It Works

Every commit pushed to a non-production branch automatically creates a preview deployment. Pull requests on GitHub, GitLab, and Bitbucket get the URL posted directly to the PR comment by Vercel's git integration. Two distinct URLs are generated for every preview: a **commit-specific URL** that permanently captures the state of that exact build, and a **branch URL** that always reflects the latest commit on that branch.

The URL structure encodes the project name, branch name, and team slug into a `.vercel.app` address. A branch called `feature/checkout-redesign` on a project called `storefront` owned by the `acme` team becomes something like `storefront-git-feature-checkout-redesign-acme.vercel.app`. Enterprise teams can replace the `.vercel.app` suffix with a custom domain using the **Preview Deployment Suffix** feature — useful for organizations that want previews under their own brand.

Preview deployments are isolated from production. They can carry entirely separate **environment variables** — a preview database connection string, a sandbox API key, a feature-flagged configuration — because Vercel scopes environment variables per environment. Staging secrets never leak into preview builds, and production secrets never reach a pull request that a contractor submitted.

The **Vercel Toolbar** appears automatically on every preview deployment. It floats at the edge of the browser window, dormant by default, activating when you click it or log into your Vercel account. Through the toolbar, team members can leave threaded **comments** directly on any element of the page — pinned to specific coordinates, attached to the visible UI, visible to everyone with access. Feedback that used to arrive as annotated screenshots or Loom recordings can now happen in context, on the actual running application.

Beyond comments, the toolbar surfaces **feature flags** for toggling variants in the live preview, **Draft Mode** for previewing unpublished CMS content, **Layout Shift detection** for identifying cumulative layout shift sources, and an **Accessibility Audit** tool that checks WCAG 2.0 A and AA compliance. The toolbar can be disabled per team, per project, or per session.

**Deployment protection** adds a security layer when you need it. Authentication protection restricts access to Vercel team members only. Password protection adds a shared passphrase for sharing with external collaborators who don't have Vercel accounts. Sharable links — one-time bypass URLs — let you grant temporary access to someone outside the team without changing the protection settings globally. Access can be revoked individually.

## In the Wild

- **Design review without a staging server**: A product designer reviews a new component library before it merges. They open the PR, click the Vercel preview URL, and pin comments directly to the elements they want adjusted. The developer sees the comments in the toolbar on the same URL. No Figma handoff, no back-and-forth over screenshots.

- **QA on feature branches**: A QA engineer runs a test plan against the preview URL for every ticket. Because the branch URL always points to the latest commit, they can re-test after fixes without asking for a new link. The commit-specific URL captures exactly what they found a bug in.

- **Stakeholder sign-off**: A client needs to approve a landing page redesign before it goes live. The agency sends the preview URL. The client clicks through the live page, leaves a comment on the hero section asking for a font change, and the designer sees it instantly. No credentials needed — just a browser.

- **Branch-based staging environments**: A team sets up a `staging` branch with its own assigned domain (`staging.example.com`) and environment variables pointing at a staging database. Feature branches get merged to `staging` first, live-tested at the real domain, then promoted to `main`. The preview environment becomes a permanent pre-production gate.

- **Detecting regressions before merge**: A CI pipeline runs visual regression tests against the preview URL using Playwright. If the screenshots diff beyond a threshold, the PR check fails. The preview deployment makes the live URL available to automated tests without any additional server infrastructure.

## What It Doesn't Do

Preview deployments share the same compute infrastructure as production. They are not sandboxed from your real services unless you configure separate environment variables. A preview deployment pointed at your production database will write to your production database. The environment variable separation is opt-in, not automatic.

Hobby plan users can share previews with one external collaborator at a time. Teams that do regular external review — agencies, consultants, clients — need a Pro plan for multi-user sharing.

## Further Reading

- [Preview Environment](https://vercel.com/docs/deployments/environments#preview-environment-pre-production) — How the preview environment works, including branch and commit URL generation.
- [Generated URLs](https://vercel.com/docs/deployments/generated-urls) — The full URL structure for preview deployments, including branch, commit, and CLI-generated patterns.
- [Sharing a Preview Deployment](https://vercel.com/docs/deployments/sharing-deployments) — How to share with team members, invite external collaborators, and configure access control.
- [Vercel Toolbar](https://vercel.com/docs/vercel-toolbar) — The full feature set available in the toolbar: comments, feature flags, layout shift detection, accessibility audits.
- [Deployment Protection](https://vercel.com/docs/security/deployment-protection) — Password protection, Vercel authentication, and sharable bypass links.
- [Preview Deployment Suffix](https://vercel.com/docs/deployments/preview-deployment-suffix) — Replacing `vercel.app` with your own domain on preview URLs.

*Next: [Git Integration](#/git-integration) — how Vercel connects to your repository.*
