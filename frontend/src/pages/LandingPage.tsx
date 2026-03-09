/**
 * 👨‍🏫 MassageShop 메인 랜딩 페이지 (2026-03-08 업데이트)
 * 주요 기능: 서비스 소개, 포트폴리오(스타일북), 간편 온라인 예약, GCash 결제 연동, PWA 설치 안내
 * 특징: Framer Motion을 활용한 프리미엄 애니메이션과 Glassmorphism 디자인 적용
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, Menu, X, Star, MapPin, Instagram, MessageCircle, Globe, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { bookingsApi, settingsApi } from '../services/api';
import LoginModal from '../components/auth/LoginModal';
import { usePWAInstall } from '../hooks/usePWAInstall';

// Mock Data Translations
const translations: Record<string, any> = {
    ko: {
        services: [
            { title: "시그니처 아로마 테라피", price: "₱ 2,500", desc: "천연 에센셜 오일을 활용한 고품격 전신 릴렉싱 케어" },
            { title: "스웨디시 힐링 마사지", price: "₱ 2,200", desc: "부드러운 터치로 근육의 긴장을 완화하고 혈액순환을 돕는 마사지" },
            { title: "딥 티슈 스포츠 케어", price: "₱ 2,800", desc: "심부 근육층을 자극하여 만성 통증과 피로를 해소하는 집중 관리" },
        ],
        nav: { services: "프로그램", portfolio: "시설안내", booking: "온라인 예약", bookNow: "예약하기", admin: "관리자", myPage: "마이페이지", logout: "로그아웃", login: "로그인" },
        hero: {
            title1: "지친 일상에 선사하는", title2: "최강의 휴식",
            subtitle1: "숙련된 테라피스트의 정성 어린 손길.", subtitle2: "당신의 몸과 마음이 머무는 프리미엄 힐링 라운지.",
            btnMakeBooking: "지금 예약하기", btnViewPortfolio: "시설 둘러보기"
        },
        sectionService: { title: "Premium Therapy", desc: "숙련된 기술로 일상의 활력을 되찾아 드립니다.", bookText: "예약하기" },
        sectionPortfolio: { title: "Relaxing Space", visitInsta: "인스타그램 방문하기" },
        portfolio: [
            { img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", style: "프라이빗 룸", designer: "Level 1 Room" },
            { img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop", style: "커플 스파", designer: "VIP Suite" },
            { img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop", style: "아로마 존", designer: "Healing Deck" },
            { img: "https://images.unsplash.com/photo-1570172619380-410183ad1f55?q=80&w=800&auto=format&fit=crop", style: "라바 스톤", designer: "Zen Garden" },
            { img: "https://images.unsplash.com/photo-1591343395902-1adcb454c2e4?q=80&w=800&auto=format&fit=crop", style: "타이 마사지", designer: "Traditional Area" },
            { img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop", style: "풋 스파", designer: "Relax Zone" },
        ],
        sectionBooking: {
            title: "온라인 간편 예약", desc: "원하시는 테라피스트와 시간을 선택해주세요.",
            step1: "1. 날짜 선택", step2: "2. 시간 선택",
            days: ["오늘", "내일", "모레", "3.08", "3.09"],
            stepHour: "시간 선택", stepMinute: "분 선택",
            selectedLabel: "선택한 일정:", bookingRequested: "예약이 요청되었습니다.",
            timeAlert: "시간을 선택해주세요.", refAlert: "결제 참조 번호(8자리 이상)를 입력해주세요.",
            errorMsg: "예약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            paymentTitle: "결제 방법 선택", paymentMethod: "GCash로 결제하기",
            paymentGuide: "QR 코드를 스캔하거나 등록된 번호로 결제해 주세요.",
            priceLabel: "서비스 예상 금액", priceValue: "₱ 500",
            modalTitle: "GCash 결제 안내", modalStep1: "입금 확인", modalStep2: "결제 확인 중", modalStep3: "예약 완료!",
            qrGuide: "아래 QR 코드를 스캔하여 입금해 주세요.", copyNumber: "번호 복사", refPlaceholder: "Reference No. 8자리 입력",
            verifyBtn: "결제 확인 요청", finishBtn: "홈으로 돌아가기"
        },
        sectionInstall: {
            title: "MassageShop를 앱으로 만나보세요",
            desc: "QR 코드를 스캔하여 홈 화면에 추가하고, 더 빠르고 간편하게 예약하세요.",
            guide: "스캔하여 즉시 설치",
            btnText: "설치 가이드 보기"
        },
        footer: {
            desc1: "최고의 웰니스 문화를 선도합니다.", desc2: "프리미엄 마사지샵에서 진정한 휴식을 경험하세요.",
            contact: "Contact Info", address: "MassageShop PREMIUM SPA", time: "매일 10:00 - 02:00 (전중무휴)",
            support: "Customer Support", copyright: "© 2026 MassageShop PREMIUM SPA. All rights reserved."
        }
    },
    en: {
        services: [
            { title: "Signature Aroma Therapy", price: "₱ 2,500", desc: "Premium full body relaxing care using natural essential oils." },
            { title: "Swedish Healing Massage", price: "₱ 2,200", desc: "Massage that relieves muscle tension and aids circulation with gentle touch." },
            { title: "Deep Tissue Sports Care", price: "₱ 2,800", desc: "Intensive care targeting deep muscle layers to relieve chronic pain and fatigue." },
        ],
        nav: { services: "Treatments", portfolio: "Facilities", booking: "Online Booking", bookNow: "Book Now", admin: "Admin", myPage: "My Page", logout: "Logout", login: "Login" },
        hero: {
            title1: "Ultimate Relaxation for", title2: "Your Busy Life",
            subtitle1: "The heart-felt touch of skilled therapists.", subtitle2: "A premium healing lounge where your body and mind rest.",
            btnMakeBooking: "Book Now", btnViewPortfolio: "View Facilities"
        },
        sectionService: { title: "Premium Therapy", desc: "Restoring your daily vitality with skilled techniques.", bookText: "Book Now" },
        sectionPortfolio: { title: "Relaxing Space", visitInsta: "Visit Instagram" },
        portfolio: [
            { img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", style: "Private Room", designer: "Level 1 Room" },
            { img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop", style: "Couple Spa", designer: "VIP Suite" },
            { img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop", style: "Aroma Zone", designer: "Healing Deck" },
            { img: "https://images.unsplash.com/photo-1570172619380-410183ad1f55?q=80&w=800&auto=format&fit=crop", style: "Lava Stone", designer: "Zen Garden" },
            { img: "https://images.unsplash.com/photo-1591343395902-1adcb454c2e4?q=80&w=800&auto=format&fit=crop", style: "Thai Massage", designer: "Traditional Area" },
            { img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop", style: "Foot Spa", designer: "Relax Zone" },
        ],
        sectionBooking: {
            title: "Easy Online Booking", desc: "Please select your preferred therapist and time.",
            step1: "1. Select Date", step2: "2. Select Time",
            days: ["Today", "Tomorrow", "After", "3.08", "3.09"],
            stepHour: "Select Hour", stepMinute: "Select Minute",
            selectedLabel: "Selected Schedule:", bookingRequested: "Reservation has been requested.",
            timeAlert: "Please select time.", refAlert: "Please enter the 8-digit Reference No.",
            errorMsg: "An error occurred during booking. Please try again later.",
            paymentTitle: "Select Payment Method", paymentMethod: "Pay with GCash",
            paymentGuide: "Please scan the QR code or pay to the registered mobile number.",
            priceLabel: "Estimated Price", priceValue: "₱ 500",
            modalTitle: "GCash Payment Guide", modalStep1: "Check Deposit", modalStep2: "Verifying Payment", modalStep3: "Booking Confirmed!",
            qrGuide: "Please scan the QR code below to pay.", copyNumber: "Copy Number", refPlaceholder: "Enter 8-digit Reference No.",
            verifyBtn: "Request Verification", finishBtn: "Back to Home"
        },
        sectionInstall: {
            title: "Get MassageShop on your mobile",
            desc: "Scan the QR code to add to your home screen for faster and easier booking.",
            guide: "Scan to install immediately",
            btnText: "Show Install Guide"
        },
        footer: {
            desc1: "Leading the best wellness culture.", desc2: "Experience true relaxation at our premium massage shop.",
            contact: "Contact Info", address: "MassageShop PREMIUM SPA", time: "Daily 10:00 - 02:00 (Open 365 Days)",
            support: "Customer Support", copyright: "© 2026 MassageShop PREMIUM SPA. All rights reserved."
        }
    },
    tl: {
        services: [
            { title: "Signature Aroma Therapy", price: "₱ 2,500", desc: "Premium na full body relaxing care gamit ang natural essential oils." },
            { title: "Swedish Healing Massage", price: "₱ 2,200", desc: "Masahe na nagpapakalma sa kalamnan at tumutulong sa sirkulasyon." },
            { title: "Deep Tissue Sports Care", price: "₱ 2,800", desc: "Intensibong pangangalaga sa malalim na kalamnan para sa pagod." },
        ],
        nav: { services: "Mga Treatment", portfolio: "Fasibilidad", booking: "Pag-book", bookNow: "Mag-book Ngayon", admin: "Admin", myPage: "Profile", logout: "Logout", login: "Login" },
        hero: {
            title1: "Tunay na Relaxation para sa", title2: "Iyong Pagod na Buhay",
            subtitle1: "Hawak ng mga bihasang therapist.", subtitle2: "Isang premium healing lounge para sa iyong katawan at isip.",
            btnMakeBooking: "Mag-book Ngayon", btnViewPortfolio: "Tingnan ang Fasibilidad"
        },
        sectionService: { title: "Premium Therapy", desc: "Ibinabalik ang iyong sigla gamit ang husay sa masahe.", bookText: "Mag-book Ngayon" },
        sectionPortfolio: { title: "Relaxing Space", visitInsta: "Bisitahin ang Instagram" },
        portfolio: [
            { img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", style: "Private Room", designer: "Level 1 Room" },
            { img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop", style: "Couple Spa", designer: "VIP Suite" },
            { img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop", style: "Aroma Zone", designer: "Healing Deck" },
            { img: "https://images.unsplash.com/photo-1570172619380-410183ad1f55?q=80&w=800&auto=format&fit=crop", style: "Lava Stone", designer: "Zen Garden" },
            { img: "https://images.unsplash.com/photo-1591343395902-1adcb454c2e4?q=80&w=800&auto=format&fit=crop", style: "Thai Massage", designer: "Traditional Area" },
            { img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop", style: "Foot Spa", designer: "Relax Zone" },
        ],
        sectionBooking: {
            title: "Madaling Online Booking", desc: "Piliin ang iyong bihasang therapist at oras.",
            step1: "1. Pumili ng Petsa", step2: "2. Pumili ng Oras",
            days: ["Ngayon", "Bukas", "Sunod", "3.08", "3.09"],
            stepHour: "Piliin ang Oras", stepMinute: "Piliin ang Minuto",
            selectedLabel: "Napiling Iskedyul:", bookingRequested: "Hiniling na ang reserbasyon.",
            timeAlert: "Pumili ng oras.", refAlert: "Ilagay ang 8-digit Ref No.",
            errorMsg: "Nagkaroon ng error sa pag-book.",
            paymentTitle: "Paraan ng Pagbabayad", paymentMethod: "Magbayad sa GCash",
            paymentGuide: "I-scan ang QR code.",
            priceLabel: "Tinatayang Presyo", priceValue: "₱ 500",
            modalTitle: "Gabay sa GCash", modalStep1: "Deposito", modalStep2: "Beripikasyon", modalStep3: "Kumpirmado!",
            qrGuide: "I-scan ang QR sa ibaba.", copyNumber: "Kopyahin", refPlaceholder: "8-digit Reference No.",
            verifyBtn: "Humiling ng Beripikasyon", finishBtn: "Bumalik sa Home"
        },
        sectionInstall: {
            title: "Kuhanin ang MassageShop App",
            desc: "I-scan ang QR code para sa mabilis na appointment.",
            guide: "I-scan para Mag-install",
            btnText: "Gabay sa Pag-install"
        },
        footer: {
            desc1: "Nangunguna sa wellness culture.", desc2: "Maranasan ang relaxation sa aming premium shop.",
            contact: "Impormasyon", address: "MassageShop PREMIUM SPA", time: "Araw-araw 10:00 - 02:00",
            support: "Suporta", copyright: "© 2026 MassageShop PREMIUM SPA. Nakalaan ang lahat."
        }
    },
    ceb: {
        services: [
            { title: "Signature Aroma Therapy", price: "₱ 2,500", desc: "Premium full body relaxing care gamit ang natural essential oils." },
            { title: "Swedish Healing Massage", price: "₱ 2,200", desc: "Masahe nga nagpagawas sa kainit ug nag-init sa sirkulasyon." },
            { title: "Deep Tissue Sports Care", price: "₱ 2,800", desc: "Intensibong pagmamentinar sa lawom nga kaunuran alang sa kakapoy." },
        ],
        nav: { services: "Mga Treatment", portfolio: "Fasilidad", booking: "Pag-book", bookNow: "Mag-book Karon", admin: "Admin", myPage: "Profile", logout: "Logout", login: "Login" },
        hero: {
            title1: "Tinuod nga Relaxation para sa", title2: "Imong Kakapoy",
            subtitle1: "Hikap sa mga hanas nga therapist.", subtitle2: "Usa ka premium healing lounge para sa imong lawas ug hunahuna.",
            btnMakeBooking: "Pag-book Karon", btnViewPortfolio: "Tan-awa ang Fasilidad"
        },
        sectionService: { title: "Premium Therapy", desc: "Ibalik ang imong kalagsik gamit ang kahanas sa masahe.", bookText: "Pag-book Karon" },
        sectionPortfolio: { title: "Relaxing Space", visitInsta: "Bisitaha ang Instagram" },
        portfolio: [
            { img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800&auto=format&fit=crop", style: "Private Room", designer: "Level 1 Room" },
            { img: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=800&auto=format&fit=crop", style: "Couple Spa", designer: "VIP Suite" },
            { img: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=800&auto=format&fit=crop", style: "Aroma Zone", designer: "Healing Deck" },
            { img: "https://images.unsplash.com/photo-1570172619380-410183ad1f55?q=80&w=800&auto=format&fit=crop", style: "Lava Stone", designer: "Zen Garden" },
            { img: "https://images.unsplash.com/photo-1591343395902-1adcb454c2e4?q=80&w=800&auto=format&fit=crop", style: "Thai Massage", designer: "Traditional Area" },
            { img: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop", style: "Foot Spa", designer: "Relax Zone" },
        ],
        sectionBooking: {
            title: "Sayon nga Online Booking", desc: "Palihug pilia ang imong hanas nga therapist ug oras.",
            step1: "1. Pagpili og Petsa", step2: "2. Pagpili og Oras",
            days: ["Karon", "Ugma", "Sunod", "3.08", "3.09"],
            stepHour: "Pagpili og Oras", stepMinute: "Pagpili og Minuto",
            selectedLabel: "Napili nga Iskedyul:", bookingRequested: "Gipangayo na ang reserbasyon.",
            timeAlert: "Palihug pilia ang oras.", refAlert: "Isulod ang 8-digit Ref No.",
            errorMsg: "Naay error sa pag-book.",
            paymentTitle: "Paagi sa Pagbayad", paymentMethod: "Pagbayad sa GCash",
            paymentGuide: "Pali-i-scan ang QR code.",
            priceLabel: "Gibanabana nga Presyo", priceValue: "₱ 500",
            modalTitle: "Giya sa GCash", modalStep1: "Deposito", modalStep2: "Beripikasyon", modalStep3: "Kumpirmado!",
            qrGuide: "I-scan ang QR sa ubos.", copyNumber: "Kopyaha", refPlaceholder: "8-digit Reference No.",
            verifyBtn: "Hangyo og Beripikasyon", finishBtn: "Balik sa Home"
        },
        sectionInstall: {
            title: "Kuhanha ang MassageShop App",
            desc: "I-scan ang QR code para sa paspas nga appointment.",
            guide: "I-scan aron Ma-install",
            btnText: "Giya sa Pag-install"
        },
        footer: {
            desc1: "Nag-una sa wellness culture.", desc2: "Sinati ang relaxation sa among premium shop.",
            contact: "Impormasyon", address: "MassageShop PREMIUM SPA", time: "Kada Adlaw 10:00 - 02:00",
            support: "Suporta", copyright: "© 2026 MassageShop PREMIUM SPA. Gireserba tanan adlaw."
        }
    }
};


export default function LandingPage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, setLanguage } = useLanguage();
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const { user, isLoggedIn, logout } = useAuthContext();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isInstallable, install } = usePWAInstall();

    // QR 프레임 상태
    const [qrFrame] = useState('massageshop-qr.png');

    const [selectedDayIdx, setSelectedDayIdx] = useState(0); // 👨‍🏫 초기값 0(오늘)으로 통일
    const [selectedHour, setSelectedHour] = useState<string | null>(null);
    const [selectedMinute, setSelectedMinute] = useState<string | null>(null);

    // 💳 결제 모달 상태
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStep, setPaymentStep] = useState(0); // 0: Method, 1: Details, 2: Verification, 3: Success
    const [referenceNumber, setReferenceNumber] = useState('');
    const [gcashInfo, setGcashInfo] = useState({ gcash_number: '0917-XXX-XXXX', gcash_qr_url: '' });

    // ── 실시간 결제 정보 가져오기 ──
    const fetchGcashInfo = async () => {
        try {
            const res = await settingsApi.getGcash();
            if (res.ok) setGcashInfo(res.data);
        } catch (err) { console.error('Failed to fetch GCash info:', err); }
    };

    useEffect(() => {
        // fetchDesigners(); // Assuming this is defined elsewhere or not needed here
        fetchGcashInfo();
    }, []);

    const t = translations[language];

    // 👨‍🏫 예약 시간/분 슬롯 데이터 생성 (2026-03-08 업데이트)
    // 사용자의 요청에 따라 10:00 ~ 19:00 범위를 생성하며, 분 단위는 10분 간격으로 설정합니다.
    // 학습 포인트: Array.from을 활용하여 선언적으로 리스트를 생성할 수 있습니다.
    const hours = Array.from({ length: 10 }, (_, i) => (10 + i).toString().padStart(2, '0'));
    const minutes = ["00", "10", "20", "30", "40", "50"];

    const handleBookingClick = () => {
        if (user) {
            navigate('/booking');
        } else {
            setIsLoginModalOpen(true);
        }
    };

    const handleBook = async () => {
        if (!selectedHour || !selectedMinute) {
            alert(t.sectionBooking.timeAlert || 'Please select time.');
            return;
        }

        if (referenceNumber.length < 8) {
            alert(t.sectionBooking.refAlert || 'Please enter the 8-digit Reference No.');
            return;
        }

        const selectedStyle = t.portfolio[0]; // TODO: 실제 선택된 스타일 연동 필요
        const bookingDate = t.sectionBooking.days[selectedDayIdx];

        setPaymentStep(2); // 검증 중 표시 (로딩 애니메이션 활성화)

        try {
            // 👨‍🏫 백엔드 API 호출을 통해 예약을 생성합니다.
            const res = await bookingsApi.create({
                style_id: selectedStyle.id || 1,
                designer: selectedStyle.designer || 'Director Park',
                booking_date: bookingDate,
                booking_time: `${selectedHour}:${selectedMinute}`,
                notes: `GCash Ref: ${referenceNumber}`,
                ref_number: referenceNumber
            });

            if (res.ok) {
                // 👨‍🏫 예약 성공 시 성공 단계로 이동
                setPaymentStep(3);
            } else {
                // 👨‍🏫 실패 시 사용자에게 알림 후 입력 단계로 복귀
                alert(res.data.message || 'Booking failed');
                setPaymentStep(1);
            }
        } catch (err) {
            console.error('Booking Error:', err);
            alert(t.sectionBooking.errorMsg || 'An error occurred during booking. Please try again later.');
            setPaymentStep(1);
        }
    };


    return (
        <div className="relative w-full overflow-hidden bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 glass border-b-0 py-6 px-6 md:px-12 flex justify-between items-center transition-all duration-500">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black tracking-tighter gold-gradient-text uppercase"
                >
                    MassageShop
                </motion.div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-10 text-[13px] font-bold tracking-widest text-foreground/70 uppercase">
                    <a href="#services" className="hover:text-primary transition-all duration-300 hover:tracking-[0.2em]">{t.nav.services}</a>
                    <a href="#portfolio" className="hover:text-primary transition-all duration-300 hover:tracking-[0.2em]">{t.nav.portfolio}</a>
                    <a href="#booking" className="hover:text-primary transition-all duration-300 hover:tracking-[0.2em]">{t.nav.booking}</a>
                    {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary hover:text-primary-foreground transition-all">
                            {t.nav.admin}
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Language Selector */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="flex items-center gap-2 text-[11px] font-bold text-foreground hover:text-primary transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-full"
                        >
                            <Globe size={14} className="text-primary" />
                            <span className="uppercase tracking-widest">{language}</span>
                        </motion.button>

                        <AnimatePresence>
                            {isLangMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-3 w-40 glass rounded-2xl overflow-hidden shadow-2xl z-50 p-1"
                                >
                                    {[
                                        { code: 'ko', label: '한국어' },
                                        { code: 'en', label: 'English' },
                                        { code: 'tl', label: 'Tagalog' },
                                        { code: 'ceb', label: 'Cebuano' }
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setLanguage(lang.code as LanguageCode);
                                                setIsLangMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-xs font-bold transition-all rounded-xl hover:bg-white/10 ${language === lang.code ? 'text-primary bg-primary/10' : 'text-white/60'}`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {isLoggedIn ? (
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/mypage" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">{t.nav.myPage}</Link>
                            <button onClick={logout} className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 px-4 py-2 rounded-full border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">{t.nav.logout}</button>
                        </div>
                    ) : (
                        <Link to="/login" className="hidden md:flex bg-primary text-primary-foreground px-8 py-3 rounded-full font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)] hover:shadow-primary/40">
                            {t.nav.login}
                        </Link>
                    )}

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-foreground ml-2 p-2 glass rounded-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-10 md:hidden"
                        >
                            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter hover:text-primary transition-colors">{t.nav.services}</a>
                            <a href="#portfolio" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter hover:text-primary transition-colors">{t.nav.portfolio}</a>
                            <a href="#booking" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black uppercase tracking-tighter hover:text-primary transition-colors">{t.nav.booking}</a>

                            <div className="h-px w-20 bg-white/10 my-4" />

                            {isLoggedIn ? (
                                <>
                                    <Link to="/mypage" onClick={() => setIsMenuOpen(false)} className="text-2xl font-bold">{t.nav.myPage}</Link>
                                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-2xl text-red-400 font-bold">{t.nav.logout}</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black gold-gradient-text uppercase tracking-tighter">{t.nav.login}</Link>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.15 }}
                        transition={{ duration: 2 }}
                        src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2000&auto=format&fit=crop"
                        alt="Luxury Spa Atmosphere"
                        className="w-full h-full object-cover mix-blend-multiply"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background"></div>
                    {/* Floating Glow Elements */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "circOut" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="inline-block mb-6 px-4 py-1.5 glass rounded-full border-primary/20"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">The Art of Healing</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic">
                            {t.hero.title1} <br />
                            <span className="gold-gradient-text">{t.hero.title2}</span>
                        </h1>
                        <p className="text-base md:text-2xl text-foreground/60 max-w-3xl mx-auto mb-12 font-medium tracking-tight leading-relaxed">
                            {t.hero.subtitle1} {t.hero.subtitle2}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/booking"
                                className="w-full sm:w-auto px-12 py-5 bg-primary text-black rounded-full font-black text-sm uppercase tracking-widest hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all duration-500 hover:-translate-y-2 text-center group">
                                <span className="flex items-center justify-center gap-2">
                                    {t.hero.btnMakeBooking}
                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Link>
                            <Link to="/treatments"
                                className="w-full sm:w-auto px-12 py-5 glass text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-500 border border-white/10 hover:border-white/30 text-center">
                                {t.hero.btnViewPortfolio}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 서비스 섹션 - key={language}로 언어 바뀔때마다 강제 재렌더링 */}
            {/* Global Content Protection Section */}
            <section id="services" className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
                    >
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter gold-gradient-text italic">
                                {t.sectionService.title}
                            </h2>
                            <p className="text-foreground/40 text-lg font-medium leading-relaxed">
                                {t.sectionService.desc}
                            </p>
                        </div>
                        <Link to="/treatments" className="group flex items-center gap-3 text-primary font-black uppercase tracking-widest text-sm bg-primary/5 px-8 py-4 rounded-full border border-primary/20 hover:bg-primary hover:text-black transition-all duration-500">
                            Explore All Programs
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {t.services.map((service: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card rounded-[2.5rem] p-10 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                                        <Star size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-4 group-hover:gold-gradient-text transition-all duration-500">{service.title}</h3>
                                    <p className="text-white/40 text-sm mb-8 leading-relaxed font-medium">{service.desc}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xl font-black text-primary font-mono">{service.price}</span>
                                        <button onClick={handleBookingClick} className="text-xs font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Book Now</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio (시설안내) 섹션 - 럭셔리 그리드 */}
            <section id="portfolio" className="py-24 px-6 relative z-10 bg-[#121214]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tighter gold-gradient-text italic">
                            {t.sectionPortfolio.title}
                        </h2>
                        <div className="h-1 w-24 bg-primary mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {t.portfolio.map((item: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative aspect-[4/5] overflow-hidden rounded-[3rem] cursor-pointer"
                            >
                                <img
                                    src={item.img}
                                    alt={item.style}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-0 left-0 p-10 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 block">{item.designer}</span>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">{item.style}</h4>
                                    <div className="h-0.5 w-0 group-hover:w-full bg-primary mt-4 transition-all duration-500"></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Booking Widget Section */}
            <section id="booking" className="py-32 px-6 relative z-10">
                <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 border-primary/20 relative overflow-hidden">
                    {/* Decorative blur */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>

                    <div className="relative z-10 flex flex-col md:flex-row gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-4">{t.sectionBooking.title}</h2>
                            <p className="text-muted-foreground mb-8">{t.sectionBooking.desc}</p>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-3 text-white/70">{t.sectionBooking.step1}</label>
                                    <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                                        {t.sectionBooking.days.map((day: string, i: number) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedDayIdx(i)}
                                                className={`whitespace-nowrap px-5 py-3 rounded-xl border transition-all duration-300 ${selectedDayIdx === i ? 'bg-primary text-primary-foreground border-primary font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-white/30 bg-white/5 text-muted-foreground'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-medium mb-3 text-white/70">{t.sectionBooking.stepHour}</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {hours.map((h) => (
                                                <button
                                                    key={h}
                                                    onClick={() => { setSelectedHour(h); setSelectedMinute(null); }}
                                                    className={`py-2 rounded-lg border transition-all duration-200 text-sm font-bold ${selectedHour === h ? 'bg-primary text-black border-primary' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                >
                                                    {h}:00
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {selectedHour && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                            >
                                                <label className="block text-sm font-medium mb-3 text-white/70">{t.sectionBooking.stepMinute}</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {minutes.map((m) => (
                                                        <button
                                                            key={m}
                                                            onClick={() => setSelectedMinute(m)}
                                                            className={`py-2 rounded-lg border transition-all duration-200 text-sm font-bold ${selectedMinute === m ? 'bg-primary text-black border-primary' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                                                        >
                                                            {selectedHour}:{m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {selectedDayIdx !== null && selectedHour && selectedMinute && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-10 pt-8 border-t border-white/10"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                                {t.sectionBooking.paymentTitle}
                                            </h4>
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                                <span className="text-xs text-white/50">{t.sectionBooking.priceLabel}</span>
                                                <span className="text-primary font-bold text-lg">{t.sectionBooking.priceValue}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-[#007DFE]/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <button className="relative w-full p-5 bg-[#007DFE]/10 border border-[#007DFE]/30 rounded-2xl flex items-center justify-between transition-all hover:border-[#007DFE]">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2">
                                                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/GCash_logo.svg" alt="GCash" className="w-full" />
                                                        </div>
                                                        <div className="text-left">
                                                            <div className="text-white font-bold">{t.sectionBooking.paymentMethod}</div>
                                                            <div className="text-xs text-white/50">{t.sectionBooking.paymentGuide}</div>
                                                        </div>
                                                    </div>
                                                    <div className="w-6 h-6 rounded-full border-2 border-[#007DFE] flex items-center justify-center">
                                                        <div className="w-3 h-3 bg-[#007DFE] rounded-full"></div>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl opacity-50 cursor-not-allowed">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center p-2 grayscale">
                                                        <span className="text-[10px] text-white/30 font-bold italic">CASH</span>
                                                    </div>
                                                    <div className="text-left text-white/30">
                                                        <div className="font-bold">Pay in Store</div>
                                                        <div className="text-xs italic">(Temporarily Unavailable)</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                                            <div className="text-sm">
                                                <div className="text-white/50 mb-1">{t.sectionBooking.selectedLabel}</div>
                                                <div className="font-bold text-primary text-lg">
                                                    {t.sectionBooking.days[selectedDayIdx]} • {selectedHour}:{selectedMinute}
                                                </div>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleBookingClick}
                                                className="w-full sm:w-auto px-10 py-4 bg-primary text-black rounded-full font-black text-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all flex items-center justify-center gap-2 group"
                                            >
                                                {t.nav.bookNow}
                                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* 💳 GCash Payment Modal */}
            <AnimatePresence>
                {
                    isPaymentModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => paymentStep !== 2 && setIsPaymentModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />

                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-lg bg-[#1a1c1e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                {/* Header */}
                                <div className="bg-[#007DFE] p-6 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/GCash_logo.svg" alt="GCash" className="w-full" />
                                        </div>
                                        <h3 className="font-bold text-lg">{t.sectionBooking.modalTitle}</h3>
                                    </div>
                                    {paymentStep !== 2 && (
                                        <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                            <X size={24} />
                                        </button>
                                    )}
                                </div>

                                <div className="p-8">
                                    {/* Step Indicator */}
                                    <div className="flex justify-between mb-8 relative">
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
                                        {[1, 2, 3].map((step) => (
                                            <div
                                                key={step}
                                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${paymentStep >= step ? 'bg-[#007DFE] text-white scale-110 shadow-[0_0_15px_rgba(0,125,254,0.5)]' : 'bg-[#2a2d30] text-white/30'}`}
                                            >
                                                {step}
                                            </div>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {paymentStep === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="space-y-6"
                                            >
                                                <div className="text-center">
                                                    <p className="text-white/70 mb-6 text-sm leading-relaxed">{t.sectionBooking.qrGuide}</p>

                                                    {/* 👨‍🏫 프리미엄 QR 카드 디자인 */}
                                                    <div className="relative inline-block mb-6 group">
                                                        <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-[#007DFE]/30 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                                        <div className="relative p-6 bg-white rounded-[2rem] shadow-2xl">
                                                            <div className="w-48 h-48 bg-white flex items-center justify-center rounded-2xl overflow-hidden">
                                                                <img
                                                                    src={gcashInfo.gcash_qr_url || "/images/premium-qr-original.png"}
                                                                    alt="GCash QR"
                                                                    className="w-full h-full object-contain rounded-xl"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Account Number</span>
                                                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                                                            <span className="text-2xl font-black text-white tracking-widest leading-none">{gcashInfo.gcash_number}</span>
                                                            <button
                                                                onClick={() => { navigator.clipboard.writeText(gcashInfo.gcash_number); alert(t.sectionBooking.copyNumber + "!"); }}
                                                                className="p-2 bg-primary/20 hover:bg-primary text-primary hover:text-black rounded-lg transition-all"
                                                            >
                                                                <Clock size={14} className="rotate-45" /> {/* Copy 아이콘 대신 간이 표시 */}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            maxLength={20}
                                                            value={referenceNumber}
                                                            onChange={(e) => setReferenceNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                                            placeholder={t.sectionBooking.refPlaceholder}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-2xl font-black tracking-[0.3em] focus:border-[#007DFE] focus:bg-white/10 outline-none transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-white/20"
                                                        />
                                                        {referenceNumber.length > 0 && (
                                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30 uppercase">
                                                                {referenceNumber.length} Digits
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    <button
                                                        disabled={referenceNumber.length < 8}
                                                        onClick={handleBook}
                                                        className="w-full py-5 bg-[#007DFE] disabled:opacity-20 disabled:grayscale text-white rounded-2xl font-black text-lg hover:bg-[#007DFE]/80 hover:shadow-[0_0_30px_rgba(0,125,254,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                                    >
                                                        {t.sectionBooking.verifyBtn}
                                                        <ArrowRight size={20} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentStep === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 1.1 }}
                                                className="py-16 flex flex-col items-center justify-center text-center"
                                            >
                                                <div className="relative w-24 h-24 mb-8">
                                                    <div className="absolute inset-0 border-4 border-[#007DFE]/20 rounded-full"></div>
                                                    <div className="absolute inset-0 border-4 border-[#007DFE] border-t-transparent rounded-full animate-spin"></div>
                                                    <div className="absolute inset-4 bg-[#007DFE]/10 rounded-full flex items-center justify-center">
                                                        <Clock size={32} className="text-[#007DFE] animate-pulse" />
                                                    </div>
                                                </div>
                                                <h4 className="text-2xl font-black text-white mb-3 tracking-tight">{t.sectionBooking.modalStep2}</h4>
                                                <div className="bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                                    <p className="text-white/40 text-xs font-mono uppercase tracking-widest">Ref: <span className="text-primary">{referenceNumber}</span></p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {paymentStep === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-center py-6"
                                            >
                                                <div className="relative w-24 h-24 mx-auto mb-8">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                                        className="w-full h-full bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)]"
                                                    >
                                                        <Check size={48} className="text-white" strokeWidth={4} />
                                                    </motion.div>
                                                    <motion.div
                                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute -inset-4 border-2 border-green-500/30 rounded-full"
                                                    ></motion.div>
                                                </div>

                                                <h4 className="text-3xl font-black text-white mb-4 tracking-tighter">{t.sectionBooking.modalStep3}</h4>

                                                <div className="bg-white/5 rounded-[2rem] p-6 mb-10 text-left border border-white/5 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
                                                    <div className="space-y-4 relative z-10">
                                                        <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                                            <span className="text-white/40 text-xs font-bold uppercase">{t.sectionBooking.selectedLabel}</span>
                                                            <span className="text-white font-black">{t.sectionBooking.days[selectedDayIdx]} • {selectedHour}:{selectedMinute}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-white/40 text-xs font-bold uppercase">Ref Number</span>
                                                            <span className="text-primary font-mono font-black tracking-widest text-lg">{referenceNumber}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => { setIsPaymentModalOpen(false); setPaymentStep(0); setReferenceNumber(""); }}
                                                    className="w-full py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl"
                                                >
                                                    {t.sectionBooking.finishBtn}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* ── 앱 설치 유도 섹션 (QR 코드) ── */}
            < section className="py-24 px-6 relative z-10 bg-secondary/20" >
                <div className="max-w-5xl mx-auto">
                    <div className="glass-card rounded-[40px] p-8 md:p-16 border border-primary/20 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">

                        {/* 배경 그라디언트 효과 */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                        {/* 왼쪽: 텍스트 + 버튼 */}
                        <div className="flex-1 text-center md:text-left z-10">
                            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                                {t.sectionInstall.title}
                            </h2>
                            <p className="text-muted-foreground text-lg mb-10 leading-relaxed max-w-lg">
                                {t.sectionInstall.desc}
                            </p>
                            {/* View Install Guide 버튼 */}
                            <button
                                onClick={install}
                                className="px-8 py-4 bg-primary/10 border border-primary/30 rounded-2xl font-bold text-primary hover:bg-primary/20 transition-all duration-300"
                            >
                                {isInstallable ? t.sectionInstall.btnText : language === 'ko' ? '홈 화면 바로가기' : 'Add to Home'}
                            </button>
                        </div>

                        {/* 오른쪽: QR 코드 카드 — 배경 이미지만 순수하게 표출 (가림 요소 전혀 없음) */}
                        <div className="relative z-10 flex-shrink-0">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 shadow-2xl flex flex-col items-center">
                                <div className="relative w-[320px] h-[320px] mx-auto overflow-hidden rounded-[2.5rem]">
                                    {/* 신규 프리미엄 MassageShop QR 이미지 */}
                                    <img
                                        src={`/images/${qrFrame}`}
                                        alt="Premium MassageShop QR"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-background pt-16 pb-8 px-6 relative z-10">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <h3 className="text-2xl font-black gold-gradient-text uppercase mb-4">MassageShop</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                            {t.footer.desc1}<br />{t.footer.desc2}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">{t.footer.contact}</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-center"><MapPin size={16} className="mr-3 text-primary" /> {t.footer.address}</li>
                            <li className="flex items-center"><Clock size={16} className="mr-3 text-primary" /> {t.footer.time}</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{t.footer.support}</h4>
                        <div className="flex space-x-4">
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Instagram size={18} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-colors">
                                <MessageCircle size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto text-center text-white/30 text-xs border-t border-white/10 pt-8">
                    {t.footer.copyright}
                </div>
            </footer>

            {/* 👨‍🏫 Supabase 옴니채널 로그인 모달 전용 영역 */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
}
