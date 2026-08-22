# CLAUDE.md — Site « Comprendre ton corps avant de le changer »

## 1. Ce qu'est ce projet

Site Next.js qui sert **deux usages sur une source unique** :

1. **Outil de production du livre.** Chaque double page (DP) du livre est un fichier du repo. C'est ici que le contenu s'écrit et se relit — il n'y a pas d'autre base. Notion n'est plus utilisé pour ce projet.
2. **Actif marketing et SEO.** Les mêmes contenus, tronqués, alimentent des pages publiques qui répondent aux questions que les gens se posent sur la nutrition et le métabolisme, et qui renvoient vers l'achat du livre.

Le livre : 103 doubles pages, ~220 pages, 200×270 mm, couverture rigide, français, marché francophone.

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
│   └── parts.ts                         # les 7 parties, ordre et titres
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
partie: 1                    # 0 à 6
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
Affiche la DP dans un cadre au **ratio réel d'une double page ouverte : 400 × 270 mm**, avec la charte appliquée, pour juger la mise en page et la densité de texte. Un bouton bascule entre les deux vues.

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

```
--fond            #FAFAF7   crème, dominante
--fond-carte      #F4F3EF   fonds de fiches
--texte           #1A1A1A   noir adouci — TOUS les textes courants et tous les chiffres
--texte-faible    #6E6A66   unités, légendes, mentions

--vert            #1E8A63   favorable, marque, éléments d'interface
--vert-clair      #58B894   remplissages partiels, survols

--orange          #E8823C   intermédiaire, énergie, tracés de courbes
--orange-fonce    #D2691E   texte sur fond clair quand l'orange doit rester lisible

--rouge           #D64545   dépassement, valeur à surveiller
--gris-vide       #E2E0DA   part non remplie d'une jauge ou d'un picto
```

L'orange est un **orange franc et moderne**, celui des courbes de la maquette de référence. Ce n'est pas une terre cuite, pas une brique, pas un ocre. En cas de doute, aller vers le lumineux plutôt que vers le terreux.

Le vert est **profond mais vivant**. Ni sapin éteint, ni vert pomme « détox ».

### Le système sémantique

C'est le cœur de la charte. **Une couleur = une position sur une échelle, toujours la même, partout dans le livre.**

| Couleur | Signifie | Exemples d'usage |
|---|---|---|
| Vert | favorable, bas, dans la norme | verdict « OK », IG bas, ratio de fibres élevé, part remplie d'une jauge normale |
| Orange | intermédiaire, à considérer | verdict « Modéré », IG moyen, courbe glycémique standard, valeur d'énergie |
| Rouge | élevé, hors norme, à surveiller | verdict « Piège », ratio de sucres élevé, dépassement de seuil |
| Gris | absence, vide, non applicable | part non remplie, valeur nulle, donnée manquante |

Cette échelle est **la seule** justification d'un changement de couleur. Une couleur ne doit jamais varier pour « aérer », « rythmer » ou « faire joli ».

Corollaire : **aucune couleur n'est décidée à la main dans un composant.** Les seuils vivent dans `lib/tokens.ts` sous forme de fonctions (`couleurIG(valeur)`, `couleurRatioSucres(sucres, glucides)`, etc.), et les composants appellent ces fonctions. C'est ce qui garantit que la pomme et le croissant sont jugés par la même règle, sur 100 doubles pages.

Couleurs **exclues** : bleu, violet, jaune, rose, et tout dégradé multicolore. La maquette de référence utilisait du bleu pour la satiété et du violet pour la glycémie — ces deux emplois sont remplacés par l'échelle ci-dessus, sans quoi le système se dilue et redevient un tableur.

### Encodage de l'information

La couleur situe, mais elle ne porte jamais l'information seule (daltonisme, impression noir et blanc, photocopie). Chaque donnée est doublée d'un **remplissage proportionnel** :

- les pictogrammes se remplissent selon la valeur — la bouteille se remplit de lipides, les cubes de sucre se colorent selon le ratio sucres/glucides, la flamme porte le total ;
- les jauges suivent la même grammaire : anneau de pourcentage, volume stomacal, chronomètre de satiété, courbe glycémique ;
- le vide est en `--gris-vide`, le rempli prend la couleur de l'échelle.

Principe non négociable : **l'information vit dans le dessin.** Un chiffre posé à côté d'une icône décorative est un échec de conception.

### Typographie

- **Fraunces** — titres, en italique sur les très grandes tailles
- **Inter** — corps de texte
- **JetBrains Mono** — chiffres, unités, légendes, étiquettes techniques

Toutes auto-hébergées (règle 2), avec `font-display: swap` et fallbacks système.

Les valeurs numériques sont **en noir**, pas en couleur, sauf quand la valeur elle-même porte un verdict (le « 3 g » de sucres élevé, le mot « MODÉRÉ »). Les chiffres tabulaires sont obligatoires : c'est ce qui fait tenir les colonnes d'une fiche à l'autre.

### Formes

Beaucoup de blanc. Hiérarchie franche. Filets fins plutôt que cadres pleins. Angles nets ou très légèrement adoucis (2 px maximum).

Ce que la maquette de référence contenait et qui ne doit **pas** être repris : fond gris uni, ombres portées douces, boutons pleins à dégradé, éléments d'interface (le bouton « OK » n'a pas de sens sur une page de livre), et surtout les pictogrammes de style emoji système.

Les pictogrammes seront redessinés dans un style propriétaire (bibliothèque d'environ 25 pièces, brief illustrateur en cours). Tant qu'ils n'existent pas : tracés géométriques neutres, jamais d'emoji.

Inversion sur fond sombre : autorisée en ponctuation, sur les DP les plus denses en visualisation de données. Deux ou trois par partie au maximum.

### Travail avec Claude Design

`lib/tokens.ts` est la source de vérité. Toute exploration visuelle en part et y revient : les valeurs ne sont jamais retapées dans un composant. Une proposition qui introduit une couleur hors palette, ou qui utilise une couleur de l'échelle pour autre chose que sa signification, doit être signalée comme un écart — pas intégrée silencieusement.

---

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
- Bleu, violet, jaune, rose, dégradés multicolores
- Une terre cuite, une brique ou un ocre à la place de l'orange franc
- Utiliser une couleur de l'échelle sémantique pour un usage décoratif
- Écrire une couleur en dur dans un composant au lieu d'appeler `lib/tokens.ts`
- Faire porter une information par la seule couleur, sans remplissage ni libellé
- Des pictogrammes de style emoji système
- Ombres portées, dégradés décoratifs, effets de relief ou de verre
- Des éléments d'interface d'application sur une page de livre (boutons d'action, bascules, badges)
- Du texte qui promet un résultat, motive, ou s'adresse au lecteur en coach
- Publier une DP au statut `brouillon`
- Des données nutritionnelles sans source citée

## 12. Ton des textes d'interface

Descriptif, sobre, sans exclamation. Un bouton dit ce qu'il fait. Un état vide indique quoi faire ensuite. Le tutoiement est réservé au titre du livre et à la page de vente ; le reste du site n'interpelle pas le lecteur.
