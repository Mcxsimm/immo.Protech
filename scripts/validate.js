/* Controle de coherence de la base : lance avec `node scripts/validate.js`. */
global.window = global;
require('../assets/data/ingredients.js');
require('../assets/data/recipes.js');
require('../assets/data/recipes-maison.js');
require('../assets/js/nutrition.js');

var ING = global.MP_INGREDIENTS, R = global.MP_RECIPES, N = global.MP_NUTRITION;
var erreurs = [], avertissements = [];
var vus = {}, utilises = {};

R.forEach(function (r) {
  if (vus[r.id]) erreurs.push('id de recette en double : ' + r.id);
  vus[r.id] = 1;
  ['n', 'cu', 't', 'd', 'i', 'e'].forEach(function (k) {
    if (r[k] === undefined) erreurs.push(r.id + ' : champ manquant "' + k + '"');
  });
  if (r.e && r.e.length < 3) avertissements.push(r.id + ' : seulement ' + r.e.length + ' étapes');
  r.i.forEach(function (line) {
    if (!ING.byId[line[0]]) erreurs.push(r.id + ' : ingrédient inconnu "' + line[0] + '"');
    else utilises[line[0]] = (utilises[line[0]] || 0) + 1;
    if (!(line[1] > 0)) erreurs.push(r.id + ' : quantité invalide pour ' + line[0]);
  });

  var p = N.profile(r);
  var n = p.nutrition;
  if (n.kcal < 380 || n.kcal > 1050) avertissements.push(r.id + ' : ' + n.kcal + ' kcal/portion (hors 380–1050)');
  if (n.p < 15) avertissements.push(r.id + ' : seulement ' + Math.round(n.p) + ' g de protéines/portion');
  if (p.legumesG < 80 && p.proteine !== 'legumineuse') avertissements.push(r.id + ' : ' + p.legumesG + ' g de légumes/portion');
});

var inutilises = ING.list.filter(function (i) { return !utilises[i.id]; }).map(function (i) { return i.id; });

/* Repartition, indispensable pour que le planificateur ait de quoi equilibrer. */
var parFamille = {}, parBase = {}, parCuisine = {}, regimes = { vegetarien: 0, vegetalien: 0, sansGluten: 0, sansLactose: 0 };
R.forEach(function (r) {
  var p = N.profile(r);
  var f = N.familleProt(p.proteine);
  parFamille[f] = (parFamille[f] || 0) + 1;
  parBase[p.feculentBase] = (parBase[p.feculentBase] || 0) + 1;
  parCuisine[r.cu] = (parCuisine[r.cu] || 0) + 1;
  Object.keys(regimes).forEach(function (k) { if (p.regimes[k]) regimes[k]++; });
});

var parSource = {};
R.forEach(function (r) { parSource[r.src || 'idees'] = (parSource[r.src || 'idees'] || 0) + 1; });
console.log('Recettes          :', R.length, parSource);
console.log('Ingrédients       :', ING.list.length, '(' + inutilises.length + ' non utilisés)');
console.log('Par famille       :', parFamille);
console.log('Par base féculente:', parBase);
console.log('Régimes           :', regimes);
console.log('Cuisines          :', Object.keys(parCuisine).length);
var kcals = R.map(function (r) { return N.profile(r).nutrition.kcal; }).sort(function (a, b) { return a - b; });
console.log('kcal/portion      : min', kcals[0], '| médiane', kcals[100], '| max', kcals[199]);
console.log('\nErreurs           :', erreurs.length);
erreurs.slice(0, 40).forEach(function (e) { console.log('  ✗', e); });
console.log('Avertissements    :', avertissements.length);
avertissements.slice(0, 40).forEach(function (e) { console.log('  !', e); });
process.exit(erreurs.length ? 1 : 0);
