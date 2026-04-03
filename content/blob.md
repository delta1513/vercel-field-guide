# Blob: File Storage Without the Ceremony

Object storage has been a solved problem since S3 launched in 2006. The technical primitives — upload a file, get back a URL, serve it to millions of people — haven't changed much since. What has changed is the friction around those primitives: IAM policies, access control lists, CORS configuration, region selection, SDK installation, credential rotation, and the organizational overhead of connecting a separate AWS account to your application. For many teams, setting up S3 for a simple use case takes longer than writing the application itself.

Vercel Blob is object storage without that ceremony. It lives in your Vercel dashboard, connects to your project via an environment variable, and uses the same `@vercel/blob` SDK you can learn in five minutes. Upload a file from a server function or directly from the browser; get back a URL that serves the content from a globally distributed network. No IAM. No CORS rituals. No separate console to log into.

The underlying infrastructure is Amazon S3 — Vercel Blob inherits S3's 11-nines durability guarantee and 99.99% annual availability. What Vercel adds is the integration layer: the environment variable wiring, the dashboard UI, the CDN layer in front of the storage, and the SDK that handles the protocol details so you don't have to.

## How It Works

A Blob store is the fundamental unit of organization. You create one in your Vercel dashboard (or via the CLI), pick a **region** from 20 options, and connect it to one or more projects. The region choice is permanent — it can't be changed after creation — so pick based on where your users and your functions are located. One project can use multiple stores; one store can be shared across multiple projects.

Files in a Blob store are called **blobs**, and they come in two access modes. **Public blobs** are accessible to anyone with the URL — the URL itself is the credential. The CDN caches them for up to a month by default and serves them directly to browsers without routing through any function. **Private blobs** require authentication to access; your serverless function fetches the file using a read-write token and streams it to the client. You control browser caching via the `Cache-Control` header on your function's response.

The SDK interface is intentionally minimal. The core operations are `put()` to upload, `get()` to download a private blob, `del()` to delete, `list()` to enumerate, `head()` to fetch metadata, and `copy()` to duplicate. Uploads default to preventing overwrites — trying to `put()` to an existing pathname throws an error unless you explicitly pass `allowOverwrite: true`. For most use cases, the recommended pattern is to treat blobs as **immutable**: generate unique pathnames using `addRandomSuffix: true` or embed timestamps, and never update in place.

For large files, **multipart uploads** handle the chunking automatically. Files over 100MB benefit from parallel chunk uploads and per-chunk retry logic — a network hiccup retries just the affected chunk, not the entire file. Both `put()` and the client-upload `upload()` method handle the multipart protocol transparently.

**Client uploads** are worth understanding separately. When a user uploads a file directly from the browser, routing the file bytes through your serverless function wastes bandwidth and burns function execution time. Vercel Blob's client upload flow uses a token exchange: your function calls `handleUpload()` to generate a short-lived upload token (where you can enforce permissions, set size limits, validate file types), and the browser's SDK uses that token to upload directly to Blob storage. Your function never sees the file bytes.

**Caching** behavior differs by access mode. Public blob URLs hit the CDN directly; both the CDN and the browser cache the content, which makes them very fast and very cheap to serve repeatedly. Private blobs are fetched through your function, so the CDN layer is between your function and the Blob store — not between the Blob store and the browser. This matters for performance: for large media files, public storage with direct CDN delivery is significantly faster and cheaper than routing through a function.

**Conditional writes** let you implement optimistic concurrency control via ETags. Read a blob, get its ETag, write with `ifMatch` set to that ETag — the write only succeeds if nobody else has modified the blob in between. If another process updated it first, the SDK throws a `BlobPreconditionFailedError` and you can retry. This is the correct pattern for any scenario where multiple processes might update the same file concurrently.

Blobs are organized by **pathname**, which can include slashes that the dashboard renders as folders. The storage model is flat — there are no real directories — but prefixed pathnames work for logical organization, and `list()` accepts a `prefix` parameter for filtered enumeration. Blobs are returned in lexicographical order by pathname, not by upload time, so if chronological ordering matters, embed a timestamp in the pathname.

## In the Wild

- **User profile photos and avatars**: Client upload flow handles browser-to-Blob transfers directly; `addRandomSuffix: true` generates unique pathnames per upload; public storage serves them fast from the CDN.
- **Document storage for SaaS apps**: Private storage keeps user contracts, invoices, and reports gated behind application authentication. Functions stream files to authenticated users on demand.
- **Video and audio hosting**: Multipart uploads handle large files reliably; Blob's cost-optimized delivery network is 3x cheaper than Fast Data Transfer for large assets where ultra-low latency isn't critical.
- **Build artifacts and generated assets**: At deploy time, put generated PDFs, exports, or reports into Blob storage, then serve the URLs to users without re-running the generation logic on every request.
- **CMS media libraries**: Store images uploaded through a headless CMS admin interface; wire the Blob URLs into your ISR-cached content pages.

## What It Doesn't Do

Vercel Blob is not a database — it has no query language, no secondary indexes, and no structured data model. For metadata-driven lookups ("give me all files uploaded by user X this week"), you'll need a separate database to store that metadata. Blob stores can't change regions after creation, so if your data residency requirements change, you'd need to migrate to a new store. Private blob delivery routes through your functions, which adds latency and function invocation costs compared to public delivery — don't use private storage for high-traffic assets unless the access control is genuinely required. And the CDN cache propagation delay (up to 60 seconds) means overwriting a blob doesn't instantly update what visitors see; the immutable pattern exists for a reason.

## Further Reading

- [Vercel Blob overview](https://vercel.com/docs/vercel-blob) — full documentation covering SDK, access modes, and pricing
- [Server upload quickstart](https://vercel.com/docs/vercel-blob/server-upload) — uploading from serverless functions
- [Client upload quickstart](https://vercel.com/docs/vercel-blob/client-upload) — browser-to-Blob direct uploads with token exchange
- [Vercel Blob SDK reference](https://vercel.com/docs/vercel-blob/using-blob-sdk) — complete API reference for `put`, `get`, `del`, `list`, and more
- [Private storage](https://vercel.com/docs/vercel-blob/private-storage) — authentication, function-mediated delivery, and browser caching patterns
- [Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) — storage GB-months, simple operations, advanced operations, and data transfer costs

*Next: [KV](#/kv) — a Redis-compatible key-value store.*
