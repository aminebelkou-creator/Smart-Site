import * as React from "react"

/*************************************************************************/
/*  AGI LOGO – seal + wordmark (matches the AGI v2 site header)
/*************************************************************************/

type LogoProps = React.HTMLAttributes<HTMLSpanElement> & { "aria-hidden"?: boolean }

const LogoPrimary: React.FC<LogoProps> = ({ className = "", ...props }) => (
  <span
    className={`text-primary inline-flex items-center gap-3 ${className}`.replace(
      /\bw-auto\b/,
      ""
    )}
    {...props}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/agi-seal.webp"
      alt=""
      width={44}
      height={44}
      className="h-11 w-11 flex-none object-contain"
    />
    <span className="flex flex-col leading-none">
      <span className="font-heading text-[26px] font-medium tracking-[0.02em]">AGI</span>
      <span className="text-neutral-600 mt-1 hidden text-[10px] tracking-[0.18em] uppercase sm:block">
        American Group International
      </span>
    </span>
    <span className="sr-only">American Group International – home</span>
  </span>
)

export default LogoPrimary
