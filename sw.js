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

// 3. NETWORK FIRST, FALLBACK TO CACHE
self.addEventListener('fetch', event => {
    // Chrome extension wale calls ko ignore karo
    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Agar internet chalu hai, toh naya data fetch karo aur cache update karo
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, resClone);
                });
                return response; // Hamesha fresh code milega!
            })
            .catch(() => {
                // Agar internet band hai (Offline), toh purana cache dikhao
                return caches.match(event.request);
            })
    );
});
