"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { localeFromPath, localizePath } from "@/lib/locale"

/** Logo link that returns to the homepage of the current language. */
export function HomeLink({ children, className }: { children: ReactNode; className?: string }) {
  const locale = localeFromPath(usePathname())
  return (
    <Link href={localizePath("/", locale)} className={className} aria-label="Return to homepage">
      {children}
    </Link>
  )
}
