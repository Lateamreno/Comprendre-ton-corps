import type { Metadata } from 'next'
import { Livre } from '@/components/Livre'
import { Spread } from '@/components/Spread'
import { dpPubliables } from '@/lib/content'
import { auteur, site } from '@/lib/config'
import {
  doublePage,
  formatLivre,
  margesImprimees,
  mmEnCqw,
  palette,
  polices,
  taillesImprimees,
} from '@/lib/tokens'

export const metadata: Metadata = {
  title: 'Le livre — feuilleter',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Le livre tel qu'on le tiendrait en main.
 *
 * Chaque double page écrite devient un feuillet, rendu par le même
 * composant que l'atelier : ce qui se feuillette ici est exactement la
 * composition imprimée, pas une version pour écran.
 */
export default function PageLivre() {
  const dps = dpPubliables()

  const feuillets = [
    <Couverture key="couverture" />,
    ...dps.map((dp) => <Spread key={dp.slug} dp={dp} sansCadre />),
  ]

  const titres = ['Couverture', ...dps.map((dp) => `${dp.numero} — ${dp.titre}`)]

  return <Livre feuillets={feuillets} titres={titres} />
}

/** La page de titre, posée à droite comme dans un livre qu'on ouvre. */
function Couverture() {
  const mm = mmEnCqw

  return (
    <div
      style={{
        containerType: 'inline-size',
        width: '100%',
        aspectRatio: `${doublePage.largeurMm} / ${doublePage.hauteurMm}`,
        background: palette.fond,
        color: palette.texte,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '50%', borderRight: `1px solid ${palette.piste}` }} />
      <div
        style={{
          width: '50%',
          padding: `${mm(margesImprimees.haute)} ${mm(margesImprimees.exterieure)} ${mm(
            margesImprimees.basse,
          )} ${mm(margesImprimees.fond)}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: polices.titre,
            fontSize: mm(taillesImprimees.titre),
            fontWeight: 600,
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          {site.titre}
        </h1>
        <p
          style={{
            fontFamily: polices.chiffre,
            fontSize: mm(taillesImprimees.legende),
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: palette.texteFaible,
            margin: `${mm(8)} 0 0`,
          }}
        >
          {auteur.nom}
        </p>
        <p
          style={{
            fontFamily: polices.chiffre,
            fontSize: mm(taillesImprimees.legende),
            color: palette.texteFaible,
            margin: `${mm(2)} 0 0`,
          }}
        >
          {formatLivre.libelle}
        </p>
      </div>
    </div>
  )
}
