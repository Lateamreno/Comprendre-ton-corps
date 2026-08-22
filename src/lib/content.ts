import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { parties, partieParNumero, type Partie } from '@content/parts'

/**
 * Lecture des doubles pages depuis le système de fichiers, au build.
 * Une DP = un fichier (CLAUDE.md §2, règle 4). Pas de base, pas de CMS.
 */

export const DOSSIER_DP = path.join(process.cwd(), 'content', 'dp')

export const STATUTS = ['brouillon', 'ecrit', 'relu', 'valide'] as const
export type Statut = (typeof STATUTS)[number]

export type DoublePage = {
  /** Identifiant éditorial, peut contenir bis/ter. */
  numero: string
  partie: number
  ordre: number
  /** Titre du livre imprimé, court et littéraire. */
  titre: string
  /** Question portée par la page publique et la balise <title>. Clé du SEO. */
  question: string
  slug: string
  statut: Statut
  /** Part visible en public, de 0.10 à 0.20. */
  extraitRatio: number
  resume: string
  sources: string[]
  picto: string[]
  /** Corps de la DP, en MDX. Jamais tronqué ici : la troncature a son module. */
  corps: string
  /** Nom du fichier, pour les messages d'erreur. */
  fichier: string
}

/** Une DP et sa partie, pour éviter de recroiser les deux à chaque appel. */
export type DoublePageSituee = DoublePage & { partieRef: Partie }

function erreur(fichier: string, message: string): never {
  throw new Error(`content/dp/${fichier} : ${message}`)
}

function champTexte(donnees: Record<string, unknown>, nom: string, fichier: string): string {
  const valeur = donnees[nom]
  if (typeof valeur !== 'string' || valeur.trim() === '') {
    erreur(fichier, `le champ « ${nom} » est obligatoire et doit être une chaîne non vide.`)
  }
  return valeur.trim()
}

function champNombre(donnees: Record<string, unknown>, nom: string, fichier: string): number {
  const valeur = donnees[nom]
  if (typeof valeur !== 'number' || Number.isNaN(valeur)) {
    erreur(fichier, `le champ « ${nom} » est obligatoire et doit être un nombre.`)
  }
  return valeur
}

function champListe(donnees: Record<string, unknown>, nom: string, fichier: string): string[] {
  const valeur = donnees[nom]
  if (valeur === undefined || valeur === null) return []
  if (!Array.isArray(valeur) || valeur.some((v) => typeof v !== 'string')) {
    erreur(fichier, `le champ « ${nom} » doit être une liste de chaînes.`)
  }
  return valeur as string[]
}

function analyser(fichier: string, brut: string): DoublePage {
  const { data, content } = matter(brut)
  const donnees = data as Record<string, unknown>

  const partie = champNombre(donnees, 'partie', fichier)
  if (!partieParNumero(partie)) {
    erreur(fichier, `partie « ${partie} » inconnue ; les parties vont de 0 à ${parties.length - 1}.`)
  }

  const statut = champTexte(donnees, 'statut', fichier)
  if (!(STATUTS as readonly string[]).includes(statut)) {
    erreur(fichier, `statut « ${statut} » inconnu ; attendu : ${STATUTS.join(', ')}.`)
  }

  const extraitRatio = champNombre(donnees, 'extrait_ratio', fichier)
  if (extraitRatio < 0.1 || extraitRatio > 0.2) {
    erreur(fichier, `extrait_ratio vaut ${extraitRatio} ; attendu entre 0.10 et 0.20.`)
  }

  // Aucune donnée nutritionnelle ne paraît sans source (CLAUDE.md §11).
  // Les parties de contenu citent donc au moins une référence ; la partie 0,
  // liminaire, ne porte pas de données.
  const sources = champListe(donnees, 'sources', fichier)
  if (partie > 0 && sources.length === 0) {
    erreur(fichier, 'au moins une source est obligatoire (CLAUDE.md §11).')
  }

  return {
    numero: champTexte(donnees, 'numero', fichier),
    partie,
    ordre: champNombre(donnees, 'ordre', fichier),
    titre: champTexte(donnees, 'titre', fichier),
    question: champTexte(donnees, 'question', fichier),
    slug: champTexte(donnees, 'slug', fichier),
    statut: statut as Statut,
    extraitRatio,
    resume: champTexte(donnees, 'resume', fichier),
    sources,
    picto: champListe(donnees, 'picto', fichier),
    corps: content.trim(),
    fichier,
  }
}

let cache: DoublePage[] | null = null

/** Toutes les DP du repo, quel que soit leur statut. Ordre : partie, puis ordre. */
export function toutesLesDP(): DoublePage[] {
  if (cache) return cache

  if (!fs.existsSync(DOSSIER_DP)) return (cache = [])

  const fichiers = fs.readdirSync(DOSSIER_DP).filter((f) => f.endsWith('.mdx'))

  const pages = fichiers.map((fichier) =>
    analyser(fichier, fs.readFileSync(path.join(DOSSIER_DP, fichier), 'utf8')),
  )

  // Unicité dans tout le livre, pas seulement dans la partie : un slug est
  // une question, et l'atelier adresse une DP par ce seul slug.
  const vus = new Map<string, string>()
  for (const page of pages) {
    const precedent = vus.get(page.slug)
    if (precedent) erreur(page.fichier, `le slug « ${page.slug} » est déjà utilisé par ${precedent}.`)
    vus.set(page.slug, page.fichier)
  }

  pages.sort((a, b) => a.partie - b.partie || a.ordre - b.ordre)
  return (cache = pages)
}

/**
 * Les DP publiables. Une DP au statut « brouillon » ne sort jamais
 * du repo (CLAUDE.md §11).
 */
export function dpPubliables(): DoublePageSituee[] {
  return toutesLesDP()
    .filter((dp) => dp.statut !== 'brouillon')
    .map(situer)
}

function situer(dp: DoublePage): DoublePageSituee {
  const partieRef = partieParNumero(dp.partie)
  if (!partieRef) erreur(dp.fichier, `partie « ${dp.partie} » inconnue.`)
  return { ...dp, partieRef }
}

export function dpParSlug(slugPartie: string, slug: string): DoublePageSituee | undefined {
  return dpPubliables().find((dp) => dp.partieRef.slug === slugPartie && dp.slug === slug)
}

/**
 * Toutes les DP, brouillons compris. Réservé à l'atelier : c'est là que se
 * suit la production, donc rien n'y est filtré.
 */
export function toutesLesDPSituees(): DoublePageSituee[] {
  return toutesLesDP().map(situer)
}

export function dpAtelierParSlug(slug: string): DoublePageSituee | undefined {
  return toutesLesDPSituees().find((dp) => dp.slug === slug)
}

export function cheminAtelier(dp: DoublePage): string {
  return `/atelier/${dp.slug}`
}

/** Voisines dans l'ordre de lecture, pour la navigation précédent / suivant. */
export function voisines(dp: DoublePageSituee): {
  precedente?: DoublePageSituee
  suivante?: DoublePageSituee
} {
  const liste = dpPubliables()
  const i = liste.findIndex((autre) => autre.fichier === dp.fichier)
  return { precedente: liste[i - 1], suivante: liste[i + 1] }
}

export function cheminDP(dp: DoublePageSituee): string {
  return `/${dp.partieRef.slug}/${dp.slug}`
}
