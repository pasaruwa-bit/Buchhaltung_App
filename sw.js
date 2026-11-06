// Offline-Cache: App funktioniert auch ohne Internet
const CACHE = 'budget-v14';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || e.request.method !== 'GET') return; // GitHub-API nie cachen
  if (u.pathname.endsWith('.webm')) return; // Videos direkt laden (Teil-Anfragen nicht cachen)
  // zuerst Netz (damit Updates sofort ankommen), sonst Cache
  // Seiten am Server neu prüfen (GitHub Pages lässt sie sonst bis 10 Minuten im Browser-Cache)
  const html = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  e.respondWith(fetch(e.request, html ? { cache: 'no-cache' } : undefined).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
