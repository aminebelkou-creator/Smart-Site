import type { Block } from "payload"

import { sectionSettings } from "@/components/fields/section"
import { introFields } from "@/components/sections/agi/fields"

export const Faq: Block = {
  slug: "faq",
  interfaceName: "FaqBlock",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: { group: "Content" },
  fields: [
    ...introFields(),
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Question", plural: "Questions" },
      admin: { initCollapsed: true },
      fields: [
        { name: "question", type: "text", label: "Question", required: true },
        { name: "answer", type: "textarea", label: "Answer", required: true },
      ],
    },
    {
      name: "structuredData",
      type: "checkbox",
      label: "Add FAQ structured data for search engines",
      defaultValue: true,
    },
    sectionSettings(),
  ],
}
