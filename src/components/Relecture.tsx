'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * L'outil de relecture de l'auteur.
 *
 * Trois boutons en bas de l'écran, et rien d'autre :
 * — « Noter » ouvre un encart, on écrit, on valide ;
 * — « Liste » montre toutes les notes, page par page, avec l'historique des
 *   pages validées ;
 * — « Page validée » marque la page comme définitivement relue.
 *
 * Il n'y a plus de mode sélection : la sélection de texte ne se comporte pas
 * de la même façon d'un téléphone à l'autre, et c'est ce qui empêchait l'outil
 * de fonctionner en mobilité. Une note porte sur la page, pas sur un passage.
 *
 * Les notes vivent dans le navigateur (localStorage) et se synchronisent, quand
 * c'est configuré, vers la branche `corrections` du repo — un fichier par page.
 * Sans configuration, un bouton copie le tout pour le coller dans la
 * conversation.
 */

type Note = {
  id: string
  texte: string
  creeLe: string
  majLe?: string
}

type Page = {
  chemin: string
  titre: string
  notes: Note[]
  valideeLe: string | null
}

const PREFIXE = 'relecture:'
const CLE = PREFIXE + 'cle'

/* ---------------------------------------------------------------- stockage */

function lirePage(chemin: string): Page {
  const vide: Page = { chemin, titre: '', notes: [], valideeLe: null }
  try {
    const brut = localStorage.getItem(PREFIXE + chemin)
    if (!brut) return vide
    const p = JSON.parse(brut) as Partial<Page> & { corrections?: { id: string; note: string; creeLe: string }[] }
    return {
      chemin,
      titre: p.titre ?? '',
      valideeLe: p.valideeLe ?? null,
      // reprise de l'ancien format, où une note portait sur un passage
      notes: p.notes ?? (p.corrections ?? []).map((c) => ({ id: c.id, texte: c.note, creeLe: c.creeLe })),
    }
  } catch {
    return vide
  }
}

function ecrirePage(p: Page) {
  try {
    if (p.notes.length === 0 && !p.valideeLe) localStorage.removeItem(PREFIXE + p.chemin)
    else localStorage.setItem(PREFIXE + p.chemin, JSON.stringify(p))
  } catch {
    /* stockage indisponible : l'outil reste utilisable, sans persistance */
  }
}

function toutesLesPages(): Page[] {
  const pages: Page[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith(PREFIXE) || k === CLE) continue
      const p = lirePage(k.slice(PREFIXE.length))
      if (p.notes.length || p.valideeLe) pages.push(p)
    }
  } catch {
    /* voir ci-dessus */
  }
  return pages.sort((a, b) => a.chemin.localeCompare(b.chemin))
}

function texteBloc(pages: Page[]): string {
  const blocs = pages
    .filter((p) => p.notes.length)
    .map((p) => {
      const lignes = p.notes.map((n, i) => `${i + 1}. ${n.texte}`)
      return `== ${p.titre || p.chemin}\n   ${p.chemin}\n${lignes.join('\n')}`
    })
  const validees = pages.filter((p) => p.valideeLe)
  const fin = validees.length
    ? `\n\nPages validées\n${validees.map((p) => `— ${p.titre || p.chemin} (${jour(p.valideeLe!)})`).join('\n')}\n`
    : '\n'
  return `Notes de relecture\n\n${blocs.join('\n\n')}${fin}`
}

const jour = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

/* ------------------------------------------------------------------ écran */

type Vue = null | 'note' | 'liste'

export function Relecture() {
  const chemin = usePathname()
  const [monte, setMonte] = useState(false)
  const [page, setPage] = useState<Page>({ chemin, titre: '', notes: [], valideeLe: null })
  const [pages, setPages] = useState<Page[]>([])
  const [vue, setVue] = useState<Vue>(null)
  const [texte, setTexte] = useState('')
  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [texteEdition, setTexteEdition] = useState('')
  const [ouvertes, setOuvertes] = useState<string[]>([])
  const [sync, setSync] = useState<'inconnu' | 'github' | 'local' | 'cle'>('inconnu')
  const [copie, setCopie] = useState(false)

  useEffect(() => setMonte(true), [])

  useEffect(() => {
    if (!monte) return
    setPage(lirePage(chemin))
    setPages(toutesLesPages())
    setVue(null)
    setTexte('')
    setEnEdition(null)
  }, [monte, chemin])

  /* Le titre de la page sert d'étiquette dans la liste. */
  const titreCourant = useCallback(
    () => document.querySelector('main h1')?.textContent?.trim() || document.title || chemin,
    [chemin],
  )

  const enregistrer = useCallback(
    (suite: Page) => {
      setPage(suite)
      ecrirePage(suite)
      setPages(toutesLesPages())
      void (async () => {
        try {
          const reponse = await fetch('/api/corrections', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-relecture-cle': localStorage.getItem(CLE) ?? '',
            },
            body: JSON.stringify({
              chemin: suite.chemin,
              titre: suite.titre,
              valideeLe: suite.valideeLe,
              notes: suite.notes,
            }),
          })
          if (reponse.ok) setSync('github')
          else if (reponse.status === 401) setSync('cle')
          else setSync('local')
        } catch {
          setSync('local')
        }
      })()
    },
    [],
  )

  const ajouter = useCallback(() => {
    const t = texte.trim()
    if (!t) return
    enregistrer({
      ...page,
      titre: page.titre || titreCourant(),
      notes: [...page.notes, { id: Math.random().toString(36).slice(2, 10), texte: t, creeLe: new Date().toISOString() }],
    })
    setTexte('')
    setVue(null)
  }, [texte, page, enregistrer, titreCourant])

  const basculerValidee = useCallback(() => {
    enregistrer({
      ...page,
      titre: page.titre || titreCourant(),
      valideeLe: page.valideeLe ? null : new Date().toISOString(),
    })
  }, [page, enregistrer, titreCourant])

  /** Une note se modifie depuis la liste, y compris sur une autre page. */
  const enregistrerAilleurs = useCallback(
    (suite: Page) => {
      if (suite.chemin === chemin) {
        enregistrer(suite)
        return
      }
      ecrirePage(suite)
      setPages(toutesLesPages())
      void fetch('/api/corrections', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-relecture-cle': localStorage.getItem(CLE) ?? '',
        },
        body: JSON.stringify({
          chemin: suite.chemin,
          titre: suite.titre,
          valideeLe: suite.valideeLe,
          notes: suite.notes,
        }),
      }).catch(() => setSync('local'))
    },
    [chemin, enregistrer],
  )

  const modifierNote = useCallback(
    (cible: Page, id: string, valeur: string) =>
      enregistrerAilleurs({
        ...cible,
        notes: cible.notes.map((n) =>
          n.id === id ? { ...n, texte: valeur, majLe: new Date().toISOString() } : n,
        ),
      }),
    [enregistrerAilleurs],
  )

  const supprimerNote = useCallback(
    (cible: Page, id: string) =>
      enregistrerAilleurs({ ...cible, notes: cible.notes.filter((n) => n.id !== id) }),
    [enregistrerAilleurs],
  )

  const copier = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(texteBloc(pages))
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      /* presse-papier refusé : rien à faire de mieux */
    }
  }, [pages])

  const total = useMemo(() => pages.reduce((s, p) => s + p.notes.length, 0), [pages])
  const validees = useMemo(() => pages.filter((p) => p.valideeLe), [pages])
  const aNotes = useMemo(() => pages.filter((p) => p.notes.length), [pages])

  // Le livre feuilletable est un lecteur plein écran : rien ne s'y superpose.
  if (!monte || chemin.startsWith('/atelier/livre')) return null

  // L'ombre douce détache les boutons du texte qui défile dessous (charte, §8).
  const bouton =
    'flex h-11 flex-1 items-center justify-center gap-2 rounded-[2px] border border-piste bg-fond-carte px-3 text-mention uppercase tracking-wider text-texte shadow-[0_2px_10px_rgba(21,32,53,0.10)] sm:flex-none'
  const feuille =
    'fixed inset-x-0 bottom-0 z-[80] flex max-h-[85dvh] flex-col rounded-t-[6px] border border-piste bg-fond-carte pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-20 sm:right-4 sm:w-[400px] sm:rounded-[2px] sm:pb-0'

  return (
    <>
      {/* barre de boutons */}
      <div
        className="fixed inset-x-3 z-[60] flex gap-2 sm:inset-x-auto sm:right-4"
        style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => {
            setVue(vue === 'note' ? null : 'note')
            setTexte('')
          }}
          className={`chiffre ${bouton}`}
        >
          Noter
        </button>
        <button
          type="button"
          onClick={() => setVue(vue === 'liste' ? null : 'liste')}
          className={`chiffre ${bouton}`}
        >
          Liste
          {total > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-vert px-1 text-mention text-fond-carte">
              {total}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={basculerValidee}
          aria-pressed={page.valideeLe !== null}
          className={`chiffre ${bouton} ${page.valideeLe ? 'border-vert text-vert' : ''}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7.4 5.4 11 12 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {page.valideeLe ? 'Validée' : 'Valider'}
        </button>
      </div>

      {/* encart d'écriture */}
      {vue === 'note' && (
        <>
          <div className="fixed inset-0 z-[70] bg-texte/20" onClick={() => setVue(null)} />
          <div className={feuille}>
            <div className="flex items-center justify-between border-b border-piste px-4 py-3">
              <span className="chiffre text-mention uppercase tracking-wider text-texte-faible">
                Note sur cette page
              </span>
              <button
                type="button"
                onClick={() => setVue(null)}
                className="chiffre text-mention uppercase tracking-wider text-texte-faible"
              >
                Fermer
              </button>
            </div>
            <div className="p-4">
              <textarea
                autoFocus
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                rows={5}
                placeholder="Ce qu'il faut changer sur cette page."
                className="w-full rounded-[2px] border border-piste bg-fond p-3 text-petit text-texte"
              />
              <button
                type="button"
                onClick={ajouter}
                disabled={!texte.trim()}
                className="chiffre mt-3 h-11 w-full rounded-[2px] bg-vert text-mention uppercase tracking-wider text-fond-carte disabled:opacity-40"
              >
                Valider
              </button>
            </div>
          </div>
        </>
      )}

      {/* liste de toutes les notes, page par page */}
      {vue === 'liste' && (
        <>
          <div className="fixed inset-0 z-[70] bg-texte/20" onClick={() => setVue(null)} />
          <div className={feuille}>
            <div className="flex items-center justify-between border-b border-piste px-4 py-3">
              <span className="chiffre text-mention uppercase tracking-wider text-texte-faible">
                {total} note{total > 1 ? 's' : ''} sur {aNotes.length} page{aNotes.length > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => setVue(null)}
                className="chiffre text-mention uppercase tracking-wider text-texte-faible"
              >
                Fermer
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {aNotes.length === 0 && (
                <p className="p-4 text-petit text-texte-faible">
                  Aucune note pour le moment. Le bouton « Noter » en ajoute une sur la page où vous
                  êtes.
                </p>
              )}

              {aNotes.map((p) => {
                const ouverte = ouvertes.includes(p.chemin) || p.chemin === chemin
                return (
                  <section key={p.chemin} className="border-b border-piste">
                    <button
                      type="button"
                      onClick={() =>
                        setOuvertes((o) =>
                          o.includes(p.chemin) ? o.filter((x) => x !== p.chemin) : [...o, p.chemin],
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-petit text-texte">
                          {p.titre || p.chemin}
                        </span>
                        <span className="chiffre block truncate text-mention text-texte-faible">
                          {p.chemin}
                          {p.chemin === chemin ? ' · page courante' : ''}
                        </span>
                      </span>
                      <span className="chiffre flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-piste px-1 text-mention text-texte">
                        {p.notes.length}
                      </span>
                    </button>

                    {ouverte && (
                      <ol className="flex flex-col gap-3 px-4 pb-4">
                        {p.notes.map((n, i) => (
                          <li key={n.id} className="rounded-[2px] border border-piste p-3">
                            {enEdition === n.id ? (
                              <>
                                <textarea
                                  value={texteEdition}
                                  onChange={(e) => setTexteEdition(e.target.value)}
                                  rows={3}
                                  className="w-full rounded-[2px] border border-piste bg-fond p-2 text-petit text-texte"
                                />
                                <div className="mt-2 flex justify-end gap-4">
                                  <button
                                    type="button"
                                    onClick={() => setEnEdition(null)}
                                    className="chiffre text-mention uppercase tracking-wider text-texte-faible"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      modifierNote(p, n.id, texteEdition.trim())
                                      setEnEdition(null)
                                    }}
                                    disabled={!texteEdition.trim()}
                                    className="chiffre text-mention uppercase tracking-wider text-vert disabled:opacity-40"
                                  >
                                    Enregistrer
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="chiffre text-mention text-texte-faible">
                                  {i + 1} · {jour(n.majLe ?? n.creeLe)}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-petit text-texte">
                                  {n.texte}
                                </p>
                                <div className="mt-2 flex justify-end gap-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEnEdition(n.id)
                                      setTexteEdition(n.texte)
                                    }}
                                    className="chiffre text-mention uppercase tracking-wider text-texte-faible"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => supprimerNote(p, n.id)}
                                    className="chiffre text-mention uppercase tracking-wider text-texte-faible"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                )
              })}

              {/* historique des pages validées */}
              <section className="px-4 py-4">
                <p className="chiffre text-mention uppercase tracking-wider text-texte-faible">
                  Pages validées · {validees.length}
                </p>
                {validees.length === 0 ? (
                  <p className="mt-2 text-petit text-texte-faible">
                    Le bouton « Valider » marque la page où vous êtes comme relue.
                  </p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {validees
                      .slice()
                      .sort((a, b) => (b.valideeLe ?? '').localeCompare(a.valideeLe ?? ''))
                      .map((p) => (
                        <li key={p.chemin} className="flex items-center justify-between gap-3">
                          <a href={p.chemin} className="min-w-0 truncate text-petit text-texte">
                            {p.titre || p.chemin}
                          </a>
                          <span className="chiffre shrink-0 text-mention text-texte-faible">
                            {jour(p.valideeLe!)}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="border-t border-piste p-4">
              <p className="chiffre text-mention uppercase tracking-wider text-texte-faible">
                {sync === 'github' && 'Enregistrées sur GitHub'}
                {sync === 'local' && 'Locales seulement'}
                {sync === 'cle' && 'Clé de relecture requise'}
                {sync === 'inconnu' && 'Enregistrées dans ce navigateur'}
              </p>
              {sync === 'cle' && (
                <input
                  type="password"
                  placeholder="Clé de relecture"
                  className="mt-2 w-full rounded-[2px] border border-piste bg-fond p-2 text-petit"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      localStorage.setItem(CLE, (e.target as HTMLInputElement).value)
                      enregistrer({ ...page })
                    }
                  }}
                />
              )}
              <button
                type="button"
                onClick={copier}
                className="chiffre mt-2 h-11 w-full rounded-[2px] border border-piste text-mention uppercase tracking-wider text-texte"
              >
                {copie ? 'Copié' : 'Copier tout pour Claude'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
