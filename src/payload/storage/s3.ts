import { s3Storage } from "@payloadcms/storage-s3"
import type { Plugin } from "payload"

/*************************************************************************/
/*  DURABLE MEDIA STORAGE (S3-COMPATIBLE, e.g. Tencent COS)
/*
/*  Enabled with SMARTSITE_MEDIA_STORAGE=s3. Serverless hosts such as
/*  EdgeOne Makers have no persistent disk, so local uploads would vanish.
/*  When enabled, every variable is required: a missing one fails the
/*  build/boot instead of silently falling back to ephemeral files.
/*
/*  Tencent COS example:
/*    S3_ENDPOINT=https://cos.ap-singapore.myqcloud.com
/*    S3_REGION=ap-singapore
/*    S3_BUCKET=<bucket>-<appid>
/*    S3_PUBLIC_URL=https://<bucket>-<appid>.cos.ap-singapore.myqcloud.com
/*************************************************************************/

const REQUIRED = [
  "S3_BUCKET",
  "S3_REGION",
  "S3_ENDPOINT",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const

export function mediaStoragePlugins(): Plugin[] {
  const mode = process.env.SMARTSITE_MEDIA_STORAGE || "local"
  if (mode === "local") return []
  if (mode !== "s3")
    throw new Error(`Unknown SMARTSITE_MEDIA_STORAGE "${mode}" (use "local" or "s3")`)

  const missing = REQUIRED.filter(name => !process.env[name]?.trim())
  if (missing.length)
    throw new Error(`SMARTSITE_MEDIA_STORAGE=s3 is missing: ${missing.join(", ")}`)

  const prefix = process.env.S3_PREFIX || "media"
  // Optional public base URL for the bucket or its CDN, e.g.
  // https://<bucket>-<appid>.cos.ap-singapore.myqcloud.com
  const publicUrl = process.env.S3_PUBLIC_URL?.trim().replace(/\/+$/, "")

  return [
    s3Storage({
      collections: {
        media: {
          prefix,
          // Media is public (read: anyone), so serve files straight from the
          // bucket/CDN instead of proxying every image through a Cloud Function
          // (which would count against function runs and the 5 GB transfer quota).
          ...(publicUrl
            ? {
                disablePayloadAccessControl: true as const,
                generateFileURL: ({ filename, prefix: filePrefix }) =>
                  `${publicUrl}/${[filePrefix, filename].filter(Boolean).join("/")}`,
              }
            : {}),
        },
      },
      bucket: process.env.S3_BUCKET!,
      // Browser uploads go straight to the bucket via presigned URLs, which
      // avoids the 6 MB Cloud Function request limit. Requires bucket CORS.
      clientUploads: process.env.S3_CLIENT_UPLOADS !== "false",
      config: {
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT!,
        // COS uses virtual-hosted style; set S3_FORCE_PATH_STYLE=true for MinIO/R2-style hosts.
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
    }),
  ]
}
