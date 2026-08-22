import Link from 'next/link'
import { dpPubliables, cheminDP } from '@/lib/content'
import { parties } from '@content/parts'
import { site, auteur } from '@/lib/config'

/**
 * Accueil minimale du M1 : elle donne accès aux doubles pages présentes dans
 * le repo, rien de plus. Le sommaire complet et le menu burger relèvent du M4.
 */
export default function Accueil() {
  const pages = dpPubliables()

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <header className="border-b border-piste pb-10">
        <h1 className="text-titre md:text-titre-large font-titre font-semibold">
          {site.titre}
        </h1>
        <p className="mt-4 max-w-xl text-texte-faible">
          Les mécanismes qui gouvernent l&rsquo;usage des aliments par le corps,
          décrits une question à la fois. Le contenu du livre s&rsquo;écrit ici.
        </p>
        <p className="chiffre mt-6 text-mention uppercase tracking-wider text-texte-faible">
          {pages.length} double{pages.length > 1 ? 's' : ''} page
          {pages.length > 1 ? 's' : ''} publiée{pages.length > 1 ? 's' : ''} sur 103
        </p>
      </header>

      {pages.length === 0 ? (
        <p className="mt-10 text-texte-faible">
          Aucune double page publiable. Ajouter un fichier MDX dans{' '}
          <span className="chiffre text-petit">content/dp</span>.
        </p>
      ) : (
        parties.map((partie) => {
          const pagesDeLaPartie = pages.filter((dp) => dp.partie === partie.numero)
          if (pagesDeLaPartie.length === 0) return null

          return (
            <section key={partie.numero} className="mt-12">
              <h2 className="chiffre text-mention uppercase tracking-wider text-texte-faible">
                Partie {partie.numero} — {partie.titre}
              </h2>

              <ul className="mt-4">
                {pagesDeLaPartie.map((dp) => (
                  <li key={dp.fichier} className="border-t border-piste py-5">
                    <Link href={cheminDP(dp)} className="group block">
                      <span className="chiffre text-legende text-texte-faible">{dp.numero}</span>
                      <h3 className="mt-1 text-intertitre font-titre font-semibold text-texte group-hover:text-vert">
                        {dp.question}
                      </h3>
                      <p className="mt-1 text-petit text-texte-faible">{dp.resume}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}

      <footer className="mt-20 border-t border-piste pt-6 text-legende text-texte-faible">
        <p>
          Écrit par <Link href={auteur.chemin} className="text-vert underline underline-offset-2">{auteur.nom}</Link>.
        </p>
      </footer>
    </main>
  )
}
