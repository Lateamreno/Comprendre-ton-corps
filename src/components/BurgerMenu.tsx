'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PartieNavigable } from '@/lib/content'
import { auteur } from '@/lib/config'

/**
 * Menu de navigation, fermé par défaut, présent sur toutes les pages
 * (CLAUDE.md §6).
 *
 * Chaque partie est un tiroir : elle s'ouvre sur ses doubles pages. La partie
 * qui contient la page courante s'ouvre d'elle-même, pour qu'on sache toujours
 * où l'on se trouve. Les parties encore vides restent affichées — elles disent
 * ce qu'il reste à écrire.
 *
 * Ce composant ne reçoit que des liens, jamais le texte des DP.
 */
export function BurgerMenu({
  parties,
  total,
}: {
  parties: PartieNavigable[]
  total: number
}) {
  const chemin = usePathname()
  const [ouvert, setOuvert] = useState(false)
  const [deplies, setDeplies] = useState<number[]>([])

  // La partie de la page courante s'ouvre, et se referme quand on la quitte.
  const partieCourante = parties.find((p) =>
    p.pages.some((dp) => dp.chemin !== null && dp.chemin === chemin),
  )?.numero

  useEffect(() => {
    setOuvert(false)
    setDeplies(partieCourante === undefined ? [] : [partieCourante])
  }, [chemin, partieCourante])

  useEffect(() => {
    if (!ouvert) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false)
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [ouvert])

  // Le livre feuilletable a sa propre navigation, en bas de l'écran.
  const dansLeLivre = chemin.startsWith('/atelier/livre')

  const basculer = (numero: number) =>
    setDeplies((liste) =>
      liste.includes(numero) ? liste.filter((n) => n !== numero) : [...liste, numero],
    )

  if (dansLeLivre) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-controls="menu-principal"
        aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-[2px] border border-piste bg-fond-carte"
      >
        <span className="relative block h-[13px] w-[19px]" aria-hidden="true">
          <span
            className="absolute left-0 block h-[1.5px] w-full bg-texte transition-transform"
            style={ouvert ? { top: 6, transform: 'rotate(45deg)' } : { top: 0 }}
          />
          <span
            className="absolute left-0 top-[6px] block h-[1.5px] w-full bg-texte transition-opacity"
            style={{ opacity: ouvert ? 0 : 1 }}
          />
          <span
            className="absolute left-0 block h-[1.5px] w-full bg-texte transition-transform"
            style={ouvert ? { top: 6, transform: 'rotate(-45deg)' } : { top: 12 }}
          />
        </span>
      </button>

      {ouvert && (
        <div
          className="fixed inset-0 z-40 bg-texte/20"
          onClick={() => setOuvert(false)}
          aria-hidden="true"
        />
      )}

      <nav
        id="menu-principal"
        hidden={!ouvert}
        className="fixed right-0 top-0 z-40 h-full w-full max-w-[380px] overflow-y-auto border-l border-piste bg-fond-carte px-6 pb-10 pt-20"
      >
        <ul className="chiffre text-mention uppercase tracking-wider text-texte-faible">
          <li className="border-t border-piste py-3">
            <Link href="/" className="hover:text-vert">
              Accueil
            </Link>
          </li>
          <li className="border-t border-piste py-3">
            <Link href="/sommaire" className="hover:text-vert">
              Sommaire
            </Link>
          </li>
          <li className="border-t border-piste py-3">
            <Link href="/fiches" className="hover:text-vert">
              Fiches aliment
            </Link>
          </li>
        </ul>

        <p className="chiffre mt-8 text-mention uppercase tracking-wider text-texte-faible">
          {total} lisible{total > 1 ? 's' : ''} sur{' '}
          {parties.reduce((somme, p) => somme + p.pages.length, 0)} prévues
        </p>

        <ul className="mt-3">
          {parties.map((partie) => {
            const deplie = deplies.includes(partie.numero)
            const vide = partie.pages.length === 0

            return (
              <li key={partie.numero} className="border-t border-piste">
                <button
                  type="button"
                  onClick={() => basculer(partie.numero)}
                  aria-expanded={deplie}
                  disabled={vide}
                  className="flex w-full items-baseline gap-3 py-3 text-left disabled:cursor-default"
                >
                  <span className="chiffre text-legende text-texte-faible">
                    {partie.numero}
                  </span>
                  <span className="flex-1">
                    <span className="block font-titre text-petit font-semibold text-texte">
                      {partie.titre}
                    </span>
                    {partie.sousTitre && (
                      <span className="block font-titre text-legende italic text-texte-faible">
                        {partie.sousTitre}
                      </span>
                    )}
                  </span>
                  <span className="chiffre text-mention text-texte-faible" aria-hidden="true">
                    {vide ? '—' : deplie ? '–' : '+'}
                  </span>
                </button>

                {deplie && !vide && (
                  <ul className="pb-3 pl-7">
                    {partie.pages.map((dp) => {
                      const courante = dp.chemin !== null && dp.chemin === chemin
                      const numero = (
                        <span className="chiffre mr-2 text-mention text-texte-faible">
                          {dp.numero}
                        </span>
                      )

                      return (
                        <li key={dp.numero + dp.titre} className="py-1.5">
                          {dp.chemin === null ? (
                            // Le plan se lit, le brouillon ne se publie pas.
                            <span className="block text-petit leading-snug text-texte-faible">
                              {numero}
                              {dp.titre}
                            </span>
                          ) : (
                            <Link
                              href={dp.chemin}
                              aria-current={courante ? 'page' : undefined}
                              className={`block text-petit leading-snug ${
                                courante ? 'text-vert' : 'text-texte hover:text-vert'
                              }`}
                            >
                              {numero}
                              {dp.titre}
                            </Link>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>

        <ul className="chiffre mt-8 border-t border-piste pt-3 text-mention uppercase tracking-wider text-texte-faible">
          <li className="py-2">
            <Link href={auteur.chemin} className="hover:text-vert">
              Auteur
            </Link>
          </li>
          <li className="py-2">
            <Link href="/atelier/livre" className="hover:text-vert">
              Feuilleter le livre
            </Link>
          </li>
          <li className="py-2">
            <Link href="/atelier" className="hover:text-vert">
              Atelier — suivi d&rsquo;écriture
            </Link>
          </li>
        </ul>
      </nav>
    </>
  )
}
