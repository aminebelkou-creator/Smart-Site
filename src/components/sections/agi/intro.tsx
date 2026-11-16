import { parseHeadingGradient } from "@/components/heading-gradient"

export type IntroProps = {
  kicker?: string | null
  heading?: string | null
  intro?: string | null
  centered?: boolean
}

/** Section head shared by the AGI blocks (kicker · heading · intro). */
export function SectionIntro({ kicker, heading, intro, centered }: IntroProps) {
  if (!kicker && !heading && !intro) return null
  return (
    <div className={`agi-head${centered ? " agi-head--center" : ""}`}>
      {kicker ? <p className="agi-kicker">{kicker}</p> : null}
      {heading ? <h2>{parseHeadingGradient(heading) ?? heading}</h2> : null}
      {intro ? <p className="agi-intro">{intro}</p> : null}
    </div>
  )
}
