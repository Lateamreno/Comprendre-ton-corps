import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Le contenu est lu sur le système de fichiers au build : aucune base de
  // données, aucun CMS (CLAUDE.md §2, règle 4).
  reactStrictMode: true,
  typedRoutes: false,
}

export default nextConfig
