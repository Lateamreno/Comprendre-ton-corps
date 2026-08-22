import { ImageResponse } from 'next/og'
import { Anneau } from '@/components/Marque'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(<Anneau taille={size.width} />, size)
}
