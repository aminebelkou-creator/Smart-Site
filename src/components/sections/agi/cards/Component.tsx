import { Section, type SectionSettings } from "@/components/fields/section"
import { CMSLink } from "@/components/fields/link"
import { Media } from "@/components/fields/media"
import { SectionIntro } from "@/components/sections/agi/intro"
import { AgiIcon } from "@/components/sections/agi/icons"

type CardLink = {
  type?: "custom" | "reference" | null
  url?: string | null
  label?: string | null
  newTab?: boolean | null
  reference?: { relationTo: string; value: any } | null
}

export type CardsBlockProps = {
  kicker?: string | null
  heading?: string | null
  intro?: string | null
  columns?: "2" | "3" | "4" | "5" | null
  style?: "boxed" | "plain" | "numbered" | "logos" | null
  cards?: Array<{
    id?: string | null
    tag?: string | null
    title: string
    text?: string | null
    icon?: string | null
    image?: any
    link?: CardLink | null
  }> | null
  sectionSettings?: SectionSettings | null
}

const columnClass: Record<string, string> = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "4": "md:grid-cols-2 lg:grid-cols-4",
  "5": "md:grid-cols-2 lg:grid-cols-5",
}

function hasLink(link?: CardLink | null) {
  if (!link) return false
  return link.type === "reference" ? Boolean(link.reference?.value) : Boolean(link.url)
}

export function CardsComponent(props: CardsBlockProps) {
  const { kicker, heading, intro, columns, style, cards, sectionSettings } = props
  const variant = style ?? "boxed"

  return (
    <Section sectionSettings={sectionSettings ?? undefined} containerClassName="agi-block">
      <SectionIntro kicker={kicker} heading={heading} intro={intro} />
      {cards?.length ? (
        <ul className={`agi-cards agi-cards--${variant} grid grid-cols-1 ${columnClass[columns ?? "3"]}`}>
          {cards.map((card, index) =>
            variant === "logos" ? (
              <li key={card.id ?? index} className="agi-card agi-logo" title={card.title}>
                {card.image && typeof card.image === "object" ? (
                  <Media resource={card.image} className="agi-logo__img" imgClassName="h-full w-full object-contain" />
                ) : null}
                <span className={card.image && typeof card.image === "object" ? "agi-logo__name" : "agi-logo__text"}>
                  {card.title}
                </span>
                {card.text ? <span className="agi-logo__caption">{card.text}</span> : null}
              </li>
            ) : (
            <li key={card.id ?? index} className="agi-card">
              {card.image && typeof card.image === "object" ? (
                <Media resource={card.image} className="agi-card__media" imgClassName="h-full w-full object-cover" />
              ) : null}
              {variant === "numbered" ? (
                <span className="agi-card__num" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
              ) : null}
              {card.icon ? <AgiIcon name={card.icon} className="agi-card__icon" /> : null}
              {card.tag ? <span className="agi-tag">{card.tag}</span> : null}
              <h3>{card.title}</h3>
              {card.text ? <p>{card.text}</p> : null}
              {hasLink(card.link) ? (
                <CMSLink {...(card.link as any)} appearance="link" className="agi-more">
                  {card.link?.label || "Read more"}
                </CMSLink>
              ) : null}
            </li>
            )
          )}
        </ul>
      ) : null}
    </Section>
  )
}
