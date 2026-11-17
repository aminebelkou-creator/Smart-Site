import type { Field, GlobalConfig } from "payload"

import { link } from "@/components/fields/link/link"
import { afterHeaderChange } from "@/payload/hooks/globals/header/after-change"
import { ICON_OPTIONS } from "@/components/sections/agi/icon-options"

/* One navigation per language (see src/lib/locale.ts) */
const navItemsField = (
  name: string,
  label: string,
  description?: string
): Field => ({
  name,
  label,
  labels: { singular: "Nav item", plural: "Nav items" },
  type: "array",
  fields: [
    {
      name: "item",
      label: false,
      type: "group",
      fields: [
        link(),
        {
          name: "hasDropdown",
          type: "checkbox",
          label: "Has dropdown menu",
        },
        {
          name: "promo",
          type: "group",
          label: "Highlight panel in the dropdown (optional)",
          admin: { condition: (_, siblingData) => siblingData?.hasDropdown === true },
          fields: [
            { name: "title", type: "text", label: "Title" },
            { name: "text", type: "textarea", label: "Text" },
            link({ optional: true, overrides: { name: "link", label: "Button" } }),
          ],
        },
        {
          name: "subItems",
          label: {
            singular: "Sub-menu item",
            plural: "Sub-menu items",
          },
          type: "array",
          admin: {
            condition: (_, siblingData) => siblingData?.hasDropdown === true,
          },
          fields: [
            {
              name: "child",
              label: false,
              type: "group",
              fields: [
                link(),
                {
                  type: "row",
                  fields: [
                    {
                      name: "group",
                      type: "text",
                      label: "Column heading (optional)",
                      admin: { description: "Items with the same heading are shown together in a wide menu." },
                    },
                    {
                      name: "icon",
                      type: "select",
                      label: "Icon (optional)",
                      options: ICON_OPTIONS,
                    },
                  ],
                },
                {
                  name: "description",
                  type: "text",
                  label: "Short description (optional)",
                  admin: { description: "One line under the link in the desktop menu." },
                },
                {
                  name: "hasChildren",
                  type: "checkbox",
                  label: "Has sub-dropdown menu",
                },
                {
                  name: "subItems",
                  type: "array",
                  label: "Sub-Dropdown Menu Items",
                  admin: {
                    condition: (_, siblingData) => siblingData?.hasChildren === true,
                  },
                  fields: [link()],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  maxRows: 10,
  admin: {
    description,
    initCollapsed: true,
    components: {
      RowLabel: "@/payload/globals/header/row-label#RowLabel",
    },
  },
})

export const Header: GlobalConfig = {
  slug: "header",
  custom: { smartsite: { mcp: true } },
  access: {
    read: () => true,
  },
  fields: [
    navItemsField("navItems", "Navigation (English)"),
    navItemsField(
      "navItemsFr",
      "Navigation (Français)",
      "Menu for pages under /fr. Leave empty to reuse the English menu."
    ),
    navItemsField(
      "navItemsAr",
      "Navigation (العربية)",
      "Menu for pages under /ar. Leave empty to reuse the English menu."
    ),
  ],
  hooks: {
    afterChange: [afterHeaderChange],
  },
}
