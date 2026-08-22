import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Le contenu est lu sur le système de fichiers au build : aucune base de
  // données, aucun CMS (CLAUDE.md §2, règle 4).
  reactStrictMode: true,
  typedRoutes: false,

  /**
   * L'atelier reste librement accessible — pas d'authentification (§3) —
   * mais jamais indexable (§6).
   *
   * La balise <meta name="robots"> ne vaut que si le robot lit la page, et
   * robots.txt lui en interdit justement le crawl. L'en-tête ci-dessous
   * porte donc la même consigne hors du HTML, pour qu'un robot qui
   * atteindrait l'atelier par un autre chemin la reçoive quand même.
   */
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
    return [
      { source: '/atelier', headers: noindex },
      { source: '/atelier/:chemin*', headers: noindex },
    ]
  },
}

export default nextConfig
