import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 👨‍🏫 main.tsx — 애플리케이션 엔트리 포인트 (2026-03-08 업데이트)
// 최적화: 서비스 워커를 등록하여 PWA 기능을 활성화하고 오프라인 캐싱을 지원합니다.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ PWA Service Worker Registered', reg.scope))
            .catch(err => console.error('❌ Service Worker Registration failed:', err));
    });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
