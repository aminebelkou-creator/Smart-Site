import { HeaderNavigation } from "@/components/header/nav"
import { getGlobal, getSettings } from "@/lib/data/globals"
import type { Header, Setting } from "@/payload-types"
import { HomeLink } from "@/components/locale/home-link"

import type { Config } from "payload"
import LogoPrimary from "@/components/logos/logo"
import { MobileNavUpdated } from "@/components/header/mobile-nav"
import { cn } from "@/lib/ui"
import { getSearchConfig } from "@/lib/features"
import { cache } from "@/lib/cache"

export async function Header() {
  const [headerData, settingsData, uris] = await Promise.all([
    getGlobal("header" as keyof Config["globals"], 1),
    getSettings(),
    cache.getAllURIs().catch(() => [] as string[]),
  ])

  const settings = settingsData as Setting
  const searchConfig = getSearchConfig()

  return (
    <header
      className={cn(
        "smartsite-header h-nav min-h-nav max-h-nav border-dark-border px-section-x fixed inset-x-0 top-0 z-[1000] border-b bg-white"
      )}
    >
      <div className="max-w-container gap-content mx-auto flex h-full w-full items-center justify-between">
        <HomeLink className="gap-content-sm flex items-center">
          <LogoPrimary className="h-logo w-auto" />
        </HomeLink>
        <HeaderNavigation data={headerData} search={searchConfig} uris={uris} />
        <MobileNavUpdated
          data={headerData}
          settings={settings}
          search={searchConfig}
          uris={uris}
        />
      </div>
    </header>
  )
}
