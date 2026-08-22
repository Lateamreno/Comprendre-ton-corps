import type { Metadata } from 'next'
import Link from 'next/link'
import { navigation, nombrePubliables } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Sommaire',
  description: 'Les sept parties du livre et les doubles pages déjà publiées.',
  alternates: { canonical: '/sommaire' },
}

const TOTAL_PREVU = 103

/**
 * Le plan du livre, entièrement cliquable. Les parties encore vides restent
 * affichées : le sommaire montre autant ce qui est écrit que ce qui reste
 * à écrire.
 */
export default function Sommaire() {
  const parties = navigation()
  const publiees = nombrePubliables()

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <header className="border-b border-piste pb-8">
        <h1 className="text-titre md:text-titre-large font-titre font-semibold">Sommaire</h1>
        <p className="mt-4 text-texte-faible">
          Sept parties, {TOTAL_PREVU} doubles pages. Chaque double page répond à une
          question et se lit indépendamment des autres.
        </p>
        <p className="chiffre mt-5 text-mention uppercase tracking-wider text-texte-faible">
          {publiees} publiée{publiees > 1 ? 's' : ''} sur {TOTAL_PREVU}
        </p>
      </header>

      {parties.map((partie) => (
        <section key={partie.numero} className="mt-12">
          <div className="flex items-baseline gap-3 border-b border-piste pb-2">
            <span className="chiffre text-legende text-texte-faible">{partie.numero}</span>
            <h2 className="flex-1 font-titre text-intertitre font-semibold">{partie.titre}</h2>
            <span className="chiffre text-mention uppercase tracking-wider text-texte-faible">
              {partie.pages.length === 0
                ? 'à écrire'
                : `${partie.pages.length} double${partie.pages.length > 1 ? 's' : ''} page${
                    partie.pages.length > 1 ? 's' : ''
                  }`}
            </span>
          </div>

          <p className="mt-3 text-petit text-texte-faible">{partie.resume}</p>

          {partie.pages.length > 0 && (
            <ul className="mt-4">
              {partie.pages.map((dp) => (
                <li key={dp.chemin} className="border-t border-piste py-4">
                  <Link href={dp.chemin} className="group block">
                    <span className="chiffre text-legende text-texte-faible">{dp.numero}</span>
                    <h3 className="mt-1 font-titre text-petit font-semibold text-texte group-hover:text-vert">
                      {dp.titre}
                    </h3>
                    <p className="mt-1 text-petit text-texte-faible">{dp.question}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  )
}
