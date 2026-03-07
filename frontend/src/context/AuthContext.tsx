/**
 * 👨‍🏫 전역 로그인 상태 관리 (AuthContext) (2026-03-05)
 * Supabase Auth와 실시간으로 연동되도록 고도화되었습니다.
 * 이제 구글, 페이스북, 이메일 로그인을 통합적으로 관리합니다.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

// 사용자 정보의 타입 정의 (SupabaseUser 기반)
interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role: string;
}

// Context에서 제공할 값의 타입
interface AuthContextType {
    user: User | null;           // 현재 로그인한 사용자 (없으면 null)
    session: Session | null;     // Supabase 세션 객체
    isLoading: boolean;          // 로딩 여부
    isLoggedIn: boolean;         // 로그인 상태
    login: (email: string, password: string) => Promise<{ error: any }>;
    register: (email: string, password: string, name: string) => Promise<{ error: any }>;
    logout: () => Promise<void>; // 로그아웃 함수
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context Provider
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfigMissing, setIsConfigMissing] = useState(false);

    // Supabase 사용자 객체를 우리 서비스의 User 타입으로 변환
    const mapSupabaseUser = (sbUser: SupabaseUser | null): User | null => {
        if (!sbUser) return null;
        return {
            id: sbUser.id,
            email: sbUser.email || '',
            name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            avatar_url: sbUser.user_metadata?.avatar_url,
            role: 'user' // 기본 역할
        };
    };

    useEffect(() => {
        // 0. 설정 확인 (2026-03-05) - 블랙 스크린 방지
        const url = import.meta.env.VITE_SUPABASE_URL || '';
        if (!url || url.includes('your_supabase')) {
            console.error('Supabase URL is missing or placeholder!');
            setIsConfigMissing(true);
            setIsLoading(false);
            return;
        }

        // 1. 초기 세션 확인
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(mapSupabaseUser(session?.user ?? null));
            setIsLoading(false);
        });

        // 2. 인증 상태 변경 감지 (로그인, 로그아웃, 토큰 갱신 등)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log(`👨‍🏫 Auth Event: ${_event}`);
            setSession(session);
            setUser(mapSupabaseUser(session?.user ?? null));
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 로그인 함수 (Supabase 연동)
    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    // 회원가입 함수 (Supabase 연동)
    const register = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });
        return { error };
    };

    // 로그아웃 함수
    const logout = async () => {
        await supabase.auth.signOut();
    };

    if (isConfigMissing) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 text-center">
                <div className="max-w-md glass-card p-8 rounded-2xl border-primary/20">
                    <h2 className="text-2xl font-bold gold-gradient-text mb-4">Supabase 설정이 필요합니다 👨‍🏫</h2>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        현재 사이트 배포는 성공했으나, **로그인 기능을 위한 Supabase 연동 키**가 아직 입력되지 않았습니다.<br /><br />
                        `docs/가이드_Supabase연동_20260305.md` 파일을 참고하여 `.env` 설정 후 재배포 부탁드립니다!
                    </p>
                    <div className="bg-white/5 p-4 rounded-xl text-xs text-left font-mono text-primary/70 break-all border border-white/5">
                        VITE_SUPABASE_URL=...<br />
                        VITE_SUPABASE_ANON_KEY=...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoading,
            isLoggedIn: !!user,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// 커스텀 훅
export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext는 AuthProvider 안에서 사용하세요!');
    return ctx;
}

export default AuthContext;
