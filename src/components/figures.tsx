import { couleurPourSeuil, identites, palette, polices } from '@/lib/tokens'

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
 * Ce qui s'accumule pendant un repas, puis se défait.
 *
 * Deux malentendus à écarter d'un coup. Le rassasiement n'est pas un
 * interrupteur qu'un signal actionnerait : c'est une somme, et c'est elle
 * qui doit atteindre un certain niveau. Et il n'est pas définitif : les
 * trois apports s'éteignent l'un après l'autre, la somme repasse sous le
 * niveau, et la faim revient. La fenêtre va donc jusqu'à trois heures, le
 * temps que le cycle se referme.
 *
 * Les allures sont schématiques : aucune de ces contributions ne se mesure
 * en unités, la légende le dit.
 */
export function FigureSignaux() {
  const x = (min: number) => 78 + (min / 180) * 234
  const y = (part: number) => 148 - part * 104

  /* Le volume monte dès la première bouchée, puis reflue avec la vidange. */
  const volume = (t: number) =>
    t <= 10 ? 0.45 * (t / 10) ** 0.85
      : t <= 25 ? 0.45
      : 0.45 * Math.exp(-(t - 25) / 70)

  /* Les hormones intestinales attendent que la digestion commence. */
  const hormones = (t: number) =>
    t <= 8 ? 0
      : t <= 30 ? 0.45 * ((t - 8) / 22) ** 1.1
      : t <= 90 ? 0.45
      : 0.45 * Math.exp(-(t - 90) / 80)

  /* L'absorption confirme en dernier, et s'éteint en dernier. */
  const absorption = (t: number) =>
    t <= 25 ? 0
      : t <= 70 ? 0.3 * ((t - 25) / 45) ** 1.2
      : t <= 130 ? 0.3
      : 0.3 * Math.exp(-(t - 130) / 60)

  const cumuls = [
    () => 0,
    volume,
    (t: number) => volume(t) + hormones(t),
    (t: number) => volume(t) + hormones(t) + absorption(t),
  ]
  const total = cumuls[3]

  /* Le niveau où la somme suffit : atteint vers vingt minutes. */
  const seuil = total(20)
  /* Et le moment où elle repasse dessous : la faim revient. */
  let retour = 180
  for (let m = 30; m <= 180; m += 0.5) {
    if (total(m) < seuil) { retour = m; break }
  }

  const instants = Array.from({ length: 91 }, (_, i) => (i * 180) / 90)

  const aire = (bas: (t: number) => number, haut: (t: number) => number) => {
    const dessus = instants.map((t) => `${x(t).toFixed(1)} ${y(haut(t)).toFixed(1)}`)
    const dessous = [...instants].reverse().map((t) => `${x(t).toFixed(1)} ${y(bas(t)).toFixed(1)}`)
    return `M${dessus.join(' L')} L${dessous.join(' L')} Z`
  }

  const couches = [
    { nom: 'le volume', couleur: identites.volume.couleur, bas: cumuls[0], haut: cumuls[1] },
    { nom: 'les hormones', couleur: identites.satiete.couleur, bas: cumuls[1], haut: cumuls[2] },
    { nom: "l'absorption", couleur: identites.energie.couleur, bas: cumuls[2], haut: cumuls[3] },
  ]

  const graduations: [number, string][] = [[0, '0'], [30, '30 min'], [60, '1 h'], [120, '2 h'], [180, '3 h']]

  return (
    <Figure legende="Ce qui s'accumule après la première bouchée : les trois apports s'empilent, la ligne noire est leur total. Le repas s'arrête quand ce total atteint le niveau du rassasiement, vers vingt minutes. Puis les trois s'éteignent l'un après l'autre : le total repasse sous le niveau, et la faim revient. Allures schématiques.">
      <svg viewBox="0 0 340 190" style={{ width: '88%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Les trois contributions au rassasiement s'additionnent, franchissent le niveau vers vingt minutes, puis s'éteignent et la faim revient">
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

        {/* Le niveau du rassasiement, franchi dans un sens puis dans l'autre. */}
        <line x1={x(0)} x2={x(180)} y1={y(seuil)} y2={y(seuil)} stroke={palette.texte}
          strokeWidth="1" strokeDasharray="5 4" />
        <text x={x(0) - 6} y={y(seuil) - 3} textAnchor="end" style={{ ...stylePetit, fontSize: 8, fill: palette.texte }}>
          niveau du
        </text>
        <text x={x(0) - 6} y={y(seuil) + 7} textAnchor="end" style={{ ...stylePetit, fontSize: 8, fill: palette.texte }}>
          rassasiement
        </text>

        {/* Les deux moments qui comptent, annoncés au-dessus du dessin. */}
        <line x1={x(20)} x2={x(20)} y1="30" y2="148" stroke={palette.texte}
          strokeWidth="1" strokeDasharray="5 4" />
        <circle cx={x(20)} cy={y(seuil)} r="3.5" fill={palette.texte} />
        <text x={x(20)} y="24" textAnchor="middle"
          style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
          on s&rsquo;arrête
        </text>

        <line x1={x(retour)} x2={x(retour)} y1="30" y2="148" stroke={palette.texte}
          strokeWidth="1" strokeDasharray="5 4" />
        <circle cx={x(retour)} cy={y(seuil)} r="3.5" fill={palette.texte} />
        <text x={x(retour)} y="24" textAnchor="middle"
          style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
          la faim revient
        </text>

        {/* Les étiquettes vivent dans les bandes : pas de légende à décoder. */}
        <text x={x(48)} y={y(volume(48) / 2) + 3} textAnchor="middle"
          style={{ ...styleEtiquette, fontSize: 10, fill: '#FFFFFF' }}>
          le volume
        </text>
        <text x={x(62)} y={y((cumuls[1](62) + cumuls[2](62)) / 2) + 3} textAnchor="middle"
          style={{ ...styleEtiquette, fontSize: 10, fill: '#FFFFFF' }}>
          les hormones
        </text>
        <text x={x(88)} y={y((cumuls[2](88) + cumuls[3](88)) / 2) + 3} textAnchor="middle"
          style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
          l&rsquo;absorption
        </text>

        {/* Ce que mesure la hauteur, écrit une fois pour toutes. */}
        <text x="10" y="96" textAnchor="middle" transform="rotate(-90 10 96)"
          style={{ ...stylePetit, fontSize: 8 }}>
          force du message d&rsquo;arrêt
        </text>

        <line x1={x(0)} x2={x(180)} y1="148" y2="148" stroke={palette.texteFaible} strokeWidth="1" />
        {graduations.map(([t, libelle]) => (
          <text key={t} x={x(t)} y="162" textAnchor="middle" style={stylePetit}>
            {libelle}
          </text>
        ))}
        <text x={(x(0) + x(180)) / 2} y="180" textAnchor="middle" style={{ ...stylePetit, fontSize: 9 }}>
          temps écoulé depuis la première bouchée
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

/**
 * Le trajet d'une bouchée, et l'endroit où le corps prélève.
 *
 * La largeur des segments n'est pas à l'échelle du temps : une bouche qui
 * mâche trente secondes disparaîtrait à côté d'un côlon qui travaille deux
 * jours. Les durées sont donc écrites, pas dessinées. Ce que la figure
 * montre à l'échelle, c'est la place de l'absorption : presque tout se joue
 * dans un seul des quatre segments.
 */
export function FigureTrajet() {
  const etapes = [
    { nom: 'La bouche', duree: '10 à 30 s', part: 0.18, absorbe: 'rien' },
    { nom: "L'estomac", duree: '2 à 4 h', part: 0.23, absorbe: 'presque rien' },
    { nom: "L'intestin grêle", duree: '3 à 5 h', part: 0.32, absorbe: 'presque tout', cle: true },
    { nom: 'Le côlon', duree: '12 à 48 h', part: 0.27, absorbe: "l'eau, et ce que" },
  ]

  const gauche = 8
  const large = 324
  let curseur = gauche

  return (
    <Figure legende="Le trajet d'une bouchée, du premier coup de dent au bout de l'intestin. Les largeurs ne sont pas à l'échelle du temps : les durées sont écrites. Ce qui compte est ailleurs : rien ne passe dans le sang avant l'intestin grêle, et presque tout y passe.">
      <svg viewBox="0 0 340 126" style={{ width: '96%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Les quatre étapes du trajet d'un aliment et ce qui est absorbé à chacune">
        {etapes.map((e) => {
          const l = large * e.part
          const x = curseur
          curseur += l
          const accent = e.cle ? palette.vert : palette.texteFaible
          return (
            <g key={e.nom}>
              <rect x={x + 1} y="34" width={l - 2} height="30" rx="2"
                fill={e.cle ? palette.vert : palette.piste} opacity={e.cle ? 0.16 : 1} />
              <rect x={x + 1} y="34" width={l - 2} height="30" rx="2"
                fill="none" stroke={accent} strokeWidth={e.cle ? 1.6 : 1} />
              <text x={x + l / 2} y="26" textAnchor="middle"
                style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
                {e.nom}
              </text>
              <text x={x + l / 2} y="53" textAnchor="middle" style={{ ...stylePetit, fontSize: 8.5, fill: palette.texte }}>
                {e.duree}
              </text>
              <text x={x + l / 2} y="82" textAnchor="middle"
                style={{ ...styleEtiquette, fontSize: 9, fill: accent }}>
                {e.absorbe}
              </text>
              {e.nom === 'Le côlon' && (
                <text x={x + l / 2} y="92" textAnchor="middle" style={{ ...styleEtiquette, fontSize: 9, fill: accent }}>
                  font les bactéries
                </text>
              )}
            </g>
          )
        })}

        <text x="170" y="118" textAnchor="middle" style={{ ...stylePetit, fontSize: 9 }}>
          ce qui passe dans le sang, étape par étape
        </text>
      </svg>
    </Figure>
  )
}

/**
 * Les deux réserves du corps, à la même échelle.
 *
 * Tout l'intérêt de la figure est dans la disproportion : dessinées avec la
 * même règle, la réserve de sucre est un trait et celle de gras occupe la
 * page. C'est pourquoi les deux barres partagent la même origine, et
 * pourquoi le glycogène n'est pas agrandi pour le rendre lisible.
 */
export function FigureReserves() {
  const gauche = 14
  const large = 300
  /* Ordres de grandeur pour un adulte de 70 kg à 20 % de masse grasse. */
  const gras = 110000
  const glycogene = 2000
  const l = (kcal: number) => Math.max((kcal / gras) * large, 2)

  return (
    <Figure legende="Les deux réserves d'un adulte de 70 kg, dessinées à la même échelle. Le sucre mis de côté tient dans un trait : il couvre moins d'une journée. Le gras couvre des semaines. Ordres de grandeur, pas mesures individuelles.">
      <svg viewBox="0 0 340 130" style={{ width: '94%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="La réserve de glycogène comparée à la réserve de graisse, à la même échelle">
        <text x={gauche} y="18" style={{ ...styleEtiquette, fontSize: 10, fill: identites.glucides.couleur }}>
          le glycogène, le sucre mis de côté
        </text>
        <rect x={gauche} y="24" width={l(glycogene)} height="16" rx="1" fill={identites.glucides.couleur} />
        <line x1={gauche + l(glycogene)} x2={gauche + 62} y1="32" y2="32"
          stroke={palette.texteFaible} strokeWidth="0.8" />
        <text x={gauche + 66} y="35" style={{ ...stylePetit, fontSize: 9 }}>
          ≈ 2 000 kcal, moins d&rsquo;une journée
        </text>

        <text x={gauche} y="68" style={{ ...styleEtiquette, fontSize: 10, fill: identites.lipides.couleur }}>
          le gras
        </text>
        <rect x={gauche} y="74" width={l(gras)} height="16" rx="1" fill={identites.lipides.couleur} />
        <text x={gauche + 6} y="86" style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
          ≈ 110 000 kcal, plusieurs semaines
        </text>

        <text x={gauche} y="114" style={{ ...stylePetit, fontSize: 9 }}>
          même échelle pour les deux barres
        </text>
      </svg>
    </Figure>
  )
}

/**
 * Ce que pèsent 200 kcal, selon l'aliment.
 *
 * Les barres sont à la même échelle et valent toutes la même énergie :
 * seule leur longueur, c'est-à-dire le poids qu'il faut manger, change. La
 * couleur vient des seuils de densité calorique de lib/tokens.ts, comme
 * sur les fiches — elle situe la densité, pas la qualité nutritionnelle,
 * et la légende le dit.
 */
export function FigureDeuxCents() {
  /* Poids nécessaires pour 200 kcal, calculés depuis Ciqual 2025. */
  const aliments = [
    { nom: 'Concombre', kcal100: 16.8, grammes: 1190 },
    { nom: 'Pomme', kcal100: 54, grammes: 370 },
    { nom: 'Riz cuit', kcal100: 155, grammes: 129 },
    { nom: 'Chips', kcal100: 532, grammes: 38 },
    { nom: "Huile d'olive", kcal100: 899, grammes: 22 },
  ]

  const gauche = 76
  const large = 196
  const max = aliments[0].grammes
  const y = (i: number) => 22 + i * 24

  return (
    <Figure legende="Le poids qu'il faut manger pour obtenir 200 kcal, aliment par aliment. Les cinq barres valent la même énergie ; seul le poids change, dans un rapport de plus de cinquante. La couleur situe la densité calorique selon les seuils du livre : elle ne dit rien de la qualité nutritionnelle d'un aliment. Source : Ciqual 2025.">
      <svg viewBox="0 0 340 140" style={{ width: '94%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Poids nécessaire pour 200 kcal, du concombre à l'huile d'olive">
        <text x="8" y="12" style={{ ...stylePetit, fontSize: 9 }}>
          200 kcal, c&rsquo;est ce poids d&rsquo;aliment :
        </text>
        {aliments.map((a, i) => {
          const couleur = couleurPourSeuil('densiteEnergetique', a.kcal100)
          const l = Math.max((a.grammes / max) * large, 3)
          return (
            <g key={a.nom}>
              <text x={gauche - 6} y={y(i) + 11} textAnchor="end"
                style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
                {a.nom}
              </text>
              <rect x={gauche} y={y(i)} width={l} height="14" rx="1" fill={couleur} />
              <text x={gauche + l + 6} y={y(i) + 11}
                style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
                {a.grammes >= 1000
                  ? `${(a.grammes / 1000).toFixed(2).replace('.', ',')} kg`
                  : `${a.grammes} g`}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/**
 * Les trois macronutriments comparés sur ce qui les distingue vraiment.
 *
 * L'énergie par gramme est la donnée que tout le monde connaît ; le coût
 * digestif est celle que personne ne regarde, et c'est pourtant elle qui
 * fait qu'un même nombre de calories ne se vaut pas d'un nutriment à
 * l'autre. Les deux sont donc mis côte à côte.
 */
export function FigureMacros() {
  const macros = [
    { nom: 'Protéines', kcal: 4, cout: '20 à 30 %', couleur: identites.proteines.couleur },
    { nom: 'Glucides', kcal: 4, cout: '5 à 10 %', couleur: identites.glucides.couleur },
    { nom: 'Lipides', kcal: 9, cout: '0 à 3 %', couleur: identites.lipides.couleur },
  ]

  const gauche = 66
  const large = 118
  const y = (i: number) => 30 + i * 28

  return (
    <Figure legende="Pour chaque macronutriment : l'énergie contenue dans un gramme, et la part de cette énergie que la digestion consomme pour le traiter. Les protéines coûtent cher à digérer, les lipides presque rien. Ordres de grandeur mesurés sur des repas complets.">
      <svg viewBox="0 0 340 122" style={{ width: '94%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Énergie par gramme et coût digestif des trois macronutriments">
        <text x={gauche} y="18" style={{ ...stylePetit, fontSize: 8 }}>
          énergie par gramme
        </text>
        <text x="248" y="18" style={{ ...stylePetit, fontSize: 8 }}>
          coût digestif
        </text>
        {macros.map((m, i) => (
          <g key={m.nom}>
            <text x={gauche - 6} y={y(i) + 11} textAnchor="end"
              style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
              {m.nom}
            </text>
            <rect x={gauche} y={y(i)} width={(m.kcal / 9) * large} height="14" rx="1" fill={m.couleur} />
            <text x={gauche + (m.kcal / 9) * large + 6} y={y(i) + 11}
              style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
              {m.kcal} kcal
            </text>
            <text x="248" y={y(i) + 11} style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
              {m.cout}
            </text>
          </g>
        ))}
        <line x1="240" x2="240" y1="24" y2="112" stroke={palette.piste} strokeWidth="1" />
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

/**
 * L'allure de l'hormone, et le moment où la faim monte.
 *
 * Les deux courbes ne se lisent pas sur le même axe, et c'est le fond du
 * sujet : la ghréline se lit sur les heures d'une journée, la leptine sur
 * l'état des réserves. L'une suit l'horloge, l'autre suit le gras.
 */
function CourbeHormone({ hormone }: { hormone: NomHormone }) {
  const couleur = identites[hormone].couleur
  const ghreline = hormone === 'ghreline'

  /*
   * Ghréline : trois vagues avant les trois repas, sur la journée.
   * Leptine : elle suit la masse grasse, lue de 100 % à gauche vers 0 à
   * droite — plus les réserves fondent, plus le relevé baisse.
   */
  const points: [number, number][] = ghreline
    ? [[6, 0.30], [7.4, 0.86], [8.6, 0.20], [11, 0.26], [12.2, 0.90], [13.6, 0.18],
       [17, 0.30], [19.4, 0.84], [21, 0.16], [22, 0.22]]
    : [[100, 0.82], [80, 0.68], [60, 0.52], [40, 0.36], [20, 0.20], [8, 0.10], [0, 0.04]]

  const x = (u: number) =>
    ghreline ? 26 + ((u - 6) / 16) * 262 : 26 + ((100 - u) / 100) * 262
  const y = (v: number) => 58 - v * 44

  const d = courbeLissee(points.map(([u, v]) => [x(u), y(v)] as [number, number]))

  /* Le repère : le sommet de midi pour la ghréline, les réserves basses pour la leptine. */
  const repere: [number, number] = ghreline ? [12.2, 0.90] : [8, 0.10]

  const graduations: [number, string][] = ghreline
    ? [[8, '8 h'], [12, '12 h'], [16, '16 h'], [20, '20 h']]
    : [[100, '100 %'], [50, '50 %'], [0, '0']]

  return (
    <svg viewBox="0 0 300 96" style={{ width: '92%', height: 'auto', display: 'block' }} role="img"
      aria-label={
        ghreline
          ? 'La ghréline monte par vagues avant chaque repas de la journée'
          : 'La leptine baisse à mesure que les réserves de gras diminuent'
      }>
      <line x1="26" x2="288" y1="62" y2="62" stroke={palette.piste} strokeWidth="1" />
      <path d={d} fill="none" stroke={couleur} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(repere[0])} cy={y(repere[1])} r="3" fill={couleur} />
      <text
        x={x(repere[0]) + (ghreline ? 6 : 0)}
        y={y(repere[1]) + (ghreline ? 1 : -8)}
        textAnchor={ghreline ? 'start' : 'middle'}
        style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}
      >
        faim
      </text>

      {graduations.map(([u, libelle]) => (
        <text key={u} x={x(u)} y="74" textAnchor="middle" style={{ ...stylePetit, fontSize: 8 }}>
          {libelle}
        </text>
      ))}
      <text x="157" y="90" textAnchor="middle" style={{ ...stylePetit, fontSize: 8 }}>
        {ghreline ? 'heures de la journée' : 'réserves de gras'}
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

/**
 * Le même mécanisme, lu dans les deux sens.
 *
 * Le livre s'adresse à deux publics opposés, et un mécanisme n'a pas les
 * mêmes conséquences selon le côté d'où on le regarde. Ce bloc referme une
 * page en montrant les deux lectures côte à côte.
 *
 * Il décrit ce que le mécanisme rend possible ; il ne dit pas quoi faire.
 * C'est la règle du livre (CLAUDE.md §2.5) : pas de conseil, pas
 * d'injonction, pas d'adresse au lecteur. « La vague passe si rien ne la
 * nourrit » est une description ; « attendez vingt minutes » n'en est pas
 * une.
 */
export function DeuxSens({ perdre, prendre }: { perdre: string; prendre: string }) {
  const lignes: [string, string][] = [
    ['Pour perdre du poids', perdre],
    ['Pour en prendre', prendre],
  ]

  return (
    <aside
      style={{
        margin: '1.2em 0 0.4em',
        paddingTop: '0.5em',
        borderTop: `2px solid ${palette.texte}`,
        breakInside: 'avoid',
      }}
    >
      {lignes.map(([titre, texte], i) => (
        <p key={titre} style={{ margin: i === 0 ? 0 : '0.45em 0 0', textAlign: 'left' }}>
          <strong style={{ fontFamily: polices.fiche, fontWeight: 600 }}>{titre}. </strong>
          {texte}
        </p>
      ))}
    </aside>
  )
}

/** À enregistrer dans les rendus MDX, lecture comme spread. */
/**
 * La part d'eau des aliments, mise en regard de leur énergie.
 *
 * L'eau ne porte aucune calorie mais occupe le volume : c'est la même
 * grandeur que la densité calorique, lue par l'autre bout. La barre porte
 * la part d'eau, le nombre à droite l'énergie, et les deux vont en sens
 * inverse sans qu'aucune couleur n'ait à le dire.
 */
export function FigureEau() {
  /* Ciqual 2025, pour 100 g d'aliment. */
  const aliments = [
    { nom: 'Laitue', eau: 95.4, kcal: 15 },
    { nom: 'Pomme', eau: 85.4, kcal: 54 },
    { nom: 'Pomme de terre', eau: 78.3, kcal: 81 },
    { nom: 'Riz cuit', eau: 61.4, kcal: 155 },
    { nom: 'Emmental', eau: 39.1, kcal: 373 },
    { nom: 'Chips', eau: 1.4, kcal: 532 },
    { nom: "Huile d'olive", eau: 0.1, kcal: 899 },
  ]

  const gauche = 100
  const large = 138
  const y = (i: number) => 24 + i * 19

  return (
    <Figure legende="Pour cent grammes d'aliment : la part qui est de l'eau, et l'énergie que les cent grammes apportent. Les deux colonnes descendent et montent ensemble, en sens inverse. L'eau est ce qui occupe la place sans rien apporter. Source : Ciqual 2025.">
      <svg viewBox="0 0 340 168" style={{ width: '94%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Part d'eau et énergie de sept aliments courants, pour 100 g">
        <text x={gauche} y="14" style={{ ...stylePetit, fontSize: 9 }}>part d&rsquo;eau</text>
        <text x={gauche + large + 32} y="14" style={{ ...stylePetit, fontSize: 9 }}>
          énergie
        </text>
        {aliments.map((a, i) => {
          const l = Math.max((a.eau / 100) * large, 1)
          return (
            <g key={a.nom}>
              <text x={gauche - 6} y={y(i) + 10} textAnchor="end"
                style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
                {a.nom}
              </text>
              <rect x={gauche} y={y(i)} width={large} height="12" rx="1" fill={palette.piste} />
              <rect x={gauche} y={y(i)} width={l} height="12" rx="1" fill={palette.bleu} />
              <text x={gauche + l + 5} y={y(i) + 10}
                style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
                {`${a.eau.toFixed(0)} %`}
              </text>
              <text x={gauche + large + 74} y={y(i) + 10} textAnchor="end"
                style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
                {`${a.kcal} kcal`}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/**
 * L'indice glycémique face à la charge glycémique.
 *
 * Les deux grandeurs ne répondent pas à la même question : l'indice décrit
 * la vitesse d'un glucide, la charge ce qu'une portion réelle envoie
 * vraiment. Les mettre côte à côte est le seul moyen de montrer que la
 * pastèque et le pain blanc, voisins sur l'indice, n'ont rien à voir sur
 * la charge. Les deux échelles diffèrent : chacune porte la sienne.
 */
export function FigureIndiceCharge() {
  /* Atkinson et al. 2021 pour l'indice, tables 2008 pour la charge. */
  const aliments = [
    { nom: 'Pain blanc', portion: '30 g', ig: 75, cg: 11 },
    { nom: 'Pomme de terre', portion: '150 g', ig: 78, cg: 16 },
    { nom: 'Pastèque', portion: '120 g', ig: 76, cg: 4 },
    { nom: 'Riz blanc', portion: '150 g', ig: 73, cg: 29 },
    { nom: 'Pomme', portion: '120 g', ig: 36, cg: 5 },
    { nom: 'Lentilles', portion: '150 g', ig: 32, cg: 5 },
  ]

  const gauche = 100
  const largeIg = 74
  const debutCg = 204
  const largeCg = 76
  const maxCg = 30
  const y = (i: number) => 28 + i * 20

  return (
    <Figure legende="À gauche, l'indice glycémique : la vitesse à laquelle le glucide de l'aliment arrive dans le sang, sur une échelle de 0 à 100. À droite, la charge glycémique d'une portion courante : ce que cette portion envoie réellement. La pastèque et le pain blanc ont presque le même indice ; leurs portions n'envoient pas la même chose. Sources : tables internationales, 2008 et 2021.">
      <svg viewBox="0 0 340 162" style={{ width: '96%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Indice glycémique et charge glycémique de six aliments">
        <text x={gauche} y="13" style={{ ...stylePetit, fontSize: 9 }}>indice — vitesse</text>
        <text x={debutCg} y="13" style={{ ...stylePetit, fontSize: 9 }}>charge — portion</text>
        <text x={gauche} y="24" style={{ ...stylePetit, fontSize: 8 }}>0 à 100</text>
        <text x={debutCg} y="24" style={{ ...stylePetit, fontSize: 8 }}>0 à 30</text>
        {aliments.map((a, i) => {
          const li = (a.ig / 100) * largeIg
          const lc = (a.cg / maxCg) * largeCg
          return (
            <g key={a.nom}>
              <text x={gauche - 6} y={y(i) + 10} textAnchor="end"
                style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
                {a.nom}
              </text>
              <text x={gauche - 6} y={y(i) + 19} textAnchor="end"
                style={{ ...stylePetit, fontSize: 7.5 }}>
                {a.portion}
              </text>
              <rect x={gauche} y={y(i)} width={largeIg} height="12" rx="1" fill={palette.piste} />
              <rect x={gauche} y={y(i)} width={li} height="12" rx="1" fill={identites.glycemie.couleur} />
              <text x={gauche + largeIg + 5} y={y(i) + 10}
                style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
                {a.ig}
              </text>
              <rect x={debutCg} y={y(i)} width={largeCg} height="12" rx="1" fill={palette.piste} />
              <rect x={debutCg} y={y(i)} width={lc} height="12" rx="1" fill={palette.violetClair} />
              <text x={debutCg + largeCg + 5} y={y(i) + 10}
                style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
                {a.cg}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/**
 * Les sucres pour cent grammes, rangés en deux groupes.
 *
 * Le point de la page n'est pas qu'un cola est sucré — tout le monde le
 * sait — mais que des produits qu'on ne range pas dans les sucreries en
 * contiennent autant. Les deux groupes sont donc dessinés sur la même
 * échelle, et le morceau de sucre sert d'unité familière.
 */
export function FigureSucre() {
  /* Ciqual 2025, sucres totaux pour 100 g (100 ml pour le cola). */
  const attendus = [
    { nom: 'Cola', valeur: 10 },
    { nom: 'Compote de pomme', valeur: 22.6 },
    { nom: 'Biscuit au chocolat', valeur: 35.4 },
  ]
  const inattendus = [
    { nom: 'Yaourt aromatisé', valeur: 12.5 },
    { nom: 'Ketchup', valeur: 21.1 },
    { nom: 'Muesli croustillant', valeur: 21.5 },
    { nom: 'Sauce barbecue', valeur: 27.5 },
    { nom: 'Barre « équilibre »', valeur: 30.4 },
  ]

  const gauche = 116
  const large = 122
  const max = 36
  const ligne = (i: number) => 30 + i * 17

  const rang = (
    a: { nom: string; valeur: number },
    i: number,
  ) => {
    const l = Math.max((a.valeur / max) * large, 2)
    const morceaux = Math.round(a.valeur / 6)
    return (
      <g key={a.nom}>
        <text x={gauche - 6} y={ligne(i) + 9} textAnchor="end"
          style={{ ...styleEtiquette, fontSize: 9.5, fill: palette.texte }}>
          {a.nom}
        </text>
        <rect x={gauche} y={ligne(i)} width={large} height="11" rx="1" fill={palette.piste} />
        <rect x={gauche} y={ligne(i)} width={l} height="11" rx="1"
          fill={couleurPourSeuil('sucres', a.valeur)} />
        <text x={gauche + large + 6} y={ligne(i) + 9}
          style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
          {`${a.valeur.toFixed(1).replace('.', ',')} g`}
        </text>
        <text x={gauche + large + 44} y={ligne(i) + 9}
          style={{ ...stylePetit, fontSize: 8 }}>
          {`${morceaux} morceaux`}
        </text>
      </g>
    )
  }

  return (
    <Figure legende="Sucres totaux pour cent grammes de produit, cent millilitres pour le cola, convertis en morceaux de sucre de six grammes. En haut, les produits qu'on range spontanément dans les sucreries ; en bas, ceux qu'on n'y range pas. La couleur suit les seuils de l'étiquetage simplifié. Source : Ciqual 2025.">
      <svg viewBox="0 0 340 200" style={{ width: '97%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Teneur en sucres de huit produits, en grammes et en morceaux de sucre">
        <text x="8" y="14" style={{ ...styleEtiquette, fontSize: 9, fill: palette.texte }}>
          Ce qu&rsquo;on appelle sucré
        </text>
        {attendus.map((a, i) => rang(a, i))}
        <line x1="8" y1={ligne(3) + 2} x2="332" y2={ligne(3) + 2} stroke={palette.piste} strokeWidth="1" />
        <text x="8" y={ligne(3) + 16} style={{ ...styleEtiquette, fontSize: 9, fill: palette.texte }}>
          Ce qu&rsquo;on n&rsquo;appelle pas sucré
        </text>
        {inattendus.map((a, i) => rang(a, i + 4.6))}
      </svg>
    </Figure>
  )
}

/**
 * Les quatre postes de la dépense d'une journée.
 *
 * Une seule barre empilée, parce que le propos est une part d'un tout :
 * ce que le corps dépense sans rien faire domine, et la séance de sport,
 * qui occupe toute la place dans les esprits, occupe la plus petite part
 * du dessin. Les fourchettes sont écrites sous chaque segment, la couleur
 * ne portant ici qu'une distinction, pas une valeur.
 */
export function FigurePostes() {
  const postes = [
    { nom: 'Métabolisme de base', part: 62, plage: '60 à 70 %', couleur: palette.violet },
    { nom: 'Mouvement ordinaire', part: 20, plage: '15 à 30 %', couleur: palette.bleu },
    { nom: 'Digestion', part: 10, plage: '10 %', couleur: palette.jaune },
    { nom: 'Séances de sport', part: 8, plage: '0 à 10 %', couleur: palette.orange },
  ]

  const gauche = 12
  const large = 316
  const hauteur = 26
  const hautBarre = 24
  let curseur = gauche

  const segments = postes.map((p) => {
    const l = (p.part / 100) * large
    const x = curseur
    curseur += l
    return { ...p, x, l }
  })

  return (
    <Figure legende="La dépense d'une journée, répartie entre ses quatre postes, chez un adulte peu sportif. Les proportions varient d'une personne à l'autre : les fourchettes portées sous la barre sont celles que la littérature retient. Le poste le plus gros ne se ressent pas, et le plus petit est le seul qu'on décide.">
      <svg viewBox="0 0 340 120" style={{ width: '96%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Répartition de la dépense énergétique quotidienne en quatre postes">
        {segments.map((p) => (
          <rect key={p.nom} x={p.x} y={hautBarre} width={p.l} height={hauteur} fill={p.couleur} />
        ))}
        {segments.map((p, i) => {
          const colonne = i % 2
          const rang = Math.floor(i / 2)
          const xLeg = gauche + colonne * 168
          const yLeg = hautBarre + hauteur + 20 + rang * 22
          return (
            <g key={p.nom}>
              <rect x={xLeg} y={yLeg - 8} width="9" height="9" rx="1.5" fill={p.couleur} />
              <text x={xLeg + 14} y={yLeg}
                style={{ ...styleEtiquette, fontSize: 9.5, fill: palette.texte }}>
                {p.nom}
              </text>
              <text x={xLeg + 14} y={yLeg + 10} style={{ ...stylePetit, fontSize: 8 }}>
                {p.plage}
              </text>
            </g>
          )
        })}
        <text x={gauche} y="16" style={{ ...stylePetit, fontSize: 9 }}>
          une journée de dépense, de gauche à droite
        </text>
      </svg>
    </Figure>
  )
}

/**
 * Ce que consomment les organes au repos.
 *
 * La dépense de base n'est pas une propriété abstraite : c'est la somme de
 * ce que coûtent quelques organes, et la répartition explique pourquoi la
 * masse maigre pèse tant. Les barres sont proportionnelles à la part, et
 * chaque part est écrite.
 */
export function FigureOrganes() {
  /* Adulte de 70 kg, d'après les vitesses métaboliques spécifiques d'Elia. */
  const organes = [
    { nom: 'Muscles', part: 22, couleur: palette.vert },
    { nom: 'Foie', part: 21, couleur: palette.violet },
    { nom: 'Cerveau', part: 20, couleur: palette.bleu },
    { nom: 'Cœur', part: 9, couleur: palette.rouge },
    { nom: 'Reins', part: 8, couleur: palette.orange },
    { nom: 'Graisse', part: 4, couleur: palette.jaune },
    { nom: 'Tout le reste', part: 16, couleur: palette.piste },
  ]

  const gauche = 84
  const large = 176
  const y = (i: number) => 18 + i * 18

  return (
    <Figure legende="Part de la dépense au repos attribuable à chaque organe, chez un adulte de soixante-dix kilos. Trois organes qui pèsent moins de quatre kilos ensemble — foie, cerveau, cœur — consomment la moitié du total, tandis que quinze kilos de graisse en consomment un vingt-cinquième. Source : vitesses métaboliques spécifiques mesurées par organe.">
      <svg viewBox="0 0 340 148" style={{ width: '94%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Part de chaque organe dans la dépense au repos">
        {organes.map((o, i) => {
          const l = (o.part / 25) * large
          return (
            <g key={o.nom}>
              <text x={gauche - 6} y={y(i) + 10} textAnchor="end"
                style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
                {o.nom}
              </text>
              <rect x={gauche} y={y(i)} width={l} height="12" rx="1" fill={o.couleur} />
              <text x={gauche + l + 6} y={y(i) + 10}
                style={{ ...stylePetit, fontSize: 9, fill: palette.texte }}>
                {`${o.part} %`}
              </text>
            </g>
          )
        })}
      </svg>
    </Figure>
  )
}

/**
 * Ce que fait la synthèse protéique après une séance.
 *
 * Le propos de la page est que la croissance a lieu au repos, pas à
 * l'effort : la courbe doit donc montrer que la séance est un instant et
 * que l'adaptation est une plage de plusieurs jours. La zone au-dessus du
 * niveau de repos porte l'information, la ligne de repos sert de repère.
 */
export function FigureSynthese() {
  const x = (h: number) => 62 + (h / 72) * 250
  const y = (v: number) => 150 - v * 96

  /* Allures d'après les mesures de synthèse protéique post-effort. */
  const points: [number, number][] = [
    [0, 0.18], [3, 0.72], [10, 0.95], [24, 1], [36, 0.82],
    [48, 0.55], [60, 0.33], [72, 0.2],
  ]
  const tracesXY = points.map(([h, v]) => [x(h), y(v)] as [number, number])
  const courbe = courbeLissee(tracesXY)
  const aire = `${courbe} L${x(72).toFixed(1)} ${y(0.18).toFixed(1)} L${x(0).toFixed(1)} ${y(0.18).toFixed(1)} Z`

  return (
    <Figure legende="Vitesse à laquelle le muscle fabrique de la protéine, après une séance de renforcement. La séance est l'instant zéro ; la fabrication monte pendant les heures qui suivent, culmine vers vingt-quatre heures et reste au-dessus du niveau de repos pendant un à trois jours. Toute la zone teintée se déroule après la séance, à l'arrêt. Allure schématique d'après les mesures publiées.">
      <svg viewBox="0 0 340 186" style={{ width: '84%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Synthèse protéique élevée pendant un à trois jours après une séance">
        <path d={aire} fill={identites.proteines.couleur} fillOpacity="0.16" />
        <line x1={x(0)} y1={y(0.18)} x2={x(72)} y2={y(0.18)} stroke={palette.texteFaible}
          strokeWidth="0.8" strokeDasharray="3 3" />
        <text x={x(72) + 4} y={y(0.18) + 3} style={{ ...stylePetit, fontSize: 8 }}>repos</text>
        <path d={courbe} fill="none" stroke={identites.proteines.couleur} strokeWidth="2.4"
          strokeLinecap="round" strokeLinejoin="round" />

        <line x1={x(0)} y1={y(1.06)} x2={x(0)} y2={y(0.02)} stroke={palette.texte} strokeWidth="1.2" />
        <text x={x(0)} y={y(1.06) - 5} textAnchor="middle"
          style={{ ...styleEtiquette, fontSize: 9, fill: palette.texte }}>
          la séance
        </text>

        <text x={x(5)} y={y(0.3)} style={{ ...styleEtiquette, fontSize: 9.5, fill: palette.texte }}>
          le muscle se construit ici
        </text>

        {[0, 24, 48, 72].map((h) => (
          <g key={h}>
            <line x1={x(h)} y1={y(0.02)} x2={x(h)} y2={y(0.02) + 4} stroke={palette.texteFaible} strokeWidth="0.8" />
            <text x={x(h)} y={y(0.02) + 15} textAnchor="middle" style={{ ...stylePetit, fontSize: 9 }}>
              {h === 0 ? '0' : `${h} h`}
            </text>
          </g>
        ))}
        <text x={x(36)} y={y(0.02) + 29} textAnchor="middle" style={{ ...stylePetit, fontSize: 8 }}>
          temps écoulé depuis la séance
        </text>
        <text x="16" y={y(0.05)} style={{ ...stylePetit, fontSize: 8 }} transform={`rotate(-90 16 ${y(0.05)})`}>
          fabrication de protéine
        </text>
      </svg>
    </Figure>
  )
}

/**
 * Le volume hebdomadaire et ce qu'il rapporte.
 *
 * Trois barres suffisent : la relation est graduelle, connue, et c'est
 * son caractère graduel qui est le message — il n'y a pas de seuil
 * magique, il y a une pente.
 */
export function FigureVolume() {
  /* Méta-analyse dose-réponse du volume hebdomadaire par groupe musculaire. */
  const paliers = [
    { nom: 'Moins de 5 séries', gain: 5.4 },
    { nom: '5 à 9 séries', gain: 6.6 },
    { nom: '10 séries et plus', gain: 9.8 },
  ]

  const gauche = 118
  const large = 150
  const max = 11
  const y = (i: number) => 34 + i * 30

  return (
    <Figure legende="Gain de masse musculaire mesuré selon le nombre de séries hebdomadaires consacrées à un même groupe musculaire, d'après la méta-analyse de référence. La relation est graduelle : il n'existe pas de seuil au-delà duquel tout se déclenche. Les pourcentages sont des moyennes d'essais de durées variables ; l'ordre compte plus que la valeur.">
      <svg viewBox="0 0 340 130" style={{ width: '95%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Gain musculaire selon le volume hebdomadaire, en trois paliers">
        <text x={gauche} y="18" style={{ ...stylePetit, fontSize: 9 }}>
          gain de masse musculaire
        </text>
        {paliers.map((p, i) => (
          <g key={p.nom}>
            <text x={gauche - 8} y={y(i) + 12} textAnchor="end"
              style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
              {p.nom}
            </text>
            <rect x={gauche} y={y(i)} width={large} height="16" rx="1" fill={palette.piste} />
            <rect x={gauche} y={y(i)} width={(p.gain / max) * large} height="16" rx="1"
              fill={identites.proteines.couleur} />
            <text x={gauche + (p.gain / max) * large + 6} y={y(i) + 12}
              style={{ ...stylePetit, fontSize: 9.5, fill: palette.texte }}>
              {`+ ${p.gain.toFixed(1).replace('.', ',')} %`}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  )
}

/**
 * La « zone brûle-graisse », remise dans son contexte.
 *
 * Deux séances de même durée : l'une modérée, l'autre intense. La part
 * de graisse est bien plus élevée à basse intensité, et pourtant les
 * grammes de graisse consommés sont voisins, parce que le total est plus
 * grand de l'autre côté. Les deux barres sont donc empilées sur la même
 * échelle, et la part de graisse est écrite en clair sous chacune.
 */
export function FigureZoneBrulage() {
  const seances = [
    { nom: 'Effort modéré', total: 300, partGras: 0.6, exemple: 'marche rapide' },
    { nom: 'Effort intense', total: 500, partGras: 0.35, exemple: 'course' },
  ]

  const bas = 128
  const haut = 30
  const max = 520
  const largeur = 62
  const x = (i: number) => 96 + i * 132
  const y = (kcal: number) => bas - (kcal / max) * (bas - haut)

  return (
    <Figure legende="Deux séances de quarante-cinq minutes, chez un même adulte. À effort modéré, la graisse fournit une plus grande part de l'énergie ; à effort intense, une part plus faible d'un total plus grand. Les grammes de graisse consommés pendant la séance finissent voisins, et le total dépensé, lui, ne l'est pas. Ordres de grandeur.">
      <svg viewBox="0 0 340 172" style={{ width: '92%', height: 'auto', display: 'block', margin: '0 auto' }} role="img"
        aria-label="Énergie et part de graisse de deux séances d'intensités différentes">
        <line x1="70" y1={bas} x2="316" y2={bas} stroke={palette.texteFaible} strokeWidth="0.8" />
        {seances.map((s, i) => {
          const gras = s.total * s.partGras
          const hautTotal = y(s.total)
          const hautGras = y(gras)
          return (
            <g key={s.nom}>
              <rect x={x(i)} y={hautTotal} width={largeur} height={bas - hautTotal} rx="1"
                fill={identites.glucides.couleur} fillOpacity="0.35" />
              <rect x={x(i)} y={hautGras} width={largeur} height={bas - hautGras} rx="1"
                fill={identites.lipides.couleur} />
              <text x={x(i) + largeur / 2} y={hautTotal - 16} textAnchor="middle"
                style={{ ...styleEtiquette, fontSize: 10, fill: palette.texte }}>
                {s.nom}
              </text>
              <text x={x(i) + largeur / 2} y={hautTotal - 6} textAnchor="middle"
                style={{ ...stylePetit, fontSize: 8 }}>
                {s.exemple}
              </text>
              <text x={x(i) + largeur + 6} y={hautTotal + 10}
                style={{ ...stylePetit, fontSize: 8.5, fill: palette.texte }}>
                {`${s.total} kcal`}
              </text>
              <text x={x(i) + largeur + 6} y={hautGras + 11}
                style={{ ...stylePetit, fontSize: 8.5, fill: palette.texte }}>
                {`${Math.round(gras)} kcal`}
              </text>
              <text x={x(i) + largeur / 2} y={bas + 13} textAnchor="middle"
                style={{ ...stylePetit, fontSize: 8 }}>
                {`${Math.round(s.partGras * 100)} % de graisse`}
              </text>
            </g>
          )
        })}
        <g>
          <rect x="70" y="152" width="9" height="9" rx="1.5" fill={identites.lipides.couleur} />
          <text x="84" y="160" style={{ ...stylePetit, fontSize: 8.5, fill: palette.texte }}>
            venu de la graisse
          </text>
          <rect x="188" y="152" width="9" height="9" rx="1.5"
            fill={identites.glucides.couleur} fillOpacity="0.35" />
          <text x="202" y="160" style={{ ...stylePetit, fontSize: 8.5, fill: palette.texte }}>
            venu du reste
          </text>
        </g>
      </svg>
    </Figure>
  )
}

export const composantsFigures = {
  Volet,
  DeuxSens,
  Figure,
  FigureVidange,
  FigureTrajet,
  FigureReserves,
  FigureDeuxCents,
  FigureMacros,
  FigureSignaux,
  FigureVitesse,
  FigureGlycemie,
  FigureEau,
  FigureIndiceCharge,
  FigureSucre,
  FigurePostes,
  FigureOrganes,
  FigureSynthese,
  FigureVolume,
  FigureZoneBrulage,
}
