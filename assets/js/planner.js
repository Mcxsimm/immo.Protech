/* ==========================================================================
   Planificateur de semaine
   --------------------------------------------------------------------------
   Genere une liste de repas a partir de :
     - un nombre de repas et un nombre de convives (global ou par repas)
     - une envie exprimee librement ("poulet", "asiatique", "rapide"...)
     - des contraintes alimentaires (regimes, allergies, aversions, temps)
   et optimise l'ENSEMBLE de la semaine, pas chaque repas isolement :
   alternance des sources de proteines, rotation des feculents, quantite de
   legumes, variete des cuisines et reemploi des produits frais (anti-gaspi).
   ========================================================================== */
(function (global) {
  'use strict';

  var N = global.MP_NUTRITION;
  var ING = global.MP_INGREDIENTS;

  /* Generateur pseudo-aleatoire deterministe : une meme graine redonne le
     meme menu, ce qui rend les resultats reproductibles et testables. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normalise(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  var SAISONS = ['printemps', 'été', 'automne', 'hiver'];

  /* Une envie est rarement exprimee avec le nom exact d'un pays : on relie
     les familles de cuisine et les formulations courantes aux recettes. */
  var SYNONYMES = {
    asiatique: ['chine', 'japon', 'thailande', 'vietnam', 'coree', 'asie', 'indonesie', 'wok', 'nouilles'],
    asie: ['chine', 'japon', 'thailande', 'vietnam', 'coree', 'asie', 'indonesie', 'wok'],
    oriental: ['maroc', 'maghreb', 'liban', 'tajine', 'semoule', 'couscous'],
    orientale: ['maroc', 'maghreb', 'liban', 'tajine', 'couscous'],
    italien: ['italie', 'pates', 'risotto', 'pizza'],
    italienne: ['italie', 'pates', 'risotto', 'pizza'],
    indien: ['inde', 'curry', 'masala', 'dahl'],
    indienne: ['inde', 'curry', 'masala', 'dahl'],
    mexicain: ['mexique', 'tacos', 'fajitas', 'chili'],
    mexicaine: ['mexique', 'tacos', 'fajitas', 'chili'],
    japonais: ['japon', 'teriyaki'],
    chinois: ['chine', 'wok'],
    thai: ['thailande', 'coco', 'curry'],
    mediterraneen: ['mediterranee', 'grece', 'italie', 'espagne'],
    poisson: ['poisson', 'saumon', 'cabillaud', 'colin', 'truite', 'dorade', 'thon', 'maquereau', 'sardine'],
    legumes: ['legume', 'vegetarien'],
    vegetarien: ['vegetarien', 'legumineuse'],
    comfort: ['reconfortant', 'gratin', 'mijote'],
    reconfortant: ['gratin', 'mijote', 'cremeux'],
    sain: ['leger', 'equilibre', 'bowl', 'salade'],
    barbecue: ['grillade', 'brochettes'],
    soupe: ['soupe', 'veloute', 'minestrone']
  };

  function etendreEnvie(mots) {
    var out = [];
    mots.forEach(function (m) {
      out.push(m);
      if (SYNONYMES[m]) SYNONYMES[m].forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); });
    });
    return out;
  }

  function saisonCourante() {
    var m = new Date().getMonth();
    if (m <= 1 || m === 11) return 'hiver';
    if (m <= 4) return 'printemps';
    if (m <= 7) return 'été';
    return 'automne';
  }

  /* ---------------------------------------------------------------- envies */
  /* Une envie est un texte libre. On la confronte au nom, aux tags, a la
     cuisine et aux ingredients de chaque recette, avec un poids decroissant. */
  function scoreEnvie(recipe, envieMots) {
    if (!envieMots.length) return 0;
    var p = N.profile(recipe);
    var haystackNom = normalise(recipe.n);
    var haystackTags = normalise((recipe.tags || []).join(' ') + ' ' + recipe.cu);
    var haystackIng = normalise(Object.keys(p.ids).map(function (id) {
      return ING.byId[id] ? ING.byId[id].n : '';
    }).join(' '));
    var total = 0;
    envieMots.forEach(function (mot) {
      if (mot.length < 3) return;
      if (haystackNom.indexOf(mot) >= 0) total += 3;
      else if (normalise(recipe.cu).indexOf(mot) >= 0) total += 2.8;
      else if (haystackTags.indexOf(mot) >= 0) total += 2.5;
      else if (haystackIng.indexOf(mot) >= 0) total += 1.5;
      else if (normalise(N.LABEL_PROT[p.proteine] || '').indexOf(mot) >= 0) total += 1;
      else if (p.feculentBase.indexOf(mot) >= 0) total += 1;
      if (mot === 'rapide' && recipe.t <= 30) total += 2;
      if ((mot === 'leger' || mot === 'light') && p.nutrition.kcal <= 600) total += 2;
      if (mot === 'facile' && recipe.d === 1) total += 1.5;
    });
    return total;
  }

  /* ------------------------------------------------------------- filtrage */
  function eligible(recipe, o) {
    var p = N.profile(recipe);

    for (var i = 0; i < o.regimes.length; i++) {
      if (!p.regimes[o.regimes[i]]) return false;
    }
    for (var j = 0; j < o.allergenes.length; j++) {
      if (p.allergenes.indexOf(o.allergenes[j]) >= 0) return false;
    }
    for (var k = 0; k < o.exclusions.length; k++) {
      if (p.ids[o.exclusions[k]]) return false;
    }
    if (o.tempsMax && recipe.t > o.tempsMax) return false;
    if (o.difficulteMax && recipe.d > o.difficulteMax) return false;
    if (o.budgetMax && p.cost > o.budgetMax) return false;
    return true;
  }

  /* -------------------------------------------------------------- objectifs */
  /* Reperes PNNS ramenes au nombre de repas demande. */
  function objectifs(n, o) {
    o = o || { regimes: [], allergenes: [] };
    var sansPoisson = o.regimes.indexOf('vegetarien') >= 0 || o.regimes.indexOf('vegetalien') >= 0 ||
      o.regimes.indexOf('sansPoisson') >= 0 ||
      o.allergenes.indexOf('poisson') >= 0;
    var toutVege = o.regimes.indexOf('vegetarien') >= 0 || o.regimes.indexOf('vegetalien') >= 0;
    return {
      poissonMin: sansPoisson ? 0 : (n >= 4 ? 2 : (n >= 2 ? 1 : 0)),
      poissonGrasMin: sansPoisson ? 0 : (n >= 4 ? 1 : 0),
      vegetarienMin: toutVege ? 0 : (n >= 5 ? 2 : (n >= 3 ? 1 : 0)),
      viandeRougeMax: n >= 5 ? 2 : 1,
      memeBaseMax: n >= 6 ? 2 : (n >= 4 ? 2 : 1),
      memeCuisineMax: n >= 6 ? 3 : 2,
      legumesMoyenMin: 200
    };
  }

  /* ------------------------------------------------------------- notation */
  /* Note un menu complet. Plus la note est haute, meilleur est l'equilibre.
     Chaque ecart aux reperes est retourne en clair pour pouvoir l'expliquer
     a l'utilisateur plutot que de livrer une boite noire. */
  function noter(recettes, o, obj) {
    var n = recettes.length;
    if (!n) return { score: -1e9, alertes: [] };

    var cptFam = {}, cptBase = {}, cptCuisine = {}, cptProt = {};
    var legumes = 0, kcal = 0, prot = 0, fibres = 0, cout = 0, poissonGras = 0;
    var perissables = {};

    recettes.forEach(function (r) {
      var p = N.profile(r);
      var fam = N.familleProt(p.proteine);
      cptFam[fam] = (cptFam[fam] || 0) + 1;
      cptProt[p.proteine] = (cptProt[p.proteine] || 0) + 1;
      cptBase[p.feculentBase] = (cptBase[p.feculentBase] || 0) + 1;
      cptCuisine[r.cu] = (cptCuisine[r.cu] || 0) + 1;
      legumes += p.legumesG;
      kcal += p.nutrition.kcal;
      prot += p.nutrition.p;
      fibres += p.nutrition.f;
      cout += p.cost;
      if (p.proteine === 'poisson_gras') poissonGras++;
      Object.keys(p.ids).forEach(function (id) {
        var ing = ING.byId[id];
        if (ing && !ing.pl && (ing.r === 'legumes' || ing.r === 'cremerie')) {
          perissables[id] = (perissables[id] || 0) + 1;
        }
      });
    });

    var score = 0, alertes = [];
    var poisson = cptFam.poisson || 0;
    var vege = cptFam.vegetarien || 0;
    var rouge = cptFam.viande_rouge || 0;

    /* 1. Reperes hebdomadaires (poids fort : c'est le cœur de l'equilibre). */
    if (poisson < obj.poissonMin) {
      score -= 26 * (obj.poissonMin - poisson);
      alertes.push({ t: 'poisson', m: 'Seulement ' + poisson + ' repas de poisson (repère : ' + obj.poissonMin + ').' });
    }
    if (poisson > 0 && poissonGras < obj.poissonGrasMin) {
      score -= 8;
      alertes.push({ t: 'poisson_gras', m: 'Aucun poisson gras (saumon, maquereau, sardine) cette semaine.' });
    }
    if (vege < obj.vegetarienMin) {
      score -= 22 * (obj.vegetarienMin - vege);
      alertes.push({ t: 'vegetarien', m: 'Seulement ' + vege + ' repas végétarien (repère : ' + obj.vegetarienMin + ').' });
    }
    if (rouge > obj.viandeRougeMax) {
      score -= 24 * (rouge - obj.viandeRougeMax);
      alertes.push({ t: 'viande_rouge', m: rouge + ' repas de viande rouge (repère : ' + obj.viandeRougeMax + ' maximum).' });
    }

    /* 2. Rotation des feculents et des cuisines. */
    Object.keys(cptBase).forEach(function (b) {
      if (b !== 'aucun' && cptBase[b] > obj.memeBaseMax) {
        score -= 11 * (cptBase[b] - obj.memeBaseMax);
        alertes.push({ t: 'feculent', m: cptBase[b] + ' repas à base de ' + b + '.' });
      }
    });
    Object.keys(cptProt).forEach(function (p) {
      if (cptProt[p] > Math.max(2, Math.ceil(n / 3))) score -= 7 * (cptProt[p] - Math.max(2, Math.ceil(n / 3)));
    });
    Object.keys(cptCuisine).forEach(function (c) {
      if (cptCuisine[c] > obj.memeCuisineMax) score -= 5 * (cptCuisine[c] - obj.memeCuisineMax);
    });
    score += Object.keys(cptCuisine).length * 2.5;

    /* 3. Qualite moyenne des assiettes. */
    var legMoy = legumes / n;
    if (legMoy < obj.legumesMoyenMin) {
      score -= (obj.legumesMoyenMin - legMoy) / 7;
      if (legMoy < 160) alertes.push({ t: 'legumes', m: 'Moyenne de ' + Math.round(legMoy) + ' g de légumes par repas (visez 200 g).' });
    } else {
      score += 6;
    }
    var kcalMoy = kcal / n;
    if (kcalMoy > 850) score -= (kcalMoy - 850) / 12;
    if (kcalMoy < 500) score -= (500 - kcalMoy) / 12;
    if (fibres / n >= 8) score += 5;
    recettes.forEach(function (r) { score += N.profile(r).equilibre.score * 1.6; });

    /* 4. Envie exprimee : on garantit le nombre de repas demande, sans
          sacrifier l'equilibre du reste de la semaine. */
    if (o.envieMots.length) {
      var matchs = recettes.filter(function (r) { return scoreEnvie(r, o.envieMots) >= 2.5; }).length;
      var vise = o.envieCible;
      if (matchs < vise) score -= 20 * (vise - matchs);
      else score += 6;
      recettes.forEach(function (r) { score += Math.min(scoreEnvie(r, o.envieMots), 6) * 0.7; });
    }

    /* 5. Anti-gaspi : reutiliser un produit frais evite une botte de persil
          ou une brique de creme achetee pour un seul repas. */
    var partages = 0;
    Object.keys(perissables).forEach(function (id) { if (perissables[id] >= 2) partages++; });
    score += Math.min(partages, 10) * 1.8;

    /* 6. Budget et temps. */
    if (o.budgetSemaine) {
      var depasse = cout * o.convivesMoyen - o.budgetSemaine;
      if (depasse > 0) score -= depasse * 1.5;
    }

    return {
      score: score, alertes: alertes,
      stats: {
        poisson: poisson, poissonGras: poissonGras, vegetarien: vege, viandeRouge: rouge,
        viandeBlanche: cptFam.viande_blanche || 0,
        legumesMoyen: Math.round(legMoy), kcalMoyen: Math.round(kcalMoy),
        protMoyen: Math.round(prot / n), fibresMoyen: Math.round(fibres / n),
        coutPortion: Math.round((cout / n) * 100) / 100,
        bases: cptBase, cuisines: Object.keys(cptCuisine).length, partages: partages
      }
    };
  }

  /* ------------------------------------------------------------ generation */
  function generate(opts) {
    var o = {
      nbRepas: Math.max(1, Math.min(14, opts.nbRepas || 5)),
      convives: Math.max(1, Math.min(20, opts.convives || 2)),
      convivesParRepas: opts.convivesParRepas || {},
      envie: opts.envie || '',
      envieIntensite: opts.envieIntensite || 'un_peu',
      regimes: opts.regimes || [],
      allergenes: opts.allergenes || [],
      exclusions: opts.exclusions || [],
      tempsMax: opts.tempsMax || 0,
      difficulteMax: opts.difficulteMax || 0,
      budgetSemaine: opts.budgetSemaine || 0,
      budgetMax: 0,
      saison: opts.saison || saisonCourante(),
      prefSaison: opts.prefSaison !== false,
      verrous: opts.verrous || [],
      exclusRecettes: opts.exclusRecettes || [],
      interdits: opts.interdits || [],
      seed: opts.seed || Math.floor(Math.random() * 1e9)
    };
    o.envieMots = etendreEnvie(normalise(o.envie).split(' ').filter(function (m) { return m.length >= 3; }));
    o.convivesMoyen = o.convives;
    o.envieCible = !o.envieMots.length ? 0
      : o.envieIntensite === 'toute' ? o.nbRepas
        : o.envieIntensite === 'plusieurs' ? Math.max(2, Math.round(o.nbRepas / 2))
          : Math.min(2, o.nbRepas);

    var rand = rng(o.seed);
    var obj = objectifs(o.nbRepas, o);

    /* Catalogue eligible. */
    var pool = global.MP_RECIPES.filter(function (r) {
      return o.interdits.indexOf(r.id) < 0 && eligible(r, o);
    });
    var raisonEchec = null;
    if (pool.length < o.nbRepas) {
      raisonEchec = pool.length === 0
        ? 'Aucune recette ne correspond à ces contraintes.'
        : 'Seulement ' + pool.length + ' recette(s) compatible(s) : les contraintes ont été assouplies.';
      /* Repli : on relache le temps puis la difficulte plutot que d'echouer. */
      var relache = Object.assign({}, o, { tempsMax: 0, difficulteMax: 0 });
      pool = global.MP_RECIPES.filter(function (r) {
        return o.interdits.indexOf(r.id) < 0 && eligible(r, relache);
      });
      if (pool.length < o.nbRepas) {
        relache.exclusions = [];
        pool = global.MP_RECIPES.filter(function (r) {
          return o.interdits.indexOf(r.id) < 0 && eligible(r, relache);
        });
      }
    }
    if (!pool.length) {
      return { ok: false, message: 'Aucune recette ne correspond à ces contraintes. Retirez-en une pour continuer.', repas: [] };
    }

    /* Ponderation de tirage : envie, saison et un peu de hasard. */
    var poids = {};
    pool.forEach(function (r) {
      var w = 1;
      w += Math.min(scoreEnvie(r, o.envieMots), 8) * 0.8;
      if (o.prefSaison) {
        if (!r.s) w += 0.4;
        else if (r.s.indexOf(o.saison) >= 0) w += 1.6;
        else w -= 0.35;
      }
      if (o.exclusRecettes.indexOf(r.id) >= 0) w *= 0.12;
      poids[r.id] = Math.max(0.08, w);
    });

    function tirer(dejaPris) {
      var dispo = pool.filter(function (r) { return !dejaPris[r.id]; });
      if (!dispo.length) return null;
      var total = 0;
      dispo.forEach(function (r) { total += poids[r.id]; });
      var x = rand() * total;
      for (var i = 0; i < dispo.length; i++) {
        x -= poids[dispo[i].id];
        if (x <= 0) return dispo[i];
      }
      return dispo[dispo.length - 1];
    }

    /* Repas verrouilles : ils restent en place, la semaine s'organise autour. */
    var fixes = {};
    o.verrous.forEach(function (v) {
      var r = global.MP_RECIPES.find(function (x) { return x.id === v.id; });
      if (r && v.index < o.nbRepas) fixes[v.index] = r;
    });

    function construire() {
      var pris = {}, out = [];
      Object.keys(fixes).forEach(function (i) { pris[fixes[i].id] = 1; });
      for (var i = 0; i < o.nbRepas; i++) {
        if (fixes[i]) { out[i] = fixes[i]; continue; }
        var r = tirer(pris);
        if (!r) return null;
        pris[r.id] = 1;
        out[i] = r;
      }
      return out;
    }

    /* 1) On tire un grand nombre de menus candidats. */
    var meilleur = null, meilleurNote = null;
    var essais = Math.min(600, 120 + pool.length * 2);
    for (var t = 0; t < essais; t++) {
      var cand = construire();
      if (!cand) break;
      var note = noter(cand, o, obj);
      if (!meilleurNote || note.score > meilleurNote.score) { meilleur = cand; meilleurNote = note; }
    }
    if (!meilleur) return { ok: false, message: 'Impossible de composer la semaine avec ces contraintes.', repas: [] };

    /* 2) Puis on ameliore par remplacements successifs (montee de colline). */
    for (var it = 0; it < 900; it++) {
      var idx = Math.floor(rand() * o.nbRepas);
      if (fixes[idx]) continue;
      var actuels = {};
      meilleur.forEach(function (r) { actuels[r.id] = 1; });
      var remplacant = tirer(actuels);
      if (!remplacant) continue;
      var test = meilleur.slice();
      test[idx] = remplacant;
      var noteTest = noter(test, o, obj);
      if (noteTest.score > meilleurNote.score) { meilleur = test; meilleurNote = noteTest; }
    }

    var repas = meilleur.map(function (r, i) {
      return {
        index: i,
        id: r.id,
        recette: r,
        convives: o.convivesParRepas[i] || o.convives,
        verrouille: !!fixes[i]
      };
    });

    return {
      ok: true,
      message: raisonEchec,
      repas: repas,
      options: o,
      objectifs: obj,
      note: meilleurNote,
      poolSize: pool.length
    };
  }

  /* Remplace un seul repas en gardant le reste de la semaine intact. */
  function remplacer(plan, index) {
    var verrous = plan.repas.map(function (r) { return { index: r.index, id: r.id }; })
      .filter(function (r) { return r.index !== index; });
    var exclus = (plan.options.exclusRecettes || []).concat([plan.repas[index].id]);
    var o = Object.assign({}, plan.options, {
      verrous: verrous,
      exclusRecettes: exclus,
      interdits: [plan.repas[index].id],
      seed: Math.floor(Math.random() * 1e9)
    });
    var convives = {};
    plan.repas.forEach(function (r) { convives[r.index] = r.convives; });
    o.convivesParRepas = convives;
    var neuf = generate(o);
    if (neuf.ok) neuf.options.exclusRecettes = exclus;
    return neuf;
  }

  global.MP_PLANNER = {
    generate: generate, remplacer: remplacer, noter: noter, objectifs: objectifs,
    scoreEnvie: scoreEnvie, eligible: eligible, normalise: normalise,
    saisonCourante: saisonCourante, SAISONS: SAISONS, rng: rng
  };
})(typeof window !== 'undefined' ? window : globalThis);
