/* Service worker minimal : l'application fonctionne hors connexion une fois
   consultee. Le cache est versionne, les anciennes versions sont purgees. */
var CACHE = 'semainier-v3';
var FICHIERS = [
  './', './index.html', './manifest.webmanifest',
  './assets/css/app.css',
  './assets/data/ingredients.js', './assets/data/recipes.js',
  './assets/data/recipes-maison.js',
  './assets/js/nutrition.js', './assets/js/planner.js',
  './assets/js/shopping.js', './assets/js/store.js', './assets/js/custom.js',
  './assets/js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (rep) {
      return rep || fetch(e.request).then(function (net) {
        var copie = net.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copie); });
        return net;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
