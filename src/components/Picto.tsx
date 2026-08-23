import Image from 'next/image'
import { identites, type NomGrandeur } from '@/lib/tokens'

/**
 * Un pictogramme de la bibliothèque.
 *
 * C'est un actif fixe : il dit de quelle grandeur on parle, jamais sa valeur
 * (CLAUDE.md §8). La valeur est portée par la jauge posée au-dessous.
 */
export function Picto({
  grandeur,
  taille = 118,
}: {
  grandeur: NomGrandeur
  taille?: number
}) {
  const { picto, libelle } = identites[grandeur]
  return (
    <Image
      src={picto}
      alt=""
      aria-hidden="true"
      width={taille}
      height={Math.round(taille * 1.17)}
      title={libelle}
      style={{ objectFit: 'contain', height: 'auto' }}
    />
  )
}
