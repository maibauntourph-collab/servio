/**
 * 👨‍🏫 글로벌 언어 상태 관리 (LanguageContext) (2026-03-04)
 * 앱 전체의 언어 설정(en, ko, tl, ceb)을 관리하며, 기본값은 영어(en)입니다.
 * 어느 페이지에서든 동일한 언어를 유지할 수 있게 해줍니다.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 지원하는 언어 타입
export type LanguageCode = 'en' | 'ko' | 'tl' | 'ceb';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // 💡 초기값은 'en' (영어)으로 설정하며, localStorage에 저장된 값이 있으면 복원합니다.
    const [language, setLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('k_barber_lang') as LanguageCode;
        if (savedLang && ['en', 'ko', 'tl', 'ceb'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: LanguageCode) => {
        setLanguageState(lang);
        localStorage.setItem('k_barber_lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

// 커스텀 훅: useLanguage()로 어디서든 언어 정보에 접근
export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage는 LanguageProvider 안에서 사용하세요!');
    return ctx;
}
