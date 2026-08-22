import { palette, polices } from '@/lib/tokens'
import { STATUTS, type Statut } from '@/lib/content'

/**
 * Avancement d'une double page, en quatre crans.
 *
 * Volontairement hors de l'échelle sémantique : vert, orange et rouge
 * désignent une position sur une échelle de valeur mesurée, jamais un état
 * de production. Le rempli est donc en --texte, le vide en --piste.
 * La couleur ne porte rien seule : le libellé est toujours écrit à côté.
 */
export function JaugeStatut({ statut }: { statut: Statut }) {
  const atteint = STATUTS.indexOf(statut) + 1

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ display: 'inline-flex', gap: '2px' }} aria-hidden="true">
        {STATUTS.map((_, i) => (
          <span
            key={i}
            style={{
              width: '10px',
              height: '4px',
              background: i < atteint ? palette.texte : palette.piste,
            }}
          />
        ))}
      </span>
      <span
        style={{
          fontFamily: polices.chiffre,
          fontSize: '0.75rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: palette.texteFaible,
        }}
      >
        {statut}
      </span>
    </span>
  )
}
