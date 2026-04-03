# Feature Flags: Ship the Code, Control the Release

Deployment and release used to be the same event. You merged the PR, the code went live, and everyone got the new feature at once. If something went wrong, you rolled back — a stressful operation with collateral damage. Feature flags broke that coupling. Now you can deploy code that is dark — present in production, but dormant — and flip it on for ten percent of users, or for your internal team, or for a single stakeholder who needs to see it before launch. The code ships on your schedule. The feature ships on the business's schedule.

Vercel's feature flags platform is built into the platform rather than bolted on. The evaluation happens at the edge, the management interface lives in the toolbar, and the developer toolchain ships as an open-source SDK with first-class support for Next.js and SvelteKit. Whether you use Vercel as your flag provider or connect an existing provider like LaunchDarkly through the marketplace, the same dashboard, the same developer tools, and the same observability layer cover all of it.

The result is a system where toggling a feature is not a ceremony. It is a browser interaction.

## How It Works

The core of Vercel's flag system is the **Flags SDK** — an open-source TypeScript package that lets you define flags as code and evaluate them at request time. Flags are evaluated **server-side**, typically in Next.js middleware or a server component, so there is no client-side fetch, no waterfall, and no layout shift from a flag that resolves after the page has painted. The decision about what a user sees is made before the response leaves the server.

The SDK communicates with the toolbar through two mechanisms. The **Flags Discovery Endpoint** is an API route your application exposes — by convention at `/.well-known/vercel/flags` — that returns the definitions of all your flags: their names, descriptions, possible values, and links to wherever they are managed. The toolbar fetches this endpoint whenever it needs to populate the Flags Explorer panel. Access to the endpoint is gated by the **`FLAGS_SECRET` environment variable**, a 32-byte secret stored in your project settings. The toolbar proves it has access to this secret by including a signed authorization header; the `verifyAccess` function in the SDK validates that proof without the secret ever traveling over the network.

When a developer opens the Flags Explorer in the toolbar and overrides a flag, the new value is written into a cookie called `vercel-flag-overrides`. In the default **encrypted mode**, the cookie contents are signed and encrypted using `FLAGS_SECRET`, so users cannot tamper with the values by editing the cookie directly. Your application reads this cookie at request time and uses `decryptOverrides` to extract the overrides before falling back to the default flag evaluation logic.

**Flag values** are communicated back to the toolbar separately from definitions, because definitions are static metadata while values depend on the specific request. The SDK provides a `FlagValues` React component (or a raw script tag approach for non-React apps) that emits the current flag values into the DOM after a page renders. The toolbar picks these up via a `MutationObserver` and displays them in the Flags Explorer alongside the definitions, giving you a live readout of what every flag resolved to for this particular page load.

**Branch-level recommendations** let you save a specific override configuration to a branch and recommend it to teammates. Anyone who opens a preview deployment on that branch sees a notification asking if they want to apply your recommended overrides. **URL-based overrides** encode a set of overrides directly into a shareable link — useful for reproducing a specific state in a bug report or showing a stakeholder a feature that is not yet rolled out globally.

The **unified dashboard** in Vercel shows all flags in one place regardless of provider. Vercel-native flags can be edited directly from the dashboard. Marketplace-provider flags link through to their source systems, with authenticated access so there is no second login.

Flags also connect to **Web Analytics**. Vercel can annotate analytics events with the flag values that were active when those events occurred, giving you a direct measurement of how a flag's state affected conversion rates, engagement, or any other metric you track.

## In the Wild

- A team rolls out a redesigned checkout page to 10% of production traffic, monitors conversion metrics in Web Analytics with flag-annotated events, and expands the rollout after confirming a lift.
- A developer working on a half-finished feature deploys to production with the flag off. No feature branch, no long-running merge conflict, no drama.
- A QA engineer shares a URL with a specific set of override flags encoded in the query string so a product manager can reproduce a bug that only manifests with three flags in a particular combination.
- A designer uses the Flags Explorer to switch between three variants of a landing page hero without asking an engineer to change any code, comparing them side-by-side in different tabs.
- An enterprise team uses branch-level recommendations to ensure every reviewer of a PR automatically sees the feature under review enabled in the preview deployment.

## What It Doesn't Do

Flag evaluation in Vercel's system is server-side — you cannot evaluate a flag after the page has loaded without an additional request or rendering cycle. For purely client-side experiments (changing a color on hover based on a flag), you either need to pass the flag value down from the server or accept a brief state where the default is shown first. The `FLAGS_SECRET` must be defined in Vercel's dashboard environment variables; a locally-defined `.env` value alone is not sufficient for the toolbar to decrypt overrides.

## Further Reading

- [Flags overview](https://vercel.com/docs/flags)
- [Flags Explorer](https://vercel.com/docs/flags/flags-explorer)
- [Flags Explorer reference — Discovery Endpoint, FLAGS_SECRET, override cookie](https://vercel.com/docs/flags/flags-explorer/reference)
- [Flags SDK reference](https://vercel.com/docs/flags/flags-sdk-reference)
- [Flags observability with Web Analytics](https://vercel.com/docs/flags/observability/web-analytics)
- [Vercel Toolbar](https://vercel.com/docs/vercel-toolbar)

*Next: [Monorepos](#/monorepos) — first-class support for multi-project repositories.*
