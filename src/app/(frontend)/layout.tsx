import configPromise from "@payload-config"
import { websiteMetadata } from "@/lib/collection-metadata"
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google"
import { SmartSiteAdminBar } from "@/components/cms/admin-bar"
import { getSettings } from "@/lib/data/globals"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import parse from "html-react-parser"
import Providers from "@/components/providers"
import React from "react"
import site from "@/site.config"
import { getI18nConfig } from "@/lib/features"
import { generateRootLayoutMetadata } from "@/app/(frontend)/layout-metadata"

import { LocaleSync } from "@/components/locale/locale-sync"
import { FormPanels } from "@/components/forms/form-panels"
import { LOCALE_HEAD_SCRIPT } from "@/lib/locale"

import "@/app/(frontend)/css/globals.css"


/*************************************************************************/
/*  ROOT LAYOUT
/*************************************************************************/

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const config = await configPromise
  const adminCollections = config.collections
    .filter(collection => websiteMetadata(collection).route)
    .map(collection => ({
      slug: collection.slug,
      label: websiteMetadata(collection).label || String(collection.labels.plural),
      singular: String(collection.labels.singular),
    }))
  const { integrations } = settings
  const smartSiteConfig = site
  const i18n = getI18nConfig()
  const smoothScrollEnabled = Boolean(smartSiteConfig.gsap.scrollSmoother)
  /**
  /*  Get code in head and body end from settings
  */

  const gtmId = integrations?.googleTagManager
  const gaId = integrations?.googleAnalytics
  const head = integrations?.head
  const bodyEnd = integrations?.bodyEnd

  return (
    <html lang={i18n.defaultLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOCALE_HEAD_SCRIPT }} />
        <link rel="preload" href="/fonts/inter-normal-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/newsreader-normal-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link href="/favicon.png" rel="icon" type="image/png" />
        {gtmId && <link href="https://www.googletagmanager.com" rel="preconnect" />}
        {gaId && <link href="https://www.google-analytics.com" rel="preconnect" />}
        {head && parse(head)}
      </head>

      <body suppressHydrationWarning>
        <LocaleSync />
        <FormPanels />
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {gaId && <GoogleAnalytics gaId={gaId} />}

        <Providers enableDarkMode={smartSiteConfig.features.darkMode}>
          <SmartSiteAdminBar
            settings={settings}
            collections={adminCollections}
            reserveSpace={!smoothScrollEnabled}
          />
          <Header />
          {smoothScrollEnabled ? (
            <div id="smooth-wrapper">
              <div id="smooth-content">
                {children}
                <Footer />
              </div>
            </div>
          ) : (
            <>
              {children}
              <Footer />
            </>
          )}
          {bodyEnd && parse(bodyEnd)}
        </Providers>
      </body>
    </html>
  )
}

export async function generateMetadata() {
  return await generateRootLayoutMetadata()
}
