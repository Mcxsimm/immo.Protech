/* ==========================================================================
   Nos recettes — la base de la maison
   --------------------------------------------------------------------------
   Ces plats viennent de la liste « Repas » du foyer. Ils forment une base
   distincte du catalogue d'idées : le planificateur peut tirer dans l'une,
   dans l'autre, ou dans les deux (champ `src`).

     src: 'nous'   les recettes du foyer, et celles créées dans l'application
     src: 'idees'  le catalogue de 200 suggestions livré avec le site

   Même format que recipes.js : quantités POUR UNE PERSONNE, le reste est
   déduit des ingrédients.
   ========================================================================== */
(function (global) {
  'use strict';

  /* Le catalogue livré devient explicitement la base « idées ». */
  global.MP_RECIPES.forEach(function (r) { if (!r.src) r.src = 'idees'; });

  var MAISON = [

  { id: 'tasty_crousty_legume', n: 'Tasty crousty légume', cu: 'Fusion', tags: ['maison', 'bowl', 'croustillant', 'poulet'], t: 35, d: 2,
    i: [['poulet_filet', 130], ['riz_rond', 75], ['concombre', 80], ['edamame', 70], ['avocat', 0.5], ['sauce_soja', 15], ['huile_sesame', 6], ['graine_sesame', 5], ['mayonnaise', 15], ['citron_vert', 0.25]],
    e: ['Cuire le riz, l’étaler sur une plaque huilée et le passer 12 min sous le gril pour qu’il croustille.', 'Découper le poulet en aiguillettes, le saisir à feu vif jusqu’à ce qu’il soit doré.', 'Mélanger mayonnaise, sauce soja et citron vert pour la sauce.', 'Décongeler les édamamés, tailler concombre et avocat.', 'Dresser le bowl, napper de sauce et parsemer de sésame.'] },

  { id: 'bagel_saumon_avocat', n: 'Bagel saumon, avocat et fromage frais', cu: 'Maison', tags: ['maison', 'bagel', 'saumon', 'rapide'], t: 15, d: 1,
    i: [['bagel', 1], ['saumon_fume', 70], ['avocat', 0.5], ['fromage_frais', 40], ['oignon_frit', 10], ['citron', 0.25], ['salade_verte', 40], ['aneth', 3]],
    e: ['Trancher le bagel en deux et le toaster.', 'Tartiner généreusement de fromage frais citronné à l’aneth.', 'Garnir de saumon fumé et de lamelles d’avocat.', 'Parsemer d’oignons frits, servir avec une salade.'] },

  { id: 'cheese_naan', n: 'Cheese naan', cu: 'Inde', tags: ['maison', 'naan', 'fromage', 'rapide'], t: 20, d: 1,
    i: [['naan', 1.5], ['fromage_frais', 50], ['mozzarella', 50], ['salade_verte', 60], ['tomate', 80], ['huile_olive', 6], ['vinaigre_balsamique', 5]],
    e: ['Mélanger le fromage frais et la mozzarella égouttée en petits morceaux.', 'Garnir les naans, les replier et les souder en appuyant sur les bords.', 'Les dorer 3 min par face à la poêle sans matière grasse.', 'Servir coupés en deux avec une salade de tomates.'] },

  { id: 'gnocchis_chorizo', n: 'Gnocchis au chorizo', cu: 'Maison', tags: ['maison', 'gnocchi', 'chorizo', 'crémeux'], t: 25, d: 1,
    i: [['gnocchi', 220], ['chorizo', 35], ['oignon_rouge', 0.5], ['concentre_tomate', 20], ['creme_liquide', 40], ['roquette', 25], ['parmesan', 12], ['huile_olive', 6]],
    e: ['Faire revenir l’oignon rouge émincé et le chorizo en rondelles 5 min.', 'Ajouter le concentré de tomate, laisser torréfier 1 min.', 'Verser la crème et un peu d’eau, laisser réduire.', 'Poêler les gnocchis crus jusqu’à ce qu’ils dorent, puis les mêler à la sauce.', 'Servir avec la roquette et le parmesan — une burrata par-dessus si le cœur vous en dit.'] },

  { id: 'feuillete_chevre_miel', n: 'Feuilletés chèvre-miel et salade verte', cu: 'Maison', tags: ['maison', 'chèvre', 'four', 'végétarien'], t: 30, d: 2,
    i: [['feuille_brick', 3], ['chevre', 60], ['miel', 10], ['salade_verte', 80], ['noix', 12], ['pomme', 0.3], ['huile_olive', 8], ['vinaigre_balsamique', 6]],
    e: ['Couper le chèvre en bâtonnets et les arroser d’un filet de miel.', 'Les rouler en samoussas dans les feuilles de brick badigeonnées d’huile.', 'Enfourner 15 min à 200 °C jusqu’à ce qu’ils soient bien dorés.', 'Servir sur une salade aux pommes et aux noix, vinaigrette balsamique.'] },

  { id: 'grilled_cheese_pesto', n: 'Grilled cheese jambon, chèvre et pesto rouge', cu: 'Maison', tags: ['maison', 'sandwich', 'fromage', 'rapide'], t: 20, d: 1,
    i: [['pain_de_mie', 4], ['jambon_blanc', 1.5], ['chevre', 45], ['pesto_rouge', 20], ['beurre', 8], ['salade_verte', 60], ['tomate', 70], ['huile_olive', 6]],
    e: ['Tartiner l’intérieur des tranches de pesto rouge.', 'Garnir de jambon et de chèvre émietté, refermer.', 'Beurrer l’extérieur et cuire 3 min par face à la poêle, en pressant.', 'Couper en deux et servir avec une salade de tomates.'] },

  { id: 'pates_creme_champignons_parmesan', n: 'Pâtes crème, champignons et parmesan', cu: 'Maison', tags: ['maison', 'pâtes', 'champignons', 'crémeux'], t: 25, d: 1,
    i: [['pates', 100], ['champignon', 160], ['creme_liquide', 50], ['parmesan', 25], ['ail', 2], ['echalote', 1], ['persil', 4], ['huile_olive', 7]],
    e: ['Poêler les champignons à feu vif jusqu’à évaporation complète de leur eau.', 'Ajouter échalote et ail, puis la crème, laisser réduire 5 min.', 'Cuire les pâtes al dente et les mélanger à la sauce avec un peu d’eau de cuisson.', 'Finir au parmesan et au persil.'] },

  { id: 'poulet_orzo', n: 'Poulet orzo crémeux aux épinards', cu: 'Maison', tags: ['maison', 'one-pot', 'poulet', 'crémeux'], t: 35, d: 1,
    i: [['poulet_filet', 140], ['orzo', 80], ['creme_liquide', 45], ['parmesan', 22], ['bouillon_cube', 0.5], ['epinard', 90], ['ail', 2], ['oignon', 0.5], ['huile_olive', 7]],
    e: ['Saisir le poulet en cubes, réserver.', 'Faire suer oignon et ail, ajouter l’orzo et le nacrer.', 'Mouiller au bouillon à hauteur et cuire 10 min en remuant.', 'Ajouter crème, épinards et poulet, cuire 4 min.', 'Lier au parmesan hors du feu.'] },

  { id: 'salade_cesar_maison', n: 'Salade César', cu: 'Maison', tags: ['maison', 'salade', 'poulet', 'rapide'], t: 25, d: 1, s: ['printemps', 'été'],
    i: [['salade_verte', 90], ['poulet_filet', 130], ['parmesan', 20], ['pain', 40], ['yaourt_grec', 35], ['moutarde', 5], ['anchois', 5], ['citron', 0.25], ['ail', 0.5], ['huile_olive', 8]],
    e: ['Griller le poulet et le trancher.', 'Toaster des croûtons de pain à l’huile et à l’ail.', 'Mixer yaourt, moutarde, anchois et citron pour la sauce.', 'Assembler salade, poulet, croûtons, sauce et copeaux de parmesan.'] },

  { id: 'salade_mimosa', n: 'Salade mimosa', cu: 'Maison', tags: ['maison', 'salade', 'œufs', 'rapide'], t: 20, d: 1, s: ['printemps', 'été'],
    i: [['salade_verte', 90], ['oeuf', 2], ['mayonnaise', 20], ['thon_conserve', 60], ['tomate', 80], ['mais_conserve', 40], ['ciboulette', 4], ['pain', 50]],
    e: ['Cuire les œufs durs 9 min, les rafraîchir.', 'Séparer blancs et jaunes : hacher les blancs, écraser les jaunes à la fourchette.', 'Dresser salade, tomates, maïs et thon, napper de mayonnaise détendue.', 'Parsemer de blancs hachés puis de jaunes en « mimosa », et de ciboulette.'] },

  { id: 'semoule_falafel_tzatziki', n: 'Semoule, falafels, concombre et tzatziki', cu: 'Liban', tags: ['maison', 'falafel', 'végétarien', 'tzatziki'], t: 40, d: 2,
    i: [['pois_chiche', 150], ['semoule', 75], ['concombre', 90], ['yaourt_grec', 60], ['ail', 1], ['menthe', 4], ['cumin', 3], ['persil', 6], ['farine', 15], ['huile_tournesol', 10], ['citron', 0.25]],
    e: ['Mixer pois chiches, persil, cumin et la moitié de l’ail, ajouter la farine.', 'Former des boulettes, les laisser reposer 15 min au frais.', 'Les cuire 8 min à la poêle en les retournant.', 'Râper le concombre, l’essorer et le mêler au yaourt, à l’ail restant et à la menthe.', 'Servir sur la semoule avec le tzatziki.'] },

  { id: 'wrap_dinde_epinard', n: 'Wrap blanc de dinde, épinards et fromage frais', cu: 'Maison', tags: ['maison', 'wrap', 'rapide', 'nomade'], t: 15, d: 1,
    i: [['tortilla', 2], ['blanc_dinde', 3], ['epinard', 50], ['fromage_frais', 45], ['tomate', 70], ['salade_verte', 30], ['citron', 0.2]],
    e: ['Tartiner les tortillas de fromage frais citronné.', 'Répartir épinards, salade, tomates en rondelles et blanc de dinde.', 'Rouler bien serré, couper en biais.'] },

  { id: 'bouddha_bowl_poulet_curry', n: 'Bouddha bowl poulet curry', cu: 'Fusion', tags: ['maison', 'bowl', 'poulet', 'curry'], t: 35, d: 1,
    i: [['poulet_filet', 130], ['riz_basmati', 75], ['courgette', 120], ['tomate_cerise', 80], ['curry', 4], ['yaourt_grec', 40], ['huile_olive', 8], ['citron', 0.25], ['coriandre', 4]],
    e: ['Mariner le poulet en cubes avec le curry et un peu d’huile, puis le saisir 8 min.', 'Poêler les courgettes en rondelles.', 'Cuire le riz.', 'Mélanger yaourt, citron et coriandre pour la sauce.', 'Dresser le bowl par secteurs, napper de sauce.'] },

  { id: 'salade_mache_melon_cajou', n: 'Salade mâche, melon, cajou et feta', cu: 'Maison', tags: ['maison', 'salade', 'été', 'frais'], t: 15, d: 1, s: ['été'],
    i: [['mache', 110], ['melon', 160], ['noix_cajou', 20], ['feta', 50], ['menthe', 5], ['huile_olive', 10], ['vinaigre_balsamique', 6], ['pain_complet', 60]],
    e: ['Tailler le melon en billes ou en cubes.', 'Torréfier les noix de cajou à sec.', 'Dresser la mâche, le melon et la feta émiettée.', 'Assaisonner, parsemer de menthe et de cajous, servir avec du pain.'] },

  { id: 'taboule_feta_dinde', n: 'Taboulé feta, concombre et blanc de dinde', cu: 'Maison', tags: ['maison', 'taboulé', 'froid', 'nomade'], t: 25, d: 1, s: ['été'],
    i: [['semoule', 75], ['feta', 45], ['concombre', 100], ['blanc_dinde', 3], ['tomate', 80], ['menthe', 5], ['persil', 6], ['citron', 0.5], ['huile_olive', 10]],
    e: ['Faire gonfler la semoule 15 min avec le jus de citron et un peu d’eau tiède.', 'Tailler concombre, tomate et dinde en petits dés.', 'Mélanger le tout avec la feta émiettée et les herbes.', 'Réserver 30 min au frais avant de servir.'] },

  { id: 'lasagne_ete', n: 'Lasagne d’été', cu: 'Italie', tags: ['maison', 'gratin', 'légumes', 'été'], t: 70, d: 2, s: ['été'],
    i: [['lasagne', 70], ['courgette', 130], ['aubergine', 100], ['tomate_cerise', 80], ['ricotta', 70], ['mozzarella', 40], ['coulis_tomate', 110], ['basilic', 5], ['ail', 2], ['huile_olive', 9]],
    e: ['Poêler courgettes et aubergines en fines lamelles.', 'Mélanger la ricotta avec l’ail et le basilic.', 'Alterner plaques, légumes, ricotta et coulis.', 'Terminer par la mozzarella et les tomates cerises.', 'Enfourner 35 min à 180 °C.'] },

  { id: 'salade_pomme_camembert', n: 'Salade pomme, camembert et graines', cu: 'Maison', tags: ['maison', 'salade', 'fromage', 'automne'], t: 15, d: 1, s: ['automne', 'hiver'],
    i: [['salade_verte', 90], ['pomme', 0.7], ['camembert', 60], ['graine_courge', 15], ['noix', 12], ['pain_complet', 70], ['moutarde', 5], ['vinaigre_balsamique', 7], ['huile_olive', 10]],
    e: ['Tailler la pomme en fines lamelles et le camembert en dés.', 'Torréfier graines et noix à sec 3 min.', 'Préparer une vinaigrette moutarde-balsamique.', 'Assembler et servir avec du pain complet grillé.'] },

  { id: 'salade_crevette_pamplemousse', n: 'Salade crevette, pamplemousse et feta', cu: 'Maison', tags: ['maison', 'salade', 'crevettes', 'frais'], t: 20, d: 1, s: ['hiver', 'printemps'],
    i: [['crevette', 130], ['pamplemousse', 0.5], ['feta', 40], ['mache', 70], ['avocat', 0.4], ['huile_olive', 10], ['citron', 0.25], ['aneth', 4], ['pain_complet', 60]],
    e: ['Peler le pamplemousse à vif et prélever les quartiers.', 'Poêler les crevettes 3 min, les laisser tiédir.', 'Dresser la mâche, l’avocat, le pamplemousse et la feta.', 'Assaisonner à l’huile, au citron et à l’aneth.'] },

  { id: 'wrap_thon_mais', n: 'Wrap thon, maïs et fromage frais', cu: 'Maison', tags: ['maison', 'wrap', 'thon', 'rapide'], t: 15, d: 1,
    i: [['tortilla', 2], ['thon_conserve', 80], ['mais_conserve', 50], ['fromage_frais', 45], ['salade_verte', 40], ['tomate', 60], ['citron', 0.25]],
    e: ['Égoutter le thon et le mélanger au fromage frais et au citron.', 'Tartiner les tortillas, ajouter maïs, salade et tomates.', 'Rouler serré et couper en deux.'] },

  { id: 'poulet_concombre_tzatziki_semoule', n: 'Poulet, concombre, tzatziki et semoule', cu: 'Grèce', tags: ['maison', 'poulet', 'tzatziki', 'rapide'], t: 30, d: 1, s: ['été'],
    i: [['poulet_filet', 140], ['semoule', 75], ['concombre', 100], ['yaourt_grec', 60], ['ail', 1], ['menthe', 4], ['citron', 0.25], ['huile_olive', 8], ['paprika', 3]],
    e: ['Mariner le poulet au paprika, à l’huile et au citron, puis le griller 10 min.', 'Râper le concombre, l’essorer et le mêler au yaourt, à l’ail et à la menthe.', 'Gonfler la semoule.', 'Servir le poulet tranché sur la semoule, tzatziki à part.'] },

  { id: 'taboule_courgette_dinde', n: 'Taboulé courgette, feta et blanc de dinde', cu: 'Maison', tags: ['maison', 'taboulé', 'froid', 'nomade'], t: 25, d: 1, s: ['été'],
    i: [['semoule', 75], ['courgette', 110], ['feta', 45], ['blanc_dinde', 3], ['menthe', 5], ['citron', 0.5], ['huile_olive', 10], ['tomate_cerise', 70]],
    e: ['Faire gonfler la semoule au citron.', 'Râper la courgette crue et l’essorer.', 'Mélanger avec la feta, la dinde en lanières et les tomates cerises.', 'Assaisonner et laisser reposer au frais.'] },

  { id: 'poulet_semoule_ratatouille', n: 'Poulet, semoule et ratatouille', cu: 'France', tags: ['maison', 'poulet', 'légumes', 'été'], t: 50, d: 1, s: ['été', 'automne'],
    i: [['poulet_filet', 140], ['semoule', 75], ['courgette', 110], ['aubergine', 100], ['poivron', 80], ['tomate', 100], ['oignon', 0.5], ['ail', 2], ['herbes_provence', 3], ['huile_olive', 10]],
    e: ['Poêler séparément aubergine, courgette et poivron pour qu’ils restent fermes.', 'Faire compoter oignon, ail et tomates 15 min.', 'Réunir les légumes avec les herbes, mijoter 20 min.', 'Griller le poulet et le servir tranché sur la semoule, avec la ratatouille.'] },

  { id: 'risotto_poulet_champignon', n: 'Risotto poulet, champignons et parmesan', cu: 'Italie', tags: ['maison', 'risotto', 'poulet', 'crémeux'], t: 45, d: 2,
    i: [['riz_rond', 85], ['poulet_filet', 130], ['champignon', 130], ['parmesan', 25], ['vin_blanc', 45], ['bouillon_cube', 0.5], ['echalote', 1], ['beurre', 10], ['huile_olive', 6]],
    e: ['Saisir le poulet en cubes, réserver. Poêler les champignons à feu vif.', 'Nacrer le riz avec l’échalote, déglacer au vin blanc.', 'Mouiller au bouillon louche par louche pendant 18 min.', 'Ajouter poulet et champignons, lier au beurre et au parmesan hors du feu.'] },

  { id: 'crevette_patate_douce_feta', n: 'Crevettes, patate douce, feta et salade', cu: 'Maison', tags: ['maison', 'crevettes', 'four', 'patate douce'], t: 40, d: 1,
    i: [['crevette', 130], ['patate_douce', 170], ['feta', 40], ['salade_verte', 60], ['citron', 0.25], ['paprika', 3], ['huile_olive', 10], ['coriandre', 4]],
    e: ['Rôtir les patates douces en cubes 30 min à 200 °C avec huile et paprika.', 'Poêler les crevettes 3 min.', 'Dresser sur la salade, ajouter la feta émiettée.', 'Arroser de citron et parsemer de coriandre.'] },

  { id: 'salade_italienne', n: 'Salade italienne burrata et jambon sec', cu: 'Italie', tags: ['maison', 'salade', 'burrata', 'été'], t: 20, d: 1, s: ['été'],
    i: [['pates', 85], ['epinard', 60], ['tomate_cerise', 100], ['burrata', 60], ['jambon_cru', 2], ['basilic', 5], ['huile_olive', 10], ['vinaigre_balsamique', 6], ['pignon', 8]],
    e: ['Cuire les pâtes al dente, les rafraîchir et les huiler légèrement.', 'Mélanger avec les épinards frais et les tomates cerises coupées en deux.', 'Déposer la burrata entière au centre et le jambon sec autour.', 'Assaisonner, parsemer de basilic et de pignons torréfiés.'] },

  { id: 'bagel_grisons_chevre', n: 'Bagel pesto rouge, Grisons et chèvre', cu: 'Maison', tags: ['maison', 'bagel', 'rapide', 'fromage'], t: 15, d: 1,
    i: [['bagel', 1], ['pesto_rouge', 20], ['viande_grisons', 4], ['chevre', 45], ['roquette', 25], ['tomate', 60]],
    e: ['Toaster le bagel coupé en deux.', 'Tartiner de pesto rouge sur les deux faces.', 'Garnir de chèvre en rondelles, de viande des Grisons et de tomate.', 'Ajouter la roquette au dernier moment.'] },

  { id: 'salade_cesar_poulet_pane', n: 'Salade verte, sauce César et poulet pané', cu: 'Maison', tags: ['maison', 'salade', 'poulet', 'pané'], t: 30, d: 1,
    i: [['salade_verte', 100], ['poulet_filet', 130], ['chapelure', 30], ['oeuf', 0.5], ['parmesan', 22], ['yaourt_grec', 35], ['moutarde', 5], ['citron', 0.25], ['huile_tournesol', 10], ['tomate_cerise', 60]],
    e: ['Aplatir le poulet, le passer dans l’œuf puis la chapelure mêlée à un peu de parmesan.', 'Le cuire 4 min par face à la poêle.', 'Mélanger yaourt, moutarde et citron pour la sauce César.', 'Dresser la salade, poser le poulet tranché, napper et ajouter des copeaux de parmesan.'] },

  { id: 'wok_legumes_poulet_cacahuete', n: 'Wok de légumes, poulet cacahuète', cu: 'Asie', tags: ['maison', 'wok', 'poulet', 'cacahuète'], t: 30, d: 1,
    i: [['poulet_emince', 130], ['courgette', 110], ['carotte', 80], ['beurre_cacahuete', 25], ['sauce_soja', 18], ['riz_basmati', 75], ['ail', 2], ['gingembre', 5], ['huile_sesame', 7], ['citron_vert', 0.25]],
    e: ['Détendre le beurre de cacahuète avec la sauce soja, le citron vert et un peu d’eau chaude.', 'Saisir le poulet à feu vif 4 min, réserver.', 'Sauter carotte et courgette taillées fin 5 min avec ail et gingembre.', 'Remettre le poulet, verser la sauce, laisser napper 2 min.', 'Servir sur le riz.'] },

  { id: 'pasta_bowl', n: 'Pasta bowl légumes et sauce yaourt', cu: 'Maison', tags: ['maison', 'pâtes', 'végétarien', 'été'], t: 30, d: 1, s: ['été'],
    i: [['pates', 100], ['courgette', 110], ['aubergine', 90], ['tomate_cerise', 90], ['parmesan', 20], ['yaourt_grec', 50], ['ail', 2], ['basilic', 5], ['huile_olive', 9]],
    e: ['Rôtir courgette, aubergine et tomates cerises 25 min à 200 °C avec l’huile.', 'Cuire les pâtes al dente.', 'Mélanger le yaourt avec l’ail écrasé et le basilic.', 'Réunir pâtes et légumes, napper de sauce yaourt, finir au parmesan.'] },

  { id: 'pates_carbo_maison', n: 'Pâtes carbo', cu: 'Italie', tags: ['maison', 'pâtes', 'rapide', 'réconfortant'], t: 25, d: 1,
    i: [['spaghetti', 100], ['lardons', 45], ['oeuf', 1], ['parmesan', 25], ['salade_verte', 60], ['tomate_cerise', 70], ['huile_olive', 5], ['vinaigre_balsamique', 5]],
    e: ['Cuire les spaghetti al dente.', 'Faire rissoler les lardons.', 'Battre l’œuf avec le parmesan et beaucoup de poivre.', 'Hors du feu, mélanger pâtes, lardons et appareil, détendre à l’eau de cuisson.', 'Servir avec une salade de tomates cerises.'] },

  { id: 'crevette_2_poivrons', n: 'Crevettes aux deux poivrons', cu: 'Maison', tags: ['maison', 'crevettes', 'poivrons', 'rapide'], t: 25, d: 1,
    i: [['crevette', 140], ['poivron', 160], ['fromage_blanc', 60], ['parmesan', 20], ['ail', 2], ['riz_basmati', 70], ['persil', 5], ['huile_olive', 8], ['piment_espelette', 0.5]],
    e: ['Émincer les poivrons et les faire fondre 12 min à l’huile avec l’ail.', 'Ajouter les crevettes et les saisir 3 min.', 'Hors du feu, lier au fromage blanc et au parmesan.', 'Relever au piment d’Espelette, parsemer de persil, servir avec le riz.'] },

  { id: 'salade_haricot_rouge_quinoa', n: 'Salade haricots rouges, maïs et quinoa', cu: 'Mexique', tags: ['maison', 'salade', 'végétarien', 'nomade'], t: 25, d: 1,
    i: [['haricot_rouge', 130], ['quinoa', 70], ['tomate', 100], ['mais_conserve', 50], ['avocat', 0.5], ['fromage_blanc', 50], ['citron_vert', 0.3], ['coriandre', 5], ['cumin', 2], ['huile_olive', 8]],
    e: ['Cuire le quinoa 12 min, le rafraîchir.', 'Mélanger haricots égouttés, maïs, tomates en dés et quinoa.', 'Fouetter fromage blanc, citron vert, cumin et huile pour la sauce.', 'Ajouter l’avocat et la coriandre au moment de servir.'] },

  { id: 'salade_quinoa_thon_avocat', n: 'Salade quinoa, avocat et thon', cu: 'Maison', tags: ['maison', 'salade', 'thon', 'nomade'], t: 25, d: 1,
    i: [['quinoa', 75], ['thon_conserve', 80], ['avocat', 0.5], ['fromage_frais', 40], ['concombre', 80], ['tomate_cerise', 80], ['citron', 0.5], ['ciboulette', 4], ['huile_olive', 8]],
    e: ['Cuire le quinoa et le laisser refroidir.', 'Détendre le fromage frais avec le citron et la ciboulette.', 'Mélanger quinoa, thon, concombre et tomates cerises.', 'Ajouter l’avocat en dés et la sauce juste avant de servir.'] },

  { id: 'fajitas_poulet_maison', n: 'Fajitas poulet', cu: 'Mexique', tags: ['maison', 'fajitas', 'poulet', 'convivial'], t: 30, d: 1,
    i: [['poulet_emince', 130], ['tortilla', 2], ['poivron', 110], ['oignon', 0.5], ['tomate', 70], ['cheddar', 30], ['fromage_blanc', 40], ['salade_verte', 30], ['paprika', 3], ['cumin', 2], ['huile_olive', 7]],
    e: ['Mariner le poulet au paprika, au cumin et à l’huile 10 min.', 'Le saisir à feu vif 5 min, réserver.', 'Faire sauter poivrons et oignons 6 min.', 'Réchauffer les tortillas, garnir de poulet, légumes, cheddar, salade et fromage blanc.'] },

  { id: 'tomate_mozza_jambon_sec', n: 'Tomate, mozzarella et jambon sec', cu: 'Italie', tags: ['maison', 'salade', 'été', 'sans cuisson'], t: 15, d: 1, s: ['été'],
    i: [['tomate', 200], ['mozzarella', 70], ['jambon_cru', 2], ['basilic', 6], ['huile_olive', 10], ['vinaigre_balsamique', 6], ['pain', 80], ['pignon', 8]],
    e: ['Trancher tomates et mozzarella, les disposer en alternance.', 'Ajouter le jambon sec en chiffonnade.', 'Arroser d’huile et de balsamique, saler et poivrer.', 'Parsemer de basilic et de pignons, servir avec du pain.'] },

  { id: 'salade_tacos', n: 'Salade tacos', cu: 'Mexique', tags: ['maison', 'salade', 'bœuf', 'convivial'], t: 25, d: 1,
    i: [['boeuf_hache', 120], ['salade_verte', 90], ['tomate', 90], ['cheddar', 35], ['mais_conserve', 40], ['tortilla', 1], ['fromage_blanc', 40], ['cumin', 3], ['paprika', 2], ['huile_olive', 7]],
    e: ['Faire revenir la viande hachée avec cumin et paprika.', 'Couper la tortilla en lanières et la faire dorer pour obtenir des chips.', 'Dresser salade, tomates, maïs et viande.', 'Ajouter le cheddar, le fromage blanc et les chips de tortilla.'] }

  ];

  MAISON.forEach(function (r) { r.src = 'nous'; global.MP_RECIPES.push(r); });
  global.MP_RECIPES_MAISON = MAISON;
})(typeof window !== 'undefined' ? window : globalThis);
