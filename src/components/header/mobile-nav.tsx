"use client"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { CMSLink } from "@/components/fields/link"
import { SocialLinks } from "@/components/fields/social-links"
import type { Header as HeaderType, Setting } from "@/payload-types"
import Link from "next/link"
import * as React from "react"
import { usePathname } from "next/navigation"
import { localeFromPath, pickLocalized } from "@/lib/locale"
import { LanguageSwitch } from "@/components/locale/language-switch"
import { Hamburger } from "@/components/header/hamburger"
import LogoPrimary from "@/components/logos/logo"
import { SearchCommandLauncher } from "@/components/search/search-dialog"

const HOME_LABEL: Record<string, string> = { en: "Home", fr: "Accueil", ar: "الرئيسية" }

/*************************************************************************/
/*  MOBILE NAVIGATION WITH SHEET AND CUSTOM HAMBURGER
/*************************************************************************/

type NavigationSearchConfig = {
  enabled: boolean
  mode: "page" | "modal" | "hybrid"
}

interface MobileNavProps {
  data: HeaderType
  settings?: Setting
  search: NavigationSearchConfig
  uris?: string[]
}

export const MobileNavUpdated: React.FC<MobileNavProps> = ({
  data,
  settings,
  search,
  uris,
}) => {
  const [open, setOpen] = React.useState(false)
  const locale = localeFromPath(usePathname())
  const navItems =
    pickLocalized<NonNullable<HeaderType["navItems"]>>(
      data as unknown as Record<string, unknown>,
      "navItems",
      locale
    ) || []

  const applyItem = navItems.find(({ item }) => item?.link?.appearance === "button")?.item
  const menuItems = navItems.filter(({ item }) => item?.link?.appearance !== "button")
  const homeHref = locale === "en" ? "/" : `/${locale}`

  function handleLinkClick() {
    setOpen(false)
  }

  function handleToggle() {
    setOpen(!open)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Hidden while open: the drawer has its own close button (one ✕, not two). */}
      {open ? null : <Hamburger isOpen={open} onClick={handleToggle} />}
      <SheetContent
        side={locale === "ar" ? "right" : "left"}
        className="smartsite-mobile-menu border-dark-border fixed inset-y-0 left-0 z-[1000] h-full w-[80%] border-r bg-white p-0 xl:hidden"
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden">
          <div className="border-dark-border px-section-x py-content-lg flex items-center justify-between border-b">
            <Link href="/" aria-label="Return to homepage" onClick={handleLinkClick}>
              <LogoPrimary className="h-logo w-auto" />
            </Link>
          </div>

          <div className="px-section-x py-section-sm flex-1 overflow-y-auto">
            <nav className="gap-content flex h-full flex-col">
              <SheetTitle className="sr-only">Menu</SheetTitle>

              <div className="agi-mnav flex flex-1 flex-col">
                {applyItem ? (
                  <CMSLink
                    {...applyItem.link}
                    className="agi-mnav__apply"
                    onClick={handleLinkClick}
                  >
                    {applyItem.link?.label}
                  </CMSLink>
                ) : null}

                <Link href={homeHref} className="agi-mnav__top" onClick={handleLinkClick}>
                  {HOME_LABEL[locale] ?? "Home"}
                </Link>

                {menuItems.map(({ item }, i: number) => {
                  const subs = item?.hasDropdown ? item?.subItems ?? [] : []
                  if (subs.length > 0) {
                    return (
                      <details key={i} className="agi-mnav__group">
                        <summary className="agi-mnav__top">{item.link?.label}</summary>
                        <div className="agi-mnav__subs">
                          {subs.map((childItem, j: number) => (
                            <CMSLink
                              key={j}
                              {...childItem.child.link}
                              className="agi-mnav__sub"
                              onClick={handleLinkClick}
                            >
                              {childItem.child.link?.label}
                            </CMSLink>
                          ))}
                        </div>
                      </details>
                    )
                  }
                  return (
                    <CMSLink
                      key={i}
                      {...item.link}
                      appearance="link"
                      className="agi-mnav__top"
                      onClick={handleLinkClick}
                    >
                      {item.link?.label}
                    </CMSLink>
                  )
                })}

                <div className="agi-mnav__tools">
                  <LanguageSwitch uris={uris} onNavigate={handleLinkClick} className="text-base" />
                  {search.enabled ? (
                    <SearchCommandLauncher
                      mode={search.mode}
                      variant="button"
                      className="text-dark-600 text-left text-sm transition-colors"
                      onNavigate={handleLinkClick}
                    />
                  ) : null}
                </div>
              </div>
            </nav>

            {/* Removed decorative background mark for neutral theme */}
          </div>

          <div className="border-dark-border px-section-x py-content-lg border-t">
            <div className="gap-content-sm text-dark-600 flex flex-col">
              <SheetDescription className="text-dark-600 text-center text-sm">
                © {new Date().getFullYear()} {settings?.general?.siteName || "American Group International"}
              </SheetDescription>
              <SocialLinks
                socialLinks={settings?.social?.socialLinks || []}
                variant="icon"
                className="[&>a]:text-dark-600 [&>a]:hover:text-dark justify-center"
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
