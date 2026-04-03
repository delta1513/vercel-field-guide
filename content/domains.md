# Domains: Custom Addresses with Automatic HTTPS

Every Vercel deployment comes with a URL out of the box. Push to `main`, get `your-project.vercel.app`. It works, it's fast, it's on HTTPS. For internal tools, preview links, and early-stage projects, that might be enough. But at some point, the project needs its own address — the one that goes on business cards, in email footers, in the browser bookmark. That's where Vercel's domain management comes in.

Vercel handles domains end-to-end: verification, DNS configuration guidance, TLS certificate provisioning, and the connection between domain and deployment. The certificate is automatic, issued by Let's Encrypt within minutes of DNS propagation, and renews itself without any action on your part. HTTPS is not a premium feature or an add-on. It just happens.

The part that trips people up is DNS. Vercel doesn't control the registrar where you bought the domain — that's your GoDaddy or Namecheap or Route 53 account. What Vercel guides you through is setting the right DNS records at that registrar so traffic reaches Vercel's servers. Once those records propagate, the rest is automatic.

## How It Works

Adding a custom domain to a Vercel project takes a few clicks in the project's Settings → Domains section. You type the domain, Vercel checks its status, and the dashboard shows you exactly what DNS record to configure at your registrar.

Three configuration paths exist. For **apex domains** (the bare `example.com`, no subdomain), Vercel asks for an **A record** pointing to `76.76.21.21` — Vercel's anycast IP address, distributed across the same global edge network that serves all deployments. For **subdomains** (`www.example.com`, `app.example.com`), a **CNAME record** pointing to a project-specific Vercel DNS hostname works. Both options also support a third path: transferring DNS management to **Vercel's nameservers** entirely, which gives Vercel full control over your zone and unlocks wildcard domain support.

**Wildcard domains** (`*.example.com`) require the nameserver path because of how TLS certificates work. Vercel uses Let's Encrypt's DNS-01 challenge for wildcard certificate issuance, which requires the ability to create a `_acme-challenge` DNS record automatically. If your DNS isn't managed by Vercel, there's no way to complete that challenge. Switch nameservers, and wildcard subdomains — each pointing to a different deployment or tenant — become available.

TLS certificates use Let's Encrypt for all non-wildcard domains via the HTTP-01 challenge method: once DNS is pointed at Vercel and requests can reach Vercel's infrastructure, the certificate is issued and installed automatically. Wildcard certificates use DNS-01 and require Vercel nameservers. Enterprise teams can upload custom certificates, but for nearly everyone the automatic path is the right one. The `/.well-known` path is reserved by Vercel for certificate validation and cannot be rewritten or redirected.

Hobby plan accounts can add up to **50 custom domains per project**. Every plan gets automatic HTTPS.

Domains aren't just pointed at projects — they can be pointed at specific deployments, specific git branches, or specific custom environments. Assigning `staging.example.com` to your `staging` branch means that domain always reflects the latest deployment of that branch, with the environment variables you've configured for staging. This is how teams build multi-stage promotion pipelines without managing separate Vercel projects.

**Redirects** are managed in the same domain settings. If you add an apex domain, Vercel prompts you to also add `www` so you can set up the canonical redirect. A visitor hitting `http://example.com` gets redirected to `https://www.example.com` (or vice versa, depending on your preference) without you writing any redirect rules. The platform handles the canonical domain question as part of setup.

## In the Wild

- **Production launch with automatic HTTPS**: A startup finishes their MVP and buys `theirproduct.com`. They add it to Vercel, set an A record at their registrar, and within ten minutes the site is live on HTTPS with a valid Let's Encrypt certificate — all without touching a web server, an nginx config, or a certificate management tool.

- **Wildcard domains for multi-tenant SaaS**: A project management app gives each customer their own subdomain (`teamname.app.com`). The operator switches DNS to Vercel's nameservers, adds `*.app.com` as a wildcard domain, and deploys Next.js middleware that reads the subdomain and serves the right tenant's data. One deployment serves every customer, each at their own URL.

- **Branch-based staging with a real domain**: An agency builds client sites. They assign `staging.client.com` to their `staging` git branch in Vercel's domain settings. The client reviews changes at a real URL they recognize — not a `vercel.app` address — before approving a merge to production.

- **Migrating DNS to Vercel for full control**: An established company moves their DNS management to Vercel's nameservers, consolidating their domain records alongside their deployment configuration. DNS changes that used to require a separate tool now happen in the same dashboard as deployments, environment variables, and project settings.

- **Assigning domains to specific deployments**: A team does a phased rollout by pointing a beta subdomain (`beta.example.com`) at a specific deployment while production traffic still hits the stable version. Real users test the new build, the team monitors error rates, and promotion to the main domain is a single reassignment in the dashboard.

## What It Doesn't Do

Vercel is not a domain registrar in the traditional sense. You can purchase domains through Vercel (`vercel buy domain example.com`), but the primary expectation is that you already own the domain elsewhere and are configuring DNS to point at Vercel. The platform is a deployment target, not a registrar.

Custom TLS certificates — if you need a certificate from a specific CA for compliance reasons — are an Enterprise feature. Let's Encrypt certificates are what everyone else gets, and for most applications they're indistinguishable from paid certificates in terms of browser trust and encryption strength.

## Further Reading

- [Adding & Configuring a Custom Domain](https://vercel.com/docs/domains/working-with-domains/add-a-domain) — Step-by-step guide to A records, CNAME records, and wildcard domain setup.
- [Working with DNS](https://vercel.com/docs/domains/working-with-dns) — Reference for DNS record types, how they work, and how to configure them with your registrar.
- [Working with Nameservers](https://vercel.com/docs/domains/working-with-nameservers) — How to transfer DNS management to Vercel's nameservers and why wildcard domains require it.
- [Working with SSL Certificates](https://vercel.com/docs/domains/working-with-ssl) — Let's Encrypt integration, HTTP-01 and DNS-01 challenges, and certificate renewal.
- [Assign a Domain to a Git Branch](https://vercel.com/docs/domains/working-with-domains/assign-domain-to-a-git-branch) — Pointing a custom domain at a specific branch for staging or multi-phase deployment workflows.

*Next: [Functions](#/functions) — serverless compute on Vercel.*
