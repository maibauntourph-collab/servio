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

const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: '예약 대기', color: 'text-yellow-400' },
    confirmed: { label: '예약 확정', color: 'text-green-400' },
    cancelled: { label: '취소됨', color: 'text-muted-foreground line-through' },
};

export default function MyPage() {
    const navigate = useNavigate();
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
                const res = await bookingsApi.myBookings();
                if (res.ok) setBookings(res.data.data ?? []);
            } catch { /* 서버 연결 실패 시 무시 */ }
            finally { setFetching(false); }
        };
        load();
    }, [isLoggedIn]);

    // 예약 취소
    const handleCancel = async (id: string) => {
        if (!confirm('예약을 취소하시겠습니까?')) return;
        setCancellingId(id);
        try {
            const res = await bookingsApi.cancel(id);
            if (res.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            } else {
                alert(res.data.message ?? '취소 실패');
            }
        } catch {
            alert('서버 연결 실패');
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
                    <ArrowLeft size={18} /> 홈으로
                </button>
                <span className="text-xl font-black gold-gradient-text tracking-tighter uppercase">K-Barber</span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-400 transition-colors">
                    <LogOut size={16} /> 로그아웃
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
                        <p className="text-xl font-bold">{user?.name ?? '고객님'}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <p className="text-xs text-primary mt-1">K-Barber 멤버</p>
                    </div>
                </motion.div>

                {/* 예약 내역 */}
                <h2 className="text-xl font-bold mb-4">내 예약 내역</h2>

                {fetching ? (
                    <div className="text-center py-16 text-muted-foreground">불러오는 중...</div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-16">
                        <Scissors size={40} className="text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-6">예약 내역이 없습니다.</p>
                        <Link to="/booking" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">
                            첫 예약 하러 가기
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
                                        <h3 className="font-bold">{b.name_ko ?? `스타일 #${b.style_id}`}</h3>
                                        <p className={`text-sm mt-0.5 ${statusLabel[b.status]?.color}`}>
                                            {statusLabel[b.status]?.label}
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
                                        {cancellingId === b.id ? '취소 중...' : '예약 취소'}
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* 새 예약 버튼 */}
                <div className="mt-8">
                    <Link to="/booking" className="block w-full text-center bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:opacity-90">
                        + 새 예약 하기
                    </Link>
                </div>
            </div>
        </div>
    );
}
