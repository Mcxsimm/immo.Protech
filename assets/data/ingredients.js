/* ==========================================================================
   Catalogue d'ingredients
   --------------------------------------------------------------------------
   Chaque ingredient porte :
     id   identifiant technique (reference depuis les recettes)
     n    nom affiche
     r    rayon du magasin (ordre de parcours defini dans RAYONS)
     u    unite canonique : 'g', 'ml' ou 'pc' (piece)
     pc   poids en grammes d'une piece (si u === 'pc')
     up   libelle de l'unite piece ('gousse', 'oeuf'...)
     kcal/p/c/l/f  valeurs nutritionnelles pour 100 g (kcal, proteines,
          glucides, lipides, fibres)
     px   prix indicatif : EUR/kg si u==='g', EUR/L si u==='ml', EUR/piece si 'pc'
     pk   conditionnement courant (en unite canonique), pkl son libelle
     ct   categorie alimentaire (sert au moteur d'equilibre)
     veg  1 si compte comme legume, fr 1 si compte comme fruit
     pl   1 si produit de placard (suppose deja possede)
     al   allergenes
   Les valeurs nutritionnelles et les prix sont des ordres de grandeur
   (tables CIQUAL simplifiees / prix moyens grande distribution).
   ========================================================================== */
(function (global) {
  'use strict';

  var RAYONS = [
    { id: 'legumes', n: 'Fruits & légumes', icon: 'leaf' },
    { id: 'boucherie', n: 'Boucherie & volaille', icon: 'meat' },
    { id: 'poissonnerie', n: 'Poissonnerie', icon: 'fish' },
    { id: 'cremerie', n: 'Crèmerie & œufs', icon: 'milk' },
    { id: 'epicerie', n: 'Épicerie salée', icon: 'can' },
    { id: 'condiments', n: 'Huiles, épices & condiments', icon: 'spice' },
    { id: 'boulangerie', n: 'Pain & pâtes fraîches', icon: 'bread' },
    { id: 'surgeles', n: 'Surgelés', icon: 'snow' },
    { id: 'boissons', n: 'Boissons', icon: 'bottle' }
  ];

  var ING = [

    /* ---------------------------- FRUITS & LEGUMES ---------------------- */
    { id: 'oignon', n: 'Oignon', r: 'legumes', u: 'pc', pc: 110, up: 'oignon', kcal: 40, p: 1.1, c: 9, l: 0.1, f: 1.7, px: 0.35, ct: 'legume', veg: 1 },
    { id: 'oignon_rouge', n: 'Oignon rouge', r: 'legumes', u: 'pc', pc: 110, up: 'oignon rouge', kcal: 40, p: 1.1, c: 9, l: 0.1, f: 1.7, px: 0.45, ct: 'legume', veg: 1 },
    { id: 'echalote', n: "Échalote", r: 'legumes', u: 'pc', pc: 30, up: "échalote", kcal: 72, p: 2.5, c: 16.8, l: 0.1, f: 3.2, px: 0.25, ct: 'legume', veg: 1 },
    { id: 'ail', n: 'Ail', r: 'legumes', u: 'pc', pc: 5, up: 'gousse', kcal: 149, p: 6.4, c: 33, l: 0.5, f: 2.1, px: 0.1, ct: 'legume' },
    { id: 'carotte', n: 'Carotte', r: 'legumes', u: 'g', kcal: 41, p: 0.9, c: 9.6, l: 0.2, f: 2.8, px: 1.6, ct: 'legume', veg: 1 },
    { id: 'poireau', n: 'Poireau', r: 'legumes', u: 'g', kcal: 29, p: 1.5, c: 6, l: 0.3, f: 2.2, px: 2.6, ct: 'legume', veg: 1 },
    { id: 'courgette', n: 'Courgette', r: 'legumes', u: 'g', kcal: 17, p: 1.2, c: 3.1, l: 0.3, f: 1, px: 2.4, ct: 'legume', veg: 1 },
    { id: 'aubergine', n: 'Aubergine', r: 'legumes', u: 'g', kcal: 25, p: 1, c: 6, l: 0.2, f: 3, px: 2.9, ct: 'legume', veg: 1 },
    { id: 'poivron', n: 'Poivron', r: 'legumes', u: 'g', kcal: 26, p: 1, c: 6, l: 0.3, f: 2, px: 3.5, ct: 'legume', veg: 1 },
    { id: 'tomate', n: 'Tomate', r: 'legumes', u: 'g', kcal: 18, p: 0.9, c: 3.9, l: 0.2, f: 1.2, px: 2.8, ct: 'legume', veg: 1 },
    { id: 'tomate_cerise', n: 'Tomates cerises', r: 'legumes', u: 'g', kcal: 18, p: 0.9, c: 3.9, l: 0.2, f: 1.2, px: 5.5, pk: 250, pkl: 'barquette', ct: 'legume', veg: 1 },
    { id: 'pomme_de_terre', n: 'Pommes de terre', r: 'legumes', u: 'g', kcal: 77, p: 2, c: 17, l: 0.1, f: 2.2, px: 1.5, ct: 'feculent' },
    { id: 'patate_douce', n: 'Patate douce', r: 'legumes', u: 'g', kcal: 86, p: 1.6, c: 20, l: 0.1, f: 3, px: 3.2, ct: 'feculent', veg: 1 },
    { id: 'brocoli', n: 'Brocoli', r: 'legumes', u: 'g', kcal: 34, p: 2.8, c: 7, l: 0.4, f: 2.6, px: 3.4, ct: 'legume', veg: 1 },
    { id: 'chou_fleur', n: 'Chou-fleur', r: 'legumes', u: 'g', kcal: 25, p: 1.9, c: 5, l: 0.3, f: 2, px: 2.6, ct: 'legume', veg: 1 },
    { id: 'chou_blanc', n: 'Chou blanc', r: 'legumes', u: 'g', kcal: 25, p: 1.3, c: 5.8, l: 0.1, f: 2.5, px: 1.9, ct: 'legume', veg: 1 },
    { id: 'chou_rouge', n: 'Chou rouge', r: 'legumes', u: 'g', kcal: 31, p: 1.4, c: 6, l: 0.2, f: 2.1, px: 2.2, ct: 'legume', veg: 1 },
    { id: 'chou_bruxelles', n: "Choux de Bruxelles", r: 'legumes', u: 'g', kcal: 43, p: 3.4, c: 7, l: 0.3, f: 3.8, px: 3.6, ct: 'legume', veg: 1 },
    { id: 'haricot_vert', n: 'Haricots verts', r: 'legumes', u: 'g', kcal: 31, p: 1.8, c: 7, l: 0.1, f: 3.4, px: 4.2, ct: 'legume', veg: 1 },
    { id: 'epinard', n: "Épinards frais", r: 'legumes', u: 'g', kcal: 23, p: 2.9, c: 3.6, l: 0.4, f: 2.2, px: 6.5, pk: 250, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'salade_verte', n: 'Salade verte', r: 'legumes', u: 'g', kcal: 15, p: 1.4, c: 2.9, l: 0.2, f: 1.3, px: 4, pk: 150, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'roquette', n: 'Roquette', r: 'legumes', u: 'g', kcal: 25, p: 2.6, c: 3.7, l: 0.7, f: 1.6, px: 12, pk: 100, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'mache', n: "Mâche", r: 'legumes', u: 'g', kcal: 21, p: 2, c: 3.6, l: 0.4, f: 1.8, px: 11, pk: 125, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'champignon', n: "Champignons de Paris", r: 'legumes', u: 'g', kcal: 22, p: 3.1, c: 3.3, l: 0.3, f: 1, px: 4.5, ct: 'legume', veg: 1 },
    { id: 'champignon_foret', n: "Champignons des bois", r: 'legumes', u: 'g', kcal: 26, p: 3, c: 4, l: 0.4, f: 2, px: 9, ct: 'legume', veg: 1 },
    { id: 'celeri_branche', n: "Céleri branche", r: 'legumes', u: 'g', kcal: 16, p: 0.7, c: 3, l: 0.2, f: 1.6, px: 2.6, ct: 'legume', veg: 1 },
    { id: 'celeri_rave', n: "Céleri-rave", r: 'legumes', u: 'g', kcal: 42, p: 1.5, c: 9, l: 0.3, f: 1.8, px: 2.4, ct: 'legume', veg: 1 },
    { id: 'fenouil', n: 'Fenouil', r: 'legumes', u: 'g', kcal: 31, p: 1.2, c: 7, l: 0.2, f: 3.1, px: 3.4, ct: 'legume', veg: 1 },
    { id: 'butternut', n: "Courge butternut", r: 'legumes', u: 'g', kcal: 45, p: 1, c: 12, l: 0.1, f: 2, px: 2.6, ct: 'legume', veg: 1 },
    { id: 'potiron', n: 'Potiron', r: 'legumes', u: 'g', kcal: 26, p: 1, c: 6.5, l: 0.1, f: 1.5, px: 2.2, ct: 'legume', veg: 1 },
    { id: 'concombre', n: 'Concombre', r: 'legumes', u: 'g', kcal: 15, p: 0.7, c: 3.6, l: 0.1, f: 0.5, px: 2.4, ct: 'legume', veg: 1 },
    { id: 'radis', n: 'Radis', r: 'legumes', u: 'g', kcal: 16, p: 0.7, c: 3.4, l: 0.1, f: 1.6, px: 3.5, pk: 200, pkl: 'botte', ct: 'legume', veg: 1 },
    { id: 'betterave', n: "Betterave cuite", r: 'legumes', u: 'g', kcal: 43, p: 1.6, c: 10, l: 0.2, f: 2.8, px: 3.8, ct: 'legume', veg: 1 },
    { id: 'navet', n: 'Navet', r: 'legumes', u: 'g', kcal: 28, p: 0.9, c: 6, l: 0.1, f: 1.8, px: 2.2, ct: 'legume', veg: 1 },
    { id: 'endive', n: 'Endives', r: 'legumes', u: 'g', kcal: 17, p: 1, c: 3, l: 0.1, f: 2.1, px: 2.8, ct: 'legume', veg: 1 },
    { id: 'asperge', n: "Asperges vertes", r: 'legumes', u: 'g', kcal: 20, p: 2.2, c: 3.9, l: 0.1, f: 2.1, px: 9, ct: 'legume', veg: 1 },
    { id: 'blette', n: 'Blettes', r: 'legumes', u: 'g', kcal: 19, p: 1.8, c: 3.7, l: 0.2, f: 1.6, px: 3, ct: 'legume', veg: 1 },
    { id: 'avocat', n: 'Avocat', r: 'legumes', u: 'pc', pc: 150, up: 'avocat', kcal: 160, p: 2, c: 1.8, l: 15, f: 6.7, px: 1.3, ct: 'matiere_grasse', veg: 1 },
    { id: 'citron', n: 'Citron', r: 'legumes', u: 'pc', pc: 100, up: 'citron', kcal: 29, p: 1.1, c: 3, l: 0.3, f: 2.8, px: 0.5, ct: 'fruit' },
    { id: 'citron_vert', n: "Citron vert", r: 'legumes', u: 'pc', pc: 70, up: 'citron vert', kcal: 30, p: 0.7, c: 3, l: 0.2, f: 2.8, px: 0.55, ct: 'fruit' },
    { id: 'orange', n: 'Orange', r: 'legumes', u: 'pc', pc: 180, up: 'orange', kcal: 47, p: 0.9, c: 9, l: 0.1, f: 2.4, px: 0.5, ct: 'fruit', fr: 1 },
    { id: 'pomme', n: 'Pomme', r: 'legumes', u: 'pc', pc: 170, up: 'pomme', kcal: 52, p: 0.3, c: 11, l: 0.2, f: 2.4, px: 0.45, ct: 'fruit', fr: 1 },
    { id: 'poire', n: 'Poire', r: 'legumes', u: 'pc', pc: 170, up: 'poire', kcal: 57, p: 0.4, c: 12, l: 0.1, f: 3.1, px: 0.55, ct: 'fruit', fr: 1 },
    { id: 'banane', n: 'Banane', r: 'legumes', u: 'pc', pc: 120, up: 'banane', kcal: 89, p: 1.1, c: 20, l: 0.3, f: 2.6, px: 0.3, ct: 'fruit', fr: 1 },
    { id: 'mangue', n: 'Mangue', r: 'legumes', u: 'pc', pc: 300, up: 'mangue', kcal: 60, p: 0.8, c: 14, l: 0.4, f: 1.6, px: 2.2, ct: 'fruit', fr: 1 },
    { id: 'ananas', n: 'Ananas', r: 'legumes', u: 'g', kcal: 50, p: 0.5, c: 11, l: 0.1, f: 1.4, px: 2.5, ct: 'fruit', fr: 1 },
    { id: 'fraise', n: 'Fraises', r: 'legumes', u: 'g', kcal: 32, p: 0.7, c: 6, l: 0.3, f: 2, px: 9, pk: 250, pkl: 'barquette', ct: 'fruit', fr: 1 },
    { id: 'raisin_frais', n: 'Raisin', r: 'legumes', u: 'g', kcal: 69, p: 0.7, c: 16, l: 0.2, f: 0.9, px: 4.5, ct: 'fruit', fr: 1 },
    { id: 'gingembre', n: "Gingembre frais", r: 'legumes', u: 'g', kcal: 80, p: 1.8, c: 15, l: 0.8, f: 2, px: 9, ct: 'aromate' },
    { id: 'piment_frais', n: "Piment frais", r: 'legumes', u: 'pc', pc: 10, up: 'piment', kcal: 40, p: 1.9, c: 7, l: 0.4, f: 1.5, px: 0.3, ct: 'aromate' },
    { id: 'persil', n: "Persil frais", r: 'legumes', u: 'g', kcal: 36, p: 3, c: 4, l: 0.8, f: 3.3, px: 10, pk: 30, pkl: 'botte', ct: 'aromate' },
    { id: 'coriandre', n: "Coriandre fraîche", r: 'legumes', u: 'g', kcal: 23, p: 2.1, c: 1.5, l: 0.5, f: 2.8, px: 12, pk: 25, pkl: 'botte', ct: 'aromate' },
    { id: 'basilic', n: "Basilic frais", r: 'legumes', u: 'g', kcal: 23, p: 3.2, c: 1.1, l: 0.6, f: 1.6, px: 20, pk: 20, pkl: 'pot', ct: 'aromate' },
    { id: 'menthe', n: "Menthe fraîche", r: 'legumes', u: 'g', kcal: 44, p: 3.3, c: 5, l: 0.7, f: 2.4, px: 16, pk: 20, pkl: 'botte', ct: 'aromate' },
    { id: 'ciboulette', n: 'Ciboulette', r: 'legumes', u: 'g', kcal: 30, p: 3.3, c: 1.8, l: 0.7, f: 2.5, px: 20, pk: 20, pkl: 'botte', ct: 'aromate' },
    { id: 'aneth', n: "Aneth frais", r: 'legumes', u: 'g', kcal: 43, p: 3.5, c: 3, l: 1.1, f: 2.1, px: 20, pk: 20, pkl: 'botte', ct: 'aromate' },

    /* ------------------------------- BOUCHERIE -------------------------- */
    { id: 'poulet_filet', n: 'Filet de poulet', r: 'boucherie', u: 'g', kcal: 165, p: 31, c: 0, l: 3.6, f: 0, px: 12.5, ct: 'viande_blanche' },
    { id: 'poulet_cuisse', n: 'Cuisses de poulet', r: 'boucherie', u: 'g', kcal: 209, p: 26, c: 0, l: 11, f: 0, px: 7.5, ct: 'viande_blanche' },
    { id: 'poulet_emince', n: "Émincé de poulet", r: 'boucherie', u: 'g', kcal: 165, p: 31, c: 0, l: 3.6, f: 0, px: 13, ct: 'viande_blanche' },
    { id: 'dinde_escalope', n: "Escalope de dinde", r: 'boucherie', u: 'g', kcal: 135, p: 29, c: 0, l: 1.7, f: 0, px: 12, ct: 'viande_blanche' },
    { id: 'dinde_hache', n: "Viande hachée de dinde", r: 'boucherie', u: 'g', kcal: 150, p: 25, c: 0, l: 5, f: 0, px: 11.5, ct: 'viande_blanche' },
    { id: 'canard_magret', n: "Magret de canard", r: 'boucherie', u: 'g', kcal: 201, p: 19, c: 0, l: 13, f: 0, px: 22, ct: 'viande_blanche' },
    { id: 'boeuf_steak', n: "Steak de bœuf", r: 'boucherie', u: 'g', kcal: 175, p: 26, c: 0, l: 7.5, f: 0, px: 22, ct: 'viande_rouge' },
    { id: 'boeuf_hache', n: "Bœuf haché 5%", r: 'boucherie', u: 'g', kcal: 137, p: 20, c: 0, l: 5, f: 0, px: 14.5, ct: 'viande_rouge' },
    { id: 'boeuf_mijot', n: "Bœuf à mijoter (paleron)", r: 'boucherie', u: 'g', kcal: 180, p: 20, c: 0, l: 11, f: 0, px: 14, ct: 'viande_rouge' },
    { id: 'veau_escalope', n: "Escalope de veau", r: 'boucherie', u: 'g', kcal: 120, p: 24, c: 0, l: 2.5, f: 0, px: 24, ct: 'viande_rouge' },
    { id: 'agneau_epaule', n: "Épaule d'agneau", r: 'boucherie', u: 'g', kcal: 234, p: 20, c: 0, l: 17, f: 0, px: 16, ct: 'viande_rouge' },
    { id: 'porc_filet', n: "Filet mignon de porc", r: 'boucherie', u: 'g', kcal: 143, p: 22, c: 0, l: 6, f: 0, px: 12, ct: 'viande_blanche' },
    { id: 'porc_cote', n: "Côte de porc", r: 'boucherie', u: 'g', kcal: 200, p: 25, c: 0, l: 11, f: 0, px: 9.5, ct: 'viande_blanche' },
    { id: 'lardons', n: "Lardons fumés", r: 'boucherie', u: 'g', kcal: 250, p: 15, c: 1, l: 21, f: 0, px: 11, pk: 150, pkl: 'barquette', ct: 'charcuterie' },
    { id: 'jambon_blanc', n: 'Jambon blanc', r: 'boucherie', u: 'pc', pc: 45, up: 'tranche', kcal: 110, p: 20, c: 1, l: 3, f: 0, px: 0.9, ct: 'charcuterie' },
    { id: 'jambon_cru', n: 'Jambon cru', r: 'boucherie', u: 'pc', pc: 25, up: 'tranche', kcal: 240, p: 27, c: 0.5, l: 14, f: 0, px: 1.2, ct: 'charcuterie' },
    { id: 'chorizo', n: 'Chorizo', r: 'boucherie', u: 'g', kcal: 380, p: 24, c: 2, l: 30, f: 0, px: 17, ct: 'charcuterie' },
    { id: 'saucisse_toulouse', n: 'Saucisse de Toulouse', r: 'boucherie', u: 'g', kcal: 300, p: 17, c: 1, l: 25, f: 0, px: 11, ct: 'charcuterie' },
    { id: 'merguez', n: 'Merguez', r: 'boucherie', u: 'pc', pc: 70, up: 'merguez', kcal: 320, p: 15, c: 1, l: 28, f: 0, px: 1.1, ct: 'charcuterie' },

    /* ------------------------------ POISSONNERIE ------------------------ */
    { id: 'saumon_filet', n: "Pavé de saumon", r: 'poissonnerie', u: 'g', kcal: 208, p: 20, c: 0, l: 13, f: 0, px: 24, ct: 'poisson_gras', al: ['poisson'] },
    { id: 'saumon_fume', n: "Saumon fumé", r: 'poissonnerie', u: 'g', kcal: 180, p: 22, c: 0, l: 10, f: 0, px: 34, pk: 120, pkl: 'paquet', ct: 'poisson_gras', al: ['poisson'] },
    { id: 'truite_filet', n: "Filet de truite", r: 'poissonnerie', u: 'g', kcal: 148, p: 20, c: 0, l: 7, f: 0, px: 19, ct: 'poisson_gras', al: ['poisson'] },
    { id: 'maquereau', n: 'Filet de maquereau', r: 'poissonnerie', u: 'g', kcal: 205, p: 19, c: 0, l: 14, f: 0, px: 13, ct: 'poisson_gras', al: ['poisson'] },
    { id: 'sardine_fraiche', n: "Sardines fraîches", r: 'poissonnerie', u: 'g', kcal: 165, p: 21, c: 0, l: 9, f: 0, px: 9, ct: 'poisson_gras', al: ['poisson'] },
    { id: 'cabillaud', n: "Dos de cabillaud", r: 'poissonnerie', u: 'g', kcal: 82, p: 18, c: 0, l: 0.7, f: 0, px: 22, ct: 'poisson_blanc', al: ['poisson'] },
    { id: 'colin', n: "Filet de colin", r: 'poissonnerie', u: 'g', kcal: 80, p: 18, c: 0, l: 0.6, f: 0, px: 14, ct: 'poisson_blanc', al: ['poisson'] },
    { id: 'dorade', n: "Dorade", r: 'poissonnerie', u: 'g', kcal: 96, p: 20, c: 0, l: 1.8, f: 0, px: 17, ct: 'poisson_blanc', al: ['poisson'] },
    { id: 'lotte', n: 'Lotte', r: 'poissonnerie', u: 'g', kcal: 76, p: 16, c: 0, l: 0.9, f: 0, px: 28, ct: 'poisson_blanc', al: ['poisson'] },
    { id: 'crevette', n: "Crevettes décortiquées", r: 'poissonnerie', u: 'g', kcal: 99, p: 24, c: 0, l: 0.3, f: 0, px: 22, ct: 'fruits_mer', al: ['crustaces'] },
    { id: 'moule', n: 'Moules', r: 'poissonnerie', u: 'g', kcal: 86, p: 12, c: 3.7, l: 2.2, f: 0, px: 4.5, ct: 'fruits_mer', al: ['mollusques'] },
    { id: 'st_jacques', n: "Noix de Saint-Jacques", r: 'poissonnerie', u: 'g', kcal: 88, p: 17, c: 2, l: 0.8, f: 0, px: 35, ct: 'fruits_mer', al: ['mollusques'] },
    { id: 'calamar', n: 'Calamars', r: 'poissonnerie', u: 'g', kcal: 92, p: 15.6, c: 3, l: 1.4, f: 0, px: 14, ct: 'fruits_mer', al: ['mollusques'] },

    /* -------------------------------- CREMERIE -------------------------- */
    { id: 'oeuf', n: "Œufs", r: 'cremerie', u: 'pc', pc: 55, up: 'œuf', kcal: 143, p: 13, c: 0.7, l: 9.5, f: 0, px: 0.4, pk: 6, pkl: "boîte de 6", ct: 'oeuf', al: ['oeuf'] },
    { id: 'lait', n: "Lait demi-écrémé", r: 'cremerie', u: 'ml', kcal: 47, p: 3.3, c: 4.8, l: 1.6, f: 0, px: 1.2, pk: 1000, pkl: "brique de 1 L", ct: 'laitage', al: ['lactose'], pl: 1 },
    { id: 'creme_fraiche', n: "Crème fraîche épaisse", r: 'cremerie', u: 'g', kcal: 292, p: 2.4, c: 3, l: 30, f: 0, px: 6, pk: 200, pkl: "pot de 20 cl", ct: 'laitage', al: ['lactose'] },
    { id: 'creme_liquide', n: "Crème liquide légère", r: 'cremerie', u: 'ml', kcal: 160, p: 2.7, c: 4, l: 15, f: 0, px: 4.5, pk: 200, pkl: "brique de 20 cl", ct: 'laitage', al: ['lactose'] },
    { id: 'beurre', n: 'Beurre', r: 'cremerie', u: 'g', kcal: 750, p: 0.7, c: 0.6, l: 82, f: 0, px: 12, pk: 250, pkl: 'plaquette', ct: 'matiere_grasse', al: ['lactose'], pl: 1 },
    { id: 'yaourt_nature', n: "Yaourt nature", r: 'cremerie', u: 'pc', pc: 125, up: 'pot', kcal: 60, p: 4, c: 5, l: 1.5, f: 0, px: 0.35, ct: 'laitage', al: ['lactose'] },
    { id: 'yaourt_grec', n: "Yaourt grec", r: 'cremerie', u: 'g', kcal: 115, p: 6, c: 4, l: 8, f: 0, px: 5, pk: 400, pkl: 'pot', ct: 'laitage', al: ['lactose'] },
    { id: 'fromage_blanc', n: 'Fromage blanc', r: 'cremerie', u: 'g', kcal: 75, p: 8, c: 4, l: 3, f: 0, px: 3.2, pk: 500, pkl: 'pot', ct: 'laitage', al: ['lactose'] },
    { id: 'gruyere_rape', n: "Gruyère râpé", r: 'cremerie', u: 'g', kcal: 380, p: 27, c: 1, l: 30, f: 0, px: 12, pk: 200, pkl: 'sachet', ct: 'fromage', al: ['lactose'] },
    { id: 'parmesan', n: 'Parmesan', r: 'cremerie', u: 'g', kcal: 402, p: 36, c: 0, l: 27, f: 0, px: 22, pk: 100, pkl: 'morceau', ct: 'fromage', al: ['lactose'] },
    { id: 'mozzarella', n: 'Mozzarella', r: 'cremerie', u: 'g', kcal: 280, p: 18, c: 1, l: 22, f: 0, px: 9, pk: 125, pkl: 'boule', ct: 'fromage', al: ['lactose'] },
    { id: 'feta', n: 'Feta', r: 'cremerie', u: 'g', kcal: 264, p: 14, c: 4, l: 21, f: 0, px: 12, pk: 200, pkl: 'paquet', ct: 'fromage', al: ['lactose'] },
    { id: 'chevre', n: "Bûche de chèvre", r: 'cremerie', u: 'g', kcal: 290, p: 18, c: 2, l: 23, f: 0, px: 14, pk: 180, pkl: 'buche', ct: 'fromage', al: ['lactose'] },
    { id: 'comte', n: "Comté", r: 'cremerie', u: 'g', kcal: 410, p: 27, c: 0, l: 33, f: 0, px: 19, ct: 'fromage', al: ['lactose'] },
    { id: 'ricotta', n: 'Ricotta', r: 'cremerie', u: 'g', kcal: 174, p: 11, c: 3, l: 13, f: 0, px: 8, pk: 250, pkl: 'pot', ct: 'fromage', al: ['lactose'] },
    { id: 'roquefort', n: 'Roquefort', r: 'cremerie', u: 'g', kcal: 350, p: 21, c: 2, l: 29, f: 0, px: 22, ct: 'fromage', al: ['lactose'] },
    { id: 'tofu_ferme', n: "Tofu ferme", r: 'cremerie', u: 'g', kcal: 145, p: 15, c: 3, l: 9, f: 1, px: 12, pk: 250, pkl: 'bloc', ct: 'soja', al: ['soja'] },
    { id: 'tofu_fume', n: "Tofu fumé", r: 'cremerie', u: 'g', kcal: 160, p: 17, c: 2, l: 10, f: 1, px: 14, pk: 200, pkl: 'bloc', ct: 'soja', al: ['soja'] },
    { id: 'tempeh', n: 'Tempeh', r: 'cremerie', u: 'g', kcal: 190, p: 19, c: 9, l: 11, f: 5, px: 18, pk: 200, pkl: 'bloc', ct: 'soja', al: ['soja'] },
    { id: 'pate_feuilletee', n: "Pâte feuilletée", r: 'cremerie', u: 'g', kcal: 370, p: 5, c: 36, l: 23, f: 1.5, px: 5, pk: 230, pkl: 'rouleau', ct: 'feculent', al: ['gluten'] },
    { id: 'pate_brisee', n: "Pâte brisée", r: 'cremerie', u: 'g', kcal: 350, p: 6, c: 42, l: 17, f: 2, px: 4.5, pk: 230, pkl: 'rouleau', ct: 'feculent', al: ['gluten'] },

    /* ------------------------------ EPICERIE SALEE ---------------------- */
    { id: 'pates', n: "Pâtes (penne, fusilli)", r: 'epicerie', u: 'g', kcal: 360, p: 12, c: 71, l: 1.5, f: 3, px: 2.2, pk: 500, pkl: 'paquet', ct: 'feculent', al: ['gluten'], pl: 1 },
    { id: 'spaghetti', n: 'Spaghetti', r: 'epicerie', u: 'g', kcal: 360, p: 12, c: 71, l: 1.5, f: 3, px: 2.2, pk: 500, pkl: 'paquet', ct: 'feculent', al: ['gluten'], pl: 1 },
    { id: 'tagliatelle', n: "Tagliatelles", r: 'epicerie', u: 'g', kcal: 362, p: 12, c: 70, l: 2, f: 3, px: 2.8, pk: 500, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'lasagne', n: "Plaques à lasagnes", r: 'epicerie', u: 'g', kcal: 360, p: 12, c: 71, l: 1.5, f: 3, px: 3.4, pk: 250, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'pates_completes', n: "Pâtes complètes", r: 'epicerie', u: 'g', kcal: 348, p: 13, c: 64, l: 2.5, f: 8, px: 3.2, pk: 500, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'nouilles_chinoises', n: 'Nouilles chinoises', r: 'epicerie', u: 'g', kcal: 350, p: 11, c: 71, l: 1.5, f: 2.5, px: 4.5, pk: 250, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'nouilles_riz', n: "Nouilles de riz", r: 'epicerie', u: 'g', kcal: 364, p: 6, c: 82, l: 0.6, f: 1.6, px: 5, pk: 250, pkl: 'paquet', ct: 'feculent' },
    { id: 'riz_basmati', n: 'Riz basmati', r: 'epicerie', u: 'g', kcal: 350, p: 7.5, c: 78, l: 0.9, f: 1.4, px: 3, pk: 1000, pkl: 'paquet', ct: 'feculent', pl: 1 },
    { id: 'riz_complet', n: 'Riz complet', r: 'epicerie', u: 'g', kcal: 350, p: 7.9, c: 72, l: 2.8, f: 3.5, px: 3.5, pk: 1000, pkl: 'paquet', ct: 'feculent' },
    { id: 'riz_rond', n: "Riz rond (risotto)", r: 'epicerie', u: 'g', kcal: 350, p: 7, c: 78, l: 0.6, f: 1, px: 4, pk: 500, pkl: 'paquet', ct: 'feculent' },
    { id: 'semoule', n: "Semoule de couscous", r: 'epicerie', u: 'g', kcal: 355, p: 12, c: 72, l: 1.5, f: 4, px: 2.4, pk: 500, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'boulgour', n: 'Boulgour', r: 'epicerie', u: 'g', kcal: 342, p: 12, c: 63, l: 1.3, f: 12, px: 3.6, pk: 500, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'quinoa', n: 'Quinoa', r: 'epicerie', u: 'g', kcal: 368, p: 14, c: 58, l: 6, f: 7, px: 7, pk: 500, pkl: 'paquet', ct: 'feculent' },
    { id: 'polenta', n: "Polenta", r: 'epicerie', u: 'g', kcal: 360, p: 8, c: 77, l: 1.5, f: 4, px: 3, pk: 500, pkl: 'paquet', ct: 'feculent' },
    { id: 'lentille_verte', n: "Lentilles vertes", r: 'epicerie', u: 'g', kcal: 353, p: 25, c: 49, l: 1.1, f: 11, px: 4, pk: 500, pkl: 'paquet', ct: 'legumineuse' },
    { id: 'lentille_corail', n: "Lentilles corail", r: 'epicerie', u: 'g', kcal: 358, p: 24, c: 53, l: 1.5, f: 11, px: 4.5, pk: 500, pkl: 'paquet', ct: 'legumineuse' },
    { id: 'pois_chiche', n: "Pois chiches cuits (conserve)", r: 'epicerie', u: 'g', kcal: 119, p: 7, c: 16, l: 2.6, f: 6, px: 3.2, pk: 250, pkl: "boîte de 400 g", ct: 'legumineuse' },
    { id: 'haricot_rouge', n: "Haricots rouges (conserve)", r: 'epicerie', u: 'g', kcal: 127, p: 8, c: 18, l: 0.5, f: 6, px: 3.2, pk: 250, pkl: "boîte de 400 g", ct: 'legumineuse' },
    { id: 'haricot_blanc', n: "Haricots blancs (conserve)", r: 'epicerie', u: 'g', kcal: 120, p: 7, c: 18, l: 0.5, f: 6, px: 3, pk: 250, pkl: "boîte de 400 g", ct: 'legumineuse' },
    { id: 'flageolet', n: "Flageolets (conserve)", r: 'epicerie', u: 'g', kcal: 112, p: 7, c: 16, l: 0.5, f: 6, px: 3, pk: 250, pkl: "boîte de 400 g", ct: 'legumineuse' },
    { id: 'pois_casse', n: "Pois cassés", r: 'epicerie', u: 'g', kcal: 341, p: 24, c: 51, l: 1.2, f: 11, px: 3.4, pk: 500, pkl: 'paquet', ct: 'legumineuse' },
    { id: 'tomate_pelee', n: "Tomates concassées (conserve)", r: 'epicerie', u: 'g', kcal: 32, p: 1.6, c: 5, l: 0.2, f: 1.5, px: 2.2, pk: 400, pkl: "boîte", ct: 'legume', veg: 1 },
    { id: 'coulis_tomate', n: "Coulis de tomates", r: 'epicerie', u: 'g', kcal: 35, p: 1.5, c: 6, l: 0.2, f: 1.5, px: 2.4, pk: 400, pkl: 'brique', ct: 'legume', veg: 1 },
    { id: 'concentre_tomate', n: "Concentré de tomates", r: 'epicerie', u: 'g', kcal: 82, p: 4.3, c: 15, l: 0.5, f: 3, px: 6, pk: 140, pkl: 'tube', ct: 'legume', pl: 1 },
    { id: 'thon_conserve', n: 'Thon au naturel', r: 'epicerie', u: 'g', kcal: 116, p: 26, c: 0, l: 1, f: 0, px: 14, pk: 112, pkl: "boîte", ct: 'poisson_blanc', al: ['poisson'] },
    { id: 'sardine_conserve', n: "Sardines à l'huile", r: 'epicerie', u: 'g', kcal: 208, p: 25, c: 0, l: 11, f: 0, px: 13, pk: 100, pkl: "boîte", ct: 'poisson_gras', al: ['poisson'] },
    { id: 'maquereau_conserve', n: "Maquereaux (conserve)", r: 'epicerie', u: 'g', kcal: 190, p: 21, c: 1, l: 11, f: 0, px: 12, pk: 120, pkl: "boîte", ct: 'poisson_gras', al: ['poisson'] },
    { id: 'anchois', n: 'Anchois', r: 'epicerie', u: 'g', kcal: 210, p: 26, c: 0, l: 12, f: 0, px: 25, pk: 50, pkl: "boîte", ct: 'poisson_gras', al: ['poisson'] },
    { id: 'lait_coco', n: 'Lait de coco', r: 'epicerie', u: 'ml', kcal: 197, p: 2, c: 3, l: 20, f: 0, px: 4.5, pk: 400, pkl: "boîte de 40 cl", ct: 'matiere_grasse' },
    { id: 'mais_conserve', n: "Maïs doux (conserve)", r: 'epicerie', u: 'g', kcal: 86, p: 3.2, c: 16, l: 1.2, f: 2.7, px: 3.5, pk: 140, pkl: "boîte", ct: 'feculent' },
    { id: 'coeur_artichaut', n: "Cœurs d'artichauts", r: 'epicerie', u: 'g', kcal: 47, p: 2.9, c: 5, l: 0.3, f: 5, px: 8, pk: 200, pkl: "bocal", ct: 'legume', veg: 1 },
    { id: 'farine', n: 'Farine', r: 'epicerie', u: 'g', kcal: 364, p: 10, c: 76, l: 1, f: 2.7, px: 1.2, pk: 1000, pkl: 'paquet', ct: 'feculent', al: ['gluten'], pl: 1 },
    { id: 'chapelure', n: 'Chapelure', r: 'epicerie', u: 'g', kcal: 380, p: 12, c: 72, l: 4, f: 4, px: 3, pk: 250, pkl: 'paquet', ct: 'feculent', al: ['gluten'], pl: 1 },
    { id: 'maizena', n: "Maïzena", r: 'epicerie', u: 'g', kcal: 350, p: 0.3, c: 86, l: 0.1, f: 0, px: 3, pk: 400, pkl: 'paquet', ct: 'feculent', pl: 1 },
    { id: 'bouillon_cube', n: 'Bouillon (cube)', r: 'epicerie', u: 'pc', pc: 10, up: 'cube', kcal: 200, p: 8, c: 20, l: 10, f: 0, px: 0.25, ct: 'condiment', pl: 1 },
    { id: 'noix', n: "Cerneaux de noix", r: 'epicerie', u: 'g', kcal: 654, p: 15, c: 7, l: 65, f: 6.7, px: 18, pk: 125, pkl: 'sachet', ct: 'oleagineux', al: ['fruits_a_coque'] },
    { id: 'amande', n: 'Amandes', r: 'epicerie', u: 'g', kcal: 634, p: 21, c: 7, l: 55, f: 12, px: 16, pk: 200, pkl: 'sachet', ct: 'oleagineux', al: ['fruits_a_coque'] },
    { id: 'noix_cajou', n: 'Noix de cajou', r: 'epicerie', u: 'g', kcal: 580, p: 18, c: 27, l: 44, f: 3, px: 17, pk: 200, pkl: 'sachet', ct: 'oleagineux', al: ['fruits_a_coque'] },
    { id: 'pignon', n: 'Pignons de pin', r: 'epicerie', u: 'g', kcal: 673, p: 14, c: 4, l: 68, f: 3.7, px: 60, pk: 50, pkl: 'sachet', ct: 'oleagineux', al: ['fruits_a_coque'] },
    { id: 'graine_sesame', n: "Graines de sésame", r: 'epicerie', u: 'g', kcal: 573, p: 18, c: 12, l: 50, f: 12, px: 12, pk: 100, pkl: 'sachet', ct: 'oleagineux', al: ['sesame'], pl: 1 },
    { id: 'graine_courge', n: 'Graines de courge', r: 'epicerie', u: 'g', kcal: 559, p: 30, c: 11, l: 49, f: 6, px: 14, pk: 150, pkl: 'sachet', ct: 'oleagineux' },
    { id: 'raisin_sec', n: "Raisins secs", r: 'epicerie', u: 'g', kcal: 299, p: 3, c: 71, l: 0.5, f: 3.7, px: 6, pk: 250, pkl: 'sachet', ct: 'fruit', pl: 1 },
    { id: 'abricot_sec', n: "Abricots secs", r: 'epicerie', u: 'g', kcal: 241, p: 3.4, c: 53, l: 0.5, f: 7, px: 9, pk: 250, pkl: 'sachet', ct: 'fruit' },
    { id: 'olive_noire', n: 'Olives noires', r: 'epicerie', u: 'g', kcal: 115, p: 0.8, c: 1, l: 11, f: 3.2, px: 9, pk: 150, pkl: "bocal", ct: 'matiere_grasse' },
    { id: 'olive_verte', n: 'Olives vertes', r: 'epicerie', u: 'g', kcal: 145, p: 1, c: 1, l: 15, f: 3.3, px: 9, pk: 150, pkl: "bocal", ct: 'matiere_grasse' },
    { id: 'cornichon', n: 'Cornichons', r: 'epicerie', u: 'g', kcal: 14, p: 0.7, c: 1.5, l: 0.2, f: 1.2, px: 8, pk: 200, pkl: "bocal", ct: 'condiment', pl: 1 },
    { id: 'capre', n: "Câpres", r: 'epicerie', u: 'g', kcal: 23, p: 2.4, c: 1.7, l: 0.9, f: 3.2, px: 20, pk: 100, pkl: "bocal", ct: 'condiment', pl: 1 },

    /* --------------------- HUILES, EPICES & CONDIMENTS ------------------ */
    { id: 'huile_olive', n: "Huile d'olive", r: 'condiments', u: 'ml', kcal: 900, p: 0, c: 0, l: 100, f: 0, px: 9, pk: 750, pkl: 'bouteille', ct: 'matiere_grasse', pl: 1 },
    { id: 'huile_tournesol', n: 'Huile de tournesol', r: 'condiments', u: 'ml', kcal: 900, p: 0, c: 0, l: 100, f: 0, px: 3, pk: 1000, pkl: 'bouteille', ct: 'matiere_grasse', pl: 1 },
    { id: 'huile_sesame', n: "Huile de sésame", r: 'condiments', u: 'ml', kcal: 900, p: 0, c: 0, l: 100, f: 0, px: 14, pk: 250, pkl: 'bouteille', ct: 'matiere_grasse', al: ['sesame'], pl: 1 },
    { id: 'huile_colza', n: 'Huile de colza', r: 'condiments', u: 'ml', kcal: 900, p: 0, c: 0, l: 100, f: 0, px: 4, pk: 1000, pkl: 'bouteille', ct: 'matiere_grasse', pl: 1 },
    { id: 'vinaigre', n: 'Vinaigre de vin', r: 'condiments', u: 'ml', kcal: 20, p: 0, c: 0.5, l: 0, f: 0, px: 2, pk: 750, pkl: 'bouteille', ct: 'condiment', pl: 1 },
    { id: 'vinaigre_balsamique', n: "Vinaigre balsamique", r: 'condiments', u: 'ml', kcal: 88, p: 0.5, c: 17, l: 0, f: 0, px: 6, pk: 500, pkl: 'bouteille', ct: 'condiment', pl: 1 },
    { id: 'sauce_soja', n: "Sauce soja", r: 'condiments', u: 'ml', kcal: 53, p: 8, c: 5, l: 0, f: 0, px: 6, pk: 250, pkl: 'bouteille', ct: 'condiment', al: ['soja', 'gluten'], pl: 1 },
    { id: 'moutarde', n: 'Moutarde', r: 'condiments', u: 'g', kcal: 150, p: 7, c: 6, l: 10, f: 3, px: 5, pk: 200, pkl: 'pot', ct: 'condiment', al: ['moutarde'], pl: 1 },
    { id: 'miel', n: 'Miel', r: 'condiments', u: 'g', kcal: 304, p: 0.3, c: 82, l: 0, f: 0, px: 12, pk: 250, pkl: 'pot', ct: 'sucre', pl: 1 },
    { id: 'sucre', n: 'Sucre', r: 'condiments', u: 'g', kcal: 400, p: 0, c: 100, l: 0, f: 0, px: 1.1, pk: 1000, pkl: 'paquet', ct: 'sucre', pl: 1 },
    { id: 'sel', n: 'Sel', r: 'condiments', u: 'g', kcal: 0, p: 0, c: 0, l: 0, f: 0, px: 0.6, pk: 500, pkl: 'paquet', ct: 'condiment', pl: 1 },
    { id: 'poivre', n: 'Poivre', r: 'condiments', u: 'g', kcal: 250, p: 10, c: 40, l: 3, f: 25, px: 30, pk: 50, pkl: 'moulin', ct: 'epice', pl: 1 },
    { id: 'curry', n: 'Curry en poudre', r: 'condiments', u: 'g', kcal: 325, p: 13, c: 40, l: 14, f: 33, px: 30, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'paprika', n: 'Paprika', r: 'condiments', u: 'g', kcal: 282, p: 14, c: 34, l: 13, f: 35, px: 30, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'cumin', n: 'Cumin', r: 'condiments', u: 'g', kcal: 375, p: 18, c: 33, l: 22, f: 11, px: 32, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'curcuma', n: 'Curcuma', r: 'condiments', u: 'g', kcal: 312, p: 9, c: 44, l: 3, f: 22, px: 30, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'coriandre_moulue', n: "Coriandre moulue", r: 'condiments', u: 'g', kcal: 298, p: 12, c: 25, l: 17, f: 41, px: 30, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'cannelle', n: "Cannelle", r: 'condiments', u: 'g', kcal: 247, p: 4, c: 27, l: 1.2, f: 53, px: 32, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'muscade', n: "Noix de muscade", r: 'condiments', u: 'g', kcal: 525, p: 6, c: 28, l: 36, f: 21, px: 40, pk: 30, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'herbes_provence', n: "Herbes de Provence", r: 'condiments', u: 'g', kcal: 280, p: 9, c: 25, l: 7, f: 37, px: 20, pk: 50, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'origan', n: "Origan séché", r: 'condiments', u: 'g', kcal: 265, p: 9, c: 22, l: 4.3, f: 42, px: 26, pk: 30, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'thym', n: 'Thym', r: 'condiments', u: 'g', kcal: 276, p: 9, c: 27, l: 7, f: 37, px: 26, pk: 30, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'laurier', n: 'Laurier', r: 'condiments', u: 'pc', pc: 0.2, up: 'feuille', kcal: 313, p: 8, c: 30, l: 8, f: 26, px: 0.05, ct: 'epice', pl: 1 },
    { id: 'ras_el_hanout', n: 'Ras el hanout', r: 'condiments', u: 'g', kcal: 330, p: 12, c: 35, l: 13, f: 30, px: 32, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'garam_masala', n: 'Garam masala', r: 'condiments', u: 'g', kcal: 330, p: 12, c: 35, l: 14, f: 30, px: 34, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'cinq_epices', n: "Cinq-épices", r: 'condiments', u: 'g', kcal: 330, p: 10, c: 40, l: 12, f: 28, px: 34, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'piment_espelette', n: "Piment d'Espelette", r: 'condiments', u: 'g', kcal: 300, p: 12, c: 35, l: 12, f: 28, px: 90, pk: 40, pkl: 'pot', ct: 'epice', pl: 1 },
    { id: 'pate_curry', n: "Pâte de curry", r: 'condiments', u: 'g', kcal: 180, p: 3, c: 15, l: 12, f: 4, px: 20, pk: 110, pkl: 'pot', ct: 'condiment', pl: 1 },
    { id: 'harissa', n: 'Harissa', r: 'condiments', u: 'g', kcal: 130, p: 4, c: 12, l: 7, f: 6, px: 16, pk: 70, pkl: 'tube', ct: 'condiment', pl: 1 },
    { id: 'tahini', n: "Purée de sésame (tahini)", r: 'condiments', u: 'g', kcal: 595, p: 17, c: 10, l: 54, f: 9, px: 14, pk: 300, pkl: 'pot', ct: 'oleagineux', al: ['sesame'] },
    { id: 'pesto', n: 'Pesto', r: 'condiments', u: 'g', kcal: 450, p: 6, c: 6, l: 45, f: 2, px: 14, pk: 190, pkl: 'pot', ct: 'condiment', al: ['lactose', 'fruits_a_coque'] },
    { id: 'levure_maltee', n: "Levure maltée", r: 'condiments', u: 'g', kcal: 350, p: 45, c: 20, l: 5, f: 20, px: 30, pk: 125, pkl: 'pot', ct: 'condiment' },

    /* --------------------------- PAIN & PATES FRAICHES ------------------ */
    { id: 'pain', n: 'Pain (baguette/campagne)', r: 'boulangerie', u: 'g', kcal: 270, p: 9, c: 55, l: 1, f: 3, px: 4, pk: 250, pkl: 'baguette', ct: 'feculent', al: ['gluten'] },
    { id: 'pain_complet', n: 'Pain complet', r: 'boulangerie', u: 'g', kcal: 250, p: 10, c: 45, l: 2, f: 7, px: 5, pk: 400, pkl: 'pain', ct: 'feculent', al: ['gluten'] },
    { id: 'pain_burger', n: "Pains à burger", r: 'boulangerie', u: 'pc', pc: 70, up: 'pain', kcal: 280, p: 9, c: 50, l: 5, f: 2.5, px: 0.6, ct: 'feculent', al: ['gluten'] },
    { id: 'pain_pita', n: 'Pains pita', r: 'boulangerie', u: 'pc', pc: 60, up: "pita", kcal: 275, p: 9, c: 55, l: 1.2, f: 2.5, px: 0.5, ct: 'feculent', al: ['gluten'] },
    { id: 'tortilla', n: "Tortillas de blé", r: 'boulangerie', u: 'pc', pc: 45, up: 'tortilla', kcal: 300, p: 8, c: 50, l: 7, f: 3, px: 0.45, ct: 'feculent', al: ['gluten'] },
    { id: 'gnocchi', n: 'Gnocchi frais', r: 'boulangerie', u: 'g', kcal: 165, p: 4, c: 34, l: 1, f: 2, px: 4.5, pk: 400, pkl: 'paquet', ct: 'feculent', al: ['gluten'] },
    { id: 'raviolis_frais', n: "Raviolis frais", r: 'boulangerie', u: 'g', kcal: 260, p: 11, c: 38, l: 7, f: 2, px: 12, pk: 250, pkl: 'paquet', ct: 'feculent', al: ['gluten', 'oeuf'] },
    { id: 'pate_pizza', n: "Pâte à pizza", r: 'boulangerie', u: 'g', kcal: 270, p: 8, c: 50, l: 4, f: 2, px: 4, pk: 260, pkl: 'rouleau', ct: 'feculent', al: ['gluten'] },

    /* --------------------------------- SURGELES ------------------------- */
    { id: 'petit_pois', n: "Petits pois surgelés", r: 'surgeles', u: 'g', kcal: 81, p: 5.4, c: 11, l: 0.4, f: 5, px: 2.6, pk: 450, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'epinard_surgele', n: "Épinards surgelés", r: 'surgeles', u: 'g', kcal: 23, p: 2.9, c: 1.5, l: 0.4, f: 2.2, px: 2.4, pk: 450, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'poelee_legumes', n: "Poêlée de légumes surgelée", r: 'surgeles', u: 'g', kcal: 45, p: 2, c: 7, l: 0.6, f: 2.5, px: 3, pk: 600, pkl: 'sachet', ct: 'legume', veg: 1 },
    { id: 'haricot_vert_surgele', n: "Haricots verts surgelés", r: 'surgeles', u: 'g', kcal: 31, p: 1.8, c: 4, l: 0.1, f: 3.4, px: 2.6, pk: 600, pkl: 'sachet', ct: 'legume', veg: 1 },

    /* -------------------------------- BOISSONS -------------------------- */
    { id: 'vin_blanc', n: 'Vin blanc sec', r: 'boissons', u: 'ml', kcal: 82, p: 0.1, c: 2.6, l: 0, f: 0, px: 5, pk: 750, pkl: 'bouteille', ct: 'condiment' },
    { id: 'vin_rouge', n: 'Vin rouge', r: 'boissons', u: 'ml', kcal: 85, p: 0.1, c: 2.6, l: 0, f: 0, px: 6, pk: 750, pkl: 'bouteille', ct: 'condiment' },
    { id: 'biere', n: "Bière blonde", r: 'boissons', u: 'ml', kcal: 43, p: 0.5, c: 3.6, l: 0, f: 0, px: 3, pk: 330, pkl: 'bouteille', ct: 'condiment', al: ['gluten'] },
    { id: 'jus_orange', n: "Jus d'orange", r: 'boissons', u: 'ml', kcal: 45, p: 0.7, c: 10, l: 0.1, f: 0.2, px: 2, pk: 1000, pkl: 'brique', ct: 'fruit' },
    { id: 'lait_amande', n: "Boisson végétale amande", r: 'boissons', u: 'ml', kcal: 24, p: 0.5, c: 2.4, l: 1.2, f: 0.3, px: 2.2, pk: 1000, pkl: 'brique', ct: 'vegetal', al: ['fruits_a_coque'] }
  ];

  var BY_ID = {};
  ING.forEach(function (i) {
    i.al = i.al || [];
    i.f = i.f || 0;
    BY_ID[i.id] = i;
  });

  global.MP_INGREDIENTS = { list: ING, byId: BY_ID, rayons: RAYONS };
})(typeof window !== 'undefined' ? window : globalThis);
