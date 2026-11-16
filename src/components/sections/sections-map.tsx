import { ContentComponent } from "@/components/sections/content/Component"
import { HeroComponent } from "@/components/sections/hero/Component"
import { ContactFormComponent } from "@/components/sections/contact-form/Component"
import { PostsArchiveComponent } from "@/components/sections/posts/archive/Component"
import { PostsHeroComponent } from "@/components/sections/posts/hero/Component"
import { PostsContentComponent } from "@/components/sections/posts/content/Component"
import { PostsRelatedComponent } from "@/components/sections/posts/related/Component"
import { CardsComponent } from "@/components/sections/agi/cards/Component"
import { FactsComponent } from "@/components/sections/agi/facts/Component"
import { TestimonialsListComponent } from "@/components/sections/agi/testimonials/Component"
import { FaqComponent } from "@/components/sections/agi/faq/Component"
import React from "react"

/*************************************************************************/
/*  SECTIONS MAP - CLIENT BOUNDARY
/*
/*  Maps section block types to their React components
/*  This file exists in client space to enable direct imports
/*************************************************************************/

export const sectionsMap: Record<string, React.ComponentType<any>> = {
  hero: HeroComponent,
  content: ContentComponent,
  cards: CardsComponent,
  facts: FactsComponent,
  "testimonials-list": TestimonialsListComponent,
  faq: FaqComponent,
  "contact-form": ContactFormComponent,
  "posts-archive": PostsArchiveComponent,
  "posts-hero": PostsHeroComponent,
  "posts-content": PostsContentComponent,
  "posts-related": PostsRelatedComponent,
}
