# CLAUDE.md — Site « Comprendre ton corps avant de le changer »

## 1. Ce qu'est ce projet

Site Next.js qui sert **deux usages sur une source unique** :

1. **Outil de production du livre.** Chaque double page (DP) du livre est un fichier du repo. C'est ici que le contenu s'écrit et se relit — il n'y a pas d'autre base. Notion n'est plus utilisé pour ce projet.
2. **Actif marketing et SEO.** Les mêmes contenus, tronqués, alimentent des pages publiques qui répondent aux questions que les gens se posent sur la nutrition et le métabolisme, et qui renvoient vers l'achat du livre.

Le livre : environ 120 doubles pages — le plan dans `content/dp` fait foi, pas un nombre figé —, **8,25 × 11 pouces (209,55 × 279,4 mm)**, français, marché francophone.

Ce format n'est pas un choix esthétique, c'est une contrainte d'impression. Sur Amazon KDP, l'encre couleur premium n'existe qu'en broché, et 8,25 × 11 est le plus grand format qui l'accepte. **La couverture rigide y est impossible : elle est vendue en noir et blanc uniquement.** Comme le livre est bâti sur un système de couleurs (§8), la couleur l'emporte sur la reliure. Une couverture rigide supposerait un autre imprimeur, donc une autre économie — décision à prendre séparément.

Les dimensions vivent dans `lib/tokens.ts` (`page`, `doublePage`, `formatLivre`) et nulle part ailleurs.

Le site n'est **pas** le livre. La maquette finale part en PAO. Le site sert à écrire, à voir, et à capter de l'audience.

## 2. Règles absolues

Ces cinq points ne se négocient pas. Toute proposition qui les contredit doit être signalée, pas contournée.

1. **La troncature du contenu payant est faite côté serveur.** Le HTML envoyé au navigateur ne contient QUE l'extrait. Jamais de texte complet masqué en CSS, en `display:none`, en opacité, ou retiré par JavaScript au chargement. Le contenu intégral ne doit exister nulle part dans la réponse réseau.
2. **Pas de `next/font/google`.** Les polices sont auto-hébergées dans `/public/fonts` et déclarées en `@font-face`. (Cause connue d'échecs de build sur Vercel.)
3. **`vercel.json` à la racine avec `{ "framework": "nextjs" }`**, Root Directory vide dans les réglages Vercel, branche `main` toujours buildable.
4. **Une DP = un fichier.** Pas de base de données, pas de CMS, pas de Supabase. Le contenu est versionné dans Git.
5. **Le texte reste descriptif.** Le livre explique des mécanismes et laisse le lecteur décider. Pas de conseil personnalisé, pas d'objectif chiffré, pas de plan alimentaire, pas d'injonction, pas d'adresse au lecteur dans le corps du texte. Cette règle vaut aussi pour tout texte d'interface.

## 3. Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Contenu en MDX, lu depuis le système de fichiers au build
- Déploiement Vercel
- Pas de base de données en v1. Pas d'authentification en v1.
- Capture d'e-mails : un endpoint simple (Formspree ou Resend). Rien de plus.

## 4. Arborescence

```
/
├── vercel.json
├── CLAUDE.md
├── content/
│   ├── dp/
│   │   ├── 00-01-avant-propos.mdx
│   │   ├── 01-01-nourriture-....mdx
│   │   └── ...                          # une DP = un fichier
│   ├── aliments/                        # référentiel des fiches aliment
│   │   └── pomme.json
│   └── parts.ts                         # les 9 parties, ordre et titres
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # accueil
│   │   ├── sommaire/page.tsx
│   │   ├── [partie]/[slug]/page.tsx     # page publique d'une DP
│   │   ├── atelier/page.tsx             # index de production (privé)
│   │   └── atelier/[slug]/page.tsx      # vue spread (privé)
│   ├── components/
│   │   ├── BurgerMenu.tsx
│   │   ├── Spread.tsx                   # rendu 400×270 mm
│   │   ├── Paywall.tsx
│   │   ├── FicheAliment.tsx
│   │   ├── Picto.tsx                    # pictogrammes à remplissage variable
│   │   └── Jauge.tsx
│   ├── lib/
│   │   ├── content.ts                   # lecture + parsing des DP
│   │   ├── truncate.ts                  # troncature serveur
│   │   └── tokens.ts                    # couleurs, échelles typo, seuils
│   └── styles/
└── public/
    ├── fonts/
    └── img/
```

## 5. Modèle d'une double page

Frontmatter obligatoire :

```yaml
---
numero: "1.13bis"            # identifiant éditorial, peut contenir bis/ter
partie: 1                    # 0 à 8
ordre: 27                    # position dans la partie
titre: "Une calorie n'est pas une calorie"
question: "Pourquoi toutes les calories ne se valent pas ?"
slug: "pourquoi-toutes-les-calories-ne-se-valent-pas"
statut: "brouillon"          # brouillon | ecrit | relu | valide
extrait_ratio: 0.15          # part visible en public, 0.10 à 0.20
resume: "…"                  # 1 phrase, sert au SEO et au sommaire
sources:
  - "Ciqual ANSES 2024"
picto: []                    # notes pour l'illustrateur
---
```

Le corps du fichier est le texte de la DP en MDX.

`question` est le champ le plus important pour le SEO : c'est lui qui porte le titre de la page publique et la balise `<title>`. Le champ `titre` est le titre du livre imprimé, souvent plus court et plus littéraire. Les deux coexistent, on ne remplace pas l'un par l'autre.

## 6. Les deux vues

### Vue publique — lecture
Chapitres numérotés, navigation par **menu burger** (fermé par défaut, sur toutes les pages). Une DP = une page. Lecture linéaire possible (précédent / suivant) mais non imposée. Contenu tronqué selon `extrait_ratio`.

### Vue atelier — spread
Affiche la DP dans un cadre au **ratio réel d'une double page ouverte**, avec la charte appliquée, pour juger la mise en page et la densité de texte. Un bouton bascule entre les deux vues.

### Vue livre — feuilleter
`/atelier/livre` empile toutes les DP publiables et les fait feuilleter au format réel. Sur écran large, la double page s'affiche ouverte ; sur téléphone en portrait, une page à la fois, avec zoom et déplacement au doigt — une page de ce format réduite à la largeur d'un téléphone est illisible sans zoom. Cette vue rend exactement la composition imprimée : elle ne se réadapte pas à l'écran, c'est son intérêt.

Le contenu peut ne remplir que la moitié du cadre au début — c'est normal et attendu. Le cadre sert de jauge : il montre ce qui reste à écrire.

L'atelier n'est pas indexable : `noindex` et exclusion dans `robots.txt`.

## 7. Paywall

- `lib/truncate.ts` coupe le contenu **avant le rendu**, à `extrait_ratio` du texte, sur une frontière de paragraphe (jamais au milieu d'une phrase).
- Le composant serveur ne reçoit que l'extrait. Le reste n'est jamais sérialisé, ni dans le HTML, ni dans les props client, ni dans `__NEXT_DATA__`.
- Sous l'extrait : un fondu, puis un bloc d'accroche et un lien d'achat.

Test d'acceptation, à refaire à chaque milestone : `curl` sur une page publique ne doit faire apparaître aucun mot de la partie masquée.

---

## 8. Charte

### Intention

Fond **clair**, texte **noir**, couleur **abondante mais codifiée**.

Le livre est composé en grande partie de fiches, de jauges et de comparaisons. La couleur n'y est pas une décoration : c'est le système de lecture rapide. Un lecteur doit situer une valeur avant d'avoir lu la légende.

Le registre visé est celui d'un instrument de mesure moderne — précis, lisible, contemporain. Ni magazine de nutrition, ni document administratif.

### Palette

Relevée dans les maquettes validées, au pixel — ce ne sont pas des valeurs approchées.

```
--fond            #F7F8FA   gris très clair, hors carte
--fond-carte      #FFFFFF   fond des fiches
--texte           #152035   navy sombre — textes courants et chiffres
--texte-faible    #8C9199   unités, légendes, mentions

--piste           #EFF0F0   part non remplie d'une barre, d'un anneau, d'un picto

--vert            #159949   valeur favorable, verdict, marque
--vert-clair      #7FBE6D   remplissage de barre
--vert-tendre     #A2CF8C   remplissage d'anneau et de pictogramme

--jaune           #FBC83B   remplissage d'énergie et de lipides
--orange          #F69B00   valeur secondaire (énergie nette)
--rouge           #D24A3E   valeur élevée, à surveiller

--bleu            #2E6FE0   satiété
--violet          #586BDC   glycémie, texte de verdict
--violet-clair    #8D85EF   glycémie, tracé de courbe

--verdict-debut   #91CC8B   bandeau de verdict, dégradé horizontal
--verdict-fin     #3DC1C0
```

### Le système de couleurs

Deux registres distincts, qui ne se mélangent pas.

**La couleur d'identité** dit *de quelle grandeur on parle*. Elle ne varie jamais d'une
fiche à l'autre : l'énergie est jaune, la satiété bleue, la glycémie violette. C'est ce
qui permet de retrouver une grandeur d'un coup d'œil, sans lire l'étiquette.

| Grandeur | Identité | Pictogramme |
|---|---|---|
| Énergie | jaune | flamme |
| Protéines | vert | haltère |
| Lipides | jaune | bouteille |
| Glucides, dont sucres | vert | cubes de sucre |
| Fibres | vert | feuille |
| Part d'une journée | vert | anneau |
| Volume | vert | estomac |
| Satiété | bleu | chronomètre |
| Glycémie | violet | courbe |

**La couleur de valeur** dit *où se situe la mesure* : vert favorable, orange
intermédiaire, rouge à surveiller, gris absent. Elle porte les verdicts et les
valeurs qui en portent un — le « 3 g » de sucres, le mot « DOUX ».

Corollaire inchangé : **aucune couleur n'est décidée à la main dans un composant.**
Identités et seuils vivent dans `lib/tokens.ts`, et les composants les interrogent.
C'est ce qui garantit que la pomme et le croissant sont jugés par la même règle.

### Encodage de l'information

La couleur situe, mais elle ne porte jamais l'information seule (daltonisme,
impression en noir et blanc). Chaque donnée est doublée d'un **remplissage
proportionnel** :

- une barre sous chaque pictogramme, piste en `--piste`, part remplie dans la
  couleur de la grandeur ;
- l'anneau de pourcentage, le volume stomacal, le niveau de la bouteille et l'aire
  sous la courbe glycémique suivent la même grammaire.

Principe non négociable : **l'information vit dans le dessin.**

### Pictogrammes

Bibliothèque propriétaire, en rendu dimensionnel — flamme, haltère, bouteille,
cubes de sucre, feuille, anneau, estomac, chronomètre, courbe. Ils sont posés en
haut de chaque colonne et portent la couleur d'identité de leur grandeur.

Un pictogramme est un **actif fixe** : c'est la barre, l'anneau ou le niveau
au-dessous qui porte la valeur. Les deux seuls pictogrammes dont le remplissage
est lui-même une donnée sont l'anneau et l'estomac.

### Typographie

- **Montserrat** — titres de fiche, chiffres, unités, verdicts
- **Inter** — étiquettes et textes courts d'interface
- **Fraunces** — titres du livre et pages de lecture

Toutes auto-hébergées (règle 2), avec `font-display: swap` et fallbacks système.
Les chiffres tabulaires sont obligatoires : c'est ce qui fait tenir les colonnes
d'une fiche à l'autre.

### Formes

Cartes blanches à angles arrondis sur fond gris très clair, séparées par des filets
fins. Ombres douces admises pour détacher une carte de son fond. Le bandeau de
verdict est un aplat à dégradé horizontal.

### Travail avec Claude Design

`lib/tokens.ts` est la source de vérité. Toute exploration visuelle en part et y
revient : les valeurs ne sont jamais retapées dans un composant. Une proposition
qui s'écarte des maquettes validées doit être signalée, pas intégrée silencieusement.

## 9. SEO

Le domaine sera fourni avant le M3. Ne rien coder en dur : une constante unique dans `lib/config.ts`.

- Une page = une question. La balise `<title>` reprend `question`.
- `resume` alimente la meta description.
- Balisage `Article` + `FAQPage` quand la DP contient des questions.
- Le nom de l'auteur et sa page « à propos » sont obligatoires sur chaque page : le sujet relève du domaine santé, où Google exige une identité d'auteur vérifiable. Prévoir un emplacement pour un co-auteur médecin (nom, titre, lien) — le champ existe dès maintenant même s'il n'est pas rempli.
- Sitemap et `robots.txt` générés. L'atelier en est exclu.
- Aucune promesse de résultat dans les titres, descriptions ou textes d'interface.

## 10. Milestones

Chacun se valide sur une preview Vercel avant de passer au suivant.

**M1 — Socle.** Repo, `vercel.json`, polices auto-hébergées, `lib/tokens.ts` complet (couleurs + fonctions de seuil), lecture du dossier `content/dp`, 3 DP d'exemple, accueil minimale. Critère : la preview build et affiche les 3 DP.

**M2 — Atelier.** Index de production avec statut par DP, vue spread 400×270 mm, bascule lecture/spread, `noindex`. Critère : une DP est jugeable visuellement au format réel.

**M3 — Fiche aliment.** Composants `Picto`, `Jauge`, `FicheAliment` pilotés par les fonctions de seuil. Une fiche complète rendue depuis un JSON. Critère : changer une valeur dans le JSON change la couleur et le remplissage sans toucher au composant.

**M4 — Site public.** Sommaire, menu burger, pages par partie et par DP, navigation, métadonnées, sitemap. Critère : parcours complet sans cul-de-sac.

**M5 — Paywall.** Troncature serveur, bloc d'accroche, lien d'achat. Critère : le `curl` ne révèle rien.

**M6 — Capture et finitions.** Formulaire e-mail, page auteur, page « le livre », responsive, accessibilité (focus clavier visible, contrastes AA, `prefers-reduced-motion`), domaine branché.

## 11. Interdits

- Réintroduire une base de données ou un CMS « pour simplifier »
- Toute troncature côté client
- `next/font/google`
- Écrire une couleur en dur dans un composant au lieu d'appeler `lib/tokens.ts`
- Faire porter une information par la seule couleur, sans remplissage ni libellé
- S'écarter des maquettes validées sans le signaler
- Du texte qui promet un résultat, motive, ou s'adresse au lecteur en coach
- Publier une DP au statut `brouillon`
- Des données nutritionnelles sans source citée

## 12. Ton des textes d'interface

Descriptif, sobre, sans exclamation. Un bouton dit ce qu'il fait. Un état vide indique quoi faire ensuite. Le tutoiement est réservé au titre du livre et à la page de vente ; le reste du site n'interpelle pas le lecteur.
