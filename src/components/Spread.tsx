import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { composantsImprimes } from '@/components/composition'
import {
  palette,
  polices,
  doublePage,
  margesImprimees,
  taillesImprimees,
  mmEnCqw,
} from '@/lib/tokens'
import type { DoublePageSituee } from '@/lib/content'

/**
 * Rendu d'une double page au format réel : 400 × 270 mm, ouverte.
 *
 * Le cadre garde le ratio imprimé quelle que soit sa taille d'affichage, et
 * toutes les mesures internes sont exprimées en `cqw` — 1 % de la largeur du
 * cadre. Un corps de texte de 3,4 mm reste donc à 3,4 mm de la double page,
 * à l'écran comme sur la maquette. C'est ce qui rend la densité jugeable.
 *
 * Le cadre sert de jauge : un texte court laisse du blanc, c'est attendu et
 * c'est l'information utile. Un texte trop long déborde et se trouve rogné —
 * c'est le signal inverse.
 */

const mm = mmEnCqw

const composants = composantsImprimes(mm)

export function Spread({
  dp,
  sansCadre,
}: {
  dp: DoublePageSituee
  /** Dans le livre feuilletable, le cadre est porté par la reliure. */
  sansCadre?: boolean
}) {
  return (
    <div
      style={{
        containerType: 'inline-size',
        width: '100%',
        aspectRatio: `${doublePage.largeurMm} / ${doublePage.hauteurMm}`,
        background: palette.fond,
        border: sansCadre ? 'none' : `1px solid ${palette.piste}`,
        color: palette.texte,
        fontFamily: polices.texte,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* La pliure. Filet fin, pas un cadre. */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: '1px',
          background: palette.piste,
        }}
      />

      <div
        style={{
          height: '100%',
          padding: `${mm(margesImprimees.haute)} ${mm(margesImprimees.exterieure)} ${mm(
            margesImprimees.basse,
          )}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ marginBottom: mm(6) }}>
          <div
            style={{
              fontFamily: polices.chiffre,
              fontSize: mm(taillesImprimees.legende),
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: palette.texteFaible,
            }}
          >
            {dp.numero} — {dp.partieRef.titre}
          </div>
          <h1
            style={{
              fontFamily: polices.titre,
              fontSize: mm(taillesImprimees.titre),
              fontWeight: 600,
              lineHeight: 1.05,
              margin: `${mm(3)} 0 0`,
              // Le titre reste sur la page de gauche : il ne franchit pas la pliure.
              maxWidth: '46%',
            }}
          >
            {dp.titre}
          </h1>
        </header>

        {/* Le texte coule en deux colonnes, une par page. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            columnCount: 2,
            columnGap: mm(margesImprimees.fond * 2),
            columnFill: 'auto',
            fontSize: mm(taillesImprimees.corps),
            lineHeight: 1.45,
          }}
        >
          <MDXRemote
            source={dp.corps}
            components={composants}
            options={{
              parseFrontmatter: false,
              mdxOptions: { remarkPlugins: [remarkGfm] },
            }}
          />
        </div>

        {dp.sources.length > 0 && (
          <footer
            style={{
              marginTop: mm(4),
              paddingTop: mm(2),
              borderTop: `1px solid ${palette.piste}`,
              fontFamily: polices.chiffre,
              fontSize: mm(taillesImprimees.legende),
              color: palette.texteFaible,
            }}
          >
            {dp.sources.join(' · ')}
          </footer>
        )}
      </div>
    </div>
  )
}
