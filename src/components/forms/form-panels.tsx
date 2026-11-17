"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * "One form at a time" for pages that hold several forms.
 * Sections with the class "agi-form-panel" (Section Settings → Attributes → class)
 * become panels: only the one named in the URL hash is shown (#visit, #enrollment…),
 * the first one otherwise. Links to "#id" (e.g. a chooser with the class
 * "agi-form-chooser") switch panels. Without JavaScript every form stays visible.
 */
export function FormPanels() {
  const pathname = usePathname()

  useEffect(() => {
    const panels = Array.from(document.querySelectorAll<HTMLElement>("section.agi-form-panel"))
    const root = document.documentElement
    if (panels.length < 2) {
      root.classList.remove("agi-panels")
      return
    }
    root.classList.add("agi-panels")

    const ids = panels.map(p => p.id).filter(Boolean)
    const fromHash = () => decodeURIComponent(window.location.hash.slice(1)).split("/")[0]

    const activate = (scroll: boolean) => {
      const wanted = fromHash()
      const id = ids.includes(wanted) ? wanted : ids[0]
      panels.forEach(p => p.classList.toggle("is-active", p.id === id))
      document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(a => {
        const href = a.getAttribute("href") || ""
        if (!href.includes("#")) return
        const target = href.split("#")[1]?.split("/")[0]
        if (!ids.includes(target || "")) return
        if (target === id) a.setAttribute("aria-current", "true")
        else a.removeAttribute("aria-current")
        a.closest(".agi-card")?.classList.toggle("is-current", target === id)
      })
      if (scroll && ids.includes(wanted)) {
        const panel = document.getElementById(id)
        if (panel) {
          const top = panel.getBoundingClientRect().top + window.scrollY - 90
          window.scrollTo({ top, behavior: "smooth" })
        }
      }
    }

    activate(false)
    const onHash = () => activate(true)
    window.addEventListener("hashchange", onHash)
    return () => {
      window.removeEventListener("hashchange", onHash)
      root.classList.remove("agi-panels")
    }
  }, [pathname])

  return null
}
