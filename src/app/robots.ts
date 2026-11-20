import type { MetadataRoute } from "next"
import { getServerSideURL } from "@/lib/get-url"
import { allowSearchIndexing } from "@/lib/runtime-environment"

// Read SMARTSITE_ALLOW_INDEXING at request time: the release image is built without it,
// so a prerendered robots.txt would always say "Disallow: /".
export const dynamic = "force-dynamic"

/*************************************************************************/
/*  ROBOTS.TXT GENERATION - SIMPLIFIED FOR SITEMAP INDEX
/*************************************************************************/

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getServerSideURL()
  const allowCrawling = allowSearchIndexing()

  if (allowCrawling) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        crawlDelay: 1,
      },
      sitemap: `${siteUrl}/sitemap.xml`,
      host: siteUrl,
    }
  } else {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }
}
