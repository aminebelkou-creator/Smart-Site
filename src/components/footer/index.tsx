import { getGlobal, getSettings } from "@/lib/data/globals"
import type { Footer as FooterType, Setting } from "@/payload-types"
import { FooterBody } from "@/components/footer/body"

/*************************************************************************/
/*  FOOTER COMPONENT
/*************************************************************************/

export async function Footer() {
  const [footerData, settingsData] = await Promise.all([
    getGlobal("footer" as never, 1),
    getSettings(),
  ])

  return <FooterBody footer={footerData as FooterType} settings={settingsData as Setting} />
}
