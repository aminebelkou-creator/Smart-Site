import type { Block } from "payload"

import { sectionSettings } from "@/components/fields/section"
import { introFields } from "@/components/sections/agi/fields"

export const Facts: Block = {
  slug: "facts",
  interfaceName: "FactsBlock",
  labels: { singular: "Facts (numbers)", plural: "Facts (numbers)" },
  admin: { group: "Content" },
  fields: [
    ...introFields(),
    {
      name: "note",
      type: "text",
      label: "Highlighted note (optional)",
      admin: { description: 'e.g. "Now enrolling – Academic year 2026–27, all programs."' },
    },
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 8,
      labels: { singular: "Fact", plural: "Facts" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "value", type: "text", label: "Number", required: true, admin: { width: "30%" } },
            { name: "label", type: "text", label: "Label", required: true, admin: { width: "70%" } },
          ],
        },
      ],
    },
    sectionSettings(),
  ],
}
