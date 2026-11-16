"use client"

import { useEffect, useState } from "react"

/** Mobile-only bar that repeats the hero's first button once the hero is scrolled past. */
export function StickyCta({ href, label, newTab }: { href: string; label: string; newTab?: boolean }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className={`agi-sticky-cta${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <a
        href={href}
        tabIndex={visible ? 0 : -1}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {label}
      </a>
    </div>
  )
}
