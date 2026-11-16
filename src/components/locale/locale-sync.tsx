"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { LOCALE_META, localeFromPath } from "@/lib/locale"

/** Keeps <html lang/dir> in step with the language of the current page. */
export function LocaleSync() {
  const pathname = usePathname()
  useEffect(() => {
    const locale = localeFromPath(pathname)
    document.documentElement.lang = locale
    document.documentElement.dir = LOCALE_META[locale].dir
  }, [pathname])
  return null
}
