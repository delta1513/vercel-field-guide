# WAF: The Firewall You Can Actually Customize

Every web application deployed to the public internet is a target. Scanners probe for SQL injection vectors. Bots hammer login forms. Scrapers consume bandwidth without contributing a dollar in revenue. The question for most developers has never been whether to have a Web Application Firewall — it's always been whether the one bundled into their hosting platform is worth trusting, or whether they need to go bolt Cloudflare on top of everything.

Vercel's answer is the Vercel WAF, the configurable layer inside the broader Vercel Firewall. It was designed to live inside the deployment platform rather than alongside it. That distinction matters: when your firewall is integrated with your build and deployment system, configuration changes propagate instantly — and can be rolled back just as instantly if something goes wrong.

The WAF is available on all Vercel plans. What varies across plans is how much you can configure.

## How It Works

The Vercel Firewall is a multi-layered system. Every incoming request passes through layers in strict order: **DDoS mitigation** first (automatic, no configuration needed), then **IP blocking rules**, then **custom rules**, then **managed rulesets**. Each layer can terminate the request — logging it, challenging it with a JavaScript proof-of-work, or blocking it outright — before the next layer even sees it.

The WAF is the upper portion of that stack: IP blocking, custom rules, and managed rulesets. Together they give you fine-grained control over who reaches your application and under what conditions.

**IP blocking** is the simplest control. You specify individual addresses or CIDR ranges — up to 10 on Hobby, up to 100 on Pro, custom limits on Enterprise — and requests from those addresses are dropped before they consume compute. Enterprise teams can also configure account-level IP blocks that apply across all projects, with CIDR ranges up to `/16` for IPv4 and `/48` for IPv6.

**Custom rules** are more expressive. You can construct conditions based on request path, HTTP method, headers, query parameters, geographic origin, and more. On Enterprise plans, you can match on **JA3 TLS fingerprints**, a technique that identifies the underlying TLS client library — useful for blocking specific attack toolkits even when they rotate IP addresses. When a rule matches, you choose an action: log (pass through but record), challenge (serve a JavaScript check the browser must solve), or deny (return an error). Hobby accounts get 3 custom rules; Pro accounts get 40; Enterprise gets up to 1,000.

**Managed rulesets** are curated collections of rules maintained by Vercel — covering common attack patterns like those targeting SQL injection and cross-site scripting — as well as the bot protection and AI crawler rulesets described elsewhere in this guide. Managed rulesets are an Enterprise-only feature.

When you change a firewall configuration, the update takes effect globally across Vercel's edge network within **300 milliseconds**. If the change causes unexpected behavior — legitimate traffic getting blocked, a rule matching more broadly than intended — you can use the **instant rollback** feature to restore any previous configuration version. The firewall keeps an audit log with timestamps, so recovery is a matter of selecting a version and clicking restore.

Firewall **observability** is baked in at the project level. A live traffic view in the Vercel dashboard shows requests as they arrive, which rules fired, and what actions were taken. For deeper analysis, you can forward firewall events to a SIEM system via Log Drains.

## In the Wild

- An e-commerce store uses IP blocking to prevent known fraud networks — identified from previous chargebacks — from reaching the checkout flow.
- A SaaS product uses custom rules to restrict access to its `/admin` prefix to a specific set of office IP ranges, adding a firewall-layer defense in front of the application's own authentication.
- A media company uses geographic rules to deny traffic from regions where it has no content licensing rights, keeping rights-clearance audits clean.
- An API provider uses JA3 fingerprint matching (Enterprise) to block requests from specific automation toolkits that keep rotating IPs to evade address-based blocks.
- A startup uses the audit log and rollback feature during a traffic spike to quickly test and revert an overly aggressive custom rule without a deployment cycle.

## What It Doesn't Do

The Vercel WAF is not a replacement for application-level security. It can block known-bad traffic at the edge, but it cannot validate business logic, sanitize user input, or protect against vulnerabilities introduced by your own code. It also doesn't perform deep SSL inspection or function as a full SIEM. For enterprise security programs, it's a strong first layer — not the entire defense.

Managed rulesets, the most powerful coverage option, require an Enterprise plan. Pro teams have meaningful control through custom rules, but won't have access to Vercel's curated attack-signature libraries without upgrading.

## Further Reading

- [Vercel WAF overview](https://vercel.com/docs/vercel-firewall/vercel-waf) — official docs covering traffic control options
- [Custom rules reference](https://vercel.com/docs/security/vercel-waf/custom-rules) — how to build and configure rule conditions
- [IP blocking](https://vercel.com/docs/security/vercel-waf/ip-blocking) — project-level and account-level address blocking
- [Managed rulesets](https://vercel.com/docs/security/vercel-waf/managed-rulesets) — Vercel-maintained rule collections (Enterprise)
- [Firewall observability](https://vercel.com/docs/vercel-firewall/firewall-observability) — live traffic views and firewall alerting
- [Vercel Firewall concepts](https://vercel.com/docs/vercel-firewall/firewall-concepts) — rule execution order, challenges, JA3/JA4 fingerprinting

*Next: [DDoS Protection](#/ddos) — automatic attack mitigation at the edge.*
