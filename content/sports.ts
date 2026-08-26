/**
 * Les activités des tableaux de la partie 4.
 *
 * Aucune dépense n'est écrite ici : chaque ligne porte une valeur de MET,
 * l'unité du compendium de référence, et la dépense est calculée au rendu
 * pour un poids donné. Changer le poids change toutes les colonnes ; aucune
 * valeur ne se saisit à la main (CLAUDE.md §11).
 *
 * Un MET est le coût du repos assis. Une activité à 8 METs coûte donc huit
 * fois ce que coûte rester assis, pendant la même durée.
 */

export type LigneSport = {
  /** Nom de l'activité, tel qu'il parle au lecteur. */
  nom: string
  /** Coût en équivalents métaboliques, d'après le compendium 2011. */
  met: number
  /** Charge subie par les articulations : ce que la dépense ne dit pas. */
  impact: 'faible' | 'moyen' | 'élevé'
  /** Ce que l'activité sollicite en priorité. */
  sollicite: string
}

export type JeuSports = {
  titre: string
  lignes: LigneSport[]
}

export const sports = {
  endurance: {
    titre: "Sports d'endurance",
    lignes: [
      { nom: 'Marche, 5 km/h', met: 3.5, impact: 'faible', sollicite: 'jambes' },
      { nom: 'Marche rapide, 6,5 km/h', met: 5.0, impact: 'faible', sollicite: 'jambes' },
      { nom: 'Randonnée', met: 6.0, impact: 'moyen', sollicite: 'jambes, tronc' },
      { nom: 'Vélo, 18 km/h', met: 6.8, impact: 'faible', sollicite: 'cuisses' },
      { nom: 'Natation, crawl', met: 8.3, impact: 'faible', sollicite: 'corps entier' },
      { nom: 'Rameur, soutenu', met: 8.5, impact: 'faible', sollicite: 'dos, jambes' },
      { nom: 'Course, 8 km/h', met: 8.3, impact: 'élevé', sollicite: 'jambes' },
      { nom: 'Course, 10 km/h', met: 9.8, impact: 'élevé', sollicite: 'jambes' },
      { nom: 'Vélo, 24 km/h', met: 10.0, impact: 'faible', sollicite: 'cuisses' },
      { nom: 'Corde à sauter', met: 11.8, impact: 'élevé', sollicite: 'mollets, épaules' },
    ],
  },
  force: {
    titre: 'Sports de force et sports mixtes',
    lignes: [
      { nom: 'Musculation, allure calme', met: 3.5, impact: 'faible', sollicite: 'muscle ciblé' },
      { nom: 'Boxe, sac de frappe', met: 5.5, impact: 'moyen', sollicite: 'épaules, tronc' },
      { nom: 'Musculation, soutenue', met: 6.0, impact: 'moyen', sollicite: 'muscle ciblé' },
      { nom: 'Haltérophilie', met: 6.0, impact: 'moyen', sollicite: 'corps entier' },
      { nom: 'Basket-ball', met: 6.5, impact: 'élevé', sollicite: 'jambes, tronc' },
      { nom: 'Football', met: 7.0, impact: 'élevé', sollicite: 'jambes' },
      { nom: 'Tennis, en simple', met: 7.3, impact: 'élevé', sollicite: 'jambes, épaules' },
      { nom: 'Escalade', met: 8.0, impact: 'moyen', sollicite: 'dos, avant-bras' },
      { nom: 'Circuit enchaîné', met: 8.0, impact: 'moyen', sollicite: 'corps entier' },
    ],
  },
  douces: {
    titre: 'Activités douces et vie courante',
    lignes: [
      { nom: 'Étirements', met: 2.3, impact: 'faible', sollicite: 'souplesse' },
      { nom: 'Yoga, hatha', met: 2.5, impact: 'faible', sollicite: 'souplesse, équilibre' },
      { nom: 'Marche lente, 3 km/h', met: 2.8, impact: 'faible', sollicite: 'jambes' },
      { nom: 'Pilates', met: 3.0, impact: 'faible', sollicite: 'tronc' },
      { nom: 'Taï-chi', met: 3.0, impact: 'faible', sollicite: 'équilibre' },
      { nom: 'Ménage', met: 3.3, impact: 'faible', sollicite: 'corps entier' },
      { nom: 'Jardinage', met: 3.8, impact: 'moyen', sollicite: 'dos, jambes' },
      { nom: 'Yoga dynamique', met: 4.0, impact: 'faible', sollicite: 'corps entier' },
      { nom: 'Danse de salon', met: 5.5, impact: 'moyen', sollicite: 'jambes' },
    ],
  },
} as const satisfies Record<string, JeuSports>

export type CleSports = keyof typeof sports

/** Poids de référence des tableaux, en kilogrammes. */
export const poidsReference = 70
