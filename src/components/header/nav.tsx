"use client"

import { CMSLink } from "@/components/fields/link"
import type { Header as HeaderType } from "@/payload-types"
import { SearchCommandLauncher } from "@/components/search/search-dialog"
import { ChevronDown, ChevronRight } from "lucide-react"
import * as React from "react"
import { usePathname } from "next/navigation"
import { localeFromPath, pickLocalized } from "@/lib/locale"
import { LanguageSwitch } from "@/components/locale/language-switch"
import { AgiIcon } from "@/components/sections/agi/icons"

type NavItemLink = NonNullable<HeaderType["navItems"]>[number]["item"]["link"]

type ChildItemType = {
  link: NavItemLink
  group?: string | null
  icon?: string | null
  description?: string | null
  hasChildren?: boolean | null
  subItems?: Array<{ link: NavItemLink }> | null
}

type SubItemType = {
  link: NavItemLink
}

type NavigationSearchConfig = {
  enabled: boolean
  mode: "page" | "modal" | "hybrid"
}

interface HeaderNavigationProps {
  data: HeaderType
  search: NavigationSearchConfig
  uris?: string[]
}

/****************************************************
 * Header Navigation - Main Navigation Of Website
 ****************************************************/

/* Path a nav link points to ("/k12", "/forms"), or null for external links. */
function linkPath(link?: NavItemLink | null): string | null {
  if (!link) return null
  const l = link as any
  const raw =
    l.type === "reference"
      ? typeof l.reference?.value === "object"
        ? l.reference.value?.uri
        : null
      : l.url
  if (!raw || typeof raw !== "string" || /^[a-z]+:/i.test(raw)) return null
  const path = ("/" + raw.replace(/^\/+/, "")).split("#")[0].split("?")[0]
  return path.length > 1 ? path.replace(/\/$/, "") : path
}

function isActive(pathname: string, link?: NavItemLink | null, children?: Array<{ child: ChildItemType }> | null) {
  const paths = [linkPath(link), ...(children || []).map(c => linkPath(c.child?.link))].filter(
    (p): p is string => Boolean(p) && p !== "/"
  )
  return paths.some(p => pathname === p || pathname.startsWith(p + "/"))
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ data, search, uris }) => {
  const pathname = usePathname() || "/"
  const locale = localeFromPath(pathname)
  const navItems =
    pickLocalized<NonNullable<HeaderType["navItems"]>>(
      data as unknown as Record<string, unknown>,
      "navItems",
      locale
    ) || []

  return (
    <nav className="hidden h-full items-center xl:flex">
      <ul className="flex h-full flex-nowrap items-center gap-[14px] whitespace-nowrap">
        {navItems.map(({ item }, i: number) => {
          if (item?.hasDropdown && item?.subItems && item?.subItems?.length > 0) {
            const subs = item.subItems as unknown as Array<{ child: ChildItemType }>
            const active = isActive(pathname, item?.link, subs)
            const rich = subs.some(c => c.child?.description || c.child?.group || c.child?.icon)
            return rich ? (
              <RichDropdown key={i} item={item} active={active} pathname={pathname} />
            ) : (
              <NavItemWithDropdown key={i} item={item} active={active} />
            )
          }
          return <NavItem key={i} link={item?.link} active={isActive(pathname, item?.link)} />
        })}
        <li className="relative flex h-full items-center">
          <LanguageSwitch uris={uris} />
        </li>
        {search.enabled ? (
          <li className="relative flex h-full items-center">
            <SearchCommandLauncher
              mode={search.mode}
              variant="icon"
              className="text-dark hover:text-dark gap-content-xs flex h-full cursor-pointer items-center no-underline transition-colors duration-100"
            />
          </li>
        ) : null}
      </ul>
    </nav>
  )
}

/****************************************************
 * Nav Item
 ****************************************************/

const NavItem: React.FC<{ link: NavItemLink; active?: boolean }> = ({ link, active }) => {
  const isButton = link?.appearance === "button"

  return (
    <li className="relative flex h-full items-center">
      <CMSLink
        className={
          isButton
            ? "cursor-pointer no-underline"
            : `agi-nav-link${active && !isButton ? " is-active" : ""} text-dark hover:text-dark gap-content-xs flex h-full cursor-pointer items-center no-underline transition-colors duration-100`
        }
        {...link}
      >
        {link?.label}
      </CMSLink>
    </li>
  )
}

/****************************************************
 * Dropdown menu item
 ****************************************************/

const NavItemWithDropdown: React.FC<{
  item: NonNullable<HeaderType["navItems"]>[number]["item"]
  active?: boolean
}> = ({ item, active }) => {
  return (
    <li className="group relative flex h-full items-center">
      <CMSLink
        {...item?.link}
        className={`agi-nav-link${active ? " is-active" : ""} text-dark hover:text-dark flex h-full cursor-pointer items-center gap-0 no-underline transition-colors duration-100`}
      >
        <span>{item?.link?.label}</span>
        <ChevronDown className="text-dark-600 ml-1 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
      </CMSLink>

      <div className="absolute top-full left-0 h-1 w-full opacity-0 group-hover:opacity-100" />

      <div className="border-dark-border mt-content-xs translate-y-control-sm pointer-events-none absolute top-auto left-0 z-30 w-56 min-w-full transform rounded-md border bg-white text-sm opacity-0 shadow-lg transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="py-content-sm relative z-10 w-full">
          <ul className="list-none">
            {item.subItems?.map((childItem, j: number) => {
              const child = childItem.child

              if (child.hasChildren && child.subItems && child.subItems.length > 0) {
                return <NestedDropdownItem key={j} child={child} />
              }

              return <DropdownLink key={j} child={child} />
            })}
          </ul>
        </div>
      </div>
    </li>
  )
}

/****************************************************
 * Rich dropdown: icons, one-line descriptions, optional column
 * headings (wide "mega" menu) and a highlight panel.
 ****************************************************/

const RichDropdown: React.FC<{
  item: NonNullable<HeaderType["navItems"]>[number]["item"]
  active?: boolean
  pathname: string
}> = ({ item, active, pathname }) => {
  const subs = (item.subItems || []) as unknown as Array<{ child: ChildItemType }>
  const groups: Array<{ name: string; items: ChildItemType[] }> = []
  subs.forEach(({ child }) => {
    const name = child?.group?.trim() || ""
    let g = groups.find(x => x.name === name)
    if (!g) groups.push((g = { name, items: [] }))
    g.items.push(child)
  })
  const promo = (item as any).promo as
    | { title?: string | null; text?: string | null; link?: NavItemLink | null }
    | undefined
  const hasPromo = Boolean(promo?.title || promo?.text)
  const promoLink = promo?.link && linkPath(promo.link) !== null ? promo.link : null
  const wide = groups.length > 1
  const panelRef = React.useRef<HTMLDivElement>(null)
  /* Keep the centred panel inside the viewport (Programs sits left of centre). */
  const fit = React.useCallback(() => {
    const panel = panelRef.current
    const li = panel?.parentElement
    if (!panel || !li) return
    const vw = document.documentElement.clientWidth
    const box = li.getBoundingClientRect()
    const w = panel.offsetWidth
    const centre = box.left + box.width / 2
    let left = centre - w / 2
    left = Math.min(Math.max(left, 16), vw - 16 - w)
    const shift = Math.round(left - (centre - w / 2))
    panel.style.setProperty("--agi-mega-shift", `${shift}px`)
  }, [])

  return (
    <li className="group relative flex h-full items-center" onMouseEnter={fit} onFocus={fit}>
      <CMSLink
        {...item?.link}
        className={`agi-nav-link${active ? " is-active" : ""} text-dark hover:text-dark flex h-full cursor-pointer items-center gap-0 no-underline transition-colors duration-100`}
      >
        <span>{item?.link?.label}</span>
        <ChevronDown className="text-dark-600 ml-1 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
      </CMSLink>
      <div className="absolute top-full left-0 h-2 w-full" />
      <div ref={panelRef} className={`agi-mega${wide ? " agi-mega--wide" : ""}${hasPromo ? " agi-mega--promo" : ""}`}>
        <div className="agi-mega__cols">
          {groups.map((g, gi) => (
            <div key={gi} className="agi-mega__col">
              {g.name ? <p className="agi-mega__heading">{g.name}</p> : null}
              <ul>
                {g.items.map((child, ci) => {
                  const here = isActive(pathname, child.link)
                  return (
                    <li key={ci}>
                      <CMSLink
                        {...child.link}
                        className={`agi-mega__link${here ? " is-active" : ""}`}
                      >
                        {child.icon ? <AgiIcon name={child.icon} className="agi-mega__icon" /> : null}
                        <span className="agi-mega__text">
                          <span className="agi-mega__label">{child.link?.label}</span>
                          {child.description ? (
                            <span className="agi-mega__desc">{child.description}</span>
                          ) : null}
                        </span>
                      </CMSLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        {hasPromo ? (
          <div className="agi-mega__promo">
            {promo?.title ? <p className="agi-mega__promo-title">{promo.title}</p> : null}
            {promo?.text ? <p className="agi-mega__promo-text">{promo.text}</p> : null}
            {promoLink ? (
              <CMSLink {...promoLink} appearance="inline" className="agi-mega__promo-btn">
                {promoLink?.label}
              </CMSLink>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  )
}

/****************************************************
 * Nested dropdown section
 ****************************************************/

const NestedDropdownItem: React.FC<{ child: ChildItemType }> = ({ child }) => {
  return (
    <li className="group/nested relative">
      <div className="text-dark hover:bg-neutral gap-content-xs px-content py-content-sm flex w-full cursor-pointer items-center text-sm no-underline transition-colors duration-100">
        <span className="flex-1">{child?.link?.label}</span>
        <ChevronRight className="text-dark-600 ml-content-xs h-4 w-4" />
      </div>

      <div className="absolute top-0 right-0 h-full w-1 opacity-0 group-hover/nested:opacity-100" />

      <div className="border-dark-border ml-content-xs translate-y-control-sm pointer-events-none absolute top-0 left-full z-30 w-56 min-w-full transform rounded-md border bg-white text-sm opacity-0 shadow-md transition-all duration-300 group-hover/nested:pointer-events-auto group-hover/nested:translate-y-0 group-hover/nested:opacity-100">
        <div className="py-content-sm relative z-10 w-full">
          <ul className="list-none">
            {child?.subItems?.map((subItem: SubItemType, k: number) => (
              <li key={k}>
                <CMSLink
                  className="text-dark hover:bg-neutral gap-content-xs px-content py-content-sm flex w-full cursor-pointer items-center text-sm no-underline transition-colors duration-100"
                  {...subItem.link}
                >
                  <span className="flex-1">{subItem.link?.label}</span>
                </CMSLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

/****************************************************
 * Single dropdown link item
 ****************************************************/

const DropdownLink: React.FC<{ child: ChildItemType }> = ({ child }) => {
  return (
    <li>
      <CMSLink
        className="text-dark hover:bg-neutral gap-content-xs px-content py-content-sm flex w-full cursor-pointer items-center text-sm no-underline transition-colors duration-100"
        {...child.link}
      >
        <span className="flex-1">{child.link?.label}</span>
      </CMSLink>
    </li>
  )
}
