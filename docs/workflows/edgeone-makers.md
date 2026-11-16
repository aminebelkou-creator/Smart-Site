# Hosting on EdgeOne Makers (hosted mode)

EdgeOne Makers is a **hosted** deployment (see [hosting modes](../product-specs/hosting-modes.md)): a managed Node host plus a managed MongoDB. There is no `smartsite-deployment.json` and none of the `self-hosted:*` commands apply.

Stack: EdgeOne Makers (Next.js app, CDN) + MongoDB Atlas (free M0 is enough for one company site) + an S3-compatible bucket for media (Tencent COS).

## Verified platform facts (Nov 2026)

| Item | Value | Consequence |
|---|---|---|
| Cloud Functions runtime | Node 20.19.3 (measured) | `engines` relaxed to `>=20.9.0`; build on Node 20 so incompatible packages fail at build time, not in production. `src/` uses no Node 21+ APIs. |
| Builder | 4 cores / 6 GB, 20 min; Next.js is adapted with `@edgeone/opennextjs-pages` (OpenNext) | `build:edgeone` uses a 3.5 GB V8 heap (Turbopack native memory needs the rest of the 6 GB). |
| Package manager | docs list pnpm ≤ 9 | `edgeone.json` runs pnpm 10.34.8 through `npx`. |
| Function bundle | 128 MB incl. dependencies | Postgres adapter removed from `src/payload/db/config.ts` (it was traced into every bundle). |
| Request body | 6 MB (Cloud Functions) | Media uploads go browser → bucket (`clientUploads`). |
| Persistent disk | none | `SMARTSITE_MEDIA_STORAGE=s3` is mandatory on Makers. |
| `next.config` redirects | not executed | Only the IE notice lives there; real redirects are in MongoDB and still work. |
| Tag revalidation | works, ~8–10 s delay, no stale flip-back (tested on Tencent's ISR demo, Next 15) | Content edits appear after ~10 s. |

## How it is built and deployed

The Makers free builder (6 GB container, about 2 GB already used by the repo in `/dev/shm`) cannot build Next.js + Payload: both Turbopack and webpack were SIGKILLed during compilation. `.github/workflows/edgeone-makers.yml` builds on a GitHub-hosted runner instead and deploys with `edgeone makers deploy` to the direct-upload project `smartsite`.

- Repository secrets: `EDGEONE_API_TOKEN` (Makers console → API Token) and `DATABASE_URL`.
- Optional repository variable: `NEXT_PUBLIC_URL`.
- Runtime variables (`DATABASE_PROVIDER`, `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `SMARTSITE_SITE_ID`, `SMARTSITE_ENVIRONMENT`, `S3_*`) are set on the `smartsite` Makers project.
- EdgeOne builds set `SMARTSITE_IMAGE_PROCESSING=off`: sharp/libvips (~35 MB) is replaced by a stub, Payload stores uploaded originals without generating resized copies, and visitors get resized WebP through Next.js image optimization. MCP uploads validate PNG/JPEG/WebP headers with `src/lib/image-probe.ts`. Self-hosted and local builds keep sharp.
- `scripts/edgeone-build.mjs` logs memory, the exit signal and the traced server bundle size by package. The SSR Cloud Function must stay under 128 MiB.

## One-time setup

1. **MongoDB Atlas**: create an M0 cluster near your users, a database user with access to this database only, and a strong password. Makers has no fixed egress IPs, so Network Access needs `0.0.0.0/0`.
2. **Tencent COS**: create a bucket (public read for objects, private write). Create a sub-account API key limited to that bucket. Add a CORS rule allowing `PUT`, `POST`, `GET`, `HEAD` from your site origin(s), with `*` allowed headers and `ETag` exposed. This is required for direct browser uploads.
3. **Makers project**: import the Git repository. `edgeone.json` sets Node 20.18.0, the install/build commands and the output directory.
4. **Environment variables** in the Makers console (production):

   ```
   DATABASE_PROVIDER=mongoose
   DATABASE_URL=mongodb+srv://...
   PAYLOAD_SECRET=<random>
   PREVIEW_SECRET=<random>
   SMARTSITE_SITE_ID=<new uuid>
   SMARTSITE_ENVIRONMENT=production
   NEXT_PUBLIC_URL=https://your-domain
   SMARTSITE_MEDIA_STORAGE=s3
   S3_BUCKET / S3_REGION / S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
   S3_PUBLIC_URL=https://<bucket>-<appid>.cos.<region>.myqcloud.com
   SMARTSITE_RUNTIME_PROBE=true   # first deploy only, then remove
   ```

   The build pre-renders pages, so these variables must also be available at build time.
5. Follow [first launch](first-launch.md) for administrator creation and content transfer. Do not run local bootstrap against Atlas.

## First-deploy verification

1. `curl https://your-domain/api/smartsite/health` should return `database: true` and `runtime.node`. Expect v20.x. Then remove `SMARTSITE_RUNTIME_PROBE`.
2. Upload an image in the admin. This exercises sharp, presigned upload and COS CORS. Check that the image URL points at `S3_PUBLIC_URL`.
3. **Cache bridge**: edit a published page, then run `curl -s https://your-domain/<page> | grep <new text>` every 2 s. It should match within about 20 s and stay matched. SmartSite refreshes through `src/lib/publication/cache-delivery.ts`, which uses Next 16.3.3 internals. If the admin logs "Publication remains pending", that bridge failed on Makers: content is saved but pages stay stale. Recover with `POST /api/publication` as an administrator, and report it before relying on the host.
4. Submit a contact form. Email is sent only with `RESEND_API_KEY`.
5. Connect an MCP client to `https://your-domain/api/mcp` once.

## Known risks

- The publication cache bridge (point 3) is the one SmartSite-specific path not yet proven on Makers.
- Free plan: no SLA, and the pricing page positions it for non-commercial use. Pro is $10/month.
- Quotas to watch: 1M Cloud Function runs, 50K GB-s memory (pricing page figure) and 5 GB function transfer per month. Media served from COS does not count against them.
- Do not build with the EdgeOne CLI from Windows. Let Makers build from Git on Linux.
