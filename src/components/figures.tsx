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

/** À enregistrer dans les rendus MDX, lecture comme spread. */
export const composantsFigures = { Figure, FigureVidange, FigureSignaux }
