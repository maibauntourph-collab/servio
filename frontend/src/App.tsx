import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ShopLayout from './components/ShopLayout';

function App() {
    return (
        <AuthProvider>
            <LanguageProvider>
                <BrowserRouter>
                    <div className="min-h-screen bg-background text-foreground">
                        <Routes>
                            {/* 샵 코드 기반 라우팅 묶음 */}
                            <Route path="/:shopId" element={<ShopLayout />}>
                                <Route index element={<LandingPage />} />
                                <Route path="treatments" element={<TreatmentsPage />} />
                                <Route path="booking" element={<BookingPage />} />
                                <Route path="booking/:styleId" element={<BookingPage />} />
                                <Route path="login" element={<LoginPage />} />
                                <Route path="register" element={<RegisterPage />} />
                                <Route path="mypage" element={<MyPage />} />
                                <Route path="admin" element={<AdminPage />} />
                                <Route path="admin/treatments" element={<AdminTreatmentsPage />} />
                            </Route>

                            {/* 기본 경로로 오면 기본 샵(massage01)으로 리다이렉트 (임시) */}
                            <Route path="/" element={<Navigate to="/massage01" replace />} />
                        </Routes>
                    </div>
                </BrowserRouter>
            </LanguageProvider>
        </AuthProvider>
    );
}

export default App;
