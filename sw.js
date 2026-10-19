/* Service Worker: macht die App offline nutzbar (iPhone: „Zum Home-Bildschirm“).
   Strategie: sofort aus dem Cache antworten, im Hintergrund aktualisieren.
   Neue Dateien (z. B. neues Thema) hier in FILES eintragen und VERSION erhöhen. */
const VERSION = 'nwt-v2';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './css/style.css', './js/app.js', './js/ipv6.js',
  './assets/icon.svg', './assets/icon-180.png', './assets/icon-192.png', './assets/icon-512.png',
  './topics/ipv6-aufbau.js', './topics/ipv6-subnetting.js', './topics/ipv6-adresstypen.js', './topics/slaac.js',
  './topics/dhcp.js', './topics/apipa.js', './topics/dns-hierarchie.js', './topics/dns-zonen.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (req.mode === 'navigate' ? cache.match('./index.html') : Response.error());
  }));
});
