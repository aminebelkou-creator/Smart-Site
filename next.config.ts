import { withPayload } from "@payloadcms/next/withPayload"
import path from "path"
import { fileURLToPath } from "url"
import redirects from "./redirects.js"
import { NextConfig } from "next"

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

// The project owns its build graph, including when developed inside a workspace.
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  // Vercel and EdgeOne Makers own their deployment output; standalone is for
  // self-hosted builds. Next 16.3 cannot combine its standalone finalizer with
  // the Vercel adapter, and Makers' builder expects a regular .next output.
  output:
    process.env.VERCEL || process.env.SMARTSITE_DEPLOY_TARGET === "edgeone"
      ? undefined
      : "standalone",
  poweredByHeader: false,
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  images: {
    // Match the starter's thumbnail, default and hero quality presets.
    qualities: [75, 85, 90],
    localPatterns: [
      // Payload media carries an updatedAt cache key; ordinary public assets do not.
      { pathname: "/api/media/file/**" },
      { pathname: "/**", search: "" },
    ],
    remotePatterns: [
      ...[NEXT_PUBLIC_URL, process.env.S3_PUBLIC_URL].filter(Boolean).map(item => {
        const url = new URL(item as string)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(":", ""),
        }
      }),
      {
        hostname: "picsum.photos",
        protocol: "https",
      },
      {
        hostname: "logoipsum.com",
        protocol: "https",
      },
      {
        hostname: "res.cloudinary.com",
        protocol: "https",
      },
    ],
  },
  devIndicators: false,
  reactStrictMode: true,
  redirects,
  sassOptions: {
    implementation: "sass-embedded",
    quietDeps: true,
    silenceDeprecations: ["import", "global-builtin", "legacy-js-api"],
  },
  // EdgeOne Makers' free builder has a 6 GB container limit with ~2 GB already
  // used by the repo in /dev/shm: keep build parallelism low there.
  ...(process.env.SMARTSITE_DEPLOY_TARGET === "edgeone" &&
  process.env.SMARTSITE_LOW_MEMORY_BUILD !== "false"
    ? { experimental: { cpus: 1, workerThreads: false } }
    : {}),
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  serverExternalPackages: [
    "@payloadcms/db-postgres",
    "@payloadcms/db-vercel-postgres",
    "@payloadcms/drizzle",
    "@esbuild/*",
    "drizzle-kit",
    "esbuild",
    "jsdom",
    "sharp",
  ],
} as NextConfig

export default withPayload(nextConfig, { devBundleServerPackages: false })
