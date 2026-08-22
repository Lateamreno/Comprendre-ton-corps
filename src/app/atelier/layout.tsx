import type { Metadata } from 'next'

/**
 * L'atelier est l'outil de production. Il n'est pas indexable — ni ici, ni
 * dans robots.ts (CLAUDE.md §6).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default function AtelierLayout({ children }: { children: React.ReactNode }) {
  return children
}
