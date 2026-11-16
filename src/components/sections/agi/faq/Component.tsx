import { Section, type SectionSettings } from "@/components/fields/section"
import { SectionIntro } from "@/components/sections/agi/intro"

export type FaqBlockProps = {
  kicker?: string | null
  heading?: string | null
  intro?: string | null
  items?: Array<{ id?: string | null; question: string; answer: string }> | null
  structuredData?: boolean | null
  sectionSettings?: SectionSettings | null
}

export function FaqComponent({ kicker, heading, intro, items, structuredData, sectionSettings }: FaqBlockProps) {
  const jsonLd =
    structuredData !== false && items?.length
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }).replace(/</g, "\\u003c")
      : null

  return (
    <Section sectionSettings={sectionSettings ?? undefined} containerClassName="agi-block">
      <SectionIntro kicker={kicker} heading={heading} intro={intro} />
      {items?.length ? (
        <div className="agi-faq">
          {items.map((item, index) => (
            <details key={item.id ?? index} className="agi-faq__item">
              <summary>
                <span>{item.question}</span>
              </summary>
              <div className="agi-faq__answer">
                {item.answer.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : null}
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      ) : null}
    </Section>
  )
}
