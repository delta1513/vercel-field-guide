# Framework Support: Zero Config for the Whole Ecosystem

Vercel built Next.js, but it didn't build SvelteKit, Nuxt, Astro, Remix, or the dozens of other frameworks that developers actually use. It supports all of them anyway — often as well as tools specifically designed around their own deployment targets. That breadth is not accidental. Vercel made a deliberate architectural bet early on: rather than forcing every framework into a generic Node.js box, build an abstraction layer that lets frameworks express exactly what they need. The result is a platform that deploys Astro and SvelteKit and Nuxt without any configuration from the developer.

The mechanism is framework detection. When you connect a repository, Vercel identifies the framework from package.json, config files, and directory structure. It knows the right build command, the right output directory, and which files are static assets versus dynamic routes. No `vercel.json` needed for a standard project. Push code, get a deployment.

This approach scales because Vercel doesn't try to support every framework equally — it provides a foundation that frameworks can build on themselves. The **Build Output API** defines a file-system specification that any build tool can emit. Framework authors that implement it get Vercel Functions, CDN routing, Middleware, and ISR without writing any Vercel-specific code. The platform reads the output directory; the framework is responsible for producing it correctly.

## How It Works

Framework support rests on three layers. The first is **build detection**: Vercel identifies the framework and runs the appropriate build command. For Next.js that's `next build`; for SvelteKit it's `vite build` with the appropriate adapter; for Astro it reads `astro.config.mjs` to determine the output mode. This is why you don't specify a build command in most projects — Vercel already knows it.

The second layer is the **Build Output API**, Vercel's file-system specification for what a deployment looks like. A directory at `.vercel/output` contains static assets, function definitions, routing rules, and cache configuration. Frameworks that target this spec — and most major ones do — unlock the full platform feature set automatically. Vercel Functions, CDN caching, Middleware, ISR — all of it flows from emitting the right directory structure. Framework authors write adapters (SvelteKit's `@sveltejs/adapter-vercel`, Nuxt's `@nuxt/nuxt-vercel`, Astro's `@astrojs/vercel`) that translate the framework's own output into the Build Output API format.

The third layer is the **feature support matrix**, which varies by framework. Not every framework supports every Vercel feature, and the matrix reflects the capabilities of the underlying framework rather than platform limitations. Streaming SSR is supported for Next.js, SvelteKit, TanStack Start, Astro, and Remix — but not Nuxt. ISR is available for Next.js, SvelteKit, Nuxt, and Astro, but not Remix. Image Optimization works with the `next/image` component in Next.js, Nuxt's `<NuxtImg>`, and Astro's built-in image integration, but Remix has no first-party image component and thus no automatic optimization. The platform doesn't invent capabilities the framework doesn't have; it surfaces the ones it does.

**Multi-runtime support** — running different routes on different execution environments — is available for Next.js, SvelteKit, Nuxt, and Remix. An application can run most routes on Node.js while designating specific routes to the Edge Runtime for sub-millisecond response times. Astro can switch the entire app to the Edge Runtime but doesn't yet support per-route runtime configuration.

**Skew Protection**, which ensures clients and servers always use the same deployment version, is supported for Next.js, SvelteKit, Astro, and TanStack Start. Frameworks that don't have a concept of version-locked client/server communication don't support it, not because Vercel can't implement it, but because the framework itself doesn't expose the necessary hooks.

Vercel-supported frameworks include, but are not limited to: **Next.js**, **SvelteKit**, **Nuxt**, **Remix**, **Astro**, **TanStack Start**, **Vite**, **Create React App**, **Gatsby**, **Hugo**, **Eleventy (11ty)**, **Jekyll**, **Angular**, **Vue**, **Ember**, **Preact**, **Solid**, **Qwik**, **RedwoodJS**, and **Nitro**. Static site generators and client-only frameworks get CDN delivery and preview deployments automatically. Full-stack frameworks get Functions, Middleware, and ISR wherever the framework supports them.

## In the Wild

- **Astro content sites**: A documentation or marketing site built with Astro, deployed with zero configuration. Static pages land on Vercel's CDN; any Astro server endpoints become Functions automatically via the `@astrojs/vercel` adapter.
- **SvelteKit applications**: A SvelteKit app using `@sveltejs/adapter-vercel` gets SSR through Vercel Functions, ISR for cacheable routes, and Middleware for auth and redirects.
- **Nuxt e-commerce**: A Nuxt application with server-rendered product pages, ISR for category listings, and image optimization for product photography — all configured through Nuxt's built-in Vercel integration.
- **Remix full-stack apps**: A Remix application with nested routes and loaders. Vercel detects the Remix build output and provisions Functions for each server-rendered route.
- **Framework-agnostic Build Output API**: A team building a proprietary static site generator emits the `.vercel/output` directory from their build, getting Vercel Functions, CDN routing, and preview deployments without any framework-specific adapter.

## What It Doesn't Do

Zero-config doesn't mean zero differences from self-hosting. Vercel's serverless execution model means no persistent server process — frameworks that assume a long-lived server (some legacy Express.js patterns, WebSocket-heavy architectures) need adaptation. Framework features that require capabilities not in the Build Output API may work locally but not on Vercel. And some framework-specific features — like Nuxt's real-time server features — require specific adapter configurations that aren't always automatic. The framework support matrix is worth checking before committing to a non-Next.js stack for a feature-heavy application.

## Further Reading

- [Frameworks on Vercel overview](https://vercel.com/docs/frameworks)
- [Supported frameworks matrix](https://vercel.com/docs/frameworks/more-frameworks)
- [Build Output API specification](https://vercel.com/docs/build-output-api/v3)
- [SvelteKit on Vercel](https://vercel.com/docs/frameworks/sveltekit)
- [Astro on Vercel](https://vercel.com/docs/frameworks/astro)
- [Nuxt on Vercel](https://vercel.com/docs/frameworks/nuxt)

*Next: [CDN](#/cdn) — how Vercel delivers content globally.*
