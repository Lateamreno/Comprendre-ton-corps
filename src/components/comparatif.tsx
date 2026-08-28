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
 * Deux exigences se croisent ici. La charte veut qu'un pictogramme porte la
 * couleur d'identité de sa grandeur ; l'œil veut qu'une flamme soit chaude et
 * un haltère métallique. Les tracés à deux tons répondent aux deux : le cœur
 * de la flamme garde le jaune de l'énergie, son enveloppe prend le rouge
 * qu'on attend d'un feu.
 *
 * Ils restent nets à l'impression, ce qu'une image ne serait pas à cette
 * taille, et ne disent jamais une valeur — c'est le rôle de la jauge posée
 * au-dessous (CLAUDE.md §8).
 */

export type NomIcone =
  | 'flamme'
  | 'chrono'
  | 'haltere'
  | 'coeur'
  | 'endurance'
  | 'force'
  | 'mixte'
  | 'feuille'
  | 'cubes'
  | 'goutte'
  | 'estomac'

type Couche = { d: string; remplir?: string; tracer?: string; epaisseur?: number }

/**
 * Chaque icône est une pile de couches. La première pose la masse, les
 * suivantes le détail — c'est ce qui les sort du pictogramme à plat.
 */
const ICONES: Record<NomIcone, (p: typeof palette) => Couche[]> = {
  flamme: (p) => [
    {
      d: 'M12.4 1.6c1 4.4-1.7 6.2-3.7 8.3-2.2 2.3-4.1 4.5-4.1 7.5 0 3.9 3.2 6.6 7.4 6.6s7.4-2.7 7.4-6.6c0-2.9-1.5-5-3.2-6.9-.4 1.5-1.2 2.5-2.4 3.2.6-4.5-.6-8.4-1.4-12.1Z',
      remplir: p.rouge,
    },
    {
      d: 'M12.2 10.6c.6 2.4-.9 3.3-1.9 4.6-.9 1.2-1.6 2.3-1.6 3.6 0 2 1.6 3.4 3.6 3.4s3.6-1.4 3.6-3.4c0-1.6-.9-2.8-1.9-3.9-.4 1-1 1.6-1.7 1.9.3-2.3-.1-4.3-.1-6.2Z',
      remplir: p.jaune,
    },
  ],
  chrono: (p) => [
    { d: 'M9.6 1.6h4.8', tracer: p.texte, epaisseur: 2 },
    { d: 'M12 3.4v2.2', tracer: p.texte, epaisseur: 2 },
    { d: 'M18.6 5.6l1.6-1.6', tracer: p.texte, epaisseur: 1.8 },
    { d: 'M12 22.4a8.4 8.4 0 1 0 0-16.8 8.4 8.4 0 0 0 0 16.8Z', remplir: p.piste },
    { d: 'M12 22.4a8.4 8.4 0 1 0 0-16.8 8.4 8.4 0 0 0 0 16.8Z', tracer: p.texte, epaisseur: 1.8 },
    { d: 'M12 9.6V14l3.2 2', tracer: p.bleu, epaisseur: 2 },
  ],
  haltere: (p) => [
    { d: 'M8 12h8', tracer: p.texte, epaisseur: 2.6 },
    { d: 'M4.4 7.6h3.2v8.8H4.4z', remplir: p.texte },
    { d: 'M16.4 7.6h3.2v8.8h-3.2z', remplir: p.texte },
    { d: 'M1.4 9.8h2.4v4.4H1.4z', remplir: p.texteFaible },
    { d: 'M20.2 9.8h2.4v4.4h-2.4z', remplir: p.texteFaible },
  ],
  coeur: (p) => [
    {
      d: 'M12 21.6C6.2 17.4 2.6 14.4 2.6 10.4 2.6 7.3 5 4.9 7.9 4.9c1.7 0 3.3.9 4.1 2.3.8-1.4 2.4-2.3 4.1-2.3 2.9 0 5.3 2.4 5.3 5.5 0 4-3.6 7-9.4 11.2Z',
      remplir: p.rouge,
    },
    { d: 'M4.6 12h3.6l1.6-3 2.4 5.4 1.8-3.2 1.4 1.8h3.8', tracer: '#FFFFFF', epaisseur: 1.6 },
  ],
  endurance: (p) => [
    { d: 'M14.6 4.4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', remplir: p.texte },
    {
      d: 'M13.8 5.8 9.6 8.2l-1.4 4.4M13.8 5.8l3.4 1.8 1.6 3.4M13.8 5.8l-.6 5 3 2.6.8 5.6M13.2 10.8l-4 2.4-3.6 3.6',
      tracer: p.texte,
      epaisseur: 2,
    },
  ],
  force: (p) => [
    { d: 'M8 12h8', tracer: p.texte, epaisseur: 2.6 },
    { d: 'M4.4 6.6h3.4v10.8H4.4z', remplir: p.texte },
    { d: 'M16.2 6.6h3.4v10.8h-3.4z', remplir: p.texte },
  ],
  mixte: (p) => [
    { d: 'M2.6 15.4h4l2.2-6.4 3 11 2.6-8 1.8 3.4h5.2', tracer: p.texte, epaisseur: 2.2 },
  ],
  feuille: (p) => [
    { d: 'M20.4 3.2C10 3.2 3.8 8 3.8 14.8c0 2.1.6 3.8 1.7 5.2 1.5-6.3 5.7-9.8 12-11.5-4.6 2.4-7.7 5.9-9 11.1 7.9 1.4 12-4.9 11.9-16.4Z', remplir: p.vert },
    { d: 'M8.4 20.4C10 14 13.6 10.6 17.5 8.5', tracer: '#FFFFFF', epaisseur: 1.3 },
  ],
  cubes: (p) => [
    { d: 'M3.6 12.8h7v7.6h-7z', remplir: p.vertClair },
    { d: 'M13.4 12.8h7v7.6h-7z', remplir: p.vertClair },
    { d: 'M8.5 3.6h7v7.6h-7z', remplir: p.vert },
  ],
  goutte: (p) => [
    { d: 'M12 2.4c-3.8 4.6-6.4 7.9-6.4 11.1a6.4 6.4 0 0 0 12.8 0c0-3.2-2.6-6.5-6.4-11.1Z', remplir: p.jaune },
    { d: 'M9.4 14.6a2.6 2.6 0 0 0 2.6 2.6', tracer: '#FFFFFF', epaisseur: 1.4 },
  ],
  estomac: (p) => [
    {
      d: 'M9.4 2.6v5.8c0 3.6-3.2 4-3.2 7.6 0 3.2 2.6 5.6 5.9 5.6 3.6 0 6.3-2.6 6.8-6.2.4-3-.6-5.3-2.5-6.7',
      tracer: p.vert,
      epaisseur: 2.2,
    },
  ],
}

export function Icone({
  nom,
  taille = 18,
}: {
  nom: NomIcone
  taille?: number
}) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {ICONES[nom](palette).map((c, i) => (
        <path
          key={i}
          d={c.d}
          fill={c.remplir ?? 'none'}
          stroke={c.tracer ?? 'none'}
          strokeWidth={c.epaisseur ?? 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
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
  | 'obliques'
  | 'quadriceps'
  | 'mollets'
  | 'trapezes'
  | 'dorsaux'
  | 'triceps'
  | 'lombaires'
  | 'fessiers'
  | 'ischios'

/**
 * La silhouette, en tracés plutôt qu'en rectangles.
 *
 * Un corps se reconnaît à ses proportions et à ses courbes : épaules plus
 * larges que la taille, bras qui s'écartent, cuisses qui se resserrent au
 * genou. Les zones musculaires se posent dessus et suivent la même logique.
 */
const CONTOUR = [
  /* tête, cou */
  'M32 3.4c3.6 0 6.4 2.9 6.4 6.6 0 2.6-1 4.6-2.6 5.8v2.4c4 .5 6.6 1.3 8.6 2.6',
  /* épaules et tronc, côté droit */
  'M44.4 20.8c3 1.9 4.4 5.2 4.8 9.4l1 11.4c.2 2-2.7 2.4-3.1.5l-1.5-7.4',
  'M45.6 34.7c.3 5.6.8 11 .8 15.4 0 4.2-.5 7.4-1.3 10.6l-1 9.6',
  /* jambe droite */
  'M44.1 70.3c.3 5.6-.2 11-.9 16.6l-1.2 10.4c-.3 3-.5 6-.4 9l.4 14.8c.1 3.4-.2 6.4-.7 9.6l-.5 3.6',
  'M40.8 134.3h-6.4l-.5-4.4c-.4-3.4-.3-6.6.1-10l1.2-11.4c.3-2.8.2-5.6-.3-8.4l-2-11.2',
] as const

type Forme = { d: string }

const ZONES_AVANT: Partial<Record<ZoneMuscle, Forme[]>> = {
  epaules: [
    { d: 'M18.6 21.6c-3.4 1.6-5.3 4.6-6 8.4 2.6-2.4 5.6-3.6 8.8-3.8Z' },
    { d: 'M45.4 21.6c3.4 1.6 5.3 4.6 6 8.4-2.6-2.4-5.6-3.6-8.8-3.8Z' },
  ],
  pectoraux: [
    { d: 'M31 22.4c-4.6.2-8 1-10.4 2.6-.6 3.4.2 6.2 2.4 8.4 3 .8 5.7.4 8-1.2Z' },
    { d: 'M33 22.4c4.6.2 8 1 10.4 2.6.6 3.4-.2 6.2-2.4 8.4-3 .8-5.7.4-8-1.2Z' },
  ],
  biceps: [
    { d: 'M13.6 30.4c-1.6 3.6-2.2 7.4-2 11.4 2.2.4 3.8-.4 4.8-2.4.6-3.2.2-6.2-1-9Z' },
    { d: 'M50.4 30.4c1.6 3.6 2.2 7.4 2 11.4-2.2.4-3.8-.4-4.8-2.4-.6-3.2-.2-6.2 1-9Z' },
  ],
  avantBras: [
    { d: 'M11.6 43.4c-.8 4.4-1 8.6-.6 12.6 2 .2 3.3-.6 4-2.4.4-3.6.2-7-1-10.2Z' },
    { d: 'M52.4 43.4c.8 4.4 1 8.6.6 12.6-2 .2-3.3-.6-4-2.4-.4-3.6-.2-7 1-10.2Z' },
  ],
  abdominaux: [
    { d: 'M26 35.6h12v22.6c0 1.6-1 2.6-2.6 2.6h-6.8c-1.6 0-2.6-1-2.6-2.6Z' },
  ],
  obliques: [
    { d: 'M20.6 36.4c-.6 6.4-.2 12.6 1.4 18.4 1.4-1 2.2-2.4 2.4-4.2Z' },
    { d: 'M43.4 36.4c.6 6.4.2 12.6-1.4 18.4-1.4-1-2.2-2.4-2.4-4.2Z' },
  ],
  quadriceps: [
    { d: 'M21.4 71.4c-.4 8.4.4 16.4 2.4 24 3.4-.4 5.4-2 6-4.8.4-6.8-.2-13.2-1.8-19.2Z' },
    { d: 'M42.6 71.4c.4 8.4-.4 16.4-2.4 24-3.4-.4-5.4-2-6-4.8-.4-6.8.2-13.2 1.8-19.2Z' },
  ],
  mollets: [
    { d: 'M23.4 105.4c-.8 6.4-.6 12.4.6 18 2.6-.4 4.2-1.8 4.6-4.2.4-4.8-.2-9.4-1.6-13.8Z' },
    { d: 'M40.6 105.4c.8 6.4.6 12.4-.6 18-2.6-.4-4.2-1.8-4.6-4.2-.4-4.8.2-9.4 1.6-13.8Z' },
  ],
}

const ZONES_ARRIERE: Partial<Record<ZoneMuscle, Forme[]>> = {
  trapezes: [
    { d: 'M32 19.6c-5 .4-9 1.8-12 4.2 1 4.4 2.6 8 4.8 10.8h14.4c2.2-2.8 3.8-6.4 4.8-10.8-3-2.4-7-3.8-12-4.2Z' },
  ],
  epaules: [
    { d: 'M18.6 21.6c-3.4 1.6-5.3 4.6-6 8.4 2.6-2.4 5.6-3.6 8.8-3.8Z' },
    { d: 'M45.4 21.6c3.4 1.6 5.3 4.6 6 8.4-2.6-2.4-5.6-3.6-8.8-3.8Z' },
  ],
  dorsaux: [
    { d: 'M22 35.6c-1 6.6-.4 12.8 2 18.6h16c2.4-5.8 3-12 2-18.6Z' },
  ],
  triceps: [
    { d: 'M13.6 30.4c-1.6 3.6-2.2 7.4-2 11.4 2.2.4 3.8-.4 4.8-2.4.6-3.2.2-6.2-1-9Z' },
    { d: 'M50.4 30.4c1.6 3.6 2.2 7.4 2 11.4-2.2.4-3.8-.4-4.8-2.4-.6-3.2-.2-6.2 1-9Z' },
  ],
  avantBras: [
    { d: 'M11.6 43.4c-.8 4.4-1 8.6-.6 12.6 2 .2 3.3-.6 4-2.4.4-3.6.2-7-1-10.2Z' },
    { d: 'M52.4 43.4c.8 4.4 1 8.6.6 12.6-2 .2-3.3-.6-4-2.4-.4-3.6-.2-7 1-10.2Z' },
  ],
  lombaires: [
    { d: 'M25 55.4h14v8.2c0 1.4-.9 2.2-2.3 2.2h-9.4c-1.4 0-2.3-.8-2.3-2.2Z' },
  ],
  fessiers: [
    { d: 'M32 66.6c-4.6 0-8 1.6-9.6 4.6-.6 3.6.6 6.4 3.4 8.2 3 .6 5.2-.6 6.2-3.4Z' },
    { d: 'M32 66.6c4.6 0 8 1.6 9.6 4.6.6 3.6-.6 6.4-3.4 8.2-3 .6-5.2-.6-6.2-3.4Z' },
  ],
  ischios: [
    { d: 'M22.4 81.4c-.4 6.4.4 12.6 2.4 18.6 3-.4 4.8-1.8 5.4-4.4.4-5.2-.2-10.2-1.8-14.8Z' },
    { d: 'M41.6 81.4c.4 6.4-.4 12.6-2.4 18.6-3-.4-4.8-1.8-5.4-4.4-.4-5.2.2-10.2 1.8-14.8Z' },
  ],
  mollets: [
    { d: 'M23.4 105.4c-.8 6.4-.6 12.4.6 18 2.6-.4 4.2-1.8 4.6-4.2.4-4.8-.2-9.4-1.6-13.8Z' },
    { d: 'M40.6 105.4c.8 6.4.6 12.4-.6 18-2.6-.4-4.2-1.8-4.6-4.2-.4-4.8.2-9.4 1.6-13.8Z' },
  ],
}

/**
 * Le corps nu, sur lequel les zones se posent.
 *
 * Il est composé de pièces distinctes plutôt que d'un tracé unique : c'est ce
 * qui rend les bras visibles et les proportions lisibles à petite taille. Les
 * bras s'écartent légèrement du tronc, sans quoi la silhouette se lit comme
 * une quille.
 */
const CORPS: React.ReactNode[] = [
  <ellipse key="tete" cx="32" cy="11" rx="7.2" ry="8.4" />,
  <rect key="cou" x="28.8" y="17.5" width="6.4" height="5.5" rx="2" />,
  <path
    key="tronc"
    d="M20.4 23.6c3.6-1.9 19.6-1.9 23.2 0 2.4 2.6 3 8.4 2.6 14.4l-1 14.6c-.2 2.6-1.4 3.8-3.6 3.8H22.4c-2.2 0-3.4-1.2-3.6-3.8l-1-14.6c-.4-6 .2-11.8 2.6-14.4Z"
  />,
  <path
    key="bassin"
    d="M21.8 56.4h20.4l-.8 11.4c-.2 2.6-1.6 3.9-4 3.9H26.6c-2.4 0-3.8-1.3-4-3.9Z"
  />,
  <rect key="brasG" x="10.6" y="24.4" width="7.4" height="23" rx="3.7" transform="rotate(-7 14.3 24.4)" />,
  <rect key="brasD" x="46" y="24.4" width="7.4" height="23" rx="3.7" transform="rotate(7 49.7 24.4)" />,
  <rect key="avantG" x="8.6" y="45.4" width="6.6" height="21" rx="3.3" transform="rotate(-4 11.9 45.4)" />,
  <rect key="avantD" x="48.8" y="45.4" width="6.6" height="21" rx="3.3" transform="rotate(4 52.1 45.4)" />,
  <ellipse key="mainG" cx="10.4" cy="68.6" rx="3.2" ry="4" />,
  <ellipse key="mainD" cx="53.6" cy="68.6" rx="3.2" ry="4" />,
  <path key="cuisseG" d="M22 70.6h9.2l-.6 20.6c-.1 4-1.6 6-4.4 6s-4.3-2-4.6-6Z" />,
  <path key="cuisseD" d="M32.8 70.6H42l-.6 20.6c-.3 4-1.8 6-4.6 6s-4.3-2-4.4-6Z" />,
  <path key="molletG" d="M22.8 96.4h7.6l-.5 22.4c-.1 3.6-1.4 5.4-3.7 5.4s-3.5-1.8-3.6-5.4Z" />,
  <path key="molletD" d="M33.6 96.4h7.6l-.4 22.4c-.1 3.6-1.3 5.4-3.6 5.4s-3.6-1.8-3.7-5.4Z" />,
  <path key="piedG" d="M22.4 123.4h7.6v5.4c0 1.6-1.1 2.6-3.4 2.6h-3.6c-1.6 0-2.4-.8-2.4-2.4Z" />,
  <path key="piedD" d="M34 123.4h7.6v5.6c0 1.6-.8 2.4-2.4 2.4h-3.6c-2.3 0-3.4-1-3.4-2.6Z" />,
]

/**
 * La carte du corps.
 *
 * Deux niveaux seulement — fortement et moyennement sollicité — parce qu'un
 * troisième ne se distinguerait plus à la taille où la carte est imprimée.
 * La face et le dos sont nommés : sans étiquette, deux silhouettes côte à
 * côte ne se distinguent pas.
 */
export function Silhouette({
  face,
  zones,
  hauteur = 78,
}: {
  face: 'avant' | 'arriere'
  zones: Partial<Record<ZoneMuscle, 'fort' | 'moyen'>>
  hauteur?: number
}) {
  const table = face === 'avant' ? ZONES_AVANT : ZONES_ARRIERE
  const large = hauteur * (64 / 140)

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg
        width={large}
        height={hauteur}
        viewBox="0 0 64 140"
        aria-label={face === 'avant' ? 'muscles vus de face' : 'muscles vus de dos'}
        role="img"
        style={{ display: 'block' }}
      >
        <g fill="#D6DADF">{CORPS}</g>
        {Object.entries(zones).map(([zone, niveau]) => {
          const formes = table[zone as ZoneMuscle]
          if (!formes) return null
          return formes.map((f, i) => (
            <path
              key={`${zone}-${i}`}
              d={f.d}
              fill={palette.rouge}
              fillOpacity={niveau === 'fort' ? 0.9 : 0.38}
            />
          ))
        })}
        {face === 'arriere' && (
          <path d="M32 25v30" stroke="#BFC5CC" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        )}
      </svg>
      <span
        style={{
          fontFamily: polices.fiche,
          fontSize: '0.46em',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: palette.texteFaible,
        }}
      >
        {face === 'avant' ? 'face' : 'dos'}
      </span>
    </span>
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
