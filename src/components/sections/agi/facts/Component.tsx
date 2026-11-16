import { Section, type SectionSettings } from "@/components/fields/section"
import { SectionIntro } from "@/components/sections/agi/intro"

export type FactsBlockProps = {
  kicker?: string | null
  heading?: string | null
  intro?: string | null
  note?: string | null
  items?: Array<{ id?: string | null; value: string; label: string }> | null
  sectionSettings?: SectionSettings | null
}

export function FactsComponent({ kicker, heading, intro, note, items, sectionSettings }: FactsBlockProps) {
  return (
    <Section sectionSettings={sectionSettings ?? undefined} containerClassName="agi-block">
      <SectionIntro kicker={kicker} heading={heading} intro={intro} />
      {note ? <p className="agi-note">{note}</p> : null}
      {items?.length ? (
        <dl className="agi-facts grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.id ?? index} className="agi-fact">
              <dt className="agi-fact__value">{item.value}</dt>
              <dd className="agi-fact__label">{item.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Section>
  )
}
