import { palette } from '@/lib/tokens'

/**
 * La marque : un anneau de pourcentage à moitié rempli.
 *
 * C'est la grammaire de jauge de la charte réduite à sa plus simple
 * expression — le vide en gris, le rempli dans la couleur de l'échelle.
 * Aucune valeur n'est écrite ici : tout vient de lib/tokens.ts.
 *
 * Dessiné en boîtes plutôt qu'en tracé SVG pour rester rendu par Satori,
 * qui produit les icônes au build.
 */
export function Anneau({ taille }: { taille: number }) {
  const marge = Math.round(taille * 0.125)
  const diametre = taille - marge * 2
  const trait = Math.max(2, Math.round(taille * 0.16))

  const cercle = {
    position: 'absolute' as const,
    top: marge,
    left: marge,
    width: diametre,
    height: diametre,
    borderRadius: diametre,
    borderStyle: 'solid' as const,
    borderWidth: trait,
  }

  return (
    <div
      style={{
        width: taille,
        height: taille,
        display: 'flex',
        position: 'relative',
        background: palette.fond,
      }}
    >
      {/* La part non remplie. */}
      <div style={{ ...cercle, borderColor: palette.piste }} />

      {/* La part remplie : deux quarts d'anneau, soit la moitié. */}
      <div
        style={{
          ...cercle,
          borderColor: 'transparent',
          borderTopColor: palette.vert,
          borderRightColor: palette.vert,
          transform: 'rotate(-45deg)',
        }}
      />
    </div>
  )
}
