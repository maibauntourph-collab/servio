/**
 * 👨‍🏫 스타일 갤러리 페이지 (2026-03-03)
 * hairstyles 데이터를 카테고리별로 필터링해서 보여주는 갤러리 페이지입니다.
 * 클릭하면 예약 페이지로 이동합니다.
 */
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, Clock } from 'lucide-react';
import { hairstyles, categories } from '../data/hairstyles';
import { useAuthContext } from '../context/AuthContext';

// 가격 포맷 함수: 45000 → "45,000원"
const fmtPrice = (p: number) => p.toLocaleString('ko-KR') + '원';

export default function StylesPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthContext();
    const [selectedCat, setSelectedCat] = useState<string>('전체');
    const [search, setSearch] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    // 카테고리 + 검색어 필터링
    const filtered = useMemo(() => {
        return hairstyles.filter(h => {
            const matchCat = selectedCat === '전체' || h.category === selectedCat;
            const term = search.toLowerCase();
            const matchSearch = !term
                || h.ko.toLowerCase().includes(term)
                || h.en.toLowerCase().includes(term)
                || h.category.includes(term);
            return matchCat && matchSearch;
        });
    }, [selectedCat, search]);

    const allCategories = ['전체', ...categories];

    return (
        <div className="min-h-screen bg-background">
            {/* 내비게이션 */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft size={18} /> 홈으로
                </button>
                <span className="text-xl font-black gold-gradient-text tracking-tighter uppercase">K-Barber</span>
                <div className="flex items-center gap-3">
                    {/* 언어 전환 */}
                    <button onClick={() => setLanguage(l => l === 'ko' ? 'en' : 'ko')}
                        className="text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                        {language === 'ko' ? 'EN' : 'KO'}
                    </button>
                    {isLoggedIn
                        ? <Link to="/mypage" className="text-sm text-primary">마이페이지</Link>
                        : <Link to="/login" className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold">로그인</Link>
                    }
                </div>
            </nav>

            {/* 헤더 */}
            <section className="pt-28 pb-8 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-extrabold mb-4">
                    스타일 <span className="gold-gradient-text">갤러리</span>
                </motion.h1>
                <p className="text-muted-foreground text-lg">총 {hairstyles.length}가지 프리미엄 남성 헤어스타일</p>
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
                        placeholder="스타일명 검색..."
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
                <p className="text-sm text-muted-foreground">{filtered.length}개의 스타일</p>
            </div>

            {/* 스타일 그리드 */}
            <div className="px-6 max-w-7xl mx-auto pb-20">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((style, idx) => (
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
                                        {language === 'ko' ? style.ko : style.en}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{style.designer}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-primary font-semibold text-sm">{fmtPrice(style.price)}</span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock size={11} /> {style.duration}분
                                        </span>
                                    </div>
                                    {/* 예약 버튼 */}
                                    <button
                                        id={`book-${style.id}`}
                                        className="mt-2 w-full text-xs py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all font-medium"
                                    >
                                        예약하기
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-5xl mb-4">✂️</p>
                        <p>검색 결과가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
