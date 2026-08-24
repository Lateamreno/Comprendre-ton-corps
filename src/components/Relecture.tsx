'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * L'outil de relecture de l'auteur.
 *
 * Un bouton flottant ouvre le panneau. « Corriger un passage » passe en mode
 * sélection : on sélectionne du texte comme sur téléphone, une pastille
 * « Noter » apparaît, on écrit ce qu'on veut changer, et à la validation la
 * surbrillance disparaît — seul un numéro reste à côté du passage.
 *
 * Les corrections vivent dans le navigateur (localStorage) et se synchronisent
 * quand c'est configuré vers la branche `corrections` du repo, où Claude les
 * lit pour les appliquer par lot. Sans configuration, un bouton copie le tout
 * pour le coller dans la conversation.
 *
 * Les marqueurs affichent leur numéro en ::after (CSS) : ils n'ajoutent aucun
 * caractère au texte, ce qui garde exacts les repérages par contexte.
 */

type Correction = {
  id: string
  extrait: string
  avant: string
  apres: string
  note: string
  creeLe: string
}

const PREFIXE = 'relecture:'
const CONTEXTE = 40

function lireStock(chemin: string): Correction[] {
  try {
    return JSON.parse(localStorage.getItem(PREFIXE + chemin) ?? '[]') as Correction[]
  } catch {
    return []
  }
}

function ecrireStock(chemin: string, liste: Correction[]) {
  try {
    if (liste.length === 0) localStorage.removeItem(PREFIXE + chemin)
    else localStorage.setItem(PREFIXE + chemin, JSON.stringify(liste))
  } catch {
    /* stockage indisponible : le panneau reste utilisable, sans persistance */
  }
}

function toutesLesCorrections(): { chemin: string; corrections: Correction[] }[] {
  const tout: { chemin: string; corrections: Correction[] }[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIXE) && k !== PREFIXE + 'cle') {
        const chemin = k.slice(PREFIXE.length)
        const corrections = lireStock(chemin)
        if (corrections.length) tout.push({ chemin, corrections })
      }
    }
  } catch {
    /* voir ci-dessus */
  }
  return tout.sort((a, b) => a.chemin.localeCompare(b.chemin))
}

function texteBloc(): string {
  const parties = toutesLesCorrections().map(({ chemin, corrections }) => {
    const lignes = corrections.map(
      (c, i) => `${i + 1}. « ${c.extrait} »\n   → ${c.note}`,
    )
    return `== ${chemin}\n${lignes.join('\n')}`
  })
  return `Corrections de relecture\n\n${parties.join('\n\n')}\n`
}

/** Première occurrence de l'extrait dont le contexte amont correspond. */
function trouverOffset(texte: string, c: Correction): number {
  let i = texte.indexOf(c.extrait)
  let premier = i
  while (i !== -1) {
    const amont = texte.slice(Math.max(0, i - c.avant.length), i)
    if (c.avant === '' || amont === c.avant) return i
    i = texte.indexOf(c.extrait, i + 1)
  }
  return premier
}

function noeudALOffset(zone: HTMLElement, offset: number): { noeud: Text; decalage: number } | null {
  const marcheur = document.createTreeWalker(zone, NodeFilter.SHOW_TEXT)
  let cumul = 0
  let n = marcheur.nextNode() as Text | null
  while (n) {
    if (cumul + n.data.length >= offset) return { noeud: n, decalage: offset - cumul }
    cumul += n.data.length
    n = marcheur.nextNode() as Text | null
  }
  return null
}

export function Relecture() {
  const chemin = usePathname()
  const [monte, setMonte] = useState(false)
  const [liste, setListe] = useState<Correction[]>([])
  const [panneau, setPanneau] = useState(false)
  const [modeSelection, setModeSelection] = useState(false)
  const [pastille, setPastille] = useState<{ x: number; y: number } | null>(null)
  const [dialogue, setDialogue] = useState<{ extrait: string; avant: string; apres: string } | null>(null)
  const [note, setNote] = useState('')
  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [noteEdition, setNoteEdition] = useState('')
  const [etatSync, setEtatSync] = useState<'inconnu' | 'github' | 'local' | 'cle'>('inconnu')
  const [copie, setCopie] = useState(false)
  const [totalAilleurs, setTotalAilleurs] = useState(0)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMonte(true)
  }, [])

  useEffect(() => {
    if (!monte) return
    setListe(lireStock(chemin))
    setPanneau(false)
    setModeSelection(false)
    setDialogue(null)
  }, [monte, chemin])

  useEffect(() => {
    if (!monte) return
    const total = toutesLesCorrections().reduce((s, p) => s + p.corrections.length, 0)
    setTotalAilleurs(total - liste.length)
  }, [monte, liste])

  /* ---- marqueurs numérotés dans la page ---- */
  useEffect(() => {
    if (!monte) return
    const zone = document.querySelector('main')
    if (!zone) return
    zone.querySelectorAll('sup.rel-marq').forEach((m) => m.remove())

    const texte = zone.textContent ?? ''
    const places = liste
      .map((c, i) => ({ c, i, offset: trouverOffset(texte, c) }))
      .filter((p) => p.offset !== -1)
      .sort((a, b) => b.offset - a.offset)

    for (const p of places) {
      const fin = noeudALOffset(zone as HTMLElement, p.offset + p.c.extrait.length)
      if (!fin) continue
      const reste = fin.noeud.splitText(fin.decalage)
      const marque = document.createElement('sup')
      marque.className = 'rel-marq'
      marque.dataset.n = String(p.i + 1)
      marque.title = p.c.note
      marque.onclick = () => setPanneau(true)
      reste.parentNode?.insertBefore(marque, reste)
    }
    return () => {
      zone.querySelectorAll('sup.rel-marq').forEach((m) => m.remove())
    }
  }, [monte, liste, chemin])

  /* ---- pastille « Noter » qui suit la sélection ---- */
  useEffect(() => {
    if (!modeSelection) {
      setPastille(null)
      return
    }
    const surSelection = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setPastille(null)
        return
      }
      const zone = document.querySelector('main')
      if (!zone || !zone.contains(sel.anchorNode)) return
      const r = sel.getRangeAt(0).getBoundingClientRect()
      setPastille({ x: r.left + r.width / 2, y: r.top })
    }
    document.addEventListener('selectionchange', surSelection)
    return () => document.removeEventListener('selectionchange', surSelection)
  }, [modeSelection])

  const capturerSelection = useCallback(() => {
    const sel = window.getSelection()
    const zone = document.querySelector('main')
    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !zone) return
    const extrait = sel.toString()
    if (!extrait.trim()) return
    const r = sel.getRangeAt(0)
    const amont = r.cloneRange()
    amont.selectNodeContents(zone)
    amont.setEnd(r.startContainer, r.startOffset)
    const debut = amont.toString().length
    const texte = zone.textContent ?? ''
    setDialogue({
      extrait,
      avant: texte.slice(Math.max(0, debut - CONTEXTE), debut),
      apres: texte.slice(debut + extrait.length, debut + extrait.length + CONTEXTE),
    })
    setNote('')
    setPastille(null)
  }, [])

  const enregistrer = useCallback(
    (nouvelle: Correction[]) => {
      setListe(nouvelle)
      ecrireStock(chemin, nouvelle)
      if (syncTimer.current) clearTimeout(syncTimer.current)
      syncTimer.current = setTimeout(async () => {
        try {
          const reponse = await fetch('/api/corrections', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-relecture-cle': localStorage.getItem(PREFIXE + 'cle') ?? '',
            },
            body: JSON.stringify({ chemin, corrections: nouvelle }),
          })
          if (reponse.ok) setEtatSync('github')
          else if (reponse.status === 401) setEtatSync('cle')
          else setEtatSync('local')
        } catch {
          setEtatSync('local')
        }
      }, 1200)
    },
    [chemin],
  )

  const valider = useCallback(() => {
    if (!dialogue || !note.trim()) return
    const nouvelle: Correction = {
      id: Math.random().toString(36).slice(2, 10),
      ...dialogue,
      note: note.trim(),
      creeLe: new Date().toISOString(),
    }
    window.getSelection()?.removeAllRanges()
    setDialogue(null)
    setModeSelection(false)
    enregistrer([...liste, nouvelle])
  }, [dialogue, note, liste, enregistrer])

  const copier = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(texteBloc())
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      /* presse-papier refusé : rien à faire de mieux */
    }
  }, [])

  if (!monte) return null

  const carte =
    'rounded-[2px] border border-piste bg-fond-carte'

  return (
    <>
      {/* bouton flottant */}
      <button
        type="button"
        onClick={() => {
          setPanneau((p) => !p)
          setModeSelection(false)
        }}
        aria-label="Relecture"
        className={`${carte} fixed bottom-4 right-4 z-[60] flex h-11 items-center gap-2 px-4`}
      >
        <span className="chiffre text-mention uppercase tracking-wider text-texte">
          Relecture
        </span>
        {liste.length > 0 && (
          <span className="chiffre flex h-5 min-w-5 items-center justify-center rounded-full bg-vert px-1 text-mention text-fond-carte">
            {liste.length}
          </span>
        )}
      </button>

      {/* consigne du mode sélection */}
      {modeSelection && !dialogue && (
        <div
          className={`${carte} fixed bottom-20 right-4 z-[60] flex items-center gap-4 px-4 py-3`}
        >
          <span className="text-petit text-texte">
            Sélectionner le texte à corriger.
          </span>
          <button
            type="button"
            onClick={() => setModeSelection(false)}
            className="chiffre text-mention uppercase tracking-wider text-texte-faible"
          >
            Annuler
          </button>
        </div>
      )}

      {/* pastille au-dessus de la sélection */}
      {modeSelection && pastille && !dialogue && (
        <button
          type="button"
          onClick={capturerSelection}
          className="fixed z-[70] -translate-x-1/2 -translate-y-full rounded-[2px] bg-texte px-3 py-1.5 text-petit text-fond-carte"
          style={{ left: pastille.x, top: pastille.y - 6 }}
        >
          Noter
        </button>
      )}

      {/* boîte de dialogue */}
      {dialogue && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-texte/20 p-4 sm:items-center">
          <div className={`${carte} w-full max-w-md p-5`}>
            <p className="chiffre text-mention uppercase tracking-wider text-texte-faible">
              Passage sélectionné
            </p>
            <p className="mt-2 max-h-20 overflow-y-auto font-titre text-petit italic text-texte">
              « {dialogue.extrait} »
            </p>
            <label className="chiffre mt-4 block text-mention uppercase tracking-wider text-texte-faible">
              Ce qu&rsquo;il faut changer
            </label>
            <textarea
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-[2px] border border-piste bg-fond p-2 text-petit text-texte"
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setDialogue(null)}
                className="chiffre text-mention uppercase tracking-wider text-texte-faible"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={valider}
                disabled={!note.trim()}
                className="chiffre rounded-[2px] bg-vert px-4 py-2 text-mention uppercase tracking-wider text-fond-carte disabled:opacity-40"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* panneau : liste des corrections */}
      {panneau && !modeSelection && !dialogue && (
        <div
          className={`${carte} fixed bottom-20 right-4 z-[60] flex max-h-[70vh] w-[min(92vw,380px)] flex-col`}
        >
          <div className="border-b border-piste p-4">
            <button
              type="button"
              onClick={() => {
                setPanneau(false)
                setModeSelection(true)
              }}
              className="chiffre w-full rounded-[2px] bg-vert px-4 py-2.5 text-mention uppercase tracking-wider text-fond-carte"
            >
              Corriger un passage
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {liste.length === 0 ? (
              <p className="text-petit text-texte-faible">
                Aucune correction sur cette page.
              </p>
            ) : (
              <ol className="flex flex-col gap-4">
                {liste.map((c, i) => (
                  <li key={c.id} className="border-b border-piste pb-3">
                    <p className="chiffre text-mention text-texte-faible">
                      {i + 1} · « {c.extrait.length > 60 ? c.extrait.slice(0, 60) + '…' : c.extrait} »
                    </p>
                    {enEdition === c.id ? (
                      <>
                        <textarea
                          value={noteEdition}
                          onChange={(e) => setNoteEdition(e.target.value)}
                          rows={2}
                          className="mt-2 w-full rounded-[2px] border border-piste bg-fond p-2 text-petit text-texte"
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
                              enregistrer(
                                liste.map((x) =>
                                  x.id === c.id ? { ...x, note: noteEdition.trim() } : x,
                                ),
                              )
                              setEnEdition(null)
                            }}
                            disabled={!noteEdition.trim()}
                            className="chiffre text-mention uppercase tracking-wider text-vert disabled:opacity-40"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <p className="text-petit text-texte">{c.note}</p>
                        <span className="flex shrink-0 gap-3">
                          <button
                            type="button"
                            aria-label="Modifier"
                            onClick={() => {
                              setEnEdition(c.id)
                              setNoteEdition(c.note)
                            }}
                            className="text-texte-faible"
                          >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                              <path d="M10.5 1.5 13.5 4.5 5 13H2v-3l8.5-8.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            aria-label="Supprimer"
                            onClick={() => enregistrer(liste.filter((x) => x.id !== c.id))}
                            className="text-texte-faible"
                          >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                              <path d="M3 4h9M6 4V2.5h3V4M4 4l.7 9h5.6L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="border-t border-piste p-4">
            <p className="chiffre text-mention uppercase tracking-wider text-texte-faible">
              {liste.length} sur cette page
              {totalAilleurs > 0 ? ` · ${totalAilleurs} ailleurs` : ''}
              {etatSync === 'github' && ' · enregistrées sur GitHub'}
              {etatSync === 'local' && ' · locales seulement'}
              {etatSync === 'cle' && ' · clé de relecture requise'}
            </p>
            {etatSync === 'cle' && (
              <input
                type="password"
                placeholder="Clé de relecture"
                className="mt-2 w-full rounded-[2px] border border-piste bg-fond p-2 text-petit"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    localStorage.setItem(PREFIXE + 'cle', (e.target as HTMLInputElement).value)
                    enregistrer([...liste])
                  }
                }}
              />
            )}
            {(etatSync === 'local' || etatSync === 'cle' || etatSync === 'inconnu') && (
              <button
                type="button"
                onClick={copier}
                className="chiffre mt-2 w-full rounded-[2px] border border-piste px-4 py-2 text-mention uppercase tracking-wider text-texte"
              >
                {copie ? 'Copié' : 'Copier tout pour Claude'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
