// 👨‍🏫 Premium Service Worker for K-Barber (2026-03-05 v3)
// 오프라인(No-Wifi) 환경에서도 완벽하게 작동하도록 캐싱 전략을 강화합니다.

const CACHE_NAME = 'kbarber-premium-cache-v3';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/images/premium-qr-install.png',
    '/images/premium-qr-original.png',
    // 👨‍🏫 빌드 시 생성되는 정적 자산들은 브라우저가 자동으로 fetch 시 캐싱합니다.
];

// 설치 단계: 모든 필수 자산을 미리 다운로드(Pre-cache)
self.addEventListener('install', (event) => {
    console.log('👷 PWA: Installing Service Worker and Pre-caching assets...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 활성화 단계: 이전 캐시 정리
self.addEventListener('activate', (event) => {
    console.log('🚀 PWA: Service Worker Activated');
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// 요청 처리: Stale-While-Revalidate 전략
self.addEventListener('fetch', (event) => {
    // API 호출(백엔드 데이터)은 캐싱 제외
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
