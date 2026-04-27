// ====================================
// ⭐ SMART AUTO-LIVE SERVICE WORKER ⭐
// (Network-First Strategy)
// ====================================

const CACHE_NAME = 'pari-jiya-cache-smart';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-512.png'
];

// 1. Install SW & Cache Important Files
self.addEventListener('install', event => {
    self.skipWaiting(); // Naya SW turant active hoga
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// 2. Activate SW & Clean Old Caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. NETWORK FIRST, FALLBACK TO CACHE (With Bypass)
self.addEventListener('fetch', event => {
    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        // 👇 Ye { cache: 'no-store' } browser ko fresh code laane par majboor karega
        fetch(event.request, { cache: 'no-store' }) 
            .then(response => {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, resClone);
                });
                return response; 
            })
            .catch(() => {
                // Agar internet off hai, tab purana cache dikhao
                return caches.match(event.request);
            })
    );
});
