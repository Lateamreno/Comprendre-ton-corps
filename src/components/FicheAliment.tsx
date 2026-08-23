import Image from 'next/image'
import type { Fiche } from '@/lib/aliments'
import { palette, polices, couleurPourSeuil, niveauPourSeuil } from '@/lib/tokens'
import { Picto } from '@/components/Picto'
import { Barre, Anneau, Courbe } from '@/components/Jauge'

/**
 * La fiche aliment, au rendu des maquettes validées.
 *
 * Elle ne contient aucune donnée : tout vient de `lireFiche()`, qui lit
 * Ciqual. Changer la portion ou le code dans le JSON change les chiffres,
 * les remplissages et les couleurs, sans toucher à ce fichier.
 */

const etiquette: React.CSSProperties = {
  fontFamily: polices.fiche,
  fontSize: 15,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: palette.texteFaible,
}

const valeur: React.CSSProperties = {
  fontFamily: polices.fiche,
  fontWeight: 700,
  fontSize: 46,
  lineHeight: 1,
  color: palette.texte,
  fontVariantNumeric: 'tabular-nums',
}

const unite: React.CSSProperties = {
  fontFamily: polices.fiche,
  fontWeight: 400,
  fontSize: 21,
  color: palette.texte,
}

const colonne: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 15,
  padding: '0 10px',
}

function mot(indice: number): string {
  const niveau = niveauPourSeuil('indiceGlycemique', indice)
  if (niveau === 'favorable') return 'DOUX'
  if (niveau === 'intermediaire') return 'MODÉRÉ'
  return 'ÉLEVÉ'
}

export function FicheAliment({ fiche }: { fiche: Fiche }) {
  const f = fiche
  const filet = `1px solid ${palette.piste}`

  const macros = [
    { cle: 'energie' as const, g: f.energie, libelle: 'Énergie' },
    { cle: 'proteines' as const, g: f.proteines, libelle: 'Protéines' },
    { cle: 'lipides' as const, g: f.lipides, libelle: 'Lipides' },
    { cle: 'glucides' as const, g: f.glucides, libelle: 'Glucides' },
    { cle: 'fibres' as const, g: f.fibres, libelle: 'Fibres' },
  ]

  return (
    <article
      style={{
        background: palette.fondCarte,
        borderRadius: 26,
        boxShadow: '0 2px 18px rgba(21,32,53,0.06)',
        padding: '26px 44px 40px',
        fontFamily: polices.fiche,
        color: palette.texte,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {f.image && (
          <Image src={f.image} alt="" aria-hidden="true" width={300} height={254}
                 style={{ objectFit: 'contain', height: 'auto' }} />
        )}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <h1
            style={{
              // globals.css impose Fraunces à tous les h1 : la fiche reprend la main.
              fontFamily: polices.fiche,
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: '0.05em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            {f.nom.toUpperCase()}
          </h1>
          <p style={{ ...etiquette, margin: 0, letterSpacing: '0.04em', textTransform: 'none', fontSize: 14 }}>
            {f.precision}
          </p>
          <div style={{ background: '#EDF7EA', borderRadius: 30, padding: '14px 46px', display: 'flex', gap: 26 }}>
            <span style={{ fontSize: 27, fontWeight: 600, color: palette.vert }}>
              {f.portion.grammes} G
            </span>
            {f.millilitresPour100Kcal !== null && (
              <>
                <span style={{ fontSize: 24, fontWeight: 300, color: '#A8D3AE' }}>|</span>
                <span style={{ fontSize: 27, fontWeight: 600, color: palette.vert }}>
                  {f.portion.libelle}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <div style={{ height: 1, background: palette.piste, margin: '26px 0 34px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {macros.map((m, i) => (
          <div key={m.cle} style={{ ...colonne, borderLeft: i === 0 ? 'none' : filet }}>
            <Picto grandeur={m.cle} />
            <Barre grandeur={m.cle} part={m.g.part} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={valeur}>{m.g.texte}</span>
              <span style={unite}>{m.g.unite}</span>
            </div>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              {m.cle === 'glucides' && f.partSucres !== null && (
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: couleurPourSeuil('ratioSucres', f.partSucres),
                  }}
                >
                  {f.sucres.texte} g
                </span>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={etiquette}>{m.libelle}</div>
              {m.cle === 'glucides' && f.partSucres !== null && (
                <div
                  style={{
                    ...etiquette,
                    fontSize: 13,
                    marginTop: 7,
                    color: couleurPourSeuil('ratioSucres', f.partSucres),
                  }}
                >
                  dont sucres — {Math.round(f.partSucres * 100)} %
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: palette.piste, margin: '34px 0 30px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div style={{ ...colonne, gap: 18 }}>
          <Anneau part={f.partJournee} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ ...valeur, color: palette.vert }}>
              {Math.round(f.partJournee * 100)}
            </span>
            <span style={{ ...unite, color: palette.vert }}>%</span>
          </div>
          <div style={{ ...etiquette, textTransform: 'none', letterSpacing: 0, fontSize: 19 }}>
            / 2 000 kcal
          </div>
          <div style={etiquette}>Journée</div>
        </div>

        <div style={{ ...colonne, gap: 18, borderLeft: filet }}>
          <Picto grandeur="volume" taille={132} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ ...valeur, color: palette.vert }}>
              {f.grammesPour100Kcal === null ? '—' : Math.round(f.grammesPour100Kcal)}
            </span>
            <span style={{ ...unite, color: palette.vert }}>g</span>
          </div>
          <div style={{ ...etiquette, textTransform: 'none', letterSpacing: 0, fontSize: 19 }}>
            {f.millilitresPour100Kcal === null
              ? 'pour 100 kcal'
              : `soit ${Math.round(f.millilitresPour100Kcal)} ml`}
          </div>
          <div style={etiquette}>Pour 100 kcal</div>
        </div>

        <div style={{ ...colonne, gap: 18, borderLeft: filet }}>
          <Picto grandeur="satiete" taille={132} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ ...valeur, color: palette.bleu }}>
              {f.energie.valeur === null || f.grammesPour100Kcal === null
                ? '—'
                : (f.energie.valeur / f.portion.grammes).toFixed(2).replace('.', ',')}
            </span>
            <span style={{ ...unite, color: palette.bleu }}>kcal/g</span>
          </div>
          <div style={{ ...etiquette, textTransform: 'none', letterSpacing: 0, fontSize: 19 }}>
            densité énergétique
          </div>
          <div style={etiquette}>Rassasiement</div>
        </div>

        <div style={{ ...colonne, gap: 18, borderLeft: filet }}>
          {f.indiceGlycemique ? (
            <>
              <Courbe indice={f.indiceGlycemique.valeur} />
              <span style={{ ...valeur, fontSize: 40, color: palette.violet }}>
                {mot(f.indiceGlycemique.valeur)}
              </span>
              <div style={{ ...etiquette, textTransform: 'none', letterSpacing: 0, fontSize: 19 }}>
                IG {f.indiceGlycemique.valeur}
              </div>
            </>
          ) : (
            <>
              <Picto grandeur="glycemie" taille={132} />
              <span style={{ ...valeur, fontSize: 34, color: palette.texteFaible }}>—</span>
              <div style={{ ...etiquette, textTransform: 'none', letterSpacing: 0, fontSize: 19 }}>
                non renseigné
              </div>
            </>
          )}
          <div style={etiquette}>Glycémie</div>
        </div>
      </div>

      <footer style={{ marginTop: 34, paddingTop: 16, borderTop: filet }}>
        <p style={{ ...etiquette, fontSize: 11, letterSpacing: '0.04em', textTransform: 'none', margin: 0, lineHeight: 1.7 }}>
          {f.nomCiqual} — {f.sources.join(' · ')}
        </p>
      </footer>
    </article>
  )
}
