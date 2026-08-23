import fs from 'node:fs'
import path from 'node:path'
import { alimentCiqual, nombre, pourPortion, sourceCiqual, type Mesure } from '@/lib/ciqual'
import {
  APPORTS_REFERENCE,
  SOURCE_APPORTS,
  SOURCE_MASSE_VOLUMIQUE,
  grammesPour100Kcal,
  masseVolumique,
  millilitresPour100Kcal,
  partApportReference,
  partSucres,
} from '@/lib/nutrition'

/**
 * Une fiche aliment se déclare par un code Ciqual et une portion. Les valeurs
 * ne sont jamais écrites dans le fichier : elles sont calculées ici, au build,
 * à partir de la table (CLAUDE.md §11).
 */

const DOSSIER = path.join(process.cwd(), 'content', 'aliments')

type FicheDeclaree = {
  slug: string
  nom: string
  precision?: string
  image?: string
  ciqual: string
  portion: { grammes: number; libelle: string }
  indiceGlycemique?: { valeur: number; source: string }
}

/** Une grandeur prête à dessiner : valeur, part de la référence, texte. */
export type Grandeur = {
  valeur: number | null
  /** Part de l'apport de référence journalier, de 0 à 1, bornée. */
  part: number
  texte: string
  unite: string
}

export type Fiche = {
  slug: string
  nom: string
  precision: string
  image: string | null
  nomCiqual: string
  portion: { grammes: number; libelle: string }

  energie: Grandeur
  proteines: Grandeur
  lipides: Grandeur
  glucides: Grandeur
  sucres: Grandeur
  fibres: Grandeur

  /** Part des sucres dans les glucides, de 0 à 1, ou null. */
  partSucres: number | null
  /** Part de la journée couverte par la portion, de 0 à 1. */
  partJournee: number

  grammesPour100Kcal: number | null
  millilitresPour100Kcal: number | null

  indiceGlycemique: { valeur: number; source: string } | null

  sources: string[]
}

function borne(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function grandeur(
  m: Mesure,
  grammes: number,
  reference: number,
  unite: string,
  decimales = 1,
): Grandeur {
  const valeur = pourPortion(m, grammes)
  const part = partApportReference(m, grammes, reference)
  return {
    valeur,
    part: part === null ? 0 : borne(part, 0, 1),
    texte:
      valeur === null
        ? '—'
        : valeur.toFixed(decimales).replace('.', ','),
    unite,
  }
}

export function lireFiche(slug: string): Fiche {
  const chemin = path.join(DOSSIER, `${slug}.json`)
  if (!fs.existsSync(chemin)) throw new Error(`Fiche aliment introuvable : ${chemin}`)

  const d = JSON.parse(fs.readFileSync(chemin, 'utf8')) as FicheDeclaree
  const a = alimentCiqual(d.ciqual)
  const g = d.portion.grammes

  const kcalPortion = pourPortion(a.kcal, g)

  return {
    slug: d.slug,
    nom: d.nom,
    precision: d.precision ?? '',
    image: d.image ?? null,
    nomCiqual: a.nom,
    portion: d.portion,

    energie: {
      valeur: kcalPortion,
      part: kcalPortion === null ? 0 : borne(kcalPortion / APPORTS_REFERENCE.energieKcal, 0, 1),
      texte: kcalPortion === null ? '—' : String(Math.round(kcalPortion)),
      unite: 'kcal',
    },
    proteines: grandeur(a.proteines, g, APPORTS_REFERENCE.proteines, 'g'),
    lipides: grandeur(a.lipides, g, APPORTS_REFERENCE.lipides, 'g'),
    glucides: grandeur(a.glucides, g, APPORTS_REFERENCE.glucides, 'g'),
    sucres: grandeur(a.sucres, g, APPORTS_REFERENCE.sucres, 'g'),
    fibres: grandeur(a.fibres, g, APPORTS_REFERENCE.fibres, 'g'),

    partSucres: partSucres(a),
    partJournee:
      kcalPortion === null ? 0 : borne(kcalPortion / APPORTS_REFERENCE.energieKcal, 0, 1),

    grammesPour100Kcal: grammesPour100Kcal(a),
    millilitresPour100Kcal: millilitresPour100Kcal(a),

    indiceGlycemique: d.indiceGlycemique ?? null,

    sources: [
      sourceCiqual(),
      SOURCE_APPORTS,
      ...(masseVolumique(a) !== null ? [SOURCE_MASSE_VOLUMIQUE] : []),
      ...(d.indiceGlycemique ? [d.indiceGlycemique.source] : []),
    ],
  }
}

export function slugsAliments(): string[] {
  if (!fs.existsSync(DOSSIER)) return []
  return fs
    .readdirSync(DOSSIER)
    .filter((f) => f.endsWith('.json') && !f.startsWith('ciqual-'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
}

export { nombre }
