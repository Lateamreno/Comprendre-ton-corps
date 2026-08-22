import type { MetadataRoute } from 'next'

/**
 * L'atelier est exclu de l'indexation (CLAUDE.md §6 et §9).
 * Le sitemap relève du M4 : il n'est pas encore déclaré ici.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/atelier/',
    },
  }
}
