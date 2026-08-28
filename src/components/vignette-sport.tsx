import { palette, polices } from '@/lib/tokens'
import type { LigneSport } from '@content/sports'

/**
 * La vignette d'un sport.
 *
 * Tant qu'une photo n'est pas fournie, la case reste occupée par une pastille
 * neutre portant l'initiale : la colonne garde sa largeur, et la maquette se
 * juge à sa place définitive. Le jour où `photo` est renseigné dans
 * content/sports.ts, l'image prend le relais sans rien changer d'autre.
 */
export function Vignette({ sport, taille = 46 }: { sport: LigneSport; taille?: number }) {
  const commun = {
    width: taille,
    height: taille,
    borderRadius: 6,
    flexShrink: 0,
    objectFit: 'cover' as const,
  }

  if (sport.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={sport.photo} alt="" aria-hidden="true" style={commun} />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{
        ...commun,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: palette.piste,
        color: palette.texteFaible,
        fontFamily: polices.fiche,
        fontWeight: 700,
        fontSize: taille * 0.42,
      }}
    >
      {sport.nom.charAt(0)}
    </span>
  )
}
