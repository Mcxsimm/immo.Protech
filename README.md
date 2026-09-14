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
- Export par copie, téléchargement `.txt` ou impression ;
- **Envoi vers l'app Rappels de l'iPhone** (voir ci-dessous).

### 5. La liste part dans Rappels (iPhone, iPad, Mac)

Apple n'expose aucun moyen d'écrire directement dans Rappels depuis une page
web. Deux chemins existent, présentés dans cet ordre :

- **Copier-coller — rien à installer.** Un bouton copie la liste, une ligne
  par article ; dans Rappels, ouvrez votre liste et collez : un rappel est
  créé par ligne. Sur les appareils qui proposent la feuille de partage iOS,
  un bouton *Partager* permet aussi d'envoyer la liste vers Notes, Messages ou
  un raccourci.
- **Envoi automatique — un raccourci à créer une fois.** Un bouton ouvre
  l'app Raccourcis et lui passe la liste ; un raccourci de quatre actions
  (*Diviser le texte* → *Répéter pour chaque élément* → *Ajouter un nouveau
  rappel*) crée un rappel par article. Tant que ce raccourci n'existe pas,
  iOS répond « Le fichier n'existe pas » : la marche à suivre reste donc
  dépliée dans l'application jusqu'à ce que vous confirmiez l'avoir créé.

Vous indiquez le **nom de votre liste Rappels** ; les instructions s'y
réfèrent nommément, pour qu'il n'y ait rien à deviner à l'étape de création.
Dans les deux cas les articles déjà cochés sont omis, et deux options
permettent de préfixer chaque ligne par son rayon et d'inclure ou non les
produits de placard. Le bouton Raccourcis copie aussi la liste au passage :
si l'app est absente ou le raccourci introuvable, rien n'est perdu.

### 6. Vos propres recettes

Un éditeur intégré permet d'ajouter vos recettes sans toucher au code :

- **recherche d'ingrédients** parmi les 205 du catalogue, avec une quantité de
  départ proposée selon la famille de l'aliment ;
- **saisie pour le nombre de personnes qui vous arrange** (4 par défaut) : la
  conversion par personne s'affiche sous chaque ligne et c'est elle qui est
  enregistrée, pour que la recette s'adapte ensuite à n'importe quel nombre de
  convives ;
- **aperçu en direct** : calories, protéines, légumes, coût, type de plat
  détecté, base féculente, compatibilité avec les régimes, allergènes et
  repères d'équilibre se recalculent à chaque modification ;
- **ingrédient absent du catalogue** : vous pouvez le créer (rayon, famille,
  unité, allergènes). Les valeurs nutritionnelles sont facultatives, mais leur
  absence est signalée, car elle fausse l'analyse ;
- **« Adapter à ma façon »** duplique n'importe quelle recette du catalogue
  pour en faire votre version ;
- vos recettes entrent dans la génération des semaines comme les autres, avec
  un réglage pour les proposer souvent (sans lui, une poignée de recettes
  maison se noierait parmi 200) ;
- **export et import** au format JSON pour les sauvegarder, les transférer ou
  les partager, et un bouton qui copie le code prêt à contribuer au catalogue.

Vos recettes sont stockées séparément du reste : réinitialiser la semaine ou
les réglages ne les efface jamais.

### 7. Le reste
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
assets/js/custom.js         recettes et ingrédients créés par l'utilisateur
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
2. **Amorçage** : si l'envie désigne clairement un plat (« gratin de courgettes
   de mamie »), ce plat est placé d'office, à hauteur du nombre de repas
   demandé pour cette envie. Sans cela, une recette nommément réclamée n'était
   retenue que trois fois sur vingt ;
3. **Tirage pondéré** : l'envie, la saison et vos recettes personnelles
   augmentent les chances d'une recette ; plusieurs centaines de semaines
   candidates sont tirées ;
4. **Notation** : chaque semaine candidate reçoit une note qui agrège les
   repères nutritionnels, la variété et l'anti-gaspi. Le bonus d'envie est
   **plafonné au nombre de repas demandé** : un plat de plus dans le même goût
   ne rapporte rien, et ne peut donc pas évincer les repères d'équilibre ;
5. **Amélioration locale** : on remplace des repas un à un tant que la note
   progresse, en respectant les repas verrouillés et les plats amorcés.

Le tirage est **déterministe à graine fixée** : à graine égale, même semaine —
ce qui rend les résultats reproductibles et testables.

Sur 30 semaines tirées dans chacun des cas testés (sans envie, envie
d'ingrédient, envie de cuisine, régime végétarien, 7 repas), tous les repères
d'équilibre sont atteints.

---

## Ajouter une recette

**Depuis l'application** : onglet *Recettes* → **Créer une recette**. C'est la
voie normale ; rien à installer, et la recette est immédiatement utilisable
dans vos semaines.

**Dans le catalogue livré**, pour proposer une recette à tout le monde :
ajoutez une entrée dans `assets/data/recipes.js`.

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

Le bouton **Copier le code source**, dans l'éditeur, produit directement ce
bloc à partir d'une recette que vous avez créée dans l'application.

Un ingrédient absent du catalogue s'ajoute dans `assets/data/ingredients.js`.
Lancez ensuite `node scripts/validate.js`.

---

## Précisions

Les valeurs nutritionnelles sont des ordres de grandeur issus de tables de
composition simplifiées, et les prix des moyennes de grande distribution : ils
servent à comparer et à équilibrer, pas à établir un suivi médical. Les
repères d'équilibre sont des repères de population générale ; un régime
particulier ou un suivi thérapeutique relève d'un professionnel de santé.
