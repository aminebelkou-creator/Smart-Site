"use client"

import { useEffect, useRef } from "react"

/**
 * Renders a fact value and, inside sections with the "agi-fx" class, counts the
 * number up when it scrolls into view. The server-rendered text is always the
 * final value, so search engines and visitors without JavaScript see it as-is.
 */
export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !el.closest(".agi-fx")) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Only plain numbers with an optional suffix: "46+", "2013", "1,200". Skip "K–12", "1:8".
    const match = value.match(/^(\d[\d,]*)(\D*)$/)
    if (!match) return
    const target = Number(match[1].replace(/,/g, ""))
    const suffix = match[2]
    if (!Number.isFinite(target) || target <= 0) return
    const useComma = match[1].includes(",")
    const start = target >= 1900 && target <= 2100 ? target - 25 : 0
    const format = (n: number) => (useComma ? n.toLocaleString("en-US") : String(n)) + suffix

    let frame = 0
    const run = () => {
      const duration = 1400
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        el.textContent = format(Math.round(start + (target - start) * eased))
        if (p < 1) frame = requestAnimationFrame(tick)
      }
      el.textContent = format(start)
      frame = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      el.textContent = value
    }
  }, [value])

  return <span ref={ref}>{value}</span>
}
