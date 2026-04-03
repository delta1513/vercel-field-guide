# Vercel Toolbar: The Collaboration Layer Built Into Every Preview

There is a gap between shipping code and getting useful feedback on it. A designer opens a preview URL, spots a problem, and sends a Slack message. The message gets a reply. The reply gets a thread. By the time the issue is resolved, three people have lost the context of what the original deployment even looked like. The Vercel Toolbar exists to close that gap — to make the preview URL itself the place where feedback lives.

The Toolbar is a small, draggable overlay that appears at the edge of every Vercel preview deployment. It is not a browser extension, not a separate tool, not something you install. It is already there. Open a preview link while authenticated to your Vercel account and the toolbar is waiting — dormant by default, a single click away from active. For teams that want it always on, a browser extension and an "Always Activate" preference handle that automatically.

What makes the Toolbar more than a feedback widget is the range of tools it surfaces without ever leaving the page. Comments, feature flag overrides, performance diagnostics, accessibility auditing, draft content previews — all accessible from one persistent interface, all scoped to the specific deployment you are looking at.

## How It Works

The Toolbar is injected into preview deployments automatically. When you open the menu — either by clicking the toolbar icon or pressing a keyboard shortcut — you get access to a suite of tools that each solve a distinct problem in the review-and-iterate workflow.

**Comments** are the most visible feature. Any team member with a Vercel account can click the comment icon, then click anywhere on the page — or highlight text — to drop a pinned comment thread at exactly that spot. The comment is tied to the deployment, not to a URL or a timestamp, which means it survives navigation between pages in the same preview. Pull request owners receive email notifications when comments are created; thread participants get notified on replies. On Pro and Enterprise plans, you can invite external collaborators — clients, stakeholders, contractors — to view and comment on a preview without giving them broader access to your Vercel project. The whole comment history can be linked to Slack for teams that prefer to triage feedback there.

**The Flags Explorer** surfaces all the feature flags your application defines, letting any authenticated team member toggle them on or off for their own browser session without affecting anyone else. The override is stored in a cookie — encrypted by default using your project's `FLAGS_SECRET` — so the change is invisible to automated tests, other reviewers, and production users. You can also save a set of flag overrides as a branch-level recommendation, so that anyone who visits the same preview branch gets prompted to apply your configuration. Sharing via URL is equally easy: copy a link that encodes your current overrides as a query parameter and send it to a colleague.

**Performance tools** include a **Layout Shift Tool** that highlights elements causing Cumulative Layout Shift, and an **Interaction Timing Tool** that tracks the latency of every click, tap, and keyboard event in your session, giving you a live view of Interaction to Next Paint. Neither requires any instrumentation. The toolbar observes the page passively and presents the data inline.

**Draft Mode** and **Edit Mode** extend the toolbar's reach into content workflows. Draft Mode lets you preview unpublished CMS content inside a live deployment — useful for content editors who need to see how a draft article renders before publishing it. Edit Mode adds real-time inline editing on top of that.

An **Accessibility Audit Tool** checks the current page against WCAG 2.0 Level A and AA rules and reports violations directly in the toolbar panel. The **Open Graph inspector** shows you exactly how a page will render as a link preview in Slack, iMessage, or Twitter — catching the wrong thumbnail or missing description before the tweet goes out.

The toolbar can be repositioned by dragging it to either side of the screen. That position sticks across deployments, but only for you — your collaborators see it wherever they last left it.

## In the Wild

- A product designer opens a staging URL for a new onboarding flow, leaves a comment pinned to a button that is 4px off-center, and tags the engineer who built it. The comment thread resolves when a new deployment is pushed.
- A frontend engineer suspects a hero image is causing layout shift. They open the Layout Shift Tool and confirm it in thirty seconds without opening DevTools.
- A marketing manager wants to preview next month's campaign banner — a feature behind a flag — without asking an engineer to toggle a database record. They open the Flags Explorer, switch `campaign-banner` to `on`, and see the result live.
- A product manager shares a preview URL with an external agency, encoding a set of flag overrides in the link so the agency sees the experimental checkout flow, not the control.
- A content team previews a product launch article in Draft Mode to verify formatting, image sizing, and metadata before hitting publish in the CMS.

## What It Doesn't Do

The Toolbar is available on preview deployments by default, but production and localhost require additional setup — either opting in through the dashboard or installing the browser extension. Comments require all participants to have a Vercel account; there is no anonymous commenting. Performance tools in the toolbar are session-level observations, not aggregated field data — for that, you want Speed Insights.

## Further Reading

- [Vercel Toolbar overview](https://vercel.com/docs/vercel-toolbar)
- [Comments documentation](https://vercel.com/docs/comments)
- [Flags Explorer documentation](https://vercel.com/docs/flags/flags-explorer)
- [Layout Shift Tool](https://vercel.com/docs/vercel-toolbar/layout-shift-tool)
- [Enabling the toolbar in production and localhost](https://vercel.com/docs/vercel-toolbar/in-production-and-localhost)
- [Accessibility Audit Tool](https://vercel.com/docs/vercel-toolbar/accessibility-audit-tool)

*Next: [Feature Flags](#/feature-flags) — runtime feature toggles at the edge.*
