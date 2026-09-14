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
    RECETTES = window.MP_RECIPES, STORE = window.MP_STORE;

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

  var ENVIES_RAPIDES = ['Poulet', 'Poisson', 'Pâtes', 'Asiatique', 'Italien', 'Végétarien',
    'Épicé', 'Réconfortant', 'Rapide', 'Léger', 'Four', 'Soupe'];

  /* ------------------------------------------------------------------ état */
  var etat = {
    onglet: 'planifier',
    reglages: {
      nbRepas: 5, convives: 4, envie: '', envieIntensite: 'un_peu',
      regimes: [], allergenes: [], exclusions: [],
      tempsMax: 0, difficulteMax: 0, prefSaison: true, budgetSemaine: 0
    },
    plan: null,
    coches: {},
    possede: {},
    recherche: '',
    filtreFamille: '',
    theme: 'auto'
  };

  /* --------------------------------------------------------------- outils */
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function eur(x) { return (Math.round(x * 100) / 100).toFixed(2).replace('.', ',') + ' €'; }
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

  function restaurer() {
    var d = STORE.lire();
    if (!d) return;
    if (d.reglages) Object.assign(etat.reglages, d.reglages);
    etat.coches = d.coches || {};
    etat.possede = d.possede || {};
    etat.theme = d.theme || 'auto';
    if (d.onglet) etat.onglet = d.onglet;
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
          : vueRecettes();
    vue.innerHTML = html;
    majBarreBasse();
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

      (r.envie ? '<div class="champ"><span class="lib">Place de cette envie dans la semaine</span>' +
        '<div class="puces">' +
        [['un_peu', 'Un ou deux repas'], ['plusieurs', 'La moitié des repas'], ['toute', 'Toute la semaine']]
          .map(function (i) {
            return '<button type="button" class="puce" data-intensite="' + i[0] + '" aria-pressed="' + (r.envieIntensite === i[0]) + '">' + i[1] + '</button>';
          }).join('') + '</div></div>' : '') +
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

      (manque ? '<div class="alerte-bloc" style="margin-bottom:18px"><span>⚠️</span><div>' +
        'Seulement <b>' + dispo + '</b> recette(s) correspondent à ces contraintes, pour ' + r.nbRepas + ' repas demandés. ' +
        'Certaines seront répétées ou les contraintes assouplies.</div></div>' : '') +

      '<div class="section centre"><button class="bouton principal grand" data-action="generer">' +
      (etat.plan ? '↻ Générer une nouvelle semaine' : 'Générer ma semaine') + '</button>' +
      '<p class="petit doux" style="margin-top:10px">' + dispo + ' recettes compatibles sur ' + RECETTES.length + '.</p></div>';
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
        '<h3><button data-recette="' + esc(r.id) + '">' + esc(r.recette.n) + '</button></h3>' +
        '<div class="tags" style="margin-bottom:8px">' +
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

    var liste = RECETTES.filter(function (r) {
      var p = N.profile(r);
      if (etat.filtreFamille && N.familleProt(p.proteine) !== etat.filtreFamille) return false;
      if (!q) return true;
      return P.normalise(r.n + ' ' + r.cu + ' ' + (r.tags || []).join(' ')).indexOf(q) >= 0 ||
        Object.keys(p.ids).some(function (id) {
          return ING.byId[id] && P.normalise(ING.byId[id].n).indexOf(q) >= 0;
        });
    });

    return '<div class="section">' +
      '<div class="titre-section"><h2>Les ' + RECETTES.length + ' recettes</h2>' +
      '<span class="petit doux">' + liste.length + ' affichée(s)</span></div>' +
      '<input type="text" id="recherche" value="' + esc(etat.recherche) + '" placeholder="Rechercher un plat, un ingrédient, une cuisine…" autocomplete="off">' +
      '<div class="puces" style="margin:12px 0 18px">' +
      familles.map(function (f) {
        return '<button type="button" class="puce" data-famille="' + f[0] + '" aria-pressed="' + (etat.filtreFamille === f[0]) + '">' + esc(f[1]) + '</button>';
      }).join('') + '</div>' +
      (liste.length ? '<div class="liste-recettes">' + liste.map(function (r) {
        var p = N.profile(r);
        return '<button class="carte fiche" data-recette="' + esc(r.id) + '">' +
          '<h3>' + esc(r.n) + '</h3>' +
          '<div class="tags"><span class="tag vert">' + esc(N.LABEL_PROT[p.proteine]) + '</span>' +
          '<span class="tag">' + esc(r.cu) + '</span>' +
          '<span class="tag">⏱ ' + r.t + ' min</span>' +
          '<span class="tag">' + p.nutrition.kcal + ' kcal</span></div>' +
          '</button>';
      }).join('') + '</div>' : '<div class="vide"><span class="emoji">🔍</span><p>Aucune recette ne correspond à cette recherche.</p></div>') +
      '</div>';
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
        esc(p.allergenes.join(', ').replace(/_/g, ' ')) + '</p>' : '') +

      '<div class="actions" style="margin-top:20px">' +
      (auPlan
        ? '<button class="bouton" data-remplacer="' + auPlan.index + '" data-fermer="1">↻ Remplacer ce repas</button>'
        : (etat.plan ? '<button class="bouton principal" data-ajouter="' + esc(r.id) + '">+ Ajouter à ma semaine</button>' : '')) +
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

  /* ================================ ACTIONS ============================== */

  function optionsDepuisReglages(verrous, exclus) {
    var r = etat.reglages;
    return {
      nbRepas: r.nbRepas, convives: r.convives, envie: r.envie,
      envieIntensite: r.envieIntensite, regimes: r.regimes.slice(),
      allergenes: r.allergenes.slice(), exclusions: r.exclusions.slice(),
      tempsMax: r.tempsMax, difficulteMax: r.difficulteMax,
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

  function copier() {
    var t = texteListe();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast('Liste copiée.'); },
        function () { copierSecours(t); });
    } else { copierSecours(t); }
  }

  function copierSecours(t) {
    var ta = document.createElement('textarea');
    ta.value = t;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    toast(ok ? 'Liste copiée.' : 'Copie impossible sur ce navigateur.');
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

  /* ============================== ÉVÉNEMENTS ============================= */

  function basculer(liste, valeur) {
    var i = liste.indexOf(valeur);
    if (i >= 0) liste.splice(i, 1); else liste.push(valeur);
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-onglet],[data-action],[data-pas],[data-envie],[data-intensite],' +
      '[data-regime],[data-allergene],[data-aversion],[data-saison],[data-recette],[data-verrou],' +
      '[data-remplacer],[data-convives],[data-famille],[data-fermer],[data-ajouter]');
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
      etat.plan.repas[i2].verrouille = !etat.plan.repas[i2].verrouille;
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

    var action = t.getAttribute('data-action');
    if (action === 'generer') { generer(false); }
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
      if (confirm('Effacer la semaine, la liste de courses et vos réglages ?')) {
        STORE.effacer();
        etat.plan = null; etat.coches = {}; etat.possede = {};
        etat.reglages = { nbRepas: 5, convives: 4, envie: '', envieIntensite: 'un_peu', regimes: [], allergenes: [], exclusions: [], tempsMax: 0, difficulteMax: 0, prefSaison: true, budgetSemaine: 0 };
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
    if (el.id === 'tempsMax') { etat.reglages.tempsMax = parseInt(el.value, 10) || 0; sauver(); majBarreBasse(); return; }
    if (el.id === 'difficulteMax') { etat.reglages.difficulteMax = parseInt(el.value, 10) || 0; sauver(); majBarreBasse(); return; }
  });

  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.id === 'envie') { etat.reglages.envie = el.value; sauver(); majBarreBasse(); return; }
    if (el.id === 'recherche') { etat.recherche = el.value; redessinerRecettes(); return; }
    if (el.id === 'rechercheAversion') {
      var zone = document.getElementById('listeAversions');
      if (zone) zone.innerHTML = pucesAversions(el.value);
      return;
    }
  });

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
