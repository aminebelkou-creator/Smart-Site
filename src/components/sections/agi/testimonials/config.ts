import type { Block } from "payload"

import { sectionSettings } from "@/components/fields/section"
import { introFields } from "@/components/sections/agi/fields"

export const Testimonials: Block = {
  slug: "testimonials-list",
  interfaceName: "TestimonialsListBlock",
  labels: { singular: "Testimonials", plural: "Testimonials" },
  admin: { group: "Content" },
  fields: [
    ...introFields(),
    {
      name: "items",
      type: "array",
      minRows: 1,
      labels: { singular: "Testimonial", plural: "Testimonials" },
      fields: [
        { name: "quote", type: "textarea", label: "Quote", required: true },
        {
          type: "row",
          fields: [
            { name: "name", type: "text", label: "Who (e.g. Parent of a grade 3 student)", admin: { width: "60%" } },
            { name: "note", type: "text", label: "Note (e.g. Sample testimonial)", admin: { width: "40%" } },
          ],
        },
      ],
    },
    sectionSettings(),
  ],
}
