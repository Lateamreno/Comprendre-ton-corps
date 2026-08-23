import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { lireFiche, slugsAliments } from '@/lib/aliments'
import { FicheAliment } from '@/components/FicheAliment'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return slugsAliments().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  return { title: `Atelier — fiche ${slug}` }
}

/**
 * Vue de contrôle d'une fiche aliment. Elle reste dans l'atelier tant que les
 * fiches ne sont pas posées dans les doubles pages de la partie 6.
 */
export default async function PageFiche({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  if (!slugsAliments().includes(slug)) notFound()
  const fiche = lireFiche(slug)
  const autres = slugsAliments()

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-10">
      <nav className="chiffre flex flex-wrap items-baseline gap-x-5 gap-y-2 text-mention uppercase tracking-wider text-texte-faible">
        <Link href="/atelier" className="underline underline-offset-2">
          Atelier
        </Link>
        <span aria-hidden="true">/</span>
        <span>Fiches aliment</span>
      </nav>

      <ul className="chiffre mt-4 flex flex-wrap gap-x-5 gap-y-2 border-b border-piste pb-5 text-mention uppercase tracking-wider">
        {autres.map((s) => (
          <li key={s}>
            <Link
              href={`/atelier/aliment/${s}`}
              aria-current={s === slug ? 'page' : undefined}
              className={s === slug ? 'text-vert' : 'text-texte-faible hover:text-vert'}
            >
              {s}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <FicheAliment fiche={fiche} />
      </div>

      <p className="chiffre mt-5 text-mention uppercase tracking-wider text-texte-faible">
        Portion de {fiche.portion.grammes} g — changer la portion ou le code Ciqual dans
        content/aliments/{slug}.json change chiffres, remplissages et couleurs.
      </p>
    </main>
  )
}
