import type { Metadata } from 'next'
import { racineCss } from '@/lib/tokens'
import { BurgerMenu } from '@/components/BurgerMenu'
import { navigation, nombrePubliables } from '@/lib/content'
import { site } from '@/lib/config'
import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.titre,
    template: `%s — ${site.titre}`,
  },
  description:
    "Les mécanismes qui gouvernent l'usage des aliments par le corps, décrits une question à la fois.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.langue}>
      <head>
        {/*
          Les variables de la charte sont produites par lib/tokens.ts, source
          de vérité unique. Aucune valeur n'est retapée dans une feuille de
          style ni dans un composant (CLAUDE.md §8).
        */}
        <style dangerouslySetInnerHTML={{ __html: racineCss() }} />
      </head>
      <body>
        <BurgerMenu parties={navigation()} total={nombrePubliables()} />
        {children}
      </body>
    </html>
  )
}
