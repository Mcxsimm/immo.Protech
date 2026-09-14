/* ==========================================================================
   Base de 200 repas
   --------------------------------------------------------------------------
   Toutes les quantites sont exprimees POUR UNE PERSONNE, dans l'unite
   canonique de l'ingredient (g, ml ou piece). Le planificateur les multiplie
   par le nombre de convives du repas.

     id    identifiant unique
     n     nom du plat
     cu    cuisine / origine (sert aussi au filtre "envie")
     tags  mots-cles libres pour la recherche et les envies
     t     temps total en minutes
     d     difficulte : 1 facile, 2 moyen, 3 plus technique
     s     saisons ideales (absent = toute l'annee)
     i     [[ingredientId, quantite/personne], ...]
     e     etapes de la recette

   Le type de proteine, la base feculente, la part de legumes, les valeurs
   nutritionnelles et la compatibilite avec les regimes sont DEDUITS des
   ingredients (voir assets/js/nutrition.js) : rien n'est saisi en double.
   ========================================================================== */
(function (global) {
  'use strict';

  var R = [

  /* ====================== VOLAILLE & VIANDES BLANCHES ==================== */
  { id: 'poulet_curry_coco', n: 'Poulet au curry et lait de coco', cu: 'Inde', tags: ['poulet', 'curry', 'crémeux', 'épicé'], t: 35, d: 1,
    i: [['poulet_filet', 140], ['oignon', 0.5], ['ail', 1], ['gingembre', 5], ['lait_coco', 70], ['curry', 4], ['riz_basmati', 75], ['coriandre', 4], ['huile_olive', 6], ['citron', 0.25], ['haricot_vert', 90]],
    e: ['Émincer le poulet en cubes, hacher oignon, ail et gingembre.', 'Faire dorer le poulet à l\'huile 4 min, réserver.', 'Faire suer oignon, ail et gingembre, ajouter le curry et laisser torréfier 30 s.', 'Verser le lait de coco, remettre le poulet et laisser mijoter 12 min à feu doux.', 'Cuire le riz, servir avec la coriandre ciselée et un trait de citron.'] },

  { id: 'poulet_roti_legumes_racines', n: 'Poulet rôti aux légumes racines', cu: 'France', tags: ['poulet', 'four', 'rôti', 'familial'], t: 70, d: 1, s: ['automne', 'hiver'],
    i: [['poulet_cuisse', 180], ['pomme_de_terre', 180], ['carotte', 100], ['navet', 80], ['oignon', 0.5], ['ail', 2], ['thym', 1], ['huile_olive', 8]],
    e: ['Préchauffer le four à 200 °C.', 'Couper les légumes en gros morceaux, les mélanger à l\'huile, l\'ail en chemise et le thym.', 'Déposer les cuisses de poulet sur les légumes, saler et poivrer.', 'Enfourner 50 min en arrosant à mi-cuisson.'] },

  { id: 'poulet_basquaise', n: 'Poulet basquaise', cu: 'France', tags: ['poulet', 'mijoté', 'poivrons', 'familial'], t: 55, d: 1, s: ['été', 'automne'],
    i: [['poulet_cuisse', 180], ['poivron', 120], ['tomate_pelee', 120], ['oignon', 0.5], ['ail', 1], ['piment_espelette', 1], ['riz_basmati', 70], ['huile_olive', 8]],
    e: ['Faire dorer les morceaux de poulet dans l\'huile, réserver.', 'Faire fondre oignon, ail et poivrons émincés 8 min.', 'Ajouter les tomates concassées et le piment d\'Espelette.', 'Remettre le poulet, couvrir et mijoter 30 min.', 'Servir avec le riz.'] },

  { id: 'tajine_poulet_citron_olives', n: 'Tajine de poulet citron confit et olives', cu: 'Maroc', tags: ['poulet', 'tajine', 'mijoté', 'oriental'], t: 60, d: 2,
    i: [['poulet_cuisse', 180], ['oignon', 0.75], ['citron', 0.5], ['olive_verte', 30], ['carotte', 80], ['ras_el_hanout', 4], ['curcuma', 2], ['semoule', 70], ['coriandre', 5], ['huile_olive', 8]],
    e: ['Faire revenir le poulet avec les oignons émincés et les épices 5 min.', 'Ajouter les carottes en rondelles et couvrir d\'eau à mi-hauteur.', 'Mijoter 35 min à couvert.', 'Ajouter le citron en quartiers et les olives, poursuivre 10 min.', 'Servir sur la semoule avec la coriandre.'] },

  { id: 'poulet_yassa', n: 'Poulet yassa aux oignons confits', cu: 'Sénégal', tags: ['poulet', 'citron', 'mijoté', 'oignons'], t: 55, d: 2,
    i: [['poulet_cuisse', 180], ['oignon', 1.5], ['citron', 0.5], ['moutarde', 8], ['piment_frais', 0.3], ['riz_basmati', 75], ['huile_tournesol', 8], ['laurier', 1]],
    e: ['Mariner le poulet 30 min avec le jus de citron, la moutarde et le piment.', 'Faire dorer le poulet, réserver.', 'Confire les oignons émincés 20 min à feu doux.', 'Remettre le poulet avec la marinade et le laurier, mijoter 20 min.', 'Servir avec le riz.'] },

  { id: 'poulet_teriyaki', n: 'Poulet teriyaki et riz vapeur', cu: 'Japon', tags: ['poulet', 'asiatique', 'rapide', 'sucré-salé'], t: 25, d: 1,
    i: [['poulet_filet', 140], ['sauce_soja', 20], ['miel', 10], ['gingembre', 5], ['ail', 1], ['riz_basmati', 75], ['brocoli', 120], ['graine_sesame', 5], ['huile_sesame', 5]],
    e: ['Mélanger sauce soja, miel, gingembre et ail râpés.', 'Saisir les aiguillettes de poulet 5 min à l\'huile de sésame.', 'Verser la sauce et laisser caraméliser 4 min.', 'Cuire le riz et le brocoli à la vapeur.', 'Parsemer de graines de sésame.'] },

  { id: 'wok_poulet_legumes', n: 'Wok de poulet aux légumes croquants', cu: 'Asie', tags: ['poulet', 'wok', 'rapide', 'légumes'], t: 25, d: 1,
    i: [['poulet_emince', 130], ['carotte', 70], ['poivron', 70], ['brocoli', 80], ['nouilles_chinoises', 80], ['sauce_soja', 15], ['gingembre', 5], ['ail', 1], ['huile_sesame', 6]],
    e: ['Cuire les nouilles, les rafraîchir.', 'Saisir le poulet à feu vif 3 min dans le wok, réserver.', 'Faire sauter les légumes taillés fin 5 min, ils doivent rester croquants.', 'Remettre le poulet, ajouter les nouilles, la sauce soja, l\'ail et le gingembre, sauter 2 min.'] },

  { id: 'poulet_moutarde_champignons', n: 'Poulet à la moutarde et aux champignons', cu: 'France', tags: ['poulet', 'crémeux', 'champignons', 'rapide'], t: 30, d: 1,
    i: [['poulet_filet', 140], ['champignon', 120], ['creme_liquide', 50], ['moutarde', 12], ['echalote', 1], ['tagliatelle', 90], ['persil', 4], ['huile_olive', 6]],
    e: ['Dorer les filets de poulet 6 min, réserver.', 'Faire suer l\'échalote puis les champignons émincés jusqu\'à évaporation.', 'Déglacer, ajouter crème et moutarde, réduire 5 min.', 'Remettre le poulet, servir avec les tagliatelles et le persil.'] },

  { id: 'poulet_paprika_poivrons', n: 'Poulet au paprika et poivrons', cu: 'Hongrie', tags: ['poulet', 'mijoté', 'paprika', 'familial'], t: 45, d: 1,
    i: [['poulet_cuisse', 170], ['poivron', 120], ['oignon', 0.5], ['tomate_pelee', 100], ['paprika', 5], ['creme_fraiche', 25], ['pomme_de_terre', 180], ['huile_olive', 7]],
    e: ['Dorer le poulet, réserver.', 'Faire fondre oignons et poivrons, ajouter le paprika hors du feu.', 'Ajouter les tomates, remettre le poulet, mijoter 30 min.', 'Lier avec la crème hors du feu, servir avec les pommes de terre vapeur.'] },

  { id: 'emince_poulet_creme_champignons', n: 'Émincé de poulet à la crème et riz', cu: 'Suisse', tags: ['poulet', 'crémeux', 'rapide', 'réconfortant'], t: 30, d: 1,
    i: [['poulet_emince', 140], ['champignon', 110], ['creme_liquide', 50], ['vin_blanc', 30], ['oignon', 0.5], ['riz_complet', 75], ['persil', 4], ['huile_olive', 6]],
    e: ['Saisir l\'émincé 4 min à feu vif, réserver.', 'Suer l\'oignon et les champignons 6 min.', 'Déglacer au vin blanc, ajouter la crème, réduire.', 'Remettre la viande, servir avec le riz complet.'] },

  { id: 'poulet_tikka_masala', n: 'Poulet tikka masala', cu: 'Inde', tags: ['poulet', 'épicé', 'indien', 'crémeux'], t: 45, d: 2,
    i: [['poulet_filet', 140], ['yaourt_nature', 0.5], ['tomate_pelee', 120], ['oignon', 0.5], ['ail', 2], ['gingembre', 6], ['garam_masala', 5], ['curcuma', 2], ['creme_liquide', 30], ['riz_basmati', 75], ['coriandre', 4], ['huile_olive', 7]],
    e: ['Mariner le poulet 20 min dans le yaourt, l\'ail, le gingembre et la moitié des épices.', 'Saisir le poulet à feu vif, réserver.', 'Faire revenir oignon et épices restantes, ajouter les tomates et mijoter 12 min.', 'Remettre le poulet, ajouter la crème et cuire 8 min.', 'Servir avec le riz et la coriandre.'] },

  { id: 'poulet_sesame_croustillant', n: 'Poulet croustillant au sésame', cu: 'Chine', tags: ['poulet', 'asiatique', 'sucré-salé', 'croustillant'], t: 35, d: 2,
    i: [['poulet_filet', 140], ['maizena', 15], ['sauce_soja', 18], ['miel', 12], ['vinaigre', 8], ['graine_sesame', 8], ['riz_basmati', 75], ['brocoli', 110], ['huile_tournesol', 10], ['ail', 1]],
    e: ['Enrober les cubes de poulet de maïzena.', 'Les faire frire à la poêle jusqu\'à ce qu\'ils soient dorés, réserver sur papier absorbant.', 'Faire réduire soja, miel, vinaigre et ail 2 min.', 'Enrober le poulet de sauce, parsemer de sésame.', 'Servir avec riz et brocoli vapeur.'] },

  { id: 'fajitas_poulet', n: 'Fajitas de poulet aux poivrons', cu: 'Mexique', tags: ['poulet', 'mexicain', 'rapide', 'convivial'], t: 30, d: 1,
    i: [['poulet_emince', 130], ['poivron', 120], ['oignon_rouge', 0.5], ['tortilla', 2], ['paprika', 3], ['cumin', 2], ['citron_vert', 0.25], ['yaourt_grec', 30], ['salade_verte', 30], ['huile_olive', 7]],
    e: ['Mariner le poulet avec paprika, cumin et huile 10 min.', 'Saisir le poulet à feu vif 5 min, réserver.', 'Faire sauter poivrons et oignon 6 min.', 'Réchauffer les tortillas, garnir de poulet, légumes, salade et yaourt citronné.'] },

  { id: 'wrap_poulet_crudites', n: 'Wrap de poulet et crudités', cu: 'États-Unis', tags: ['poulet', 'rapide', 'froid', 'nomade'], t: 20, d: 1,
    i: [['poulet_filet', 120], ['tortilla', 2], ['salade_verte', 40], ['tomate', 70], ['concombre', 60], ['yaourt_grec', 40], ['moutarde', 6], ['citron', 0.25], ['huile_olive', 5]],
    e: ['Cuire le poulet à la poêle, l\'émincer.', 'Mélanger yaourt, moutarde et citron pour la sauce.', 'Garnir les tortillas de crudités, poulet et sauce.', 'Rouler serré et couper en deux.'] },

  { id: 'salade_cesar_poulet', n: 'Salade César au poulet grillé', cu: 'États-Unis', tags: ['poulet', 'salade', 'rapide', 'léger'], t: 25, d: 1, s: ['printemps', 'été'],
    i: [['poulet_filet', 130], ['salade_verte', 90], ['pain', 40], ['parmesan', 20], ['yaourt_grec', 35], ['moutarde', 5], ['anchois', 5], ['citron', 0.25], ['ail', 0.5], ['huile_olive', 8]],
    e: ['Griller le poulet et le trancher.', 'Toaster les croûtons de pain à l\'huile d\'olive et à l\'ail.', 'Mixer yaourt, moutarde, anchois et citron pour la sauce.', 'Assembler salade, poulet, croûtons, sauce et copeaux de parmesan.'] },

  { id: 'poulet_ciboulette_printanier', n: 'Poulet à la ciboulette et petits pois', cu: 'France', tags: ['poulet', 'printemps', 'léger', 'rapide'], t: 30, d: 1, s: ['printemps'],
    i: [['poulet_filet', 140], ['petit_pois', 130], ['creme_liquide', 40], ['echalote', 1], ['ciboulette', 6], ['vin_blanc', 30], ['riz_basmati', 70], ['huile_olive', 6]],
    e: ['Dorer le poulet 6 min, réserver.', 'Suer l\'échalote, déglacer au vin blanc.', 'Ajouter petits pois et crème, cuire 8 min.', 'Remettre le poulet, ajouter la ciboulette, servir avec le riz.'] },

  { id: 'curry_vert_poulet', n: 'Curry vert de poulet thaï', cu: 'Thaïlande', tags: ['poulet', 'curry', 'épicé', 'coco'], t: 35, d: 2,
    i: [['poulet_emince', 130], ['lait_coco', 90], ['pate_curry', 18], ['aubergine', 90], ['haricot_vert', 70], ['citron_vert', 0.25], ['basilic', 4], ['riz_basmati', 75], ['huile_tournesol', 6]],
    e: ['Faire chauffer la pâte de curry dans l\'huile 1 min.', 'Ajouter le poulet et le saisir 4 min.', 'Verser le lait de coco, ajouter aubergine et haricots verts.', 'Mijoter 15 min, finir au citron vert et basilic.', 'Servir avec le riz.'] },

  { id: 'poulet_miel_soja_four', n: 'Cuisses de poulet miel-soja au four', cu: 'Asie', tags: ['poulet', 'four', 'sucré-salé', 'facile'], t: 55, d: 1,
    i: [['poulet_cuisse', 180], ['sauce_soja', 20], ['miel', 12], ['ail', 2], ['gingembre', 5], ['patate_douce', 170], ['graine_sesame', 5], ['huile_olive', 6]],
    e: ['Mélanger soja, miel, ail et gingembre.', 'Badigeonner les cuisses, laisser mariner 15 min.', 'Enfourner à 190 °C avec les patates douces en cubes, 40 min.', 'Arroser toutes les 15 min, parsemer de sésame.'] },

  { id: 'burger_poulet_croustillant', n: 'Burger de poulet croustillant', cu: 'États-Unis', tags: ['poulet', 'burger', 'convivial', 'croustillant'], t: 35, d: 2,
    i: [['poulet_filet', 130], ['chapelure', 35], ['oeuf', 0.5], ['pain_burger', 1], ['salade_verte', 25], ['tomate', 50], ['oignon_rouge', 0.25], ['yaourt_grec', 30], ['moutarde', 6], ['huile_tournesol', 12], ['pomme_de_terre', 150]],
    e: ['Aplatir le filet, le passer dans l\'œuf puis la chapelure.', 'Cuire 4 min par face à la poêle.', 'Préparer des frites au four 25 min à 210 °C.', 'Mélanger yaourt et moutarde, assembler le burger.'] },

  { id: 'gratin_poulet_brocoli', n: 'Gratin de poulet et brocolis', cu: 'France', tags: ['poulet', 'gratin', 'four', 'réconfortant'], t: 50, d: 1,
    i: [['poulet_filet', 130], ['brocoli', 150], ['pates', 80], ['lait', 100], ['farine', 12], ['beurre', 12], ['gruyere_rape', 30], ['muscade', 0.3]],
    e: ['Cuire les pâtes et blanchir les brocolis 5 min.', 'Poêler le poulet en cubes.', 'Préparer une béchamel avec beurre, farine, lait et muscade.', 'Mélanger le tout, couvrir de fromage et gratiner 20 min à 200 °C.'] },

  { id: 'poulet_chasseur', n: 'Poulet chasseur', cu: 'France', tags: ['poulet', 'mijoté', 'champignons', 'traditionnel'], t: 60, d: 2, s: ['automne', 'hiver'],
    i: [['poulet_cuisse', 180], ['champignon', 110], ['tomate_pelee', 100], ['echalote', 1], ['vin_blanc', 50], ['thym', 1], ['pomme_de_terre', 180], ['persil', 4], ['huile_olive', 7]],
    e: ['Dorer le poulet de tous côtés, réserver.', 'Faire revenir échalotes et champignons.', 'Déglacer au vin blanc, ajouter tomates et thym.', 'Remettre le poulet, mijoter 35 min à couvert.', 'Servir avec les pommes de terre et le persil.'] },

  { id: 'brochettes_poulet_courgettes', n: 'Brochettes de poulet et courgettes grillées', cu: 'Méditerranée', tags: ['poulet', 'grillade', 'été', 'léger'], t: 30, d: 1, s: ['été'],
    i: [['poulet_filet', 140], ['courgette', 120], ['poivron', 70], ['citron', 0.25], ['origan', 2], ['boulgour', 70], ['huile_olive', 9], ['ail', 1]],
    e: ['Mariner les cubes de poulet avec huile, citron, ail et origan 20 min.', 'Monter les brochettes en alternant poulet et légumes.', 'Griller 12 min en retournant régulièrement.', 'Servir avec le boulgour.'] },

  { id: 'poulet_coco_epinards', n: 'Poulet aux épinards et lait de coco', cu: 'Inde', tags: ['poulet', 'épinards', 'coco', 'rapide'], t: 30, d: 1,
    i: [['poulet_filet', 140], ['epinard_surgele', 150], ['lait_coco', 70], ['ail', 2], ['gingembre', 5], ['curcuma', 2], ['cumin', 2], ['riz_basmati', 70], ['huile_olive', 6]],
    e: ['Saisir le poulet en cubes 5 min, réserver.', 'Faire revenir ail, gingembre et épices.', 'Ajouter les épinards décongelés puis le lait de coco.', 'Remettre le poulet, mijoter 10 min, servir avec le riz.'] },

  { id: 'riz_cantonais_poulet', n: 'Riz cantonais au poulet', cu: 'Chine', tags: ['poulet', 'riz', 'rapide', 'anti-gaspi'], t: 25, d: 1,
    i: [['poulet_emince', 110], ['riz_basmati', 80], ['oeuf', 1], ['petit_pois', 70], ['carotte', 60], ['jambon_blanc', 0.5], ['sauce_soja', 15], ['huile_sesame', 6], ['oignon', 0.25]],
    e: ['Cuire le riz à l\'avance et le laisser refroidir.', 'Brouiller l\'œuf dans le wok, réserver.', 'Saisir le poulet et le jambon, ajouter carottes et petits pois.', 'Ajouter le riz, la sauce soja et l\'œuf, sauter 3 min à feu vif.'] },

  { id: 'soupe_poulet_nouilles', n: 'Soupe de poulet aux nouilles et gingembre', cu: 'Asie', tags: ['poulet', 'soupe', 'réconfortant', 'léger'], t: 35, d: 1, s: ['automne', 'hiver'],
    i: [['poulet_filet', 110], ['nouilles_riz', 70], ['carotte', 70], ['champignon', 60], ['gingembre', 8], ['bouillon_cube', 1], ['sauce_soja', 12], ['coriandre', 5], ['citron_vert', 0.25], ['chou_blanc', 60]],
    e: ['Porter 500 ml d\'eau par personne à ébullition avec le bouillon et le gingembre.', 'Pocher le poulet 12 min, l\'effilocher.', 'Ajouter carottes, chou et champignons, cuire 6 min.', 'Ajouter les nouilles 4 min.', 'Servir avec coriandre, soja et citron vert.'] },

  { id: 'poulet_citron_thym_pdt', n: 'Poulet citron-thym et pommes de terre', cu: 'France', tags: ['poulet', 'four', 'citron', 'facile'], t: 60, d: 1,
    i: [['poulet_cuisse', 180], ['pomme_de_terre', 200], ['citron', 0.5], ['ail', 2], ['thym', 2], ['huile_olive', 9], ['oignon', 0.5], ['haricot_vert', 110]],
    e: ['Disposer pommes de terre, oignons et ail dans un plat.', 'Poser le poulet, arroser d\'huile et de jus de citron, ajouter les rondelles de citron et le thym.', 'Enfourner 45 min à 200 °C.', 'Arroser à mi-cuisson.'] },

  { id: 'pates_poulet_pesto', n: 'Pâtes au poulet et pesto', cu: 'Italie', tags: ['poulet', 'pâtes', 'rapide', 'pesto'], t: 25, d: 1,
    i: [['poulet_filet', 130], ['pates', 95], ['pesto', 25], ['tomate_cerise', 90], ['roquette', 25], ['parmesan', 15], ['huile_olive', 6]],
    e: ['Cuire les pâtes al dente.', 'Poêler le poulet en lamelles 6 min.', 'Ajouter les tomates cerises coupées en deux 2 min.', 'Mélanger le tout avec le pesto, un peu d\'eau de cuisson, la roquette et le parmesan.'] },

  { id: 'escalope_dinde_milanaise', n: 'Escalope de dinde milanaise', cu: 'Italie', tags: ['dinde', 'panée', 'rapide', 'enfants'], t: 30, d: 1,
    i: [['dinde_escalope', 140], ['chapelure', 35], ['oeuf', 0.5], ['parmesan', 12], ['spaghetti', 85], ['coulis_tomate', 90], ['basilic', 4], ['huile_olive', 10]],
    e: ['Paner l\'escalope : farine, œuf battu, chapelure mêlée au parmesan.', 'Cuire 3 min par face à la poêle.', 'Cuire les spaghetti et les réchauffer dans le coulis.', 'Servir avec le basilic.'] },

  { id: 'dinde_curry_pommes', n: 'Sauté de dinde au curry et aux pommes', cu: 'France', tags: ['dinde', 'curry', 'sucré-salé', 'rapide'], t: 30, d: 1, s: ['automne', 'hiver'],
    i: [['dinde_escalope', 140], ['pomme', 0.75], ['oignon', 0.5], ['curry', 4], ['creme_liquide', 40], ['riz_complet', 75], ['huile_olive', 6], ['persil', 3], ['brocoli', 110]],
    e: ['Saisir la dinde en lanières 5 min, réserver.', 'Faire fondre oignon et pommes en quartiers 6 min.', 'Ajouter le curry puis la crème, réduire 4 min.', 'Remettre la dinde, servir avec le riz complet.'] },

  { id: 'boulettes_dinde_tomate', n: 'Boulettes de dinde à la tomate', cu: 'Italie', tags: ['dinde', 'boulettes', 'familial', 'tomate'], t: 40, d: 1,
    i: [['dinde_hache', 130], ['oeuf', 0.3], ['chapelure', 20], ['coulis_tomate', 140], ['oignon', 0.5], ['ail', 1], ['origan', 2], ['spaghetti', 90], ['parmesan', 12], ['huile_olive', 7]],
    e: ['Mélanger la viande hachée, l\'œuf, la chapelure et l\'oignon râpé, façonner des boulettes.', 'Les dorer à la poêle 6 min.', 'Ajouter coulis, ail et origan, mijoter 20 min.', 'Servir sur les spaghetti avec le parmesan.'] },

  { id: 'chili_dinde_haricots', n: 'Chili de dinde aux haricots rouges', cu: 'Mexique', tags: ['dinde', 'chili', 'haricots', 'batch-cooking'], t: 45, d: 1,
    i: [['dinde_hache', 110], ['haricot_rouge', 110], ['tomate_pelee', 130], ['poivron', 80], ['oignon', 0.5], ['ail', 2], ['cumin', 3], ['paprika', 3], ['riz_basmati', 65], ['huile_olive', 7]],
    e: ['Faire revenir oignon, ail et poivron 6 min.', 'Ajouter la dinde hachée, la colorer.', 'Ajouter épices, tomates et haricots égouttés.', 'Mijoter 25 min à feu doux.', 'Servir avec le riz.'] },

  { id: 'dinde_vin_blanc_champignons', n: 'Dinde au vin blanc et champignons', cu: 'France', tags: ['dinde', 'mijoté', 'champignons'], t: 40, d: 1,
    i: [['dinde_escalope', 150], ['champignon', 120], ['vin_blanc', 60], ['echalote', 1], ['creme_liquide', 35], ['polenta', 70], ['persil', 4], ['huile_olive', 6]],
    e: ['Dorer les escalopes coupées en lanières, réserver.', 'Suer échalote et champignons 8 min.', 'Déglacer au vin blanc, laisser réduire de moitié.', 'Ajouter la crème et la dinde, mijoter 8 min.', 'Servir avec la polenta crémeuse.'] },

  { id: 'keftas_dinde_menthe', n: 'Keftas de dinde à la menthe', cu: 'Maroc', tags: ['dinde', 'keftas', 'grillade', 'oriental'], t: 35, d: 1,
    i: [['dinde_hache', 135], ['menthe', 5], ['oignon', 0.5], ['cumin', 3], ['paprika', 2], ['semoule', 70], ['courgette', 100], ['yaourt_grec', 40], ['huile_olive', 8], ['ail', 1]],
    e: ['Mélanger la viande avec oignon râpé, menthe ciselée et épices.', 'Former des keftas allongées.', 'Griller 10 min en les retournant.', 'Servir avec la semoule, les courgettes poêlées et le yaourt à l\'ail.'] },

  { id: 'filet_mignon_moutarde', n: 'Filet mignon à la moutarde', cu: 'France', tags: ['porc', 'crémeux', 'four', 'familial'], t: 45, d: 2,
    i: [['porc_filet', 150], ['moutarde', 15], ['creme_liquide', 45], ['echalote', 1], ['vin_blanc', 40], ['haricot_vert', 130], ['pomme_de_terre', 150], ['huile_olive', 7], ['thym', 1]],
    e: ['Saisir le filet mignon sur toutes ses faces.', 'Le badigeonner de moutarde et l\'enfourner 20 min à 180 °C.', 'Suer l\'échalote, déglacer au vin blanc, ajouter la crème et le jus de cuisson.', 'Trancher la viande, napper de sauce, servir avec haricots et pommes de terre.'] },

  { id: 'porc_caramel_vietnamien', n: 'Porc au caramel vietnamien', cu: 'Vietnam', tags: ['porc', 'sucré-salé', 'asiatique', 'mijoté'], t: 45, d: 2,
    i: [['porc_filet', 150], ['sucre', 15], ['sauce_soja', 20], ['ail', 2], ['gingembre', 5], ['oignon', 0.5], ['riz_basmati', 75], ['chou_blanc', 90], ['coriandre', 4], ['huile_tournesol', 6]],
    e: ['Faire un caramel à sec avec le sucre.', 'Ajouter le porc en cubes et l\'enrober.', 'Ajouter soja, ail, gingembre, oignon et un peu d\'eau.', 'Mijoter 25 min à couvert jusqu\'à une sauce sirupeuse.', 'Servir avec riz et chou sauté.'] },

  { id: 'cote_porc_pommes', n: 'Côte de porc aux pommes', cu: 'France', tags: ['porc', 'sucré-salé', 'rapide', 'automne'], t: 30, d: 1, s: ['automne', 'hiver'],
    i: [['porc_cote', 160], ['pomme', 1], ['oignon', 0.5], ['creme_liquide', 35], ['moutarde', 8], ['pomme_de_terre', 180], ['beurre', 10], ['thym', 1], ['haricot_vert', 120]],
    e: ['Poêler les côtes 5 min par face, réserver au chaud.', 'Faire revenir les quartiers de pommes et l\'oignon au beurre.', 'Déglacer avec un peu d\'eau, ajouter crème et moutarde.', 'Servir avec les pommes de terre vapeur.'] },

  { id: 'porc_aigre_doux', n: 'Porc aigre-doux à l\'ananas', cu: 'Chine', tags: ['porc', 'sucré-salé', 'asiatique', 'wok'], t: 35, d: 2,
    i: [['porc_filet', 140], ['ananas', 90], ['poivron', 90], ['oignon', 0.5], ['vinaigre', 15], ['sucre', 12], ['concentre_tomate', 15], ['maizena', 8], ['riz_basmati', 75], ['huile_tournesol', 8]],
    e: ['Saisir le porc en cubes à feu vif, réserver.', 'Faire sauter poivron et oignon 5 min.', 'Ajouter ananas, vinaigre, sucre et concentré de tomate.', 'Lier à la maïzena délayée, remettre le porc 3 min.', 'Servir avec le riz.'] },

  { id: 'saute_porc_champignons', n: 'Sauté de porc aux champignons', cu: 'France', tags: ['porc', 'mijoté', 'champignons', 'batch-cooking'], t: 60, d: 1, s: ['automne', 'hiver'],
    i: [['porc_filet', 150], ['champignon', 120], ['oignon', 0.5], ['carotte', 70], ['vin_blanc', 50], ['bouillon_cube', 0.5], ['tagliatelle', 85], ['thym', 1], ['huile_olive', 7]],
    e: ['Dorer les morceaux de porc, réserver.', 'Faire revenir oignon, carotte et champignons.', 'Déglacer au vin blanc, ajouter le bouillon et le thym.', 'Remettre la viande, mijoter 40 min à couvert.', 'Servir avec les tagliatelles.'] },

  { id: 'magret_canard_miel', n: 'Magret de canard au miel et pommes', cu: 'France', tags: ['canard', 'festif', 'sucré-salé'], t: 35, d: 2,
    i: [['canard_magret', 150], ['miel', 10], ['vinaigre_balsamique', 12], ['pomme', 0.75], ['pomme_de_terre', 170], ['thym', 1], ['beurre', 8], ['haricot_vert', 130]],
    e: ['Quadriller le gras du magret, le cuire côté peau 7 min, puis 4 min côté chair.', 'Réserver sous aluminium.', 'Dégraisser, déglacer au vinaigre et au miel.', 'Poêler les pommes au beurre.', 'Trancher le magret, napper de sauce, servir avec les pommes de terre sautées.'] },

  { id: 'poulet_tandoori', n: 'Poulet tandoori au yaourt', cu: 'Inde', tags: ['poulet', 'épicé', 'four', 'yaourt'], t: 45, d: 1,
    i: [['poulet_cuisse', 170], ['yaourt_nature', 1], ['garam_masala', 4], ['paprika', 4], ['curcuma', 2], ['ail', 2], ['gingembre', 6], ['citron', 0.25], ['riz_basmati', 75], ['concombre', 70], ['tomate', 80]],
    e: ['Mélanger yaourt, épices, ail, gingembre et citron.', 'Y mariner le poulet au moins 30 min.', 'Enfourner 35 min à 200 °C.', 'Servir avec le riz et un raïta de concombre.'] },

  /* ===================== VIANDES ROUGES & CHARCUTERIE =================== */
  { id: 'boeuf_bourguignon', n: 'Bœuf bourguignon', cu: 'France', tags: ['bœuf', 'mijoté', 'traditionnel', 'hiver'], t: 180, d: 2, s: ['automne', 'hiver'],
    i: [['boeuf_mijot', 160], ['carotte', 100], ['oignon', 0.75], ['champignon', 80], ['lardons', 25], ['vin_rouge', 120], ['farine', 10], ['ail', 1], ['thym', 1], ['laurier', 1], ['pomme_de_terre', 180], ['huile_olive', 7]],
    e: ['Faire dorer les lardons puis la viande en morceaux, saupoudrer de farine.', 'Ajouter oignons et carottes, mouiller au vin rouge.', 'Ajouter ail, thym et laurier, couvrir et mijoter 2 h 30 à feu très doux.', 'Ajouter les champignons 20 min avant la fin.', 'Servir avec les pommes de terre vapeur.'] },

  { id: 'chili_con_carne', n: 'Chili con carne', cu: 'Mexique', tags: ['bœuf', 'chili', 'épicé', 'batch-cooking'], t: 50, d: 1,
    i: [['boeuf_hache', 110], ['haricot_rouge', 110], ['tomate_pelee', 130], ['poivron', 80], ['oignon', 0.5], ['ail', 2], ['cumin', 3], ['paprika', 3], ['riz_basmati', 65], ['huile_olive', 7], ['coriandre', 4]],
    e: ['Faire revenir oignon, ail et poivron.', 'Ajouter la viande hachée et la colorer.', 'Ajouter épices, tomates et haricots.', 'Mijoter 30 min à découvert.', 'Servir avec le riz et la coriandre.'] },

  { id: 'lasagnes_bolognaise', n: 'Lasagnes à la bolognaise', cu: 'Italie', tags: ['bœuf', 'gratin', 'four', 'familial'], t: 90, d: 2,
    i: [['boeuf_hache', 100], ['lasagne', 70], ['tomate_pelee', 130], ['carotte', 50], ['oignon', 0.5], ['lait', 110], ['farine', 12], ['beurre', 12], ['gruyere_rape', 25], ['parmesan', 10], ['ail', 1], ['huile_olive', 7], ['muscade', 0.3]],
    e: ['Préparer la bolognaise : oignon, carotte, ail, viande puis tomates, mijoter 30 min.', 'Réaliser une béchamel beurre-farine-lait, muscader.', 'Alterner plaques, bolognaise et béchamel.', 'Couvrir de fromage et enfourner 35 min à 180 °C.'] },

  { id: 'spaghetti_bolognaise', n: 'Spaghetti bolognaise', cu: 'Italie', tags: ['bœuf', 'pâtes', 'familial', 'tomate'], t: 45, d: 1,
    i: [['boeuf_hache', 110], ['spaghetti', 95], ['tomate_pelee', 140], ['carotte', 50], ['oignon', 0.5], ['ail', 2], ['origan', 2], ['parmesan', 15], ['huile_olive', 7]],
    e: ['Faire revenir oignon, carotte et ail finement hachés 8 min.', 'Ajouter la viande et la colorer.', 'Ajouter les tomates et l\'origan, mijoter 25 min.', 'Cuire les spaghetti al dente et les mélanger à la sauce.'] },

  { id: 'hachis_parmentier', n: 'Hachis parmentier', cu: 'France', tags: ['bœuf', 'gratin', 'réconfortant', 'familial'], t: 60, d: 1,
    i: [['boeuf_hache', 110], ['pomme_de_terre', 250], ['lait', 60], ['beurre', 12], ['oignon', 0.5], ['ail', 1], ['gruyere_rape', 20], ['persil', 4], ['muscade', 0.3], ['huile_olive', 5], ['carotte', 80]],
    e: ['Cuire les pommes de terre et les écraser avec lait, beurre et muscade.', 'Faire revenir oignon et ail, ajouter la viande 8 min.', 'Dresser viande puis purée dans un plat.', 'Parsemer de fromage et gratiner 20 min à 200 °C.'] },

  { id: 'boeuf_carottes', n: 'Bœuf aux carottes', cu: 'France', tags: ['bœuf', 'mijoté', 'traditionnel', 'batch-cooking'], t: 150, d: 1, s: ['automne', 'hiver'],
    i: [['boeuf_mijot', 160], ['carotte', 200], ['oignon', 0.75], ['ail', 2], ['bouillon_cube', 0.5], ['vin_blanc', 60], ['thym', 1], ['laurier', 1], ['pomme_de_terre', 150], ['huile_olive', 7]],
    e: ['Dorer la viande, ajouter oignons et ail.', 'Ajouter carottes en rondelles, vin blanc, bouillon et aromates.', 'Couvrir et mijoter 2 h à feu doux.', 'Servir avec des pommes de terre vapeur.'] },

  { id: 'steak_frites_maison', n: 'Steak, frites maison et salade', cu: 'France', tags: ['bœuf', 'rapide', 'bistrot'], t: 40, d: 1,
    i: [['boeuf_steak', 150], ['pomme_de_terre', 220], ['salade_verte', 50], ['moutarde', 6], ['vinaigre', 8], ['huile_olive', 12], ['echalote', 0.5], ['haricot_vert', 110]],
    e: ['Tailler les pommes de terre en frites, les enfourner 30 min à 210 °C en remuant.', 'Saisir le steak 2 min par face selon l\'épaisseur.', 'Préparer la vinaigrette moutarde-vinaigre-huile.', 'Laisser reposer la viande 3 min avant de servir.'] },

  { id: 'burger_maison_boeuf', n: 'Burger maison au comté', cu: 'États-Unis', tags: ['bœuf', 'burger', 'convivial'], t: 35, d: 1,
    i: [['boeuf_hache', 130], ['pain_burger', 1], ['comte', 25], ['tomate', 50], ['salade_verte', 25], ['oignon_rouge', 0.25], ['moutarde', 6], ['yaourt_grec', 25], ['pomme_de_terre', 180], ['huile_olive', 8]],
    e: ['Façonner les steaks hachés, les saisir 3 min par face.', 'Poser le comté sur la viande pour qu\'il fonde.', 'Toaster les pains, assembler avec crudités et sauce yaourt-moutarde.', 'Servir avec des frites au four.'] },

  { id: 'wok_boeuf_brocoli', n: 'Wok de bœuf aux brocolis', cu: 'Chine', tags: ['bœuf', 'wok', 'rapide', 'asiatique'], t: 25, d: 1,
    i: [['boeuf_steak', 130], ['brocoli', 140], ['sauce_soja', 18], ['gingembre', 6], ['ail', 2], ['maizena', 6], ['riz_basmati', 75], ['huile_sesame', 7], ['graine_sesame', 5]],
    e: ['Émincer le bœuf finement, le mélanger à la maïzena et à un peu de soja.', 'Blanchir les brocolis 3 min.', 'Saisir la viande 2 min à feu très vif, réserver.', 'Sauter ail et gingembre, ajouter brocolis puis viande et sauce soja.', 'Servir sur le riz avec le sésame.'] },

  { id: 'bo_bun_boeuf', n: 'Bo bun au bœuf et vermicelles', cu: 'Vietnam', tags: ['bœuf', 'salade', 'frais', 'asiatique'], t: 35, d: 2, s: ['printemps', 'été'],
    i: [['boeuf_steak', 130], ['nouilles_riz', 70], ['carotte', 70], ['concombre', 70], ['salade_verte', 40], ['menthe', 5], ['coriandre', 5], ['sauce_soja', 15], ['citron_vert', 0.5], ['sucre', 8], ['noix_cajou', 15], ['huile_sesame', 6]],
    e: ['Cuire les vermicelles, les rafraîchir.', 'Mariner le bœuf émincé avec soja, ail et sucre 15 min.', 'Préparer la sauce : citron vert, sucre, soja et eau.', 'Saisir la viande 2 min à feu vif.', 'Dresser vermicelles, crudités, herbes, bœuf et cajous concassées, arroser de sauce.'] },

  { id: 'keftas_boeuf_tomate', n: 'Keftas de bœuf à la sauce tomate', cu: 'Maroc', tags: ['bœuf', 'boulettes', 'oriental', 'tomate'], t: 45, d: 1,
    i: [['boeuf_hache', 120], ['oignon', 0.5], ['cumin', 3], ['paprika', 2], ['persil', 5], ['tomate_pelee', 130], ['oeuf', 0.5], ['semoule', 70], ['ail', 1], ['huile_olive', 7]],
    e: ['Mélanger la viande avec oignon râpé, persil et épices, façonner des boulettes.', 'Les dorer à la poêle.', 'Ajouter les tomates et l\'ail, mijoter 20 min.', 'Casser les œufs dans la sauce en fin de cuisson si souhaité.', 'Servir avec la semoule.'] },

  { id: 'boeuf_stroganov', n: 'Bœuf Stroganov', cu: 'Russie', tags: ['bœuf', 'crémeux', 'champignons'], t: 40, d: 2,
    i: [['boeuf_steak', 140], ['champignon', 120], ['oignon', 0.5], ['creme_fraiche', 40], ['moutarde', 8], ['paprika', 3], ['tagliatelle', 85], ['cornichon', 20], ['huile_olive', 7], ['persil', 4]],
    e: ['Saisir les lanières de bœuf 2 min à feu vif, réserver.', 'Faire revenir oignon et champignons 8 min.', 'Ajouter paprika, crème et moutarde, réduire 5 min.', 'Remettre la viande, ajouter les cornichons en lamelles.', 'Servir sur les tagliatelles.'] },

  { id: 'fajitas_boeuf', n: 'Fajitas de bœuf', cu: 'Mexique', tags: ['bœuf', 'mexicain', 'rapide', 'convivial'], t: 30, d: 1,
    i: [['boeuf_steak', 130], ['poivron', 120], ['oignon_rouge', 0.5], ['tortilla', 2], ['cumin', 3], ['paprika', 3], ['citron_vert', 0.25], ['avocat', 0.4], ['yaourt_grec', 25], ['huile_olive', 7]],
    e: ['Mariner le bœuf émincé avec les épices et l\'huile.', 'Saisir la viande 3 min à feu vif, réserver.', 'Faire sauter poivrons et oignons 6 min.', 'Écraser l\'avocat avec le citron vert.', 'Garnir les tortillas chaudes.'] },

  { id: 'boulettes_suedoises', n: 'Boulettes suédoises à la crème', cu: 'Suède', tags: ['bœuf', 'boulettes', 'crémeux', 'réconfortant'], t: 45, d: 2,
    i: [['boeuf_hache', 120], ['oignon', 0.5], ['chapelure', 20], ['oeuf', 0.3], ['creme_liquide', 45], ['bouillon_cube', 0.5], ['farine', 8], ['muscade', 0.3], ['pomme_de_terre', 200], ['beurre', 10], ['persil', 3], ['chou_rouge', 90]],
    e: ['Mélanger viande, oignon râpé, chapelure, œuf et muscade, former des boulettes.', 'Les dorer au beurre, réserver.', 'Faire un roux avec le beurre et la farine, mouiller au bouillon et à la crème.', 'Remettre les boulettes 10 min.', 'Servir avec une purée de pommes de terre.'] },

  { id: 'moussaka_agneau', n: 'Moussaka d\'agneau et aubergines', cu: 'Grèce', tags: ['agneau', 'gratin', 'four', 'aubergine'], t: 90, d: 3, s: ['été', 'automne'],
    i: [['agneau_epaule', 110], ['aubergine', 180], ['tomate_pelee', 120], ['oignon', 0.5], ['ail', 2], ['lait', 100], ['farine', 10], ['beurre', 10], ['gruyere_rape', 25], ['cannelle', 0.5], ['origan', 2], ['huile_olive', 12]],
    e: ['Trancher les aubergines, les huiler et les rôtir 20 min à 200 °C.', 'Faire revenir oignon, ail et agneau haché, ajouter tomates, cannelle et origan, mijoter 20 min.', 'Préparer la béchamel.', 'Alterner aubergines et viande, napper de béchamel et de fromage.', 'Enfourner 30 min à 180 °C.'] },

  { id: 'tajine_agneau_abricots', n: 'Tajine d\'agneau aux abricots', cu: 'Maroc', tags: ['agneau', 'tajine', 'sucré-salé', 'mijoté'], t: 120, d: 2, s: ['automne', 'hiver'],
    i: [['agneau_epaule', 150], ['abricot_sec', 40], ['oignon', 0.75], ['amande', 15], ['ras_el_hanout', 4], ['cannelle', 1], ['miel', 8], ['semoule', 70], ['coriandre', 4], ['huile_olive', 8]],
    e: ['Dorer l\'agneau avec les oignons et les épices.', 'Couvrir d\'eau à hauteur et mijoter 1 h 15 à couvert.', 'Ajouter abricots et miel, poursuivre 20 min.', 'Torréfier les amandes et en parsemer le plat.', 'Servir avec la semoule.'] },

  { id: 'navarin_agneau', n: 'Navarin d\'agneau printanier', cu: 'France', tags: ['agneau', 'mijoté', 'printemps', 'légumes'], t: 105, d: 2, s: ['printemps'],
    i: [['agneau_epaule', 150], ['carotte', 90], ['navet', 90], ['petit_pois', 70], ['pomme_de_terre', 130], ['oignon', 0.5], ['concentre_tomate', 12], ['farine', 8], ['thym', 1], ['huile_olive', 7], ['ail', 1]],
    e: ['Dorer la viande, saupoudrer de farine et laisser roussir.', 'Ajouter concentré de tomate, ail, thym et eau à hauteur.', 'Mijoter 50 min.', 'Ajouter carottes, navets et pommes de terre, cuire 30 min.', 'Ajouter les petits pois 8 min avant la fin.'] },

  { id: 'curry_agneau_epinards', n: 'Curry d\'agneau aux épinards', cu: 'Inde', tags: ['agneau', 'curry', 'épicé', 'épinards'], t: 90, d: 2,
    i: [['agneau_epaule', 140], ['epinard_surgele', 150], ['oignon', 0.5], ['ail', 2], ['gingembre', 6], ['garam_masala', 4], ['curcuma', 2], ['yaourt_nature', 0.5], ['riz_basmati', 75], ['huile_olive', 8]],
    e: ['Dorer l\'agneau, réserver.', 'Faire revenir oignon, ail, gingembre et épices.', 'Remettre la viande, ajouter un verre d\'eau, mijoter 1 h.', 'Ajouter les épinards et le yaourt en fin de cuisson.', 'Servir avec le riz basmati.'] },

  { id: 'blanquette_veau', n: 'Blanquette de veau', cu: 'France', tags: ['veau', 'mijoté', 'crémeux', 'traditionnel'], t: 120, d: 3, s: ['automne', 'hiver'],
    i: [['veau_escalope', 160], ['carotte', 90], ['champignon', 90], ['poireau', 70], ['creme_liquide', 45], ['farine', 12], ['beurre', 12], ['oeuf', 0.3], ['citron', 0.25], ['riz_basmati', 70], ['laurier', 1]],
    e: ['Blanchir la viande 5 min, la rincer.', 'La cuire 1 h 15 avec carottes, poireau et laurier.', 'Faire un roux blanc, le mouiller avec le bouillon filtré.', 'Lier avec crème, jaune d\'œuf et citron hors du feu.', 'Ajouter viande et champignons poêlés, servir avec le riz.'] },

  { id: 'veau_marengo', n: 'Veau Marengo', cu: 'France', tags: ['veau', 'mijoté', 'tomate'], t: 110, d: 2,
    i: [['veau_escalope', 160], ['tomate_pelee', 120], ['champignon', 90], ['carotte', 70], ['oignon', 0.5], ['vin_blanc', 60], ['ail', 2], ['farine', 10], ['thym', 1], ['pates', 85], ['huile_olive', 7]],
    e: ['Dorer la viande, fariner et laisser colorer.', 'Ajouter oignon, carotte, ail, vin blanc et tomates.', 'Mijoter 1 h 15 à couvert.', 'Ajouter les champignons 15 min avant la fin.', 'Servir avec les pâtes.'] },

  { id: 'escalope_veau_citron', n: 'Escalope de veau au citron', cu: 'Italie', tags: ['veau', 'rapide', 'citron', 'léger'], t: 25, d: 1,
    i: [['veau_escalope', 150], ['citron', 0.5], ['farine', 10], ['beurre', 12], ['capre', 10], ['persil', 4], ['haricot_vert', 140], ['pomme_de_terre', 140]],
    e: ['Fariner légèrement les escalopes.', 'Les cuire 2 min par face au beurre.', 'Déglacer au jus de citron, ajouter les câpres.', 'Servir avec haricots verts et pommes de terre vapeur, parsemer de persil.'] },

  { id: 'quiche_lorraine', n: 'Quiche lorraine et salade', cu: 'France', tags: ['lardons', 'tarte', 'four', 'convivial'], t: 55, d: 1,
    i: [['pate_brisee', 60], ['lardons', 45], ['oeuf', 1.5], ['creme_liquide', 60], ['lait', 40], ['gruyere_rape', 25], ['muscade', 0.3], ['salade_verte', 50], ['vinaigre', 6], ['huile_olive', 8], ['tomate_cerise', 70]],
    e: ['Étaler la pâte dans un moule et la piquer.', 'Faire revenir les lardons sans matière grasse.', 'Battre œufs, crème, lait, muscade et fromage.', 'Verser sur les lardons et enfourner 35 min à 180 °C.', 'Servir tiède avec la salade assaisonnée.'] },

  { id: 'tartiflette', n: 'Tartiflette au comté', cu: 'France', tags: ['lardons', 'gratin', 'montagne', 'hiver'], t: 60, d: 1, s: ['hiver'],
    i: [['pomme_de_terre', 280], ['lardons', 50], ['comte', 55], ['oignon', 0.75], ['creme_liquide', 35], ['vin_blanc', 30], ['salade_verte', 40], ['huile_olive', 5], ['vinaigre', 5]],
    e: ['Cuire les pommes de terre 20 min, les couper en rondelles.', 'Faire revenir oignons et lardons, déglacer au vin blanc.', 'Alterner pommes de terre et garniture dans un plat, ajouter la crème.', 'Couvrir de comté et enfourner 25 min à 200 °C.', 'Servir avec une salade verte.'] },

  { id: 'pates_carbonara', n: 'Pâtes à la carbonara (à l\'italienne)', cu: 'Italie', tags: ['lardons', 'pâtes', 'rapide', 'réconfortant'], t: 25, d: 2,
    i: [['spaghetti', 100], ['lardons', 45], ['oeuf', 1], ['parmesan', 25], ['huile_olive', 5], ['salade_verte', 60], ['tomate_cerise', 70], ['vinaigre_balsamique', 6]],
    e: ['Cuire les spaghetti al dente.', 'Faire rissoler les lardons.', 'Battre œufs et parmesan avec du poivre.', 'Hors du feu, mélanger les pâtes chaudes, les lardons et l\'appareil, détendre avec un peu d\'eau de cuisson.'] },

  { id: 'saucisse_lentilles', n: 'Saucisses et lentilles vertes', cu: 'France', tags: ['saucisse', 'lentilles', 'mijoté', 'hiver'], t: 50, d: 1, s: ['automne', 'hiver'],
    i: [['saucisse_toulouse', 130], ['lentille_verte', 80], ['carotte', 80], ['oignon', 0.5], ['ail', 1], ['laurier', 1], ['thym', 1], ['moutarde', 6], ['huile_olive', 6]],
    e: ['Rincer les lentilles, les cuire 25 min avec carotte, oignon, ail et aromates.', 'Faire dorer les saucisses à la poêle 15 min.', 'Mélanger lentilles et jus de cuisson des saucisses.', 'Servir avec une pointe de moutarde.'] },

  { id: 'saucisse_puree', n: 'Saucisse purée maison', cu: 'France', tags: ['saucisse', 'purée', 'réconfortant', 'facile'], t: 40, d: 1,
    i: [['saucisse_toulouse', 130], ['pomme_de_terre', 260], ['lait', 70], ['beurre', 15], ['muscade', 0.3], ['carotte', 90], ['huile_olive', 5]],
    e: ['Cuire les pommes de terre 20 min, les écraser avec lait chaud, beurre et muscade.', 'Cuire la saucisse à la poêle 15 min à feu moyen.', 'Cuire les carottes glacées à côté.', 'Servir bien chaud.'] },

  { id: 'couscous_merguez', n: 'Couscous merguez et légumes', cu: 'Maghreb', tags: ['merguez', 'couscous', 'convivial', 'légumes'], t: 60, d: 2,
    i: [['merguez', 2], ['semoule', 80], ['courgette', 110], ['carotte', 90], ['navet', 70], ['pois_chiche', 80], ['oignon', 0.5], ['concentre_tomate', 15], ['ras_el_hanout', 4], ['harissa', 5], ['huile_olive', 8]],
    e: ['Faire revenir l\'oignon, ajouter le concentré de tomate et les épices.', 'Ajouter les légumes en morceaux et de l\'eau à hauteur, cuire 30 min.', 'Ajouter les pois chiches 10 min avant la fin.', 'Griller les merguez.', 'Gonfler la semoule et servir le tout avec l\'harissa.'] },

  { id: 'pizza_jambon_champignons', n: 'Pizza jambon champignons', cu: 'Italie', tags: ['jambon', 'pizza', 'four', 'convivial'], t: 35, d: 1,
    i: [['pate_pizza', 130], ['coulis_tomate', 80], ['jambon_blanc', 1], ['champignon', 70], ['mozzarella', 50], ['origan', 2], ['huile_olive', 6], ['salade_verte', 40]],
    e: ['Étaler la pâte, la napper de coulis assaisonné d\'origan.', 'Répartir champignons émincés, jambon et mozzarella.', 'Enfourner 15 min à 240 °C.', 'Servir avec une salade verte.'] },

  { id: 'croque_monsieur_salade', n: 'Croque-monsieur et salade verte', cu: 'France', tags: ['jambon', 'rapide', 'bistrot', 'enfants'], t: 25, d: 1,
    i: [['pain_complet', 100], ['jambon_blanc', 1.5], ['comte', 35], ['lait', 60], ['farine', 8], ['beurre', 10], ['muscade', 0.3], ['salade_verte', 60], ['tomate', 60], ['huile_olive', 8], ['vinaigre', 5]],
    e: ['Préparer une béchamel épaisse et la muscader.', 'Tartiner les tranches de pain, garnir de jambon et de fromage.', 'Dorer au four 12 min à 200 °C.', 'Servir avec la salade et les tomates assaisonnées.'] },

  { id: 'gratin_endives_jambon', n: 'Gratin d\'endives au jambon', cu: 'France', tags: ['jambon', 'gratin', 'hiver', 'traditionnel'], t: 55, d: 1, s: ['automne', 'hiver'],
    i: [['endive', 220], ['jambon_blanc', 2], ['lait', 140], ['farine', 14], ['beurre', 14], ['gruyere_rape', 30], ['muscade', 0.3], ['pomme_de_terre', 130]],
    e: ['Braiser les endives 20 min à la poêle jusqu\'à ce qu\'elles rendent leur eau.', 'Enrouler chaque endive dans une tranche de jambon.', 'Napper de béchamel muscadée, couvrir de fromage.', 'Gratiner 25 min à 200 °C, servir avec des pommes de terre vapeur.'] },

  /* ======================= POISSONS & FRUITS DE MER ===================== */
  { id: 'saumon_four_citron_aneth', n: 'Pavé de saumon au four, citron et aneth', cu: 'France', tags: ['saumon', 'four', 'léger', 'rapide'], t: 30, d: 1,
    i: [['saumon_filet', 150], ['citron', 0.5], ['aneth', 5], ['pomme_de_terre', 180], ['haricot_vert', 130], ['huile_olive', 8], ['ail', 1]],
    e: ['Déposer les pavés sur une plaque, arroser d\'huile et de jus de citron.', 'Ajouter rondelles de citron, ail et aneth.', 'Enfourner 15 min à 190 °C.', 'Servir avec pommes de terre vapeur et haricots verts.'] },

  { id: 'saumon_epinards_creme', n: 'Saumon aux épinards à la crème', cu: 'France', tags: ['saumon', 'épinards', 'crémeux', 'rapide'], t: 30, d: 1,
    i: [['saumon_filet', 150], ['epinard_surgele', 160], ['creme_liquide', 45], ['echalote', 1], ['riz_complet', 70], ['citron', 0.25], ['muscade', 0.3], ['huile_olive', 6]],
    e: ['Poêler le saumon 4 min par face, réserver.', 'Suer l\'échalote, ajouter les épinards et laisser évaporer l\'eau.', 'Ajouter la crème, la muscade et le citron.', 'Servir le saumon sur le lit d\'épinards avec le riz.'] },

  { id: 'saumon_teriyaki', n: 'Saumon teriyaki et riz vapeur', cu: 'Japon', tags: ['saumon', 'asiatique', 'sucré-salé', 'rapide'], t: 25, d: 1,
    i: [['saumon_filet', 150], ['sauce_soja', 20], ['miel', 10], ['gingembre', 5], ['riz_basmati', 75], ['brocoli', 120], ['graine_sesame', 5], ['huile_sesame', 5]],
    e: ['Mélanger soja, miel et gingembre râpé.', 'Saisir le saumon côté peau 4 min.', 'Verser la sauce et laisser glacer 3 min.', 'Servir avec riz et brocolis vapeur, parsemer de sésame.'] },

  { id: 'tartare_saumon_avocat', n: 'Tartare de saumon à l\'avocat', cu: 'France', tags: ['saumon', 'cru', 'frais', 'rapide'], t: 20, d: 2, s: ['printemps', 'été'],
    i: [['saumon_filet', 140], ['avocat', 0.5], ['citron_vert', 0.5], ['echalote', 0.5], ['aneth', 5], ['huile_olive', 8], ['pain_complet', 70], ['salade_verte', 40]],
    e: ['Tailler le saumon très frais en petits dés.', 'Mélanger avec échalote ciselée, aneth, citron vert et huile.', 'Ajouter l\'avocat en dés au dernier moment.', 'Servir bien frais avec du pain toasté et une salade.'] },

  { id: 'papillote_saumon_legumes', n: 'Papillote de saumon aux légumes', cu: 'France', tags: ['saumon', 'papillote', 'léger', 'facile'], t: 35, d: 1,
    i: [['saumon_filet', 150], ['courgette', 100], ['carotte', 80], ['poireau', 60], ['citron', 0.25], ['creme_liquide', 20], ['aneth', 4], ['riz_basmati', 70], ['huile_olive', 6]],
    e: ['Tailler les légumes en julienne fine.', 'Déposer légumes puis saumon sur une feuille de papier cuisson.', 'Ajouter citron, crème, aneth, sel et poivre, fermer la papillote.', 'Enfourner 20 min à 190 °C, servir avec le riz.'] },

  { id: 'quiche_saumon_poireaux', n: 'Quiche saumon et poireaux', cu: 'France', tags: ['saumon', 'tarte', 'four'], t: 60, d: 2,
    i: [['pate_brisee', 60], ['saumon_filet', 90], ['poireau', 110], ['oeuf', 1.5], ['creme_liquide', 60], ['lait', 40], ['aneth', 4], ['salade_verte', 45], ['huile_olive', 8]],
    e: ['Fondre les poireaux émincés 12 min à l\'huile.', 'Étaler la pâte, répartir poireaux et saumon en dés.', 'Verser l\'appareil œufs-crème-lait-aneth.', 'Enfourner 35 min à 180 °C.'] },

  { id: 'pates_saumon_citron', n: 'Pâtes au saumon et citron', cu: 'Italie', tags: ['saumon', 'pâtes', 'rapide', 'crémeux'], t: 25, d: 1,
    i: [['tagliatelle', 95], ['saumon_filet', 120], ['creme_liquide', 45], ['citron', 0.5], ['echalote', 1], ['epinard', 60], ['aneth', 4], ['huile_olive', 6]],
    e: ['Cuire les tagliatelles al dente.', 'Suer l\'échalote, ajouter le saumon en dés 3 min.', 'Ajouter crème, zeste et jus de citron, puis les épinards.', 'Mélanger aux pâtes avec un peu d\'eau de cuisson.'] },

  { id: 'saumon_miel_moutarde', n: 'Saumon miel-moutarde au four', cu: 'France', tags: ['saumon', 'four', 'sucré-salé', 'facile'], t: 35, d: 1,
    i: [['saumon_filet', 150], ['miel', 10], ['moutarde', 12], ['patate_douce', 170], ['brocoli', 120], ['citron', 0.25], ['huile_olive', 8]],
    e: ['Mélanger miel, moutarde et un filet d\'huile.', 'Badigeonner les pavés de saumon.', 'Enfourner 15 min à 200 °C avec les patates douces en cubes (départ 15 min avant).', 'Servir avec les brocolis vapeur.'] },

  { id: 'bowl_saumon_quinoa', n: 'Bowl de saumon, quinoa et avocat', cu: 'Fusion', tags: ['saumon', 'bowl', 'léger', 'équilibré'], t: 30, d: 1,
    i: [['saumon_filet', 140], ['quinoa', 70], ['avocat', 0.5], ['concombre', 70], ['carotte', 60], ['citron', 0.5], ['graine_sesame', 6], ['huile_olive', 8], ['sauce_soja', 10]],
    e: ['Cuire le quinoa 12 min, le rafraîchir.', 'Poêler le saumon 4 min par face puis l\'émietter.', 'Tailler concombre et carotte en bâtonnets, l\'avocat en lamelles.', 'Assembler le bowl, assaisonner de soja, citron et huile, parsemer de sésame.'] },

  { id: 'truite_amandes', n: 'Truite aux amandes', cu: 'France', tags: ['truite', 'rapide', 'classique'], t: 25, d: 1,
    i: [['truite_filet', 150], ['amande', 20], ['beurre', 15], ['citron', 0.5], ['persil', 4], ['pomme_de_terre', 180], ['haricot_vert', 120]],
    e: ['Fariner légèrement les filets et les poêler 3 min par face au beurre.', 'Réserver, faire dorer les amandes effilées dans le beurre.', 'Déglacer au jus de citron.', 'Napper la truite, servir avec pommes de terre et haricots verts.'] },

  { id: 'truite_papillote_fenouil', n: 'Truite en papillote au fenouil', cu: 'Méditerranée', tags: ['truite', 'papillote', 'léger', 'fenouil'], t: 35, d: 1,
    i: [['truite_filet', 150], ['fenouil', 120], ['tomate_cerise', 80], ['citron', 0.25], ['olive_noire', 20], ['huile_olive', 8], ['thym', 1], ['riz_complet', 70]],
    e: ['Émincer le fenouil finement.', 'Disposer fenouil, tomates et olives sur le papier cuisson, poser la truite.', 'Arroser d\'huile et de citron, ajouter le thym, fermer.', 'Enfourner 20 min à 190 °C, servir avec le riz.'] },

  { id: 'maquereau_moutarde_four', n: 'Maquereaux à la moutarde', cu: 'France', tags: ['maquereau', 'oméga-3', 'économique', 'four'], t: 30, d: 1,
    i: [['maquereau', 150], ['moutarde', 15], ['creme_liquide', 25], ['citron', 0.25], ['pomme_de_terre', 200], ['epinard', 80], ['huile_olive', 7], ['echalote', 1]],
    e: ['Badigeonner les filets de maquereau de moutarde.', 'Les enfourner 15 min à 190 °C.', 'Faire tomber les épinards avec l\'échalote.', 'Détendre le jus de cuisson à la crème et au citron.', 'Servir avec les pommes de terre vapeur.'] },

  { id: 'sardines_grillees_tomates', n: 'Sardines grillées et tomates à la provençale', cu: 'Méditerranée', tags: ['sardine', 'grillade', 'été', 'économique'], t: 30, d: 1, s: ['été'],
    i: [['sardine_fraiche', 170], ['tomate', 150], ['ail', 2], ['persil', 6], ['chapelure', 15], ['pain', 60], ['huile_olive', 10], ['citron', 0.25]],
    e: ['Vider et rincer les sardines, les huiler.', 'Couper les tomates en deux, les garnir d\'ail, persil et chapelure.', 'Enfourner les tomates 20 min à 200 °C.', 'Griller les sardines 3 min par face.', 'Servir avec du pain de campagne et un filet de citron.'] },

  { id: 'pates_sardines_citron', n: 'Pâtes aux sardines et citron', cu: 'Italie', tags: ['sardine', 'pâtes', 'rapide', 'économique'], t: 20, d: 1,
    i: [['spaghetti', 95], ['sardine_conserve', 80], ['ail', 2], ['citron', 0.5], ['persil', 6], ['chapelure', 15], ['huile_olive', 8], ['piment_espelette', 0.5], ['fenouil', 100]],
    e: ['Cuire les spaghetti al dente.', 'Torréfier la chapelure à sec, réserver.', 'Faire revenir ail et piment dans l\'huile, ajouter les sardines égouttées.', 'Mélanger aux pâtes avec zeste, jus de citron et persil, parsemer de chapelure.'] },

  { id: 'cabillaud_beurre_citron', n: 'Dos de cabillaud beurre citronné', cu: 'France', tags: ['cabillaud', 'rapide', 'léger', 'classique'], t: 25, d: 1,
    i: [['cabillaud', 150], ['beurre', 15], ['citron', 0.5], ['persil', 4], ['pomme_de_terre', 190], ['brocoli', 120], ['ail', 1]],
    e: ['Cuire les pommes de terre et les brocolis vapeur.', 'Poêler le cabillaud 3 min par face.', 'Faire mousser le beurre avec l\'ail, le citron et le persil.', 'Napper le poisson de beurre citronné.'] },

  { id: 'cabillaud_curry_coco', n: 'Cabillaud au curry et lait de coco', cu: 'Inde', tags: ['cabillaud', 'curry', 'coco', 'rapide'], t: 30, d: 1,
    i: [['cabillaud', 150], ['lait_coco', 80], ['curry', 4], ['oignon', 0.5], ['gingembre', 5], ['epinard', 80], ['riz_basmati', 75], ['coriandre', 4], ['citron_vert', 0.25], ['huile_olive', 6]],
    e: ['Faire suer oignon et gingembre, ajouter le curry.', 'Verser le lait de coco et laisser frémir 5 min.', 'Déposer le poisson en morceaux, cuire 8 min à couvert.', 'Ajouter les épinards en fin de cuisson.', 'Servir avec le riz, la coriandre et le citron vert.'] },

  { id: 'parmentier_poisson', n: 'Parmentier de poisson', cu: 'France', tags: ['cabillaud', 'gratin', 'familial', 'réconfortant'], t: 60, d: 2,
    i: [['colin', 140], ['pomme_de_terre', 250], ['lait', 70], ['beurre', 12], ['poireau', 80], ['creme_liquide', 25], ['gruyere_rape', 20], ['aneth', 4], ['muscade', 0.3]],
    e: ['Cuire et écraser les pommes de terre avec lait, beurre et muscade.', 'Fondre les poireaux 10 min.', 'Pocher le poisson 6 min, l\'émietter et le mélanger aux poireaux et à la crème.', 'Couvrir de purée et de fromage, gratiner 20 min à 200 °C.'] },

  { id: 'cabillaud_chorizo_pois_chiches', n: 'Cabillaud, chorizo et pois chiches', cu: 'Espagne', tags: ['cabillaud', 'one-pot', 'pois chiches', 'relevé'], t: 35, d: 1,
    i: [['cabillaud', 150], ['chorizo', 25], ['pois_chiche', 110], ['tomate_pelee', 110], ['poivron', 80], ['oignon', 0.5], ['paprika', 3], ['persil', 4], ['huile_olive', 7]],
    e: ['Faire suer oignon et poivron, ajouter le chorizo en dés.', 'Ajouter tomates, pois chiches et paprika, mijoter 12 min.', 'Poser le cabillaud sur la sauce, couvrir et cuire 8 min.', 'Parsemer de persil.'] },

  { id: 'colin_tomates_olives', n: 'Colin aux tomates et olives', cu: 'Méditerranée', tags: ['colin', 'tomate', 'léger', 'facile'], t: 35, d: 1,
    i: [['colin', 160], ['tomate_pelee', 130], ['olive_noire', 25], ['oignon', 0.5], ['ail', 2], ['origan', 2], ['semoule', 70], ['huile_olive', 8], ['capre', 8]],
    e: ['Faire revenir oignon et ail, ajouter tomates, olives et câpres.', 'Laisser mijoter 10 min, assaisonner d\'origan.', 'Déposer les filets de colin et cuire 10 min à couvert.', 'Servir avec la semoule.'] },

  { id: 'colin_pane_puree_petits_pois', n: 'Colin pané et purée de petits pois', cu: 'France', tags: ['colin', 'pané', 'enfants', 'rapide'], t: 35, d: 1,
    i: [['colin', 150], ['chapelure', 35], ['oeuf', 0.5], ['farine', 12], ['petit_pois', 160], ['pomme_de_terre', 110], ['beurre', 10], ['citron', 0.25], ['menthe', 3], ['huile_tournesol', 10]],
    e: ['Paner les filets : farine, œuf, chapelure.', 'Les cuire 3 min par face à la poêle.', 'Cuire petits pois et pommes de terre, écraser avec beurre et menthe.', 'Servir avec un quartier de citron.'] },

  { id: 'dorade_four_legumes', n: 'Dorade au four et légumes du soleil', cu: 'Méditerranée', tags: ['dorade', 'four', 'légumes', 'été'], t: 50, d: 2, s: ['été'],
    i: [['dorade', 180], ['courgette', 110], ['poivron', 90], ['tomate', 90], ['oignon', 0.5], ['citron', 0.5], ['ail', 2], ['thym', 2], ['huile_olive', 10], ['pomme_de_terre', 120]],
    e: ['Disposer les légumes et pommes de terre en tranches dans un plat, huiler et assaisonner.', 'Enfourner 20 min à 200 °C.', 'Poser la dorade vidée, garnie de citron et de thym.', 'Poursuivre 20 min, arroser du jus de cuisson.'] },

  { id: 'lotte_tomate_basilic', n: 'Lotte à la tomate et au basilic', cu: 'Méditerranée', tags: ['lotte', 'tomate', 'festif'], t: 40, d: 2,
    i: [['lotte', 160], ['tomate_pelee', 130], ['vin_blanc', 40], ['echalote', 1], ['ail', 2], ['basilic', 5], ['riz_basmati', 75], ['huile_olive', 8], ['courgette', 90]],
    e: ['Saisir les médaillons de lotte 2 min par face, réserver.', 'Faire suer échalote et ail, déglacer au vin blanc.', 'Ajouter les tomates et les courgettes, mijoter 12 min.', 'Remettre la lotte 8 min, finir au basilic.', 'Servir avec le riz.'] },

  { id: 'soupe_poisson_rouille', n: 'Soupe de poisson et rouille', cu: 'France', tags: ['poisson', 'soupe', 'hiver', 'convivial'], t: 60, d: 2, s: ['automne', 'hiver'],
    i: [['colin', 110], ['cabillaud', 70], ['tomate_pelee', 110], ['poireau', 80], ['fenouil', 70], ['pomme_de_terre', 90], ['ail', 2], ['curcuma', 1], ['pain', 60], ['gruyere_rape', 20], ['huile_olive', 10], ['oignon', 0.5]],
    e: ['Faire suer poireau, fenouil et oignon.', 'Ajouter tomates, pommes de terre, curcuma et 400 ml d\'eau par personne.', 'Cuire 25 min puis mixer.', 'Pocher les morceaux de poisson 8 min dans le velouté.', 'Servir avec croûtons aillés et fromage râpé.'] },

  { id: 'fish_and_chips', n: 'Fish and chips maison', cu: 'Royaume-Uni', tags: ['cabillaud', 'frit', 'convivial'], t: 45, d: 2,
    i: [['cabillaud', 150], ['farine', 45], ['biere', 60], ['pomme_de_terre', 220], ['petit_pois', 100], ['citron', 0.25], ['huile_tournesol', 20], ['yaourt_grec', 25], ['cornichon', 15]],
    e: ['Préparer une pâte à beignet avec farine et bière.', 'Cuire les frites au four 30 min à 210 °C.', 'Tremper le poisson dans la pâte et le frire 5 min.', 'Écraser les petits pois cuits.', 'Servir avec une sauce yaourt-cornichons et du citron.'] },

  { id: 'crevettes_ail_persil', n: 'Crevettes à l\'ail et au persil', cu: 'Espagne', tags: ['crevettes', 'rapide', 'ail', 'apéro-dînatoire'], t: 20, d: 1,
    i: [['crevette', 140], ['ail', 3], ['persil', 6], ['citron', 0.5], ['piment_espelette', 0.5], ['riz_basmati', 75], ['courgette', 110], ['huile_olive', 10]],
    e: ['Faire chauffer l\'huile avec l\'ail émincé et le piment.', 'Ajouter les crevettes et les saisir 3 min.', 'Déglacer au citron, ajouter le persil.', 'Servir avec le riz et les courgettes poêlées.'] },

  { id: 'crevettes_curry_coco', n: 'Crevettes au curry coco', cu: 'Thaïlande', tags: ['crevettes', 'curry', 'coco', 'rapide'], t: 25, d: 1,
    i: [['crevette', 140], ['lait_coco', 80], ['pate_curry', 15], ['poivron', 80], ['haricot_vert', 70], ['citron_vert', 0.25], ['riz_basmati', 75], ['coriandre', 4], ['huile_tournesol', 6]],
    e: ['Chauffer la pâte de curry dans l\'huile.', 'Ajouter le lait de coco et les légumes, cuire 8 min.', 'Ajouter les crevettes 4 min.', 'Finir au citron vert et à la coriandre, servir avec le riz.'] },

  { id: 'wok_crevettes_nouilles', n: 'Wok de crevettes et nouilles sautées', cu: 'Asie', tags: ['crevettes', 'wok', 'rapide', 'nouilles'], t: 25, d: 1,
    i: [['crevette', 130], ['nouilles_chinoises', 80], ['chou_blanc', 80], ['carotte', 60], ['oignon', 0.5], ['sauce_soja', 18], ['gingembre', 5], ['ail', 2], ['huile_sesame', 7], ['coriandre', 4]],
    e: ['Cuire les nouilles, les égoutter.', 'Saisir les crevettes 2 min, réserver.', 'Faire sauter chou, carotte et oignon 5 min à feu vif.', 'Ajouter nouilles, crevettes, soja, ail et gingembre, sauter 2 min.'] },

  { id: 'risotto_crevettes_citron', n: 'Risotto aux crevettes et citron', cu: 'Italie', tags: ['crevettes', 'risotto', 'crémeux'], t: 40, d: 2,
    i: [['riz_rond', 80], ['crevette', 120], ['vin_blanc', 50], ['bouillon_cube', 0.5], ['echalote', 1], ['parmesan', 20], ['citron', 0.5], ['beurre', 10], ['courgette', 90], ['huile_olive', 6]],
    e: ['Nacrer le riz avec l\'échalote dans l\'huile.', 'Déglacer au vin blanc puis mouiller au bouillon louche par louche 18 min.', 'Ajouter les courgettes en dés à mi-cuisson.', 'Saisir les crevettes à part et les ajouter.', 'Lier au beurre, parmesan et zeste de citron.'] },

  { id: 'paella_fruits_mer', n: 'Paella aux fruits de mer', cu: 'Espagne', tags: ['fruits de mer', 'riz', 'convivial', 'festif'], t: 60, d: 2,
    i: [['riz_rond', 85], ['crevette', 70], ['moule', 120], ['calamar', 60], ['poivron', 80], ['petit_pois', 50], ['tomate_pelee', 80], ['oignon', 0.5], ['ail', 2], ['curcuma', 1.5], ['paprika', 2], ['bouillon_cube', 0.5], ['huile_olive', 9], ['citron', 0.25]],
    e: ['Faire revenir oignon, ail et poivron.', 'Ajouter calamars puis tomates, paprika et curcuma.', 'Ajouter le riz, le nacrer, mouiller avec 2,5 fois son volume de bouillon.', 'Cuire 18 min sans remuer, ajouter crevettes, moules et petits pois à mi-cuisson.', 'Laisser reposer 5 min, servir avec du citron.'] },

  { id: 'moules_marinieres', n: 'Moules marinières et frites', cu: 'Belgique', tags: ['moules', 'convivial', 'rapide'], t: 35, d: 1,
    i: [['moule', 450], ['vin_blanc', 60], ['echalote', 1.5], ['persil', 6], ['beurre', 12], ['pomme_de_terre', 200], ['ail', 1], ['huile_tournesol', 10], ['salade_verte', 60], ['tomate', 60]],
    e: ['Nettoyer et gratter les moules.', 'Cuire les frites au four 30 min à 210 °C.', 'Faire suer échalotes et ail au beurre, verser le vin blanc.', 'Ajouter les moules, couvrir et cuire 6 min jusqu\'à ouverture.', 'Parsemer de persil.'] },

  { id: 'moules_curry_coco', n: 'Moules au curry et lait de coco', cu: 'Fusion', tags: ['moules', 'curry', 'coco', 'rapide'], t: 30, d: 1,
    i: [['moule', 450], ['lait_coco', 70], ['curry', 4], ['echalote', 1], ['ail', 2], ['coriandre', 5], ['citron_vert', 0.25], ['pain', 70], ['huile_olive', 6], ['salade_verte', 55], ['carotte', 60]],
    e: ['Faire suer échalote et ail, ajouter le curry.', 'Verser le lait de coco et porter à frémissement.', 'Ajouter les moules, couvrir 6 min.', 'Finir à la coriandre et au citron vert, servir avec du pain.'] },

  { id: 'st_jacques_poireaux', n: 'Saint-Jacques sur fondue de poireaux', cu: 'France', tags: ['saint-jacques', 'festif', 'crémeux'], t: 35, d: 2, s: ['automne', 'hiver'],
    i: [['st_jacques', 130], ['poireau', 150], ['creme_liquide', 40], ['beurre', 12], ['vin_blanc', 30], ['riz_complet', 65], ['ciboulette', 4]],
    e: ['Émincer les poireaux et les faire fondre 15 min au beurre.', 'Ajouter vin blanc et crème, réduire 5 min.', 'Saisir les noix de Saint-Jacques 1 min par face à feu vif.', 'Dresser sur la fondue, parsemer de ciboulette, servir avec le riz.'] },

  { id: 'calamars_persillade', n: 'Calamars à la persillade', cu: 'Méditerranée', tags: ['calamars', 'rapide', 'ail', 'été'], t: 25, d: 1, s: ['été'],
    i: [['calamar', 170], ['ail', 3], ['persil', 8], ['citron', 0.5], ['pomme_de_terre', 180], ['tomate_cerise', 80], ['huile_olive', 10], ['piment_espelette', 0.5]],
    e: ['Tailler les calamars en anneaux et bien les sécher.', 'Les saisir 3 min à feu très vif.', 'Ajouter ail et persil hachés, sauter 1 min.', 'Déglacer au citron, servir avec pommes de terre sautées et tomates.'] },

  { id: 'calamar_tomate_chorizo', n: 'Calamars à la tomate et chorizo', cu: 'Espagne', tags: ['calamars', 'mijoté', 'relevé'], t: 50, d: 2,
    i: [['calamar', 170], ['chorizo', 25], ['tomate_pelee', 130], ['poivron', 80], ['oignon', 0.5], ['ail', 2], ['vin_blanc', 40], ['riz_basmati', 75], ['paprika', 2], ['huile_olive', 8], ['persil', 4]],
    e: ['Faire revenir oignon, poivron, ail et chorizo.', 'Ajouter les calamars et les saisir 3 min.', 'Déglacer au vin blanc, ajouter tomates et paprika.', 'Mijoter 30 min à feu doux.', 'Servir avec le riz.'] },

  { id: 'salade_nicoise', n: 'Salade niçoise', cu: 'France', tags: ['thon', 'salade', 'été', 'froid'], t: 30, d: 1, s: ['été'],
    i: [['thon_conserve', 80], ['oeuf', 1], ['pomme_de_terre', 140], ['haricot_vert', 90], ['tomate', 100], ['olive_noire', 25], ['salade_verte', 40], ['oignon_rouge', 0.25], ['anchois', 8], ['huile_olive', 12], ['vinaigre', 8]],
    e: ['Cuire les pommes de terre, les haricots verts et les œufs durs.', 'Tailler tomates et oignon rouge.', 'Disposer tous les éléments sur un lit de salade.', 'Arroser d\'une vinaigrette et ajouter thon, anchois et olives.'] },

  { id: 'pates_thon_tomate', n: 'Pâtes au thon et à la tomate', cu: 'Italie', tags: ['thon', 'pâtes', 'rapide', 'économique'], t: 25, d: 1,
    i: [['pates', 95], ['thon_conserve', 85], ['tomate_pelee', 130], ['ail', 2], ['oignon', 0.5], ['olive_noire', 20], ['capre', 8], ['origan', 2], ['huile_olive', 8], ['persil', 4]],
    e: ['Faire revenir oignon et ail.', 'Ajouter tomates, olives, câpres et origan, mijoter 12 min.', 'Ajouter le thon égoutté en fin de cuisson.', 'Mélanger aux pâtes al dente, parsemer de persil.'] },

  { id: 'gratin_pates_thon', n: 'Gratin de pâtes au thon', cu: 'France', tags: ['thon', 'gratin', 'familial', 'économique'], t: 45, d: 1,
    i: [['pates', 90], ['thon_conserve', 80], ['coulis_tomate', 120], ['courgette', 90], ['gruyere_rape', 30], ['creme_liquide', 30], ['oignon', 0.5], ['origan', 2], ['huile_olive', 6]],
    e: ['Cuire les pâtes 2 min de moins que le temps indiqué.', 'Faire revenir oignon et courgette, ajouter coulis et thon.', 'Mélanger avec les pâtes et la crème dans un plat.', 'Couvrir de fromage et gratiner 20 min à 200 °C.'] },

  { id: 'salade_riz_thon', n: 'Salade de riz au thon et légumes', cu: 'France', tags: ['thon', 'salade', 'froid', 'nomade'], t: 25, d: 1, s: ['été'],
    i: [['riz_basmati', 75], ['thon_conserve', 80], ['mais_conserve', 50], ['tomate', 90], ['poivron', 60], ['oeuf', 1], ['olive_verte', 20], ['huile_olive', 10], ['vinaigre', 8], ['persil', 4]],
    e: ['Cuire le riz et le rafraîchir.', 'Cuire les œufs durs 9 min.', 'Tailler tomates et poivrons en dés.', 'Mélanger tous les ingrédients, assaisonner et réserver au frais.'] },

  { id: 'tacos_poisson', n: 'Tacos de poisson à la mexicaine', cu: 'Mexique', tags: ['poisson', 'tacos', 'convivial', 'frais'], t: 35, d: 1,
    i: [['colin', 140], ['tortilla', 2], ['chou_rouge', 80], ['avocat', 0.4], ['citron_vert', 0.5], ['yaourt_grec', 35], ['paprika', 3], ['cumin', 2], ['coriandre', 5], ['huile_olive', 8]],
    e: ['Assaisonner le poisson de paprika et cumin, le poêler 6 min puis l\'émietter.', 'Tailler le chou rouge en lanières fines et le citronner.', 'Mélanger yaourt, citron vert et coriandre.', 'Garnir les tortillas chaudes de chou, poisson, avocat et sauce.'] },

  { id: 'curry_poisson_indien', n: 'Curry de poisson à l\'indienne', cu: 'Inde', tags: ['poisson', 'curry', 'épicé'], t: 35, d: 2,
    i: [['colin', 150], ['tomate_pelee', 110], ['lait_coco', 60], ['oignon', 0.5], ['ail', 2], ['gingembre', 6], ['curcuma', 2], ['garam_masala', 3], ['riz_basmati', 75], ['coriandre', 4], ['huile_olive', 7]],
    e: ['Faire revenir oignon, ail, gingembre et épices 5 min.', 'Ajouter les tomates, cuire 10 min.', 'Verser le lait de coco puis déposer le poisson.', 'Cuire 10 min à couvert sans remuer.', 'Servir avec le riz et la coriandre.'] },

  { id: 'poke_bowl_saumon', n: 'Poke bowl au saumon', cu: 'Hawaï', tags: ['saumon', 'bowl', 'cru', 'frais'], t: 30, d: 2, s: ['printemps', 'été'],
    i: [['saumon_filet', 130], ['riz_rond', 75], ['avocat', 0.5], ['concombre', 70], ['carotte', 60], ['sauce_soja', 18], ['huile_sesame', 6], ['graine_sesame', 6], ['citron_vert', 0.5], ['gingembre', 4]],
    e: ['Cuire le riz, l\'assaisonner d\'un peu de vinaigre et le laisser tiédir.', 'Tailler le saumon très frais en cubes, le mariner 10 min dans soja, sésame et gingembre.', 'Tailler les légumes en fins bâtonnets.', 'Dresser le bowl et parsemer de graines de sésame.'] },

  { id: 'cabillaud_veloute_poireaux', n: 'Cabillaud sur velouté de poireaux', cu: 'France', tags: ['cabillaud', 'crémeux', 'hiver', 'léger'], t: 40, d: 2, s: ['automne', 'hiver'],
    i: [['cabillaud', 150], ['poireau', 160], ['pomme_de_terre', 110], ['creme_liquide', 35], ['bouillon_cube', 0.5], ['beurre', 10], ['ciboulette', 4], ['huile_olive', 5]],
    e: ['Faire fondre les poireaux au beurre 12 min.', 'Ajouter pommes de terre et bouillon, cuire 18 min puis mixer avec la crème.', 'Poêler le cabillaud 3 min par face.', 'Dresser le poisson sur le velouté, parsemer de ciboulette.'] },

  { id: 'gratin_poisson_epinards', n: 'Gratin de poisson aux épinards', cu: 'France', tags: ['poisson', 'gratin', 'four', 'épinards'], t: 50, d: 1,
    i: [['colin', 150], ['epinard_surgele', 160], ['lait', 110], ['farine', 12], ['beurre', 12], ['gruyere_rape', 25], ['riz_complet', 60], ['muscade', 0.3], ['citron', 0.25]],
    e: ['Faire revenir les épinards pour évaporer l\'eau.', 'Préparer une béchamel muscadée.', 'Disposer épinards, poisson en morceaux et béchamel dans un plat.', 'Couvrir de fromage, enfourner 25 min à 190 °C.', 'Servir avec le riz complet.'] },

  { id: 'brochettes_poisson_grillees', n: 'Brochettes de poisson grillées', cu: 'Méditerranée', tags: ['poisson', 'grillade', 'été', 'léger'], t: 30, d: 1, s: ['été'],
    i: [['lotte', 140], ['poivron', 80], ['courgette', 90], ['citron', 0.5], ['ail', 1], ['origan', 2], ['boulgour', 70], ['huile_olive', 10], ['persil', 4]],
    e: ['Mariner les cubes de poisson avec huile, citron, ail et origan 20 min.', 'Monter les brochettes en alternant poisson et légumes.', 'Griller 10 min en retournant souvent.', 'Servir avec le boulgour au persil.'] },

  /* ================= VÉGÉTARIEN, LÉGUMINEUSES & ŒUFS =================== */
  { id: 'dahl_lentilles_corail', n: 'Dahl de lentilles corail', cu: 'Inde', tags: ['végétarien', 'lentilles', 'épicé', 'économique'], t: 35, d: 1,
    i: [['lentille_corail', 90], ['lait_coco', 60], ['tomate_pelee', 90], ['oignon', 0.5], ['ail', 2], ['gingembre', 5], ['curcuma', 2], ['cumin', 3], ['riz_basmati', 60], ['coriandre', 5], ['huile_olive', 7], ['epinard', 60]],
    e: ['Faire revenir oignon, ail, gingembre et épices 4 min.', 'Ajouter les lentilles rincées, les tomates et 300 ml d\'eau par personne.', 'Cuire 20 min en remuant, jusqu\'à consistance crémeuse.', 'Ajouter lait de coco et épinards, cuire 3 min.', 'Servir avec le riz et la coriandre.'] },

  { id: 'curry_pois_chiches_epinards', n: 'Curry de pois chiches et épinards', cu: 'Inde', tags: ['végétarien', 'pois chiches', 'curry', 'rapide'], t: 30, d: 1,
    i: [['pois_chiche', 140], ['epinard_surgele', 140], ['tomate_pelee', 110], ['oignon', 0.5], ['ail', 2], ['gingembre', 5], ['garam_masala', 4], ['curcuma', 2], ['lait_coco', 50], ['riz_basmati', 70], ['huile_olive', 7]],
    e: ['Faire revenir oignon, ail, gingembre et épices.', 'Ajouter les tomates et cuire 8 min.', 'Ajouter pois chiches égouttés et lait de coco, mijoter 10 min.', 'Incorporer les épinards 3 min, servir avec le riz.'] },

  { id: 'chili_sin_carne', n: 'Chili sin carne', cu: 'Mexique', tags: ['végétarien', 'haricots', 'épicé', 'batch-cooking'], t: 45, d: 1,
    i: [['haricot_rouge', 140], ['tomate_pelee', 140], ['poivron', 90], ['mais_conserve', 50], ['oignon', 0.5], ['ail', 2], ['cumin', 3], ['paprika', 3], ['riz_complet', 65], ['coriandre', 4], ['huile_olive', 7]],
    e: ['Faire revenir oignon, ail et poivron 8 min.', 'Ajouter les épices puis les tomates.', 'Ajouter haricots rouges et maïs, mijoter 25 min.', 'Servir avec le riz complet et la coriandre.'] },

  { id: 'falafels_pita', n: 'Falafels maison en pita', cu: 'Liban', tags: ['végétarien', 'pois chiches', 'convivial', 'street-food'], t: 45, d: 2,
    i: [['pois_chiche', 150], ['oignon', 0.5], ['ail', 2], ['persil', 10], ['cumin', 3], ['coriandre_moulue', 2], ['farine', 20], ['pain_pita', 1.5], ['tomate', 70], ['concombre', 60], ['yaourt_grec', 40], ['tahini', 12], ['huile_tournesol', 12], ['citron', 0.25]],
    e: ['Mixer pois chiches, oignon, ail, persil et épices, ajouter la farine.', 'Former des boulettes et les laisser reposer 15 min au frais.', 'Les cuire 8 min à la poêle dans un peu d\'huile en les retournant.', 'Mélanger yaourt, tahini et citron.', 'Garnir les pitas de falafels, crudités et sauce.'] },

  { id: 'bowl_houmous_legumes_rotis', n: 'Bowl houmous et légumes rôtis', cu: 'Liban', tags: ['végétarien', 'pois chiches', 'four', 'équilibré'], t: 45, d: 1,
    i: [['pois_chiche', 130], ['tahini', 15], ['citron', 0.5], ['ail', 1], ['butternut', 130], ['chou_fleur', 110], ['boulgour', 60], ['cumin', 2], ['persil', 5], ['huile_olive', 12], ['graine_courge', 10]],
    e: ['Rôtir butternut et chou-fleur 30 min à 200 °C avec huile et cumin.', 'Mixer les deux tiers des pois chiches avec tahini, citron, ail et un peu d\'eau.', 'Cuire le boulgour.', 'Dresser houmous, boulgour, légumes rôtis, pois chiches entiers et graines.'] },

  { id: 'soupe_lentilles_corail_coco', n: 'Soupe de lentilles corail au lait de coco', cu: 'Inde', tags: ['végétarien', 'soupe', 'lentilles', 'réconfortant'], t: 35, d: 1, s: ['automne', 'hiver'],
    i: [['lentille_corail', 80], ['lait_coco', 70], ['carotte', 100], ['oignon', 0.5], ['gingembre', 6], ['curcuma', 2], ['bouillon_cube', 0.5], ['pain_complet', 70], ['coriandre', 4], ['huile_olive', 6]],
    e: ['Faire suer oignon, carotte et gingembre.', 'Ajouter lentilles, curcuma, bouillon et 400 ml d\'eau par personne.', 'Cuire 20 min puis mixer partiellement.', 'Ajouter le lait de coco, servir avec du pain complet.'] },

  { id: 'salade_lentilles_feta', n: 'Salade de lentilles à la feta', cu: 'Méditerranée', tags: ['végétarien', 'lentilles', 'salade', 'froid'], t: 35, d: 1,
    i: [['lentille_verte', 80], ['feta', 40], ['tomate_cerise', 90], ['concombre', 70], ['oignon_rouge', 0.3], ['persil', 6], ['menthe', 4], ['huile_olive', 12], ['vinaigre_balsamique', 8], ['noix', 15]],
    e: ['Cuire les lentilles 25 min dans l\'eau non salée, les rafraîchir.', 'Tailler tomates, concombre et oignon rouge.', 'Mélanger avec herbes, huile et vinaigre.', 'Ajouter feta émiettée et noix concassées.'] },

  { id: 'lentilles_mijotees_legumes', n: 'Lentilles mijotées aux légumes', cu: 'France', tags: ['végétarien', 'lentilles', 'mijoté', 'économique'], t: 45, d: 1, s: ['automne', 'hiver'],
    i: [['lentille_verte', 90], ['carotte', 100], ['poireau', 80], ['celeri_branche', 50], ['oignon', 0.5], ['ail', 2], ['laurier', 1], ['thym', 1], ['moutarde', 6], ['huile_olive', 8], ['persil', 4]],
    e: ['Faire suer oignon, carotte, poireau et céleri 8 min.', 'Ajouter lentilles, ail et aromates, couvrir d\'eau.', 'Cuire 30 min à petits bouillons.', 'Assaisonner d\'une cuillère de moutarde et de persil.'] },

  { id: 'boulettes_pois_chiches_tomate', n: 'Boulettes de pois chiches à la tomate', cu: 'Méditerranée', tags: ['végétarien', 'pois chiches', 'boulettes', 'tomate'], t: 45, d: 2,
    i: [['pois_chiche', 150], ['chapelure', 25], ['oeuf', 0.5], ['ail', 2], ['cumin', 2], ['persil', 6], ['coulis_tomate', 130], ['oignon', 0.5], ['semoule', 65], ['huile_olive', 9], ['origan', 2]],
    e: ['Écraser les pois chiches avec ail, cumin, persil, œuf et chapelure.', 'Former des boulettes et les dorer 6 min.', 'Préparer une sauce tomate avec oignon et origan.', 'Laisser mijoter les boulettes 12 min dans la sauce.', 'Servir avec la semoule.'] },

  { id: 'couscous_legumes', n: 'Couscous de légumes', cu: 'Maghreb', tags: ['végétarien', 'couscous', 'légumes', 'convivial'], t: 50, d: 1,
    i: [['semoule', 80], ['pois_chiche', 110], ['courgette', 110], ['carotte', 90], ['navet', 70], ['poivron', 60], ['oignon', 0.5], ['concentre_tomate', 15], ['ras_el_hanout', 4], ['harissa', 4], ['raisin_sec', 15], ['huile_olive', 9]],
    e: ['Faire revenir l\'oignon avec le concentré de tomate et les épices.', 'Ajouter les légumes en gros morceaux et de l\'eau à hauteur.', 'Cuire 30 min, ajouter les pois chiches 10 min avant la fin.', 'Gonfler la semoule avec les raisins secs.', 'Servir avec l\'harissa à part.'] },

  { id: 'tajine_legumes_amandes', n: 'Tajine de légumes aux amandes', cu: 'Maroc', tags: ['végétarien', 'tajine', 'mijoté', 'sucré-salé'], t: 50, d: 1, s: ['automne', 'hiver'],
    i: [['butternut', 150], ['carotte', 90], ['pois_chiche', 110], ['abricot_sec', 30], ['oignon', 0.5], ['amande', 15], ['ras_el_hanout', 4], ['cannelle', 1], ['semoule', 70], ['coriandre', 5], ['huile_olive', 8]],
    e: ['Faire revenir oignon et épices.', 'Ajouter butternut et carottes en cubes, mouiller à mi-hauteur.', 'Mijoter 25 min, ajouter pois chiches et abricots 10 min.', 'Parsemer d\'amandes torréfiées, servir avec la semoule.'] },

  { id: 'curry_legumes_coco', n: 'Curry de légumes au lait de coco', cu: 'Thaïlande', tags: ['végétarien', 'curry', 'coco', 'légumes'], t: 35, d: 1,
    i: [['lait_coco', 90], ['pate_curry', 15], ['patate_douce', 130], ['chou_fleur', 110], ['haricot_vert', 70], ['pois_chiche', 80], ['riz_basmati', 70], ['citron_vert', 0.25], ['coriandre', 4], ['huile_tournesol', 6]],
    e: ['Faire chauffer la pâte de curry dans l\'huile.', 'Ajouter le lait de coco et 100 ml d\'eau.', 'Ajouter patate douce et chou-fleur, cuire 15 min.', 'Ajouter haricots verts et pois chiches, cuire 7 min.', 'Finir au citron vert, servir avec le riz.'] },

  { id: 'soupe_pois_casses', n: 'Soupe de pois cassés', cu: 'France', tags: ['végétarien', 'soupe', 'hiver', 'économique'], t: 60, d: 1, s: ['hiver'],
    i: [['pois_casse', 90], ['carotte', 90], ['poireau', 80], ['oignon', 0.5], ['laurier', 1], ['bouillon_cube', 0.5], ['pain_complet', 70], ['comte', 25], ['huile_olive', 7]],
    e: ['Faire suer oignon, carotte et poireau.', 'Ajouter les pois cassés rincés, le laurier et 500 ml d\'eau par personne.', 'Cuire 45 min à couvert.', 'Mixer et rectifier la texture.', 'Servir avec du pain complet et un peu de comté.'] },

  { id: 'haricots_blancs_tomate', n: 'Haricots blancs à la tomate et au romarin', cu: 'Italie', tags: ['végétarien', 'haricots', 'mijoté', 'économique'], t: 35, d: 1,
    i: [['haricot_blanc', 160], ['tomate_pelee', 130], ['oignon', 0.5], ['ail', 2], ['thym', 1.5], ['pain_complet', 70], ['epinard', 70], ['huile_olive', 10], ['parmesan', 15]],
    e: ['Faire revenir oignon et ail dans l\'huile.', 'Ajouter tomates et thym, mijoter 10 min.', 'Ajouter les haricots blancs égouttés, cuire 12 min.', 'Ajouter les épinards, servir avec pain grillé et parmesan.'] },

  { id: 'burger_vegetarien_haricots', n: 'Burger végétarien aux haricots rouges', cu: 'États-Unis', tags: ['végétarien', 'burger', 'convivial'], t: 45, d: 2,
    i: [['haricot_rouge', 140], ['chapelure', 30], ['oeuf', 0.5], ['oignon', 0.5], ['cumin', 3], ['paprika', 2], ['pain_burger', 1], ['comte', 25], ['salade_verte', 25], ['tomate', 50], ['yaourt_grec', 25], ['pomme_de_terre', 170], ['huile_olive', 9]],
    e: ['Écraser les haricots avec oignon râpé, épices, œuf et chapelure.', 'Former les steaks et les réserver 15 min au frais.', 'Les cuire 4 min par face.', 'Cuire des frites au four 30 min à 210 °C.', 'Assembler le burger avec fromage, crudités et sauce.'] },

  { id: 'tacos_haricots_rouges', n: 'Tacos aux haricots rouges épicés', cu: 'Mexique', tags: ['végétarien', 'haricots', 'tacos', 'rapide'], t: 30, d: 1,
    i: [['haricot_rouge', 140], ['tortilla', 2], ['poivron', 80], ['oignon', 0.5], ['mais_conserve', 45], ['cumin', 3], ['paprika', 2], ['avocat', 0.4], ['yaourt_grec', 30], ['citron_vert', 0.25], ['coriandre', 4], ['huile_olive', 7]],
    e: ['Faire revenir oignon et poivron 6 min.', 'Ajouter haricots, maïs et épices, écraser grossièrement, cuire 8 min.', 'Écraser l\'avocat avec le citron vert.', 'Garnir les tortillas chaudes et ajouter le yaourt et la coriandre.'] },

  { id: 'risotto_champignons', n: 'Risotto aux champignons', cu: 'Italie', tags: ['végétarien', 'risotto', 'champignons', 'crémeux'], t: 45, d: 2, s: ['automne'],
    i: [['riz_rond', 85], ['champignon', 140], ['champignon_foret', 40], ['echalote', 1], ['vin_blanc', 50], ['bouillon_cube', 0.5], ['parmesan', 25], ['beurre', 12], ['persil', 4], ['huile_olive', 6]],
    e: ['Poêler les champignons à feu vif, réserver.', 'Nacrer le riz avec l\'échalote, déglacer au vin blanc.', 'Mouiller au bouillon louche par louche pendant 18 min.', 'Ajouter les champignons, lier au beurre et au parmesan hors du feu.'] },

  { id: 'risotto_butternut', n: 'Risotto de butternut', cu: 'Italie', tags: ['végétarien', 'risotto', 'courge', 'automne'], t: 45, d: 2, s: ['automne', 'hiver'],
    i: [['riz_rond', 85], ['butternut', 160], ['echalote', 1], ['vin_blanc', 45], ['bouillon_cube', 0.5], ['parmesan', 25], ['beurre', 12], ['graine_courge', 10], ['thym', 1], ['huile_olive', 7]],
    e: ['Rôtir la moitié de la courge en cubes 20 min à 200 °C.', 'Nacrer le riz, déglacer au vin blanc.', 'Ajouter le reste de courge râpée et mouiller au bouillon 18 min.', 'Incorporer la courge rôtie, le beurre et le parmesan.', 'Parsemer de graines de courge torréfiées.'] },

  { id: 'lasagnes_legumes_ricotta', n: 'Lasagnes aux légumes et ricotta', cu: 'Italie', tags: ['végétarien', 'gratin', 'four', 'légumes'], t: 80, d: 2,
    i: [['lasagne', 70], ['courgette', 110], ['aubergine', 110], ['coulis_tomate', 140], ['ricotta', 70], ['oignon', 0.5], ['ail', 2], ['gruyere_rape', 25], ['basilic', 5], ['huile_olive', 10]],
    e: ['Poêler courgettes et aubergines en dés 12 min.', 'Préparer une sauce tomate avec oignon, ail et basilic.', 'Alterner plaques, légumes, ricotta et sauce.', 'Couvrir de fromage râpé et enfourner 35 min à 180 °C.'] },

  { id: 'gratin_courgettes_riz', n: 'Gratin de courgettes au riz', cu: 'France', tags: ['végétarien', 'gratin', 'courgettes', 'économique'], t: 55, d: 1, s: ['été'],
    i: [['courgette', 230], ['riz_basmati', 65], ['oeuf', 1], ['lait', 80], ['gruyere_rape', 30], ['oignon', 0.5], ['ail', 1], ['muscade', 0.3], ['huile_olive', 8]],
    e: ['Cuire le riz.', 'Faire revenir les courgettes râpées avec l\'oignon 12 min pour évaporer l\'eau.', 'Mélanger avec riz, œufs battus, lait et muscade.', 'Verser dans un plat, couvrir de fromage, gratiner 25 min à 190 °C.'] },

  { id: 'gratin_pdt_comte', n: 'Gratin de pommes de terre au comté', cu: 'France', tags: ['végétarien', 'gratin', 'réconfortant', 'hiver'], t: 70, d: 1, s: ['automne', 'hiver'],
    i: [['pomme_de_terre', 280], ['lait', 120], ['creme_liquide', 50], ['comte', 45], ['ail', 1], ['muscade', 0.3], ['salade_verte', 60], ['huile_olive', 7], ['vinaigre', 5], ['carotte', 80]],
    e: ['Émincer finement les pommes de terre.', 'Les cuire 10 min dans le lait avec l\'ail et la muscade.', 'Verser dans un plat frotté à l\'ail, ajouter la crème et le comté.', 'Enfourner 45 min à 180 °C.', 'Servir avec une salade verte.'] },

  { id: 'quiche_legumes_chevre', n: 'Quiche aux légumes et chèvre', cu: 'France', tags: ['végétarien', 'tarte', 'four', 'légumes'], t: 60, d: 1,
    i: [['pate_brisee', 60], ['courgette', 100], ['poivron', 70], ['oignon', 0.5], ['chevre', 40], ['oeuf', 1.5], ['creme_liquide', 55], ['lait', 40], ['herbes_provence', 2], ['salade_verte', 45], ['huile_olive', 8]],
    e: ['Poêler les légumes 12 min.', 'Étaler la pâte, répartir les légumes et le chèvre en rondelles.', 'Verser l\'appareil œufs-crème-lait assaisonné.', 'Enfourner 35 min à 180 °C, servir avec la salade.'] },

  { id: 'tarte_tomate_moutarde_chevre', n: 'Tarte tomate, moutarde et chèvre', cu: 'France', tags: ['végétarien', 'tarte', 'été', 'facile'], t: 45, d: 1, s: ['été'],
    i: [['pate_feuilletee', 60], ['tomate', 200], ['moutarde', 12], ['chevre', 65], ['herbes_provence', 2], ['salade_verte', 50], ['huile_olive', 9], ['vinaigre_balsamique', 6], ['pignon', 10]],
    e: ['Étaler la pâte, la piquer et la tartiner de moutarde.', 'Disposer les rondelles de tomates en rosace.', 'Ajouter le chèvre et les herbes, arroser d\'huile.', 'Enfourner 30 min à 200 °C, servir avec la salade.'] },

  { id: 'tarte_poireaux_comte', n: 'Tarte aux poireaux et comté', cu: 'France', tags: ['végétarien', 'tarte', 'hiver', 'poireaux'], t: 60, d: 1, s: ['automne', 'hiver'],
    i: [['pate_brisee', 60], ['poireau', 190], ['oeuf', 1.5], ['creme_liquide', 55], ['lait', 35], ['comte', 35], ['muscade', 0.3], ['salade_verte', 45], ['huile_olive', 8]],
    e: ['Émincer et faire fondre les poireaux 15 min à couvert.', 'Étaler la pâte et y répartir les poireaux.', 'Verser l\'appareil œufs-crème-lait avec le comté et la muscade.', 'Enfourner 35 min à 180 °C.'] },

  { id: 'tortilla_pdt_oignons', n: 'Tortilla de pommes de terre', cu: 'Espagne', tags: ['végétarien', 'œufs', 'convivial', 'économique'], t: 45, d: 2,
    i: [['oeuf', 2.5], ['pomme_de_terre', 200], ['oignon', 0.75], ['huile_olive', 14], ['salade_verte', 60], ['tomate_cerise', 70], ['vinaigre_balsamique', 6]],
    e: ['Cuire les pommes de terre en fines rondelles et l\'oignon à l\'huile, à couvert, 20 min.', 'Battre les œufs, y mélanger les pommes de terre égouttées.', 'Cuire à feu doux 8 min, retourner à l\'aide d\'une assiette et cuire 5 min.', 'Servir tiède avec une salade.'] },

  { id: 'omelette_courgettes_feta', n: 'Omelette aux courgettes et feta', cu: 'Grèce', tags: ['végétarien', 'œufs', 'rapide', 'léger'], t: 20, d: 1, s: ['été'],
    i: [['oeuf', 3], ['courgette', 130], ['feta', 35], ['menthe', 4], ['oignon', 0.3], ['pain_complet', 60], ['salade_verte', 40], ['huile_olive', 9]],
    e: ['Poêler les courgettes râpées avec l\'oignon 8 min.', 'Battre les œufs, ajouter la menthe.', 'Verser sur les courgettes, ajouter la feta émiettée.', 'Cuire 5 min à feu doux, servir avec salade et pain.'] },

  { id: 'oeufs_cocotte_epinards', n: 'Œufs cocotte aux épinards', cu: 'France', tags: ['végétarien', 'œufs', 'rapide', 'crémeux'], t: 25, d: 1,
    i: [['oeuf', 2], ['epinard', 130], ['creme_liquide', 45], ['gruyere_rape', 20], ['echalote', 0.5], ['muscade', 0.3], ['pain_complet', 80], ['huile_olive', 6]],
    e: ['Faire tomber les épinards avec l\'échalote.', 'Répartir dans des ramequins avec la crème et la muscade.', 'Casser les œufs dessus, parsemer de fromage.', 'Cuire 12 min au bain-marie à 180 °C, servir avec des mouillettes.'] },

  { id: 'shakshuka', n: 'Shakshuka', cu: 'Maghreb', tags: ['végétarien', 'œufs', 'épicé', 'one-pot'], t: 35, d: 1,
    i: [['oeuf', 2], ['tomate_pelee', 170], ['poivron', 100], ['oignon', 0.5], ['ail', 2], ['cumin', 3], ['paprika', 3], ['harissa', 4], ['pain', 80], ['coriandre', 5], ['huile_olive', 9], ['feta', 25]],
    e: ['Faire revenir oignon, poivron et ail 8 min.', 'Ajouter les épices, l\'harissa et les tomates, mijoter 12 min.', 'Creuser des puits et y casser les œufs.', 'Couvrir et cuire 6 min : le blanc doit être pris.', 'Parsemer de feta et de coriandre, servir avec du pain.'] },

  { id: 'oeufs_florentine', n: 'Œufs pochés florentine', cu: 'France', tags: ['végétarien', 'œufs', 'épinards', 'classique'], t: 35, d: 2,
    i: [['oeuf', 2], ['epinard', 150], ['lait', 100], ['farine', 10], ['beurre', 12], ['gruyere_rape', 25], ['muscade', 0.3], ['pomme_de_terre', 160], ['vinaigre', 10]],
    e: ['Faire tomber les épinards, les égoutter.', 'Préparer une béchamel muscadée avec le fromage.', 'Pocher les œufs 3 min dans l\'eau frémissante vinaigrée.', 'Dresser épinards, œufs et sauce, gratiner 3 min.', 'Servir avec des pommes de terre vapeur.'] },

  { id: 'pates_pesto_courgettes', n: 'Pâtes au pesto et courgettes', cu: 'Italie', tags: ['végétarien', 'pâtes', 'rapide', 'pesto'], t: 25, d: 1, s: ['été'],
    i: [['pates', 100], ['courgette', 130], ['pesto', 28], ['pignon', 10], ['tomate_cerise', 80], ['parmesan', 18], ['huile_olive', 6], ['basilic', 4]],
    e: ['Cuire les pâtes al dente.', 'Poêler les courgettes en dés 8 min.', 'Torréfier les pignons à sec.', 'Mélanger pâtes, courgettes, pesto et un peu d\'eau de cuisson.', 'Ajouter tomates, pignons, parmesan et basilic.'] },

  { id: 'pates_arrabiata', n: 'Penne all\'arrabbiata', cu: 'Italie', tags: ['végétarien', 'pâtes', 'épicé', 'économique'], t: 25, d: 1,
    i: [['pates', 100], ['tomate_pelee', 160], ['ail', 3], ['piment_frais', 0.5], ['persil', 5], ['parmesan', 18], ['huile_olive', 10]],
    e: ['Faire infuser ail et piment dans l\'huile 2 min.', 'Ajouter les tomates et mijoter 15 min.', 'Cuire les pâtes al dente.', 'Les mélanger à la sauce avec le persil et le parmesan.'] },

  { id: 'pates_champignons_creme', n: 'Pâtes crémeuses aux champignons', cu: 'Italie', tags: ['végétarien', 'pâtes', 'champignons', 'crémeux'], t: 30, d: 1, s: ['automne'],
    i: [['tagliatelle', 95], ['champignon', 160], ['creme_liquide', 50], ['ail', 2], ['echalote', 1], ['parmesan', 20], ['persil', 5], ['huile_olive', 7], ['noix', 12]],
    e: ['Poêler les champignons à feu vif jusqu\'à évaporation.', 'Ajouter échalote et ail, puis la crème, réduire 5 min.', 'Cuire les tagliatelles al dente.', 'Mélanger, ajouter parmesan, persil et noix concassées.'] },

  { id: 'spaghetti_ail_huile_brocoli', n: 'Spaghetti ail, huile et brocolis', cu: 'Italie', tags: ['végétarien', 'pâtes', 'rapide', 'économique'], t: 20, d: 1,
    i: [['spaghetti', 100], ['brocoli', 150], ['ail', 3], ['piment_espelette', 0.5], ['parmesan', 20], ['chapelure', 15], ['huile_olive', 12], ['citron', 0.25]],
    e: ['Cuire les spaghetti, ajouter les brocolis 5 min avant la fin.', 'Faire blondir l\'ail émincé dans l\'huile avec le piment.', 'Torréfier la chapelure à sec.', 'Mélanger le tout avec un peu d\'eau de cuisson, citron et parmesan.'] },

  { id: 'gnocchi_tomate_mozzarella', n: 'Gnocchi à la tomate et mozzarella', cu: 'Italie', tags: ['végétarien', 'gnocchi', 'four', 'rapide'], t: 30, d: 1,
    i: [['gnocchi', 220], ['coulis_tomate', 140], ['mozzarella', 55], ['ail', 2], ['basilic', 5], ['courgette', 90], ['huile_olive', 8], ['parmesan', 12]],
    e: ['Poêler les courgettes puis ajouter coulis et ail, mijoter 10 min.', 'Cuire les gnocchi 2 min dans l\'eau bouillante.', 'Mélanger gnocchi et sauce dans un plat.', 'Ajouter la mozzarella et gratiner 12 min à 210 °C, finir au basilic.'] },

  { id: 'gnocchi_butternut_thym', n: 'Gnocchi poêlés à la butternut', cu: 'Italie', tags: ['végétarien', 'gnocchi', 'automne', 'poêlée'], t: 35, d: 1, s: ['automne', 'hiver'],
    i: [['gnocchi', 220], ['butternut', 150], ['echalote', 1], ['thym', 2], ['parmesan', 20], ['noix', 15], ['beurre', 12], ['huile_olive', 6], ['epinard', 50]],
    e: ['Rôtir la butternut en cubes 25 min à 200 °C.', 'Poêler les gnocchi crus au beurre jusqu\'à ce qu\'ils soient dorés.', 'Ajouter échalote, thym et courge.', 'Ajouter les épinards, parsemer de noix et de parmesan.'] },

  { id: 'raviolis_ricotta_epinards', n: 'Raviolis ricotta-épinards au beurre', cu: 'Italie', tags: ['végétarien', 'pâtes fraîches', 'rapide'], t: 20, d: 1,
    i: [['raviolis_frais', 200], ['epinard', 90], ['beurre', 15], ['parmesan', 22], ['ail', 1], ['pignon', 10], ['citron', 0.25]],
    e: ['Cuire les raviolis 3 min dans l\'eau frémissante.', 'Faire mousser le beurre avec l\'ail, ajouter les épinards.', 'Ajouter les raviolis égouttés et un peu d\'eau de cuisson.', 'Servir avec parmesan, pignons et zeste de citron.'] },

  { id: 'pizza_legumes_chevre', n: 'Pizza aux légumes grillés et chèvre', cu: 'Italie', tags: ['végétarien', 'pizza', 'four', 'convivial'], t: 40, d: 1,
    i: [['pate_pizza', 130], ['coulis_tomate', 80], ['courgette', 80], ['poivron', 70], ['oignon_rouge', 0.3], ['chevre', 45], ['origan', 2], ['roquette', 25], ['huile_olive', 9]],
    e: ['Poêler rapidement courgettes, poivrons et oignon.', 'Étaler la pâte, la napper de coulis et d\'origan.', 'Répartir les légumes et le chèvre.', 'Enfourner 15 min à 240 °C, ajouter la roquette à la sortie.'] },

  { id: 'buddha_bowl_quinoa', n: 'Buddha bowl quinoa et légumes rôtis', cu: 'Fusion', tags: ['végétarien', 'bowl', 'équilibré', 'four'], t: 45, d: 1,
    i: [['quinoa', 75], ['pois_chiche', 110], ['patate_douce', 130], ['brocoli', 100], ['avocat', 0.4], ['tahini', 15], ['citron', 0.5], ['graine_courge', 10], ['cumin', 2], ['huile_olive', 11]],
    e: ['Rôtir patate douce, brocoli et pois chiches 30 min à 200 °C avec huile et cumin.', 'Cuire le quinoa 12 min.', 'Préparer la sauce : tahini, citron, eau et sel.', 'Dresser le bowl, ajouter l\'avocat et les graines.'] },

  { id: 'salade_quinoa_feta', n: 'Salade de quinoa, feta et concombre', cu: 'Méditerranée', tags: ['végétarien', 'salade', 'froid', 'nomade'], t: 25, d: 1, s: ['printemps', 'été'],
    i: [['quinoa', 80], ['feta', 40], ['concombre', 90], ['tomate_cerise', 90], ['oignon_rouge', 0.3], ['menthe', 5], ['persil', 5], ['citron', 0.5], ['huile_olive', 12], ['olive_noire', 20]],
    e: ['Cuire le quinoa 12 min, le rafraîchir.', 'Tailler concombre, tomates et oignon en petits dés.', 'Mélanger avec herbes, citron et huile.', 'Ajouter feta et olives au moment de servir.'] },

  { id: 'taboule_libanais', n: 'Taboulé libanais au persil', cu: 'Liban', tags: ['végétarien', 'salade', 'frais', 'été'], t: 25, d: 1, s: ['été'],
    i: [['boulgour', 60], ['persil', 30], ['menthe', 8], ['tomate', 140], ['oignon_rouge', 0.3], ['citron', 0.75], ['huile_olive', 14], ['pois_chiche', 90]],
    e: ['Faire gonfler le boulgour 20 min dans un peu d\'eau tiède.', 'Hacher finement persil et menthe.', 'Tailler les tomates et l\'oignon en tout petits dés.', 'Mélanger le tout avec citron, huile et pois chiches, laisser reposer 30 min au frais.'] },

  { id: 'salade_boulgour_pois_chiches', n: 'Salade de boulgour aux pois chiches rôtis', cu: 'Méditerranée', tags: ['végétarien', 'salade', 'pois chiches', 'nomade'], t: 35, d: 1,
    i: [['boulgour', 75], ['pois_chiche', 120], ['poivron', 80], ['tomate_cerise', 80], ['oignon_rouge', 0.3], ['paprika', 3], ['cumin', 2], ['persil', 6], ['citron', 0.5], ['huile_olive', 12], ['feta', 30]],
    e: ['Rôtir les pois chiches 25 min à 200 °C avec huile, paprika et cumin.', 'Cuire le boulgour.', 'Tailler les légumes en dés.', 'Mélanger le tout avec citron, huile, persil et feta.'] },

  { id: 'wok_tofu_legumes', n: 'Wok de tofu aux légumes', cu: 'Asie', tags: ['végétarien', 'tofu', 'wok', 'rapide'], t: 30, d: 1,
    i: [['tofu_ferme', 150], ['brocoli', 100], ['carotte', 70], ['poivron', 70], ['nouilles_chinoises', 80], ['sauce_soja', 20], ['gingembre', 6], ['ail', 2], ['huile_sesame', 8], ['graine_sesame', 6]],
    e: ['Presser le tofu, le couper en cubes et le dorer 8 min sur toutes les faces.', 'Cuire les nouilles.', 'Sauter les légumes à feu vif 5 min avec ail et gingembre.', 'Réunir tofu, nouilles, légumes et sauce soja, sauter 2 min.'] },

  { id: 'tofu_croustillant_sesame', n: 'Tofu croustillant au sésame', cu: 'Chine', tags: ['végétarien', 'tofu', 'sucré-salé', 'croustillant'], t: 35, d: 2,
    i: [['tofu_ferme', 160], ['maizena', 18], ['sauce_soja', 20], ['miel', 10], ['vinaigre', 8], ['ail', 2], ['gingembre', 5], ['riz_basmati', 75], ['brocoli', 110], ['graine_sesame', 8], ['huile_tournesol', 10]],
    e: ['Presser le tofu 15 min, le couper en cubes et l\'enrober de maïzena.', 'Le faire dorer à la poêle sur toutes les faces.', 'Réduire soja, miel, vinaigre, ail et gingembre 2 min.', 'Enrober le tofu de sauce, parsemer de sésame.', 'Servir avec riz et brocolis.'] },

  { id: 'curry_tofu_epinards', n: 'Curry de tofu aux épinards', cu: 'Inde', tags: ['végétarien', 'tofu', 'curry', 'épinards'], t: 35, d: 1,
    i: [['tofu_fume', 150], ['epinard_surgele', 150], ['lait_coco', 70], ['tomate_pelee', 90], ['oignon', 0.5], ['ail', 2], ['gingembre', 5], ['garam_masala', 4], ['riz_complet', 70], ['huile_olive', 7]],
    e: ['Dorer les cubes de tofu, réserver.', 'Faire revenir oignon, ail, gingembre et épices.', 'Ajouter tomates puis lait de coco, mijoter 10 min.', 'Ajouter épinards et tofu, cuire 5 min, servir avec le riz.'] },

  { id: 'tempeh_saute_soja', n: 'Tempeh sauté au soja et légumes', cu: 'Indonésie', tags: ['végétarien', 'tempeh', 'wok', 'protéiné'], t: 30, d: 2,
    i: [['tempeh', 140], ['chou_blanc', 110], ['carotte', 70], ['oignon', 0.5], ['sauce_soja', 20], ['miel', 8], ['ail', 2], ['gingembre', 5], ['riz_complet', 75], ['huile_sesame', 8], ['coriandre', 4]],
    e: ['Couper le tempeh en tranches et le dorer 6 min.', 'Sauter chou, carotte et oignon 6 min.', 'Ajouter ail, gingembre, soja et miel.', 'Remettre le tempeh, glacer 2 min, servir avec le riz.'] },

  { id: 'nouilles_tofu_sesame', n: 'Nouilles sautées au tofu et sauce sésame', cu: 'Asie', tags: ['végétarien', 'tofu', 'nouilles', 'rapide'], t: 30, d: 1,
    i: [['nouilles_chinoises', 85], ['tofu_ferme', 140], ['chou_blanc', 90], ['carotte', 70], ['tahini', 18], ['sauce_soja', 18], ['citron', 0.25], ['ail', 2], ['huile_sesame', 7], ['graine_sesame', 6]],
    e: ['Cuire les nouilles, les égoutter.', 'Dorer le tofu en cubes 8 min.', 'Sauter chou et carotte 5 min.', 'Délayer tahini, soja, ail et citron avec un peu d\'eau.', 'Mélanger le tout hors du feu.'] },

  { id: 'soupe_nouilles_tofu_gingembre', n: 'Soupe de nouilles au tofu et gingembre', cu: 'Asie', tags: ['végétarien', 'soupe', 'tofu', 'réconfortant'], t: 30, d: 1, s: ['automne', 'hiver'],
    i: [['nouilles_riz', 75], ['tofu_fume', 130], ['chou_blanc', 90], ['carotte', 70], ['champignon', 70], ['gingembre', 8], ['ail', 2], ['sauce_soja', 18], ['bouillon_cube', 1], ['coriandre', 5], ['huile_sesame', 6]],
    e: ['Faire infuser gingembre et ail dans le bouillon 5 min.', 'Ajouter carottes, chou et champignons, cuire 8 min.', 'Ajouter les nouilles 4 min.', 'Ajouter le tofu en dés et la sauce soja, servir avec la coriandre.'] },

  { id: 'gratin_chou_fleur', n: 'Gratin de chou-fleur à la béchamel', cu: 'France', tags: ['végétarien', 'gratin', 'hiver', 'économique'], t: 50, d: 1, s: ['automne', 'hiver'],
    i: [['chou_fleur', 280], ['lait', 140], ['farine', 15], ['beurre', 15], ['gruyere_rape', 40], ['muscade', 0.3], ['pomme_de_terre', 120], ['oeuf', 1]],
    e: ['Cuire le chou-fleur en bouquets 10 min à la vapeur.', 'Préparer une béchamel et la muscader, ajouter la moitié du fromage.', 'Ajouter les pommes de terre cuites en dés et les œufs durs en quartiers.', 'Napper, couvrir de fromage et gratiner 25 min à 200 °C.'] },

  { id: 'polenta_champignons', n: 'Polenta crémeuse aux champignons', cu: 'Italie', tags: ['végétarien', 'polenta', 'champignons', 'réconfortant'], t: 35, d: 1, s: ['automne'],
    i: [['polenta', 80], ['champignon', 150], ['champignon_foret', 40], ['parmesan', 25], ['beurre', 12], ['ail', 2], ['persil', 5], ['lait', 80], ['huile_olive', 8], ['roquette', 25]],
    e: ['Cuire la polenta dans un mélange lait-eau en fouettant 8 min.', 'Lier avec beurre et parmesan.', 'Poêler les champignons à feu vif avec l\'ail.', 'Dresser la polenta, garnir de champignons, persil et roquette.'] },

  { id: 'minestrone', n: 'Minestrone de légumes', cu: 'Italie', tags: ['végétarien', 'soupe', 'légumes', 'économique'], t: 45, d: 1,
    i: [['haricot_blanc', 90], ['carotte', 80], ['courgette', 80], ['celeri_branche', 50], ['poireau', 60], ['tomate_pelee', 110], ['pates', 35], ['ail', 2], ['parmesan', 18], ['basilic', 5], ['huile_olive', 10], ['bouillon_cube', 0.5]],
    e: ['Faire suer carotte, céleri, poireau et ail 8 min.', 'Ajouter tomates, bouillon et 400 ml d\'eau par personne.', 'Cuire 20 min, ajouter courgettes et haricots blancs.', 'Ajouter les pâtes 8 min avant la fin.', 'Servir avec parmesan, basilic et un filet d\'huile.'] },

  /* ============= LÉGUMES FARCIS, SOUPES-REPAS & PLATS DU MONDE ========== */
  { id: 'ratatouille_oeuf_poche', n: 'Ratatouille et œuf poché', cu: 'France', tags: ['végétarien', 'légumes', 'été', 'provençal'], t: 55, d: 1, s: ['été'],
    i: [['aubergine', 110], ['courgette', 110], ['poivron', 80], ['tomate', 120], ['oignon', 0.5], ['ail', 2], ['herbes_provence', 3], ['oeuf', 1], ['pain_complet', 70], ['huile_olive', 12], ['vinaigre', 10]],
    e: ['Poêler séparément aubergines, courgettes et poivrons pour qu\'ils restent fermes.', 'Faire compoter oignon, ail et tomates 15 min.', 'Réunir tous les légumes avec les herbes, mijoter 20 min à couvert.', 'Pocher les œufs 3 min dans l\'eau vinaigrée.', 'Servir la ratatouille surmontée de l\'œuf avec du pain.'] },

  { id: 'aubergines_farcies_quinoa', n: 'Aubergines farcies au quinoa', cu: 'Méditerranée', tags: ['végétarien', 'farcis', 'four', 'quinoa'], t: 60, d: 2, s: ['été', 'automne'],
    i: [['aubergine', 250], ['quinoa', 60], ['tomate_pelee', 90], ['oignon', 0.5], ['ail', 2], ['feta', 35], ['pignon', 10], ['menthe', 4], ['cumin', 2], ['huile_olive', 11]],
    e: ['Couper les aubergines en deux, les inciser, les huiler et les enfourner 25 min à 200 °C.', 'Cuire le quinoa, évider les aubergines et hacher la chair.', 'Mélanger quinoa, chair, oignon revenu, tomates, ail, cumin et menthe.', 'Garnir les demi-aubergines, ajouter feta et pignons.', 'Enfourner 20 min.'] },

  { id: 'poivrons_farcis_boeuf', n: 'Poivrons farcis au bœuf et riz', cu: 'Méditerranée', tags: ['bœuf', 'farcis', 'four', 'familial'], t: 65, d: 2, s: ['été', 'automne'],
    i: [['poivron', 230], ['boeuf_hache', 100], ['riz_basmati', 55], ['tomate_pelee', 90], ['oignon', 0.5], ['ail', 2], ['paprika', 3], ['persil', 5], ['gruyere_rape', 20], ['huile_olive', 8]],
    e: ['Cuire le riz à moitié.', 'Faire revenir oignon, ail et viande, ajouter tomates, paprika et persil.', 'Mélanger avec le riz.', 'Garnir les poivrons évidés, couvrir de fromage.', 'Enfourner 40 min à 190 °C avec un fond d\'eau.'] },

  { id: 'courgettes_farcies_chevre', n: 'Courgettes farcies au chèvre et boulgour', cu: 'Méditerranée', tags: ['végétarien', 'farcis', 'four', 'été'], t: 55, d: 2, s: ['été'],
    i: [['courgette', 280], ['boulgour', 55], ['chevre', 45], ['tomate_cerise', 70], ['oignon', 0.5], ['ail', 1], ['basilic', 5], ['pignon', 10], ['huile_olive', 10]],
    e: ['Couper les courgettes en deux, les évider et précuire 10 min à la vapeur.', 'Cuire le boulgour et le mélanger à la chair hachée revenue avec oignon et ail.', 'Ajouter tomates, basilic et la moitié du chèvre.', 'Garnir, parsemer du reste de chèvre et des pignons.', 'Enfourner 25 min à 190 °C.'] },

  { id: 'tomates_farcies', n: 'Tomates farcies à la viande', cu: 'France', tags: ['bœuf', 'farcis', 'four', 'traditionnel'], t: 70, d: 2, s: ['été'],
    i: [['tomate', 280], ['boeuf_hache', 100], ['riz_basmati', 55], ['oignon', 0.5], ['ail', 2], ['oeuf', 0.3], ['persil', 6], ['chapelure', 15], ['huile_olive', 8], ['herbes_provence', 2]],
    e: ['Évider les tomates et réserver les chapeaux.', 'Mélanger viande, oignon, ail, œuf, persil et chapelure.', 'Garnir les tomates, disposer le riz cru autour dans le plat avec un verre d\'eau.', 'Enfourner 50 min à 180 °C.'] },

  { id: 'chou_farci_lentilles', n: 'Chou farci aux lentilles', cu: 'France', tags: ['végétarien', 'farcis', 'lentilles', 'hiver'], t: 75, d: 3, s: ['automne', 'hiver'],
    i: [['chou_blanc', 220], ['lentille_verte', 70], ['carotte', 70], ['oignon', 0.5], ['ail', 2], ['tomate_pelee', 90], ['noix', 15], ['thym', 1], ['huile_olive', 9], ['bouillon_cube', 0.5]],
    e: ['Blanchir les feuilles de chou 5 min.', 'Cuire les lentilles 25 min avec carotte et oignon.', 'Mélanger avec ail, noix concassées et thym.', 'Former des paupiettes avec les feuilles de chou.', 'Les cuire 35 min au four dans les tomates et le bouillon.'] },

  { id: 'parmentier_lentilles', n: 'Parmentier de lentilles', cu: 'France', tags: ['végétarien', 'gratin', 'lentilles', 'réconfortant'], t: 60, d: 1,
    i: [['lentille_verte', 80], ['pomme_de_terre', 250], ['carotte', 70], ['oignon', 0.5], ['ail', 2], ['concentre_tomate', 12], ['lait', 60], ['beurre', 12], ['gruyere_rape', 25], ['thym', 1], ['huile_olive', 7]],
    e: ['Cuire les lentilles 25 min avec la carotte.', 'Faire revenir oignon et ail, ajouter lentilles, concentré de tomate et thym.', 'Écraser les pommes de terre avec lait et beurre.', 'Monter le parmentier, couvrir de fromage et gratiner 20 min à 200 °C.'] },

  { id: 'galettes_pdt_epinards', n: 'Galettes de pommes de terre et épinards', cu: 'France', tags: ['végétarien', 'galettes', 'économique'], t: 40, d: 2,
    i: [['pomme_de_terre', 230], ['epinard', 90], ['oeuf', 1], ['farine', 20], ['oignon', 0.4], ['gruyere_rape', 25], ['yaourt_grec', 40], ['ciboulette', 5], ['huile_tournesol', 12], ['salade_verte', 40]],
    e: ['Râper les pommes de terre et bien les essorer.', 'Faire tomber les épinards et les hacher.', 'Mélanger avec œuf, farine, oignon râpé et fromage.', 'Cuire les galettes 4 min par face à la poêle.', 'Servir avec un yaourt à la ciboulette et une salade.'] },

  { id: 'riz_saute_legumes_oeuf', n: 'Riz sauté aux légumes et œuf', cu: 'Chine', tags: ['végétarien', 'riz', 'rapide', 'anti-gaspi'], t: 25, d: 1,
    i: [['riz_basmati', 85], ['oeuf', 1.5], ['petit_pois', 80], ['carotte', 70], ['chou_blanc', 70], ['oignon', 0.4], ['sauce_soja', 18], ['ail', 2], ['huile_sesame', 8], ['graine_sesame', 5]],
    e: ['Utiliser du riz cuit la veille et bien froid.', 'Brouiller les œufs dans le wok, réserver.', 'Sauter carotte, chou et petits pois 5 min à feu vif.', 'Ajouter le riz, l\'ail et la sauce soja, sauter 3 min.', 'Remettre les œufs et parsemer de sésame.'] },

  { id: 'salade_chevre_chaud', n: 'Salade de chèvre chaud aux noix', cu: 'France', tags: ['végétarien', 'salade', 'rapide', 'bistrot'], t: 20, d: 1,
    i: [['pain_complet', 80], ['chevre', 60], ['salade_verte', 80], ['noix', 18], ['pomme', 0.4], ['miel', 8], ['moutarde', 6], ['vinaigre_balsamique', 8], ['huile_olive', 12], ['pomme_de_terre', 120]],
    e: ['Toaster les tranches de pain, y déposer le chèvre et un filet de miel.', 'Passer 6 min sous le gril.', 'Préparer une vinaigrette moutarde-balsamique.', 'Dresser la salade avec pommes, noix et toasts, ajouter des pommes de terre tièdes.'] },

  { id: 'veloute_potiron_lentilles', n: 'Velouté de potiron aux lentilles corail', cu: 'France', tags: ['végétarien', 'soupe', 'automne', 'réconfortant'], t: 40, d: 1, s: ['automne', 'hiver'],
    i: [['potiron', 250], ['lentille_corail', 55], ['oignon', 0.5], ['carotte', 70], ['lait_coco', 50], ['curry', 3], ['bouillon_cube', 0.5], ['pain_complet', 70], ['graine_courge', 10], ['huile_olive', 7]],
    e: ['Faire suer oignon et carotte.', 'Ajouter potiron, lentilles, curry et bouillon, couvrir d\'eau.', 'Cuire 25 min puis mixer.', 'Ajouter le lait de coco, servir avec graines et pain complet.'] },

  { id: 'soupe_legumes_maison', n: 'Soupe de légumes maison et tartines', cu: 'France', tags: ['végétarien', 'soupe', 'économique', 'anti-gaspi'], t: 45, d: 1, s: ['automne', 'hiver'],
    i: [['pomme_de_terre', 120], ['carotte', 110], ['poireau', 100], ['navet', 70], ['celeri_branche', 50], ['oignon', 0.5], ['pain_complet', 80], ['comte', 35], ['creme_liquide', 20], ['huile_olive', 7]],
    e: ['Couper tous les légumes en morceaux.', 'Les couvrir d\'eau salée et cuire 30 min.', 'Mixer plus ou moins finement selon le goût, ajouter la crème.', 'Servir avec des tartines gratinées au comté.'] },

  { id: 'soupe_oignon_gratinee', n: 'Soupe à l\'oignon gratinée', cu: 'France', tags: ['végétarien', 'soupe', 'gratin', 'hiver'], t: 60, d: 2, s: ['hiver'],
    i: [['oignon', 2.5], ['beurre', 15], ['farine', 10], ['vin_blanc', 40], ['bouillon_cube', 1], ['pain', 80], ['comte', 45], ['thym', 1], ['huile_olive', 5]],
    e: ['Émincer les oignons et les faire compoter 30 min à feu doux au beurre.', 'Saupoudrer de farine, déglacer au vin blanc.', 'Ajouter le bouillon et 400 ml d\'eau par personne, cuire 20 min.', 'Verser en ramequins, couvrir de pain et de comté.', 'Gratiner 8 min sous le gril.'] },

  { id: 'pot_au_feu', n: 'Pot-au-feu', cu: 'France', tags: ['bœuf', 'mijoté', 'traditionnel', 'hiver'], t: 180, d: 2, s: ['automne', 'hiver'],
    i: [['boeuf_mijot', 170], ['carotte', 130], ['poireau', 110], ['navet', 90], ['pomme_de_terre', 160], ['oignon', 0.5], ['laurier', 1], ['thym', 1], ['moutarde', 8], ['cornichon', 20]],
    e: ['Couvrir la viande d\'eau froide, porter à frémissement et écumer.', 'Ajouter oignon, thym et laurier, cuire 2 h à petits frémissements.', 'Ajouter carottes, poireaux et navets, cuire 40 min.', 'Ajouter les pommes de terre 25 min avant la fin.', 'Servir avec moutarde et cornichons.'] },

  { id: 'gratin_aubergines_parmesan', n: 'Gratin d\'aubergines au parmesan', cu: 'Italie', tags: ['végétarien', 'gratin', 'aubergine', 'four'], t: 70, d: 2, s: ['été'],
    i: [['aubergine', 260], ['coulis_tomate', 140], ['mozzarella', 55], ['parmesan', 25], ['ail', 2], ['basilic', 6], ['huile_olive', 13], ['pain_complet', 60]],
    e: ['Trancher les aubergines, les huiler et les rôtir 20 min à 200 °C.', 'Préparer une sauce tomate à l\'ail et au basilic.', 'Alterner aubergines, sauce et fromages dans un plat.', 'Enfourner 30 min à 180 °C, servir avec du pain.'] },

  { id: 'tian_legumes_provencal', n: 'Tian de légumes provençal', cu: 'France', tags: ['végétarien', 'four', 'légumes', 'été'], t: 70, d: 1, s: ['été'],
    i: [['courgette', 140], ['aubergine', 110], ['tomate', 130], ['oignon', 0.5], ['ail', 2], ['herbes_provence', 3], ['riz_complet', 70], ['chevre', 35], ['huile_olive', 12]],
    e: ['Faire fondre les oignons au fond du plat.', 'Ranger en rosace les rondelles de courgette, aubergine et tomate.', 'Arroser d\'huile, ajouter ail et herbes.', 'Enfourner 50 min à 180 °C, ajouter le chèvre 10 min avant la fin.', 'Servir avec le riz complet.'] },

  { id: 'curry_patate_douce_lentilles', n: 'Curry de patate douce et lentilles', cu: 'Inde', tags: ['végétarien', 'curry', 'lentilles', 'batch-cooking'], t: 40, d: 1,
    i: [['patate_douce', 160], ['lentille_corail', 70], ['lait_coco', 70], ['tomate_pelee', 90], ['oignon', 0.5], ['ail', 2], ['gingembre', 5], ['curry', 4], ['epinard', 60], ['riz_basmati', 60], ['huile_olive', 7], ['coriandre', 4]],
    e: ['Faire revenir oignon, ail, gingembre et curry.', 'Ajouter patate douce en cubes, lentilles et tomates.', 'Couvrir d\'eau et cuire 20 min.', 'Ajouter lait de coco et épinards, cuire 5 min.', 'Servir avec le riz et la coriandre.'] },

  { id: 'soupe_thai_coco_legumes', n: 'Soupe thaï coco et légumes', cu: 'Thaïlande', tags: ['végétarien', 'soupe', 'coco', 'épicé'], t: 30, d: 1,
    i: [['lait_coco', 100], ['pate_curry', 12], ['champignon', 80], ['carotte', 70], ['chou_blanc', 70], ['nouilles_riz', 65], ['tofu_ferme', 90], ['citron_vert', 0.5], ['coriandre', 5], ['bouillon_cube', 0.5], ['huile_tournesol', 6]],
    e: ['Chauffer la pâte de curry, ajouter le lait de coco et le bouillon.', 'Ajouter carottes, chou et champignons, cuire 8 min.', 'Ajouter nouilles et tofu en dés, cuire 4 min.', 'Finir au citron vert et à la coriandre.'] },

  { id: 'salade_pates_mozzarella', n: 'Salade de pâtes, mozzarella et tomates', cu: 'Italie', tags: ['végétarien', 'salade', 'froid', 'nomade'], t: 25, d: 1, s: ['été'],
    i: [['pates', 95], ['mozzarella', 60], ['tomate_cerise', 110], ['roquette', 30], ['olive_noire', 20], ['basilic', 6], ['pignon', 10], ['huile_olive', 12], ['vinaigre_balsamique', 8]],
    e: ['Cuire les pâtes al dente, les rafraîchir et les huiler légèrement.', 'Couper tomates et mozzarella.', 'Mélanger le tout avec roquette, olives et basilic.', 'Assaisonner à l\'huile et au balsamique, ajouter les pignons torréfiés.'] },

  { id: 'salade_crevettes_avocat_orange', n: 'Salade de crevettes, avocat et orange', cu: 'France', tags: ['crevettes', 'salade', 'frais', 'léger'], t: 25, d: 1, s: ['hiver', 'printemps'],
    i: [['crevette', 130], ['avocat', 0.5], ['orange', 0.75], ['mache', 60], ['pain_complet', 70], ['citron', 0.25], ['huile_olive', 12], ['aneth', 4], ['graine_courge', 10]],
    e: ['Peler l\'orange à vif et prélever les quartiers.', 'Tailler l\'avocat en lamelles et le citronner.', 'Dresser mâche, crevettes, avocat et orange.', 'Assaisonner avec huile, jus d\'orange et aneth, servir avec du pain complet.'] },

  { id: 'tarte_oignons_anchois', n: 'Pissaladière aux oignons confits', cu: 'France', tags: ['anchois', 'tarte', 'four', 'provençal'], t: 70, d: 2,
    i: [['pate_pizza', 120], ['oignon', 2.5], ['anchois', 12], ['olive_noire', 25], ['thym', 2], ['ail', 1], ['huile_olive', 12], ['salade_verte', 60], ['vinaigre', 6]],
    e: ['Confire les oignons émincés 40 min à feu très doux avec le thym.', 'Étaler la pâte et y répartir les oignons.', 'Disposer les anchois en croisillons et les olives.', 'Enfourner 20 min à 210 °C, servir avec une salade.'] },

  { id: 'pates_puttanesca', n: 'Spaghetti alla puttanesca', cu: 'Italie', tags: ['anchois', 'pâtes', 'rapide', 'relevé'], t: 25, d: 1,
    i: [['spaghetti', 100], ['tomate_pelee', 150], ['anchois', 10], ['olive_noire', 25], ['capre', 10], ['ail', 3], ['piment_espelette', 0.5], ['persil', 5], ['huile_olive', 10]],
    e: ['Faire fondre les anchois avec l\'ail et le piment dans l\'huile.', 'Ajouter tomates, olives et câpres, mijoter 15 min.', 'Cuire les spaghetti al dente.', 'Mélanger avec la sauce et le persil.'] },

  { id: 'poulet_farci_chevre', n: 'Filet de poulet farci au chèvre', cu: 'France', tags: ['poulet', 'four', 'fromage', 'festif'], t: 45, d: 2,
    i: [['poulet_filet', 150], ['chevre', 40], ['jambon_cru', 1], ['courgette', 110], ['tomate_cerise', 70], ['boulgour', 70], ['thym', 1], ['huile_olive', 9]],
    e: ['Inciser les filets en portefeuille et les garnir de chèvre et de thym.', 'Les envelopper d\'une tranche de jambon cru.', 'Les saisir 3 min puis enfourner 18 min à 190 °C avec les légumes.', 'Servir avec le boulgour.'] },

  { id: 'poulet_riz_one_pot', n: 'One-pot poulet, riz et légumes', cu: 'France', tags: ['poulet', 'one-pot', 'facile', 'peu de vaisselle'], t: 45, d: 1,
    i: [['poulet_cuisse', 170], ['riz_basmati', 80], ['carotte', 80], ['petit_pois', 70], ['poivron', 70], ['oignon', 0.5], ['ail', 2], ['bouillon_cube', 0.5], ['curcuma', 2], ['huile_olive', 8], ['persil', 4]],
    e: ['Dorer le poulet dans une cocotte, réserver.', 'Faire revenir oignon, ail, carotte et poivron.', 'Ajouter le riz, le nacrer, verser 2 fois son volume de bouillon.', 'Remettre le poulet, couvrir et cuire 20 min à feu doux.', 'Ajouter les petits pois 5 min avant la fin.'] },

  { id: 'pad_thai_poulet', n: 'Pad thaï au poulet', cu: 'Thaïlande', tags: ['poulet', 'nouilles', 'wok', 'asiatique'], t: 35, d: 2,
    i: [['poulet_emince', 130], ['nouilles_riz', 80], ['oeuf', 1], ['carotte', 60], ['chou_blanc', 70], ['noix_cajou', 18], ['sauce_soja', 18], ['citron_vert', 0.5], ['sucre', 8], ['ail', 2], ['huile_tournesol', 8], ['coriandre', 4]],
    e: ['Faire tremper les nouilles de riz 10 min dans l\'eau chaude.', 'Saisir le poulet à feu vif, réserver.', 'Brouiller l\'œuf dans le wok, ajouter carotte et chou.', 'Ajouter nouilles, poulet, sauce (soja, sucre, citron vert) et sauter 3 min.', 'Servir avec cajous concassées et coriandre.'] },

  { id: 'pho_boeuf', n: 'Phở au bœuf', cu: 'Vietnam', tags: ['bœuf', 'soupe', 'asiatique', 'réconfortant'], t: 50, d: 2,
    i: [['boeuf_steak', 110], ['nouilles_riz', 75], ['oignon', 0.5], ['gingembre', 10], ['cinq_epices', 2], ['bouillon_cube', 1], ['chou_blanc', 60], ['coriandre', 6], ['menthe', 4], ['citron_vert', 0.5], ['sauce_soja', 12]],
    e: ['Griller oignon et gingembre puis les infuser 30 min dans le bouillon avec les cinq-épices.', 'Cuire les nouilles séparément.', 'Trancher le bœuf très finement à cru.', 'Disposer nouilles et bœuf dans le bol, verser le bouillon brûlant.', 'Servir avec herbes, citron vert et soja.'] },

  { id: 'curry_massaman_boeuf', n: 'Curry massaman de bœuf', cu: 'Thaïlande', tags: ['bœuf', 'curry', 'coco', 'mijoté'], t: 120, d: 2,
    i: [['boeuf_mijot', 150], ['lait_coco', 80], ['pate_curry', 18], ['pomme_de_terre', 140], ['oignon', 0.5], ['amande', 12], ['cannelle', 1], ['sauce_soja', 12], ['riz_basmati', 70], ['citron_vert', 0.25], ['huile_tournesol', 7], ['haricot_vert', 90]],
    e: ['Dorer la viande, réserver.', 'Chauffer la pâte de curry, ajouter le lait de coco.', 'Remettre la viande avec la cannelle et un peu d\'eau, mijoter 1 h 15.', 'Ajouter les pommes de terre 30 min avant la fin.', 'Finir au citron vert, servir avec riz et amandes.'] },

  { id: 'bibimbap_boeuf', n: 'Bibimbap au bœuf et légumes', cu: 'Corée', tags: ['bœuf', 'bowl', 'riz', 'complet'], t: 45, d: 2,
    i: [['boeuf_steak', 110], ['riz_rond', 80], ['carotte', 70], ['epinard', 70], ['champignon', 70], ['oeuf', 1], ['sauce_soja', 18], ['huile_sesame', 8], ['ail', 2], ['graine_sesame', 6], ['chou_blanc', 60]],
    e: ['Cuire le riz.', 'Préparer séparément chaque légume sauté à l\'ail et au sésame.', 'Mariner le bœuf émincé au soja puis le saisir 2 min.', 'Cuire un œuf au plat.', 'Dresser le riz, disposer les garnitures en secteurs et poser l\'œuf.'] },

  { id: 'poulet_pane_curry_japonais', n: 'Poulet pané, sauce curry japonais', cu: 'Japon', tags: ['poulet', 'pané', 'curry', 'convivial'], t: 45, d: 2,
    i: [['poulet_filet', 140], ['chapelure', 35], ['oeuf', 0.5], ['farine', 12], ['oignon', 0.5], ['carotte', 80], ['curry', 5], ['farine', 8], ['bouillon_cube', 0.5], ['riz_basmati', 80], ['huile_tournesol', 12], ['sauce_soja', 10]],
    e: ['Paner les filets : farine, œuf, chapelure.', 'Préparer la sauce : oignon et carotte fondus, puis roux au curry, mouillé au bouillon, 15 min.', 'Cuire le poulet 4 min par face, le trancher.', 'Servir sur le riz, nappé de sauce curry.'] },

  { id: 'tartines_saumon_fromage_blanc', n: 'Tartines de saumon fumé et fromage blanc', cu: 'France', tags: ['saumon', 'tartine', 'rapide', 'sans cuisson'], t: 15, d: 1,
    i: [['pain_complet', 110], ['saumon_fume', 70], ['fromage_blanc', 60], ['aneth', 5], ['citron', 0.5], ['concombre', 80], ['salade_verte', 50], ['huile_olive', 8], ['oignon_rouge', 0.25]],
    e: ['Mélanger fromage blanc, aneth, zeste et jus de citron.', 'Toaster les tranches de pain complet.', 'Tartiner, garnir de saumon fumé, concombre et oignon rouge.', 'Servir avec une salade assaisonnée.'] },

  { id: 'tartines_chevre_miel_noix', n: 'Tartines chèvre, miel et noix', cu: 'France', tags: ['végétarien', 'tartine', 'rapide', 'fromage'], t: 20, d: 1,
    i: [['pain_complet', 110], ['chevre', 55], ['miel', 10], ['noix', 18], ['pomme', 0.4], ['salade_verte', 70], ['roquette', 25], ['huile_olive', 10], ['vinaigre_balsamique', 8], ['pomme_de_terre', 110]],
    e: ['Toaster le pain, y déposer le chèvre et les lamelles de pomme.', 'Arroser de miel et passer 6 min sous le gril.', 'Parsemer de noix concassées.', 'Servir avec une salade et des pommes de terre tièdes.'] },

  { id: 'veloute_brocoli_comte', n: 'Velouté de brocoli au comté', cu: 'France', tags: ['végétarien', 'soupe', 'rapide', 'léger'], t: 30, d: 1,
    i: [['brocoli', 250], ['pomme_de_terre', 110], ['oignon', 0.5], ['comte', 35], ['creme_liquide', 30], ['bouillon_cube', 0.5], ['pain_complet', 80], ['noix', 12], ['huile_olive', 7]],
    e: ['Faire suer l\'oignon, ajouter brocoli et pomme de terre.', 'Couvrir de bouillon et cuire 18 min.', 'Mixer avec la crème.', 'Servir avec le comté râpé, des noix et du pain complet grillé.'] },

  { id: 'salade_poulet_mangue', n: 'Salade de poulet à la mangue', cu: 'Fusion', tags: ['poulet', 'salade', 'frais', 'été'], t: 25, d: 1, s: ['été'],
    i: [['poulet_filet', 130], ['mangue', 0.35], ['salade_verte', 70], ['concombre', 70], ['avocat', 0.4], ['noix_cajou', 15], ['citron_vert', 0.5], ['sauce_soja', 10], ['miel', 6], ['huile_olive', 10], ['coriandre', 5]],
    e: ['Griller le poulet et le laisser tiédir avant de l\'émincer.', 'Tailler mangue, concombre et avocat.', 'Préparer une sauce citron vert, soja, miel et huile.', 'Assembler la salade et parsemer de cajous et de coriandre.'] },

  { id: 'wrap_thon_crudites', n: 'Wrap au thon et crudités', cu: 'France', tags: ['thon', 'wrap', 'rapide', 'nomade'], t: 15, d: 1,
    i: [['tortilla', 2], ['thon_conserve', 85], ['yaourt_grec', 35], ['mais_conserve', 40], ['carotte', 60], ['salade_verte', 40], ['tomate', 60], ['citron', 0.25], ['moutarde', 5], ['cornichon', 15]],
    e: ['Égoutter le thon et le mélanger au yaourt, à la moutarde et au citron.', 'Râper la carotte, trancher la tomate.', 'Garnir les tortillas de salade, thon, maïs et crudités.', 'Rouler serré et couper en deux.'] },

  { id: 'frittata_legumes_jambon', n: 'Frittata aux légumes et jambon', cu: 'Italie', tags: ['œufs', 'jambon', 'rapide', 'anti-gaspi'], t: 30, d: 1,
    i: [['oeuf', 3], ['jambon_blanc', 1], ['courgette', 100], ['poivron', 70], ['oignon', 0.4], ['parmesan', 20], ['pomme_de_terre', 120], ['basilic', 4], ['huile_olive', 9], ['salade_verte', 40]],
    e: ['Poêler pommes de terre en dés, courgette, poivron et oignon 12 min.', 'Ajouter le jambon en lanières.', 'Verser les œufs battus au parmesan.', 'Cuire 6 min à feu doux puis 4 min sous le gril.', 'Servir tiède avec une salade.'] },

  { id: 'gratin_macaroni_legumes', n: 'Gratin de macaronis aux légumes', cu: 'France', tags: ['végétarien', 'gratin', 'familial', 'enfants'], t: 50, d: 1,
    i: [['pates', 95], ['brocoli', 110], ['carotte', 70], ['lait', 140], ['farine', 15], ['beurre', 15], ['comte', 40], ['gruyere_rape', 20], ['muscade', 0.3], ['chapelure', 12]],
    e: ['Cuire les pâtes 2 min de moins que le temps indiqué, avec les légumes en fin de cuisson.', 'Préparer une béchamel muscadée et y fondre le comté.', 'Mélanger pâtes, légumes et sauce.', 'Parsemer de gruyère et de chapelure, gratiner 20 min à 200 °C.'] }

  ];

  global.MP_RECIPES = R;
})(typeof window !== 'undefined' ? window : globalThis);
