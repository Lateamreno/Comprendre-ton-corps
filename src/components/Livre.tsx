'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { page as formatPage, formatLivre, palette, polices } from '@/lib/tokens'

/**
 * Le livre feuilletable, au format réel.
 *
 * Une double page du livre est un feuillet. Sur un écran large, le feuillet
 * s'affiche ouvert, comme un livre posé à plat. Sur un téléphone tenu à la
 * verticale, il n'y a la place que d'une page : le lecteur voit la page de
 * gauche, puis celle de droite. Dans les deux cas, ce qui s'affiche est la
 * composition imprimée, sans réadaptation — c'est tout l'intérêt.
 *
 * Une page de 8,25 × 11 pouces réduite à la largeur d'un téléphone donne un
 * corps de texte d'environ 6 pixels : illisible. Le zoom n'est donc pas un
 * confort ici, c'est ce qui rend l'objet utilisable. Double tape ou
 * pincement, puis on déplace la page au doigt.
 */

const ZOOM_MAX = 4
const ZOOM_TAPE = 2

type Etat = { echelle: number; x: number; y: number }

const REPOS: Etat = { echelle: 1, x: 0, y: 0 }

export function Livre({
  feuillets,
  titres,
}: {
  feuillets: React.ReactNode[]
  titres: string[]
}) {
  const cadre = useRef<HTMLDivElement>(null)
  const [boite, setBoite] = useState({ largeur: 0, hauteur: 0 })
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState<Etat>(REPOS)
  const [glisse, setGlisse] = useState(0)
  const [anime, setAnime] = useState(true)

  /* La place disponible commande le nombre de pages affichées. */
  useEffect(() => {
    const element = cadre.current
    if (!element) return
    const observateur = new ResizeObserver(([entree]) => {
      const { width, height } = entree.contentRect
      setBoite({ largeur: width, hauteur: height })
    })
    observateur.observe(element)
    return () => observateur.disconnect()
  }, [])

  const ouvert = boite.largeur / Math.max(boite.hauteur, 1) > 1.15
  const feuilles = ouvert ? 2 : 1
  const proportion = (formatPage.largeurMm * feuilles) / formatPage.hauteurMm

  let largeur = boite.largeur
  let hauteur = largeur / proportion
  if (hauteur > boite.hauteur) {
    hauteur = boite.hauteur
    largeur = hauteur * proportion
  }
  const largeurPage = largeur / feuilles
  const largeurFeuillet = largeurPage * 2
  const pas = ouvert ? largeurFeuillet : largeurPage
  const total = ouvert ? feuillets.length : feuillets.length * 2

  /* Changer de mode ne doit pas faire perdre sa place au lecteur. */
  const modePrecedent = useRef(ouvert)
  useEffect(() => {
    if (modePrecedent.current === ouvert) return
    setIndex((i) => (ouvert ? Math.floor(i / 2) : i * 2))
    modePrecedent.current = ouvert
  }, [ouvert])

  const allerA = useCallback(
    (cible: number) => {
      setAnime(true)
      setZoom(REPOS)
      setIndex((i) => {
        const borne = Math.min(Math.max(cible, 0), Math.max(total - 1, 0))
        return borne === i ? i : borne
      })
    },
    [total],
  )

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') allerA(index + 1)
      if (e.key === 'ArrowLeft') allerA(index - 1)
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [allerA, index])

  /* ---------------------------------------------------------------- */
  /* Les gestes                                                       */
  /* ---------------------------------------------------------------- */

  const geste = useRef<{
    x: number
    y: number
    ecart: number
    echelle: number
    panX: number
    panY: number
    doigts: number
    instant: number
  } | null>(null)
  const derniereTape = useRef(0)

  const ecartDoigts = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

  const surDebut = (e: React.TouchEvent) => {
    setAnime(false)
    geste.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      ecart: e.touches.length > 1 ? ecartDoigts(e.touches) : 0,
      echelle: zoom.echelle,
      panX: zoom.x,
      panY: zoom.y,
      doigts: e.touches.length,
      instant: e.timeStamp,
    }
  }

  const surMouvement = (e: React.TouchEvent) => {
    const g = geste.current
    if (!g) return

    if (e.touches.length > 1 && g.ecart > 0) {
      const facteur = ecartDoigts(e.touches) / g.ecart
      const echelle = Math.min(Math.max(g.echelle * facteur, 1), ZOOM_MAX)
      setZoom((z) => ({ ...z, echelle }))
      return
    }

    const dx = e.touches[0].clientX - g.x
    const dy = e.touches[0].clientY - g.y

    if (zoom.echelle > 1) {
      setZoom((z) => ({ ...z, x: g.panX + dx, y: g.panY + dy }))
    } else {
      setGlisse(dx)
    }
  }

  const surFin = (e: React.TouchEvent) => {
    const g = geste.current
    geste.current = null
    setAnime(true)

    if (!g) return

    /* Une tape brève et immobile, deux fois de suite : on zoome. */
    const bref = e.timeStamp - g.instant < 260
    if (bref && g.doigts === 1 && Math.abs(glisse) < 8) {
      const depuisDerniere = e.timeStamp - derniereTape.current
      derniereTape.current = e.timeStamp
      if (depuisDerniere < 320) {
        zoomer()
        setGlisse(0)
        return
      }
    }

    if (zoom.echelle === 1 && Math.abs(glisse) > 45) {
      allerA(index + (glisse < 0 ? 1 : -1))
    }
    setGlisse(0)
  }

  /*
   * Zoomer cadre le coin haut-gauche de la page, pas son centre : c'est là
   * que la lecture commence. Le doigt fait le reste.
   */
  const zoomer = () =>
    setZoom(
      zoom.echelle > 1
        ? REPOS
        : {
            echelle: ZOOM_TAPE,
            x: ((ZOOM_TAPE - 1) / 2) * largeur,
            y: ((ZOOM_TAPE - 1) / 2) * hauteur,
          },
    )

  /* Bornes de déplacement : on ne sort pas la page du cadre. */
  const debord = ((zoom.echelle - 1) / 2) * largeur
  const debordY = ((zoom.echelle - 1) / 2) * hauteur
  const panX = Math.min(Math.max(zoom.x, -debord), debord)
  const panY = Math.min(Math.max(zoom.y, -debordY), debordY)

  const premiere = ouvert ? index * 2 : index
  const libelle = ouvert
    ? `${premiere + 1}-${premiere + 2} / ${feuillets.length * 2}`
    : `${premiere + 1} / ${feuillets.length * 2}`
  const titreCourant = titres[ouvert ? index : Math.floor(index / 2)] ?? ''

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        background: '#0E1116',
        color: '#FFFFFF',
        overscrollBehavior: 'contain',
        touchAction: 'none',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.7rem 1rem',
          fontFamily: polices.chiffre,
          fontSize: '0.7rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <a href="/atelier" style={{ color: 'inherit', textDecoration: 'underline' }}>
          Atelier
        </a>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {titreCourant}
        </span>
        <span>{formatLivre.libelle}</span>
      </header>

      <div
        ref={cadre}
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          position: 'relative',
        }}
        onTouchStart={surDebut}
        onTouchMove={surMouvement}
        onTouchEnd={surFin}
      >
        {largeur > 0 && (
          <div
            style={{
              width: largeur,
              height: hauteur,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
              background: palette.fond,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                transform: `translate(${panX}px, ${panY}px) scale(${zoom.echelle})`,
                transition: anime ? 'transform 260ms ease-out' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  height: '100%',
                  transform: `translateX(${-index * pas + glisse}px)`,
                  transition: anime ? 'transform 480ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none',
                }}
              >
                {feuillets.map((feuillet, i) => (
                  <div key={i} style={{ width: largeurFeuillet, flex: 'none', height: '100%' }}>
                    {feuillet}
                  </div>
                ))}
              </div>
            </div>

            {/* L'ombre de la pliure, qui donne l'épaisseur du livre. */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: ouvert ? '50%' : '0%',
                width: ouvert ? '5%' : '2%',
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                background:
                  'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0) 100%)',
              }}
            />
          </div>
        )}

        <BoutonPage cote="gauche" desactive={index === 0} surClic={() => allerA(index - 1)} />
        <BoutonPage
          cote="droite"
          desactive={index >= total - 1}
          surClic={() => allerA(index + 1)}
        />
      </div>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.6rem 1rem 1rem',
          fontFamily: polices.chiffre,
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        <span style={{ minWidth: '5.5em' }}>{libelle}</span>
        <input
          type="range"
          min={0}
          max={Math.max(total - 1, 0)}
          value={index}
          onChange={(e) => allerA(Number(e.target.value))}
          aria-label="Position dans le livre"
          style={{ flex: 1, accentColor: palette.vert }}
        />
        <button
          type="button"
          onClick={zoomer}
          style={{
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 2,
            padding: '0.25rem 0.6rem',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            background: 'transparent',
          }}
        >
          {zoom.echelle > 1 ? 'Réduire' : 'Zoom'}
        </button>
      </footer>
    </div>
  )
}

function BoutonPage({
  cote,
  desactive,
  surClic,
}: {
  cote: 'gauche' | 'droite'
  desactive: boolean
  surClic: () => void
}) {
  return (
    <button
      type="button"
      onClick={surClic}
      disabled={desactive}
      aria-label={cote === 'gauche' ? 'Page précédente' : 'Page suivante'}
      style={{
        position: 'absolute',
        [cote === 'gauche' ? 'left' : 'right']: 4,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 40,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 0,
        color: '#FFFFFF',
        opacity: desactive ? 0.15 : 0.6,
        fontSize: '1.6rem',
        lineHeight: 1,
        cursor: desactive ? 'default' : 'pointer',
      }}
    >
      {cote === 'gauche' ? '‹' : '›'}
    </button>
  )
}
