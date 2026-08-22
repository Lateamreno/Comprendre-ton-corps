import type { Metadata } from 'next'
import Link from 'next/link'
import { toutesLesDPSituees, cheminAtelier, STATUTS } from '@/lib/content'
import { parties } from '@content/parts'
import { JaugeStatut } from '@/components/JaugeStatut'

export const metadata: Metadata = {
  title: 'Atelier',
}

const TOTAL_PREVU = 103

/** Index de production : toutes les DP du repo, brouillons compris. */
export default function AtelierIndex() {
  const pages = toutesLesDPSituees()

  const parStatut = STATUTS.map((statut) => ({
    statut,
    nombre: pages.filter((dp) => dp.statut === statut).length,
  }))

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="border-b border-gris-vide pb-8">
        <h1 className="text-titre font-titre font-semibold">Atelier</h1>
        <p className="mt-3 text-texte-faible">
          Suivi de production. Cette vue n&rsquo;est pas indexée et montre les
          doubles pages à tous les statuts, brouillons compris.
        </p>

        <dl className="chiffre mt-6 flex flex-wrap gap-x-8 gap-y-2 text-mention uppercase tracking-wider text-texte-faible">
          <div>
            <dt className="inline">Écrites </dt>
            <dd className="inline text-texte">
              {pages.length} / {TOTAL_PREVU}
            </dd>
          </div>
          {parStatut.map(({ statut, nombre }) => (
            <div key={statut}>
              <dt className="inline">{statut} </dt>
              <dd className="inline text-texte">{nombre}</dd>
            </div>
          ))}
        </dl>
      </header>

      {pages.length === 0 ? (
        <p className="mt-10 text-texte-faible">
          Aucune double page. Ajouter un fichier MDX dans{' '}
          <span className="chiffre text-petit">content/dp</span>.
        </p>
      ) : (
        parties.map((partie) => {
          const pagesDeLaPartie = pages.filter((dp) => dp.partie === partie.numero)
          if (pagesDeLaPartie.length === 0) return null

          return (
            <section key={partie.numero} className="mt-10">
              <h2 className="chiffre text-mention uppercase tracking-wider text-texte-faible">
                Partie {partie.numero} — {partie.titre}
              </h2>

              <ul className="mt-3">
                {pagesDeLaPartie.map((dp) => (
                  <li
                    key={dp.fichier}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-gris-vide py-4"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="chiffre text-legende text-texte-faible">{dp.numero}</span>
                      <Link
                        href={cheminAtelier(dp)}
                        className="font-titre text-intertitre font-semibold hover:text-vert"
                      >
                        {dp.titre}
                      </Link>
                    </span>
                    <JaugeStatut statut={dp.statut} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </main>
  )
}
