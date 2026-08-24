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
    courbeLissee(points.map(([t, p]) => [x(t), y(p)] as [number, number]))

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

/**
 * Ce qui s'accumule pendant un repas jusqu'à ce qu'on s'arrête.
 *
 * Le point de la figure : le rassasiement n'est pas un interrupteur qu'un
 * signal actionnerait. C'est une somme. Les trois apports s'empilent, la
 * courbe du dessus est leur total, et c'est ce total qui doit atteindre un
 * certain niveau pour que le repas s'arrête. Un seul des trois n'y suffit
 * jamais — et le volume, lui, se retire en route.
 *
 * Les allures sont schématiques : aucune de ces contributions ne se mesure
 * en unités, la légende le dit.
 */
export function FigureSignaux() {
  const x = (min: number) => 42 + (min / 60) * 268
  const y = (part: number) => 150 - part * 98

  /* Le volume monte dès la première bouchée, puis reflue avec la vidange. */
  const volume = (t: number) =>
    t <= 25 ? 0.45 * Math.min(1, t / 10) ** 0.85 : 0.45 - ((t - 25) / 35) * 0.23

  /* Les hormones intestinales attendent que la digestion commence. */
  const hormones = (t: number) =>
    t <= 8 ? 0 : t >= 30 ? 0.45 : 0.45 * ((t - 8) / 22) ** 1.1

  /* L'absorption confirme, en dernier. */
  const absorption = (t: number) => (t <= 25 ? 0 : 0.3 * ((t - 25) / 35) ** 1.2)

  const cumuls = [
    () => 0,
    volume,
    (t: number) => volume(t) + hormones(t),
    (t: number) => volume(t) + hormones(t) + absorption(t),
  ]

  const instants = Array.from({ length: 49 }, (_, i) => (i * 60) / 48)

  const aire = (bas: (t: number) => number, haut: (t: number) => number) => {
    const dessus = instants.map((t) => `${x(t).toFixed(1)} ${y(haut(t)).toFixed(1)}`)
    const dessous = [...instants].reverse().map((t) => `${x(t).toFixed(1)} ${y(bas(t)).toFixed(1)}`)
    return `M${dessus.join(' L')} L${dessous.join(' L')} Z`
  }

  const total = cumuls[3]
  /* Le niveau où le total suffit : atteint vers vingt minutes. */
  const seuil = total(20)

  const couches = [
    { nom: 'le volume', couleur: identites.volume.couleur, bas: cumuls[0], haut: cumuls[1] },
    { nom: 'les hormones', couleur: identites.satiete.couleur, bas: cumuls[1], haut: cumuls[2] },
    { nom: "l'absorption", couleur: identites.energie.couleur, bas: cumuls[2], haut: cumuls[3] },
  ]

  return (
    <Figure legende="Ce qui s'accumule après la première bouchée : les trois apports s'empilent, la ligne du dessus est leur total. On ne s'arrête ni au premier ni au dernier, mais quand la somme atteint le niveau suffisant. Allures schématiques.">
      <svg viewBox="0 0 340 190" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Les trois contributions au signal d'arrêt s'additionnent et atteignent le niveau suffisant vers vingt minutes">
        {couches.map((c) => (
          <path key={c.nom} d={aire(c.bas, c.haut)} fill={c.couleur} opacity="0.9" />
        ))}

        {/* Le total : c'est lui qui décide. */}
        <path
          d={`M${instants.map((t) => `${x(t).toFixed(1)} ${y(total(t)).toFixed(1)}`).join(' L')}`}
          fill="none"
          stroke={palette.texte}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Le niveau suffisant, et le moment où le total l'atteint. */}
        <line x1={x(0)} x2={x(60)} y1={y(seuil)} y2={y(seuil)} stroke={palette.texte}
          strokeWidth="1" strokeDasharray="5 4" />
        <text x={x(1)} y={y(seuil) - 17} style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
          assez pour
        </text>
        <text x={x(1)} y={y(seuil) - 7} style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
          s&rsquo;arrêter
        </text>
        <line x1={x(20)} x2={x(20)} y1="42" y2="150" stroke={palette.texte}
          strokeWidth="1" strokeDasharray="5 4" />
        <text x={x(20)} y="36" textAnchor="middle" style={{ ...stylePetit, fill: palette.texte }}>
          ≈ 20 min
        </text>
        <circle cx={x(20)} cy={y(seuil)} r="3.5" fill={palette.texte} />

        {/* Les étiquettes vivent dans les bandes : pas de légende à décoder. */}
        <text x={x(41)} y={y(volume(41) / 2) + 3} textAnchor="middle"
          style={{ ...styleEtiquette, fill: '#FFFFFF' }}>
          le volume
        </text>
        <text x={x(45)} y={y((cumuls[1](45) + cumuls[2](45)) / 2) + 3} textAnchor="middle"
          style={{ ...styleEtiquette, fill: '#FFFFFF' }}>
          les hormones
        </text>
        <text x={x(52)} y={y((cumuls[2](52) + cumuls[3](52)) / 2) + 3} textAnchor="middle"
          style={{ ...styleEtiquette, fill: palette.texte }}>
          l&rsquo;absorption
        </text>

        {/* Ce que mesure la hauteur, écrit une fois pour toutes. */}
        <text x="14" y="101" textAnchor="middle" transform="rotate(-90 14 101)"
          style={{ ...stylePetit, fontSize: 9 }}>
          force du message d&rsquo;arrêt
        </text>

        <line x1={x(0)} x2={x(60)} y1="150" y2="150" stroke={palette.texteFaible} strokeWidth="1" />
        {[0, 15, 30, 45, 60].map((t) => (
          <text key={t} x={x(t)} y="164" textAnchor="middle" style={stylePetit}>
            {t} min
          </text>
        ))}
        <text x={x(0)} y="180" textAnchor="start" style={{ ...stylePetit, fill: palette.texte }}>
          première bouchée
        </text>
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

/**
 * Passe une courbe lisse par des points, sans les trahir.
 *
 * Une ligne brisée donne des angles là où le corps n'en fait pas. La spline
 * de Catmull-Rom, convertie en Bézier, passe exactement par chaque point
 * mesuré tout en arrondissant le trajet entre deux.
 */
function courbeLissee(points: [number, number][]): string {
  const p = points
  if (p.length < 3) return `M${p.map(([a, b]) => `${a} ${b}`).join(' L')}`

  let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`
  for (let i = 0; i < p.length - 1; i++) {
    const avant = p[i - 1] ?? p[i]
    const de = p[i]
    const vers = p[i + 1]
    const apres = p[i + 2] ?? vers
    const c1 = [de[0] + (vers[0] - avant[0]) / 6, de[1] + (vers[1] - avant[1]) / 6]
    const c2 = [vers[0] - (apres[0] - de[0]) / 6, vers[1] - (apres[1] - de[1]) / 6]
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${vers[0].toFixed(1)} ${vers[1].toFixed(1)}`
  }
  return d
}

/**
 * La glycémie après un repas vite absorbé et après un repas amorti.
 *
 * Les deux courbes décrivent la même grandeur : les distinguer relève donc
 * du registre de valeur, pas de celui de l'identité — l'une porte un
 * verdict à surveiller, l'autre un verdict favorable. La couleur ne suffit
 * pas (rouge et vert sont précisément la paire que le daltonisme confond) :
 * chaque courbe porte son nom, et l'amortie est tiretée.
 */
export function FigureGlycemie() {
  const x = (min: number) => 64 + (min / 180) * 250
  const y = (v: number) => 88 - v * 52

  const rapide: [number, number][] = [
    [0, 0], [15, 0.55], [35, 1], [55, 0.72], [80, 0.15], [105, -0.4], [125, -0.52], [150, -0.28], [180, -0.05],
  ]
  const amortie: [number, number][] = [
    [0, 0], [20, 0.25], [45, 0.42], [75, 0.38], [110, 0.22], [145, 0.08], [180, 0],
  ]

  const enPoints = (pts: [number, number][]) =>
    pts.map(([t, v]) => [x(t), y(v)] as [number, number])

  const traceRapide = courbeLissee(enPoints(rapide))
  /* Le creux, teinté : c'est lui le sujet de la page. */
  const aireRapide = `${traceRapide} L${x(180).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`

  return (
    <Figure legende="Allure de la glycémie après deux repas, à partir du même niveau de départ. Le repas vite absorbé monte haut, puis repasse sous ce niveau : la zone teintée est le creux, et c'est lui qui appelle la fringale. Le repas amorti — fibres, protéines, aliments entiers — dessine une vague qui ne descend jamais sous la ligne.">
      <svg viewBox="0 0 340 176" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Glycémie comparée après un repas vite absorbé et un repas amorti, de part et d'autre du niveau de départ">
        <defs>
          <clipPath id="glycemie-sous-depart">
            <rect x={x(0)} y={y(0)} width={x(180) - x(0)} height="60" />
          </clipPath>
        </defs>

        <path d={aireRapide} fill={palette.rouge} opacity="0.16"
          clipPath="url(#glycemie-sous-depart)" />

        {/* La référence : sans elle, « passer en dessous » ne se voit pas. */}
        <line x1={x(0)} x2={x(180)} y1={y(0)} y2={y(0)} stroke={palette.texteFaible} strokeWidth="1.2" />
        <text x={x(0) - 6} y={y(0) - 3} textAnchor="end" style={{ ...stylePetit, fontSize: 9 }}>
          niveau
        </text>
        <text x={x(0) - 6} y={y(0) + 7} textAnchor="end" style={{ ...stylePetit, fontSize: 9 }}>
          de départ
        </text>

        <path d={courbeLissee(enPoints(amortie))} fill="none" stroke={palette.vert} strokeWidth="2.5"
          strokeDasharray="7 5" strokeLinecap="round" />
        <path d={traceRapide} fill="none" stroke={palette.rouge} strokeWidth="2.5" strokeLinecap="round" />

        <text x={x(35)} y={y(1) - 8} textAnchor="middle" style={{ ...styleEtiquette, fill: palette.rouge }}>
          repas vite absorbé
        </text>
        <text x={x(112)} y={y(0.22) - 8} style={{ ...styleEtiquette, fill: palette.vert }}>
          repas amorti
        </text>
        <text x={x(125)} y={y(-0.52) + 15} textAnchor="middle"
          style={{ ...stylePetit, fill: palette.rouge }}>
          le creux
        </text>

        {[0, 60, 120, 180].map((t) => (
          <text key={t} x={x(t)} y="168" textAnchor="middle" style={stylePetit}>
            {t === 0 ? '0' : t === 60 ? '1 h' : t === 120 ? '2 h' : '3 h'}
          </text>
        ))}
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Le face-à-face des deux hormones de la faim                        */
/* ------------------------------------------------------------------ */

/**
 * Un volet occupe une page de la double page : la ghréline à gauche, la
 * leptine à droite. `nouvellePage` pousse le second volet en tête de la
 * colonne suivante — c'est-à-dire sur la page de droite dans le spread, et
 * sur la page suivante dans le simulateur. En lecture continue, les deux
 * volets s'empilent simplement.
 *
 * Les deux volets sont bâtis à l'identique — même schéma, même courbe, même
 * ligne de lecture — pour que la seule différence visible soit celle qui
 * compte : le sens dans lequel l'hormone bouge quand la faim monte.
 */
type NomHormone = 'ghreline' | 'leptine'

/** L'organe qui produit l'hormone. Esquisse, à remplacer par le picto final. */
function SchemaOrgane({ hormone }: { hormone: NomHormone }) {
  const couleur = identites[hormone].couleur

  return (
    <svg viewBox="0 0 90 70" style={{ width: '3.4em', height: '2.6em', flex: 'none' }} role="img"
      aria-label={hormone === 'ghreline' ? "L'estomac" : 'Le tissu adipeux'}>
      {hormone === 'ghreline' ? (
        <path
          d="M34 8 C31 18 28 22 24 28 C16 40 20 56 36 61 C54 66 71 55 71 41 C71 28 61 22 52 20 C47 19 45 14 45 8"
          fill={palette.piste}
          stroke={couleur}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <g stroke={couleur} strokeWidth="2.5" fill={palette.piste}>
          {[
            [30, 24, 13], [55, 20, 11], [69, 38, 10],
            [26, 45, 12], [48, 44, 13], [64, 58, 9],
          ].map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      )}
    </svg>
  )
}

/** L'allure de l'hormone, et le moment où la faim monte. */
function CourbeHormone({ hormone }: { hormone: NomHormone }) {
  const couleur = identites[hormone].couleur

  // La ghréline : trois vagues dans la journée, un sommet = un appel.
  // La leptine : un niveau lent qui suit les réserves, un creux = un appel.
  const points: [number, number][] =
    hormone === 'ghreline'
      ? [[0, 0.28], [8, 0.86], [14, 0.2], [26, 0.24], [34, 0.9], [40, 0.18],
         [54, 0.26], [62, 0.82], [70, 0.16], [82, 0.22], [100, 0.3]]
      : [[0, 0.74], [18, 0.78], [34, 0.72], [50, 0.6], [66, 0.3],
         [78, 0.16], [88, 0.14], [100, 0.2]]

  const x = (t: number) => 8 + (t / 100) * 284
  const y = (v: number) => 58 - v * 44
  const d = courbeLissee(points.map(([t, v]) => [x(t), y(v)] as [number, number]))

  // Le repère : le sommet pour la ghréline, le creux pour la leptine.
  const repere = hormone === 'ghreline' ? [34, 0.9] : [88, 0.14]

  return (
    <svg viewBox="0 0 300 78" style={{ width: '86%', height: 'auto', display: 'block' }} role="img"
      aria-label={
        hormone === 'ghreline'
          ? 'La ghréline monte par vagues avant les repas'
          : 'La leptine baisse quand les réserves baissent'
      }>
      <line x1="8" x2="292" y1="62" y2="62" stroke={palette.piste} strokeWidth="1" />
      <path d={d} fill="none" stroke={couleur} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(repere[0])} cy={y(repere[1])} r="3" fill={couleur} />
      <text
        x={x(repere[0]) + (hormone === 'ghreline' ? 6 : 0)}
        y={y(repere[1]) + (hormone === 'ghreline' ? 1 : 14)}
        textAnchor={hormone === 'ghreline' ? 'start' : 'middle'}
        style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}
      >
        faim
      </text>
      <text x="8" y="74" style={{ ...stylePetit, fontSize: 8 }}>
        {hormone === 'ghreline' ? 'sur une journée' : 'sur des semaines'}
      </text>
    </svg>
  )
}

export function Volet({
  hormone,
  origine,
  regle,
  nouvellePage,
  children,
}: {
  hormone: NomHormone
  /** L'organe qui la produit, en deux mots. */
  origine: string
  /** La ligne de lecture : dans quel sens elle bouge quand la faim monte. */
  regle: string
  nouvellePage?: boolean
  children: React.ReactNode
}) {
  const { couleur, libelle } = identites[hormone]

  return (
    <section style={{ breakBefore: nouvellePage ? 'column' : 'auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6em',
          paddingBottom: '0.4em',
          borderBottom: `2px solid ${couleur}`,
          breakInside: 'avoid',
          breakAfter: 'avoid',
        }}
      >
        <SchemaOrgane hormone={hormone} />
        <div>
          <div
            style={{
              fontFamily: polices.fiche,
              fontSize: '1.05em',
              fontWeight: 600,
              color: couleur,
              lineHeight: 1.1,
            }}
          >
            {libelle}
          </div>
          <div style={{ fontFamily: polices.chiffre, fontSize: '0.7em', color: palette.texteFaible }}>
            {origine}
          </div>
        </div>
      </div>

      <div style={{ margin: '0.5em 0 0.2em', breakInside: 'avoid' }}>
        <CourbeHormone hormone={hormone} />
      </div>

      <p
        style={{
          margin: '0 0 0.9em',
          fontFamily: polices.fiche,
          fontSize: '0.85em',
          fontWeight: 600,
          color: palette.texte,
          borderTop: `1px solid ${palette.piste}`,
          paddingTop: '0.4em',
          breakInside: 'avoid',
          breakAfter: 'avoid',
        }}
      >
        {regle}
      </p>

      {children}
    </section>
  )
}

/** À enregistrer dans les rendus MDX, lecture comme spread. */
export const composantsFigures = {
  Volet,
  Figure,
  FigureVidange,
  FigureSignaux,
  FigureVitesse,
  FigureGlycemie,
}
