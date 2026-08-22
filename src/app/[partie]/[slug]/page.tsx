import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { dpPubliables, dpParSlug, voisines, cheminDP } from '@/lib/content'
import { CorpsMdx } from '@/components/CorpsMdx'
import { auteur, coAuteurMedecin } from '@/lib/config'

type Params = { partie: string; slug: string }

export function generateStaticParams(): Params[] {
  return dpPubliables().map((dp) => ({ partie: dp.partieRef.slug, slug: dp.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { partie, slug } = await params
  const dp = dpParSlug(partie, slug)
  if (!dp) return {}

  // C'est la question qui porte le titre de la page publique, pas le titre
  // du livre imprimé (CLAUDE.md §9).
  return {
    title: dp.question,
    description: dp.resume,
    alternates: { canonical: cheminDP(dp) },
  }
}

export default async function PageDoublePage({ params }: { params: Promise<Params> }) {
  const { partie, slug } = await params
  const dp = dpParSlug(partie, slug)
  if (!dp) notFound()

  const { precedente, suivante } = voisines(dp)

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <nav className="chiffre text-mention uppercase tracking-wider text-texte-faible">
        <Link href="/" className="underline underline-offset-2">
          Sommaire
        </Link>
        <span aria-hidden="true"> / </span>
        Partie {dp.partie} — {dp.partieRef.titre}
      </nav>

      <article className="mt-8">
        <header className="border-b border-piste pb-8">
          <span className="chiffre text-legende text-texte-faible">
            Double page {dp.numero}
          </span>
          <h1 className="mt-2 text-titre md:text-titre-large font-titre font-semibold">
            {dp.question}
          </h1>
          <p className="mt-4 font-titre italic text-intertitre text-texte-faible">
            {dp.titre}
          </p>
        </header>

        <CorpsMdx source={dp.corps} />

        {dp.sources.length > 0 && (
          <section className="mt-16 border-t border-piste pt-6">
            <h2 className="chiffre text-mention uppercase tracking-wider text-texte-faible">
              Sources
            </h2>
            <ul className="mt-3 text-legende text-texte-faible">
              {dp.sources.map((source) => (
                <li key={source} className="my-1">
                  {source}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-8 text-legende text-texte-faible">
          <p>
            Écrit par{' '}
            <Link href={auteur.chemin} className="text-vert underline underline-offset-2">
              {auteur.nom}
            </Link>
            {coAuteurMedecin && (
              <>
                , relu par{' '}
                <a
                  href={coAuteurMedecin.lien}
                  className="text-vert underline underline-offset-2"
                >
                  {coAuteurMedecin.nom}
                </a>
                , {coAuteurMedecin.titre}
              </>
            )}
            .
          </p>
        </section>
      </article>

      <nav className="mt-16 flex justify-between gap-8 border-t border-piste pt-6 text-petit">
        {precedente ? (
          <Link href={cheminDP(precedente)} className="max-w-[45%] text-vert">
            <span className="chiffre block text-mention uppercase tracking-wider text-texte-faible">
              Précédente
            </span>
            {precedente.titre}
          </Link>
        ) : (
          <span />
        )}
        {suivante && (
          <Link href={cheminDP(suivante)} className="max-w-[45%] text-right text-vert">
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
