import type { Field, GlobalConfig } from "payload"

import { link } from "@/components/fields/link/link"
import { afterFooterChange } from "@/payload/hooks/globals/footer/after-change"

/* Footer menus, legal links and tagline per language (see src/lib/locale.ts).
   French/Arabic fields are optional: empty means "reuse the English one". */

const menusField = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: "array",
  fields: [
    {
      name: "title",
      type: "text",
      label: "Menu Title",
      required: true,
    },
    {
      name: "menuItems",
      label: "Menu Items",
      type: "array",
      fields: [link()],
      admin: {
        initCollapsed: true,
      },
    },
  ],
  maxRows: 10,
  admin: {
    description,
    initCollapsed: true,
    components: {
      RowLabel: "@/payload/globals/footer/RowLabel#RowLabel",
    },
  },
})

const legalsField = (name: string, label: string): Field => ({
  name,
  label,
  type: "array",
  fields: [link()],
  maxRows: 10,
  admin: {
    initCollapsed: true,
  },
})

export const Footer: GlobalConfig = {
  slug: "footer",
  custom: { smartsite: { mcp: true } },
  access: {
    read: () => true,
  },
  admin: {
    hideAPIURL: process.env.NODE_ENV === "production",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "English",
          fields: [
            { name: "tagline", type: "textarea", label: "Tagline under the logo" },
            menusField("menus", "Footer Menus"),
            legalsField("legals", "Legal Links"),
          ],
        },
        {
          label: "Français",
          fields: [
            { name: "taglineFr", type: "textarea", label: "Tagline (FR)" },
            menusField("menusFr", "Footer Menus (FR)", "Leave empty to reuse the English menus."),
            legalsField("legalsFr", "Legal Links (FR)"),
          ],
        },
        {
          label: "العربية",
          fields: [
            { name: "taglineAr", type: "textarea", label: "Tagline (AR)" },
            menusField("menusAr", "Footer Menus (AR)", "Leave empty to reuse the English menus."),
            legalsField("legalsAr", "Legal Links (AR)"),
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [afterFooterChange],
  },
}
