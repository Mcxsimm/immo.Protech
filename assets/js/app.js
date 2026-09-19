/* ==========================================================================
   Semainier — interface
   --------------------------------------------------------------------------
   Rendu sans dependance ni etape de build : l'etat est conserve dans un objet
   unique, chaque onglet sait se redessiner, et les evenements passent par
   delegation depuis la racine.
   ========================================================================== */
(function () {
  'use strict';

  var P = window.MP_PLANNER, N = window.MP_NUTRITION,
    S = window.MP_SHOPPING, ING = window.MP_INGREDIENTS,
    RECETTES = window.MP_RECIPES, STORE = window.MP_STORE,
    C = window.MP_CUSTOM;

  /* Les recettes et ingrédients personnels rejoignent les catalogues avant
     tout rendu : le reste de l'application les traite comme les autres. */
  C.charger();

  var JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche',
    'J8', 'J9', 'J10', 'J11', 'J12', 'J13', 'J14'];

  var ICONES = { leaf: '🥬', meat: '🍗', fish: '🐟', milk: '🧀', can: '🥫', spice: '🧂', bread: '🥖', snow: '🧊', bottle: '🍷' };

  var REGIMES = [
    { id: 'vegetarien', n: 'Végétarien' },
    { id: 'vegetalien', n: 'Végétalien' },
    { id: 'sansPorc', n: 'Sans porc' },
    { id: 'sansGluten', n: 'Sans gluten' },
    { id: 'sansLactose', n: 'Sans lactose' },
    { id: 'sansAlcool', n: 'Sans alcool' }
  ];

  var ALLERGENES = [
    { id: 'fruits_a_coque', n: 'Fruits à coque' },
    { id: 'poisson', n: 'Poisson' },
    { id: 'crustaces', n: 'Crustacés' },
    { id: 'mollusques', n: 'Mollusques' },
    { id: 'oeuf', n: 'Œuf' },
    { id: 'soja', n: 'Soja' },
    { id: 'sesame', n: 'Sésame' },
    { id: 'moutarde', n: 'Moutarde' },
    { id: 'lactose', n: 'Lait' },
    { id: 'gluten', n: 'Gluten' }
  ];

  var NOM_ALLERGENE = {
    fruits_a_coque: 'fruits à coque', poisson: 'poisson', crustaces: 'crustacés',
    mollusques: 'mollusques', oeuf: 'œuf', soja: 'soja', sesame: 'sésame',
    moutarde: 'moutarde', lactose: 'lait', gluten: 'gluten'
  };

  function listeAllergenes(ids) {
    return ids.map(function (x) { return NOM_ALLERGENE[x] || x.replace(/_/g, ' '); }).join(', ');
  }

  var ENVIES_RAPIDES = ['Poulet', 'Poisson', 'Pâtes', 'Asiatique', 'Italien', 'Végétarien',
    'Épicé', 'Réconfortant', 'Rapide', 'Léger', 'Four', 'Soupe'];

  /* ------------------------------------------------------------------ état */
  var etat = {
    onglet: 'planifier',
    reglages: {
      nbRepas: 5, convives: 4, envie: '', envieIntensite: 'un_peu',
      regimes: [], allergenes: [], exclusions: [],
      tempsMax: 0, difficulteMax: 0, prefSaison: true, budgetSemaine: 0,
      sources: ['nous', 'idees'],
      rappelsRaccourci: 'Courses Semainier', rappelsListe: 'Liste de courses',
      rappelsRaccourciPret: false, rappelsRayons: false, rappelsPlacard: false
    },
    plan: null,
    coches: {},
    possede: {},
    recherche: '',
    filtreFamille: '',
    filtreSource: '',
    /* Plats choisis à la main pour la prochaine semaine. */
    choix: [],
    /* Recettes des dernières semaines, pour ne pas les resservir aussitôt. */
    historique: [],
    editeur: null,
    theme: 'auto'
  };

  /* --------------------------------------------------------------- outils */
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function eur(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ',') + ' €'; }

  /** Vrai si chaque mot de la recherche se trouve quelque part dans le texte. */
  function tousLesMots(recherche, texte) {
    var mots = P.normalise(recherche).split(' ').filter(Boolean);
    if (!mots.length) return true;
    var cible = P.normalise(texte);
    return mots.every(function (m) { return cible.indexOf(m) >= 0; });
  }
  function $(sel) { return document.querySelector(sel); }

  function toast(message) {
    var el = $('#toast');
    el.textContent = message;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.style.opacity = '0'; }, 2600);
  }

  /* ---------------------------------------------------- sauvegarde / reprise */
  function serialiser() {
    return {
      reglages: etat.reglages,
      coches: etat.coches,
      possede: etat.possede,
      theme: etat.theme,
      onglet: etat.onglet,
      choix: etat.choix,
      historique: etat.historique,
      editeur: etat.editeur,
      plan: etat.plan ? {
        repas: etat.plan.repas.map(function (r) {
          return { id: r.id, convives: r.convives, verrouille: r.verrouille };
        }),
        options: etat.plan.options,
        note: etat.plan.note,
        objectifs: etat.plan.objectifs,
        message: etat.plan.message
      } : null
    };
  }

  function sauver() { STORE.ecrire(serialiser()); }

  /* Écriture différée : inutile de sérialiser à chaque caractère frappé. */
  var minuteurSauvegarde = null;
  function sauverDiffere() {
    clearTimeout(minuteurSauvegarde);
    minuteurSauvegarde = setTimeout(sauver, 600);
  }

  function restaurer() {
    var d = STORE.lire();
    if (!d) return;
    if (d.reglages) Object.assign(etat.reglages, d.reglages);
    etat.coches = d.coches || {};
    etat.possede = d.possede || {};
    etat.theme = d.theme || 'auto';
    etat.choix = Array.isArray(d.choix) ? d.choix : [];
    etat.historique = Array.isArray(d.historique) ? d.historique : [];
    if (d.onglet) etat.onglet = d.onglet;
    /* Un formulaire laissé en cours de saisie est retrouvé tel quel. */
    if (d.editeur && d.editeur.i) etat.editeur = d.editeur;
    if (d.plan && d.plan.repas) {
      var repas = d.plan.repas.map(function (r, i) {
        var rec = RECETTES.filter(function (x) { return x.id === r.id; })[0];
        return rec ? { index: i, id: r.id, recette: rec, convives: r.convives || etat.reglages.convives, verrouille: !!r.verrouille } : null;
      }).filter(Boolean);
      if (repas.length) {
        etat.plan = {
          ok: true, repas: repas, options: d.plan.options || etat.reglages,
          note: d.plan.note, objectifs: d.plan.objectifs, message: d.plan.message
        };
        recalculerNote();
      }
    }
  }

  /* Recalcule la note quand la composition ou le nombre de convives change. */
  function recalculerNote() {
    if (!etat.plan) return;
    var o = Object.assign({}, etat.plan.options || {});
    o.regimes = o.regimes || etat.reglages.regimes;
    o.allergenes = o.allergenes || etat.reglages.allergenes;
    o.envieMots = o.envieMots || [];
    o.envieCible = o.envieCible || 0;
    o.convivesMoyen = moyenneConvives();
    var obj = P.objectifs(etat.plan.repas.length, o);
    etat.plan.objectifs = obj;
    etat.plan.note = P.noter(etat.plan.repas.map(function (r) { return r.recette; }), o, obj);
  }

  function moyenneConvives() {
    if (!etat.plan || !etat.plan.repas.length) return etat.reglages.convives;
    var t = etat.plan.repas.reduce(function (s, r) { return s + r.convives; }, 0);
    return Math.round(t / etat.plan.repas.length);
  }

  /* ================================ RENDU ================================ */

  function render() {
    document.documentElement.setAttribute('data-theme', etat.theme === 'auto' ? '' : etat.theme);
    majOnglets();
    var vue = $('#vue');
    var html = etat.onglet === 'planifier' ? vuePlanifier()
      : etat.onglet === 'semaine' ? vueSemaine()
        : etat.onglet === 'courses' ? vueCourses()
          : etat.editeur ? vueEditeur()
            : vueRecettes();
    vue.innerHTML = html;
    majBarreBasse();
    remplirChampsEditeur();
    window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
  }

  function majOnglets() {
    var nb = etat.plan ? etat.plan.repas.length : 0;
    var nbc = 0;
    if (etat.plan) {
      var l = S.build(etat.plan, { placardPossede: etat.possede });
      nbc = l.nbArticles;
    }
    var defs = [
      { id: 'planifier', n: 'Planifier', ico: '⚙️' },
      { id: 'semaine', n: 'Ma semaine', ico: '🍽️', nb: nb },
      { id: 'courses', n: 'Courses', ico: '🛒', nb: nbc },
      { id: 'recettes', n: 'Recettes', ico: '📖', nb: RECETTES.length }
    ];
    $('#onglets').innerHTML = defs.map(function (d) {
      return '<button role="tab" data-onglet="' + d.id + '" aria-selected="' + (etat.onglet === d.id) + '">' +
        '<span aria-hidden="true">' + d.ico + '</span>' + esc(d.n) +
        (d.nb ? '<span class="pastille-nb">' + d.nb + '</span>' : '') + '</button>';
    }).join('');
  }

  function majBarreBasse() {
    var b = $('#barreBasse');
    if (etat.onglet === 'planifier') {
      b.innerHTML = '<div class="barre-basse-in">' +
        '<div class="petit doux" style="flex:1"><b>' + compatibles() + '</b> recettes compatibles</div>' +
        '<button class="bouton principal" data-action="generer">Générer ma semaine</button></div>';
      b.hidden = false;
    } else if (etat.onglet === 'semaine' && etat.plan) {
      b.innerHTML = '<div class="barre-basse-in">' +
        '<div class="petit doux" style="flex:1">' + etat.plan.repas.length + ' repas · ' +
        totalPortions() + ' portions</div>' +
        '<button class="bouton" data-action="regenerer">↻ Regénérer</button>' +
        '<button class="bouton principal" data-onglet="courses">Voir les courses →</button></div>';
      b.hidden = false;
    } else if (etat.onglet === 'courses' && etat.plan) {
      var l = S.build(etat.plan, { placardPossede: etat.possede });
      b.innerHTML = '<div class="barre-basse-in">' +
        '<div class="petit doux" style="flex:1"><b class="mono">' + eur(l.cout) + '</b> estimés · ' +
        l.nbArticles + ' articles</div>' +
        '<button class="bouton" data-action="copier">Copier</button>' +
        '<button class="bouton" data-action="imprimer">Imprimer</button></div>';
      b.hidden = false;
    } else {
      b.hidden = true;
    }
  }

  function totalPortions() {
    return etat.plan ? etat.plan.repas.reduce(function (s, r) { return s + r.convives; }, 0) : 0;
  }

  function compatibles() {
    var o = Object.assign({}, etat.reglages);
    o.regimes = etat.reglages.regimes; o.allergenes = etat.reglages.allergenes;
    o.exclusions = etat.reglages.exclusions;
    return RECETTES.filter(function (r) { return P.eligible(r, o); }).length;
  }

  /* ----------------------------------------------------- onglet Planifier */
  function vuePlanifier() {
    var r = etat.reglages;
    var dispo = compatibles();
    var manque = dispo < r.nbRepas;

    return '' +
      '<div class="section">' +
      '<div class="carte carte-p">' +
      '<h2>Vos repas de la semaine</h2>' +
      '<p class="doux petit">Indiquez combien de repas préparer et pour combien de personnes. Le reste est calculé pour vous.</p>' +

      '<div class="grille grille-2" style="margin-top:16px">' +
      '<label class="champ"><span class="lib">Nombre de repas à planifier</span>' +
      compteur('nbRepas', r.nbRepas, 1, 14, 'repas') + '</label>' +
      '<label class="champ"><span class="lib">Convives par repas</span>' +
      compteur('convives', r.convives, 1, 20, r.convives > 1 ? 'personnes' : 'personne') +
      '<span class="aide" style="margin-top:8px">Ajustable repas par repas ensuite.</span></label>' +
      '</div>' +

      '<label class="champ"><span class="lib">Une envie particulière&nbsp;?</span>' +
      '<span class="aide">Un ingrédient, un type de cuisine, une humeur… ou rien du tout.</span>' +
      '<input type="text" id="envie" value="' + esc(r.envie) + '" placeholder="ex. poulet, asiatique, réconfortant, rapide…" autocomplete="off">' +
      '<div class="puces" style="margin-top:9px">' +
      ENVIES_RAPIDES.map(function (e) {
        var actif = P.normalise(r.envie).indexOf(P.normalise(e)) >= 0;
        return '<button type="button" class="puce" data-envie="' + esc(e) + '" aria-pressed="' + actif + '">' + esc(e) + '</button>';
      }).join('') +
      '</div></label>' +

      '<div class="champ" id="blocIntensite"' + (r.envie.trim() ? '' : ' hidden') + '>' +
      '<span class="lib">Place de cette envie dans la semaine</span>' +
      '<div class="puces">' +
      [['un_peu', 'Un ou deux repas'], ['plusieurs', 'La moitié des repas'], ['toute', 'Toute la semaine']]
        .map(function (i) {
          return '<button type="button" class="puce" data-intensite="' + i[0] + '" aria-pressed="' + (r.envieIntensite === i[0]) + '">' + i[1] + '</button>';
        }).join('') + '</div></div>' +
      '</div></div>' +

      '<div class="section"><div class="carte carte-p">' +
      '<h2>Contraintes alimentaires</h2>' +
      '<p class="doux petit">L’équilibre de la semaine est recalculé en fonction de ces choix.</p>' +

      '<div class="champ"><span class="lib">Régime</span><div class="puces">' +
      REGIMES.map(function (g) {
        return '<button type="button" class="puce" data-regime="' + g.id + '" aria-pressed="' + (r.regimes.indexOf(g.id) >= 0) + '">' + esc(g.n) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="champ"><span class="lib">Allergies et intolérances</span>' +
      '<span class="aide">Les recettes concernées sont retirées, pas seulement signalées.</span><div class="puces">' +
      ALLERGENES.map(function (a) {
        return '<button type="button" class="puce" data-allergene="' + a.id + '" aria-pressed="' + (r.allergenes.indexOf(a.id) >= 0) + '">' + esc(a.n) + '</button>';
      }).join('') + '</div></div>' +

      '<div class="grille grille-2">' +
      '<label class="champ"><span class="lib">Temps maximum en cuisine</span>' +
      '<select id="tempsMax">' +
      [[0, 'Peu importe'], [20, '20 min'], [30, '30 min'], [45, '45 min'], [60, '1 heure']].map(function (t) {
        return '<option value="' + t[0] + '"' + (r.tempsMax === t[0] ? ' selected' : '') + '>' + t[1] + '</option>';
      }).join('') + '</select></label>' +
      '<label class="champ"><span class="lib">Niveau de cuisine</span>' +
      '<select id="difficulteMax">' +
      [[0, 'Tous niveaux'], [1, 'Très simple uniquement'], [2, 'Simple et intermédiaire']].map(function (t) {
        return '<option value="' + t[0] + '"' + (r.difficulteMax === t[0] ? ' selected' : '') + '>' + t[1] + '</option>';
      }).join('') + '</select></label>' +
      '</div>' +

      '<label class="champ"><span class="lib">Aliments à éviter</span>' +
      '<span class="aide">Ce que personne n’aime à table. Tapez pour filtrer, cliquez pour exclure.</span>' +
      '<input type="text" id="rechercheAversion" placeholder="ex. champignon, olive…" autocomplete="off">' +
      '<div class="puces" id="listeAversions" style="margin-top:9px">' + pucesAversions('') + '</div></label>' +

      '<div class="champ" style="margin-bottom:0"><span class="lib">Privilégier les produits de saison</span>' +
      '<div class="puces">' +
      '<button type="button" class="puce" data-saison="1" aria-pressed="' + (r.prefSaison !== false) + '">Oui, ' + P.saisonCourante() + '</button>' +
      '<button type="button" class="puce" data-saison="0" aria-pressed="' + (r.prefSaison === false) + '">Peu importe</button>' +
      '</div></div>' +

      '</div></div>' +

      carteSources() +
      carteChoix() +

      (manque ? '<div class="alerte-bloc" style="margin-bottom:18px"><span>⚠️</span><div>' +
        'Seulement <b>' + dispo + '</b> recette(s) correspondent à ces contraintes, pour ' + r.nbRepas + ' repas demandés. ' +
        'Certaines seront répétées ou les contraintes assouplies.</div></div>' : '') +

      '<div class="section centre"><button class="bouton principal grand" data-action="generer">' +
      (etat.plan ? '↻ Générer une nouvelle semaine' : 'Générer ma semaine') + '</button>' +
      '<p class="petit doux" style="margin-top:10px">' + dispo + ' recettes compatibles sur ' + RECETTES.length + '.</p></div>';
  }

  /* ------------------------------ bases de recettes -------------------- */
  /* Deux répertoires cohabitent : les plats du foyer et le catalogue
     d'idées. On pioche dans l'un, dans l'autre, ou dans les deux. */
  function carteSources() {
    var r = etat.reglages;
    var compte = { nous: 0, idees: 0 };
    RECETTES.forEach(function (x) { compte[x.src === 'nous' ? 'nous' : 'idees']++; });
    var actif = function (liste) {
      return r.sources.length === liste.length &&
        liste.every(function (s) { return r.sources.indexOf(s) >= 0; });
    };
    var dispo = function (liste) {
      var o = Object.assign({}, r, { sources: liste });
      return RECETTES.filter(function (x) {
        return liste.indexOf(x.src === 'nous' ? 'nous' : 'idees') >= 0 && P.eligible(x, o);
      }).length;
    };

    return '<div class="section"><div class="carte carte-p">' +
      '<h2>Dans quelle base piocher&nbsp;?</h2>' +
      '<p class="doux petit">Vos plats habituels d’un côté, les suggestions du catalogue de l’autre.</p>' +
      '<div class="puces" style="margin-top:12px">' +
      '<button type="button" class="puce" data-source="nous" aria-pressed="' + actif(['nous']) + '">' +
      '★ Nos recettes <span class="doux">(' + compte.nous + ')</span></button>' +
      '<button type="button" class="puce" data-source="idees" aria-pressed="' + actif(['idees']) + '">' +
      '💡 Idées <span class="doux">(' + compte.idees + ')</span></button>' +
      '<button type="button" class="puce" data-source="tout" aria-pressed="' + actif(['nous', 'idees']) + '">' +
      'Les deux</button>' +
      '</div>' +
      '<p class="petit doux" style="margin:12px 0 0">' +
      dispo(r.sources) + ' recette(s) compatibles avec vos contraintes dans cette sélection.' +
      (actif(['nous']) && compte.nous < 25
        ? ' Une base restreinte revient forcément plus souvent sur les mêmes plats.' : '') +
      '</p></div></div>';
  }

  /* -------------------------- plats choisis à la main ------------------- */
  function carteChoix() {
    var choisis = etat.choix
      .map(function (id) { return RECETTES.filter(function (x) { return x.id === id; })[0]; })
      .filter(Boolean);

    return '<div class="section"><div class="carte carte-p">' +
      '<h2>Plats imposés <span class="doux petit">' + choisis.length + ' / ' + etat.reglages.nbRepas + '</span></h2>' +
      '<p class="doux petit">Ces plats entrent dans la semaine quoi qu’il arrive ; le reste est complété autour d’eux.</p>' +
      (choisis.length
        ? '<div style="margin-top:12px">' + choisis.map(function (x) {
          var pr = N.profile(x);
          return '<div class="repere"><span class="pastille-etat"></span>' +
            '<span class="libelle">' + (x.src === 'nous' ? '★ ' : '') + esc(x.n) +
            '<span class="detail petit doux" style="display:block">' + esc(N.LABEL_PROT[pr.proteine]) +
            ' · ' + x.t + ' min</span></span>' +
            '<button class="icone-bouton" data-choix-retirer="' + esc(x.id) + '" aria-label="Retirer ' + esc(x.n) + '">✕</button>' +
            '</div>';
        }).join('') + '</div>' +
        (choisis.length > etat.reglages.nbRepas
          ? '<div class="alerte-bloc" style="margin-top:12px"><span>⚠️</span><div>Vous avez choisi plus de plats que de repas : les derniers ne seront pas placés.</div></div>'
          : '')
        : '<p class="petit doux" style="margin:12px 0 0">Aucun plat imposé : toute la semaine sera composée automatiquement.</p>') +
      '<div class="actions" style="margin-top:12px">' +
      '<button class="bouton" data-onglet="recettes">＋ Choisir des plats</button>' +
      (choisis.length ? '<button class="bouton mini" data-action="choix-vider">↺ Tout retirer</button>' : '') +
      '</div></div></div>';
  }

  function compteur(cle, val, min, max, unite) {
    return '<span class="compteur">' +
      '<button type="button" data-pas="-1" data-cle="' + cle + '" aria-label="Diminuer"' + (val <= min ? ' disabled' : '') + '>−</button>' +
      '<span class="val">' + val + '<small>' + esc(unite) + '</small></span>' +
      '<button type="button" data-pas="1" data-cle="' + cle + '" aria-label="Augmenter"' + (val >= max ? ' disabled' : '') + '>+</button>' +
      '</span>';
  }

  function pucesAversions(filtre) {
    var f = P.normalise(filtre);
    var liste = ING.list.filter(function (i) {
      if (i.pl || i.ct === 'epice' || i.ct === 'condiment') return false;
      if (etat.reglages.exclusions.indexOf(i.id) >= 0) return true;
      return f ? P.normalise(i.n).indexOf(f) >= 0 : false;
    });
    if (!f && !liste.length) return '<span class="petit doux">Aucun aliment exclu pour le moment.</span>';
    return liste.slice(0, 24).map(function (i) {
      return '<button type="button" class="puce" data-aversion="' + i.id + '" aria-pressed="' +
        (etat.reglages.exclusions.indexOf(i.id) >= 0) + '">' + esc(i.n) + '</button>';
    }).join('') || '<span class="petit doux">Aucun résultat.</span>';
  }

  /* ------------------------------------------------------- onglet Semaine */
  function vueSemaine() {
    if (!etat.plan) return vueVide();
    var plan = etat.plan, note = plan.note || { stats: {}, alertes: [] }, st = note.stats || {};
    var obj = plan.objectifs || P.objectifs(plan.repas.length, plan.options || {});

    var repas = plan.repas.map(function (r) {
      var p = N.profile(r.recette);
      var eq = p.equilibre;
      return '<article class="carte repas-carte' + (r.verrouille ? ' verrouille' : '') + '">' +
        '<div class="repas-jour"><b>' + (r.index + 1) + '</b><span>' + esc((JOURS[r.index] || '').slice(0, 3)) + '</span></div>' +
        '<div class="repas-corps">' +
        '<h3><button data-recette="' + esc(r.id) + '">' +
        (r.recette.src === 'nous' ? '★ ' : '') + esc(r.recette.n) + '</button></h3>' +
        '<div class="tags" style="margin-bottom:8px">' +
        '<span class="tag' + (r.recette.src === 'nous' ? ' vert' : '') + '">' +
        (r.recette.src === 'nous' ? 'Nos recettes' : 'Idée') + '</span>' +
        '<span class="tag vert">' + esc(N.LABEL_PROT[p.proteine]) + '</span>' +
        (p.feculent ? '<span class="tag">' + esc(p.feculentBase) + '</span>' : '') +
        '<span class="tag">' + esc(r.recette.cu) + '</span>' +
        '<span class="tag">⏱ ' + r.recette.t + ' min</span>' +
        '<span class="tag' + (p.legumesG >= 200 ? ' vert' : ' orange') + '">🥗 ' + p.legumesG + ' g de légumes</span>' +
        '<span class="tag">' + p.nutrition.kcal + ' kcal</span>' +
        '<span class="tag contour">' + eq.score + '/' + eq.sur + ' repères</span>' +
        '</div>' +
        '<div class="petit doux">Pour <b>' + r.convives + '</b> ' + (r.convives > 1 ? 'personnes' : 'personne') + ' · ' +
        eur(p.cost * r.convives) + ' estimés</div>' +
        '<div class="actions" style="margin-top:9px">' +
        '<span class="compteur" style="transform:scale(.82);transform-origin:left">' +
        '<button type="button" data-convives="-1" data-index="' + r.index + '" aria-label="Moins de convives">−</button>' +
        '<span class="val">' + r.convives + '<small>pers.</small></span>' +
        '<button type="button" data-convives="1" data-index="' + r.index + '" aria-label="Plus de convives">+</button>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div class="repas-outils">' +
        '<button class="icone-bouton" data-verrou="' + r.index + '" aria-pressed="' + r.verrouille + '" ' +
        'title="' + (r.verrouille ? 'Déverrouiller ce repas' : 'Garder ce repas lors des prochains tirages') + '">' +
        (r.verrouille ? '🔒' : '🔓') + '</button>' +
        '<button class="icone-bouton" data-remplacer="' + r.index + '" title="Remplacer ce repas">↻</button>' +
        '<button class="icone-bouton" data-recette="' + esc(r.id) + '" title="Voir la recette">👁</button>' +
        '</div>' +
        '</article>';
    }).join('');

    var reperes = [
      { l: 'Repas de poisson', v: st.poisson, c: obj.poissonMin, ok: st.poisson >= obj.poissonMin, s: '≥ ' + obj.poissonMin },
      { l: 'dont poisson gras', v: st.poissonGras, ok: obj.poissonGrasMin === 0 || st.poissonGras >= obj.poissonGrasMin, s: '≥ ' + obj.poissonGrasMin },
      { l: 'Repas végétariens', v: st.vegetarien, ok: st.vegetarien >= obj.vegetarienMin, s: '≥ ' + obj.vegetarienMin },
      { l: 'Repas de viande rouge', v: st.viandeRouge, ok: st.viandeRouge <= obj.viandeRougeMax, s: '≤ ' + obj.viandeRougeMax },
      { l: 'Légumes par repas', v: st.legumesMoyen + ' g', ok: st.legumesMoyen >= 200, s: '≥ 200 g' },
      { l: 'Protéines par portion', v: st.protMoyen + ' g', ok: st.protMoyen >= 20, s: '≥ 20 g' },
      { l: 'Fibres par portion', v: st.fibresMoyen + ' g', ok: st.fibresMoyen >= 8, s: '≥ 8 g' },
      { l: 'Énergie par portion', v: st.kcalMoyen + ' kcal', ok: st.kcalMoyen >= 500 && st.kcalMoyen <= 850, s: '500–850' }
    ];

    var bases = Object.keys(st.bases || {}).filter(function (b) { return b !== 'aucun'; })
      .map(function (b) { return '<span class="tag">' + esc(b) + ' × ' + st.bases[b] + '</span>'; }).join('');

    return '' +
      (plan.message ? '<div class="alerte-bloc" style="margin:18px 0"><span>ℹ️</span><div>' + esc(plan.message) + '</div></div>' : '') +
      '<div class="section">' +
      '<div class="titre-section"><h2>Les repas</h2>' +
      '<span class="petit doux">Verrouillez ceux que vous gardez, remplacez les autres.</span></div>' +
      '<div class="repas">' + repas + '</div>' +
      '<div class="actions" style="margin-top:14px">' +
      '<button class="bouton" data-action="regenerer">↻ Regénérer la semaine</button>' +
      '<button class="bouton" data-onglet="planifier">⚙️ Modifier les critères</button>' +
      '<button class="bouton principal" data-onglet="courses">🛒 Liste de courses</button>' +
      '</div></div>' +

      '<div class="section"><div class="carte carte-p">' +
      '<h2>Équilibre de la semaine</h2>' +
      '<p class="doux petit">Repères du Programme national nutrition santé, ramenés à ' + plan.repas.length + ' repas.</p>' +
      '<div class="stats-ligne" style="margin:16px 0 20px">' +
      '<div class="stat"><b>' + st.kcalMoyen + '</b><span>kcal / portion</span></div>' +
      '<div class="stat"><b>' + st.protMoyen + ' g</b><span>protéines / portion</span></div>' +
      '<div class="stat"><b>' + st.legumesMoyen + ' g</b><span>légumes / repas</span></div>' +
      '<div class="stat"><b>' + eur(st.coutPortion) + '</b><span>par portion</span></div>' +
      '</div>' +
      reperes.map(function (x) {
        return '<div class="repere' + (x.ok ? '' : ' ko') + '"><span class="pastille-etat"></span>' +
          '<span class="libelle">' + esc(x.l) + '</span>' +
          '<span class="petit doux">' + esc(x.s) + '</span>' +
          '<span class="valeur">' + esc(x.v) + '</span></div>';
      }).join('') +
      (bases ? '<div style="margin-top:14px"><div class="petit doux" style="margin-bottom:6px">Rotation des féculents</div><div class="tags">' + bases + '</div></div>' : '') +
      ((note.alertes || []).length
        ? '<div style="margin-top:16px;display:grid;gap:8px">' + note.alertes.map(function (a) {
          return '<div class="alerte-bloc"><span>⚠️</span><div>' + esc(a.m) + '</div></div>';
        }).join('') + '</div>'
        : '<div class="alerte-bloc info" style="margin-top:16px"><span>✅</span><div>Tous les repères d’équilibre sont respectés sur la semaine.</div></div>') +
      '</div></div>';
  }

  function vueVide() {
    return '<div class="vide"><span class="emoji">🍲</span>' +
      '<h2>Aucune semaine générée</h2>' +
      '<p>Définissez vos critères, puis lancez la génération.</p>' +
      '<button class="bouton principal" data-onglet="planifier">Commencer</button></div>';
  }

  /* ------------------------------------------------------- onglet Courses */
  function vueCourses() {
    if (!etat.plan) return vueVide();
    var l = S.build(etat.plan, { placardPossede: etat.possede });

    function bloc(rayons, placard) {
      return rayons.map(function (r) {
        return '<div class="rayon"><h3><span aria-hidden="true">' + (ICONES[r.icon] || '•') + '</span>' +
          esc(r.n) + '<span class="nb">' + r.items.length + '</span></h3>' +
          r.items.map(function (i) {
            var coche = placard ? !!etat.possede[i.id] : !!etat.coches[i.id];
            return '<label class="article' + (coche ? ' coche' : '') + '">' +
              '<input type="checkbox" ' + (coche ? 'checked' : '') + ' data-' + (placard ? 'possede' : 'coche') + '="' + esc(i.id) + '">' +
              '<span><span class="nom">' + esc(i.n) + '</span>' +
              (i.nbRepas > 1 ? '<span class="detail"> · ' + i.nbRepas + ' repas</span>' : '') +
              '<span class="detail" style="display:block">' + esc(i.repas.join(' · ')) + '</span></span>' +
              '<span class="qte"><b>' + esc(i.texte) + '</b>' +
              '<span class="detail">' + eur(placard ? (i.coutRachat || 0) : i.cout) + '</span></span>' +
              '</label>';
          }).join('') + '</div>';
      }).join('');
    }

    return '' +
      '<div class="section">' +
      '<div class="titre-section"><h2>Liste de courses</h2>' +
      '<span class="petit doux">' + etat.plan.repas.length + ' repas · ' + l.portions + ' portions</span></div>' +

      '<div class="carte carte-p" style="margin-bottom:18px">' +
      '<div class="stats-ligne">' +
      '<div class="stat"><b>' + l.nbArticles + '</b><span>articles à acheter</span></div>' +
      '<div class="stat"><b>' + eur(l.cout) + '</b><span>budget estimé</span></div>' +
      '<div class="stat"><b>' + eur(l.coutPortion) + '</b><span>par portion</span></div>' +
      '<div class="stat"><b>' + l.mutualises + '</b><span>produits mutualisés</span></div>' +
      '</div>' +
      '<p class="petit doux" style="margin:14px 0 0">Les quantités sont additionnées sur toute la semaine, converties en conditionnements du commerce et rangées dans l’ordre des rayons. Les prix sont indicatifs.' +
      (l.coutPlacard > 0 ? ' Comptez <b>' + eur(l.coutPlacard) + '</b> de plus si vous devez racheter les ' + l.nbPlacardARacheter + ' produits de placard non cochés.' : '') + '</p>' +
      '<div class="actions" style="margin-top:14px">' +
      '<button class="bouton mini" data-action="copier">📋 Copier</button>' +
      '<button class="bouton mini" data-action="telecharger">⬇️ Télécharger</button>' +
      '<button class="bouton mini" data-action="imprimer">🖨 Imprimer</button>' +
      '<button class="bouton mini" data-action="decocher">↺ Tout décocher</button>' +
      '</div></div>' +

      carteRappels(l) +

      bloc(l.rayons, false) +

      (l.placardRayons.length ? '<div class="carte carte-p" style="margin-top:22px">' +
        '<h3>À vérifier dans vos placards</h3>' +
        '<p class="petit doux">Épices, huiles, farine… Cochez ce que vous avez déjà. ' +
        (l.coutPlacard > 0
          ? 'Racheter les <b>' + l.nbPlacardARacheter + '</b> produits restants coûterait environ <b>' + eur(l.coutPlacard) + '</b>.'
          : 'Vous avez tout : rien à ajouter au budget.') + '</p>' +
        bloc(l.placardRayons, true) + '</div>' : '') +

      (l.restes.length ? '<div class="carte carte-p" style="margin-top:18px">' +
        '<h3>🌱 Anti-gaspi</h3>' +
        '<p class="petit doux">Ces produits s’achètent par conditionnement : il vous restera de quoi cuisiner autre chose.</p>' +
        '<div class="tags">' + l.restes.map(function (r) {
          return '<span class="tag orange">' + esc(r.n) + ' · ' + esc(r.reste) + ' restants</span>';
        }).join('') + '</div></div>' : '') +

      '<div class="carte carte-p no-print" style="margin-top:18px">' +
      '<h3>Menus correspondants</h3>' +
      etat.plan.repas.map(function (r) {
        return '<div class="repere"><span class="libelle">' + (r.index + 1) + '. ' +
          esc(r.recette.n) + '</span><span class="valeur">' + r.convives + ' pers.</span></div>';
      }).join('') + '</div>';
  }

  /* ------------------------------------------------------ onglet Recettes */
  function vueRecettes() {
    var q = P.normalise(etat.recherche);
    var familles = [['', 'Toutes'], ['viande_blanche', 'Viande blanche'], ['viande_rouge', 'Viande rouge'],
    ['poisson', 'Poisson & fruits de mer'], ['vegetarien', 'Végétarien']];
    var sources = [['', 'Les deux'], ['nous', '★ Nos recettes'], ['idees', '💡 Idées']];
    var compte = { nous: 0, idees: 0 };
    RECETTES.forEach(function (x) { compte[x.src === 'nous' ? 'nous' : 'idees']++; });

    var liste = RECETTES.filter(function (r) {
      var src = r.src === 'nous' ? 'nous' : 'idees';
      if (etat.filtreSource && src !== etat.filtreSource) return false;
      var p = N.profile(r);
      if (etat.filtreFamille && N.familleProt(p.proteine) !== etat.filtreFamille) return false;
      if (!q) return true;
      var ingredients = Object.keys(p.ids).map(function (id) {
        return ING.byId[id] ? ING.byId[id].n : '';
      }).join(' ');
      return tousLesMots(etat.recherche, r.n + ' ' + r.cu + ' ' + (r.tags || []).join(' ') + ' ' + ingredients);
    });

    return '<div class="section">' +
      '<div class="titre-section"><h2>Les recettes</h2>' +
      '<span class="petit doux">' + liste.length + ' affichée(s) sur ' + RECETTES.length +
      ' · ' + compte.nous + ' à nous, ' + compte.idees + ' idées</span></div>' +

      (etat.choix.length
        ? '<div class="alerte-bloc info" style="margin-bottom:14px"><span>📌</span><div>' +
        '<b>' + etat.choix.length + '</b> plat(s) imposé(s) pour la prochaine semaine. ' +
        '<button class="bouton mini" data-onglet="planifier">Voir mes choix</button></div></div>'
        : '') +

      '<div class="actions" style="margin-bottom:14px">' +
      '<button class="bouton principal" data-action="ed-nouvelle">➕ Créer une recette</button>' +
      '<button class="bouton mini" data-action="perso-importer">⬆️ Importer</button>' +
      (C.recettes().length ? '<button class="bouton mini" data-action="perso-exporter">⬇️ Exporter mes recettes</button>' : '') +
      '</div>' +
      '<input type="file" id="fichierImport" accept="application/json,.json" hidden>' +

      '<input type="text" id="recherche" value="' + esc(etat.recherche) + '" placeholder="Rechercher un plat, un ingrédient, une cuisine…" autocomplete="off">' +
      '<div class="puces" style="margin:12px 0 8px">' +
      sources.map(function (s) {
        return '<button type="button" class="puce" data-filtre-source="' + s[0] + '" aria-pressed="' + (etat.filtreSource === s[0]) + '">' + esc(s[1]) + '</button>';
      }).join('') + '</div>' +
      '<div class="puces" style="margin:0 0 18px">' +
      familles.map(function (f) {
        return '<button type="button" class="puce" data-famille="' + f[0] + '" aria-pressed="' + (etat.filtreFamille === f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '</div>' +

      (liste.length ? '<div class="liste-recettes">' + liste.map(ficheRecette).join('') + '</div>'
        : '<div class="vide"><span class="emoji">🔍</span><p>Aucune recette ne correspond à cette recherche.</p>' +
        '<button class="bouton principal" data-action="ed-nouvelle">➕ Créer cette recette</button></div>') +
      '</div>';
  }

  /* Une fiche porte deux actions distinctes : l'ouvrir, ou l'imposer dans la
     semaine. D'où deux boutons côte à côte plutôt qu'un bouton imbriqué. */
  function ficheRecette(r) {
    var p = N.profile(r);
    var choisi = etat.choix.indexOf(r.id) >= 0;
    return '<div class="carte fiche' + (choisi ? ' fiche-choisie' : '') + '">' +
      '<button class="fiche-ouvrir" data-recette="' + esc(r.id) + '">' +
      '<h3>' + (r.src === 'nous' ? '★ ' : '') + esc(r.n) + '</h3>' +
      '<div class="tags"><span class="tag vert">' + esc(N.LABEL_PROT[p.proteine]) + '</span>' +
      '<span class="tag">' + esc(r.cu) + '</span>' +
      '<span class="tag">⏱ ' + r.t + ' min</span>' +
      '<span class="tag">' + p.nutrition.kcal + ' kcal</span>' +
      (r.perso && C.incomplete(r) ? '<span class="tag orange">analyse incomplète</span>' : '') + '</div>' +
      '</button>' +
      '<button class="fiche-choix" data-choix="' + esc(r.id) + '" aria-pressed="' + choisi + '" ' +
      'title="' + (choisi ? 'Retirer de la semaine' : 'Imposer ce plat dans la semaine') + '">' +
      (choisi ? '📌' : '＋') + '</button>' +
      '</div>';
  }

  /* ---------------------------------------------- envoi vers l'app Rappels */
  /* Apple n'expose aucun moyen d'écrire directement dans Rappels depuis une
     page web. Deux chemins existent, présentés dans cet ordre :
       1. copier puis coller dans la liste — aucune installation ;
       2. un raccourci qui découpe le texte ligne par ligne — à créer une
          fois, ensuite c'est un seul geste.
     Le second échoue tant que le raccourci n'existe pas, et iOS affiche
     alors « Le fichier n'existe pas » : la marche à suivre reste donc
     dépliée tant que l'utilisateur n'a pas confirmé l'avoir créé. */
  function carteRappels(l) {
    var r = etat.reglages;
    var lignes = S.lignesArticles(l, { rayons: r.rappelsRayons, placard: r.rappelsPlacard, coches: etat.coches });
    var pret = !!r.rappelsRaccourciPret;
    var liste = (r.rappelsListe || '').trim() || 'Courses';
    var partageDispo = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

    return '<div class="carte carte-p no-print" style="margin-bottom:18px">' +
      '<h3>📱 Envoyer vers l’app Rappels</h3>' +
      '<p class="petit doux">' + lignes.length + ' article(s) à envoyer — les articles déjà cochés sont omis.</p>' +

      '<div class="champ"><span class="lib">Contenu</span><div class="puces">' +
      '<button type="button" class="puce" data-rappels-opt="rayons" aria-pressed="' + !!r.rappelsRayons + '">Préfixer par le rayon</button>' +
      '<button type="button" class="puce" data-rappels-opt="placard" aria-pressed="' + !!r.rappelsPlacard + '">Inclure les produits de placard</button>' +
      '</div></div>' +

      '<label class="champ"><span class="lib">Nom de votre liste dans Rappels</span>' +
      '<input type="text" id="nomListeRappels" value="' + esc(r.rappelsListe) + '" placeholder="Liste de courses" autocomplete="off"></label>' +

      /* ------------------------- méthode sans installation --------------- */
      '<div class="methode">' +
      '<h4>Copier-coller <span class="tag vert">rien à installer</span></h4>' +
      '<div class="actions" style="margin-bottom:10px">' +
      '<button class="bouton principal" data-action="rappels-copier">📋 Copier les ' + lignes.length + ' lignes</button>' +
      (partageDispo ? '<button class="bouton" data-action="rappels-partager">↗ Partager…</button>' : '') +
      '</div>' +
      '<ol class="petit" style="padding-left:20px;margin:0">' +
      '<li>Touchez <b>Copier</b> ci-dessus.</li>' +
      '<li>Ouvrez <b>Rappels</b> et votre liste <b>' + esc(liste) + '</b>.</li>' +
      '<li>Touchez la zone vide sous le dernier rappel, puis <b>Coller</b> : Rappels crée un rappel par ligne.</li>' +
      '</ol>' +
      '<p class="petit doux" style="margin:8px 0 0">Si votre version de Rappels colle tout dans un seul rappel, passez par la méthode ci-dessous.</p>' +
      '</div>' +

      /* --------------------------- méthode automatique ------------------- */
      '<div class="methode">' +
      '<h4>Envoi automatique ' +
      (pret ? '<span class="tag vert">raccourci prêt</span>' : '<span class="tag orange">raccourci à créer, une fois</span>') + '</h4>' +
      '<div class="actions" style="margin-bottom:10px">' +
      '<button class="bouton' + (pret ? ' principal' : '') + '" data-action="rappels-raccourci">⚡️ Envoyer via Raccourcis</button>' +
      '</div>' +

      '<details' + (pret ? '' : ' open') + ' id="aideRaccourci">' +
      '<summary class="petit" style="cursor:pointer"><b>Créer le raccourci (2 minutes, une seule fois)</b></summary>' +
      '<div class="petit" style="margin-top:10px">' +
      '<p style="margin:0 0 8px">Sans cette étape, iOS répond <i>« Le fichier n’existe pas »</i> : il cherche un raccourci qui n’a pas encore été créé.</p>' +
      '<ol style="padding-left:20px;margin:0 0 12px">' +
      '<li>Ouvrez l’app <b>Raccourcis</b>, onglet <b>Bibliothèque</b>, puis <b>+</b> en haut à droite.</li>' +
      '<li>Touchez <b>Ajouter une action</b>, cherchez <b>Diviser le texte</b> et ajoutez-la. Réglez <i>Séparateur</i> sur <b>Nouvelles lignes</b> ; laissez l’entrée sur <i>Entrée du raccourci</i>.</li>' +
      '<li>Ajoutez <b>Répéter pour chaque élément</b> : elle prend automatiquement le résultat de la division.</li>' +
      '<li><b>À l’intérieur</b> de la boucle, ajoutez <b>Ajouter un nouveau rappel</b>. Mettez <i>Élément de répétition</i> comme titre et choisissez la liste <b>' + esc(liste) + '</b>.</li>' +
      '<li>Touchez le nom du raccourci en haut, puis <b>Renommer</b>, et saisissez exactement :</li>' +
      '</ol>' +
      '<label class="champ" style="margin-bottom:10px"><span class="lib">Nom exact du raccourci</span>' +
      '<input type="text" id="nomRaccourci" value="' + esc(r.rappelsRaccourci) + '" autocomplete="off"></label>' +
      '<div class="actions">' +
      '<button class="bouton mini" data-action="rappels-pret">' + (pret ? '↺ Je ne l’ai plus' : '✓ C’est fait, j’ai créé le raccourci') + '</button>' +
      '</div>' +
      '<p class="doux" style="margin:10px 0 0">Ce bouton n’a d’effet que sur un iPhone, un iPad ou un Mac : l’app Raccourcis n’existe pas ailleurs.</p>' +
      '</div></details></div></div>';
  }

  /* --------------------------------------------------------------- modale */
  function ouvrirRecette(id) {
    var r = RECETTES.filter(function (x) { return x.id === id; })[0];
    if (!r) return;
    var p = N.profile(r);
    var auPlan = etat.plan ? etat.plan.repas.filter(function (x) { return x.id === id; })[0] : null;
    var convives = auPlan ? auPlan.convives : etat.reglages.convives;

    var ingredients = r.i.map(function (line) {
      var ing = ING.byId[line[0]];
      if (!ing) return '';
      return '<li><span>' + esc(ing.n) + '</span><span class="q">' +
        esc(S.formatQte(Math.round(line[1] * convives * 100) / 100, ing)) + '</span></li>';
    }).join('');

    var nut = p.nutrition;
    var modale = '<div class="voile" data-fermer="1"><div class="modale" role="dialog" aria-modal="true" aria-label="' + esc(r.n) + '">' +
      '<div class="modale-tete"><div style="flex:1">' +
      '<h2 style="margin-bottom:6px">' + esc(r.n) + '</h2>' +
      '<div class="tags"><span class="tag vert">' + esc(N.LABEL_PROT[p.proteine]) + '</span>' +
      '<span class="tag">' + esc(r.cu) + '</span>' +
      '<span class="tag">⏱ ' + r.t + ' min</span>' +
      '<span class="tag">' + ['Très simple', 'Simple', 'Intermédiaire'][r.d - 1] + '</span>' +
      (r.s ? '<span class="tag">' + esc(r.s.join(', ')) + '</span>' : '<span class="tag">toute l’année</span>') +
      '</div></div>' +
      '<button class="fermer" data-fermer="1" aria-label="Fermer">✕</button></div>' +
      '<div class="modale-corps">' +

      '<h3>Ingrédients <span class="petit doux">pour ' + convives + ' ' + (convives > 1 ? 'personnes' : 'personne') + '</span></h3>' +
      '<ul class="ingredients">' + ingredients + '</ul>' +

      '<h3 style="margin-top:22px">Préparation</h3>' +
      '<ol class="etapes">' + r.e.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ol>' +

      '<h3 style="margin-top:22px">Par portion</h3>' +
      '<table class="nutri"><tbody>' +
      '<tr><th>Énergie</th><td>' + nut.kcal + ' kcal</td></tr>' +
      '<tr><th>Protéines</th><td>' + nut.p + ' g</td></tr>' +
      '<tr><th>Glucides</th><td>' + nut.c + ' g</td></tr>' +
      '<tr><th>Lipides</th><td>' + nut.l + ' g</td></tr>' +
      '<tr><th>Fibres</th><td>' + nut.f + ' g</td></tr>' +
      '<tr><th>Légumes</th><td>' + p.legumesG + ' g</td></tr>' +
      '<tr><th>Coût estimé</th><td>' + eur(p.cost) + ' / portion</td></tr>' +
      '</tbody></table>' +

      '<h3 style="margin-top:22px">Repères d’équilibre</h3>' +
      p.equilibre.points.map(function (x) {
        return '<div class="repere' + (x.ok ? '' : ' ko') + '"><span class="pastille-etat"></span>' +
          '<span class="libelle">' + esc(x.k) + '</span><span class="petit doux">' + esc(x.cible) + '</span>' +
          '<span class="valeur">' + esc(x.v) + '</span></div>';
      }).join('') +

      (p.allergenes.length ? '<p class="petit doux" style="margin-top:16px">Allergènes : ' +
        esc(listeAllergenes(p.allergenes)) + '</p>' : '') +

      '<div class="actions" style="margin-top:20px">' +
      (auPlan
        ? '<button class="bouton" data-remplacer="' + auPlan.index + '" data-fermer="1">↻ Remplacer ce repas</button>'
        : (etat.plan ? '<button class="bouton principal" data-ajouter="' + esc(r.id) + '">+ Ajouter à ma semaine</button>' : '')) +
      '<button class="bouton' + (etat.choix.indexOf(r.id) >= 0 ? '' : ' principal') + '" data-choix="' + esc(r.id) + '">' +
      (etat.choix.indexOf(r.id) >= 0 ? '📌 Retirer de ma semaine' : '＋ Imposer dans ma semaine') + '</button>' +
      (r.perso
        ? '<button class="bouton" data-ed-modifier="' + esc(r.id) + '">✎ Modifier</button>'
        : '<button class="bouton" data-ed-dupliquer="' + esc(r.id) + '">⧉ Adapter à ma façon</button>') +
      '<button class="bouton" data-fermer="1">Fermer</button>' +
      '</div></div></div></div>';

    var hote = document.createElement('div');
    hote.id = 'modale';
    hote.innerHTML = modale;
    document.body.appendChild(hote);
    document.body.style.overflow = 'hidden';
  }

  function fermerModale() {
    var m = document.getElementById('modale');
    if (m) m.remove();
    document.body.style.overflow = '';
  }


  /* ====================== CRÉATION / ÉDITION DE RECETTE ================== */

  /* Quantité de départ proposée quand on ajoute un ingrédient : le bon ordre
     de grandeur évite d'avoir à tout saisir à partir de zéro. */
  function quantiteParDefaut(ing, base) {
    var parPersonne;
    if (ing.u === 'pc') parPersonne = (ing.pc || 0) >= 80 ? 0.5 : (ing.ct === 'oeuf' ? 2 : 1);
    else if (ing.ct === 'viande_rouge' || ing.ct === 'viande_blanche') parPersonne = 140;
    else if (ing.ct === 'poisson_gras' || ing.ct === 'poisson_blanc' || ing.ct === 'fruits_mer') parPersonne = 150;
    else if (ing.ct === 'feculent') parPersonne = 80;
    else if (ing.ct === 'legumineuse') parPersonne = 100;
    else if (ing.ct === 'legume') parPersonne = 150;
    else if (ing.ct === 'fromage') parPersonne = 30;
    else if (ing.ct === 'laitage') parPersonne = 50;
    else if (ing.ct === 'matiere_grasse') parPersonne = 8;
    else if (ing.ct === 'epice') parPersonne = 3;
    else if (ing.ct === 'aromate') parPersonne = 5;
    else if (ing.ct === 'oleagineux') parPersonne = 15;
    else parPersonne = 50;
    var q = parPersonne * base;
    return ing.u === 'pc' ? Math.round(q * 4) / 4 : Math.round(q);
  }

  function editeurVide() {
    return { id: null, n: '', cu: '', tags: '', t: 30, d: 1, s: [], base: 4, i: [], e: '', rechIng: '', nouvelIng: null };
  }

  /* Charge une recette existante dans le formulaire. Les quantités, stockées
     par personne, sont ramenées à la base de saisie choisie. */
  function editeurDepuis(recette, base) {
    base = base || 4;
    return {
      id: recette.id, n: recette.n, cu: recette.cu, tags: (recette.tags || []).join(', '),
      t: recette.t, d: recette.d, s: (recette.s || []).slice(), base: base,
      i: recette.i.map(function (l) { return [l[0], Math.round(l[1] * base * 1000) / 1000]; }),
      e: (recette.e || []).join('\n'), rechIng: '', nouvelIng: null
    };
  }

  /* Recette provisoire, en quantités par personne, pour l'aperçu en direct. */
  function recetteProvisoire(ed) {
    return {
      id: ed.id || '_apercu', n: ed.n || 'Nouvelle recette', cu: ed.cu || 'Maison',
      tags: [], t: ed.t, d: ed.d,
      i: ed.i.filter(function (l) { return l[1] > 0; })
        .map(function (l) { return [l[0], l[1] / (ed.base || 1)]; }),
      e: []
    };
  }

  function vueEditeur() {
    var ed = etat.editeur;
    var cuisines = {};
    RECETTES.forEach(function (r) { cuisines[r.cu] = 1; });

    return '<div class="section">' +
      '<div class="titre-section"><h2>' + (ed.id ? 'Modifier la recette' : 'Nouvelle recette') + '</h2>' +
      '<span class="petit doux">Vos recettes rejoignent les 200 autres et entrent dans la génération des semaines.</span></div>' +

      '<div class="grille grille-2">' +

      /* ------------------------------ colonne saisie ------------------- */
      '<div>' +
      '<div class="carte carte-p" style="margin-bottom:16px">' +
      '<label class="champ"><span class="lib">Nom du plat</span>' +
      '<input type="text" id="edNom" value="' + esc(ed.n) + '" placeholder="ex. Gratin de courgettes de mamie" autocomplete="off"></label>' +

      '<div class="grille grille-2">' +
      '<label class="champ"><span class="lib">Type de cuisine</span>' +
      '<input type="text" id="edCuisine" list="listeCuisines" value="' + esc(ed.cu) + '" placeholder="France, Italie, Maison…" autocomplete="off">' +
      '<datalist id="listeCuisines">' + Object.keys(cuisines).sort().map(function (c) {
        return '<option value="' + esc(c) + '">';
      }).join('') + '</datalist></label>' +
      '<label class="champ"><span class="lib">Temps total (minutes)</span>' +
      '<input type="number" id="edTemps" min="1" max="600" value="' + ed.t + '"></label>' +
      '</div>' +

      '<div class="champ"><span class="lib">Difficulté</span><div class="puces">' +
      ['Très simple', 'Simple', 'Intermédiaire'].map(function (n, k) {
        return '<button type="button" class="puce" data-ed-diff="' + (k + 1) + '" aria-pressed="' + (ed.d === k + 1) + '">' + n + '</button>';
      }).join('') + '</div></div>' +

      '<div class="champ"><span class="lib">Saisons</span>' +
      '<span class="aide">Aucune sélection = plat de toute l’année.</span><div class="puces">' +
      P.SAISONS.map(function (s) {
        return '<button type="button" class="puce" data-ed-saison="' + esc(s) + '" aria-pressed="' + (ed.s.indexOf(s) >= 0) + '">' + esc(s) + '</button>';
      }).join('') + '</div></div>' +

      '<label class="champ" style="margin-bottom:0"><span class="lib">Mots-clés</span>' +
      '<span class="aide">Séparés par des virgules. Ils servent à retrouver le plat et à répondre aux envies.</span>' +
      '<input type="text" id="edTags" value="' + esc(ed.tags) + '" placeholder="gratin, réconfortant, été" autocomplete="off"></label>' +
      '</div>' +

      /* ------------------------------ ingrédients ---------------------- */
      '<div class="carte carte-p" style="margin-bottom:16px">' +
      '<h3>Ingrédients</h3>' +
      '<div class="champ"><span class="lib">Je saisis les quantités pour</span>' +
      compteurEditeur(ed.base) + '</div>' +

      '<label class="champ"><span class="lib">Ajouter un ingrédient</span>' +
      '<input type="text" id="edRechIng" value="' + esc(ed.rechIng) + '" placeholder="Tapez les premières lettres…" autocomplete="off"></label>' +
      '<div id="edResultats">' + resultatsIngredients(ed.rechIng) + '</div>' +

      '<div id="edLignes">' + lignesIngredients(ed) + '</div>' +
      '</div>' +

      (ed.nouvelIng ? formulaireIngredient(ed.nouvelIng) : '') +

      /* ------------------------------ étapes --------------------------- */
      '<div class="carte carte-p">' +
      '<label class="champ" style="margin-bottom:0"><span class="lib">Préparation</span>' +
      '<span class="aide">Une étape par ligne.</span>' +
      '<textarea id="edEtapes" rows="7" placeholder="Émincer les oignons.&#10;Faire revenir 5 min.&#10;Enfourner 25 min à 190 °C."></textarea></label>' +
      '</div>' +
      '</div>' +

      /* ------------------------------ colonne aperçu ------------------- */
      '<div><div id="edAnalyse">' + analyseEditeur(ed) + '</div></div>' +
      '</div>' +

      '<div class="actions" style="margin-top:18px">' +
      '<button class="bouton principal" data-action="ed-enregistrer">' + (ed.id ? 'Enregistrer les modifications' : 'Créer la recette') + '</button>' +
      '<button class="bouton" data-action="ed-annuler">Annuler</button>' +
      (ed.id && C.estPerso(ed.id) ? '<button class="bouton" data-action="ed-supprimer">🗑 Supprimer</button>' : '') +
      (ed.id && C.estPerso(ed.id) ? '<button class="bouton" data-action="ed-source">⧉ Copier le code source</button>' : '') +
      '</div>' +
      '<p class="petit doux" style="margin-top:10px">Les quantités sont enregistrées <b>par personne</b> : la recette s’adapte ensuite automatiquement au nombre de convives de chaque repas.</p>' +
      '</div>';
  }

  function compteurEditeur(base) {
    return '<span class="compteur">' +
      '<button type="button" data-ed-base="-1" aria-label="Moins"' + (base <= 1 ? ' disabled' : '') + '>−</button>' +
      '<span class="val">' + base + '<small>' + (base > 1 ? 'personnes' : 'personne') + '</small></span>' +
      '<button type="button" data-ed-base="1" aria-label="Plus"' + (base >= 12 ? ' disabled' : '') + '>+</button>' +
      '</span>';
  }

  function resultatsIngredients(q) {
    var texte = P.normalise(q);
    if (texte.length < 2) {
      return '<p class="petit doux" style="margin:0 0 12px">' + ING.list.length + ' ingrédients disponibles. ' +
        '<button type="button" class="bouton mini" data-action="ed-nouvel-ingredient">+ Créer un ingrédient</button></p>';
    }
    var trouves = ING.list.map(function (i) {
      var nom = P.normalise(i.n);
      var pos = nom.indexOf(texte);
      if (pos < 0) {
        /* Recherche en plusieurs mots : « creme legere » doit trouver
           « Crème liquide légère ». */
        if (!tousLesMots(q, i.n)) return null;
        return { i: i, rang: 3, taille: nom.length };
      }
      /* 0 : le nom commence par la recherche — 1 : un mot commence par elle
         — 2 : simple occurrence au milieu d'un mot. */
      var rang = pos === 0 ? 0 : (nom.charAt(pos - 1) === ' ' ? 1 : 2);
      return { i: i, rang: rang, taille: nom.length };
    }).filter(Boolean).sort(function (x, y) {
      return x.rang - y.rang || x.taille - y.taille || x.i.n.localeCompare(y.i.n, 'fr');
    }).slice(0, 10).map(function (x) { return x.i; });
    if (!trouves.length) {
      return '<div class="alerte-bloc" style="margin-bottom:12px"><span>🔍</span><div>' +
        'Aucun ingrédient ne correspond à « ' + esc(q) +' ». ' +
        '<button type="button" class="bouton mini" data-action="ed-nouvel-ingredient">+ Le créer</button></div></div>';
    }
    return '<div class="puces" style="margin-bottom:12px">' + trouves.map(function (i) {
      var deja = etat.editeur.i.some(function (l) { return l[0] === i.id; });
      return '<button type="button" class="puce" data-ed-ajout="' + esc(i.id) + '"' + (deja ? ' disabled' : '') + '>' +
        (deja ? '✓ ' : '+ ') + esc(i.n) + '</button>';
    }).join('') + '<button type="button" class="puce" data-action="ed-nouvel-ingredient">+ Autre…</button></div>';
  }

  function lignesIngredients(ed) {
    if (!ed.i.length) {
      return '<p class="petit doux">Aucun ingrédient pour l’instant. Cherchez-en un ci-dessus.</p>';
    }
    return '<ul class="ingredients">' + ed.i.map(function (l, k) {
      var ing = ING.byId[l[0]];
      if (!ing) return '';
      var unite = ing.u === 'pc' ? (ing.up || 'pièce') : ing.u;
      var parPers = ed.base ? Math.round((l[1] / ed.base) * 100) / 100 : l[1];
      var uniteAccordee = ing.u === 'pc' ? S.plurielUnite(ing.up || 'pièce', parPers) : ing.u;
      return '<li>' +
        '<span style="flex:1"><b>' + esc(ing.n) + '</b>' +
        (ing.perso && !ing.complet ? ' <span class="tag orange">valeurs inconnues</span>' : '') +
        '<span class="detail petit doux" style="display:block">' + S.nb(parPers) + ' ' + esc(uniteAccordee) + ' par personne</span></span>' +
        '<input type="number" class="qte-ing" data-ed-qte="' + k + '" value="' + l[1] + '" min="0" step="' + (ing.u === 'pc' ? '0.25' : '5') + '" ' +
        'style="width:90px;text-align:right" aria-label="Quantité de ' + esc(ing.n) + '">' +
        '<span class="q" style="min-width:58px">' + esc(unite) + '</span>' +
        '<button type="button" class="icone-bouton" data-ed-retirer="' + k + '" aria-label="Retirer">✕</button>' +
        '</li>';
    }).join('') + '</ul>';
  }

  /* Aperçu en direct : c'est lui qui rend la saisie compréhensible, en
     montrant immédiatement comment le moteur classera le plat. */
  function analyseEditeur(ed) {
    if (!ed.i.length) {
      return '<div class="carte carte-p"><h3>Aperçu</h3>' +
        '<p class="petit doux">Ajoutez des ingrédients : les valeurs nutritionnelles, le type de plat et la compatibilité avec les régimes se calculent au fur et à mesure.</p></div>';
    }
    var p = N.profile(recetteProvisoire(ed));
    var nut = p.nutrition;
    var regimes = [
      ['vegetarien', 'Végétarien'], ['vegetalien', 'Végétalien'], ['sansGluten', 'Sans gluten'],
      ['sansLactose', 'Sans lactose'], ['sansPorc', 'Sans porc']
    ].filter(function (r) { return p.regimes[r[0]]; });

    var manquants = ed.i.filter(function (l) {
      var ing = ING.byId[l[0]];
      return ing && ing.perso && !ing.complet;
    }).length;

    return '<div class="carte carte-p">' +
      '<h3>Aperçu par portion</h3>' +
      '<div class="stats-ligne" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px">' +
      '<div class="stat"><b>' + nut.kcal + '</b><span>kcal</span></div>' +
      '<div class="stat"><b>' + Math.round(nut.p) + ' g</b><span>protéines</span></div>' +
      '<div class="stat"><b>' + p.legumesG + ' g</b><span>légumes</span></div>' +
      '<div class="stat"><b>' + eur(p.cost) + '</b><span>par portion</span></div>' +
      '</div>' +
      '<div class="tags" style="margin-bottom:14px">' +
      '<span class="tag vert">' + esc(N.LABEL_PROT[p.proteine]) + '</span>' +
      (p.feculent ? '<span class="tag">' + esc(p.feculentBase) + '</span>' : '') +
      regimes.map(function (r) { return '<span class="tag contour">' + r[1] + '</span>'; }).join('') +
      (p.allergenes.length ? '<span class="tag orange">' + esc(listeAllergenes(p.allergenes)) + '</span>' : '') +
      '</div>' +
      p.equilibre.points.map(function (x) {
        return '<div class="repere' + (x.ok ? '' : ' ko') + '"><span class="pastille-etat"></span>' +
          '<span class="libelle">' + esc(x.k) + '</span><span class="petit doux">' + esc(x.cible) + '</span>' +
          '<span class="valeur">' + esc(x.v) + '</span></div>';
      }).join('') +
      (manquants ? '<div class="alerte-bloc" style="margin-top:14px"><span>⚠️</span><div>' + manquants +
        ' ingrédient(s) sans valeurs nutritionnelles : l’analyse est incomplète. Renseignez-les pour que l’équilibre de la semaine reste juste.</div></div>' : '') +
      '</div>';
  }

  /* ------------------------ ingrédient inédit ------------------------- */
  function formulaireIngredient(ni) {
    return '<div class="carte carte-p" style="margin-bottom:16px;border-color:var(--vert)">' +
      '<h3>Nouvel ingrédient</h3>' +
      '<p class="petit doux">Les valeurs nutritionnelles sont facultatives, mais sans elles l’équilibre calculé sera faussé. Elles figurent sur l’emballage, pour 100 g.</p>' +
      '<div class="grille grille-2">' +
      '<label class="champ"><span class="lib">Nom</span>' +
      '<input type="text" data-ni="n" value="' + esc(ni.n) + '" placeholder="ex. Farine de châtaigne"></label>' +
      '<label class="champ"><span class="lib">Rayon</span><select data-ni="r">' +
      ING.rayons.map(function (r) {
        return '<option value="' + r.id + '"' + (ni.r === r.id ? ' selected' : '') + '>' + esc(r.n) + '</option>';
      }).join('') + '</select></label>' +
      '</div>' +
      '<label class="champ"><span class="lib">Famille</span>' +
      '<span class="aide">Elle détermine comment le plat est classé (viande rouge, poisson, légumineuse…).</span>' +
      '<select data-ni="ct">' + C.FAMILLES.map(function (f) {
        return '<option value="' + f.id + '"' + (ni.ct === f.id ? ' selected' : '') + '>' + esc(f.n) + '</option>';
      }).join('') + '</select></label>' +
      '<div class="grille grille-2">' +
      '<label class="champ"><span class="lib">Se mesure en</span><select data-ni="u">' +
      [['g', 'grammes'], ['ml', 'millilitres'], ['pc', 'pièces']].map(function (u) {
        return '<option value="' + u[0] + '"' + (ni.u === u[0] ? ' selected' : '') + '>' + u[1] + '</option>';
      }).join('') + '</select></label>' +
      (ni.u === 'pc'
        ? '<div class="grille grille-2"><label class="champ"><span class="lib">Poids d’une pièce (g)</span>' +
        '<input type="number" data-ni="pc" value="' + esc(ni.pc) + '" min="1"></label>' +
        '<label class="champ"><span class="lib">Nom de l’unité</span>' +
        '<input type="text" data-ni="up" value="' + esc(ni.up) + '" placeholder="gousse, tranche…"></label></div>'
        : '<label class="champ"><span class="lib">Prix indicatif (€/kg ou €/L)</span>' +
        '<input type="number" data-ni="px" value="' + esc(ni.px) + '" min="0" step="0.1"></label>') +
      '</div>' +
      '<div class="champ"><span class="lib">Pour 100 g <span class="doux petit">(facultatif)</span></span>' +
      '<div class="grille grille-3">' +
      [['kcal', 'Calories'], ['p', 'Protéines (g)'], ['c', 'Glucides (g)'], ['l', 'Lipides (g)'], ['f', 'Fibres (g)'],
      ['px', 'Prix €/kg']].map(function (k) {
        if (k[0] === 'px' && ni.u === 'pc') return '<label class="champ"><span class="lib">Prix € / pièce</span><input type="number" data-ni="px" value="' + esc(ni.px) + '" min="0" step="0.1"></label>';
        if (k[0] === 'px' && ni.u !== 'pc') return '';
        return '<label class="champ"><span class="lib">' + k[1] + '</span>' +
          '<input type="number" data-ni="' + k[0] + '" value="' + esc(ni[k[0]]) + '" min="0" step="0.1"></label>';
      }).join('') + '</div></div>' +
      '<div class="champ"><span class="lib">Allergènes</span><div class="puces">' +
      C.ALLERGENES.map(function (al) {
        return '<button type="button" class="puce" data-ni-al="' + al + '" aria-pressed="' + (ni.al.indexOf(al) >= 0) + '">' +
          esc(NOM_ALLERGENE[al] || al) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="champ" style="margin-bottom:0"><span class="lib">Produit de placard</span>' +
      '<span class="aide">Épices, huiles, farine : rangés à part dans la liste de courses.</span><div class="puces">' +
      '<button type="button" class="puce" data-ni-placard="1" aria-pressed="' + !!ni.pl + '">Oui</button>' +
      '<button type="button" class="puce" data-ni-placard="0" aria-pressed="' + !ni.pl + '">Non</button></div></div>' +
      '<div class="actions" style="margin-top:14px">' +
      '<button class="bouton principal" data-action="ni-enregistrer">Ajouter à la recette</button>' +
      '<button class="bouton" data-action="ni-annuler">Annuler</button>' +
      '</div></div>';
  }

  /* Redessine les seules zones concernées, pour ne pas perdre la frappe. */
  function majEditeur(zones) {
    var ed = etat.editeur;
    if (!ed) return;
    if (!zones || zones.indexOf('resultats') >= 0) {
      var r = document.getElementById('edResultats');
      if (r) r.innerHTML = resultatsIngredients(ed.rechIng);
    }
    if (!zones || zones.indexOf('lignes') >= 0) {
      var l = document.getElementById('edLignes');
      if (l) l.innerHTML = lignesIngredients(ed);
    }
    if (!zones || zones.indexOf('analyse') >= 0) {
      var an = document.getElementById('edAnalyse');
      if (an) an.innerHTML = analyseEditeur(ed);
    }
  }

  /* Les zones de texte gardent leur valeur hors du HTML rendu, pour éviter
     que le navigateur ne réinitialise le curseur à chaque frappe. */
  function remplirChampsEditeur() {
    var ed = etat.editeur;
    if (!ed) return;
    var ta = document.getElementById('edEtapes');
    if (ta && ta.value !== ed.e) ta.value = ed.e;
  }

  /* ================================ ACTIONS ============================== */

  function optionsDepuisReglages(verrous, exclus) {
    var r = etat.reglages;
    return {
      nbRepas: r.nbRepas, convives: r.convives, envie: r.envie,
      envieIntensite: r.envieIntensite, regimes: r.regimes.slice(),
      allergenes: r.allergenes.slice(), exclusions: r.exclusions.slice(),
      tempsMax: r.tempsMax, difficulteMax: r.difficulteMax,
      sources: (r.sources && r.sources.length) ? r.sources.slice() : ['nous', 'idees'],
      imposes: etat.choix.slice(),
      historique: etat.historique.slice(),
      prefSaison: r.prefSaison !== false, budgetSemaine: r.budgetSemaine || 0,
      verrous: verrous || [], exclusRecettes: exclus || []
    };
  }

  function generer(garderVerrous) {
    var verrous = [];
    if (garderVerrous && etat.plan) {
      etat.plan.repas.forEach(function (r) {
        if (r.verrouille && r.index < etat.reglages.nbRepas) verrous.push({ index: r.index, id: r.id });
      });
    }
    var plan = P.generate(optionsDepuisReglages(verrous));
    if (!plan.ok) { toast(plan.message); return; }

    /* On conserve les convives deja ajustes repas par repas. */
    if (etat.plan) {
      var anciens = {};
      etat.plan.repas.forEach(function (r) { anciens[r.index] = r.convives; });
      plan.repas.forEach(function (r) { if (anciens[r.index]) r.convives = anciens[r.index]; });
    }
    verrous.forEach(function (v) {
      var r = plan.repas[v.index];
      if (r && r.id === v.id) r.verrouille = true;
    });

    etat.plan = plan;
    etat.coches = {};
    etat.onglet = 'semaine';
    /* On garde de quoi couvrir environ cinq semaines de repas. */
    etat.historique = plan.repas.map(function (r) { return r.id; })
      .concat(etat.historique.filter(function (id) {
        return plan.repas.every(function (r) { return r.id !== id; });
      })).slice(0, 40);
    sauver();
    render();
    toast(garderVerrous ? 'Nouvelle semaine générée.' : 'Votre semaine est prête.');
  }

  function remplacerRepas(index) {
    if (!etat.plan) return;
    var ancien = etat.plan.repas[index];
    var neuf = P.remplacer(etat.plan, index);
    if (!neuf.ok) { toast('Aucune autre recette compatible.'); return; }
    var convives = {};
    etat.plan.repas.forEach(function (r) { convives[r.index] = r.convives; });
    var verrous = {};
    etat.plan.repas.forEach(function (r) { verrous[r.index] = r.verrouille; });
    neuf.repas.forEach(function (r) {
      r.convives = convives[r.index] || r.convives;
      r.verrouille = !!verrous[r.index] && r.index !== index;
    });
    etat.plan = neuf;
    recalculerNote();
    sauver();
    render();
    if (etat.plan.repas[index]) {
      toast('« ' + ancien.recette.n +' » remplacé par « ' + etat.plan.repas[index].recette.n + ' ».');
    }
  }

  function ajouterRecette(id) {
    if (!etat.plan) return;
    if (etat.plan.repas.length >= 14) { toast('14 repas au maximum.'); return; }
    var rec = RECETTES.filter(function (x) { return x.id === id; })[0];
    if (!rec) return;
    etat.plan.repas.push({
      index: etat.plan.repas.length, id: id, recette: rec,
      convives: etat.reglages.convives, verrouille: true
    });
    etat.reglages.nbRepas = etat.plan.repas.length;
    recalculerNote();
    sauver();
    fermerModale();
    etat.onglet = 'semaine';
    render();
    toast('« ' + rec.n + ' » ajouté à la semaine.');
  }

  function texteListe() {
    var l = S.build(etat.plan, { placardPossede: etat.possede });
    return S.texte(l, etat.plan);
  }

  function copier() { copierTexte(texteListe(), 'Liste copiée.'); }

  /** @param {string} t  @param {?string} message  null = copie silencieuse */
  function copierTexte(t, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { if (message) toast(message); },
        function () { copierSecours(t, message); });
    } else { copierSecours(t, message); }
  }

  function copierSecours(t, message) {
    var ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    if (message || !ok) toast(ok ? message : 'Copie impossible sur ce navigateur.');
  }

  function telecharger() {
    var blob = new Blob([texteListe()], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'liste-de-courses.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }


  /* -------------------------- actions de l'éditeur ---------------------- */

  function ouvrirEditeur(ed) {
    etat.editeur = ed;
    etat.onglet = 'recettes';
    render();
  }

  function enregistrerRecette() {
    var ed = etat.editeur;
    var res = C.enregistrerRecette({
      id: ed.id && C.estPerso(ed.id) ? ed.id : null,
      n: ed.n, cu: ed.cu, t: ed.t, d: ed.d, s: ed.s,
      tags: (ed.tags || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean),
      i: ed.i.filter(function (l) { return l[1] > 0; })
        .map(function (l) { return [l[0], l[1] / (ed.base || 1)]; }),
      e: (ed.e || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean)
    });
    if (!res.ok) { toast(res.erreurs[0]); return; }
    etat.editeur = null;
    etat.filtreSource = 'nous';
    etat.recherche = '';
    sauver();
    render();
    toast('Recette enregistrée : elle entrera dans vos prochaines semaines.');
  }

  function supprimerRecetteEditee() {
    var ed = etat.editeur;
    var utilisee = etat.plan && etat.plan.repas.some(function (r) { return r.id === ed.id; });
    var message = 'Supprimer définitivement « ' + ed.n + ' » ?' +
      (utilisee ? '\n\nElle figure dans votre semaine en cours : ce repas disparaîtra.' : '');
    if (!confirm(message)) return;
    C.supprimerRecette(ed.id);
    if (utilisee) {
      etat.plan.repas = etat.plan.repas
        .filter(function (r) { return r.id !== ed.id; })
        .map(function (r, i) { return Object.assign({}, r, { index: i }); });
      if (!etat.plan.repas.length) etat.plan = null; else recalculerNote();
    }
    etat.editeur = null;
    sauver();
    render();
    toast('Recette supprimée.');
  }

  function enregistrerNouvelIngredient() {
    var ni = etat.editeur.nouvelIng;
    var res = C.enregistrerIngredient(ni);
    if (!res.ok) { toast(res.erreurs[0]); return; }
    var ing = ING.byId[res.id];
    etat.editeur.i.push([res.id, quantiteParDefaut(ing, etat.editeur.base)]);
    etat.editeur.nouvelIng = null;
    etat.editeur.rechIng = '';
    render();
    toast('« ' + ing.n + ' » ajouté' + (ing.complet ? '.' : ' — pensez à ses valeurs nutritionnelles.'));
  }

  function exporterPerso() {
    var blob = new Blob([C.exporter()], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var lien = document.createElement('a');
    lien.href = url;
    lien.download = 'mes-recettes-semainier.json';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast(C.recettes().length + ' recette(s) exportée(s).');
  }

  function importerPerso(fichier) {
    var lecteur = new FileReader();
    lecteur.onload = function () {
      var res = C.importer(String(lecteur.result));
      if (!res.ok) { toast(res.erreur); return; }
      etat.filtreSource = 'nous';
      render();
      toast(res.recettes + ' recette(s) et ' + res.ingredients + ' ingrédient(s) importés' +
        (res.ignorees > 0 ? ' — ' + res.ignorees + ' déjà présente(s) ou incomplète(s).' : '.'));
    };
    lecteur.onerror = function () { toast('Lecture du fichier impossible.'); };
    lecteur.readAsText(fichier);
  }

  /* ---------------------------- envoi vers Rappels ---------------------- */

  function lignesRappels() {
    var l = S.build(etat.plan, { placardPossede: etat.possede });
    return S.lignesArticles(l, {
      rayons: etat.reglages.rappelsRayons,
      placard: etat.reglages.rappelsPlacard,
      coches: etat.coches
    });
  }

  function envoyerVersRaccourcis() {
    var lignes = lignesRappels();
    if (!lignes.length) { toast('Aucun article à envoyer.'); return; }
    var nom = (etat.reglages.rappelsRaccourci || 'Courses Semainier').trim();
    var url = 'shortcuts://x-callback-url/run-shortcut?name=' + encodeURIComponent(nom) +
      '&input=text&text=' + encodeURIComponent(lignes.join('\n'));
    if (url.length > 8000) {
      toast('Liste trop longue pour ce transfert : utilisez la copie.');
      return;
    }
    /* Le lien peut échouer de deux façons : pas d'app Raccourcis, ou pas de
       raccourci de ce nom. Dans les deux cas la liste est déjà dans le
       presse-papiers, donc le collage manuel reste possible. */
    copierTexte(lignes.join('\n'), null);
    window.location.href = url;
    setTimeout(function () {
      toast(etat.reglages.rappelsRaccourciPret
        ? 'Liste envoyée. Elle est aussi copiée, au cas où.'
        : 'Si Raccourcis répond « Le fichier n’existe pas », le raccourci reste à créer — la liste est copiée en attendant.');
    }, 1600);
  }

  /* Feuille de partage iOS : permet d'envoyer la liste vers Notes, Messages
     ou un raccourci, sans passer par le presse-papiers. */
  function partagerListe() {
    var lignes = lignesRappels();
    if (!lignes.length) { toast('Aucun article à partager.'); return; }
    if (navigator.share) {
      navigator.share({ title: 'Liste de courses', text: lignes.join('\n') })
        .catch(function () { /* partage annulé */ });
    } else {
      copierTexte(lignes.join('\n'), 'Partage indisponible : la liste a été copiée.');
    }
  }

  /* ============================== ÉVÉNEMENTS ============================= */

  function basculer(liste, valeur) {
    var i = liste.indexOf(valeur);
    if (i >= 0) liste.splice(i, 1); else liste.push(valeur);
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-onglet],[data-action],[data-pas],[data-envie],[data-intensite],' +
      '[data-regime],[data-allergene],[data-aversion],[data-saison],[data-recette],[data-verrou],' +
      '[data-remplacer],[data-convives],[data-famille],[data-fermer],[data-ajouter],' +
      '[data-ed-diff],[data-ed-saison],[data-ed-base],[data-ed-ajout],[data-ed-retirer],' +
      '[data-ed-modifier],[data-ed-dupliquer],[data-ni-al],[data-ni-placard],' +
      '[data-rappels-opt],[data-source],[data-choix],' +
      '[data-choix-retirer],[data-filtre-source]');
    if (!t) return;

    if (t.hasAttribute('data-fermer')) {
      if (ev.target.closest('.modale') && !t.hasAttribute('data-fermer')) return;
      var rempl = t.getAttribute('data-remplacer');
      fermerModale();
      if (rempl !== null && rempl !== undefined && rempl !== '') remplacerRepas(parseInt(rempl, 10));
      return;
    }
    if (t.hasAttribute('data-ajouter')) { ajouterRecette(t.getAttribute('data-ajouter')); return; }
    if (t.hasAttribute('data-recette')) { ouvrirRecette(t.getAttribute('data-recette')); return; }

    if (t.hasAttribute('data-onglet')) {
      etat.onglet = t.getAttribute('data-onglet');
      sauver(); render(); return;
    }

    if (t.hasAttribute('data-pas')) {
      var cle = t.getAttribute('data-cle');
      var pas = parseInt(t.getAttribute('data-pas'), 10);
      var bornes = cle === 'nbRepas' ? [1, 14] : [1, 20];
      etat.reglages[cle] = Math.max(bornes[0], Math.min(bornes[1], etat.reglages[cle] + pas));
      sauver(); render(); return;
    }

    if (t.hasAttribute('data-convives')) {
      var idx = parseInt(t.getAttribute('data-index'), 10);
      var d = parseInt(t.getAttribute('data-convives'), 10);
      var repas = etat.plan.repas[idx];
      repas.convives = Math.max(1, Math.min(20, repas.convives + d));
      recalculerNote(); sauver(); render(); return;
    }

    if (t.hasAttribute('data-verrou')) {
      var i2 = parseInt(t.getAttribute('data-verrou'), 10);
      var repasV = etat.plan.repas[i2];
      repasV.verrouille = !repasV.verrouille;
      /* Verrouiller un repas revient à l'imposer aux prochains tirages. */
      var k2 = etat.choix.indexOf(repasV.id);
      if (repasV.verrouille && k2 < 0) etat.choix.push(repasV.id);
      if (!repasV.verrouille && k2 >= 0) etat.choix.splice(k2, 1);
      sauver(); render(); return;
    }

    if (t.hasAttribute('data-remplacer')) { remplacerRepas(parseInt(t.getAttribute('data-remplacer'), 10)); return; }

    if (t.hasAttribute('data-envie')) {
      var mot = t.getAttribute('data-envie');
      var actuel = etat.reglages.envie.trim();
      etat.reglages.envie = P.normalise(actuel).indexOf(P.normalise(mot)) >= 0
        ? actuel.replace(new RegExp(mot, 'i'), '').replace(/\s+/g, ' ').trim()
        : (actuel ? actuel + ' ' + mot : mot);
      sauver(); render(); return;
    }

    if (t.hasAttribute('data-intensite')) { etat.reglages.envieIntensite = t.getAttribute('data-intensite'); sauver(); render(); return; }
    if (t.hasAttribute('data-regime')) { basculer(etat.reglages.regimes, t.getAttribute('data-regime')); sauver(); render(); return; }
    if (t.hasAttribute('data-allergene')) { basculer(etat.reglages.allergenes, t.getAttribute('data-allergene')); sauver(); render(); return; }
    if (t.hasAttribute('data-aversion')) {
      basculer(etat.reglages.exclusions, t.getAttribute('data-aversion'));
      sauver();
      var champ = document.getElementById('rechercheAversion');
      var valeur = champ ? champ.value : '';
      var zone = document.getElementById('listeAversions');
      if (zone) { zone.innerHTML = pucesAversions(valeur); majBarreBasse(); }
      else render();
      return;
    }
    if (t.hasAttribute('data-saison')) { etat.reglages.prefSaison = t.getAttribute('data-saison') === '1'; sauver(); render(); return; }
    if (t.hasAttribute('data-famille')) { etat.filtreFamille = t.getAttribute('data-famille'); render(); return; }

    /* ----------------------------- éditeur ----------------------------- */
    if (t.hasAttribute('data-ed-modifier')) {
      fermerModale();
      var rm = RECETTES.filter(function (x) { return x.id === t.getAttribute('data-ed-modifier'); })[0];
      if (rm) ouvrirEditeur(editeurDepuis(rm, 4));
      return;
    }
    if (t.hasAttribute('data-ed-dupliquer')) {
      fermerModale();
      var rd = RECETTES.filter(function (x) { return x.id === t.getAttribute('data-ed-dupliquer'); })[0];
      if (rd) {
        var copie = editeurDepuis(rd, 4);
        copie.id = null;
        copie.n = rd.n + ' (ma version)';
        ouvrirEditeur(copie);
      }
      return;
    }
    if (t.hasAttribute('data-ed-diff')) { etat.editeur.d = parseInt(t.getAttribute('data-ed-diff'), 10); render(); return; }
    if (t.hasAttribute('data-ed-saison')) { basculer(etat.editeur.s, t.getAttribute('data-ed-saison')); render(); return; }
    if (t.hasAttribute('data-ed-base')) {
      etat.editeur.base = Math.max(1, Math.min(12, etat.editeur.base + parseInt(t.getAttribute('data-ed-base'), 10)));
      render();
      return;
    }
    if (t.hasAttribute('data-ed-ajout')) {
      var idAjout = t.getAttribute('data-ed-ajout');
      if (!etat.editeur.i.some(function (l) { return l[0] === idAjout; })) {
        etat.editeur.i.push([idAjout, quantiteParDefaut(ING.byId[idAjout], etat.editeur.base)]);
      }
      majEditeur();
      sauverDiffere();
      return;
    }
    if (t.hasAttribute('data-ed-retirer')) {
      etat.editeur.i.splice(parseInt(t.getAttribute('data-ed-retirer'), 10), 1);
      majEditeur();
      sauverDiffere();
      return;
    }
    if (t.hasAttribute('data-ni-al')) { basculer(etat.editeur.nouvelIng.al, t.getAttribute('data-ni-al')); render(); return; }
    if (t.hasAttribute('data-ni-placard')) { etat.editeur.nouvelIng.pl = t.getAttribute('data-ni-placard') === '1'; render(); return; }
    if (t.hasAttribute('data-choix') || t.hasAttribute('data-choix-retirer')) {
      var idChoix = t.getAttribute('data-choix') || t.getAttribute('data-choix-retirer');
      var dansChoix = etat.choix.indexOf(idChoix);
      if (t.hasAttribute('data-choix-retirer') || dansChoix >= 0) {
        if (dansChoix >= 0) etat.choix.splice(dansChoix, 1);
        /* Le verrou de la semaine en cours suit le même état. */
        if (etat.plan) {
          etat.plan.repas.forEach(function (x) { if (x.id === idChoix) x.verrouille = false; });
        }
      } else {
        etat.choix.push(idChoix);
      }
      sauver();
      if (document.getElementById('modale')) fermerModale();
      render();
      return;
    }

    if (t.hasAttribute('data-source')) {
      var s = t.getAttribute('data-source');
      etat.reglages.sources = s === 'tout' ? ['nous', 'idees'] : [s];
      sauver(); render();
      return;
    }

    if (t.hasAttribute('data-filtre-source')) {
      etat.filtreSource = t.getAttribute('data-filtre-source');
      render();
      return;
    }

    if (t.hasAttribute('data-rappels-opt')) {
      var cle2 = t.getAttribute('data-rappels-opt') === 'rayons' ? 'rappelsRayons' : 'rappelsPlacard';
      etat.reglages[cle2] = !etat.reglages[cle2];
      sauver(); render();
      return;
    }

    var action = t.getAttribute('data-action');
    if (action === 'choix-vider') {
      etat.choix = [];
      if (etat.plan) etat.plan.repas.forEach(function (x) { x.verrouille = false; });
      sauver(); render();
      toast('Plats imposés retirés.');
    }
    else if (action === 'ed-nouvelle') { ouvrirEditeur(editeurVide()); }
    else if (action === 'ed-annuler') { etat.editeur = null; render(); }
    else if (action === 'ed-enregistrer') { enregistrerRecette(); }
    else if (action === 'ed-supprimer') { supprimerRecetteEditee(); }
    else if (action === 'ed-source') {
      copierTexte(C.versSource(C.recette(etat.editeur.id)), 'Code copié : collez-le dans assets/data/recipes.js.');
    }
    else if (action === 'ed-nouvel-ingredient') {
      etat.editeur.nouvelIng = {
        n: etat.editeur.rechIng || '', r: 'legumes', u: 'g', ct: 'legume',
        kcal: '', p: '', c: '', l: '', f: '', px: '', pc: '', up: '', al: [], pl: false
      };
      render();
    }
    else if (action === 'ni-enregistrer') { enregistrerNouvelIngredient(); }
    else if (action === 'ni-annuler') { etat.editeur.nouvelIng = null; render(); }
    else if (action === 'perso-exporter') { exporterPerso(); }
    else if (action === 'perso-importer') { var f = document.getElementById('fichierImport'); if (f) f.click(); }
    else if (action === 'rappels-raccourci') { envoyerVersRaccourcis(); }
    else if (action === 'rappels-partager') { partagerListe(); }
    else if (action === 'rappels-pret') {
      etat.reglages.rappelsRaccourciPret = !etat.reglages.rappelsRaccourciPret;
      sauver(); render();
      toast(etat.reglages.rappelsRaccourciPret
        ? 'Parfait : un seul bouton suffira désormais.'
        : 'La marche à suivre est réaffichée.');
    }
    else if (action === 'rappels-copier') {
      var lr = lignesRappels();
      if (!lr.length) { toast('Aucun article à copier.'); return; }
      copierTexte(lr.join('\n'), lr.length + ' lignes copiées : collez-les dans une liste Rappels.');
    }
    else if (action === 'generer') { generer(false); }
    else if (action === 'regenerer') { generer(true); }
    else if (action === 'copier') { copier(); }
    else if (action === 'telecharger') { telecharger(); }
    else if (action === 'imprimer') { window.print(); }
    else if (action === 'decocher') { etat.coches = {}; sauver(); render(); }
    else if (action === 'theme') {
      etat.theme = etat.theme === 'auto' ? 'clair' : etat.theme === 'clair' ? 'sombre' : 'auto';
      sauver(); render();
      toast('Thème : ' + (etat.theme === 'auto' ? 'automatique' : etat.theme));
    }
    else if (action === 'reinitialiser') {
      if (confirm('Effacer la semaine, la liste de courses et vos réglages ?\n\nVos recettes personnelles sont conservées.')) {
        STORE.effacer();
        etat.plan = null; etat.coches = {}; etat.possede = {};
        etat.choix = []; etat.historique = [];
        etat.reglages = {
          nbRepas: 5, convives: 4, envie: '', envieIntensite: 'un_peu',
          regimes: [], allergenes: [], exclusions: [], tempsMax: 0, difficulteMax: 0,
          prefSaison: true, budgetSemaine: 0, sources: ['nous', 'idees'],
          rappelsRaccourci: 'Courses Semainier', rappelsListe: 'Liste de courses',
          rappelsRaccourciPret: false, rappelsRayons: false, rappelsPlacard: false
        };
        etat.onglet = 'planifier';
        render();
      }
    }
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.hasAttribute && el.hasAttribute('data-coche')) {
      var id = el.getAttribute('data-coche');
      if (el.checked) etat.coches[id] = 1; else delete etat.coches[id];
      el.closest('.article').classList.toggle('coche', el.checked);
      sauver(); return;
    }
    if (el.hasAttribute && el.hasAttribute('data-possede')) {
      var pid = el.getAttribute('data-possede');
      if (el.checked) etat.possede[pid] = 1; else delete etat.possede[pid];
      sauver(); render(); return;
    }
    if (etat.editeur && etat.editeur.nouvelIng && el.hasAttribute && el.hasAttribute('data-ni')) {
      etat.editeur.nouvelIng[el.getAttribute('data-ni')] = el.value;
      if (el.getAttribute('data-ni') === 'u') render();
      return;
    }
    if (el.id === 'fichierImport') {
      if (el.files && el.files[0]) importerPerso(el.files[0]);
      el.value = '';
      return;
    }
    if (el.id === 'nomListeRappels') { etat.reglages.rappelsListe = el.value; sauver(); render(); return; }
    if (el.id === 'tempsMax') { etat.reglages.tempsMax = parseInt(el.value, 10) || 0; sauver(); majBarreBasse(); return; }
    if (el.id === 'difficulteMax') { etat.reglages.difficulteMax = parseInt(el.value, 10) || 0; sauver(); majBarreBasse(); return; }
  });

  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.id === 'envie') {
      etat.reglages.envie = el.value;
      var bloc = document.getElementById('blocIntensite');
      if (bloc) bloc.hidden = !el.value.trim();
      sauver(); majBarreBasse();
      return;
    }
    if (el.id === 'recherche') { etat.recherche = el.value; redessinerRecettes(); return; }
    if (etat.editeur) {
      var ed = etat.editeur;
      if (el.id === 'edNom') { ed.n = el.value; sauverDiffere(); return; }
      if (el.id === 'edCuisine') { ed.cu = el.value; sauverDiffere(); return; }
      if (el.id === 'edTemps') { ed.t = parseInt(el.value, 10) || 0; sauverDiffere(); return; }
      if (el.id === 'edTags') { ed.tags = el.value; sauverDiffere(); return; }
      if (el.id === 'edEtapes') { ed.e = el.value; sauverDiffere(); return; }
      if (el.id === 'edRechIng') { ed.rechIng = el.value; majEditeur(['resultats']); return; }
      if (el.hasAttribute('data-ed-qte')) {
        var k = parseInt(el.getAttribute('data-ed-qte'), 10);
        ed.i[k][1] = parseFloat(el.value) || 0;
        majEditeur(['analyse']);
        majLigneParPersonne(k);
        sauverDiffere();
        return;
      }
      if (el.hasAttribute('data-ni') && ed.nouvelIng) {
        ed.nouvelIng[el.getAttribute('data-ni')] = el.value;
        return;
      }
    }
    if (el.id === 'nomRaccourci') { etat.reglages.rappelsRaccourci = el.value; sauverDiffere(); return; }
    if (el.id === 'nomListeRappels') { etat.reglages.rappelsListe = el.value; sauverDiffere(); return; }
    if (el.id === 'rechercheAversion') {
      var zone = document.getElementById('listeAversions');
      if (zone) zone.innerHTML = pucesAversions(el.value);
      return;
    }
  });

  /* Met à jour la seule mention "par personne" de la ligne saisie. */
  function majLigneParPersonne(k) {
    var ed = etat.editeur;
    var li = document.querySelectorAll('#edLignes li')[k];
    if (!li || !ed.i[k]) return;
    var ing = ING.byId[ed.i[k][0]];
    var detail = li.querySelector('.detail');
    if (!ing || !detail) return;
    var parPers = Math.round((ed.i[k][1] / (ed.base || 1)) * 100) / 100;
    var unite = ing.u === 'pc' ? S.plurielUnite(ing.up || 'pièce', parPers) : ing.u;
    detail.textContent = S.nb(parPers) + ' ' + unite + ' par personne';
  }

  /* Redessine la seule liste des recettes, pour ne pas perdre le focus. */
  var minuteur = null;
  function redessinerRecettes() {
    clearTimeout(minuteur);
    minuteur = setTimeout(function () {
      var champ = document.getElementById('recherche');
      var pos = champ ? champ.selectionStart : 0;
      $('#vue').innerHTML = vueRecettes();
      var neuf = document.getElementById('recherche');
      if (neuf) { neuf.focus(); try { neuf.setSelectionRange(pos, pos); } catch (e) { /* sans effet */ } }
    }, 120);
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') fermerModale();
  });

  /* ================================= INIT ================================ */
  restaurer();
  render();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* hors-ligne indisponible */ });
  }
})();
