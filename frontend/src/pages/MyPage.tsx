/**
 * 👨‍🏫 관리자 전용 대시보드 페이지 (2026-03-08 업데이트)
 * 모든 예약 현황 관리, 디자이너 관리, 결제 설정(GCash)을 통합 처리하는 시스템의 핵심 관리 도구입니다.
 * 학습 포인트: 탭 구조(Tab UI)를 활용하여 하나의 페이지에서 여러 관리 기능을 효율적으로 분리하는 방법을 제공합니다.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, Scissors, AlertCircle, LogOut } from 'lucide-react';
import { bookingsApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Booking {
    id: string;
    style_id: number;
    name_ko?: string;
    name_en?: string;
    img_url?: string;
    designer: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
}

const translations: Record<string, any> = {
    ko: {
        home: "홈으로",
        logout: "로그아웃",
        myProfile: "마이페이지",
        customer: "고객님",
        member: "K-Barber 멤버",
        myBookings: "내 예약 내역",
        fetching: "불러오는 중...",
        noBookings: "예약 내역이 없습니다.",
        manageStyles: "스타일/이미지 관리",
        firstBooking: "첫 예약 하러 가기",
        newBooking: "+ 새 예약 하기",
        cancelConfirm: "예약을 취소하시겠습니까?",
        cancelSuccess: "취소되었습니다.",
        cancelFail: "취소 실패",
        serverError: "서버 연결 실패",
        cancelling: "취소 중...",
        cancelBtn: "예약 취소",
        status: {
            pending: { label: '예약 대기', color: 'text-yellow-400' },
            confirmed: { label: '예약 확정', color: 'text-green-400' },
            cancelled: { label: '취소됨', color: 'text-muted-foreground line-through' },
        }
    },
    en: {
        home: "Home",
        logout: "Logout",
        myProfile: "My Profile",
        customer: "Customer",
        member: "K-Barber Member",
        myBookings: "My Bookings",
        fetching: "Loading...",
        noBookings: "No booking history found.",
        manageStyles: "Manage Styles/Images",
        firstBooking: "Make Your First Booking",
        newBooking: "+ New Booking",
        cancelConfirm: "Do you want to cancel this booking?",
        cancelSuccess: "Cancelled successfully.",
        cancelFail: "Cancellation failed",
        serverError: "Server connection failed",
        cancelling: "Cancelling...",
        cancelBtn: "Cancel Booking",
        status: {
            pending: { label: 'Pending', color: 'text-yellow-400' },
            confirmed: { label: 'Confirmed', color: 'text-green-400' },
            cancelled: { label: 'Cancelled', color: 'text-muted-foreground line-through' },
        }
    },
    tl: {
        home: "Home",
        logout: "Logout",
        myProfile: "Aking Profile",
        customer: "Customer",
        member: "Miyembro ng K-Barber",
        myBookings: "Aking mga Booking",
        fetching: "Naglo-load...",
        noBookings: "Walang nahanap na kasaysayan ng booking.",
        firstBooking: "Gawin ang Iyong Unang Booking",
        newBooking: "+ Bagong Booking",
        cancelConfirm: "Gusto mo bang kanselahin ang booking na ito?",
        cancelSuccess: "Matagumpay na nakansela.",
        cancelFail: "Nabigo ang pagkansela",
        serverError: "Nabigo ang koneksyon sa server",
        cancelling: "Kinakansela...",
        cancelBtn: "Kanselahin ang Booking",
        status: {
            pending: { label: 'Nakabinbin', color: 'text-yellow-400' },
            confirmed: { label: 'Nakumpirma', color: 'text-green-400' },
            cancelled: { label: 'Nakansela', color: 'text-muted-foreground line-through' },
        }
    },
    ceb: {
        home: "Home",
        logout: "Logout",
        myProfile: "Akong Profile",
        customer: "Customer",
        member: "Miyembro sa K-Barber",
        myBookings: "Akong mga Booking",
        fetching: "Nag-load...",
        noBookings: "Walay nakit-an nga kasaysayan sa booking.",
        manageStyles: "Pagdumala sa mga Estilo",
        firstBooking: "Himoa ang Imong Unang Booking",
        newBooking: "+ Bag-ong Booking",
        cancelConfirm: "Gusto ba nimo kanselahon kini nga booking?",
        cancelSuccess: "Malamposong nakansela.",
        cancelFail: "Napakyas ang pagkansela",
        serverError: "Napakyas ang koneksyon sa server",
        cancelling: "Nagkansela...",
        cancelBtn: "Kanselahon ang Booking",
        status: {
            pending: { label: 'Nagpaabot', color: 'text-yellow-400' },
            confirmed: { label: 'Nakumpirma', color: 'text-green-400' },
            cancelled: { label: 'Nakansela', color: 'text-muted-foreground line-through' },
        }
    }
};


export default function MyPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const { user, logout, isLoggedIn, isLoading } = useAuthContext();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [fetching, setFetching] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) navigate('/login');
    }, [isLoggedIn, isLoading, navigate]);

    // 내 예약 목록 불러오기
    useEffect(() => {
        if (!isLoggedIn) return;
        const load = async () => {
            try {
                // 👨‍🏫 shopId 'kbarber'를 명시적으로 전달합니다.
                const res = await bookingsApi.myBookings('kbarber');
                if (res.ok) setBookings(res.data.data ?? []);
            } catch { /* 서버 연결 실패 시 무시 */ }
            finally { setFetching(false); }
        };
        load();
    }, [isLoggedIn]);

    // 예약 취소
    const handleCancel = async (id: string) => {
        if (!confirm(t.cancelConfirm)) return;
        setCancellingId(id);
        try {
            // 👨‍🏫 shopId 'kbarber'를 명시적으로 전달합니다.
            const res = await bookingsApi.cancel('kbarber', id);
            if (res.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            } else {
                alert(res.data.message ?? t.cancelFail);
            }
        } catch {
            alert(t.serverError);
        } finally {
            setCancellingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* 네비게이션 */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <ArrowLeft size={18} /> {t.home}
                </button>
                <span className="text-xl font-black gold-gradient-text tracking-tighter uppercase">K-Barber</span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-400 transition-colors">
                    <LogOut size={16} /> {t.logout}
                </button>
            </nav>

            <div className="pt-28 px-6 max-w-2xl mx-auto">
                {/* 사용자 프로필 */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <User size={28} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{user?.name ?? t.customer}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-primary">{t.member}</p>
                            {/* 관리자/디자이너용 스타일 관리 링크 */}
                            <button
                                onClick={() => navigate('/admin/styles')}
                                className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full hover:bg-primary hover:text-white transition-all"
                            >
                                {t.manageStyles}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 예약 내역 */}
                <h2 className="text-xl font-bold mb-4">{t.myBookings}</h2>

                {fetching ? (
                    <div className="text-center py-16 text-muted-foreground">{t.fetching}</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16">
                        <Scissors size={40} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{language === 'ko' ? 'CORLEONE BARBERSHOP에 오신 것을 환영합니다.' : 'Welcome to CORLEONE BARBERSHOP.'}</p>
                        <p className="text-muted-foreground mb-6">{t.noBookings}</p>
                        <Link to="/booking" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">
                            {t.firstBooking}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((b, idx) => (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card rounded-2xl p-5"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold">
                                            {language === 'ko' ? b.name_ko : (b.name_en ?? `Style #${b.style_id}`)}
                                        </h3>
                                        <p className={`text-sm mt-0.5 ${t.status[b.status]?.color}`}>
                                            {t.status[b.status]?.label}
                                        </p>
                                    </div>
                                    {b.img_url && (
                                        <img src={b.img_url} alt="" className="w-16 h-12 object-cover rounded-lg" />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><User size={13} /> {b.designer}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={13} /> {b.booking_date}</span>
                                    <span className="flex items-center gap-1.5"><Clock size={13} /> {b.booking_time?.slice(0, 5)}</span>
                                </div>
                                {b.notes && (
                                    <p className="mt-2 text-xs text-muted-foreground flex items-start gap-1">
                                        <AlertCircle size={12} className="shrink-0 mt-0.5" /> {b.notes}
                                    </p>
                                )}
                                {b.status === 'pending' && (
                                    <button
                                        id={`cancel-${b.id}`}
                                        onClick={() => handleCancel(b.id)}
                                        disabled={cancellingId === b.id}
                                        className="mt-4 w-full py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all disabled:opacity-50"
                                    >
                                        {cancellingId === b.id ? t.cancelling : t.cancelBtn}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* 새 예약 버튼 */}
                <div className="mt-8">
                    <Link to="/booking" className="block w-full text-center bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90">
                        {t.newBooking}
                    </Link>
                </div>
            </div>
        </div>
    );
}
