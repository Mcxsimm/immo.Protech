/* ==========================================================================
   Moteur nutritionnel
   --------------------------------------------------------------------------
   Tout est DEDUIT des ingredients : valeurs nutritionnelles, type de
   proteine, base feculente, quantite de legumes, allergenes, compatibilite
   avec les regimes et cout estime. Aucune de ces donnees n'est saisie a la
   main dans les recettes, ce qui garantit leur coherence.
   ========================================================================== */
(function (global) {
  'use strict';

  var ING = global.MP_INGREDIENTS;
  var byId = ING.byId;

  /* Ingredients contenant du porc (filtre "sans porc"). */
  var PORC = ['porc_filet', 'porc_cote', 'lardons', 'jambon_blanc', 'jambon_cru', 'chorizo', 'saucisse_toulouse'];
  /* Ingredients alcoolises : s'evaporent a la cuisson mais restent filtrables. */
  var ALCOOL = ['vin_blanc', 'vin_rouge', 'biere'];

  var ANIMAL_PROT = ['viande_rouge', 'viande_blanche', 'charcuterie', 'poisson_gras', 'poisson_blanc', 'fruits_mer'];
  var NON_VEGE = ANIMAL_PROT;
  var NON_VEGAN = ['oeuf', 'laitage', 'fromage'];

  /* Poids d'une portion d'ingredient, en grammes. */
  function grams(ing, qty) {
    if (!ing) return 0;
    if (ing.u === 'pc') return qty * (ing.pc || 0);
    return qty; /* 1 ml ~ 1 g pour nos usages */
  }

  /* Valeurs nutritionnelles d'une recette, pour UNE personne. */
  function nutrition(recipe) {
    var n = { kcal: 0, p: 0, c: 0, l: 0, f: 0 };
    recipe.i.forEach(function (line) {
      var ing = byId[line[0]];
      if (!ing) return;
      var g = grams(ing, line[1]) / 100;
      n.kcal += ing.kcal * g;
      n.p += ing.p * g;
      n.c += ing.c * g;
      n.l += ing.l * g;
      n.f += (ing.f || 0) * g;
    });
    Object.keys(n).forEach(function (k) { n[k] = Math.round(n[k] * 10) / 10; });
    n.kcal = Math.round(n.kcal);
    return n;
  }

  /* Cout indicatif d'une portion, en euros (prix au prorata des quantites). */
  function cost(recipe) {
    var total = 0;
    recipe.i.forEach(function (line) {
      var ing = byId[line[0]];
      if (!ing || !ing.px) return;
      if (ing.u === 'pc') total += line[1] * ing.px;
      else total += (line[1] / 1000) * ing.px;
    });
    return Math.round(total * 100) / 100;
  }

  /* Profil complet d'une recette (calcule une fois, puis mis en cache). */
  function profile(recipe) {
    if (recipe._profile) return recipe._profile;

    var poids = {};      /* grammes par categorie alimentaire */
    var legumesG = 0;    /* legumes comptant pour les "5 par jour" */
    var fruitsG = 0;
    var allerg = {};
    var ids = {};
    var feculents = [];

    recipe.i.forEach(function (line) {
      var ing = byId[line[0]];
      if (!ing) return;
      var g = grams(ing, line[1]);
      ids[ing.id] = g;
      poids[ing.ct] = (poids[ing.ct] || 0) + g;
      if (ing.veg) legumesG += g;
      if (ing.fr) fruitsG += g;
      (ing.al || []).forEach(function (a) { allerg[a] = true; });
      if (ing.ct === 'feculent' && g >= 40) feculents.push({ id: ing.id, n: ing.n, g: g });
    });

    /* Type de proteine dominant : on prend la categorie animale la plus
       presente, sinon legumineuse / soja, sinon oeuf, sinon fromage. */
    var prot = null, max = 0;
    ANIMAL_PROT.forEach(function (c) {
      /* la charcuterie ne "compte" comme plat de viande que si elle est
         presente en quantite significative (>= 40 g) */
      var seuil = c === 'charcuterie' ? 40 : 1;
      if ((poids[c] || 0) >= seuil && poids[c] > max) { max = poids[c]; prot = c; }
    });
    if (!prot) {
      if ((poids.legumineuse || 0) >= 60) prot = 'legumineuse';
      else if ((poids.soja || 0) >= 60) prot = 'soja';
      else if ((poids.oeuf || 0) >= 80) prot = 'oeuf';
      else if ((poids.fromage || 0) >= 35) prot = 'fromage';
      else if ((poids.legumineuse || 0) > 0) prot = 'legumineuse';
      else prot = 'legume';
    }

    feculents.sort(function (a, b) { return b.g - a.g; });

    var estVege = !ANIMAL_PROT.some(function (c) { return (poids[c] || 0) > 0; }) && !ids.anchois;
    var estVegan = estVege && !NON_VEGAN.some(function (c) { return (poids[c] || 0) > 0; }) &&
      !ids.beurre && !ids.miel && !ids.pesto && !ids.pate_feuilletee && !ids.pate_brisee;

    var p = {
      nutrition: nutrition(recipe),
      cost: cost(recipe),
      proteine: prot,
      feculent: feculents.length ? feculents[0] : null,
      feculentBase: feculents.length ? baseFeculent(feculents[0].id) : 'aucun',
      legumesG: Math.round(legumesG),
      fruitsG: Math.round(fruitsG),
      allergenes: Object.keys(allerg),
      ids: ids,
      regimes: {
        vegetarien: estVege,
        vegetalien: estVegan,
        sansGluten: !allerg.gluten,
        sansLactose: !allerg.lactose,
        sansPorc: !PORC.some(function (x) { return ids[x]; }),
        sansAlcool: !ALCOOL.some(function (x) { return ids[x]; }),
        sansFruitsCoque: !allerg.fruits_a_coque,
        sansOeuf: !allerg.oeuf,
        sansPoisson: !allerg.poisson && !allerg.crustaces && !allerg.mollusques
      }
    };
    p.equilibre = equilibre(p);
    recipe._profile = p;
    return p;
  }

  /* Regroupe les feculents par famille, pour eviter trois fois des pates. */
  function baseFeculent(id) {
    if (/pates|spaghetti|tagliatelle|lasagne|gnocchi|raviolis|nouilles/.test(id)) return 'pates';
    if (/riz|risotto/.test(id)) return 'riz';
    if (/pomme_de_terre|patate_douce/.test(id)) return 'pommes de terre';
    if (/semoule|boulgour|quinoa|polenta/.test(id)) return 'céréales';
    if (/pain|pita|tortilla|burger|pizza|pate_/.test(id)) return 'pain & pâtes à tarte';
    if (/lentille|pois|haricot/.test(id)) return 'légumineuses';
    return 'autre';
  }

  /* Note d'equilibre d'une assiette : legumes, proteines, fibres, densite
     energetique et lipides. Reperes PNNS simplifies. */
  function equilibre(p) {
    var n = p.nutrition;
    var pts = [];
    pts.push({ k: 'Légumes', ok: p.legumesG >= 150, v: p.legumesG + ' g', cible: '≥ 150 g' });
    pts.push({ k: 'Protéines', ok: n.p >= 20, v: Math.round(n.p) + ' g', cible: '≥ 20 g' });
    pts.push({ k: 'Fibres', ok: n.f >= 6, v: Math.round(n.f) + ' g', cible: '≥ 6 g' });
    pts.push({ k: 'Énergie', ok: n.kcal >= 450 && n.kcal <= 950, v: n.kcal + ' kcal', cible: '450–950 kcal' });
    pts.push({ k: 'Lipides', ok: n.kcal > 0 && (n.l * 9) / n.kcal <= 0.42, v: Math.round((n.l * 9 * 100) / (n.kcal || 1)) + ' %', cible: '≤ 42 % des kcal' });
    var score = pts.filter(function (x) { return x.ok; }).length;
    return { score: score, sur: pts.length, points: pts };
  }

  /* Libelles lisibles des types de proteines. */
  var LABEL_PROT = {
    viande_rouge: 'Viande rouge', viande_blanche: 'Viande blanche', charcuterie: 'Charcuterie',
    poisson_gras: 'Poisson gras', poisson_blanc: 'Poisson blanc', fruits_mer: 'Fruits de mer',
    legumineuse: 'Légumineuses', soja: 'Soja / tofu', oeuf: 'Œufs', fromage: 'Fromage', legume: 'Légumes'
  };

  /* Familles utilisees par les regles d'equilibre hebdomadaire. */
  function familleProt(prot) {
    if (prot === 'poisson_gras' || prot === 'poisson_blanc' || prot === 'fruits_mer') return 'poisson';
    if (prot === 'viande_rouge') return 'viande_rouge';
    if (prot === 'viande_blanche' || prot === 'charcuterie') return 'viande_blanche';
    return 'vegetarien';
  }

  global.MP_NUTRITION = {
    grams: grams, nutrition: nutrition, cost: cost, profile: profile,
    equilibre: equilibre, baseFeculent: baseFeculent,
    LABEL_PROT: LABEL_PROT, familleProt: familleProt, PORC: PORC, ALCOOL: ALCOOL
  };
})(typeof window !== 'undefined' ? window : globalThis);
