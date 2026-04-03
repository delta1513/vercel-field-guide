# Image Optimization: Automatic Resizing on the Edge

Images are responsible for the majority of bytes transferred on most web pages, and historically they've been a source of sustained pain: maintaining multiple resized variants, converting to modern formats, handling responsive breakpoints, wiring up lazy loading. The alternatives — running your own ImageMagick pipeline, paying for a dedicated image service — added cost and complexity with no direct relationship to your application code.

Vercel's Image Optimization bakes that pipeline into the deployment. You reference an image in your component, Vercel handles the rest: resizing for the device, converting to WebP or AVIF, caching the result at the edge, and serving it from the CDN closest to the visitor. No separate image service to configure. No pipeline to maintain. No coordination between your code and a third-party CDN.

The feature is available across frameworks — Next.js, Nuxt, Astro, and others — and for projects that don't use a framework at all. The entry point is slightly different in each, but the underlying pipeline is the same.

## How It Works

The optimization cycle begins in your component. When you use a framework's image component — `next/image`, Nuxt's `<NuxtImg>`, Astro's `<Image>` — instead of a plain HTML `<img>` tag, the framework generates a request to Vercel's image optimization API rather than loading the image directly from its source. A plain `<img>` tag bypasses the pipeline entirely; only the framework components route through it.

The API endpoint is **`/_vercel/image`** (or `/_next/image` for Next.js). Requests arrive with three query parameters: `url` (the source image, local or remote), `w` (the target width in pixels), and `q` (quality, from 1 to 100). The framework generates these URLs automatically based on the viewport, the `sizes` prop, and the device pixel ratio — you don't construct them by hand.

When a request hits the endpoint, Vercel first checks the **image cache**. Cache keys combine the project ID, the width, the quality, the `Accept` header (to distinguish browsers that support AVIF from those that only handle WebP), and a content hash or absolute URL of the source. If there's a cache hit, the optimized image is returned immediately from the CDN. If there's a miss, Vercel fetches the source image, runs the transformation — resizing to the requested width, converting to the best format the browser supports — stores the result in the cache, and serves it.

**Format selection** is automatic and degrades gracefully. Browsers that send an `Accept: image/avif` header get AVIF, which offers roughly 50% smaller files than WebP at equivalent quality. Browsers that support WebP get WebP. Older clients get the original format. The `Accept` header is normalized as part of the cache key, so each format variant is cached separately.

**Local images** (stored in your `public` folder and imported directly) use a content hash as part of their cache key. That means if you replace an image file with new content, the hash changes and a fresh transformation is triggered automatically. **Remote images** (external URLs) use the absolute URL as the cache key, and expiration follows the `Cache-Control` response header from the upstream source or a configured minimum TTL, whichever is larger.

The image cache lives on the **Vercel CDN** and persists for up to 31 days for local images. Redeploying your application does not invalidate the image cache — a deliberate choice that prevents cold-start performance regressions after every deploy. To force re-optimization, you can manually or programmatically purge specific cache entries.

Before any remote image can be optimized, its hostname must be declared in **`remotePatterns`** in your framework config. This prevents your optimization quota from being consumed by arbitrary external URLs. Local images require corresponding **`localPatterns`** configuration. Both are validated at request time, and requests for unconfigured sources are rejected.

## In the Wild

- **Product photography**: E-commerce pages with hero images and gallery thumbnails. Vercel serves a 400px WebP to mobile visitors and a 1600px AVIF to desktop — same source image, right variant for each device.
- **User-uploaded avatars and profile photos**: Images uploaded at runtime are stored (often in Vercel Blob) and served through the optimization pipeline on every request, resized and converted without any background job.
- **CMS-driven editorial content**: Article hero images sourced from a headless CMS. Remote patterns allow the CMS hostname; Vercel handles the rest.
- **Marketing landing pages**: High-resolution photography compressed to AVIF cuts LCP times significantly — often the single biggest Core Web Vitals win available.
- **Portfolio and photography sites**: Full-bleed images that need to look perfect across every device while not destroying mobile data budgets.

## What It Doesn't Do

Image Optimization is not a good fit for every image on the page. Small icons and thumbnails under 10KB don't benefit and just consume transformation quota unnecessarily. GIFs are not converted or otherwise optimized — animated images pass through unchanged. SVGs are vector formats and don't need rasterization; the pipeline skips them. Images that change frequently and must always be fresh can be tricky: the cache takes up to 60 seconds to propagate updates, and browsers maintain their own cache independently of Vercel's CDN layer.

## Further Reading

- [Image Optimization overview](https://vercel.com/docs/image-optimization) — official documentation with full configuration reference
- [Image Optimization quickstart](https://vercel.com/docs/image-optimization/quickstart) — framework-specific setup for Next.js, Nuxt, and Astro
- [next/image component](https://nextjs.org/docs/app/api-reference/components/image) — full API reference for Next.js's image component
- [Image cache behavior](https://nextjs.org/docs/app/api-reference/components/image#caching-behavior) — TTL, cache keys, and invalidation in Next.js
- [Image Optimization pricing](https://vercel.com/docs/image-optimization/limits-and-pricing) — transformation counts, cache reads/writes, and plan limits
- [Build Output API: Images](https://vercel.com/docs/build-output-api/v3/configuration#images) — for custom framework authors who want to implement image optimization from scratch

*Next: [ISR](#/isr) — update static pages without a full rebuild.*
