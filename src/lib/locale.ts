/*************************************************************************/
/*  SITE LANGUAGES (language trees)
/*
/*  English pages live at the root ("/admissions"), French under "/fr"
/*  ("/fr/admissions") and Arabic under "/ar" ("/ar/admissions").
/*  Pages are linked across languages by sharing the same slug path.
/*  Safe to import from server and client code.
/*************************************************************************/

export const SITE_LOCALES = ["en", "fr", "ar"] as const
export type SiteLocale = (typeof SITE_LOCALES)[number]
export const DEFAULT_LOCALE: SiteLocale = "en"

export const LOCALE_META: Record<
  SiteLocale,
  { label: string; name: string; dir: "ltr" | "rtl"; hreflang: string }
> = {
  en: { label: "EN", name: "English", dir: "ltr", hreflang: "en" },
  fr: { label: "FR", name: "Français", dir: "ltr", hreflang: "fr" },
  ar: { label: "ع", name: "العربية", dir: "rtl", hreflang: "ar" },
}

function normalize(path: string): string {
  const clean = (path || "/").split(/[?#]/)[0] || "/"
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : "/"
}

/** Locale of a path: "/fr/x" → "fr", "/ar" → "ar", anything else → "en". */
export function localeFromPath(path: string | null | undefined): SiteLocale {
  const first = normalize(path || "/").split("/")[1]
  return first === "fr" || first === "ar" ? first : DEFAULT_LOCALE
}

/** Path without its language prefix: "/fr/admissions" → "/admissions". */
export function stripLocale(path: string): string {
  const p = normalize(path)
  const locale = localeFromPath(p)
  if (locale === DEFAULT_LOCALE) return p
  const rest = p.slice(locale.length + 1)
  return rest ? rest : "/"
}

/** Same page in another language: ("/fr/admissions", "ar") → "/ar/admissions". */
export function localizePath(path: string, target: SiteLocale): string {
  const base = stripLocale(path)
  if (target === DEFAULT_LOCALE) return base
  return base === "/" ? `/${target}` : `/${target}${base}`
}

/** Every language version of a path, e.g. for hreflang. */
export function alternatePaths(path: string): Record<SiteLocale, string> {
  return {
    en: localizePath(path, "en"),
    fr: localizePath(path, "fr"),
    ar: localizePath(path, "ar"),
  }
}

/** Pick the per-language variant of a field: navItems / navItemsFr / navItemsAr. */
export function pickLocalized<T>(
  data: Record<string, unknown> | null | undefined,
  field: string,
  locale: SiteLocale
): T | undefined {
  if (!data) return undefined
  if (locale !== DEFAULT_LOCALE) {
    const key = `${field}${locale === "fr" ? "Fr" : "Ar"}`
    const value = data[key] as T | undefined
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) return value
  }
  return data[field] as T | undefined
}

/** Inline script for <head>: sets <html lang/dir> before first paint. */
export const LOCALE_HEAD_SCRIPT = `(function(){try{var s=location.pathname.split('/')[1];var d=document.documentElement;if(s==='ar'){d.lang='ar';d.dir='rtl'}else if(s==='fr'){d.lang='fr';d.dir='ltr'}else{d.lang='en';d.dir='ltr'}}catch(e){}})();`
