/**
 * Constantes du site. Le domaine sera fourni avant le M3 : il ne doit être
 * écrit qu'ici, jamais en dur dans une page (CLAUDE.md §9).
 */

export const site = {
  titre: 'Comprendre ton corps avant de le changer',
  /** Provisoire tant que le domaine n'est pas arrêté. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  langue: 'fr',
} as const

/**
 * Identité d'auteur : obligatoire sur chaque page, le sujet relevant du
 * domaine santé. L'emplacement du co-auteur médecin existe dès maintenant,
 * même vide.
 */
export const auteur = {
  nom: 'Marc-Antoine Voci',
  chemin: '/auteur',
} as const

export const coAuteurMedecin: { nom: string; titre: string; lien: string } | null = null
