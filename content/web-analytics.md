# Web Analytics: What Your Visitors Did, Without Watching Them

For most of the web's history, knowing your audience meant installing a tracking script that dropped a cookie in every visitor's browser. That cookie followed them around the internet, linked their visits across days and domains, and fed their behavior into a surveillance apparatus that the analytics provider monetized separately from the service you were paying for. Google Analytics was free because the data was the product. The banner asking visitors to consent to cookies — the one everyone dismisses without reading — exists because regulators eventually noticed what was being collected.

Vercel Web Analytics takes a different architecture from the ground up. There are no cookies. There is no cross-site tracking. There is no third-party data sharing. And because the approach is genuinely privacy-preserving rather than compliance-theater, it's GDPR-compliant by default — no consent banner required.

## How It Works

The privacy design is built into how visitors are identified. Instead of a persistent cookie that follows a user over time, Web Analytics creates a **hash from the incoming request** — combining the IP address, User-Agent string, and a few other request properties — and discards the raw inputs. The hash is valid for a single day, then automatically reset. A visitor can't be tracked across different days. A visitor can't be linked between your site and any other site. The hash is a counter, not a profile.

When a visitor first loads your site, the event is recorded as a **page view**. Subsequent navigation within a session is tracked through the native browser History API — the same mechanism your router uses to push URL changes. This means single-page applications, where the URL updates client-side without a full page reload, are tracked accurately without additional configuration.

The dashboard organizes data into three primary views. The **Visitors** tab counts unique visitors in a selected timeframe, de-duplicating by the daily hash. The **Page Views** tab counts total page loads, where the same visitor viewing the same page multiple times contributes multiple events. And the **Bounce Rate** shows the percentage of sessions that ended without any further navigation — a proxy for how well your landing pages are engaging their audience. Because custom events don't factor into bounce rate calculation, filtering the dashboard to a custom event correctly shows a bounce rate of zero.

**Panels** surface breakdowns alongside the primary metrics: top pages, top referrers, geographic distribution, operating systems, browser types, device categories. These are the signals most teams actually need to understand their audience. You can export up to 250 entries from any panel as a CSV.

Beyond passive page tracking, you can instrument **custom events** — recording specific user actions like form submissions, button clicks, or checkout completions. Combined with **feature flag usage** tracking, this makes it possible to run lightweight A/B analyses directly in the Web Analytics dashboard: which variant drove more conversions, which feature flag cohort had lower bounce rate.

One detail worth knowing: Web Analytics filters out bot traffic automatically. Vercel inspects the User-Agent header on incoming requests and excludes traffic from automated processes. Your visitor counts reflect actual humans, not crawlers.

The data lives in Vercel's infrastructure and is accessible from the project dashboard. There's no third-party script to audit, no data processor agreement to negotiate, no external service that could be breached and leak your users' behavioral history.

## In the Wild

- A GDPR-regulated European SaaS product deploys Web Analytics without a consent banner, because no personal data is being collected or processed.
- A news publication compares referrer data week-over-week to understand which social platforms are actually driving traffic versus which ones just feel important.
- An e-commerce product team instruments a custom event on the "Add to Cart" button and tracks it against feature flag variants to measure the impact of a redesign.
- A developer tool checks page-level analytics to discover that a documentation page they thought was low-value is actually one of the top five most visited pages on the site.
- A startup with no budget for analytics tooling uses Web Analytics as their only data source — it's integrated, it requires no maintenance, and it tells them everything they need at their current scale.

## What It Doesn't Do

Web Analytics is not a replacement for product analytics tools like Mixpanel or Amplitude if you need session replay, funnel analysis across complex user journeys, or user-level behavioral tracking tied to account IDs. The privacy-preserving architecture is a deliberate trade-off: you get accurate aggregate signals without individual profiles.

It also doesn't offer real-time data at millisecond granularity, or the kind of deeply configurable dashboards that enterprise analytics platforms provide. For most content sites, documentation, and marketing pages, this is more than enough. For B2B SaaS with complex onboarding funnels, you may want to supplement it.

## Further Reading

- [Vercel Web Analytics docs](https://vercel.com/docs/analytics) — overview and feature reference
- [Quickstart](https://vercel.com/docs/analytics/quickstart) — how to enable Web Analytics for a project
- [Custom events](https://vercel.com/docs/analytics/custom-events) — instrumenting user actions beyond page views
- [Using Web Analytics](https://vercel.com/docs/analytics/using-web-analytics) — the dashboard in depth, including CSV export
- [Feature flags](https://vercel.com/docs/feature-flags) — combining feature flag data with analytics for variant analysis
- [Speed Insights](https://vercel.com/docs/speed-insights) — the companion product for performance monitoring

*Next: [Speed Insights](#/speed-insights) — real Core Web Vitals from real users.*
