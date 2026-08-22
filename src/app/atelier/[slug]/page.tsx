import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  toutesLesDPSituees,
  dpAtelierParSlug,
  cheminAtelier,
  cheminDP,
} from '@/lib/content'
import { Spread } from '@/components/Spread'
import { JaugeStatut } from '@/components/JaugeStatut'
import { doublePage } from '@/lib/tokens'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return toutesLesDPSituees().map((dp) => ({ slug: dp.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const dp = dpAtelierParSlug(slug)
  return { title: dp ? `Atelier — ${dp.titre}` : 'Atelier' }
}

export default async function PageSpread({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const dp = dpAtelierParSlug(slug)
  if (!dp) notFound()

  const liste = toutesLesDPSituees()
  const i = liste.findIndex((autre) => autre.fichier === dp.fichier)
  const precedente = liste[i - 1]
  const suivante = liste[i + 1]

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      {/*
        La bascule et le suivi vivent ici, autour du cadre — jamais dedans.
        Une page de livre ne porte pas d'élément d'interface (CLAUDE.md §11).
      */}
      <nav className="chiffre flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-mention uppercase tracking-wider text-texte-faible">
        <span className="flex flex-wrap items-baseline gap-x-4">
          <Link href="/atelier" className="underline underline-offset-2">
            Atelier
          </Link>
          <span aria-hidden="true">/</span>
          <span>
            {dp.numero} — {dp.partieRef.titre}
          </span>
        </span>

        <span className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <JaugeStatut statut={dp.statut} />
          {dp.statut === 'brouillon' ? (
            <span>Non publiée — statut brouillon</span>
          ) : (
            <Link href={cheminDP(dp)} className="underline underline-offset-2">
              Voir en lecture
            </Link>
          )}
        </span>
      </nav>

      <h1 className="mt-6 font-titre text-intertitre font-semibold">{dp.titre}</h1>
      <p className="mt-1 text-petit text-texte-faible">{dp.question}</p>

      <div className="mt-6">
        <Spread dp={dp} />
      </div>

      <p className="chiffre mt-3 text-mention uppercase tracking-wider text-texte-faible">
        Double page ouverte, {doublePage.largeurMm} × {doublePage.hauteurMm} mm — échelle réelle.
        Le blanc restant indique ce qu&rsquo;il reste à écrire ; un texte rogné indique un excès.
      </p>

      <nav className="mt-10 flex justify-between gap-8 border-t border-gris-vide pt-5 text-petit">
        {precedente ? (
          <Link href={cheminAtelier(precedente)} className="max-w-[45%] text-vert">
            <span className="chiffre block text-mention uppercase tracking-wider text-texte-faible">
              Précédente
            </span>
            {precedente.titre}
          </Link>
        ) : (
          <span />
        )}
        {suivante && (
          <Link href={cheminAtelier(suivante)} className="max-w-[45%] text-right text-vert">
            <span className="chiffre block text-mention uppercase tracking-wider text-texte-faible">
              Suivante
            </span>
            {suivante.titre}
          </Link>
        )}
      </nav>
    </main>
  )
}
