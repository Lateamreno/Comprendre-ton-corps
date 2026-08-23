import type { Metadata } from 'next'
import Link from 'next/link'
import { lireFiche, slugsAliments } from '@/lib/aliments'
import { sourceCiqual } from '@/lib/ciqual'

export const metadata: Metadata = {
  title: 'Fiches aliment',
  description:
    'Ce que contient une portion réelle, aliment par aliment : énergie, sucres, fibres, et ce qu’il faut en manger pour 100 kcal.',
  alternates: { canonical: '/fiches' },
}

/**
 * Index public des fiches. Les valeurs viennent de Ciqual : aucune n'est
 * saisie ici (CLAUDE.md §11).
 */
export default function IndexFiches() {
  const fiches = slugsAliments().map(lireFiche)

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <header className="border-b border-piste pb-8">
        <h1 className="text-titre md:text-titre-large font-titre font-semibold">
          Fiches aliment
        </h1>
        <p className="mt-4 max-w-xl text-texte-faible">
          Ce que contient une portion réelle — pas cent grammes théoriques. Chaque
          fiche indique aussi combien il faut en manger pour atteindre 100 kcal.
        </p>
        <p className="chiffre mt-5 text-mention uppercase tracking-wider text-texte-faible">
          {fiches.length} fiches — {sourceCiqual()}
        </p>
      </header>

      <ul className="mt-4">
        {fiches.map((f) => (
          <li key={f.slug} className="border-b border-piste py-5">
            <Link href={`/fiches/${f.slug}`} className="group flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span className="min-w-[9rem] font-titre text-intertitre font-semibold text-texte group-hover:text-vert">
                {f.nom}
              </span>
              <span className="chiffre text-legende text-texte-faible">
                {f.portion.grammes} g — {f.portion.libelle}
              </span>
              <span className="chiffre ml-auto text-petit text-texte">
                {f.energie.texte} kcal
              </span>
              <span className="chiffre w-full text-mention uppercase tracking-wider text-texte-faible">
                {f.grammesPour100Kcal === null
                  ? ''
                  : `${Math.round(f.grammesPour100Kcal)} g pour 100 kcal`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
