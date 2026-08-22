import type { Metadata } from 'next'
import Link from 'next/link'
import { auteur, coAuteurMedecin } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Auteur',
  description: `Qui écrit ce livre, et sur quelles sources il s'appuie.`,
}

/**
 * Le domaine santé demande une identité d'auteur vérifiable sur chaque page
 * (CLAUDE.md §9). Cette page en est la destination ; elle sera complétée au M6.
 */
export default function PageAuteur() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <nav className="chiffre text-mention uppercase tracking-wider text-texte-faible">
        <Link href="/" className="underline underline-offset-2">
          Sommaire
        </Link>
      </nav>

      <h1 className="mt-8 text-titre font-titre font-semibold">{auteur.nom}</h1>

      <p className="mt-6 text-texte-faible">
        Auteur de « Comprendre ton corps avant de le changer ». La biographie et
        les références de cette page restent à écrire.
      </p>

      <section className="mt-10 border-t border-piste pt-6">
        <h2 className="chiffre text-mention uppercase tracking-wider text-texte-faible">
          Relecture médicale
        </h2>
        <p className="mt-3 text-legende text-texte-faible">
          {coAuteurMedecin
            ? `${coAuteurMedecin.nom}, ${coAuteurMedecin.titre}`
            : 'Le co-auteur médecin n’est pas encore désigné. Le champ est prévu dans lib/config.ts.'}
        </p>
      </section>
    </main>
  )
}
