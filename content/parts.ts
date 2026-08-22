/**
 * Les 7 parties du livre, dans l'ordre.
 *
 * `slug` porte le premier segment d'URL d'une double page :
 * /[partie]/[slug]. Les titres sont provisoires et restent à arrêter avec
 * l'auteur ; le numéro et l'ordre, eux, sont structurels.
 */

export type Partie = {
  numero: number
  titre: string
  slug: string
  /** Une phrase, descriptive, pour le sommaire et les métadonnées. */
  resume: string
}

export const parties: Partie[] = [
  {
    numero: 0,
    titre: 'Avant-propos',
    slug: 'avant-propos',
    resume: "Ce que ce livre explique, et ce qu'il laisse au lecteur.",
  },
  {
    numero: 1,
    titre: "L'énergie",
    slug: 'energie',
    resume: "Ce que mesure une calorie, et ce qu'elle ne mesure pas.",
  },
  {
    numero: 2,
    titre: 'La digestion',
    slug: 'digestion',
    resume: "Le trajet d'un aliment, de la bouche à la circulation sanguine.",
  },
  {
    numero: 3,
    titre: 'Le stockage',
    slug: 'stockage',
    resume: 'Où va ce qui entre, et sous quelles conditions il en ressort.',
  },
  {
    numero: 4,
    titre: 'La faim',
    slug: 'faim',
    resume: 'Les signaux qui déclenchent et arrêtent la prise alimentaire.',
  },
  {
    numero: 5,
    titre: 'Le métabolisme',
    slug: 'metabolisme',
    resume: "La dépense d'un corps au repos et ses variations.",
  },
  {
    numero: 6,
    titre: 'Les aliments',
    slug: 'aliments',
    resume: 'Des fiches de lecture rapide, construites sur la même grille.',
  },
]

export function partieParNumero(numero: number): Partie | undefined {
  return parties.find((p) => p.numero === numero)
}

export function partieParSlug(slug: string): Partie | undefined {
  return parties.find((p) => p.slug === slug)
}
