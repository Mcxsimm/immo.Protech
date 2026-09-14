/* ==========================================================================
   Persistance locale
   --------------------------------------------------------------------------
   Tout reste dans le navigateur : aucune donnee n'est envoyee ailleurs.
   Les acces sont proteges, le stockage pouvant etre indisponible (navigation
   privee, cookies bloques) sans que l'application cesse de fonctionner.
   ========================================================================== */
(function (global) {
  'use strict';

  var CLE = 'semainier.v1';

  function lire() {
    try {
      var brut = localStorage.getItem(CLE);
      return brut ? JSON.parse(brut) : null;
    } catch (e) { return null; }
  }

  function ecrire(obj) {
    try {
      localStorage.setItem(CLE, JSON.stringify(obj));
      return true;
    } catch (e) { return false; }
  }

  function effacer() {
    try { localStorage.removeItem(CLE); } catch (e) { /* sans effet */ }
  }

  global.MP_STORE = { lire: lire, ecrire: ecrire, effacer: effacer, CLE: CLE };
})(typeof window !== 'undefined' ? window : globalThis);
