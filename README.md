# 🥗 Semainier

**Planifiez vos repas de la semaine et obtenez la liste de courses qui va avec.**

Vous indiquez combien de repas vous voulez préparer, pour combien de personnes,
et votre envie du moment. Semainier compose une semaine **équilibrée** à partir
d'une base de **200 recettes**, puis en déduit une **liste de courses optimisée**,
rangée dans l'ordre des rayons.

Site statique, sans compte, sans serveur, sans dépendance : tout est calculé
dans le navigateur et rien ne sort de votre machine.

---

## Ce que fait l'application

### 1. Vous décrivez votre semaine
- **Nombre de repas** à planifier (1 à 14), ajustable ;
- **Nombre de convives**, global puis modifiable repas par repas — les
  quantités et la liste de courses suivent ;
- **Une envie** exprimée librement : un ingrédient (« poulet »), une cuisine
  (« asiatique », « italien »), une humeur (« réconfortant », « rapide »,
  « léger »). Vous choisissez si elle concerne un ou deux repas, la moitié de la
  semaine ou toute la semaine.

### 2. Vos contraintes alimentaires sont des règles, pas des suggestions
- **Régimes** : végétarien, végétalien, sans porc, sans gluten, sans lactose,
  sans alcool ;
- **Allergies et intolérances** : fruits à coque, poisson, crustacés,
  mollusques, œuf, soja, sésame, moutarde, lait, gluten ;
- **Aversions** : les aliments que personne n'aime à table ;
- **Temps maximum** en cuisine et **niveau** de difficulté ;
- **Produits de saison** privilégiés.

Les recettes incompatibles sont **retirées** du tirage, pas seulement signalées.

### 3. L'équilibre est calculé sur la semaine, pas repas par repas
Un plat pris isolément ne dit pas grand-chose ; c'est la semaine qui compte.
Le générateur optimise l'ensemble selon des repères inspirés du PNNS, ramenés
au nombre de repas demandé :

| Repère | Cible (semaine de 5 repas) |
|---|---|
| Repas de poisson | ≥ 2, dont au moins 1 poisson gras |
| Repas végétariens (légumineuses, œufs, tofu) | ≥ 2 |
| Repas de viande rouge | ≤ 2 |
| Légumes par repas | ≥ 200 g |
| Protéines par portion | ≥ 20 g |
| Fibres par portion | ≥ 8 g |
| Énergie par portion | 500–850 kcal |

S'y ajoutent la **rotation des féculents** (pas trois fois des pâtes), la
**variété des cuisines**, et un bonus **anti-gaspi** qui favorise les semaines
réutilisant les mêmes produits frais.

Chaque repère est affiché avec sa valeur réelle : quand un objectif n'est pas
atteignable (une semaine végétarienne n'aura pas de poisson, une envie forte
peut réduire la variété), l'application le **dit** au lieu de le masquer.

### 4. La liste de courses est optimisée, pas seulement additionnée
- Le même ingrédient est **agrégé** sur tous les repas, pondéré par le nombre
  de convives de chacun ;
- Les besoins sont traduits en **conditionnements réels** : « 2 boîtes de
  400 g », « 1 botte », « 3 briques de 20 cl » ;
- Les articles sont **rangés par rayon**, dans l'ordre de parcours d'un magasin ;
- Les **produits de placard** (épices, huiles, farine) sont isolés : cochez ce
  que vous avez déjà, le budget se met à jour ;
- Les **restes prévisibles** sont signalés : ce que le conditionnement vous
  oblige à acheter en trop ;
- Un **budget indicatif** est calculé, global et par portion ;
- Export par copie, téléchargement `.txt` ou impression.

### 5. Le reste
- Les 200 recettes sont consultables et filtrables, avec ingrédients
  automatiquement mis à l'échelle du nombre de convives, étapes, valeurs
  nutritionnelles et repères d'équilibre ;
- Verrouillez les repas qui vous plaisent, remplacez les autres, regénérez
  autour de vos choix ;
- Tout est conservé localement d'une visite à l'autre, et l'application
  fonctionne **hors connexion** ;
- Thème clair / sombre, impression propre, utilisable au téléphone.

---

## Utilisation

Aucune compilation, aucune installation.

```bash
# ouvrir directement
xdg-open index.html          # ou double-clic sur le fichier

# ou servir localement (nécessaire pour le mode hors connexion)
python3 -m http.server 8000  # puis http://localhost:8000
```

Le dépôt est publiable tel quel sur GitHub Pages ou tout hébergeur statique.

### Vérifier la base de données

```bash
node scripts/validate.js
```

Ce script contrôle les 200 recettes : références d'ingrédients existantes,
quantités valides, doublons d'identifiants, valeurs nutritionnelles
plausibles, et affiche la répartition par famille de protéines, par base
féculente et par régime — c'est ce qui garantit que le planificateur a de quoi
équilibrer une semaine.

---

## Comment c'est construit

```
index.html                  page unique
assets/css/app.css          thèmes clair/sombre, mise en page responsive
assets/data/ingredients.js  205 ingrédients : nutrition, rayon, prix,
                            conditionnement, allergènes, catégorie
assets/data/recipes.js      200 recettes : quantités PAR PERSONNE + étapes
assets/js/nutrition.js      moteur de déduction (profil d'une recette)
assets/js/planner.js        génération et optimisation de la semaine
assets/js/shopping.js       agrégation et optimisation de la liste de courses
assets/js/store.js          persistance locale
assets/js/app.js            interface
scripts/validate.js         contrôle de cohérence de la base
sw.js                       fonctionnement hors connexion
```

### Le principe : tout est déduit des ingrédients

Une recette ne déclare **que** ses ingrédients (en quantité par personne) et
ses étapes. Les calories, les protéines, le type de plat (viande rouge,
poisson gras, légumineuse…), la base féculente, la quantité de légumes, les
allergènes, la compatibilité végétarienne ou sans gluten et le coût sont
**calculés** à partir du catalogue d'ingrédients.

Une valeur saisie deux fois finit toujours par diverger : ici, corriger le
catalogue corrige toutes les recettes qui l'utilisent, et une recette ne peut
pas se déclarer « végétarienne » tout en contenant des lardons.

### La génération

1. **Filtrage** : on ne garde que les recettes compatibles avec les régimes,
   allergies, aversions, temps et niveau demandés ;
2. **Tirage pondéré** : l'envie exprimée et la saison augmentent les chances
   d'une recette ; plusieurs centaines de semaines candidates sont tirées ;
3. **Notation** : chaque semaine candidate reçoit une note qui agrège les
   repères nutritionnels, la variété et l'anti-gaspi ;
4. **Amélioration locale** : on remplace des repas un à un tant que la note
   progresse, en respectant les repas verrouillés.

Le tirage est **déterministe à graine fixée** : à graine égale, même semaine —
ce qui rend les résultats reproductibles et testables.

---

## Ajouter une recette

Ajoutez une entrée dans `assets/data/recipes.js` :

```js
{ id: 'poulet_citron', n: 'Poulet au citron', cu: 'France',
  tags: ['poulet', 'rapide'], t: 30, d: 1, s: ['printemps', 'été'],
  i: [['poulet_filet', 140], ['citron', 0.5], ['riz_basmati', 75],
      ['brocoli', 120], ['huile_olive', 7]],
  e: ['Saisir le poulet 6 min.', 'Déglacer au citron.', 'Servir avec le riz.'] }
```

- `i` : `[identifiant d'ingrédient, quantité **pour une personne**]`, dans
  l'unité canonique de l'ingrédient (g, ml ou pièce) ;
- `t` minutes, `d` difficulté de 1 à 3, `s` saisons (omis = toute l'année) ;
- rien d'autre à renseigner : le reste est déduit.

Un ingrédient absent du catalogue s'ajoute dans `assets/data/ingredients.js`.
Lancez ensuite `node scripts/validate.js`.

---

## Précisions

Les valeurs nutritionnelles sont des ordres de grandeur issus de tables de
composition simplifiées, et les prix des moyennes de grande distribution : ils
servent à comparer et à équilibrer, pas à établir un suivi médical. Les
repères d'équilibre sont des repères de population générale ; un régime
particulier ou un suivi thérapeutique relève d'un professionnel de santé.
