import { tableaux, type CleTableau, type LigneAliment } from '@content/tableaux'
import { alimentCiqual, nombre, pourPortion, type Mesure } from '@/lib/ciqual'
import { palette, polices } from '@/lib/tokens'

/**
 * Les tableaux comparatifs de la partie 3.
 *
 * Aucun chiffre n'est saisi ici : chaque ligne ne contient qu'un code
 * Ciqual et une portion, et toutes les valeurs sont calculées à la lecture
 * de la table (CLAUDE.md §11). Changer une portion suffit à changer la
 * ligne entière ; corriger une valeur nutritionnelle se fait dans Ciqual,
 * jamais dans une page.
 *
 * Un tableau tient dans une colonne du cadre imprimé, c'est-à-dire sur une
 * page de la double page. Les pages de tableau en posent donc deux, et le
 * second ouvre la page de droite.
 */


function arrondi(n: number | null, decimales = 0): string {
  if (n === null) return '—'
  return n.toFixed(decimales).replace('.', ',')
}

/** Grammes d'aliment qu'il faut manger pour obtenir 100 kcal. */
function pourCentKcal(kcal: Mesure): string {
  const v = nombre(kcal)
  if (v === null || v <= 0) return '—'
  const g = (100 / v) * 100
  return g >= 1000 ? `${arrondi(g / 1000, 1)} kg` : `${arrondi(g)} g`
}

export function TableAliments({
  jeu,
  nouvellePage = false,
}: {
  /** Clé du jeu de lignes dans content/tableaux.ts. */
  jeu: CleTableau
  nouvellePage?: boolean
}) {
  const { titre, lignes }: { titre: string; lignes: readonly LigneAliment[] } =
    tableaux[jeu]
  const cellule: React.CSSProperties = {
    fontFamily: polices.chiffre,
    fontSize: '0.68em',
    padding: '0.28em 0.2em',
    textAlign: 'right',
    borderBottom: `1px solid ${palette.piste}`,
    fontVariantNumeric: 'tabular-nums',
  }
  const entete: React.CSSProperties = {
    ...cellule,
    fontSize: '0.58em',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: palette.texteFaible,
    borderBottom: `1px solid ${palette.texte}`,
    verticalAlign: 'bottom',
  }

  return (
    <section
      style={{
        breakBefore: nouvellePage ? 'column' : 'auto',
        breakInside: 'avoid',
        margin: '0 0 1em',
      }}
    >
      <h2
        style={{
          fontFamily: polices.titre,
          fontSize: '1.05em',
          fontWeight: 600,
          margin: '0 0 0.4em',
        }}
      >
        {titre}
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...entete, textAlign: 'left' }}>Aliment</th>
            <th style={entete}>Portion</th>
            <th style={entete}>kcal</th>
            <th style={entete}>Prot.</th>
            <th style={entete}>Gluc.</th>
            <th style={entete}>Lip.</th>
            <th style={entete}>Fibres</th>
            <th style={entete}>Pour 100 kcal</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => {
            const a = alimentCiqual(l.code)
            return (
              <tr key={l.code}>
                <td style={{ ...cellule, textAlign: 'left', fontFamily: polices.fiche }}>
                  {l.nom}
                  <span style={{ color: palette.texteFaible }}> · {l.mesure}</span>
                </td>
                <td style={cellule}>{`${l.portion} g`}</td>
                <td style={cellule}>{arrondi(pourPortion(a.kcal, l.portion))}</td>
                <td style={cellule}>{arrondi(pourPortion(a.proteines, l.portion))}</td>
                <td style={cellule}>{arrondi(pourPortion(a.glucides, l.portion))}</td>
                <td style={cellule}>{arrondi(pourPortion(a.lipides, l.portion))}</td>
                <td style={cellule}>{arrondi(pourPortion(a.fibres, l.portion))}</td>
                <td style={cellule}>{pourCentKcal(a.kcal)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p
        style={{
          fontFamily: polices.chiffre,
          fontSize: '0.6em',
          lineHeight: 1.5,
          color: palette.texteFaible,
          margin: '0.4em 0 0',
        }}
      >
        Protéines, glucides, lipides et fibres en grammes pour la portion
        indiquée. La dernière colonne donne le poids d’aliment qui apporte
        cent kilocalories : plus il est élevé, plus l’aliment occupe de place
        pour la même énergie. Source : Ciqual 2025.
      </p>
    </section>
  )
}

export const composantsTables = { TableAliments }
