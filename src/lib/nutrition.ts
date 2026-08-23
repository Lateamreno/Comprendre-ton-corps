import {
  alimentCiqual,
  nombre,
  pourPortion,
  type AlimentCiqual,
  type Mesure,
} from '@/lib/ciqual'

/**
 * Les calculs nutritionnels du livre. Aucune valeur n'est saisie ici : tout
 * dérive de Ciqual, ou d'un modèle publié appliqué à Ciqual.
 */

/**
 * Apports de référence journaliers, Règlement (UE) n° 1169/2011, annexe XIII.
 * Ce sont les valeurs légales de l'étiquetage européen.
 * Les fibres n'y figurent pas : la référence retenue est celle de l'ANSES.
 */
export const APPORTS_REFERENCE = {
  energieKcal: 2000,
  lipides: 70,
  agSatures: 20,
  glucides: 260,
  sucres: 90,
  proteines: 50,
  sel: 6,
  /** ANSES, actualisation des repères du PNNS. */
  fibres: 30,
} as const

export const SOURCE_APPORTS =
  'Règlement (UE) n° 1169/2011, annexe XIII ; fibres : ANSES, repères PNNS'

/**
 * Masses volumiques des constituants à 20 °C, en g/ml.
 * Choi Y, Okos MR, Effects of temperature and composition on the thermal
 * properties of foods, Food Engineering and Process Applications, 1986.
 */
const MASSE_VOLUMIQUE_CONSTITUANTS = {
  eau: 0.9957,
  proteines: 1.3195,
  lipides: 0.9172,
  glucides: 1.5929,
  fibres: 1.3042,
  cendres: 2.4182,
} as const

export const SOURCE_MASSE_VOLUMIQUE = 'Choi & Okos, 1986, appliqué à la composition Ciqual'

/** Part de la composition qu'il faut connaître pour que le calcul ait un sens. */
const COMPOSITION_MINIMALE = 50

/**
 * Masse volumique d'un aliment, déduite de sa composition.
 *
 * C'est la masse volumique de la *matière* : elle ignore l'air emprisonné
 * dans une mie ou une mousse. C'est précisément ce qu'on veut ici — l'air
 * disparaît à la mastication, et c'est le volume dans l'estomac qui nous
 * intéresse, pas celui dans le bol.
 *
 * Renvoie null quand Ciqual ne renseigne pas assez de constituants.
 */
export function masseVolumique(a: AlimentCiqual): number | null {
  const parts = {
    eau: nombre(a.eau) ?? 0,
    proteines: nombre(a.proteines) ?? 0,
    lipides: nombre(a.lipides) ?? 0,
    glucides: nombre(a.glucides) ?? 0,
    fibres: nombre(a.fibres) ?? 0,
  }
  const connu = Object.values(parts).reduce((s, v) => s + v, 0)
  if (connu < COMPOSITION_MINIMALE) return null

  const fractions = { ...parts, cendres: Math.max(0, 100 - connu) }
  let somme = 0
  for (const [nom, masse] of Object.entries(fractions)) {
    somme += masse / 100 / MASSE_VOLUMIQUE_CONSTITUANTS[nom as keyof typeof MASSE_VOLUMIQUE_CONSTITUANTS]
  }
  return 1 / somme
}

/** Grammes d'aliment qui apportent 100 kcal. */
export function grammesPour100Kcal(a: AlimentCiqual): number | null {
  const kcal = nombre(a.kcal)
  if (!kcal) return null
  return (100 * 100) / kcal
}

/** Le même repère en volume, quand la masse volumique est calculable. */
export function millilitresPour100Kcal(a: AlimentCiqual): number | null {
  const g = grammesPour100Kcal(a)
  const rho = masseVolumique(a)
  return g !== null && rho !== null ? g / rho : null
}

/** Part des sucres dans les glucides totaux, ou null si les glucides sont négligeables. */
export function partSucres(a: AlimentCiqual): number | null {
  const glucides = nombre(a.glucides)
  const sucres = nombre(a.sucres)
  if (glucides === null || sucres === null || glucides < 1) return null
  return sucres / glucides
}

/** Part de l'apport de référence journalier couverte par une portion. */
export function partApportReference(
  m: Mesure,
  grammes: number,
  reference: number,
): number | null {
  const v = pourPortion(m, grammes)
  return v === null ? null : v / reference
}

export { alimentCiqual, nombre, pourPortion }
