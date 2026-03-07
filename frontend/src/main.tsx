import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 👨‍🏫 최적화: 서비스 워커를 바로 등록하여 백그라운드에서 즉시 정적 에셋(앱 리소스)들을 캐싱하게 만듭니다.
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
