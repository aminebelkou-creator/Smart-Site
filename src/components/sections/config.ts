/*************************************************************************/
/*  UNIFIED SECTIONS CONFIG
/*
/*  Provides both Payload block configs AND component import paths
/*  Admin gets sectionBlocks, RenderSections gets importMap
/*************************************************************************/

import { Content } from "@/components/sections/content/config"
import { Hero } from "@/components/sections/hero/config"
import { ContactForm } from "@/components/sections/contact-form/config"
import { PostsArchive } from "@/components/sections/posts/archive/config"
import { PostsRelated } from "@/components/sections/posts/related/config"
import { PostsHero } from "@/components/sections/posts/hero/config"
import { PostsContent } from "@/components/sections/posts/content/config"
import { Cards } from "@/components/sections/agi/cards/config"
import { Facts } from "@/components/sections/agi/facts/config"
import { Testimonials } from "@/components/sections/agi/testimonials/config"
import { Faq } from "@/components/sections/agi/faq/config"

export const sections = {
  sectionBlocks: [
    Hero,
    Content,
    Cards,
    Facts,
    Testimonials,
    Faq,
    ContactForm,
    PostsArchive,
    PostsHero,
    PostsContent,
    PostsRelated,
  ],
}
