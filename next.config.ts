import { withPayload } from "@payloadcms/next/withPayload"
import path from "path"
import { fileURLToPath } from "url"
import redirects from "./redirects.js"
import { NextConfig } from "next"

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"

// "off" replaces the native sharp module with a stub at build time (and Payload
// gets no sharp), keeping ~35 MB of libvips out of size-limited serverless
// functions such as EdgeOne Makers' 128 MiB SSR function.
const IMAGE_PROCESSING = process.env.SMARTSITE_IMAGE_PROCESSING === "off" ? "off" : "sharp"
const SHARP_STUB = "./src/payload/sharp-stub.ts"
const IMAGE_LIBRARY = "@/payload/image-library"

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
  ...(process.env.SMARTSITE_DEPLOY_TARGET === "edgeone"
    ? {
        experimental: {
          // EdgeOne SSR Cloud Functions are limited to 128 MiB: no server source maps.
          serverSourceMaps: false,
          // The Makers free builder has a 6 GB container with ~2 GB used by the
          // repo in /dev/shm: keep build parallelism low there.
          ...(process.env.SMARTSITE_LOW_MEMORY_BUILD !== "false"
            ? { cpus: 1, workerThreads: false }
            : {}),
        },
        // Files traced into the server bundle that are never used at runtime.
        outputFileTracingExcludes: {
          "*": [
            // typescript is loaded at server start by @payloadcms/plugin-mcp:
            // keep lib/typescript.js, drop the compiler CLI, tsserver and locales.
            "**/node_modules/typescript/lib/*.d.ts",
            "**/node_modules/typescript/lib/tsc.js",
            "**/node_modules/typescript/lib/_tsc.js",
            "**/node_modules/typescript/lib/tsserver*.js",
            "**/node_modules/typescript/lib/_tsserver.js",
            "**/node_modules/typescript/lib/*ypingsInstaller.js",
            "**/node_modules/typescript/lib/watchGuard.js",
            "**/node_modules/typescript/lib/*/diagnosticMessages.generated.json",
            ...(IMAGE_PROCESSING === "off"
              ? ["**/node_modules/sharp/**", "**/node_modules/@img/**"]
              : []),
            "**/node_modules/@img/sharp-libvips-linuxmusl-*/**",
            "**/node_modules/@img/sharp-linuxmusl-*/**",
            "**/*.map",
            "**/*.d.ts",
            "**/*.d.mts",
            "**/*.d.cts",
          ],
        },
      }
    : {}),
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    ...(IMAGE_PROCESSING === "off"
      ? { resolveAlias: { sharp: SHARP_STUB, [IMAGE_LIBRARY]: SHARP_STUB } }
      : {}),
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
    ...(IMAGE_PROCESSING === "off" ? [] : ["sharp"]),
  ],
  // Inline the build-time choice so the runtime agrees with what was bundled.
  env: { SMARTSITE_IMAGE_PROCESSING: IMAGE_PROCESSING },
  ...(IMAGE_PROCESSING === "off"
    ? {
        webpack: (config: any) => {
          config.resolve.alias = {
            ...config.resolve.alias,
            sharp$: path.resolve(projectRoot, SHARP_STUB),
            [`${IMAGE_LIBRARY}$`]: path.resolve(projectRoot, SHARP_STUB),
          }
          return config
        },
      }
    : {}),
} as NextConfig

export default withPayload(nextConfig, { devBundleServerPackages: false })
