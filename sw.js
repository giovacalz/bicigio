/* Service worker minimale: mette in cache solo la "shell" dell'app
   (HTML, manifest, icone) così l'app si apre anche offline.
   Mappa, ricerca e piste ciclabili restano online-only. */
var CACHE = "ciclo-shell-v1";
var SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function(ev){
  self.skipWaiting();
  ev.waitUntil(
    caches.open(CACHE).then(function(cache){ return cache.addAll(SHELL); })
  );
});

self.addEventListener("activate", function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(ev){
  var url = new URL(ev.request.url);
  // solo per richieste dello stesso dominio (la shell); tutto il resto (tile, GPS,
  // nominatim, overpass) passa dritto alla rete e non viene mai messo in cache.
  if (url.origin === location.origin){
    ev.respondWith(
      caches.match(ev.request).then(function(cached){
        return cached || fetch(ev.request);
      })
    );
  }
});
