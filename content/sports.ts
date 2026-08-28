import type { ZoneMuscle } from '@/components/comparatif'

/**
 * Les activités des tableaux comparatifs de la partie 4.
 *
 * Deux natures de champs cohabitent, et la distinction compte :
 *
 * — `met` est mesuré. Il vient du compendium des activités physiques, et
 *   toutes les dépenses en kilocalories en sont calculées au rendu. Aucune
 *   n'est saisie (CLAUDE.md §11).
 *
 * — `effortMusculaire`, `impactCardio`, `fatigue`, `impact`, `typeEffort` et
 *   `muscles` sont des appréciations éditoriales, sur une échelle de un à
 *   quatre. Elles décrivent ce que la dépense ne dit pas : la charge subie
 *   par les articulations, la part de travail musculaire, la récupération
 *   qu'une séance demande. Le tableau les donne pour ce qu'elles sont.
 */

export type NiveauEffort = 'endurance' | 'force' | 'mixte'

export type LigneSport = {
  nom: string
  /** Coût en équivalents métaboliques, d'après le compendium 2011. */
  met: number
  /** Durée de séance retenue pour la ligne, en minutes. */
  duree: number
  /** Charge subie par les articulations, de 1 à 4. Appréciation éditoriale. */
  impact: 1 | 2 | 3 | 4
  /** Part de travail musculaire, de 1 à 4. Appréciation éditoriale. */
  effortMusculaire: 1 | 2 | 3 | 4
  /** Sollicitation du cœur et des poumons, de 1 à 4. Appréciation éditoriale. */
  impactCardio: 1 | 2 | 3 | 4
  /** Fatigue laissée par la séance, de 1 à 4. Appréciation éditoriale. */
  fatigue: 1 | 2 | 3 | 4
  /** Nature dominante de l'effort. */
  typeEffort: NiveauEffort
  /** Chemin d'une photo dans /public/img/sports, quand elle existe. */
  photo?: string
  /** Ce que la séance sollicite, et à quel degré. */
  muscles: Partial<Record<ZoneMuscle, 'fort' | 'moyen'>>
}

export type JeuSports = { titre: string; lignes: LigneSport[] }

export const sports = {
  endurance: {
    titre: "Sports d'endurance",
    lignes: [
      {
        nom: 'Marche rapide', met: 5.0, duree: 60,
        impact: 1, effortMusculaire: 1, impactCardio: 2, fatigue: 1,
        typeEffort: 'endurance',
        muscles: { quadriceps: 'moyen', mollets: 'moyen', fessiers: 'moyen' },
      },
      {
        nom: 'Vélo', met: 6.8, duree: 60,
        impact: 1, effortMusculaire: 2, impactCardio: 3, fatigue: 2,
        typeEffort: 'endurance',
        muscles: { quadriceps: 'fort', fessiers: 'fort', mollets: 'moyen' },
      },
      {
        nom: 'Natation', met: 8.3, duree: 60,
        impact: 1, effortMusculaire: 3, impactCardio: 3, fatigue: 2,
        typeEffort: 'endurance',
        muscles: {
          dorsaux: 'fort', epaules: 'fort', pectoraux: 'moyen',
          triceps: 'moyen', abdominaux: 'moyen',
        },
      },
      {
        nom: 'Rameur', met: 8.5, duree: 60,
        impact: 1, effortMusculaire: 3, impactCardio: 4, fatigue: 3,
        typeEffort: 'endurance',
        muscles: {
          dorsaux: 'fort', quadriceps: 'fort', biceps: 'moyen',
          epaules: 'moyen', lombaires: 'moyen',
        },
      },
      {
        nom: 'Course à pied', met: 9.8, duree: 60,
        impact: 4, effortMusculaire: 2, impactCardio: 4, fatigue: 3,
        typeEffort: 'endurance',
        muscles: {
          quadriceps: 'fort', mollets: 'fort', ischios: 'fort', fessiers: 'moyen',
        },
      },
      {
        nom: 'Corde à sauter', met: 11.8, duree: 60,
        impact: 4, effortMusculaire: 2, impactCardio: 4, fatigue: 3,
        typeEffort: 'mixte',
        muscles: { mollets: 'fort', epaules: 'moyen', quadriceps: 'moyen' },
      },
    ],
  },
  force: {
    titre: 'Sports de force et sports mixtes',
    lignes: [
      {
        nom: 'Musculation', met: 6.0, duree: 60,
        impact: 2, effortMusculaire: 4, impactCardio: 2, fatigue: 3,
        typeEffort: 'force',
        muscles: {
          pectoraux: 'fort', dorsaux: 'fort', quadriceps: 'fort',
          epaules: 'fort', biceps: 'moyen', triceps: 'moyen', abdominaux: 'moyen',
        },
      },
      {
        nom: 'Haltérophilie', met: 6.0, duree: 60,
        impact: 3, effortMusculaire: 4, impactCardio: 2, fatigue: 4,
        typeEffort: 'mixte',
        muscles: {
          quadriceps: 'fort', fessiers: 'fort', lombaires: 'fort',
          trapezes: 'fort', epaules: 'moyen',
        },
      },
      {
        nom: 'Boxe, sac de frappe', met: 5.5, duree: 60,
        impact: 2, effortMusculaire: 3, impactCardio: 4, fatigue: 3,
        typeEffort: 'mixte',
        muscles: {
          epaules: 'fort', abdominaux: 'fort', pectoraux: 'moyen',
          triceps: 'moyen', mollets: 'moyen',
        },
      },
      {
        nom: 'Football', met: 7.0, duree: 60,
        impact: 4, effortMusculaire: 2, impactCardio: 4, fatigue: 3,
        typeEffort: 'mixte',
        muscles: { quadriceps: 'fort', ischios: 'fort', mollets: 'moyen', fessiers: 'moyen' },
      },
      {
        nom: 'Tennis, en simple', met: 7.3, duree: 60,
        impact: 3, effortMusculaire: 2, impactCardio: 3, fatigue: 3,
        typeEffort: 'mixte',
        muscles: {
          quadriceps: 'fort', epaules: 'fort', avantBras: 'moyen',
          abdominaux: 'moyen', mollets: 'moyen',
        },
      },
      {
        nom: 'Escalade', met: 8.0, duree: 60,
        impact: 2, effortMusculaire: 4, impactCardio: 3, fatigue: 3,
        typeEffort: 'force',
        muscles: {
          dorsaux: 'fort', avantBras: 'fort', biceps: 'fort',
          abdominaux: 'moyen', quadriceps: 'moyen',
        },
      },
    ],
  },
  douces: {
    titre: 'Activités douces et vie courante',
    lignes: [
      {
        nom: 'Étirements', met: 2.3, duree: 60,
        impact: 1, effortMusculaire: 1, impactCardio: 1, fatigue: 1,
        typeEffort: 'force',
        muscles: { ischios: 'moyen', lombaires: 'moyen' },
      },
      {
        nom: 'Yoga, hatha', met: 2.5, duree: 60,
        impact: 1, effortMusculaire: 2, impactCardio: 1, fatigue: 1,
        typeEffort: 'force',
        muscles: { abdominaux: 'moyen', epaules: 'moyen', ischios: 'moyen' },
      },
      {
        nom: 'Marche lente', met: 2.8, duree: 60,
        impact: 1, effortMusculaire: 1, impactCardio: 1, fatigue: 1,
        typeEffort: 'endurance',
        muscles: { mollets: 'moyen', quadriceps: 'moyen' },
      },
      {
        nom: 'Pilates', met: 3.0, duree: 60,
        impact: 1, effortMusculaire: 2, impactCardio: 1, fatigue: 2,
        typeEffort: 'force',
        muscles: { abdominaux: 'fort', lombaires: 'moyen', fessiers: 'moyen' },
      },
      {
        nom: 'Jardinage', met: 3.8, duree: 60,
        impact: 2, effortMusculaire: 2, impactCardio: 2, fatigue: 2,
        typeEffort: 'endurance',
        muscles: { lombaires: 'moyen', quadriceps: 'moyen', avantBras: 'moyen' },
      },
      {
        nom: 'Danse de salon', met: 5.5, duree: 60,
        impact: 2, effortMusculaire: 1, impactCardio: 3, fatigue: 2,
        typeEffort: 'endurance',
        muscles: { quadriceps: 'moyen', mollets: 'moyen', abdominaux: 'moyen' },
      },
    ],
  },
} as const satisfies Record<string, JeuSports>

export type CleSports = keyof typeof sports

/** Poids de référence des tableaux, en kilogrammes. */
export const poidsReference = 70

/** Ce que dit chaque niveau d'une échelle de un à quatre. */
export const MOTS_NIVEAU = ['faible', 'modéré', 'élevé', 'très élevé'] as const

/** La même échelle, accordée pour « intensité » et « fatigue ». */
export const MOTS_NIVEAU_F = ['faible', 'modérée', 'élevée', 'très élevée'] as const

/** Ce que dit chaque nature d'effort, en clair. */
export const MOTS_EFFORT: Record<NiveauEffort, string> = {
  endurance: 'endurance',
  force: 'force',
  mixte: 'mixte',
}
