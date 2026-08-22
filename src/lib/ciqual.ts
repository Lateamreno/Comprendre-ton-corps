import fs from 'node:fs'
import path from 'node:path'

/**
 * Accès à la table Ciqual.
 *
 * Toute valeur de composition du livre vient d'ici, et de nulle part
 * ailleurs : aucun chiffre nutritionnel n'est saisi à la main (CLAUDE.md §11).
 *
 * Le fichier est lu avec `fs` plutôt qu'importé, pour qu'il reste sur le
 * serveur — 1,3 Mo n'ont rien à faire dans le bundle du navigateur.
 */

const FICHIER = path.join(process.cwd(), 'content', 'aliments', 'ciqual-2025.json')

/**
 * Une mesure Ciqual. `mention` conserve l'incertitude de la table plutôt que
 * de la lisser : « traces » n'est pas zéro, et une valeur absente n'est pas
 * zéro non plus.
 */
export type Mesure = { valeur: number; mention?: 'traces' | 'inférieur à' } | null

export type AlimentCiqual = {
  nom: string
  groupe: string
  sousGroupe: string
  kcal: Mesure
  proteines: Mesure
  lipides: Mesure
  agSatures: Mesure
  glucides: Mesure
  sucres: Mesure
  fibres: Mesure
  sel: Mesure
  eau: Mesure
}

type Table = {
  source: string
  doi: string
  licence: string
  url: string
  aliments: Record<string, AlimentCiqual>
}

let cache: Table | null = null

function table(): Table {
  if (!cache) cache = JSON.parse(fs.readFileSync(FICHIER, 'utf8')) as Table
  return cache
}

/** La référence à citer sous toute fiche. */
export function sourceCiqual(): string {
  return table().source
}

export function alimentCiqual(code: string): AlimentCiqual {
  const trouve = table().aliments[code]
  if (!trouve) {
    throw new Error(
      `Code Ciqual « ${code} » introuvable dans ${path.basename(FICHIER)}. ` +
        `Vérifier le code sur https://ciqual.anses.fr/`,
    )
  }
  return trouve
}

/** Valeur brute d'une mesure, ou null si la table ne la donne pas. */
export function nombre(m: Mesure): number | null {
  return m ? m.valeur : null
}

/**
 * Ramène une mesure donnée pour 100 g à une portion réelle.
 * Les fiches raisonnent en portions — 10 g d'huile, 20 g de chocolat — parce
 * qu'un seuil appliqué à 100 g d'huile ne décrit aucune consommation réelle.
 */
export function pourPortion(m: Mesure, grammes: number): number | null {
  return m ? (m.valeur * grammes) / 100 : null
}

/** Comment afficher une mesure, incertitude comprise. */
export function texteMesure(m: Mesure, decimales = 1): string {
  if (!m) return '—'
  const n = m.valeur.toFixed(decimales).replace('.', ',')
  if (m.mention === 'traces') return 'traces'
  if (m.mention === 'inférieur à') return `< ${n}`
  return n
}
