/**
 * 👨‍🏫 예약 페이지 (2026-03-03)
 * 스타일 선택 → 디자이너 선택 → 날짜/시간 선택 → 확인 → 예약 완료
 * 로그인 필요, 비로그인 시 로그인 페이지로 리다이렉트
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { hairstyles } from '../data/hairstyles';
import { bookingsApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import LoginModal from '../components/auth/LoginModal';

const DESIGNERS = ['Master Kim', 'Barber Lee', 'Director Park', 'Stylist Choi', 'Senior Jung'];
const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

// 오늘부터 14일 후까지 예약 가능일 생성
function getAvailableDates(): string[] {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        // 화요일(2) 제외 (정기 휴무)
        if (d.getDay() !== 2) {
            dates.push(d.toISOString().split('T')[0]);
        }
    }
    return dates;
}

export default function BookingPage() {
    const { styleId } = useParams<{ styleId?: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthContext();

    // 👨‍🏫 즉시 로그인 리다이렉트는 제거합니다. (비회원 스타일 탐색 허용)
    // useEffect(() => {
    //     if (!isLoggedIn) navigate('/login');
    // }, [isLoggedIn, navigate]);

    // 선택한 스타일 (URL 파라미터로 사전 선택 가능)
    const initialStyle = styleId ? hairstyles.find(h => h.id === Number(styleId)) : undefined;

    const [step, setStep] = useState(initialStyle ? 2 : 1); // 스타일이 선택됐으면 step 2부터
    const [selectedStyle, setSelectedStyle] = useState(initialStyle);
    const [selectedDesigner, setSelectedDesigner] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [availableDates] = useState(getAvailableDates());
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // 👨‍🏫 예약 실행 함수
    const handleBook = async (directData?: any) => {
        const style = directData?.style || selectedStyle;
        const designer = directData?.designer || selectedDesigner;
        const date = directData?.date || selectedDate;
        const time = directData?.time || selectedTime;
        const bNotes = directData?.notes ?? notes;

        if (!style || !designer || !date || !time) return;
        setLoading(true);
        setError('');
        try {
            const res = await bookingsApi.create({
                style_id: style.id,
                designer,
                booking_date: date,
                booking_time: time,
                notes: bNotes,
            });
            if (res.ok) {
                setDone(true);
                sessionStorage.removeItem('pending_booking');
                sessionStorage.removeItem('booking_auto_submit');
            } else {
                setError(res.data.message ?? '예약에 실패했습니다.');
            }
        } catch {
            setError('서버 연결 실패. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 👨‍🏫 예약 상태 복원 및 자동 실행 (세션 스토리지)
    useEffect(() => {
        const saved = sessionStorage.getItem('pending_booking');
        const autoSubmit = sessionStorage.getItem('booking_auto_submit') === 'true';

        if (saved) {
            try {
                const data = JSON.parse(saved);
                let restoredStyle = selectedStyle;
                if (data.styleId) {
                    const style = hairstyles.find(h => h.id === data.styleId);
                    if (style) {
                        setSelectedStyle(style);
                        restoredStyle = style;
                    }
                }
                if (data.designer) setSelectedDesigner(data.designer);
                if (data.date) setSelectedDate(data.date);
                if (data.time) setSelectedTime(data.time);
                if (data.notes) setNotes(data.notes);
                if (data.step) setStep(data.step);

                // 👨‍🏫 로그인 성공 후 자동 예약 실행
                if (autoSubmit && isLoggedIn && data.step === 4) {
                    handleBook({
                        style: restoredStyle,
                        designer: data.designer,
                        date: data.date,
                        time: data.time,
                        notes: data.notes
                    });
                }

                // 로드 후 삭제 (일회성 복원)
                sessionStorage.removeItem('pending_booking');
            } catch (e) {
                console.error("Failed to restore booking state", e);
            }
        }
    }, [isLoggedIn]); // isLoggedIn이 true로 바뀌는 순간 체크

    // 👨‍🏫 예약 상태 저장 (로그인 리다이렉트 대비)
    useEffect(() => {
        if (step > 1 || selectedStyle) {
            const data = {
                styleId: selectedStyle?.id,
                designer: selectedDesigner,
                date: selectedDate,
                time: selectedTime,
                notes,
                step
            };
            sessionStorage.setItem('pending_booking', JSON.stringify(data));
        }
    }, [selectedStyle, selectedDesigner, selectedDate, selectedTime, notes, step]);

    if (done) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">예약 완료! 🎉</h2>
                    <p className="text-muted-foreground mb-2">{selectedStyle?.ko}</p>
                    <p className="text-muted-foreground mb-2">{selectedDesigner} 디자이너 · {selectedDate} · {selectedTime}</p>
                    <div className="flex gap-3 justify-center mt-8">
                        <Link to="/mypage" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">예약 내역 보기</Link>
                        <Link to="/" className="glass px-6 py-3 rounded-xl font-bold">홈으로</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* 네비 */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-5 px-6 md:px-12 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">뒤로</span>
                </button>
                <Link to="/" className="text-2xl font-black gold-gradient-text tracking-tighter uppercase">K-Barber</Link>
                {isLoggedIn
                    ? <Link to="/mypage" className="text-sm font-bold text-primary hover:underline transition-all">마이페이지</Link>
                    : <Link to="/login" className="text-sm text-primary font-black uppercase hover:underline tracking-tight transition-all">로그인</Link>
                }
            </nav>

            <div className="pt-28 px-6 max-w-2xl mx-auto">
                {/* 진행 단계 표시 (프리미엄 스타일) */}
                <div className="flex items-center justify-between mb-12 relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                    {[1, 2, 3, 4].map(s => (
                        <React.Fragment key={s}>
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${step >= s ? 'bg-primary text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#1a1c1e] border border-white/5 text-muted-foreground'}`}>
                                {s}
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* STEP 1: 스타일 검색 선택 */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6">1. 스타일 선택</h2>
                        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                            {hairstyles.slice(0, 20).map(h => (
                                <div key={h.id}
                                    id={`style-opt-${h.id}`}
                                    onClick={() => { setSelectedStyle(h); setStep(2); }}
                                    className={`glass-card rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-all ${selectedStyle?.id === h.id ? 'border-primary' : ''}`}>
                                    <img src={h.img} alt={h.ko} className="w-full aspect-video object-cover rounded-lg mb-2" />
                                    <p className="text-sm font-bold truncate">{h.ko}</p>
                                    <p className="text-xs text-primary">{h.price.toLocaleString()}원</p>
                                </div>
                            ))}
                        </div>
                        <Link to="/styles" className="block text-center text-sm text-primary mt-4 hover:underline">전체 {hairstyles.length}개 스타일 보기 →</Link>
                    </motion.div>
                )}

                {/* STEP 2: 디자이너 선택 */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-2">2. 디자이너 선택</h2>
                        {selectedStyle && <p className="text-muted-foreground mb-6">선택한 스타일: <span className="text-primary">{selectedStyle.ko}</span></p>}
                        <div className="space-y-3">
                            {DESIGNERS.map(d => (
                                <button key={d} id={`designer-${d.replace(' ', '-')}`}
                                    onClick={() => { setSelectedDesigner(d); setStep(3); }}
                                    className={`w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all ${selectedDesigner === d ? 'border-primary' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <UserIcon size={18} className="text-primary" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold">{d}</p>
                                        <p className="text-xs text-muted-foreground">K-Barber 소속 디자이너</p>
                                    </div>
                                    {selectedDesigner === d && <Check size={18} className="text-primary ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="mt-6 text-sm text-muted-foreground hover:text-primary">← 스타일 다시 선택</button>
                    </motion.div>
                )}

                {/* STEP 3: 날짜 & 시간 선택 */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6">3. 날짜 & 시간</h2>
                        {/* 날짜 선택 */}
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2"><Calendar size={16} /> 날짜 선택 (화요일 휴무)</p>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {availableDates.map(d => {
                                const date = new Date(d);
                                const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
                                return (
                                    <button key={d} id={`date-${d}`}
                                        onClick={() => setSelectedDate(d)}
                                        className={`rounded-xl p-2 text-center border transition-all ${selectedDate === d ? 'bg-primary text-primary-foreground border-primary' : 'glass-card border-transparent hover:border-primary/30'}`}>
                                        <p className="text-xs text-muted-foreground">{day}요일</p>
                                        <p className="text-sm font-bold">{d.slice(8)}</p>
                                        <p className="text-xs text-muted-foreground">{d.slice(5, 7)}월</p>
                                    </button>
                                );
                            })}
                        </div>
                        {/* 시간 선택 */}
                        {selectedDate && (
                            <>
                                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2"><Clock size={16} /> 시간 선택</p>
                                <div className="grid grid-cols-4 gap-2 mb-6">
                                    {TIME_SLOTS.map(t => (
                                        <button key={t} id={`time-${t}`}
                                            onClick={() => setSelectedTime(t)}
                                            className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedTime === t ? 'bg-primary text-primary-foreground border-primary' : 'glass-card border-transparent hover:border-primary/30'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {selectedDate && selectedTime && (
                            <button onClick={() => setStep(4)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold">다음 →</button>
                        )}
                        <button onClick={() => setStep(2)} className="mt-4 text-sm text-muted-foreground hover:text-primary">← 디자이너 다시 선택</button>
                    </motion.div>
                )}

                {/* STEP 4: 확인 & 예약 완료 */}
                {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6">4. 예약 확인</h2>
                        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
                            <div className="flex justify-between"><span className="text-muted-foreground">스타일</span><span className="font-bold">{selectedStyle?.ko}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">가격</span><span className="text-primary font-bold">{selectedStyle?.price.toLocaleString()}원</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">디자이너</span><span className="font-bold">{selectedDesigner}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">날짜</span><span className="font-bold">{selectedDate}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">시간</span><span className="font-bold">{selectedTime}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">소요 시간</span><span className="font-bold">{selectedStyle?.duration}분</span></div>
                        </div>
                        <textarea
                            placeholder="요청사항이 있으면 입력해주세요 (선택)"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 mb-4 h-24 resize-none"
                        />
                        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}

                        {isLoggedIn ? (
                            <button id="confirm-booking" onClick={handleBook} disabled={loading}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                                {loading ? '예약 중...' : '✅ 예약 확정하기'}
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-center">
                                    <p className="text-sm text-primary font-medium">예약을 확정하시려면 로그인이 필요합니다.</p>
                                </div>
                                <button onClick={() => {
                                    sessionStorage.setItem('booking_auto_submit', 'true');
                                    setIsLoginModalOpen(true);
                                }} className="block w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg text-center hover:opacity-90 transition-opacity">
                                    3초 만에 예약 로그인하기
                                </button>
                                <p className="text-center text-xs text-muted-foreground">
                                    간편하게 SNS로 로그인하시면 바로 예약이 진행됩니다.
                                </p>
                            </div>
                        )}
                        <button onClick={() => setStep(3)} className="mt-4 text-sm text-muted-foreground hover:text-primary w-full text-center">← 날짜/시간 다시 선택</button>
                    </motion.div>
                )}
            </div>

            {/* 로그인 모달 연동 */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>
    );
}
