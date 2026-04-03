# Logs: The Paper Trail Your Code Leaves Behind

Debugging a serverless application has a specific flavor of frustration. There's no server to SSH into. There's no process you can attach a debugger to. When something breaks in production — a function that returned 500, a build that failed mysteriously, an edge case that only appears under real traffic — your only witness is whatever your code wrote to stdout before it died. Logs are not a nice-to-have in this architecture. They're the only artifact you have.

Vercel provides logs at two distinct stages of the application lifecycle — build and runtime — plus a mechanism to ship all of it to wherever your team already keeps their observability infrastructure.

## How It Works

**Build logs** are generated every time Vercel runs a deployment. They record the full output of the build process: which version of Node (or Python, or Go) was invoked, which packages were installed, which compilation steps ran, and any warnings or errors that appeared along the way. When a deployment fails, the build log is typically the first place to look — it will tell you whether the failure was a missing dependency, a TypeScript compilation error, a bad environment variable reference, or something in your framework's build output.

Build logs are available in the Vercel dashboard under the deployment detail view. They're associated with the specific deployment that generated them, so you can look back at any previous deployment's build output without losing context.

**Runtime logs** (also called function logs) are the logs your code emits during execution. A `console.log` in an API route, a structured JSON line written to stdout in a Python function, an error stack trace from a crash — all of it shows up here. Runtime logs are searchable at the project level from within the Vercel dashboard. You can filter by time range, deployment, or text content.

Vercel retains runtime logs for **three days** in the dashboard. This is sufficient for live debugging and post-incident investigation of recent events. For longer retention — compliance requirements, trend analysis, anomaly detection over weeks or months — you need to export logs to an external service.

**Log Drains** are that export mechanism. A Log Drain is a configured destination: you point it at an HTTP endpoint, and Vercel starts streaming log data to that endpoint in real time. From there, you can funnel into Datadog for monitoring, Elastic for search, a custom SIEM for security analysis, or any other service that can receive webhook-style payloads. Drains support not just logs but also **traces** (in OpenTelemetry format), **Speed Insights data**, and **Web Analytics events** — so a single drain infrastructure can consolidate your entire observability output in one place.

Drains are available on Pro and Enterprise plans. The data format is well-documented via the REST API schema system, which distinguishes four drain types: `log` (runtime, build, and static logs), `trace` (distributed tracing), `speed_insights` (Core Web Vitals and performance metrics), and `analytics` (page views and custom events).

Two other log types round out the picture. **Activity logs** record account-level events chronologically: deployments, environment variable changes, team membership updates. They're the audit trail for "what changed and when" at the infrastructure level rather than the application level. **Audit logs** (Enterprise) go further, tracking which team member performed which action — useful for compliance programs that require an operator-level access log. Audit log data can be exported to CSV covering up to 90 days.

The full ecosystem connects to Vercel's broader observability infrastructure. Firewall events can be piped to a SIEM via Log Drains. The **Monitoring** feature (for teams with Observability Plus) lets you build custom queries against your data across all projects. And native integrations — Dash0, Braintrust, and others in the marketplace — provide pre-configured drain destinations with richer tooling on the receiving end.

## In the Wild

- An engineering team opens the build log to find that a deployment failed because a Node package's `postinstall` script was trying to download a binary that had moved URLs — immediately obvious from the build output.
- An on-call engineer uses runtime log search to find the exact error message from a production function crash, with the timestamp, allowing them to correlate it against a database event log.
- A security team sets up a Log Drain to Datadog, routing both runtime logs and firewall events to a single dashboard for real-time threat monitoring.
- A startup uses Activity logs to answer "who changed that environment variable last Tuesday" — turns out it was a contractor who'd since left the project.
- An Enterprise team exports 90 days of Audit logs to satisfy a SOC 2 audit, demonstrating controlled access to the production environment.

## What It Doesn't Do

Three days of runtime log retention in the dashboard is the practical limit without a Log Drain. If you're on Hobby and need longer retention, you'll need to upgrade or accept the limitation. Log Drains themselves are billable on Pro at $0.50 per GB, so high-volume applications should factor that into observability costs.

Logs are also not tracing. A log line tells you that something happened; a distributed trace tells you the full path a request took across services, with timing for each step. Vercel supports OpenTelemetry traces via the same Drain infrastructure, but that's a separate instrumentation concern from basic logging.

## Further Reading

- [Logs overview](https://vercel.com/docs/logs) — build logs, runtime logs, and log types in one place
- [Runtime logs reference](https://vercel.com/docs/logs/runtime) — format, retention, and limits (256KB per log line, 1MB per request)
- [Log Drains](https://vercel.com/docs/drains) — configuring external log destinations, supported data types
- [Drains usage and pricing](https://vercel.com/docs/drains#usage-and-pricing) — plan availability and per-GB billing
- [Audit logs](https://vercel.com/docs/observability/audit-log) — team member action tracking for compliance
- [Firewall observability](https://vercel.com/docs/vercel-firewall/firewall-observability) — routing security events alongside application logs

*Next: [Toolbar](#/toolbar) — the in-browser collaboration overlay.*
