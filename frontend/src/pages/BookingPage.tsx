/**
 * 👨‍🏫 예약 페이지 (2026-03-03)
 * 스타일 선택 → 디자이너 선택 → 날짜/시간 선택 → 확인 → 예약 완료
 * 로그인 필요, 비로그인 시 로그인 페이지로 리다이렉트
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Calendar, Clock, User as UserIcon } from 'lucide-react';
import { treatments } from '../data/treatments';
import { bookingsApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoginModal from '../components/auth/LoginModal';
import GcashPaymentModal from '../components/booking/GcashPaymentModal';

// \uD83D\uDC68\u200D\uD83C\uDFEB \uC608\uC57D \uD398\uC774\uC9C0 \uBC88\uC5ED \uB370\uC774\uD130
const translations: Record<string, any> = {
    ko: {
        title: "실시간 온라인 예약",
        step1: { title: "1. 트리트먼트 선택", more: "전체 프로그램 보기 \u2192" },
        step2: { title: "2. 테라피스트 선택", selected: "선택한 프로그램" },
        step3: { title: "3. 날짜 & 시간", date: "날짜 선택", time: "시간 선택", tenMin: "10\uBD84 \uB2E8\uC704 \uC120\uD0DD \uAC00\uB2A5" },
        step4: { title: "4. 예약 확인", style: "\uD504\uB85C\uADF8\uB7A8", price: "\uAC00\uACA9", designer: "\uD14C\uB77C\uD53C\uC2A4\uD1B8", date: "\uB0A0\uC9DC", time: "\uC2DC\uAC04", duration: "\uC18C\uC694 \uC2DC\uAC04", min: "\uBD84", notes: "\uC694\uCCAD\uC0AC\uD56D\uC774 \uC700\uC704\uBA74 \uC785\uB825\uD574\uC8FC\uC138\uC694 (\uC120\uD0DD)" },
        btn: { next: "\uB2E4\uC74C \u2192", back: "\uB4A4\uB85C", backStyle: "\u2190 \uD504\uB85C\uADF8\uB7A8 \uB2E4\uC2DC \uC120\uD0DD", backDesigner: "\u2190 \uD14C\uB77C\uD53C\uC2A4\uD1B8 \uB2E4\uC2DC \uC120\uD0DD", backTime: "\u2190 \uB0A0\uC9DC/\uC2DC\uAC04 \uB2E4\uC2DC \uC120\uD0DD", confirm: "\u2705 \uC608\uC57D \uD655\uC815\uD558\uAE30", booking: "\uC608\uC57D \uC911...", login: "3\uCD08 \uB9CC\uC601 \uC608\uC57D \uB85C\uADF8\uC778\uD558\uAE30", loginMsg: "\uC608\uC57D\uC744 \uD655\uC815\uD558\uC2DC\uB824\uBA74 \uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.", snsMsg: "\uAC04\uD3B8\uD558\uAC8C SNS\uB85C \uB85C\uADF8\uC778\uD558\uC2DC\uBA74 \uBC11\uB85C \uC608\uC57D\uC774 \uC9C4\uD589\uB429\uB2C8\uB2E4." },
        msg: { success: "\uC608\uC57D\uC774 \uC604\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4! \uD83C\uDF89", fail: "\uC608\uC57D\uC5D0 \uC2E4\uD328\uD534\uC2B5\uB2C8\uB2E4.", error: "\uC114\uBC84 \uC5F0\uACB0 \uC2E4\uD328. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.", mypage: "\uC608\uC57D \uB0B4\uC5ED \uBC34\uAE30", home: "\uD648\uC73C\uB85C" }
    },
    en: {
        title: "Online Booking",
        step1: { title: "1. Select Style", more: "View All Styles \u2192" },
        step2: { title: "2. Select Designer", selected: "Selected Style" },
        step3: { title: "3. Date & Time", date: "Select Date (Closed on Tue)", time: "Select Time", tenMin: "10-minute intervals available" },
        step4: { title: "4. Confirmation", style: "Style", price: "Price", designer: "Designer", date: "Date", time: "Time", duration: "Duration", min: "min", notes: "Notes or special requests (optional)" },
        btn: { next: "Next \u2192", back: "Back", backStyle: "\u2190 Change Style", backDesigner: "\u2190 Change Designer", backTime: "\u2190 Change Date/Time", confirm: "\u2705 Confirm Booking", booking: "Booking...", login: "Login to Book", loginMsg: "Login is required to confirm booking.", snsMsg: "Quick login with SNS to proceed immediately." },
        msg: { success: "Booking confirmed! \u2122", fail: "Booking failed.", error: "Server error. Please try again later.", mypage: "View Bookings", home: "Home" }
    },
    tl: {
        title: "Online Booking",
        step1: { title: "1. Pumili ng Istilo", more: "Tingnan ang Lahat ng Istilo \u2192" },
        step2: { title: "2. Pumili ng Designer", selected: "Napiling Istilo" },
        step3: { title: "3. Petsa at Oras", date: "Pumili ng Petsa (Sarado ng Martes)", time: "Pumili ng Oras", tenMin: "Magagamit ang 10-minute intervals" },
        step4: { title: "4. Kumpirmasyon", style: "Istilo", price: "Presyo", designer: "Designer", date: "Petsa", time: "Oras", duration: "Katagalan", min: "min", notes: "Mga kahilingan o tala (opsyonal)" },
        btn: { next: "Susunod \u2192", back: "Bumalik", backStyle: "\u2190 Baguhin ang Istilo", backDesigner: "\u2190 Baguhin ang Designer", backTime: "\u2190 Baguhin ang Petsa/Oras", confirm: "\u2705 Kumpirmahin ang Booking", booking: "Nagbu-book...", login: "Mag-login para Mag-book", loginMsg: "Kailangan ang login para makumpirma ang booking.", snsMsg: "Mabilis na pag-login gamit ang SNS para tumuloy agad." },
        msg: { success: "Kumpirmado na ang booking! \uD83C\uDF89", fail: "Bigo ang pag-book.", error: "May error sa server. Subukan muli mamaya.", mypage: "Tingnan ang mga Booking", home: "Home" }
    },
    ceb: {
        title: "Online Booking",
        step1: { title: "1. Pagpili og Estilo", more: "Tan-awa ang Tanan nga Estilo \u2192" },
        step2: { title: "2. Pagpili og Designer", selected: "Napili nga Estilo" },
        step3: { title: "3. Petsa ug Oras", date: "Pagpili og Petsa (Sira matag Martes)", time: "Pagpili og Oras", tenMin: "Magamit ang 10-minute intervals" },
        step4: { title: "4. Kumpirmasyon", style: "Estilo", price: "Presyo", designer: "Designer", date: "Petsa", time: "Oras", duration: "Gidugayon", min: "min", notes: "Mga hangyo o mubo nga sulat (opsyonal)" },
        btn: { next: "Sunod \u2192", back: "Balik", backStyle: "\u2190 Usba ang Estilo", backDesigner: "\u2190 Usba ang Designer", backTime: "\u2190 Usba ang Petsa/Oras", confirm: "\u2705 Kumpirmaha ang Booking", booking: "Nag-book...", login: "Mag-login aron Mag-book", loginMsg: "Kinahanglan ang login aron makumpirma ang booking.", snsMsg: "Dali nga pag-login gamit ang SNS aron mapadayon dayon." },
        msg: { success: "Kumpirmado na ang booking! \uD83C\uDF89", fail: "Napakyas ang pag-book.", error: "Naay error sa server. Palihug suwayi pag-usab unya.", mypage: "Tan-awa ang mga Booking", home: "Home" }
    }
};

// ... (생략된 generateTimeSlots, DESIGNERS, TIME_SLOTS, getAvailableDates 함수는 동일)

// \uD83D\uDC68\u200D\uD83C\uDFEB \uC608\uC57D \uD544\uC694 \uB370\uC774\uD130 (2026-03-08)
// Array.from\uACFC padStart\uB97C \uC0AC\uC6A9\uD558\uC5EC \uC2DC\uAC04 \uD3EC\uB9E4\uD305.
function generateTimeSlots(): string[] {
    const slots: string[] = [];
    const START_HOUR = 10;
    const END_HOUR = 20;
    for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
        for (let minute = 0; minute < 60; minute += 10) {
            if (hour === END_HOUR && minute > 0) break;
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
        }
    }
    return slots;
}

const THERAPISTS = ['Master Kim', 'Therapist Lee', 'Manager Park', 'Therapist Choi', 'Senior Jung'];
const TIME_SLOTS = generateTimeSlots();

function getAvailableDates(): string[] {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
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
    const { language } = useLanguage();
    const t = translations[language] || translations.en;

    const initialTreatment = styleId ? treatments.find(t_item => t_item.id === Number(styleId)) : undefined;
    const [step, setStep] = useState(initialTreatment ? 2 : 1);
    const [selectedTreatment, setSelectedTreatment] = useState(initialTreatment);
    const [selectedTherapist, setSelectedTherapist] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [availableDates] = useState(getAvailableDates());
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isGcashModalOpen, setIsGcashModalOpen] = useState(false);

    const handleBook = async (directData?: any) => {
        const treatment = directData?.treatment || selectedTreatment;
        const therapist = directData?.therapist || selectedTherapist;
        const date = directData?.date || selectedDate;
        const time = directData?.time || selectedTime;
        const bNotes = directData?.notes ?? notes;
        if (!treatment || !therapist || !date || !time) return;
        setLoading(true);
        setError('');
        try {
            const res = await bookingsApi.create({
                style_id: treatment.id,
                designer: therapist,
                booking_date: date,
                booking_time: time,
                notes: bNotes,
                ref_number: directData?.ref_number,
            });
            if (res.ok) {
                setDone(true);
                sessionStorage.removeItem('pending_booking');
                sessionStorage.removeItem('booking_auto_submit');
            } else {
                setError(res.data.message || t.msg.fail);
            }
        } catch (err: any) {
            console.error('\u274C Booking Failure:', err);
            setError(`${t.msg.error} (${err.message || 'Error'})`);
        } finally {
            setLoading(false);
            setIsGcashModalOpen(false);
        }
    };

    useEffect(() => {
        const saved = sessionStorage.getItem('pending_booking');
        const autoSubmit = sessionStorage.getItem('booking_auto_submit') === 'true';
        if (saved) {
            try {
                const data = JSON.parse(saved);
                let restoredTreatment = selectedTreatment;
                if (data.styleId) {
                    const treatment = treatments.find(t_item => t_item.id === data.styleId);
                    if (treatment) { setSelectedTreatment(treatment); restoredTreatment = treatment; }
                }
                if (data.designer) setSelectedTherapist(data.designer);
                if (data.date) setSelectedDate(data.date);
                if (data.time) setSelectedTime(data.time);
                if (data.notes) setNotes(data.notes);
                if (data.step) setStep(data.step);
                if (autoSubmit && isLoggedIn && data.step === 4) {
                    handleBook({ treatment: restoredTreatment, therapist: data.designer, date: data.date, time: data.time, notes: data.notes });
                }
                sessionStorage.removeItem('pending_booking');
            } catch (e) { console.error("Restore failed", e); }
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (step > 1 || selectedTreatment) {
            const data = { styleId: selectedTreatment?.id, designer: selectedTherapist, date: selectedDate, time: selectedTime, notes, step };
            sessionStorage.setItem('pending_booking', JSON.stringify(data));
        }
    }, [selectedTreatment, selectedTherapist, selectedDate, selectedTime, notes, step]);

    // \uD83D\uDC68\u200D\uD83C\uDFEB \uC608\uC57D \uC644\uB8CC \uD654\uBA74 (\uB2E4\uAD6D\uC5B4)
    if (done) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{t.msg.success}</h2>
                    <p className="text-muted-foreground mb-2">{language === 'ko' ? selectedTreatment?.ko : selectedTreatment?.en}</p>
                    <p className="text-muted-foreground mb-2">{selectedTherapist} \u00B7 {selectedDate} \u00B7 {selectedTime}</p>
                    <div className="flex gap-3 justify-center mt-8">
                        <Link to="/mypage" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">{t.msg.mypage}</Link>
                        <Link to="/" className="glass px-6 py-3 rounded-xl font-bold">{t.msg.home}</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-5 px-6 md:px-12 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">{t.btn.back}</span>
                </button>
                <Link to="/" className="text-2xl font-black gold-gradient-text tracking-tighter uppercase">MassageShop</Link>
                {isLoggedIn
                    ? <Link to="/mypage" className="text-sm font-bold text-primary hover:underline transition-all">My Page</Link>
                    : <Link to="/login" className="text-sm text-primary font-black uppercase hover:underline tracking-tight transition-all">Login</Link>
                }
            </nav>

            <div className="pt-28 px-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-12 relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${step >= s ? 'bg-primary text-black scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-[#1a1c1e] border border-white/5 text-muted-foreground'}`}>{s}</div>
                    ))}
                </div>

                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6">{t.step1.title}</h2>
                        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                            {treatments.slice(0, 20).map(t_item => (
                                <div key={t_item.id} onClick={() => { setSelectedTreatment(t_item); setStep(2); }} className={`glass-card rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-all ${selectedTreatment?.id === t_item.id ? 'border-primary' : ''}`}>
                                    <img src={t_item.img} alt={t_item[language as keyof typeof t_item] as string} className="w-full aspect-video object-cover rounded-lg mb-2" />
                                    <p className="text-sm font-bold truncate">{t_item[language as keyof typeof t_item] as string}</p>
                                    <p className="text-xs text-primary">\u20B1 {t_item.price.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        <Link to="/styles" className="block text-center text-sm text-primary mt-4 hover:underline">{t.step1.more}</Link>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-2">{t.step2.title}</h2>
                        {selectedTreatment && <p className="text-muted-foreground mb-6">{t.step2.selected}: <span className="text-primary">{selectedTreatment[language as keyof typeof selectedTreatment] as string}</span></p>}
                        <div className="space-y-3">
                            {THERAPISTS.map(d_name => (
                                <button key={d_name} onClick={() => { setSelectedTherapist(d_name); setStep(3); }} className={`w-full glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all ${selectedTherapist === d_name ? 'border-primary' : ''}`}>
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><UserIcon size={18} className="text-primary" /></div>
                                    <div className="text-left">
                                        <p className="font-bold">{d_name}</p>
                                        <p className="text-xs text-muted-foreground">{language === 'ko' ? 'Massage 전문 테라피스트' : 'MassageShop Professional Therapist'}</p>
                                    </div>
                                    {selectedTherapist === d_name && <Check size={18} className="text-primary ml-auto" />}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep(1)} className="mt-6 text-sm text-muted-foreground hover:text-primary">{t.btn.backStyle}</button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6">{t.step3.title}</h2>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2"><Calendar size={16} /> {t.step3.date}</p>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {availableDates.map(d => {
                                const date = new Date(d);
                                const dayLabels: Record<string, string[]> = {
                                    ko: ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0'],
                                    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                                    tl: ['Lin', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab'],
                                    ceb: ['Dom', 'Lun', 'Mar', 'Miy', 'Huw', 'Biy', 'Sab']
                                };
                                const day = (dayLabels[language] || dayLabels.en)[date.getDay()];
                                return (
                                    <button key={d} onClick={() => setSelectedDate(d)} className={`rounded-xl p-2 text-center border transition-all ${selectedDate === d ? 'bg-primary text-primary-foreground border-primary' : 'glass-card border-transparent hover:border-primary/30'}`}>
                                        <p className="text-xs text-muted-foreground">{day}</p>
                                        <p className="text-sm font-bold">{d.slice(8)}</p>
                                        <p className="text-xs text-muted-foreground">{d.slice(5, 7)}</p>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedDate && (
                            <>
                                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2"><Clock size={16} /> {t.step3.time} ({t.step3.tenMin})</p>
                                <div className="grid grid-cols-4 gap-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {TIME_SLOTS.map(tval => (
                                        <button key={tval} onClick={() => setSelectedTime(tval)} className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${selectedTime === tval ? 'bg-primary text-primary-foreground border-primary' : 'glass-card border-transparent hover:border-primary/30'}`}>{tval}</button>
                                    ))}
                                </div>
                            </>
                        )}
                        {selectedDate && selectedTime && <button onClick={() => setStep(4)} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold">{t.btn.next}</button>}
                        <button onClick={() => setStep(2)} className="mt-4 text-sm text-muted-foreground hover:text-primary">{t.btn.backDesigner}</button>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold mb-6">{t.step4.title}</h2>
                        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
                            <div className="flex justify-between"><span className="text-muted-foreground">{t.step4.style}</span><span className="font-bold">{selectedTreatment?.[language as keyof typeof selectedTreatment] || selectedTreatment?.en}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t.step4.price}</span><span className="text-primary font-bold">\u20B1 {selectedTreatment?.price.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t.step4.designer}</span><span className="font-bold">{selectedTherapist}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t.step4.date}</span><span className="font-bold">{selectedDate}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t.step4.time}</span><span className="font-bold">{selectedTime}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">{t.step4.duration}</span><span className="font-bold">{selectedTreatment?.duration}{t.step4.min}</span></div>
                        </div>
                        <textarea placeholder={t.step4.notes} value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 mb-4 h-24 resize-none" />
                        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}
                        {isLoggedIn ? (
                            <button onClick={() => setIsGcashModalOpen(true)} disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">{loading ? t.btn.booking : t.btn.confirm}</button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-center"><p className="text-sm text-primary font-medium">{t.btn.loginMsg}</p></div>
                                <button onClick={() => { sessionStorage.setItem('booking_auto_submit', 'true'); setIsLoginModalOpen(true); }} className="block w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg text-center hover:opacity-90 transition-opacity">{t.btn.login}</button>
                                <p className="text-center text-xs text-muted-foreground">{t.btn.snsMsg}</p>
                            </div>
                        )}
                        <button onClick={() => setStep(3)} className="mt-4 text-sm text-muted-foreground hover:text-primary w-full text-center">{t.btn.backTime}</button>
                    </motion.div>
                )}
            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <GcashPaymentModal isOpen={isGcashModalOpen} onClose={() => setIsGcashModalOpen(false)} onConfirm={(ref) => handleBook({ ref_number: ref })} amount={selectedTreatment?.price || 0} loading={loading} />
        </div>
    );
}
