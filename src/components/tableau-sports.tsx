import { EchellePoints, Icone, LegendeMuscles, Pile, Silhouette } from '@/components/comparatif'
import {
  MOTS_EFFORT,
  MOTS_NIVEAU,
  MOTS_NIVEAU_F,
  poidsReference,
  sports,
  type CleSports,
  type LigneSport,
} from '@content/sports'
import { identites, palette, polices } from '@/lib/tokens'

/**
 * Le tableau comparatif des activités.
 *
 * Une ligne par activité, une colonne par grandeur, et dans chaque case le
 * même trio : le pictogramme de la grandeur, sa jauge, sa valeur écrite. La
 * dépense est calculée depuis le MET ; le reste est déclaré dans
 * content/sports.ts, qui dit lesquelles de ces valeurs sont mesurées et
 * lesquelles sont des appréciations.
 *
 * Le tableau traverse les deux colonnes de la double page : c'est une grille
 * large, elle ne se lit pas coupée en deux.
 */

/** Dépense d'une activité, en kilocalories, pour la durée indiquée. */
function depense(met: number, minutes: number) {
  return (met * 3.5 * poidsReference * minutes) / 200
}

const COLONNES = [
  { titre: 'Activité', sousTitre: 'intensité', gabarit: '1.35fr', aGauche: true },
  { titre: 'Durée', sousTitre: 'de séance', gabarit: '0.62fr' },
  { titre: 'Calories', sousTitre: 'brûlées', gabarit: '0.72fr' },
  { titre: 'Effort', sousTitre: 'musculaire', gabarit: '0.78fr' },
  { titre: 'Impact', sousTitre: 'cardio', gabarit: '0.78fr' },
  { titre: 'Fatigue', sousTitre: 'globale', gabarit: '0.62fr' },
  { titre: 'Articulations', sousTitre: 'charge subie', gabarit: '0.78fr' },
  { titre: 'Muscles', sousTitre: 'sollicités', gabarit: '1.15fr', aGauche: true },
] as const

const gabarit = COLONNES.map((c) => c.gabarit).join(' ')

function Cellule({
  children,
  aGauche = false,
}: {
  children: React.ReactNode
  aGauche?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: aGauche ? 'flex-start' : 'center',
        justifyContent: 'center',
        gap: '0.18em',
        padding: '0.34em 0.3em',
        borderLeft: aGauche ? 'none' : `1px solid ${palette.piste}`,
      }}
    >
      {children}
    </div>
  )
}

function Valeur({ nombre, unite }: { nombre: string; unite?: string }) {
  return (
    <span
      style={{
        fontFamily: polices.fiche,
        fontWeight: 700,
        fontSize: '0.92em',
        color: palette.texte,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {nombre}
      {unite && (
        <span style={{ fontWeight: 500, fontSize: '0.68em', color: palette.texteFaible }}>
          {' '}
          {unite}
        </span>
      )}
    </span>
  )
}

function Mot({ texte, couleur }: { texte: string; couleur?: string }) {
  return (
    <span
      style={{
        fontFamily: polices.fiche,
        fontWeight: 600,
        fontSize: '0.6em',
        letterSpacing: '0.02em',
        color: couleur ?? palette.texte,
        textAlign: 'center',
        lineHeight: 1.15,
      }}
    >
      {texte}
    </span>
  )
}

/** Le vert au plus bas, le rouge au plus haut : la couleur de valeur. */
function couleurNiveau(niveau: number) {
  return [palette.vertClair, palette.jaune, palette.orange, palette.rouge][niveau - 1]
}

function Ligne({ s }: { s: LigneSport }) {
  const kcal = depense(s.met, s.duree)
  const heures = s.duree >= 60 ? `${(s.duree / 60).toFixed(s.duree % 60 === 0 ? 0 : 1).replace('.', ',')} h` : `${s.duree} min`

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gabarit,
        alignItems: 'stretch',
        borderTop: `1px solid ${palette.piste}`,
        breakInside: 'avoid',
      }}
    >
      <Cellule aGauche>
        <span
          style={{
            fontFamily: polices.fiche,
            fontWeight: 700,
            fontSize: '0.92em',
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
            color: palette.texte,
            lineHeight: 1.1,
          }}
        >
          {s.nom}
        </span>
        <span
          style={{
            fontFamily: polices.fiche,
            fontWeight: 600,
            fontSize: '0.58em',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: couleurNiveau(s.fatigue),
          }}
        >
          intensité {MOTS_NIVEAU_F[s.fatigue - 1]}
        </span>
      </Cellule>

      <Cellule>
        <Icone nom="chrono" couleur={identites.satiete.couleur} />
        <Valeur nombre={heures} />
      </Cellule>

      <Cellule>
        <Icone nom="flamme" couleur={identites.energie.couleur} />
        <Valeur nombre={Math.round(kcal).toString()} unite="kcal" />
      </Cellule>

      <Cellule>
        <Icone nom="haltere" couleur={identites.proteines.couleur} />
        <EchellePoints niveau={s.effortMusculaire} couleur={couleurNiveau(s.effortMusculaire)} />
        <Mot texte={MOTS_NIVEAU[s.effortMusculaire - 1]} />
      </Cellule>

      <Cellule>
        <Icone nom="coeur" couleur={palette.rouge} />
        <EchellePoints niveau={s.impactCardio} couleur={couleurNiveau(s.impactCardio)} />
        <Mot texte={MOTS_NIVEAU[s.impactCardio - 1]} />
      </Cellule>

      <Cellule>
        <Pile part={s.fatigue / 4} couleur={couleurNiveau(s.fatigue)} hauteur={26} />
        <Mot texte={MOTS_NIVEAU[s.fatigue - 1]} />
      </Cellule>

      <Cellule>
        <Icone nom="articulation" couleur={palette.texteFaible} />
        <EchellePoints niveau={s.impact} couleur={couleurNiveau(s.impact)} />
        <Mot texte={MOTS_NIVEAU[s.impact - 1]} />
        <Mot texte={MOTS_EFFORT[s.typeEffort]} couleur={palette.texteFaible} />
      </Cellule>

      <Cellule aGauche>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <Silhouette face="avant" zones={s.muscles} hauteur={70} />
          <Silhouette face="arriere" zones={s.muscles} hauteur={70} />
        </span>
      </Cellule>
    </div>
  )
}

export function TableSports({
  jeu,
  nouvellePage = false,
}: {
  jeu: CleSports
  nouvellePage?: boolean
}) {
  const { titre, lignes }: { titre: string; lignes: readonly LigneSport[] } = sports[jeu]

  return (
    <section
      style={{
        columnSpan: 'all',
        breakBefore: nouvellePage ? 'column' : 'auto',
        margin: '0 0 1.1em',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '1em',
          marginBottom: '0.35em',
        }}
      >
        <h2
          style={{
            fontFamily: polices.titre,
            fontSize: '1.05em',
            fontWeight: 600,
            margin: 0,
          }}
        >
          {titre}
        </h2>
        <LegendeMuscles />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gabarit,
          borderBottom: `1.5px solid ${palette.texte}`,
        }}
      >
        {COLONNES.map((c) => (
          <div
            key={c.titre}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'aGauche' in c && c.aGauche ? 'flex-start' : 'center',
              padding: '0 0.35em 0.4em',
            }}
          >
            <span
              style={{
                fontFamily: polices.fiche,
                fontWeight: 700,
                fontSize: '0.6em',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: palette.texte,
              }}
            >
              {c.titre}
            </span>
            <span
              style={{
                fontFamily: polices.fiche,
                fontSize: '0.52em',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: palette.texteFaible,
              }}
            >
              {c.sousTitre}
            </span>
          </div>
        ))}
      </div>

      {lignes.map((s) => (
        <Ligne key={s.nom} s={s} />
      ))}

      <p
        style={{
          fontFamily: polices.chiffre,
          fontSize: '0.55em',
          lineHeight: 1.5,
          color: palette.texteFaible,
          margin: '0.5em 0 0',
          borderTop: `1px solid ${palette.piste}`,
          paddingTop: '0.4em',
        }}
      >
        Les calories sont calculées depuis le coût mesuré de l’activité, pour un
        adulte de {poidsReference} kg, et changent proportionnellement avec le
        poids. Source : compendium des activités physiques, 2011. Les colonnes
        effort, cardio, fatigue et articulations sont des appréciations de ce
        livre sur une échelle de un à quatre : elles décrivent ce que la dépense
        ne dit pas.
      </p>
    </section>
  )
}
