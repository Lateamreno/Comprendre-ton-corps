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
import { palette, polices } from '@/lib/tokens'
import { Vignette } from '@/components/vignette-sport'

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
  { titre: 'Sport', sousTitre: 'intensité', gabarit: '1.5fr', aGauche: true },
  { titre: "Type d'effort", sousTitre: 'dominante', gabarit: '0.86fr' },
  { titre: 'Durée', sousTitre: 'de séance', gabarit: '0.6fr' },
  { titre: 'Calories', sousTitre: 'brûlées', gabarit: '0.92fr' },
  { titre: 'Effort', sousTitre: 'musculaire', gabarit: '0.86fr' },
  { titre: 'Impact', sousTitre: 'cardio', gabarit: '0.86fr' },
  { titre: 'Fatigue', sousTitre: 'globale', gabarit: '0.6fr' },
  { titre: 'Muscles', sousTitre: 'sollicités', gabarit: '1.05fr' },
] as const

const gabarit = COLONNES.map((c) => c.gabarit).join(' ')

/** Repère haut de l'échelle des calories, pour que les tableaux se comparent. */
const CALORIES_PLEIN = 800

/**
 * Une case alignée : l'icône, la jauge et le texte occupent trois bandes de
 * hauteur fixe. C'est ce qui met tous les pictogrammes d'une ligne sur le
 * même axe, quelle que soit la longueur du mot au-dessous.
 */
function CaseAlignee({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '1.35em 0.95em auto',
        justifyItems: 'center',
        alignItems: 'center',
        rowGap: '0.12em',
        padding: '0.34em 0.3em',
        borderLeft: `1px solid ${palette.piste}`,
      }}
    >
      {children}
    </div>
  )
}

/** Une case libre : ni icône ni jauge à aligner. */
function CaseLibre({
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
        fontSize: '0.58em',
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

/** Une barre continue : la grandeur est mesurée, pas appréciée. */
function BarreValeur({ part, couleur }: { part: number; couleur: string }) {
  return (
    <span
      style={{
        display: 'block',
        width: '76%',
        height: 7,
        borderRadius: 4,
        background: palette.piste,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <span
        style={{
          display: 'block',
          width: `${Math.min(100, Math.max(0, part * 100))}%`,
          height: '100%',
          borderRadius: 4,
          background: couleur,
        }}
      />
    </span>
  )
}

/** Le vert au plus bas, le rouge au plus haut : la couleur de valeur. */
function couleurNiveau(niveau: number) {
  return [palette.vertClair, palette.jaune, palette.orange, palette.rouge][niveau - 1]
}

const ICONE_EFFORT = { endurance: 'endurance', force: 'force', mixte: 'mixte' } as const

function Ligne({ s }: { s: LigneSport }) {
  const kcal = depense(s.met, s.duree)
  const heures =
    s.duree >= 60
      ? `${(s.duree / 60).toFixed(s.duree % 60 === 0 ? 0 : 1).replace('.', ',')} h`
      : `${s.duree} min`

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
      <CaseLibre aGauche>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.55em' }}>
          <Vignette sport={s} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.12em' }}>
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
                fontSize: '0.56em',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: couleurNiveau(s.fatigue),
              }}
            >
              intensité {MOTS_NIVEAU_F[s.fatigue - 1]}
            </span>
          </span>
        </span>
      </CaseLibre>

      <CaseAlignee>
        <Icone nom={ICONE_EFFORT[s.typeEffort]} />
        <span />
        <Mot texte={MOTS_EFFORT[s.typeEffort]} />
      </CaseAlignee>

      <CaseLibre>
        <Icone nom="chrono" taille={16} />
        <Valeur nombre={heures} />
      </CaseLibre>

      <CaseAlignee>
        <Icone nom="flamme" />
        <BarreValeur part={kcal / CALORIES_PLEIN} couleur={palette.orange} />
        <Valeur nombre={Math.round(kcal).toString()} unite="kcal" />
      </CaseAlignee>

      <CaseAlignee>
        <Icone nom="haltere" />
        <EchellePoints niveau={s.effortMusculaire} couleur={couleurNiveau(s.effortMusculaire)} />
        <Mot texte={MOTS_NIVEAU[s.effortMusculaire - 1]} />
      </CaseAlignee>

      <CaseAlignee>
        <Icone nom="coeur" />
        <EchellePoints niveau={s.impactCardio} couleur={couleurNiveau(s.impactCardio)} />
        <Mot texte={MOTS_NIVEAU[s.impactCardio - 1]} />
      </CaseAlignee>

      <CaseLibre>
        <Pile part={s.fatigue / 4} couleur={couleurNiveau(s.fatigue)} hauteur={24} />
        <Mot texte={MOTS_NIVEAU_F[s.fatigue - 1]} />
      </CaseLibre>

      <CaseLibre>
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: '0.35em' }}>
          <Silhouette face="avant" zones={s.muscles} hauteur={76} />
          <Silhouette face="arriere" zones={s.muscles} hauteur={76} />
        </span>
      </CaseLibre>
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
