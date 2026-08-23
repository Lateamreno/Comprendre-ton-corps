/**
 * Les 7 parties du livre, dans l'ordre de lecture.
 *
 * Chaque partie est une question que le lecteur se pose déjà. L'ordre suit
 * l'expérience avant la théorie : la faim qu'on ressent, le stockage qu'on
 * subit, l'assiette qu'on remplit, la dépense qu'on surestime, l'échec qu'on
 * a connu, et ce qui tient. Aucune page n'est rangée par organe : le corps
 * s'explique à travers les questions, jamais l'inverse.
 *
 * `slug` porte le premier segment d'URL d'une double page : /[partie]/[slug].
 */

export type Partie = {
  numero: number
  titre: string
  slug: string
  /** Une phrase, descriptive, pour le sommaire et les métadonnées. */
  resume: string
  /** Ce que le lecteur sait faire en sortant de la partie. */
  acquis: string
}

export const parties: Partie[] = [
  {
    numero: 0,
    titre: 'Avant-propos',
    slug: 'avant-propos',
    resume: "Ce que ce livre explique, et ce qu'il laisse au lecteur.",
    acquis: "Savoir ce que le livre fait et ce qu'il ne fait pas.",
  },
  {
    numero: 1,
    titre: 'Pourquoi on a faim',
    slug: 'pourquoi-on-a-faim',
    resume:
      "La faim à heure fixe, l'envie sans besoin, le signal d'arrêt qui arrive trop tard — et ce que le sommeil et le stress y changent.",
    acquis: "Distinguer le besoin, l'envie et l'habitude dans ses propres signaux.",
  },
  {
    numero: 2,
    titre: 'Pourquoi on grossit',
    slug: 'pourquoi-on-grossit',
    resume:
      "Le trajet d'une bouchée, l'insuline qui arbitre, les réserves qui s'ouvrent et se ferment — et pourquoi toutes les calories ne se valent pas.",
    acquis: "Comprendre par quelles routes un surplus devient du gras.",
  },
  {
    numero: 3,
    titre: "Ce qu'il y a vraiment dans l'assiette",
    slug: 'dans-l-assiette',
    resume:
      "Macronutriments, fibres, sucres cachés, étiquettes et allégations — et les tableaux qui comparent les aliments à portion réelle.",
    acquis: "Lire un aliment autrement que par son nombre de calories.",
  },
  {
    numero: 4,
    titre: 'Ce que le corps brûle',
    slug: 'ce-que-le-corps-brule',
    resume:
      "Le métabolisme et ses quatre postes, le muscle qui dépense en dormant, ce qu'une séance brûle vraiment — et la pratique qui tient.",
    acquis: "Savoir où part l'énergie, et laquelle de ces parts se pilote.",
  },
  {
    numero: 5,
    titre: 'Pourquoi les régimes échouent',
    slug: 'pourquoi-les-regimes-echouent',
    resume:
      "L'adaptation, le set-point, l'effet yoyo, la volonté qui s'épuise — les mécanismes de l'échec, avant de parler de solution.",
    acquis: "Reconnaître ce qui condamne un plan avant même de commencer.",
  },
  {
    numero: 6,
    titre: 'Ce qui marche vraiment',
    slug: 'ce-qui-marche-vraiment',
    resume:
      "Le déficit tenable, l'assiette sans balance, les repas, les courses, le restaurant, le sommeil et le stress — ce qui reste quand on arrête de lutter.",
    acquis: "Construire des changements qui ne demandent plus de volonté.",
  },
]

export function partieParNumero(numero: number): Partie | undefined {
  return parties.find((p) => p.numero === numero)
}

export function partieParSlug(slug: string): Partie | undefined {
  return parties.find((p) => p.slug === slug)
}
