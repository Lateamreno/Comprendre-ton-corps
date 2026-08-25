/**
 * Les jeux de lignes des tableaux comparatifs de la partie 3.
 *
 * Le contenu éditorial d'un tableau — quels aliments, quelle portion, sous
 * quel nom — vit ici, dans `content/`, comme le reste du livre. Le composant
 * qui les dessine n'en connaît que la clé.
 *
 * Une ligne ne porte jamais de valeur nutritionnelle : seulement un code
 * Ciqual. Les grammes et les kilocalories sont lus dans la table au rendu
 * (CLAUDE.md §11).
 */

export type LigneAliment = {
  /** Code Ciqual — la seule source de vérité pour les valeurs. */
  code: string
  /** Nom court pour le tableau ; celui de Ciqual est souvent trop long. */
  nom: string
  /** Portion en grammes, telle qu'elle se mange. */
  portion: number
  /** Ce que représente la portion, en clair. */
  mesure: string
}

export type JeuTableau = {
  titre: string
  lignes: LigneAliment[]
}

export const tableaux = {
  cereales: {
    titre: 'Céréales et féculents',
    lignes: [
      { code: '9811', nom: 'Pâtes', portion: 200, mesure: 'assiette' },
      { code: '9104', nom: 'Riz blanc', portion: 200, mesure: 'assiette' },
      { code: '9103', nom: 'Riz complet', portion: 200, mesure: 'assiette' },
      { code: '9683', nom: 'Semoule', portion: 200, mesure: 'assiette' },
      { code: '9691', nom: 'Boulgour', portion: 200, mesure: 'assiette' },
      { code: '9341', nom: 'Quinoa', portion: 200, mesure: 'assiette' },
      { code: '4003', nom: 'Pomme de terre', portion: 200, mesure: 'deux moyennes' },
      { code: '7001', nom: 'Pain blanc', portion: 60, mesure: 'un tiers de baguette' },
      { code: '7110', nom: 'Pain complet', portion: 60, mesure: 'deux tranches' },
      { code: '9313', nom: "Flocons d'avoine", portion: 250, mesure: 'un bol, cuits' },
    ],
  },
  legumineuses: {
    titre: 'Légumineuses',
    lignes: [
      { code: '20360', nom: 'Lentilles', portion: 200, mesure: 'assiette' },
      { code: '20507', nom: 'Pois chiches', portion: 200, mesure: 'assiette' },
      { code: '20503', nom: 'Haricots rouges', portion: 200, mesure: 'assiette' },
      { code: '20502', nom: 'Haricots blancs', portion: 200, mesure: 'assiette' },
      { code: '20506', nom: 'Pois cassés', portion: 200, mesure: 'assiette' },
      { code: '20500', nom: 'Fèves', portion: 200, mesure: 'assiette' },
    ],
  },
  viandesPoissons: {
    titre: 'Viandes, poissons, œufs',
    lignes: [
      { code: '36018', nom: 'Blanc de poulet', portion: 130, mesure: 'un filet' },
      { code: '6251', nom: 'Steak haché 5 %', portion: 125, mesure: 'un steak' },
      { code: '6255', nom: 'Steak haché 15 %', portion: 125, mesure: 'un steak' },
      { code: '28203', nom: 'Filet mignon de porc', portion: 130, mesure: 'une part' },
      { code: '28902', nom: 'Jambon cuit', portion: 50, mesure: 'une tranche' },
      { code: '26023', nom: 'Cabillaud', portion: 130, mesure: 'un pavé' },
      { code: '26038', nom: 'Saumon', portion: 130, mesure: 'un pavé' },
      { code: '26039', nom: 'Thon au naturel', portion: 100, mesure: 'une petite boîte' },
      { code: '26034', nom: "Sardines à l'huile", portion: 100, mesure: 'une boîte' },
      { code: '22010', nom: 'Œufs durs', portion: 100, mesure: 'deux œufs' },
    ],
  },
  laitiers: {
    titre: 'Produits laitiers',
    lignes: [
      { code: '19041', nom: 'Lait demi-écrémé', portion: 250, mesure: 'un grand verre' },
      { code: '19593', nom: 'Yaourt nature', portion: 125, mesure: 'un pot' },
      { code: '19599', nom: 'Yaourt nature sucré', portion: 125, mesure: 'un pot' },
      { code: '19575', nom: 'Yaourt aromatisé', portion: 125, mesure: 'un pot' },
      { code: '19644', nom: 'Fromage blanc 0 %', portion: 100, mesure: 'un pot' },
      { code: '12115', nom: 'Emmental', portion: 30, mesure: 'une part' },
      { code: '12110', nom: 'Comté', portion: 30, mesure: 'une part' },
      { code: '12001', nom: 'Camembert', portion: 30, mesure: 'un huitième' },
    ],
  },
  fruitsLegumes: {
    titre: 'Fruits et légumes',
    lignes: [
      { code: '13039', nom: 'Pomme', portion: 150, mesure: 'une moyenne' },
      { code: '13005', nom: 'Banane', portion: 120, mesure: 'une moyenne' },
      { code: '13034', nom: 'Orange', portion: 150, mesure: 'une moyenne' },
      { code: '13395', nom: 'Raisin', portion: 150, mesure: 'une grappe' },
      { code: '13014', nom: 'Fraises', portion: 150, mesure: 'une coupelle' },
      { code: '13004', nom: 'Avocat', portion: 100, mesure: 'un demi' },
      { code: '20276', nom: 'Tomates', portion: 200, mesure: 'deux moyennes' },
      { code: '20305', nom: 'Carottes cuites', portion: 200, mesure: 'une portion' },
      { code: '20302', nom: 'Brocoli', portion: 200, mesure: 'une portion' },
      { code: '20030', nom: 'Haricots verts', portion: 200, mesure: 'une portion' },
      { code: '20336', nom: 'Épinards', portion: 200, mesure: 'une portion' },
      { code: '20021', nom: 'Courgette', portion: 200, mesure: 'une portion' },
    ],
  },
  matieresGrasses: {
    titre: 'Matières grasses et oléagineux',
    lignes: [
      { code: '17270', nom: "Huile d'olive", portion: 10, mesure: 'une cuillère à soupe' },
      { code: '17130', nom: 'Huile de colza', portion: 10, mesure: 'une cuillère à soupe' },
      { code: '16400', nom: 'Beurre', portion: 10, mesure: 'une noisette' },
      { code: '15000', nom: 'Amandes', portion: 30, mesure: 'une poignée' },
      { code: '15004', nom: 'Noisettes', portion: 30, mesure: 'une poignée' },
      { code: '15005', nom: 'Noix', portion: 30, mesure: 'une poignée' },
      { code: '15202', nom: 'Beurre de cacahuète', portion: 20, mesure: 'une cuillère' },
    ],
  },
  platsComplets: {
    titre: 'Plats complets',
    lignes: [
      { code: '25033', nom: 'Bœuf bourguignon', portion: 350, mesure: 'une assiette' },
      { code: '25001', nom: 'Blanquette de veau', portion: 350, mesure: 'une assiette' },
      { code: '25111', nom: 'Chili con carne', portion: 350, mesure: 'une assiette' },
      { code: '25138', nom: 'Couscous au poulet', portion: 350, mesure: 'une assiette' },
      { code: '25081', nom: 'Lasagnes à la viande', portion: 350, mesure: 'une part' },
      { code: '25009', nom: 'Hachis parmentier', portion: 350, mesure: 'une part' },
      { code: '25242', nom: 'Paella', portion: 350, mesure: 'une assiette' },
      { code: '25056', nom: 'Gratin dauphinois', portion: 250, mesure: 'une part' },
      { code: '25608', nom: 'Taboulé', portion: 250, mesure: 'une part' },
    ],
  },
  platsPrepares: {
    titre: 'Plats préparés et repas pris dehors',
    lignes: [
      { code: '25404', nom: 'Pizza margherita', portion: 350, mesure: 'une pizza' },
      { code: '25405', nom: 'Quiche lorraine', portion: 150, mesure: 'une part' },
      { code: '25413', nom: 'Hamburger', portion: 110, mesure: 'un burger' },
      { code: '25429', nom: 'Kebab en baguette', portion: 300, mesure: 'un sandwich' },
      { code: '25431', nom: 'Sandwich thon mayonnaise', portion: 250, mesure: 'un sandwich' },
      { code: '25089', nom: 'Cordon bleu', portion: 100, mesure: 'une pièce' },
      { code: '4032', nom: 'Frites', portion: 150, mesure: 'une portion' },
      { code: '25666', nom: 'Salade composée en barquette', portion: 250, mesure: 'une barquette' },
    ],
  },
  encasSales: {
    titre: 'En-cas salés',
    lignes: [
      { code: '4004', nom: 'Chips', portion: 30, mesure: 'une poignée' },
      { code: '15002', nom: 'Cacahuètes salées', portion: 30, mesure: 'une poignée' },
      { code: '9230', nom: 'Pop-corn salé', portion: 30, mesure: 'un bol' },
      { code: '38107', nom: 'Bretzels apéritif', portion: 30, mesure: 'une poignée' },
      { code: '15000', nom: 'Amandes', portion: 30, mesure: 'une poignée' },
      { code: '22010', nom: 'Œuf dur', portion: 50, mesure: 'un œuf' },
      { code: '28902', nom: 'Jambon cuit', portion: 50, mesure: 'une tranche' },
    ],
  },
  encasSucres: {
    titre: 'En-cas sucrés',
    lignes: [
      { code: '31004', nom: 'Chocolat au lait', portion: 25, mesure: 'cinq carrés' },
      { code: '31000', nom: 'Barre chocolatée', portion: 45, mesure: 'une barre' },
      { code: '31101', nom: 'Barre de céréales', portion: 25, mesure: 'une barre' },
      { code: '7615', nom: 'Croissant', portion: 60, mesure: 'une pièce' },
      { code: '7730', nom: 'Pain au chocolat', portion: 70, mesure: 'une pièce' },
      { code: '24684', nom: 'Cookie au chocolat', portion: 40, mesure: 'un cookie' },
      { code: '13038', nom: 'Compote de pomme', portion: 100, mesure: 'une gourde' },
      { code: '13039', nom: 'Pomme', portion: 150, mesure: 'une moyenne' },
      { code: '19593', nom: 'Yaourt nature', portion: 125, mesure: 'un pot' },
    ],
  },
  encasDenses: {
    titre: 'Les plus concentrés',
    lignes: [
      { code: '17270', nom: "Huile d'olive", portion: 10, mesure: 'une cuillère' },
      { code: '15005', nom: 'Noix', portion: 30, mesure: 'une poignée' },
      { code: '4004', nom: 'Chips', portion: 30, mesure: 'une poignée' },
      { code: '31004', nom: 'Chocolat au lait', portion: 25, mesure: 'cinq carrés' },
      { code: '13046', nom: 'Raisins secs', portion: 40, mesure: 'une poignée' },
      { code: '7615', nom: 'Croissant', portion: 60, mesure: 'une pièce' },
    ],
  },
  encasVolumineux: {
    titre: 'Les plus volumineux',
    lignes: [
      { code: '9230', nom: 'Pop-corn salé', portion: 30, mesure: 'un bol' },
      { code: '19644', nom: 'Fromage blanc 0 %', portion: 200, mesure: 'un grand pot' },
      { code: '22010', nom: 'Œuf dur', portion: 50, mesure: 'un œuf' },
      { code: '13014', nom: 'Fraises', portion: 200, mesure: 'une coupelle' },
      { code: '13039', nom: 'Pomme', portion: 150, mesure: 'une moyenne' },
      { code: '20009', nom: 'Carottes crues', portion: 150, mesure: 'quelques bâtonnets' },
    ],
  },
} as const satisfies Record<string, JeuTableau>

export type CleTableau = keyof typeof tableaux
