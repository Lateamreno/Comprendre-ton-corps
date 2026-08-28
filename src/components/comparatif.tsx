import { identites, palette, polices, type NomGrandeur } from '@/lib/tokens'

/**
 * Les briques des tableaux comparatifs.
 *
 * Un tableau comparatif est une grille : une ligne par sujet, une colonne par
 * grandeur, et dans chaque case un pictogramme, une valeur et une jauge. Il
 * suit la même règle que les fiches : le pictogramme dit de quelle grandeur on
 * parle, la jauge dit où se situe la mesure, et le nombre est écrit
 * (CLAUDE.md §8). Aucune couleur n'est décidée ici.
 */

function borne(v: number) {
  return Math.min(1, Math.max(0, v))
}

/**
 * Les pictogrammes des tableaux, dessinés en SVG.
 *
 * Les fichiers de la bibliothèque sont des images opaques : employées comme
 * masque elles donnent un carré plein, et à la taille d'une case de tableau
 * elles seraient de toute façon illisibles. Ces tracés portent la couleur
 * d'identité de leur grandeur, restent nets à l'impression, et disent de
 * quelle grandeur on parle sans jamais dire sa valeur (CLAUDE.md §8).
 */

type NomIcone =
  | 'flamme'
  | 'chrono'
  | 'haltere'
  | 'coeur'
  | 'articulation'
  | 'feuille'
  | 'cubes'
  | 'goutte'
  | 'estomac'

const TRACES: Record<NomIcone, string> = {
  flamme:
    'M12.6 1.5c.9 4.2-1.6 5.8-3.5 7.8C7 11.4 5.2 13.4 5.2 16.2 5.2 19.9 8.2 22.5 12 22.5s6.8-2.6 6.8-6.3c0-2.7-1.4-4.7-3-6.5-.4 1.4-1.2 2.4-2.3 3 .5-4.2-.5-7.9-.9-11.2Z',
  chrono:
    'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 3.4V12l3 2M9.5 2.5h5',
  haltere: 'M2.5 8.5v7M5.5 6.5v11M18.5 6.5v11M21.5 8.5v7M5.5 12h13',
  coeur:
    'M12 20.5C6.5 16.5 3 13.6 3 9.9 3 7.1 5.1 5 7.8 5c1.6 0 3.1.8 4.2 2.1C13.1 5.8 14.6 5 16.2 5 18.9 5 21 7.1 21 9.9c0 3.7-3.5 6.6-9 10.6Z',
  articulation:
    'M5 5.5a2.6 2.6 0 1 1 3.7 3.6l6.9 6.9A2.6 2.6 0 1 1 15 19.6l-6.9-6.9A2.6 2.6 0 1 1 5 5.5Z',
  feuille: 'M20 4C10 4 4 8.5 4 15c0 2 .6 3.6 1.6 5C7 14 11 10.6 17 9c-4.4 2.3-7.4 5.6-8.6 10.6C16 21 20 15 20 4Z',
  cubes: 'M4 13h7v7H4zM13 13h7v7h-7zM8.5 4h7v7h-7z',
  goutte: 'M12 3c-3.6 4.3-6 7.4-6 10.4A6 6 0 0 0 18 13.4C18 10.4 15.6 7.3 12 3Z',
  estomac:
    'M9 3v5.5c0 3.5-3 3.8-3 7.2 0 3 2.4 5.3 5.5 5.3 3.4 0 5.9-2.4 6.4-5.9.4-2.8-.6-5-2.3-6.3',
}

/** Les tracés qui se dessinent au trait plutôt qu'en aplat. */
const AU_TRAIT: NomIcone[] = ['chrono', 'haltere', 'estomac']

/** Épaisseur du trait, plus généreuse pour les tracés fins. */
const EPAISSEUR: Partial<Record<NomIcone, number>> = { haltere: 2.4 }

export function Icone({
  nom,
  couleur,
  taille = 17,
}: {
  nom: NomIcone
  couleur: string
  taille?: number
}) {
  const trait = AU_TRAIT.includes(nom)
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d={TRACES[nom]}
        fill={trait ? 'none' : couleur}
        stroke={trait ? couleur : 'none'}
        strokeWidth={trait ? (EPAISSEUR[nom] ?? 1.9) : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * L'échelle en points : quatre plots dont les premiers sont allumés.
 *
 * Elle sert aux grandeurs qui n'ont pas d'unité — l'effort musculaire, la
 * sollicitation cardiaque. Le nombre de points allumés est la donnée ; le mot
 * écrit au-dessous la répète, pour que l'information ne tienne pas à la seule
 * couleur.
 */
export function EchellePoints({
  niveau,
  sur = 4,
  couleur,
}: {
  /** De 1 à `sur`. */
  niveau: number
  sur?: number
  couleur: string
}) {
  return (
    <span
      style={{ display: 'flex', gap: 3, alignItems: 'center', lineHeight: 0 }}
      aria-hidden="true"
    >
      {Array.from({ length: sur }, (_, i) => (
        <span
          key={i}
          style={{
            display: 'block',
            width: 9,
            height: 9,
            borderRadius: 2,
            background: i < niveau ? couleur : palette.piste,
          }}
        />
      ))}
    </span>
  )
}

/**
 * La pile de fatigue : un contenant fixe, un niveau variable.
 *
 * C'est l'un des rares dessins du livre dont le remplissage est lui-même la
 * donnée, au même titre que l'anneau et l'estomac.
 */
export function Pile({
  part,
  couleur,
  hauteur = 30,
}: {
  /** De 0 à 1. */
  part: number
  couleur: string
  hauteur?: number
}) {
  const large = hauteur * 0.58
  const borne_ = borne(part)
  const interieur = hauteur - 8
  const rempli = interieur * borne_

  return (
    <svg
      width={large}
      height={hauteur}
      viewBox={`0 0 ${large} ${hauteur}`}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect
        x={large * 0.32}
        y="0"
        width={large * 0.36}
        height="3"
        rx="1"
        fill={palette.texteFaible}
      />
      <rect
        x="0.9"
        y="4"
        width={large - 1.8}
        height={interieur}
        rx="3"
        fill={palette.fondCarte}
        stroke={palette.texteFaible}
        strokeWidth="1.4"
      />
      <rect
        x="3"
        y={4 + (interieur - rempli) + 1}
        width={large - 6}
        height={Math.max(rempli - 2, 0)}
        rx="1.5"
        fill={couleur}
      />
    </svg>
  )
}

/**
 * La courbe glycémique en réduction.
 *
 * Même grammaire que la grande : un trait de départ en pointillé, une bosse
 * dont la hauteur et l'avance suivent l'indice, et l'aire teintée sous elle.
 */
export function CourbeMini({
  indice,
  largeur = 74,
  hauteur = 34,
}: {
  indice: number
  largeur?: number
  hauteur?: number
}) {
  const base = hauteur - 4
  const pic = base - borne(indice / 110) * (base - 6)
  const chemin =
    `M2 ${base} C ${largeur * 0.28} ${base} ${largeur * 0.3} ${pic} ${largeur * 0.46} ${pic}` +
    ` C ${largeur * 0.66} ${pic} ${largeur * 0.7} ${base - 1} ${largeur - 2} ${base}`

  return (
    <svg width={largeur} height={hauteur} viewBox={`0 0 ${largeur} ${hauteur}`} aria-hidden="true">
      <path
        d={`M2 5 h${largeur - 4}`}
        stroke={palette.texteFaible}
        strokeWidth="1"
        strokeDasharray="3 3"
        opacity="0.7"
      />
      <path d={`${chemin} L${largeur - 2} ${base} Z`} fill={identites.glycemie.couleur} opacity="0.14" />
      <path d={chemin} fill="none" stroke={identites.glycemie.couleur} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Les zones musculaires que la carte du corps sait éclairer.
 *
 * Elles sont volontairement grossières : le dessin sert à situer un effort,
 * pas à enseigner l'anatomie.
 */
export type ZoneMuscle =
  | 'epaules'
  | 'pectoraux'
  | 'biceps'
  | 'avantBras'
  | 'abdominaux'
  | 'quadriceps'
  | 'mollets'
  | 'trapezes'
  | 'dorsaux'
  | 'triceps'
  | 'lombaires'
  | 'fessiers'
  | 'ischios'

type Forme = { x: number; y: number; l: number; h: number; r?: number }

const ZONES_AVANT: Partial<Record<ZoneMuscle, Forme[]>> = {
  epaules: [
    { x: 10, y: 25, l: 10, h: 9, r: 4.5 },
    { x: 42, y: 25, l: 10, h: 9, r: 4.5 },
  ],
  pectoraux: [
    { x: 19, y: 27, l: 11, h: 11, r: 3 },
    { x: 32, y: 27, l: 11, h: 11, r: 3 },
  ],
  biceps: [
    { x: 9, y: 35, l: 8, h: 13, r: 4 },
    { x: 45, y: 35, l: 8, h: 13, r: 4 },
  ],
  avantBras: [
    { x: 9, y: 50, l: 7, h: 14, r: 3.5 },
    { x: 46, y: 50, l: 7, h: 14, r: 3.5 },
  ],
  abdominaux: [{ x: 23, y: 40, l: 16, h: 21, r: 3 }],
  quadriceps: [
    { x: 19, y: 73, l: 11, h: 29, r: 5 },
    { x: 32, y: 73, l: 11, h: 29, r: 5 },
  ],
  mollets: [
    { x: 20, y: 107, l: 9, h: 21, r: 4 },
    { x: 33, y: 107, l: 9, h: 21, r: 4 },
  ],
}

const ZONES_ARRIERE: Partial<Record<ZoneMuscle, Forme[]>> = {
  trapezes: [{ x: 23, y: 24, l: 16, h: 12, r: 4 }],
  dorsaux: [{ x: 19, y: 35, l: 24, h: 18, r: 4 }],
  epaules: [
    { x: 10, y: 25, l: 10, h: 9, r: 4.5 },
    { x: 42, y: 25, l: 10, h: 9, r: 4.5 },
  ],
  triceps: [
    { x: 9, y: 35, l: 8, h: 13, r: 4 },
    { x: 45, y: 35, l: 8, h: 13, r: 4 },
  ],
  avantBras: [
    { x: 9, y: 50, l: 7, h: 14, r: 3.5 },
    { x: 46, y: 50, l: 7, h: 14, r: 3.5 },
  ],
  lombaires: [{ x: 23, y: 54, l: 16, h: 9, r: 3 }],
  fessiers: [{ x: 19, y: 64, l: 24, h: 13, r: 5 }],
  ischios: [
    { x: 19, y: 78, l: 11, h: 25, r: 5 },
    { x: 32, y: 78, l: 11, h: 25, r: 5 },
  ],
  mollets: [
    { x: 20, y: 107, l: 9, h: 21, r: 4 },
    { x: 33, y: 107, l: 9, h: 21, r: 4 },
  ],
}

/** Le corps nu, sur lequel les zones se posent. */
const CORPS: Forme[] = [
  { x: 24, y: 3, l: 14, h: 16, r: 7 },
  { x: 28, y: 17, l: 6, h: 6, r: 2 },
  { x: 18, y: 23, l: 26, h: 40, r: 8 },
  { x: 8, y: 24, l: 10, h: 42, r: 5 },
  { x: 44, y: 24, l: 10, h: 42, r: 5 },
  { x: 19, y: 62, l: 24, h: 12, r: 5 },
  { x: 19, y: 70, l: 11, h: 60, r: 5 },
  { x: 32, y: 70, l: 11, h: 60, r: 5 },
]

/**
 * La carte du corps.
 *
 * Deux niveaux seulement — fortement et moyennement sollicité — parce qu'un
 * troisième ne se distinguerait plus à la taille où la carte est imprimée.
 */
export function Silhouette({
  face,
  zones,
  hauteur = 96,
}: {
  face: 'avant' | 'arriere'
  zones: Partial<Record<ZoneMuscle, 'fort' | 'moyen'>>
  hauteur?: number
}) {
  const table = face === 'avant' ? ZONES_AVANT : ZONES_ARRIERE
  const large = hauteur * (62 / 134)

  return (
    <svg
      width={large}
      height={hauteur}
      viewBox="0 0 62 134"
      aria-label={face === 'avant' ? 'muscles vus de face' : 'muscles vus de dos'}
      role="img"
      style={{ display: 'block' }}
    >
      {CORPS.map((f, i) => (
        <rect key={i} x={f.x} y={f.y} width={f.l} height={f.h} rx={f.r ?? 3} fill="#D3D7DC" />
      ))}
      {Object.entries(zones).map(([zone, niveau]) => {
        const formes = table[zone as ZoneMuscle]
        if (!formes) return null
        return formes.map((f, i) => (
          <rect
            key={`${zone}-${i}`}
            x={f.x}
            y={f.y}
            width={f.l}
            height={f.h}
            rx={f.r ?? 3}
            fill={palette.rouge}
            fillOpacity={niveau === 'fort' ? 0.92 : 0.4}
          />
        ))
      })}
    </svg>
  )
}

/** La légende des deux niveaux, à poser une fois par tableau. */
export function LegendeMuscles() {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
      {(
        [
          ['Fortement sollicités', 0.92],
          ['Moyennement sollicités', 0.4],
        ] as const
      ).map(([texte, opacite]) => (
        <span key={texte} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: palette.rouge,
              opacity: opacite,
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: polices.fiche, fontSize: '0.52em', color: palette.texteFaible }}>
            {texte}
          </span>
        </span>
      ))}
    </span>
  )
}

/**
 * Une bande qui traverse les deux colonnes de la double page.
 *
 * Les pages de tableau ont un texte d'introduction qui décrit la grille
 * entière : coupé en deux colonnes au-dessus d'un tableau lui-même pleine
 * largeur, il se lit mal. Cette bande le tient d'un bloc.
 */
export function PleineLargeur({ children }: { children: React.ReactNode }) {
  return <div style={{ columnSpan: 'all' }}>{children}</div>
}
