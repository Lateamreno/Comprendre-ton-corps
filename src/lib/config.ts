/**
 * Constantes du site. Le domaine sera fourni avant le M3 : il ne doit être
 * écrit qu'ici, jamais en dur dans une page (CLAUDE.md §9).
 */

export const site = {
  titre: 'Comprendre ton corps avant de le changer',
  /**
   * Le domaine, écrit ici et nulle part ailleurs. C'est lui qui fixe
   * `metadataBase`, donc les URL canoniques de toutes les pages.
   *
   * L'hôte retenu est `www` : le domaine nu redirige vers lui, et une
   * canonique doit désigner l'adresse réellement servie.
   *
   * NEXT_PUBLIC_SITE_URL permet de pointer ailleurs en local ou sur une
   * preview, sans jamais toucher au code.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.comprendretoncorps.fr',
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
