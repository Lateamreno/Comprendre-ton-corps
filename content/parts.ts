/**
 * Les 7 parties du livre, dans l'ordre de lecture.
 *
 * L'ordre suit une progression : on explique d'abord ce que le corps fait
 * d'un aliment, ensuite ce que les aliments contiennent, puis ce que le corps
 * dépense, les leviers qui modifient cette dépense, le terrain qui la
 * perturbe, et enfin la perte de poids — pourquoi elle se provoque, pourquoi
 * elle échoue, et ce qui tient.
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
    titre: 'Ce qui se passe quand on mange',
    slug: 'ce-qui-se-passe-quand-on-mange',
    resume:
      "Le trajet d'une bouchée, de la bouche au tissu adipeux, et les signaux qui décident de son sort.",
    acquis: "Comprendre la machine avant de juger le carburant.",
  },
  {
    numero: 2,
    titre: 'Ce que contiennent les aliments',
    slug: 'ce-que-contiennent-les-aliments',
    resume:
      "Macronutriments, fibres, calories, indice glycémique, degré de transformation — et ce que les étiquettes ne disent pas.",
    acquis: "Lire un aliment autrement que par son nombre de calories.",
  },
  {
    numero: 3,
    titre: 'Ce que le corps dépense',
    slug: 'ce-que-le-corps-depense',
    resume:
      "Métabolisme de base, digestion, mouvement involontaire, exercice : les quatre postes de la dépense et leurs proportions réelles.",
    acquis: "Savoir où part l'énergie, et laquelle de ces parts se pilote.",
  },
  {
    numero: 4,
    titre: 'Le muscle et le mouvement',
    slug: 'le-muscle-et-le-mouvement',
    resume:
      "Ce que fait un muscle qui grossit, ce que brûle un cardio, et ce qui distingue une pratique qui dure d'une qui s'arrête.",
    acquis: "Choisir une activité pour ce qu'elle produit, pas pour sa réputation.",
  },
  {
    numero: 5,
    titre: 'Le terrain caché',
    slug: 'le-terrain-cache',
    resume:
      "Sommeil, stress, alcool, lumière, âge, cycle hormonal : ce qui agit sans passer par l'assiette.",
    acquis: "Reconnaître les causes d'échec qui ne sont pas alimentaires.",
  },
  {
    numero: 6,
    titre: 'Perdre du poids, et le rester',
    slug: 'perdre-du-poids-et-le-rester',
    resume:
      "Comment une perte se provoque, pourquoi elle échoue si souvent, et ce qui reste quand on arrête d'essayer fort.",
    acquis: "Distinguer ce qui fait maigrir de ce qui fait rester mince.",
  },
]

export function partieParNumero(numero: number): Partie | undefined {
  return parties.find((p) => p.numero === numero)
}

export function partieParSlug(slug: string): Partie | undefined {
  return parties.find((p) => p.slug === slug)
}
