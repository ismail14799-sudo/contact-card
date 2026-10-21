const CACHE = 'protected-contact-shell-v5';
const SHELL = ['./', './index.html', './styles.css?v=2.2', './core.js?v=2.2', './secure.js?v=2.2', './device.js?v=2.2', './app.js?v=2.2', './manifest.webmanifest?v=2.2', './vendor/qrcode.js', './assets/icon.svg', './assets/app-icon-180.png', './assets/app-icon-192.png', './assets/app-icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('protected-contact-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
  event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
  } else if (SHELL.some(path => new URL(path,self.location).pathname === url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
  }
});
