/* ==========================================================================
   Liste de courses optimisee
   --------------------------------------------------------------------------
   Optimiser une liste de courses, ce n'est pas seulement additionner des
   quantites. Ici on :
     1. agrege le meme ingredient a travers tous les repas de la semaine,
        en tenant compte du nombre de convives repas par repas ;
     2. traduit le besoin en conditionnements reellement achetables
        (boite de 400 g, botte, brique de 20 cl...) ;
     3. range la liste dans l'ordre de parcours des rayons ;
     4. isole les produits de placard, souvent deja possedes ;
     5. signale les restes previsibles pour limiter le gaspillage.
   ========================================================================== */
(function (global) {
  'use strict';

  var ING = global.MP_INGREDIENTS;
  var N = global.MP_NUTRITION;

  var PLURIELS = { bocal: 'bocaux', 'œuf': 'œufs' };

  /* Un libelle de conditionnement est souvent compose ("boîte de 400 g") :
     seul le premier mot s'accorde. */
  function pluriel(mot, n) {
    if (n < 2) return mot;
    var parts = mot.split(' ');
    var tete = parts[0];
    if (PLURIELS[tete]) tete = PLURIELS[tete];
    else if (/[sxz]$/.test(tete)) tete = tete;
    else if (/(eau|eu)$/.test(tete)) tete = tete + 'x';
    else tete = tete + 's';
    parts[0] = tete;
    return parts.join(' ');
  }

  /* Un libelle d'unite s'accorde en entier ("citrons verts"), contrairement
     a un conditionnement ou seul le nom de tete s'accorde. */
  function plurielUnite(mot, n) {
    if (n < 2) return mot;
    return mot.split(' ').map(function (w) {
      if (!/^[A-Za-zÀ-ÿœ']+$/.test(w)) return w;
      if (PLURIELS[w]) return PLURIELS[w];
      if (/[sxz]$/.test(w)) return w;
      if (/(eau|eu)$/.test(w)) return w + 'x';
      return w + 's';
    }).join(' ');
  }

  function nb(x) {
    var arrondi = Math.round(x * 100) / 100;
    return arrondi.toString().replace('.', ',');
  }

  /* Arrondi "de cuisine" : on n'achete pas 137 g de carottes. */
  function arrondiAchat(q, unite) {
    if (unite === 'pc') return Math.ceil(q - 0.001);
    if (q < 30) return Math.ceil(q);
    if (q < 100) return Math.ceil(q / 5) * 5;
    if (q < 500) return Math.ceil(q / 10) * 10;
    if (q < 2000) return Math.ceil(q / 25) * 25;
    return Math.ceil(q / 100) * 100;
  }

  function formatQte(q, ing) {
    if (ing.u === 'pc') {
      return nb(q) + ' ' + plurielUnite(ing.up || 'pièce', q);
    }
    if (ing.u === 'ml') {
      return q >= 1000 ? nb(q / 1000) + ' L' : nb(q) + ' ml';
    }
    return q >= 1000 ? nb(q / 1000) + ' kg' : nb(q) + ' g';
  }

  /* Conditionnement a acheter, quand l'ingredient se vend par unite fermee. */
  function conditionnement(ing, besoin) {
    if (!ing.pk || !ing.pkl) return null;
    var packs = Math.ceil((besoin - 0.001) / ing.pk);
    if (packs < 1) packs = 1;
    return {
      packs: packs,
      label: packs + ' ' + pluriel(ing.pkl, packs),
      contenu: packs * ing.pk,
      reste: Math.max(0, packs * ing.pk - besoin)
    };
  }

  /* Cout indicatif au prorata des quantites reellement utilisees. */
  function coutIngredient(ing, q) {
    if (!ing.px) return 0;
    if (ing.u === 'pc') return q * ing.px;
    return (q / 1000) * ing.px;
  }

  /**
   * Construit la liste a partir d'un plan.
   * @param {object} plan   resultat de MP_PLANNER.generate
   * @param {object} [opts] { placardPossede: {id:true}, sansPlacard: bool }
   */
  function build(plan, opts) {
    opts = opts || {};
    var possede = opts.placardPossede || {};
    var agrege = {};

    plan.repas.forEach(function (repas) {
      var convives = repas.convives || 1;
      repas.recette.i.forEach(function (line) {
        var ing = ING.byId[line[0]];
        if (!ing) return;
        var q = line[1] * convives;
        if (!agrege[ing.id]) {
          agrege[ing.id] = { ing: ing, qte: 0, repas: [], parRepas: {} };
        }
        agrege[ing.id].qte += q;
        agrege[ing.id].parRepas[repas.index] = (agrege[ing.id].parRepas[repas.index] || 0) + q;
        if (agrege[ing.id].repas.indexOf(repas.recette.n) < 0) {
          agrege[ing.id].repas.push(repas.recette.n);
        }
      });
    });

    var items = Object.keys(agrege).map(function (id) {
      var a = agrege[id];
      var ing = a.ing;
      var besoin = a.qte;
      var achat = arrondiAchat(besoin, ing.u);
      var cond = conditionnement(ing, besoin);
      return {
        id: id,
        n: ing.n,
        rayon: ing.r,
        unite: ing.u,
        besoin: besoin,
        besoinTexte: formatQte(Math.round(besoin * 100) / 100, ing),
        achat: achat,
        achatTexte: formatQte(achat, ing),
        conditionnement: cond,
        texte: cond ? cond.label + ' (≈ ' + formatQte(Math.round(besoin), ing) + ')' : formatQte(achat, ing),
        cout: Math.round(coutIngredient(ing, besoin) * 100) / 100,
        placard: !!ing.pl,
        possede: !!possede[id],
        mutualise: a.repas.length > 1,
        repas: a.repas,
        nbRepas: a.repas.length
      };
    });

    /* Classement par rayon, dans l'ordre de parcours du magasin. */
    var ordre = {};
    ING.rayons.forEach(function (r, i) { ordre[r.id] = i; });

    var courses = items.filter(function (i) { return !i.placard; });
    var placard = items.filter(function (i) { return i.placard; });

    function grouper(liste) {
      var map = {};
      liste.forEach(function (it) {
        if (!map[it.rayon]) map[it.rayon] = [];
        map[it.rayon].push(it);
      });
      return Object.keys(map)
        .sort(function (a, b) { return (ordre[a] === undefined ? 99 : ordre[a]) - (ordre[b] === undefined ? 99 : ordre[b]); })
        .map(function (rid) {
          var ray = ING.rayons.filter(function (r) { return r.id === rid; })[0] || { id: rid, n: rid };
          map[rid].sort(function (a, b) { return a.n.localeCompare(b.n, 'fr'); });
          return { id: rid, n: ray.n, icon: ray.icon, items: map[rid] };
        });
    }

    /* Les courses sont chiffrees au prorata de ce qui sera reellement
       consomme. Un produit de placard, lui, s'achete par pot entier : on ne
       compte que ceux que l'utilisateur declare ne PAS avoir. */
    var coutCourses = 0, coutPlacard = 0;
    courses.forEach(function (i) { coutCourses += i.cout; });
    placard.forEach(function (i) {
      if (i.possede) return;
      var ing = ING.byId[i.id];
      var q = i.conditionnement ? i.conditionnement.contenu : (ing.pk || i.besoin);
      i.coutRachat = Math.round(coutIngredient(ing, q) * 100) / 100;
      coutPlacard += i.coutRachat;
    });

    /* Restes previsibles : ce que le conditionnement impose d'acheter en
       plus du besoin reel. Sert a proposer des reemplois. */
    var restes = courses.filter(function (i) {
      return i.conditionnement && i.conditionnement.reste > 0 &&
        i.conditionnement.reste / i.conditionnement.contenu >= 0.35;
    }).map(function (i) {
      return {
        id: i.id, n: i.n,
        reste: formatQte(Math.round(i.conditionnement.reste), ING.byId[i.id]),
        part: Math.round((i.conditionnement.reste / i.conditionnement.contenu) * 100)
      };
    }).sort(function (a, b) { return b.part - a.part; }).slice(0, 8);

    var portions = plan.repas.reduce(function (s, r) { return s + (r.convives || 1); }, 0);

    return {
      rayons: grouper(courses),
      placardRayons: grouper(placard),
      items: items,
      nbArticles: courses.length,
      nbPlacard: placard.length,
      mutualises: items.filter(function (i) { return i.mutualise; }).length,
      cout: Math.round(coutCourses * 100) / 100,
      coutPlacard: Math.round(coutPlacard * 100) / 100,
      nbPlacardARacheter: placard.filter(function (i) { return !i.possede; }).length,
      coutTotal: Math.round((coutCourses + coutPlacard) * 100) / 100,
      coutPortion: portions ? Math.round((coutCourses / portions) * 100) / 100 : 0,
      portions: portions,
      restes: restes
    };
  }

  /* Export texte : pour copier dans une note, un SMS ou imprimer. */
  function texte(liste, plan) {
    var L = [];
    L.push('LISTE DE COURSES — ' + plan.repas.length + ' repas, ' + liste.portions + ' portions');
    L.push('');
    liste.rayons.forEach(function (r) {
      L.push('— ' + r.n.toUpperCase() + ' —');
      r.items.forEach(function (i) {
        L.push('  [ ] ' + i.n + ' : ' + i.texte + (i.nbRepas > 1 ? '  (' + i.nbRepas + ' repas)' : ''));
      });
      L.push('');
    });
    if (liste.placardRayons.length) {
      L.push('— À VÉRIFIER DANS VOS PLACARDS —');
      liste.placardRayons.forEach(function (r) {
        r.items.forEach(function (i) { L.push('  [ ] ' + i.n + ' : ' + i.texte); });
      });
      L.push('');
    }
    L.push('Budget estimé : ' + liste.cout.toFixed(2).replace('.', ',') + ' € (hors placard)');
    if (liste.coutPlacard > 0) {
      L.push('+ ' + liste.coutPlacard.toFixed(2).replace('.', ',') + ' € si vous devez racheter les produits de placard non cochés.');
    }
    L.push('');
    L.push('MENUS DE LA SEMAINE');
    plan.repas.forEach(function (r, i) {
      L.push('  ' + (i + 1) + '. ' + r.recette.n + ' — ' + r.convives + ' pers. — ' + r.recette.t + ' min');
    });
    return L.join('\n');
  }

  global.MP_SHOPPING = {
    build: build, texte: texte, formatQte: formatQte,
    arrondiAchat: arrondiAchat, pluriel: pluriel, plurielUnite: plurielUnite, nb: nb
  };
})(typeof window !== 'undefined' ? window : globalThis);
