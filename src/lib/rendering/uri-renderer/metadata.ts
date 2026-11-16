import type { Metadata } from "next"

import { routingEngine } from "@/lib/routing"
import { cache } from "@/lib/cache"
import { generateMeta } from "@/lib/generate-meta"
import { LOCALE_META, SITE_LOCALES, alternatePaths } from "@/lib/locale"

type ParamsPromise = Promise<{
  uri?: string[]
}>

type GenerateMetadataArgs = {
  params: ParamsPromise
}

export async function generateMetadata({
  params,
}: GenerateMetadataArgs): Promise<Metadata> {
  const { uri = [] } = await params
  const resolvedURI = routingEngine.slugToURI(uri)

  const routeResponse = await cache.getByURI(resolvedURI)

  if (!routeResponse?.document) {
    return {}
  }

  const { document, uriIndex } = routeResponse
  const collection = uriIndex.sourceCollection

  const meta = await generateMeta({
    doc: document,
    collection,
  })

  // hreflang: link the language versions that actually exist
  try {
    const known = new Set(await cache.getAllURIs())
    const paths = alternatePaths(resolvedURI)
    const languages: Record<string, string> = {}
    for (const locale of SITE_LOCALES) {
      if (known.has(paths[locale])) languages[LOCALE_META[locale].hreflang] = paths[locale]
    }
    if (Object.keys(languages).length > 1) {
      if (languages.en) languages["x-default"] = languages.en
      return {
        ...meta,
        alternates: { ...(meta.alternates ?? {}), languages },
      }
    }
  } catch {
    // hreflang is best-effort
  }

  return meta
}
