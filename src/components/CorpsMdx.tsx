import { MDXRemote } from 'next-mdx-remote/rsc'

/**
 * Rendu du corps d'une double page.
 *
 * Les éléments sont habillés ici, une fois, plutôt que dans chaque fichier
 * MDX : le contenu reste du texte, la charte reste dans le code. Aucune
 * couleur en dur — uniquement les variables produites par lib/tokens.ts.
 */
const composants = {
  h2: (props: React.ComponentProps<'h2'>) => (
    <h2
      {...props}
      className="mt-12 mb-3 text-intertitre font-titre font-semibold text-texte"
    />
  ),
  h3: (props: React.ComponentProps<'h3'>) => (
    <h3 {...props} className="mt-8 mb-2 text-corps font-titre font-semibold text-texte" />
  ),
  p: (props: React.ComponentProps<'p'>) => <p {...props} className="my-4 text-texte" />,
  strong: (props: React.ComponentProps<'strong'>) => (
    <strong {...props} className="font-semibold text-texte" />
  ),
  ul: (props: React.ComponentProps<'ul'>) => (
    <ul {...props} className="my-4 list-disc pl-5 marker:text-gris-vide" />
  ),
  li: (props: React.ComponentProps<'li'>) => <li {...props} className="my-1" />,
  a: (props: React.ComponentProps<'a'>) => (
    <a {...props} className="text-vert underline underline-offset-2" />
  ),
}

export function CorpsMdx({ source }: { source: string }) {
  return (
    <div className="text-corps">
      <MDXRemote source={source} components={composants} options={{ parseFrontmatter: false }} />
    </div>
  )
}
