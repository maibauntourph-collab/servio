/**
 * 👨‍🏫 스타일 갤러리 페이지 (2026-03-08 업데이트)
 * 주요 기능: hairstyles 데이터를 카테고리별로 필터링하여 전시, 검색 기능 제공
 * 특징: 10분 단위 예약 시스템과 연동되어 있으며, 클릭 시 해당 스타일의 예약 페이지로 이동
 */
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Clock } from 'lucide-react';
import { hairstyles, categories, Hairstyle } from '../data/hairstyles';
import { useAuthContext } from '../context/AuthContext';

// 👨‍🏫 가격 포맷 함수 (2026-03-08 표준화)
// 모든 통화를 필리핀 페소(₱)로 통일하여 표시합니다.
// 학습 포인트: toLocaleString()은 숫자에 천 단위 구분 쉼표를 자동으로 추가해줍니다.
const fmtPrice = (p: number) => {
    return '₱ ' + p.toLocaleString();
};

const translations: Record<string, any> = {
    ko: {
        all: "전체",
        searchPlaceholder: "스타일명 검색...",
        totalStyles: "총 {count}가지 프리미엄 남성 헤어스타일",
        styleCount: "{count}개의 스타일",
        noResult: "검색 결과가 없습니다.",
        bookBtn: "예약하기",
        gallery: "갤러리",
        title: "스타일",
        min: "분",
        home: "홈으로",
        myPage: "마이페이지",
        login: "로그인"
    },
    en: {
        all: "ALL",
        searchPlaceholder: "Search styles...",
        totalStyles: "Total {count} premium men's styles",
        styleCount: "{count} styles found",
        noResult: "No styles found for your search.",
        bookBtn: "Book Now",
        gallery: "Gallery",
        title: "Style",
        min: "min",
        home: "Home",
        myPage: "My Page",
        login: "Login"
    },
    tl: {
        all: "LAHAT",
        searchPlaceholder: "Maghanap ng istilo...",
        totalStyles: "Kabuuang {count} premium na istilo para sa lalaki",
        styleCount: "{count} istilo ang nahanap",
        noResult: "Walang nahanap na istilo.",
        bookBtn: "Mag-book Ngayon",
        gallery: "Gallery",
        title: "Istilo",
        min: "min",
        home: "Home",
        myPage: "Profile",
        login: "Login"
    },
    ceb: {
        all: "TANAN",
        searchPlaceholder: "Pangita og estilo...",
        totalStyles: "Tanan nga {count} premium nga estilo para sa lalaki",
        styleCount: "{count} estilo ang nakit-an",
        noResult: "Walay nakit-an nga estilo.",
        bookBtn: "Pag-book Karon",
        gallery: "Gallery",
        title: "Estilo",
        min: "min",
        home: "Home",
        myPage: "Profile",
        login: "Login"
    }
};

import { useLanguage } from '../context/LanguageContext';

export default function StylesPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthContext();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [selectedCat, setSelectedCat] = useState<string>(t.all);
    const [search, setSearch] = useState('');

    // 카테고리 + 검색어 필터링 (2026-03-08 업데이트: 언어 중립적 필터링)
    const filtered = useMemo(() => {
        // translations 리소스에서 '전체' 또는 'ALL'에 해당하는 값을 가져옵니다.
        const allLabel = t.all;
        return hairstyles.filter((h: Hairstyle) => {
            // 현재 선택된 카테고리가 '전체'이거나, 스타일의 카테고리(DB 값)와 일치하는지 확인
            // h.category는 DB 원본 값이므로 언어 전환과 관계없이 일관성을 유지합니다.
            const matchCat = selectedCat === allLabel || h.category === selectedCat;
            const term = search.toLowerCase();
            const matchSearch = !term
                || h.ko.toLowerCase().includes(term)
                || h.en.toLowerCase().includes(term)
                || h.tl.toLowerCase().includes(term)
                || h.ceb.toLowerCase().includes(term)
                || h.category.toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
    }, [selectedCat, search, language, t.all]);

    const allCategories = [t.all, ...categories];

    return (
        <div className="min-h-screen bg-background">
            {/* 내비게이션 */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft size={18} /> {t.home}
                </button>
                <span className="text-xl font-black gold-gradient-text tracking-tighter uppercase">K-Barber</span>
                <div className="flex items-center gap-3">
                    {isLoggedIn
                        ? <Link to="/mypage" className="text-sm text-primary">{t.myPage}</Link>
                        : <Link to="/login" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold">{t.login}</Link>
                    }
                </div>
            </nav>

            {/* 헤더 */}
            <section className="pt-28 pb-8 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-extrabold mb-4">
                    {t.title} <span className="gold-gradient-text">{t.gallery}</span>
                </motion.h1>
                <p className="text-muted-foreground text-lg">{t.totalStyles.replace('{count}', hairstyles.length.toString())}</p>
            </section>

            {/* 검색창 */}
            <div className="px-6 max-w-lg mx-auto mb-8">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        id="style-search"
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                    {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <X size={16} />
                    </button>}
                </div>
            </div>

            {/* 카테고리 필터 탭 (Sticky 고정 및 애니메이션 개선) */}
            <div className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 mb-8 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 w-max mx-auto">
                    {allCategories.map(cat => {
                        const isSelected = selectedCat === cat;
                        return (
                            <button
                                key={cat}
                                id={`cat-${cat}`}
                                onClick={() => setSelectedCat(cat)}
                                className={`relative px-5 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground hover:text-primary'
                                    }`}
                            >
                                <span className="relative z-10">{cat}</span>
                                {isSelected && (
                                    <motion.span
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 결과 카운트 */}
            <div className="px-6 max-w-7xl mx-auto mb-6">
                <p className="text-sm text-muted-foreground">{t.styleCount.replace('{count}', filtered.length.toString())}</p>
            </div>
            Broadway
            {/* 스타일 그리드 */}
            <div className="px-6 max-w-7xl mx-auto pb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((style: Hairstyle, idx: number) => (
                            <motion.div
                                key={style.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: (idx % 10) * 0.03, duration: 0.3 }}
                                className="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:border-primary/40 transition-all"
                                onClick={() => navigate(`/booking/${style.id}`)}
                            >
                                {/* 이미지 */}
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    <img
                                        src={style.img}
                                        alt={style.ko}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                    {/* 카테고리 뱃지 */}
                                    <span className="absolute top-2 left-2 bg-black/60 text-[10px] px-2 py-0.5 rounded-full text-primary font-medium">
                                        {style.category}
                                    </span>
                                </div>

                                {/* 정보 */}
                                <div className="p-3">
                                    <h3 className="font-bold text-sm truncate">
                                        {style[language as keyof typeof style] as string}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{style.designer}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-primary font-semibold text-sm">{fmtPrice(style.price)}</span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock size={11} /> {style.duration}{t.min}
                                        </span>
                                    </div>
                                    {/* 예약 버튼 */}
                                    <button
                                        id={`book-${style.id}`}
                                        className="mt-2 w-full text-xs py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-medium"
                                    >
                                        {t.bookBtn}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-5xl mb-4">✂️</p>
                        <p>{t.noResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
