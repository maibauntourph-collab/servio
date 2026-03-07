/**
 * 👨‍🏫 App.tsx — 라우팅 설정 파일 (2026-03-03)
 * React Router v6를 이용해 각 URL에 맞는 페이지 컴포넌트를 연결합니다.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import StylesPage from './pages/StylesPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';

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
                            {/* 스타일 갤러리 */}
                            <Route path="/styles" element={<StylesPage />} />
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
                        </Routes>
                    </div>
                </BrowserRouter>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
