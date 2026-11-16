"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LOCALE_META, SITE_LOCALES, localeFromPath, localizePath } from "@/lib/locale"
import { cn } from "@/lib/ui"

type LanguageSwitchProps = {
  /** Published URIs, so the switch can fall back to a language's homepage. */
  uris?: string[]
  className?: string
  onNavigate?: () => void
}

/** EN | FR | ع switch linking the language versions of the current page. */
export function LanguageSwitch({ uris, className, onNavigate }: LanguageSwitchProps) {
  const pathname = usePathname() || "/"
  const current = localeFromPath(pathname)
  const known = uris ? new Set(uris) : null

  return (
    <nav aria-label="Language" className={cn("flex items-center gap-1 text-[13px]", className)}>
      {SITE_LOCALES.map((locale, index) => {
        const meta = LOCALE_META[locale]
        let href = localizePath(pathname, locale)
        if (known && !known.has(href)) href = localizePath("/", locale)
        const active = locale === current
        return (
          <span key={locale} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden className="text-dark-300">|</span> : null}
            <Link
              href={href}
              hrefLang={meta.hreflang}
              lang={meta.hreflang}
              aria-current={active ? "true" : undefined}
              title={meta.name}
              onClick={onNavigate}
              className={cn(
                "px-1 py-2 font-medium tracking-[0.04em]",
                active ? "text-accent" : "text-primary hover:text-accent"
              )}
            >
              {meta.label}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
