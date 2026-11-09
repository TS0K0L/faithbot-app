// faithBOT app: keeps the app itself (code, styles, fonts, pictures) on the phone, so it opens at once and works offline.
// The data is kept by the app (localStorage); this file only serves the app's own files.
const V = 'fb-v30';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const own = url.origin === location.origin;
  const pic = /i\.ytimg\.com$/.test(url.hostname);
  if (!own && !pic) return; // the bot's answers and Telegram's script go straight to the network
  if (own && (req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname))) { // the page: fresh when online, saved when not
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('./index.html', c)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  // files with a fingerprint in their name, fonts, emoji and video pictures never change: saved once, then instant
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); } return r; })));
});
