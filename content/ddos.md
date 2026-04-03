# DDoS Protection: Attacks Absorbed Before They Arrive

A Distributed Denial of Service attack is, at its core, a volume problem. An attacker marshals thousands of machines — a botnet, rented cloud instances, whatever's cheap that week — and directs them all to send requests to one target at once. The goal isn't to find a vulnerability. The goal is to exhaust the target's resources: bandwidth, connection table slots, CPU cycles. When the target is an application running on serverless infrastructure, the threat has an added dimension: every one of those malicious requests could show up on your bill.

Vercel's answer to this is automatic DDoS mitigation that requires no configuration, charges nothing for the traffic it blocks, and applies to every deployment on every plan. It's not an add-on you purchase when your traffic looks scary. It's on, always, by default.

## How It Works

The Vercel Firewall evaluates every incoming request before it reaches your application code. DDoS mitigation is the first layer in that stack — it runs before IP blocking rules, before custom WAF rules, before managed rulesets. Requests that look like part of an attack are dropped at the edge, inside Vercel's infrastructure, before they consume your function invocations or CDN bandwidth.

Vercel mitigates **Layer 3, Layer 4, and Layer 7** attacks. To understand why all three matter: Layer 3 (network) and Layer 4 (transport) attacks flood at the packet level — TCP SYN floods, UDP amplification attacks, ICMP storms. They aim to saturate network links. Layer 7 (application) attacks are more targeted: HTTP floods, slow-read attacks, credential-stuffing campaigns dressed up as normal traffic. They mimic legitimate behavior well enough that dumb volume filters miss them.

To catch Layer 7 attacks specifically, the Vercel Firewall analyzes **hundreds of signals** per request: timing patterns, header composition, request rate, behavioral fingerprints derived from TLS handshake characteristics. It builds a picture of whether traffic looks like it's coming from real browsers or from automation. When a traffic pattern matches known attack signatures, requests are **challenged or blocked in real time**.

During an attack, the system also **scales resources dynamically** on the backend. The edge absorbs the load rather than letting it cascade to your functions. Because Vercel doesn't meter traffic that gets blocked by the firewall, your bill reflects the legitimate requests that were served, not the attack volume that was stopped.

One nuance worth knowing: **Attack Challenge Mode** is a separate control you can enable manually. Normally, mitigation applies to traffic identified as malicious. Attack Challenge Mode challenges all traffic — including potentially legitimate visitors — and forces every browser to solve a JavaScript proof-of-work before getting through. It's a blunt instrument, designed for active attacks, and it's free on all plans. Think of it as a drawbridge you can raise when the attackers are already at the gates.

For situations where mitigation might accidentally block trusted traffic — a business partner behind a shared corporate proxy, a large-scale load test you're intentionally running — you can temporarily **pause system mitigations** for up to 24 hours. This is an escape valve, not a regular workflow. You accept billing responsibility for any traffic that gets through during the pause.

Enterprise teams get an additional layer: **dedicated DDoS support** with direct involvement from a Vercel account representative during large-scale, sustained attacks. For most teams the automated system is enough; for the ones who've been through a targeted campaign, having a human in the loop can matter.

## In the Wild

- A consumer app hit by a botnet during a viral moment: automatic mitigation absorbs the flood without the engineering team taking any action.
- An e-commerce store during a competitor-sponsored DDoS the night before Black Friday: Attack Challenge Mode goes up, legitimate shoppers pass the JS check, the attack traffic is stopped.
- A SaaS company whose IP address was included in a leaked target list: mitigation kicks in automatically; the engineering team sees the spike in the firewall observability view, but doesn't need to intervene.
- A load-testing team running synthetic traffic at scale: pause system mitigations temporarily to ensure the test traffic isn't flagged as an attack.
- An enterprise customer under sustained attack over days: dedicated account rep coordinates with the security team, provides guidance on additional custom rules to layer on top of automatic mitigation.

## What It Doesn't Do

DDoS mitigation is not a replacement for rate limiting or authentication. It addresses large-scale, abnormal traffic patterns — it's not designed to throttle a single legitimate user who's hitting your API too aggressively. For that, you'd add rate limiting via WAF custom rules or middleware.

It also can't protect against attacks that originate from within your application's trust boundary. If an attacker is already authenticated, the DDoS layer won't help. Application-level abuse requires application-level controls.

## Further Reading

- [DDoS Mitigation docs](https://vercel.com/docs/vercel-firewall/ddos-mitigation) — official coverage including billing implications
- [Attack Challenge Mode](https://vercel.com/docs/vercel-firewall/attack-challenge-mode) — how to enable the manual challenge layer
- [Firewall concepts](https://vercel.com/docs/vercel-firewall/firewall-concepts) — L3/L4/L7 explained, rule execution order
- [IP blocking](https://vercel.com/docs/security/vercel-waf/ip-blocking) — complement DDoS mitigation with address-based rules
- [Spend management](https://vercel.com/docs/spend-management) — usage alerts and automatic caps to control billing during attacks
- [Vercel Firewall overview](https://vercel.com/docs/vercel-firewall) — the full multi-layer security system

*Next: [Bot Management](#/bot-management) — control automated traffic to your site.*
