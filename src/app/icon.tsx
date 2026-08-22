import { ImageResponse } from 'next/og'
import { Anneau } from '@/components/Marque'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(<Anneau taille={size.width} />, size)
}
