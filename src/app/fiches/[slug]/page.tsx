import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { lireFiche, slugsAliments } from '@/lib/aliments'
import { FicheAliment } from '@/components/FicheAliment'
import { auteur, coAuteurMedecin } from '@/lib/config'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return slugsAliments().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  if (!slugsAliments().includes(slug)) return {}
  const f = lireFiche(slug)

  return {
    // La question porte le titre de la page publique (CLAUDE.md §9).
    title: f.question,
    description: `${f.portion.libelle} de ${f.nom.toLowerCase()} (${f.portion.grammes} g) apporte ${f.energie.texte} kcal. Composition, part des sucres et repère de volume, d'après Ciqual.`,
    alternates: { canonical: `/fiches/${slug}` },
  }
}

export default async function PageFichePublique({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  if (!slugsAliments().includes(slug)) notFound()
  const f = lireFiche(slug)

  const liste = slugsAliments()
  const i = liste.indexOf(slug)
  const precedente = liste[i - 1]
  const suivante = liste[i + 1]

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
      <nav className="chiffre text-mention uppercase tracking-wider text-texte-faible">
        <Link href="/" className="underline underline-offset-2">
          Accueil
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href="/fiches" className="underline underline-offset-2">
          Fiches aliment
        </Link>
      </nav>

      <h1 className="mt-6 max-w-3xl text-titre md:text-titre-large font-titre font-semibold">
        {f.question}
      </h1>

      <div className="mt-8">
        <FicheAliment fiche={f} />
      </div>

      <section className="mt-10 max-w-2xl">
        <h2 className="chiffre text-mention uppercase tracking-wider text-texte-faible">
          Comment lire cette fiche
        </h2>
        <p className="mt-3 text-petit leading-relaxed text-texte">
          Les valeurs portent sur {f.portion.libelle} de {f.nom.toLowerCase()}, soit{' '}
          {f.portion.grammes} g — une portion réelle, et non cent grammes théoriques.
          {f.grammesPour100Kcal !== null && (
            <>
              {' '}Le repère « pour 100 kcal » indique combien il en faudrait pour atteindre
              cette énergie : {Math.round(f.grammesPour100Kcal)} g
              {f.millilitresPour100Kcal !== null &&
                `, soit environ ${Math.round(f.millilitresPour100Kcal)} ml`}
              . Plus ce nombre est grand, plus l&rsquo;aliment occupe de place pour peu
              d&rsquo;énergie.
            </>
          )}
        </p>
        <p className="mt-4 text-legende text-texte-faible">
          Écrit par{' '}
          <Link href={auteur.chemin} className="text-vert underline underline-offset-2">
            {auteur.nom}
          </Link>
          {coAuteurMedecin && `, relu par ${coAuteurMedecin.nom}`}.
        </p>
      </section>

      <nav className="mt-12 flex justify-between gap-8 border-t border-piste pt-5 text-petit">
        {precedente ? (
          <Link href={`/fiches/${precedente}`} className="text-vert">
            <span className="chiffre block text-mention uppercase tracking-wider text-texte-faible">
              Précédente
            </span>
            {lireFiche(precedente).nom}
          </Link>
        ) : (
          <span />
        )}
        {suivante && (
          <Link href={`/fiches/${suivante}`} className="text-right text-vert">
            <span className="chiffre block text-mention uppercase tracking-wider text-texte-faible">
              Suivante
            </span>
            {lireFiche(suivante).nom}
          </Link>
        )}
      </nav>
    </main>
  )
}
