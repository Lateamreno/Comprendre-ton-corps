/**
 * Source de vérité de la charte.
 *
 * Aucune couleur, aucun seuil, aucune échelle typographique ne doit être
 * réécrit dans un composant. Un composant qui a besoin d'une couleur appelle
 * une fonction de ce fichier ; il ne choisit jamais lui-même.
 *
 * Voir CLAUDE.md §8.
 */

/* ------------------------------------------------------------------ */
/* Palette                                                            */
/* ------------------------------------------------------------------ */

export const palette = {
  fond: '#FAFAF7',
  fondCarte: '#F4F3EF',
  texte: '#1A1A1A',
  texteFaible: '#6E6A66',

  vert: '#1E8A63',
  vertClair: '#58B894',

  orange: '#E8823C',
  orangeFonce: '#D2691E',

  rouge: '#D64545',
  grisVide: '#E2E0DA',
} as const

export type NomCouleur = keyof typeof palette

/* ------------------------------------------------------------------ */
/* L'échelle sémantique                                               */
/* ------------------------------------------------------------------ */

/**
 * Une couleur = une position sur une échelle, toujours la même, partout.
 * C'est la seule justification d'un changement de couleur dans le livre.
 */
export type Niveau = 'favorable' | 'intermediaire' | 'eleve' | 'absent'

const COULEUR_DU_NIVEAU: Record<Niveau, string> = {
  favorable: palette.vert,
  intermediaire: palette.orange,
  eleve: palette.rouge,
  absent: palette.grisVide,
}

/** Traduit une position sur l'échelle en couleur. Point de passage unique. */
export function couleurDuNiveau(niveau: Niveau): string {
  return COULEUR_DU_NIVEAU[niveau]
}

/** Libellé court associé à un niveau, pour ne jamais laisser la couleur seule. */
const LIBELLE_DU_NIVEAU: Record<Niveau, string> = {
  favorable: 'bas',
  intermediaire: 'moyen',
  eleve: 'élevé',
  absent: 'non renseigné',
}

export function libelleDuNiveau(niveau: Niveau): string {
  return LIBELLE_DU_NIVEAU[niveau]
}

/* ------------------------------------------------------------------ */
/* Seuils                                                             */
/* ------------------------------------------------------------------ */

/**
 * Un seuil décrit une grandeur mesurable et les deux bornes qui la découpent
 * en trois positions de l'échelle. `source` est obligatoire : aucune donnée
 * nutritionnelle n'entre dans le livre sans référence (CLAUDE.md §11).
 */
export type Seuil = {
  /** Grandeur mesurée, pour les légendes. */
  grandeur: string
  /** Unité affichée à côté de la valeur. */
  unite: string
  /** Valeur strictement en dessous ou égale : favorable. */
  borneFavorable: number
  /** Valeur strictement au-dessus : élevé. Entre les deux : intermédiaire. */
  borneElevee: number
  /** Valeur de référence pour un remplissage proportionnel (100 % du dessin). */
  plein: number
  source: string
}

/**
 * Les seuils « feux tricolores » reprennent le référentiel d'étiquetage
 * nutritionnel simplifié de la Food Standards Agency britannique, exprimé
 * pour 100 g d'aliment solide. C'est un référentiel public, stable et
 * vérifiable, ce qui permet de juger la pomme et le croissant par la
 * même règle sur 103 doubles pages.
 */
export const seuils = {
  indiceGlycemique: {
    grandeur: 'Indice glycémique',
    unite: '',
    borneFavorable: 55,
    borneElevee: 70,
    plein: 110,
    source: 'International Tables of Glycemic Index and Glycemic Load Values, 2021',
  },
  sucres: {
    grandeur: 'Sucres',
    unite: 'g/100 g',
    borneFavorable: 5,
    borneElevee: 22.5,
    plein: 60,
    source: 'FSA, étiquetage nutritionnel simplifié (solides)',
  },
  /** Part des sucres dans les glucides totaux, de 0 à 1. */
  ratioSucres: {
    grandeur: 'Part des sucres dans les glucides',
    unite: '%',
    borneFavorable: 0.3,
    borneElevee: 0.6,
    plein: 1,
    source: 'Ciqual ANSES 2024, calcul sucres / glucides totaux',
  },
  lipides: {
    grandeur: 'Lipides',
    unite: 'g/100 g',
    borneFavorable: 3,
    borneElevee: 17.5,
    plein: 50,
    source: 'FSA, étiquetage nutritionnel simplifié (solides)',
  },
  acidesGrasSatures: {
    grandeur: 'Acides gras saturés',
    unite: 'g/100 g',
    borneFavorable: 1.5,
    borneElevee: 5,
    plein: 20,
    source: 'FSA, étiquetage nutritionnel simplifié (solides)',
  },
  sel: {
    grandeur: 'Sel',
    unite: 'g/100 g',
    borneFavorable: 0.3,
    borneElevee: 1.5,
    plein: 3,
    source: 'FSA, étiquetage nutritionnel simplifié (solides)',
  },
  densiteEnergetique: {
    grandeur: 'Densité énergétique',
    unite: 'kcal/100 g',
    borneFavorable: 150,
    borneElevee: 400,
    plein: 900,
    source: 'Ciqual ANSES 2024',
  },
} as const satisfies Record<string, Seuil>

export type NomSeuil = keyof typeof seuils

/* ------------------------------------------------------------------ */
/* Lecture des seuils                                                 */
/* ------------------------------------------------------------------ */

/**
 * Situe une valeur sur l'échelle, pour une grandeur dont la valeur basse
 * est favorable — c'est le cas de tous les seuils ci-dessus.
 */
export function niveauPourSeuil(nom: NomSeuil, valeur: number | null | undefined): Niveau {
  if (valeur === null || valeur === undefined || Number.isNaN(valeur)) return 'absent'
  const { borneFavorable, borneElevee } = seuils[nom]
  if (valeur <= borneFavorable) return 'favorable'
  if (valeur > borneElevee) return 'eleve'
  return 'intermediaire'
}

/** Couleur d'une valeur pour une grandeur donnée. */
export function couleurPourSeuil(nom: NomSeuil, valeur: number | null | undefined): string {
  return couleurDuNiveau(niveauPourSeuil(nom, valeur))
}

/**
 * Part remplie du dessin, de 0 à 1. La couleur situe, le remplissage porte
 * l'information : les deux sont toujours calculés ensemble.
 */
export function remplissagePourSeuil(nom: NomSeuil, valeur: number | null | undefined): number {
  if (valeur === null || valeur === undefined || Number.isNaN(valeur)) return 0
  return borne(valeur / seuils[nom].plein, 0, 1)
}

/** Tout ce dont un picto ou une jauge a besoin, en un appel. */
export type Lecture = {
  niveau: Niveau
  couleur: string
  /** Couleur de la part non remplie. */
  couleurVide: string
  remplissage: number
  libelle: string
  unite: string
  source: string
}

export function lire(nom: NomSeuil, valeur: number | null | undefined): Lecture {
  const niveau = niveauPourSeuil(nom, valeur)
  return {
    niveau,
    couleur: couleurDuNiveau(niveau),
    couleurVide: palette.grisVide,
    remplissage: remplissagePourSeuil(nom, valeur),
    libelle: libelleDuNiveau(niveau),
    unite: seuils[nom].unite,
    source: seuils[nom].source,
  }
}

/* Raccourcis nommés, pour les grandeurs les plus fréquentes du livre. */

export const couleurIG = (valeur: number | null | undefined) =>
  couleurPourSeuil('indiceGlycemique', valeur)

export const couleurRatioSucres = (sucres: number | null | undefined, glucides: number | null | undefined) =>
  couleurPourSeuil('ratioSucres', ratio(sucres, glucides))

export const couleurDensiteEnergetique = (valeur: number | null | undefined) =>
  couleurPourSeuil('densiteEnergetique', valeur)

/** Part d'un total, ou null si le total est absent ou nul. */
export function ratio(part: number | null | undefined, total: number | null | undefined): number | null {
  if (part === null || part === undefined) return null
  if (total === null || total === undefined || total === 0) return null
  return part / total
}

export function borne(valeur: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valeur))
}

/* ------------------------------------------------------------------ */
/* Typographie                                                        */
/* ------------------------------------------------------------------ */

export const polices = {
  titre: "'Fraunces', 'Iowan Old Style', Georgia, 'Times New Roman', serif",
  texte: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  chiffre: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
} as const

/** Échelle typographique, en rem. Une taille ne s'invente pas dans un composant. */
export const tailles = {
  mention: 0.75,
  legende: 0.8125,
  petit: 0.9375,
  corps: 1.0625,
  intertitre: 1.375,
  titre: 2,
  titreLarge: 2.75,
  titreDouble: 4,
} as const

export const interlignes = {
  serre: 1.15,
  normal: 1.6,
  aere: 1.75,
} as const

/* ------------------------------------------------------------------ */
/* Formes                                                             */
/* ------------------------------------------------------------------ */

/** Angles nets ou très légèrement adoucis, 2 px au maximum (CLAUDE.md §8). */
export const rayon = '2px'

/** Filets fins plutôt que cadres pleins. */
export const filet = `1px solid ${palette.grisVide}`

/** Format réel d'une double page ouverte, en millimètres. */
export const doublePage = { largeurMm: 400, hauteurMm: 270 } as const

/* ------------------------------------------------------------------ */
/* Export vers CSS                                                    */
/* ------------------------------------------------------------------ */

/**
 * Les variables CSS sont produites à partir des valeurs ci-dessus et
 * injectées une seule fois dans le document. Les feuilles de style ne
 * contiennent donc jamais de valeur en dur, seulement des références.
 */
export const variablesCss: Record<string, string> = {
  '--fond': palette.fond,
  '--fond-carte': palette.fondCarte,
  '--texte': palette.texte,
  '--texte-faible': palette.texteFaible,
  '--vert': palette.vert,
  '--vert-clair': palette.vertClair,
  '--orange': palette.orange,
  '--orange-fonce': palette.orangeFonce,
  '--rouge': palette.rouge,
  '--gris-vide': palette.grisVide,

  '--police-titre': polices.titre,
  '--police-texte': polices.texte,
  '--police-chiffre': polices.chiffre,

  '--taille-mention': `${tailles.mention}rem`,
  '--taille-legende': `${tailles.legende}rem`,
  '--taille-petit': `${tailles.petit}rem`,
  '--taille-corps': `${tailles.corps}rem`,
  '--taille-intertitre': `${tailles.intertitre}rem`,
  '--taille-titre': `${tailles.titre}rem`,
  '--taille-titre-large': `${tailles.titreLarge}rem`,
  '--taille-titre-double': `${tailles.titreDouble}rem`,

  '--interligne-serre': `${interlignes.serre}`,
  '--interligne-normal': `${interlignes.normal}`,
  '--interligne-aere': `${interlignes.aere}`,

  '--rayon': rayon,
  '--filet': filet,
}

/** Bloc `:root` sérialisé, à injecter dans le layout. */
export function racineCss(): string {
  const corps = Object.entries(variablesCss)
    .map(([nom, valeur]) => `${nom}:${valeur};`)
    .join('')
  return `:root{${corps}}`
}
