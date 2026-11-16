import type { Field } from "payload"

/* Shared "section intro" fields for the AGI blocks: kicker, heading, intro. */
export const introFields = (headingRequired = false): Field[] => [
  {
    type: "row",
    fields: [
      {
        name: "kicker",
        type: "text",
        label: "Kicker",
        admin: { width: "35%", description: "Small label above the heading (optional)." },
      },
      {
        name: "heading",
        type: "text",
        label: "Heading",
        required: headingRequired,
        admin: {
          width: "65%",
          description: "Wrap words in <span>…</span> for the gold italic highlight.",
        },
      },
    ],
  },
  {
    name: "intro",
    type: "textarea",
    label: "Intro text",
  },
]
