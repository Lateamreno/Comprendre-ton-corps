import { identites, palette, polices } from '@/lib/tokens'

/**
 * Les figures des doubles pages.
 *
 * Elles se posent directement dans le MDX (<FigureVidange />) et sont
 * enregistrées dans les deux rendus, lecture et spread. Aucune couleur n'est
 * écrite ici : tout vient de lib/tokens.ts, et l'information n'est jamais
 * portée par la seule couleur — chaque tracé porte son étiquette.
 */

const stylePetit: React.CSSProperties = {
  fontFamily: polices.chiffre,
  fontSize: 10,
  fill: palette.texteFaible,
}

const styleEtiquette: React.CSSProperties = {
  fontFamily: polices.fiche,
  fontSize: 11,
  fontWeight: 600,
}

export function Figure({
  legende,
  children,
}: {
  legende: string
  children: React.ReactNode
}) {
  return (
    <figure
      style={{
        margin: '1.25rem 0',
        padding: '0.75rem 0 0.6rem',
        borderTop: `1px solid ${palette.piste}`,
        borderBottom: `1px solid ${palette.piste}`,
        breakInside: 'avoid',
      }}
    >
      {children}
      <figcaption
        style={{
          marginTop: '0.6rem',
          fontFamily: polices.chiffre,
          fontSize: '0.75rem',
          lineHeight: 1.5,
          color: palette.texteFaible,
        }}
      >
        {legende}
      </figcaption>
    </figure>
  )
}

/** Ce qui reste dans l'estomac après un repas bu et un repas mâché. */
export function FigureVidange() {
  const x = (t: number) => 42 + (t / 4) * 278
  const y = (pct: number) => 172 - (pct / 100) * 150
  const trace = (points: [number, number][]) =>
    points.map(([t, p], i) => `${i === 0 ? 'M' : 'L'}${x(t).toFixed(1)} ${y(p).toFixed(1)}`).join(' ')

  const solide: [number, number][] = [[0, 100], [0.5, 95], [1, 80], [1.5, 62], [2, 45], [3, 22], [4, 8]]
  const liquide: [number, number][] = [[0, 100], [0.5, 55], [1, 30], [1.5, 17], [2, 9], [3, 3], [4, 1]]

  return (
    <Figure legende="Part du repas encore dans l'estomac, en pourcentage, au fil des heures. Allure schématique : un liquide traverse en dizaines de minutes, un solide occupe l'estomac pendant des heures.">
      <svg viewBox="0 0 340 200" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Vidange gastrique comparée d'un repas solide et d'un repas liquide">
        {[0, 50, 100].map((p) => (
          <g key={p}>
            <line x1="42" x2="320" y1={y(p)} y2={y(p)} stroke={palette.piste} strokeWidth="1" />
            <text x="36" y={y(p) + 3} textAnchor="end" style={stylePetit}>{p} %</text>
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((t) => (
          <text key={t} x={x(t)} y="190" textAnchor="middle" style={stylePetit}>{t} h</text>
        ))}
        <path d={trace(solide)} fill="none" stroke={identites.volume.couleur} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={trace(liquide)} fill="none" stroke={palette.bleu} strokeWidth="2.5"
          strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
        <text x={x(1.6)} y={y(66)} style={{ ...styleEtiquette, fill: identites.volume.couleur }}>
          repas solide
        </text>
        <text x={x(0.75)} y={y(28)} style={{ ...styleEtiquette, fill: palette.bleu }}>
          repas liquide
        </text>
      </svg>
    </Figure>
  )
}

/** Les trois signaux d'arrêt, sur l'heure qui suit le début du repas. */
export function FigureSignaux() {
  const x = (min: number) => 112 + (min / 60) * 208
  const rangs = [
    { nom: 'Le volume', couleur: identites.volume.couleur, debut: 0, plein: 30, fondu: 45, y: 34 },
    { nom: 'Les hormones', couleur: identites.satiete.couleur, debut: 12, plein: 60, fondu: 60, y: 78, rampe: 20 },
    { nom: "L'absorption", couleur: identites.energie.couleur, debut: 30, plein: 60, fondu: 60, y: 122 },
  ]

  return (
    <Figure legende="Les trois signaux qui arrêtent un repas, sur l'heure qui suit la première bouchée. Le volume parle tout de suite mais s'éteint ; les hormones intestinales demandent une quinzaine de minutes ; l'absorption arrive en dernier. Vers vingt minutes, le message est complet.">
      <svg viewBox="0 0 340 185" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Chronologie des trois signaux de satiété après le début d'un repas">
        {rangs.map((r) => (
          <g key={r.nom}>
            <text x="104" y={r.y + 11} textAnchor="end" style={{ ...styleEtiquette, fill: palette.texte }}>
              {r.nom}
            </text>
            {r.rampe !== undefined && (
              <rect x={x(r.debut)} y={r.y} width={x(r.rampe) - x(r.debut)} height="15" rx="2"
                fill={r.couleur} opacity="0.35" />
            )}
            <rect x={x(r.rampe ?? r.debut)} y={r.y} width={x(r.plein) - x(r.rampe ?? r.debut)}
              height="15" rx="2" fill={r.couleur} />
            {r.fondu < 60 && (
              <rect x={x(r.plein)} y={r.y} width={x(r.fondu) - x(r.plein)} height="15" rx="2"
                fill={r.couleur} opacity="0.35" />
            )}
          </g>
        ))}
        <line x1={x(20)} x2={x(20)} y1="22" y2="152" stroke={palette.texteFaible}
          strokeWidth="1.2" strokeDasharray="4 4" />
        <text x={x(20)} y="16" textAnchor="middle" style={stylePetit}>≈ 20 min</text>
        {[0, 15, 30, 45, 60].map((t) => (
          <text key={t} x={x(t)} y="172" textAnchor="middle" style={stylePetit}>{t} min</text>
        ))}
      </svg>
    </Figure>
  )
}

/** Deux durées de repas face au délai du signal d'arrêt. */
export function FigureVitesse() {
  const x = (min: number) => 30 + (min / 35) * 288

  return (
    <Figure legende="Deux repas identiques, l'un expédié, l'autre étalé. Le signal d'arrêt est complet vers vingt minutes : le repas rapide est terminé avant qu'il ait parlé, le repas lent le rencontre en chemin.">
      <svg viewBox="0 0 340 158" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Durée de deux repas comparée au délai du signal d'arrêt">
        <text x={x(0)} y="42" style={{ ...styleEtiquette, fill: palette.rouge }}>
          repas en dix minutes
        </text>
        <rect x={x(0)} y="48" width={x(10) - x(0)} height="15" rx="2" fill={palette.rouge} />
        <text x={x(0)} y="98" style={{ ...styleEtiquette, fill: palette.vert }}>
          repas en trente minutes
        </text>
        <rect x={x(0)} y="104" width={x(30) - x(0)} height="15" rx="2" fill={palette.vert} />
        <line x1={x(20)} x2={x(20)} y1="24" y2="126" stroke={palette.texteFaible}
          strokeWidth="1.2" strokeDasharray="4 4" />
        <text x={x(20)} y="16" textAnchor="middle" style={stylePetit}>≈ 20 min : signal complet</text>
        {[0, 10, 20, 30].map((t) => (
          <text key={t} x={x(t)} y="144" textAnchor="middle" style={stylePetit}>{t} min</text>
        ))}
      </svg>
    </Figure>
  )
}

/** La glycémie après un repas vite absorbé et après un repas amorti. */
export function FigureGlycemie() {
  const x = (min: number) => 42 + (min / 180) * 278
  const y = (v: number) => 96 - v * 52
  const trace = (points: [number, number][]) =>
    points.map(([t, v], i) => `${i === 0 ? 'M' : 'L'}${x(t).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  const rapide: [number, number][] = [
    [0, 0], [15, 0.55], [35, 1], [55, 0.72], [80, 0.15], [105, -0.4], [125, -0.52], [150, -0.28], [180, -0.05],
  ]
  const amortie: [number, number][] = [
    [0, 0], [20, 0.25], [45, 0.42], [75, 0.38], [110, 0.22], [145, 0.08], [180, 0],
  ]

  return (
    <Figure legende="Allure de la glycémie après deux repas. Le repas vite absorbé monte haut puis passe sous le niveau de départ : c'est ce creux qui appelle la fringale. Le repas amorti — fibres, protéines, aliments entiers — dessine une vague sans creux.">
      <svg viewBox="0 0 340 170" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Glycémie comparée après un repas vite absorbé et un repas amorti">
        <line x1="42" x2="320" y1={y(0)} y2={y(0)} stroke={palette.piste} strokeWidth="1" />
        <text x="36" y={y(0) + 3} textAnchor="end" style={stylePetit}>départ</text>
        <path d={trace(rapide)} fill="none" stroke={identites.glycemie.couleur} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={trace(amortie)} fill="none" stroke={palette.violetClair} strokeWidth="2.5"
          strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
        <text x={x(30)} y={y(1.02) - 6} style={{ ...styleEtiquette, fill: identites.glycemie.couleur }}>
          repas vite absorbé
        </text>
        <text x={x(88)} y={y(0.46) - 6} style={{ ...styleEtiquette, fill: palette.violetClair }}>
          repas amorti
        </text>
        <text x={x(125)} y={y(-0.52) + 16} textAnchor="middle" style={{ ...stylePetit, fill: identites.glycemie.couleur }}>
          le creux
        </text>
        {[0, 60, 120, 180].map((t) => (
          <text key={t} x={x(t)} y="162" textAnchor="middle" style={stylePetit}>
            {t === 0 ? '0' : t === 60 ? '1 h' : t === 120 ? '2 h' : '3 h'}
          </text>
        ))}
      </svg>
    </Figure>
  )
}

/** À enregistrer dans les rendus MDX, lecture comme spread. */
export const composantsFigures = {
  Figure,
  FigureVidange,
  FigureSignaux,
  FigureVitesse,
  FigureGlycemie,
}
