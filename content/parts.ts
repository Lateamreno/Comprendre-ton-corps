/**
 * Les 9 parties du livre, dans l'ordre de lecture.
 *
 * Chaque partie est une question que le lecteur se pose déjà, et le sommaire
 * s'adresse aux deux publics : celui qui veut perdre et celui qui n'arrive
 * pas à prendre. Les sous-titres portent ce retournement. Les parties 5 et 6
 * sont les deux échecs en miroir — l'assiette, l'effort — et la 7 décrit les grands
 * moyens — chirurgie, médicaments, dopage — sans les juger, et la 8 est la
 * réponse durable.
 *
 * `slug` porte le premier segment d'URL d'une double page : /[partie]/[slug].
 */

export type Partie = {
  numero: number
  titre: string
  slug: string
  /** Une phrase, descriptive, pour le sommaire et les métadonnées. */
  resume: string
  /** Sous-titre éditorial, affiché sous le titre de partie quand il existe. */
  sousTitre?: string
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
    sousTitre: 'Et pourquoi elle vient parfois à manquer',
    resume:
      "La faim à heure fixe, l'envie sans besoin, le signal d'arrêt qui arrive trop tard — et l'appétit qui s'éteint chez certains.",
    acquis: "Distinguer le besoin, l'envie et l'habitude dans ses propres signaux.",
  },
  {
    numero: 2,
    titre: 'Pourquoi on grossit',
    sousTitre: 'Et pourquoi certains ne grossissent jamais',
    slug: 'pourquoi-on-grossit',
    resume:
      "Le trajet d'une bouchée, l'insuline qui arbitre, les réserves qui s'ouvrent et se ferment — et le mangeur qui ne prend pas un gramme.",
    acquis: "Comprendre par quelles routes un surplus devient du gras, ou pas.",
  },
  {
    numero: 3,
    titre: "Qu'est-ce qu'on devrait manger",
    slug: 'ce-qu-on-devrait-manger',
    sousTitre: "Et ce qu'on devrait éviter",
    resume:
      "Macronutriments, fibres, sucres cachés, étiquettes et allégations — et les tableaux qui comparent les aliments à portion réelle.",
    acquis: "Lire un aliment autrement que par son nombre de calories.",
  },
  {
    numero: 4,
    titre: 'Comment le corps brûle des graisses et prend du muscle',
    slug: 'comment-le-corps-brule-et-se-muscle',
    resume:
      "Le métabolisme et ses quatre postes, le muscle qui dépense en dormant, ce qu'une séance brûle vraiment — et comment un muscle se construit.",
    acquis: "Savoir où part l'énergie, et ce que l'entraînement peut réellement ajouter.",
  },
  {
    numero: 5,
    titre: 'Pourquoi les régimes échouent',
    slug: 'pourquoi-les-regimes-echouent',
    resume:
      "L'adaptation, le set-point, l'effet yoyo, la volonté qui s'épuise — les mécanismes de l'échec côté assiette.",
    acquis: "Reconnaître ce qui condamne un plan avant même de commencer.",
  },
  {
    numero: 6,
    titre: 'Pourquoi je ne vois pas de résultats',
    slug: 'pourquoi-je-ne-vois-pas-de-resultats',
    sousTitre: 'Malgré le sport',
    resume:
      "Courir sans maigrir, soulever sans grossir : les mécanismes qui séparent l'effort du résultat.",
    acquis: "Diagnostiquer pourquoi l'effort ne produit pas le résultat attendu.",
  },
  {
    numero: 7,
    titre: 'Est-ce que ça marche vraiment',
    slug: 'est-ce-que-ca-marche-vraiment',
    sousTitre: 'Opérations, médicaments, shakers, créatine, dopage',
    resume:
      "Du shaker au bypass, en escalade : ce que chaque aide fait vraiment, ce qu'elle coûte, et ce qu'on sait de l'après.",
    acquis: "Situer chaque aide : ce qu'elle change, et ce qu'elle ne change pas.",
  },
  {
    numero: 8,
    titre: 'Comment changer sans lutter',
    slug: 'comment-changer-sans-lutter',
    sousTitre: 'Du savoir au pouvoir',
    resume:
      "Le déficit tenable ou le surplus utile, l'assiette sans balance, les repas, les courses, le restaurant — ce qui reste quand on arrête de lutter.",
    acquis: "Construire des changements qui ne demandent plus de volonté.",
  },
]

export function partieParNumero(numero: number): Partie | undefined {
  return parties.find((p) => p.numero === numero)
}

export function partieParSlug(slug: string): Partie | undefined {
  return parties.find((p) => p.slug === slug)
}
