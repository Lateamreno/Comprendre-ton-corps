import { identites, palette, type NomGrandeur } from '@/lib/tokens'

/**
 * Les jauges du livre. Toutes suivent la même grammaire : une piste en
 * --piste, une part remplie à proportion de la valeur, dans la couleur
 * d'identité de la grandeur (CLAUDE.md §8).
 *
 * Aucune ne décide de sa couleur : elle vient de `identites`.
 */

function borne(v: number) {
  return Math.min(1, Math.max(0, v))
}

/** Barre posée sous un pictogramme. */
export function Barre({
  grandeur,
  part,
  largeur = 150,
}: {
  grandeur: NomGrandeur
  /** De 0 à 1. */
  part: number
  largeur?: number
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: largeur,
        height: 17,
        borderRadius: 9,
        background: palette.piste,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${borne(part) * 100}%`,
          height: '100%',
          borderRadius: 9,
          background: identites[grandeur].couleur,
        }}
      />
    </div>
  )
}

/** Anneau de pourcentage. Son remplissage est lui-même la donnée. */
export function Anneau({
  part,
  grandeur = 'journee',
  taille = 108,
  epaisseur = 11,
}: {
  part: number
  grandeur?: NomGrandeur
  taille?: number
  epaisseur?: number
}) {
  const r = (taille - epaisseur) / 2
  const circonference = 2 * Math.PI * r
  const rempli = circonference * borne(part)

  return (
    <svg width={taille} height={taille} viewBox={`0 0 ${taille} ${taille}`} aria-hidden="true">
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={r}
        fill="none"
        stroke={palette.piste}
        strokeWidth={epaisseur}
      />
      <circle
        cx={taille / 2}
        cy={taille / 2}
        r={r}
        fill="none"
        stroke={identites[grandeur].couleur}
        strokeWidth={epaisseur}
        strokeDasharray={`${rempli} ${circonference - rempli}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
      />
    </svg>
  )
}

/** Courbe glycémique. Le pic monte et avance avec l'indice. */
export function Courbe({
  indice,
  largeur = 150,
  hauteur = 96,
}: {
  indice: number
  largeur?: number
  hauteur?: number
}) {
  const couleur = identites.glycemie.couleur
  const base = hauteur - 14
  const pic = base - borne(indice / 110) * (base - 16)

  return (
    <svg width={largeur} height={hauteur} viewBox={`0 0 ${largeur} ${hauteur}`} aria-hidden="true">
      <path
        d={`M14 16 h${largeur - 22}`}
        stroke={palette.violetClair}
        strokeWidth="2"
        strokeDasharray="7 7"
        opacity="0.65"
      />
      <path
        d={`M14 ${base} C ${largeur * 0.3} ${base} ${largeur * 0.32} ${pic} ${largeur * 0.48} ${pic} C ${largeur * 0.68} ${pic} ${largeur * 0.72} ${base - 3} ${largeur - 8} ${base - 1} L ${largeur - 8} ${base} Z`}
        fill={couleur}
        opacity="0.16"
      />
      <path
        d={`M14 ${base} C ${largeur * 0.3} ${base} ${largeur * 0.32} ${pic} ${largeur * 0.48} ${pic} C ${largeur * 0.68} ${pic} ${largeur * 0.72} ${base - 3} ${largeur - 8} ${base - 1}`}
        fill="none"
        stroke={couleur}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d={`M14 8 v${base - 8} h${largeur - 22}`}
        fill="none"
        stroke={palette.texteFaible}
        strokeWidth="2"
      />
    </svg>
  )
}
