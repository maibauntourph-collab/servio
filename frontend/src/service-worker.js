const CACHE_NAME = 'massage-shop-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/favicon.ico',
    '/manifest.json'
];

// 서비스 워커 설치 및 리소스 캐싱 (학생들도 이해하기 쉽게: 앱을 오프라인에서도 작동하게 만듭니다)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 있으면 캐시 반환, 없으면 네트워크 요청
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
            )
    );
});
