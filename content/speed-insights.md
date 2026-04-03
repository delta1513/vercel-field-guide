# Speed Insights: Performance Data From People Who Actually Used Your Site

There are two ways to measure a website's performance. The first is a lab test: a tool like Lighthouse spins up a simulated browser on a simulated network, loads your page, and reports back a score. It's fast, reproducible, and useful. It's also fictional. The simulated network isn't your users' 4G connection dropping in and out. The simulated device isn't the three-year-old Android phone a significant fraction of your audience is running. The simulated user is perfectly patient and never navigates mid-load.

The second approach is field measurement: instrument the actual browsers of actual visitors, collect performance data as they use your site, and aggregate it. This is what Vercel Speed Insights does. The data reflects what your users experienced, not what a Google data center thought they might experience.

## How It Works

Speed Insights collects **Core Web Vitals** — a set of performance metrics defined by Google and the Web Performance Working Group — directly from visitors' browsers. As each user loads a page, interacts with it, and eventually leaves, their browser records timings and ships them back to Vercel. Up to six data points per visit can be collected, depending on what interactions occur.

The metrics break into three categories, each measuring a different dimension of perceived performance.

**Largest Contentful Paint (LCP)** measures loading. Specifically, it's the time from when the page starts loading to when the largest visible element — an image, a hero block, a video thumbnail — is fully rendered. LCP is the metric closest to "when did the page feel loaded to the user." A good LCP is **2.5 seconds or less**.

**Interaction to Next Paint (INP)** measures responsiveness. When a user clicks a button or taps a link, INP measures how long before the browser renders a visual response to that interaction. A high INP means the main thread was busy — probably running JavaScript — and the page felt sluggish or unresponsive. A good INP is **200 milliseconds or less**. INP replaced First Input Delay (FID) as the core responsiveness metric; Speed Insights tracks both during the transition.

**Cumulative Layout Shift (CLS)** measures visual stability. It captures how much the page layout moves around unexpectedly during load — images that pop in and push text down, fonts that swap and reflow a paragraph, banners that appear and shift everything below them. CLS is a calculated score, not a raw time: it combines the fraction of viewport affected by a shift with the distance elements moved. A good CLS is **0.1 or less**. Anything higher is the metric for the experience of going to tap a button and having it jump away at the last second.

Beyond the core three, Speed Insights also collects **First Contentful Paint (FCP)** — when the first content from the DOM appears on screen (target: 1.8 seconds), **Time to First Byte (TTFB)** — server response latency (target: under 800 milliseconds), and Total Blocking Time for deployments using the Virtual Experience Score.

Vercel rolls these individual metrics into a **Real Experience Score (RES)** — a weighted composite from 0 to 100. The score is calculated by mapping each raw metric value against a log-normal distribution of real-world web performance data from the HTTP Archive, then weighting the individual metric scores by their relative impact on perceived user experience. Scores are color-coded: 0–49 is red (poor), 50–89 is orange (needs improvement), 90–100 is green (good). Getting above 90 is the goal; the difference between 99 and 100 is essentially academic.

By default, the dashboard shows data at the **P75 percentile** — meaning the score represents the experience of the 75th-fastest user, not the average. This is intentional: it surfaces the slow tail of your audience, not just the fast center. You can also view P90, P95, and P99 to understand how the worst-case experiences look.

The dashboard organizes data by route, device type, environment (preview vs. production), and geographic distribution. The route breakdown is particularly useful: a global performance score is often dominated by one or two high-traffic but slow pages, and the Kanban view surfaces which routes need attention. Speed Insights tracks data across all deployment environments, so you can compare a preview deployment's performance against production before merging.

## In the Wild

- A Next.js app discovers that its hero image is causing LCP failures on mobile because it's not being served in the right format to the right devices — Speed Insights narrows the problem to a specific route.
- A marketing team notices their landing page CLS score degrade after a content update; the layout shift turns out to be an ad slot that loads after the main content.
- An engineering team uses Speed Insights on preview deployments to verify that a JavaScript optimization improved INP before merging to production.
- A startup checks geographic distribution and discovers that users in Southeast Asia are experiencing TTFB three times higher than users in the US — prompting a look at caching configuration.
- A developer compares P75 vs P99 scores to understand that while most users have a great experience, a small tail of users on slow connections are seeing very poor FCP numbers.

## What It Doesn't Do

Speed Insights measures what happened, not why. It tells you that LCP degraded on a given route after a deployment — it doesn't automatically identify which code change caused it. Debugging requires pairing the signal with your own tooling: profiler traces, Lighthouse audits on specific pages, or commit-by-commit comparison.

Speed Insights also collects data only on **hard navigations** — the first page load in a session. For Next.js apps where most navigation is client-side routing, only the initial load generates data points. Subsequent soft navigations within the same session aren't tracked, which means per-route data is based on sessions that start on those routes.

## Further Reading

- [Speed Insights overview](https://vercel.com/docs/speed-insights) — the official docs and dashboard guide
- [Speed Insights metrics](https://vercel.com/docs/speed-insights/metrics) — detailed breakdown of every metric with scoring criteria
- [Quickstart](https://vercel.com/docs/speed-insights/quickstart) — enabling Speed Insights for a project
- [Core Web Vitals (web.dev)](https://web.dev/vitals/) — Google's authoritative explanation of LCP, INP, and CLS
- [HTTP Archive](https://httparchive.org/) — the real-world dataset Vercel uses for score calibration
- [Web Analytics](https://vercel.com/docs/analytics) — the companion product for visitor and page view data

*Next: [Logs](#/logs) — see what your code did and when.*
