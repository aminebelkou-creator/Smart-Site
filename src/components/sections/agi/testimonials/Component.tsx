import { Section, type SectionSettings } from "@/components/fields/section"
import { SectionIntro } from "@/components/sections/agi/intro"

export type TestimonialsListBlockProps = {
  kicker?: string | null
  heading?: string | null
  intro?: string | null
  items?: Array<{ id?: string | null; quote: string; name?: string | null; note?: string | null }> | null
  sectionSettings?: SectionSettings | null
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
                  {item.name ? <b>{item.name}</b> : null}
                  {item.note ? <span>{item.note}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}
    </Section>
  )
}
