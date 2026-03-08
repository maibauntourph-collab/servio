/**
 * 👨‍🏫 App.tsx — 라우팅 및 전역 프로바이더 설정 (2026-03-08 업데이트)
 * React Router v6를 이용해 페이지를 연결하고, Auth/Language 컨텍스트를 앱 전체에 주입합니다.
 * 학습 포인트: 최상위 컴포넌트에서 Context Provider로 가로채기(Wrapping)를 하여 전역 상태를 관리하는 구조입니다.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import TreatmentsPage from './pages/TreatmentsPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import AdminTreatmentsPage from './pages/AdminTreatmentsPage';

function App() {
    return (
        // AuthProvider: 앱 전체에 로그인 상태를 제공하는 래퍼
        <AuthProvider>
            <LanguageProvider>
                <BrowserRouter>
                    <div className="min-h-screen bg-background text-foreground">
                        <Routes>
                            {/* 메인 랜딩 페이지 */}
                            <Route path="/" element={<LandingPage />} />
                            {/* 트리트먼트 갤러리 */}
                            <Route path="/treatments" element={<TreatmentsPage />} />
                            {/* 예약 페이지 */}
                            <Route path="/booking" element={<BookingPage />} />
                            <Route path="/booking/:styleId" element={<BookingPage />} />
                            {/* 로그인 / 회원가입 */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            {/* 마이페이지 */}
                            <Route path="/mypage" element={<MyPage />} />
                            {/* 관리자 페이지 */}
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/treatments" element={<AdminTreatmentsPage />} />
                        </Routes>
                    </div>
                </BrowserRouter>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
