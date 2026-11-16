import { mongooseAdapter } from "@payloadcms/db-mongodb"

// MongoDB only. The Postgres adapter was imported here statically, which pulled
// pg/drizzle into every server bundle (a 128 MB function limit on EdgeOne Makers).
// SmartSite's canonical runtime is MongoDB in every environment (hosting-modes.md).
const provider = process.env.DATABASE_PROVIDER
if (provider !== "mongoose")
  throw new Error(
    "Set DATABASE_PROVIDER=mongoose. This build supports MongoDB only. See getting-started.md."
  )
const target = process.env.SMARTSITE_DATABASE_TARGET || "default"
if (!["default", "prod", "staging"].includes(target))
  throw new Error("Unknown database target")
const connectionUrl =
  target === "staging" ? process.env.STAGING_DATABASE_URL : process.env.DATABASE_URL
if (!connectionUrl)
  throw new Error(
    "The explicitly selected database URL is missing; no fallback is permitted"
  )
export const databaseInfo = { target, provider, url: connectionUrl }
export default mongooseAdapter({ url: connectionUrl })
