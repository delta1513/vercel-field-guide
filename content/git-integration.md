# Git Integration: Your Repository Is the Control Plane

Most deployment tools treat git as an input — you hand them code and they run a build. Vercel treats git as the interface. The repository doesn't just supply code; it drives the entire deployment lifecycle. Every push creates a deployment. Every branch gets an environment. Every merge updates production. The dashboard is useful for inspection, but the real control surface is your commit history.

This is an architectural choice, not a convenience feature. By making git the authority, Vercel inherits all the collaboration infrastructure that already exists there: pull request reviews, branch protection rules, merge queues, code owners. You don't need a separate deployment approval process because your git workflow already has one.

## How It Works

Vercel supports four **git providers**: GitHub (Free, Team, and Enterprise Cloud tiers), GitLab (Free through Enterprise), Bitbucket (Free through Premium), and Azure DevOps Pipelines. Self-hosted instances of GitHub Enterprise Server, GitLab, and Bitbucket Data Center can connect via the Vercel CLI or custom pipelines rather than the native integration. Any git provider not on that list — Gitea, Forgejo, AWS CodeCommit — can still push to Vercel using the CLI in a custom CI script.

Connecting a repository takes seconds from the Vercel dashboard's "New Project" flow. Vercel requests write access to the repository — needed to post deployment status checks and preview URLs back to pull requests — and installs a webhook. From that point forward, Vercel is listening.

The webhook fires on every push. Vercel evaluates the branch against your project configuration: is this the **production branch**? If so, build and deploy to production, then update all assigned production domains. If not, build and deploy as a preview, post the URL as a PR comment, and set a status check on the commit. The default production branch is `main`, falling back to `master`, then the repository's configured default.

**Security for private repositories** involves verifying that commit authors are authorized Vercel team members. On Pro teams, Vercel cross-references the commit author's email against team membership via connected login accounts. On Hobby accounts, only the account owner's commits will deploy from organizational repositories. Pull requests from forks of public repositories require explicit authorization — Vercel posts a comment to the PR asking a team member to approve — preventing untrusted code from executing in your build environment or accessing your environment variables.

The **Preview environment** and the **Production environment** each carry their own environment variable sets, so the same repository can connect to different databases, APIs, or third-party services depending on which branch was pushed. Pro teams can push this further with **custom environments**: named pre-production stages like `staging` or `qa`, each with its own branch tracking rules, environment variables, and assigned domain. Pro teams get one custom environment per project; Enterprise teams get up to 12.

If you need to deploy a specific commit or branch without pushing new code — useful for recovery scenarios or manual release gates — the dashboard's "Create Deployment" flow accepts a commit SHA or branch name directly. You can also trigger deployments from outside git entirely using **Deploy Hooks**: project-specific URLs that fire a build when hit with an HTTP request, useful for CMS publish events or scheduled rebuilds.

## In the Wild

- **Continuous deployment with no pipeline config**: A solo developer connects their Next.js repo to Vercel on day one. Every push to `main` deploys to production. Every feature branch gets a preview URL. There is no YAML to write, no runner to provision, no deployment step in a CI file — Vercel handles it all from the webhook.

- **Branch-per-environment staging setup**: A team creates a `staging` branch, assigns `staging.example.com` to it in Vercel's domain settings, and configures staging-specific environment variables. Feature branches merge to `staging` for integration testing, then to `main` for production. Two environments, one repository, zero infrastructure to manage.

- **Protected production with PR gates**: An engineering team uses GitHub branch protection to require two approvals and passing CI before anything merges to `main`. Vercel's status check — which posts the preview URL and build result — is one of those required checks. Nothing reaches production without a live preview URL that reviewers have visited.

- **Headless CMS with Deploy Hooks**: A marketing team using Contentful connects a Vercel Deploy Hook to Contentful's "entry published" webhook. Every time an editor publishes a blog post, Contentful fires the hook, Vercel rebuilds the site, and the new content is live within minutes — with no developer involvement and no scheduled rebuild cron.

- **Monorepo with per-package deployments**: A team stores their marketing site, web app, and documentation in a single repository. Each is a separate Vercel project, each watching a different root directory. A push that only touches the docs directory triggers only the docs deployment, thanks to Vercel's change detection. The marketing site doesn't rebuild when nobody touched it.

## What It Doesn't Do

The native git integration doesn't support self-hosted git servers directly. GitHub Enterprise Server, self-managed GitLab, and Bitbucket Data Center require a workaround: use the Vercel CLI in your existing CI/CD pipeline, authenticate via a token, and call `vercel --prod` or `vercel` manually. The deployment experience is identical; the automation is just handled by your own CI runner rather than Vercel's webhook.

Azure DevOps is supported, but through the Vercel Deployment Extension rather than the same native flow as GitHub or GitLab. The setup is slightly more involved.

## Further Reading

- [Git Integration Overview](https://vercel.com/docs/git) — The full reference for supported providers, production branch configuration, and preview branch behavior.
- [Vercel for GitHub](https://vercel.com/docs/git/vercel-for-github) — GitHub-specific details: status checks, PR comments, fork authorization.
- [Deploy Hooks](https://vercel.com/docs/deploy-hooks) — Triggering builds from external events without a git push.
- [Custom Environments](https://vercel.com/docs/deployments/environments#custom-environments) — Creating named pre-production stages with branch tracking and domain assignment.
- [Environment Variables](https://vercel.com/docs/environment-variables) — Scoping secrets and configuration values per environment.

*Next: [CLI](#/cli) — deploy from your terminal.*
