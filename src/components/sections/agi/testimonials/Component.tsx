import { Section, type SectionSettings } from "@/components/fields/section"
import { SectionIntro } from "@/components/sections/agi/intro"

export type TestimonialsListBlockProps = {
  kicker?: string | null
  heading?: string | null
  intro?: string | null
  items?: Array<{ id?: string | null; quote: string; name?: string | null; note?: string | null }> | null
  sectionSettings?: SectionSettings | null
}

function initials(name?: string | null) {
  if (!name) return ""
  const words = name
    .replace(/[^\p{L}\s'-]/gu, " ")
    .split(/\s+/)
    .filter(w => w && !/^(of|the|a|an|de|du|la|le|des|et|and)$/i.test(w))
  return words
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join("")
}

export function TestimonialsListComponent({
  kicker,
  heading,
  intro,
  items,
  sectionSettings,
}: TestimonialsListBlockProps) {
  return (
    <Section sectionSettings={sectionSettings ?? undefined} containerClassName="agi-block">
      <SectionIntro kicker={kicker} heading={heading} intro={intro} />
      {items?.length ? (
        <div className="agi-testimonials grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <figure key={item.id ?? index} className="agi-testimonial">
              <blockquote>{item.quote}</blockquote>
              {item.name || item.note ? (
                <figcaption>
                  {item.name ? (
                    <i className="agi-avatar" aria-hidden>
                      {initials(item.name)}
                    </i>
                  ) : null}
                  <span className="agi-who">
                    {item.name ? <b>{item.name}</b> : null}
                    {item.note ? <span>{item.note}</span> : null}
                  </span>
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}
    </Section>
  )
}
