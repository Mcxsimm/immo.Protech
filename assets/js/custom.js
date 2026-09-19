/* ==========================================================================
   Recettes et ingrédients personnels
   --------------------------------------------------------------------------
   Ce que l'utilisateur crée depuis l'application est stocké séparément du
   catalogue livré, puis fusionné dans les mêmes tableaux globaux au
   démarrage. Le planificateur, le moteur nutritionnel et la liste de courses
   n'ont donc rien à savoir de cette distinction : une recette personnelle est
   une recette comme une autre.

   Stockage dédié : effacer une semaine ou réinitialiser les réglages ne doit
   jamais emporter le travail de saisie.
   ========================================================================== */
(function (global) {
  'use strict';

  var CLE = 'semainier.perso.v1';
  var ING = global.MP_INGREDIENTS;
  var RECETTES = global.MP_RECIPES;

  /* Familles proposées à la création d'un ingrédient. La famille détermine
     la façon dont le moteur classe le plat (viande rouge, poisson gras…) :
     c'est le seul champ vraiment structurant, d'où des libellés explicites. */
  var FAMILLES = [
    { id: 'legume', n: 'Légume', veg: 1 },
    { id: 'fruit', n: 'Fruit', fr: 1 },
    { id: 'feculent', n: 'Féculent (pâtes, riz, pain, pomme de terre)' },
    { id: 'legumineuse', n: 'Légumineuse (lentilles, pois chiches, haricots)' },
    { id: 'viande_blanche', n: 'Viande blanche (volaille, porc, veau)' },
    { id: 'viande_rouge', n: 'Viande rouge (bœuf, agneau)' },
    { id: 'charcuterie', n: 'Charcuterie' },
    { id: 'poisson_blanc', n: 'Poisson maigre (cabillaud, colin…)' },
    { id: 'poisson_gras', n: 'Poisson gras (saumon, maquereau, sardine)' },
    { id: 'fruits_mer', n: 'Fruits de mer' },
    { id: 'oeuf', n: 'Œuf' },
    { id: 'soja', n: 'Soja, tofu, tempeh' },
    { id: 'fromage', n: 'Fromage' },
    { id: 'laitage', n: 'Lait, crème, yaourt' },
    { id: 'oleagineux', n: 'Noix et graines' },
    { id: 'matiere_grasse', n: 'Matière grasse (huile, beurre)' },
    { id: 'aromate', n: 'Herbe aromatique' },
    { id: 'epice', n: 'Épice' },
    { id: 'condiment', n: 'Condiment, sauce' },
    { id: 'sucre', n: 'Sucre, miel' }
  ];

  var ALLERGENES = ['gluten', 'lactose', 'oeuf', 'fruits_a_coque', 'poisson',
    'crustaces', 'mollusques', 'soja', 'sesame', 'moutarde'];

  var donnees = { v: 1, ingredients: [], recettes: [] };

  /* ------------------------------------------------------------- stockage */
  function lire() {
    try {
      var brut = localStorage.getItem(CLE);
      var d = brut ? JSON.parse(brut) : null;
      if (d && Array.isArray(d.ingredients) && Array.isArray(d.recettes)) return d;
    } catch (e) { /* stockage indisponible */ }
    return { v: 1, ingredients: [], recettes: [] };
  }

  function ecrire() {
    try { localStorage.setItem(CLE, JSON.stringify(donnees)); return true; }
    catch (e) { return false; }
  }

  /* ------------------------------------------------------------ identifiants */
  function slug(txt) {
    return (txt || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'sans_nom';
  }

  function idUnique(base, existe) {
    var id = base, n = 2;
    while (existe(id)) { id = base + '_' + n; n++; }
    return id;
  }

  /* --------------------------------------------------------- fusion globale */
  /* On retire d'abord toutes les entrées personnelles des tableaux partagés,
     puis on les réinjecte : une modification se propage sans doublon. */
  function resynchroniser() {
    for (var i = ING.list.length - 1; i >= 0; i--) {
      if (ING.list[i].perso) { delete ING.byId[ING.list[i].id]; ING.list.splice(i, 1); }
    }
    for (var j = RECETTES.length - 1; j >= 0; j--) {
      if (RECETTES[j].perso) RECETTES.splice(j, 1);
    }

    donnees.ingredients.forEach(function (ing) {
      var copie = Object.assign({}, ing, { perso: true });
      copie.al = copie.al || [];
      copie.f = copie.f || 0;
      ING.list.push(copie);
      ING.byId[copie.id] = copie;
    });

    donnees.recettes.forEach(function (r) {
      /* Ce que l'utilisateur saisit rejoint la base « nos recettes ». */
      var copie = Object.assign({}, r, { perso: true, src: 'nous' });
      delete copie._profile;           /* le profil est recalculé à la demande */
      RECETTES.push(copie);
    });
  }

  function charger() {
    donnees = lire();
    resynchroniser();
    return donnees;
  }

  /* --------------------------------------------------------------- lecture */
  function recettes() { return donnees.recettes.slice(); }
  function ingredients() { return donnees.ingredients.slice(); }
  function recette(id) {
    return donnees.recettes.filter(function (r) { return r.id === id; })[0] || null;
  }
  function estPerso(id) { return !!recette(id); }

  /* -------------------------------------------------------- enregistrement */
  /**
   * Crée ou met à jour une recette personnelle.
   * @param {object} r  { id?, n, cu, tags, t, d, s, i: [[ingId, qtéParPersonne]], e: [] }
   * @returns {{ok:boolean, id?:string, erreurs?:string[]}}
   */
  function enregistrerRecette(r) {
    var erreurs = [];
    if (!r.n || !r.n.trim()) erreurs.push('Donnez un nom à la recette.');
    if (!r.i || !r.i.length) erreurs.push('Ajoutez au moins un ingrédient.');
    (r.i || []).forEach(function (line) {
      if (!ING.byId[line[0]]) erreurs.push('Ingrédient inconnu : ' + line[0]);
      else if (!(line[1] > 0)) erreurs.push('Quantité manquante pour ' + ING.byId[line[0]].n + '.');
    });
    if (!r.e || !r.e.length) erreurs.push('Décrivez au moins une étape.');
    if (erreurs.length) return { ok: false, erreurs: erreurs };

    var existant = r.id ? recette(r.id) : null;
    var id = existant ? existant.id : idUnique('perso_' + slug(r.n), function (x) {
      return !!ING.byId[x] || RECETTES.some(function (y) { return y.id === x; });
    });

    var propre = {
      id: id,
      n: r.n.trim(),
      cu: (r.cu || '').trim() || 'Maison',
      tags: (r.tags || []).map(function (t) { return t.trim(); }).filter(Boolean),
      t: Math.max(1, Math.min(600, parseInt(r.t, 10) || 30)),
      d: Math.max(1, Math.min(3, parseInt(r.d, 10) || 1)),
      i: r.i.map(function (l) { return [l[0], Math.round(l[1] * 1000) / 1000]; }),
      e: r.e.map(function (e) { return e.trim(); }).filter(Boolean),
      perso: true,
      src: 'nous',
      maj: Date.now()
    };
    if (r.s && r.s.length && r.s.length < 4) propre.s = r.s.slice();

    if (existant) {
      donnees.recettes[donnees.recettes.indexOf(existant)] = propre;
    } else {
      donnees.recettes.push(propre);
    }
    ecrire();
    resynchroniser();
    return { ok: true, id: id };
  }

  function supprimerRecette(id) {
    var r = recette(id);
    if (!r) return false;
    donnees.recettes.splice(donnees.recettes.indexOf(r), 1);
    ecrire();
    resynchroniser();
    return true;
  }

  /**
   * Crée ou met à jour un ingrédient personnel.
   * Les valeurs nutritionnelles sont facultatives : sans elles, la recette
   * reste utilisable mais son analyse est incomplète, et c'est signalé.
   */
  function enregistrerIngredient(ing) {
    var erreurs = [];
    if (!ing.n || !ing.n.trim()) erreurs.push('Donnez un nom à l’ingrédient.');
    if (!ing.r) erreurs.push('Choisissez un rayon.');
    if (['g', 'ml', 'pc'].indexOf(ing.u) < 0) erreurs.push('Choisissez une unité.');
    if (ing.u === 'pc' && !(ing.pc > 0)) erreurs.push('Indiquez le poids d’une pièce, en grammes.');
    if (erreurs.length) return { ok: false, erreurs: erreurs };

    var famille = FAMILLES.filter(function (f) { return f.id === ing.ct; })[0] || FAMILLES[0];
    var ancien = ing.id ? donnees.ingredients.filter(function (x) { return x.id === ing.id; })[0] : null;
    var id = ancien ? ancien.id : idUnique('perso_' + slug(ing.n), function (x) {
      return !!ING.byId[x];
    });

    var nombre = function (v) { var n = parseFloat(v); return isNaN(n) || n < 0 ? 0 : n; };
    var propre = {
      id: id, n: ing.n.trim(), r: ing.r, u: ing.u,
      kcal: nombre(ing.kcal), p: nombre(ing.p), c: nombre(ing.c),
      l: nombre(ing.l), f: nombre(ing.f), px: nombre(ing.px),
      ct: famille.id, al: (ing.al || []).slice(), perso: true,
      complet: !!(parseFloat(ing.kcal) > 0)
    };
    if (ing.u === 'pc') { propre.pc = nombre(ing.pc); propre.up = (ing.up || '').trim() || 'pièce'; }
    if (famille.veg) propre.veg = 1;
    if (famille.fr) propre.fr = 1;
    if (ing.pl) propre.pl = 1;

    if (ancien) donnees.ingredients[donnees.ingredients.indexOf(ancien)] = propre;
    else donnees.ingredients.push(propre);
    ecrire();
    resynchroniser();
    return { ok: true, id: id };
  }

  /* Un ingrédient encore utilisé par une recette ne peut pas disparaître. */
  function utilisePar(idIngredient) {
    return RECETTES.filter(function (r) {
      return r.i.some(function (l) { return l[0] === idIngredient; });
    }).map(function (r) { return r.n; });
  }

  function supprimerIngredient(id) {
    var usages = utilisePar(id);
    if (usages.length) return { ok: false, usages: usages };
    donnees.ingredients = donnees.ingredients.filter(function (x) { return x.id !== id; });
    ecrire();
    resynchroniser();
    return { ok: true };
  }

  /* Recettes du catalogue utilisant un ingrédient dont les valeurs manquent. */
  function incomplete(r) {
    return r.i.some(function (l) {
      var ing = ING.byId[l[0]];
      return ing && ing.perso && !ing.complet;
    });
  }

  /* ----------------------------------------------------- export et import */
  function exporter() {
    return JSON.stringify({ v: 1, ingredients: donnees.ingredients, recettes: donnees.recettes }, null, 2);
  }

  function importer(json) {
    var d;
    try { d = JSON.parse(json); } catch (e) { return { ok: false, erreur: 'Fichier illisible : ce n’est pas du JSON valide.' }; }
    if (!d || !Array.isArray(d.recettes) || !Array.isArray(d.ingredients)) {
      return { ok: false, erreur: 'Ce fichier ne contient pas de recettes Semainier.' };
    }
    var ajoutI = 0, ajoutR = 0;
    d.ingredients.forEach(function (ing) {
      if (!ing || !ing.id || !ing.n) return;
      if (donnees.ingredients.some(function (x) { return x.id === ing.id; })) return;
      donnees.ingredients.push(Object.assign({}, ing, { perso: true }));
      ajoutI++;
    });
    resynchroniser();
    d.recettes.forEach(function (r) {
      if (!r || !r.id || !r.n || !Array.isArray(r.i)) return;
      if (donnees.recettes.some(function (x) { return x.id === r.id; })) return;
      if (r.i.some(function (l) { return !ING.byId[l[0]]; })) return; /* ingrédient manquant */
      donnees.recettes.push(Object.assign({}, r, { perso: true }));
      ajoutR++;
    });
    ecrire();
    resynchroniser();
    return { ok: true, ingredients: ajoutI, recettes: ajoutR, ignorees: d.recettes.length - ajoutR };
  }

  /* Extrait de code prêt à coller dans assets/data/recipes.js, pour proposer
     une recette au catalogue livré. */
  function versSource(r) {
    var q = function (s) { return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"; };
    var L = [];
    L.push('{ id: ' + q(r.id.replace(/^perso_/, '')) + ', n: ' + q(r.n) + ', cu: ' + q(r.cu) + ',');
    L.push('  tags: [' + (r.tags || []).map(q).join(', ') + '], t: ' + r.t + ', d: ' + r.d +
      (r.s ? ', s: [' + r.s.map(q).join(', ') + ']' : '') + ',');
    L.push('  i: [' + r.i.map(function (l) { return '[' + q(l[0]) + ', ' + l[1] + ']'; }).join(', ') + '],');
    L.push('  e: [' + r.e.map(q).join(', ') + '] },');
    return L.join('\n');
  }

  global.MP_CUSTOM = {
    charger: charger, recettes: recettes, ingredients: ingredients,
    recette: recette, estPerso: estPerso,
    enregistrerRecette: enregistrerRecette, supprimerRecette: supprimerRecette,
    enregistrerIngredient: enregistrerIngredient, supprimerIngredient: supprimerIngredient,
    utilisePar: utilisePar, incomplete: incomplete,
    exporter: exporter, importer: importer, versSource: versSource,
    FAMILLES: FAMILLES, ALLERGENES: ALLERGENES, CLE: CLE, slug: slug
  };
})(typeof window !== 'undefined' ? window : globalThis);
