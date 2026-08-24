import type { Metadata } from 'next'
import Link from 'next/link'
import { navigation, nombrePubliables } from '@/lib/content'
import { slugsAliments } from '@/lib/aliments'

export const metadata: Metadata = {
  title: 'Sommaire',
  description: 'Les sept parties du livre et les doubles pages déjà publiées.',
  alternates: { canonical: '/sommaire' },
}

/**
 * Le plan du livre, entièrement cliquable. Les parties encore vides restent
 * affichées : le sommaire montre autant ce qui est écrit que ce qui reste
 * à écrire.
 */
export default function Sommaire() {
  const parties = navigation()
  const publiees = nombrePubliables()
  const prevues = parties.reduce((somme, p) => somme + p.pages.length, 0)
  const nombreFiches = slugsAliments().length

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <header className="border-b border-piste pb-8">
        <h1 className="text-titre md:text-titre-large font-titre font-semibold">Sommaire</h1>
        <p className="mt-4 text-texte-faible">
          Neuf parties, {prevues} sujets. Chaque page répond à une question et se
          lit indépendamment des autres.
        </p>
        <p className="chiffre mt-5 text-mention uppercase tracking-wider text-texte-faible">
          {publiees} publiée{publiees > 1 ? 's' : ''} sur {prevues}
        </p>
      </header>

      <section className="mt-12 border-b border-piste pb-6">
        <div className="flex items-baseline gap-3 border-b border-piste pb-2">
          <h2 className="flex-1 font-titre text-intertitre font-semibold">
            <Link href="/fiches" className="hover:text-vert">
              Fiches aliment
            </Link>
          </h2>
          <span className="chiffre text-mention uppercase tracking-wider text-texte-faible">
            {nombreFiches} fiches
          </span>
        </div>
        <p className="mt-3 text-petit text-texte-faible">
          Ce que contient une portion réelle, aliment par aliment.
        </p>
      </section>

      {parties.map((partie) => (
        <section key={partie.numero} className="mt-12">
          <div className="flex items-baseline gap-3 border-b border-piste pb-2">
            <span className="chiffre text-legende text-texte-faible">{partie.numero}</span>
            <h2 className="flex-1 font-titre text-intertitre font-semibold">{partie.titre}</h2>
            <span className="chiffre text-mention uppercase tracking-wider text-texte-faible">
              {partie.publiees} / {partie.pages.length} écrites
            </span>
          </div>

          {partie.sousTitre && (
            <p className="mt-2 font-titre text-intertitre italic leading-snug text-texte-faible">
              {partie.sousTitre}
            </p>
          )}
          <p className="mt-3 text-petit text-texte-faible">{partie.resume}</p>

          {partie.pages.length > 0 && (
            <ul className="mt-4">
              {partie.pages.map((dp) => {
                const contenu = (
                  <>
                    <span className="chiffre text-legende text-texte-faible">{dp.numero}</span>
                    <h3
                      className={`mt-1 font-titre text-petit font-semibold ${
                        dp.chemin === null ? 'text-texte-faible' : 'text-texte group-hover:text-vert'
                      }`}
                    >
                      {dp.titre}
                    </h3>
                    <p className="mt-1 text-petit text-texte-faible">{dp.question}</p>
                  </>
                )
                return (
                  <li key={dp.numero + dp.titre} className="border-t border-piste py-4">
                    {dp.chemin === null ? (
                      <div className="block">{contenu}</div>
                    ) : (
                      <Link href={dp.chemin} className="group block">
                        {contenu}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ))}
    </main>
  )
}
