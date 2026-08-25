import { palette, polices, taillesImprimees } from '@/lib/tokens'
import { composantsFigures } from '@/components/figures'
import { composantsTables } from '@/components/tables'

/**
 * L'habillage du texte à l'échelle imprimée.
 *
 * Les mesures ne sont pas écrites en pixels mais en millimètres de papier,
 * converties par la fonction `mm` que reçoit cette fabrique. Le spread la
 * cale sur la largeur d'une double page, le simulateur sur celle d'une page
 * seule — la composition est la même des deux côtés, seule l'échelle change.
 */
export function composantsImprimes(mm: (valeur: number) => string) {
  return {
    h2: (props: React.ComponentProps<'h2'>) => (
      <h2
        {...props}
        style={{
          fontFamily: polices.titre,
          fontSize: mm(taillesImprimees.intertitre),
          fontWeight: 600,
          lineHeight: 1.2,
          margin: `${mm(6)} 0 ${mm(2)}`,
          breakAfter: 'avoid',
        }}
      />
    ),
    h3: (props: React.ComponentProps<'h3'>) => (
      <h3
        {...props}
        style={{
          fontFamily: polices.titre,
          fontSize: mm(taillesImprimees.corps),
          fontWeight: 600,
          margin: `${mm(4)} 0 ${mm(1.5)}`,
          breakAfter: 'avoid',
        }}
      />
    ),
    p: (props: React.ComponentProps<'p'>) => (
      <p {...props} style={{ margin: `0 0 ${mm(3)}`, textAlign: 'justify', hyphens: 'auto' }} />
    ),
    strong: (props: React.ComponentProps<'strong'>) => (
      <strong {...props} style={{ fontWeight: 600 }} />
    ),
    ul: (props: React.ComponentProps<'ul'>) => (
      <ul {...props} style={{ margin: `0 0 ${mm(3)}`, paddingLeft: mm(4) }} />
    ),
    li: (props: React.ComponentProps<'li'>) => (
      <li {...props} style={{ margin: `0 0 ${mm(1)}` }} />
    ),
    a: (props: React.ComponentProps<'a'>) => (
      <a {...props} style={{ color: palette.texte, textDecoration: 'underline' }} />
    ),
    table: (props: React.ComponentProps<'table'>) => (
      <table
        {...props}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: `0 0 ${mm(3)}`,
          fontSize: mm(taillesImprimees.legende),
          breakInside: 'avoid',
        }}
      />
    ),
    th: (props: React.ComponentProps<'th'>) => (
      <th
        {...props}
        style={{
          fontFamily: polices.chiffre,
          fontWeight: 500,
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: palette.texteFaible,
          borderBottom: `1px solid ${palette.texte}`,
          padding: `${mm(1)} ${mm(1.5)}`,
        }}
      />
    ),
    td: (props: React.ComponentProps<'td'>) => (
      <td
        {...props}
        style={{
          verticalAlign: 'top',
          borderBottom: `1px solid ${palette.piste}`,
          padding: `${mm(1)} ${mm(1.5)}`,
        }}
      />
    ),
    ...composantsFigures,
    ...composantsTables,
  }
}
