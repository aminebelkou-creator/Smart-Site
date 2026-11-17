import * as React from "react"

/**
 * Field wrapper. Fields sit side by side when their widths add up to 100%
 * (e.g. two 50% fields share a row); on phones every field is full width
 * (see .agi-field in agi.css).
 */
export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  const w = Number(width)
  const hasWidth = Number.isFinite(w) && w > 0 && w < 100
  // the row gap is 1rem: subtract this field's share of it so two 50% fields fit on one row
  const basis = hasWidth ? `calc(${w}% - ${(1 - w / 100).toFixed(3)}rem)` : "100%"
  return (
    <div
      className={`agi-field${className ? ` ${className}` : ""}`}
      style={{ flex: `0 0 ${basis}`, maxWidth: basis }}
    >
      {children}
    </div>
  )
}
