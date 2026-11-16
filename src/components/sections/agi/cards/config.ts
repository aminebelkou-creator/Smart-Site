import type { Block } from "payload"

import { sectionSettings } from "@/components/fields/section"
import { link } from "@/components/fields/link/link"
import { introFields } from "@/components/sections/agi/fields"

export const Cards: Block = {
  slug: "cards",
  interfaceName: "CardsBlock",
  labels: { singular: "Cards", plural: "Cards" },
  admin: { group: "Content" },
  fields: [
    ...introFields(),
    {
      type: "row",
      fields: [
        {
          name: "columns",
          type: "select",
          defaultValue: "3",
          options: [
            { label: "2 columns", value: "2" },
            { label: "3 columns", value: "3" },
            { label: "4 columns", value: "4" },
            { label: "5 columns", value: "5" },
          ],
          admin: { width: "50%" },
        },
        {
          name: "style",
          type: "select",
          defaultValue: "boxed",
          options: [
            { label: "Boxed cards", value: "boxed" },
            { label: "Plain (no box)", value: "plain" },
            { label: "Numbered steps", value: "numbered" },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      labels: { singular: "Card", plural: "Cards" },
      admin: { initCollapsed: true },
      fields: [
        {
          type: "row",
          fields: [
            { name: "tag", type: "text", label: "Tag", admin: { width: "35%" } },
            { name: "title", type: "text", label: "Title", required: true, admin: { width: "65%" } },
          ],
        },
        { name: "text", type: "textarea", label: "Text" },
        { name: "image", type: "upload", relationTo: "media", label: "Image (optional)" },
        link({ optional: true, overrides: { label: "Link (optional)" } }),
      ],
    },
    sectionSettings(),
  ],
}
