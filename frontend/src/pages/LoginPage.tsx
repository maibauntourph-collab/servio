/**
 * 👨‍🏫 로그인 페이지 (2026-03-08 업데이트)
 * Supabase Auth를 통해 이메일/비밀번호 로그인을 처리합니다.
 * 학습 포인트: 비동기 처리(async/await)와 에러 핸들링을 통해 사용자에게 피드백을 주는 흐름을 확인할 수 있습니다.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Chrome, Facebook, MessageCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

const translations: Record<string, any> = {
    ko: {
        title: "로그인", subtitle: "프리미엄 마사지 예약 서비스", email: "이메일", password: "비밀번호",
        pwPlaceholder: "비밀번호를 입력하세요", loginBtn: "로그인", loggingIn: "로그인 중...",
        errorMatch: "이메일 또는 비밀번호가 일치하지 않습니다.",
        errorServer: "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
        footer: "아직 회원이 아니신가요?", register: "회원가입", snsLabel: "OR SNS LOGIN"
    },
    en: {
        title: "Login", subtitle: "Premium Massage Reservation", email: "Email", password: "Password",
        pwPlaceholder: "Enter your password", loginBtn: "Login", loggingIn: "Logging in...",
        errorMatch: "Email or password does not match.",
        errorServer: "Server connection failed. Please try again later.",
        footer: "Not a member yet?", register: "Sign Up", snsLabel: "OR SNS LOGIN"
    },
    tl: {
        title: "Login", subtitle: "Premium Massage Reservation", email: "Email", password: "Password",
        pwPlaceholder: "Ilagay ang iyong password", loginBtn: "Login", loggingIn: "Naglo-log in...",
        errorMatch: "Ang email o password ay hindi tumutugma.",
        errorServer: "Nabigo ang koneksyon sa server. Pakisubukan muli mamaya.",
        footer: "Hindi ka pa miyembro?", register: "Mag-sign Up", snsLabel: "OR SNS LOGIN"
    },
    ceb: {
        title: "Login", subtitle: "Premium Massage Reservation", email: "Email", password: "Password",
        pwPlaceholder: "Isulod ang imong password", loginBtn: "Login", loggingIn: "Nag-log in...",
        errorMatch: "Ang email o password wala nagtugma.",
        errorServer: "Napakyas ang koneksyon sa server. Palihug sulayi pag-usab sa ulahi.",
        footer: "Dili pa miyembro?", register: "Mag-sign Up", snsLabel: "OR SNS LOGIN"
    }
};

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const { language } = useLanguage();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const t = translations[language] || translations.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await login(form.email, form.password);
            if (!error) {
                navigate('/');
            } else {
                setError(t.errorMatch);
            }
        } catch {
            setError(t.errorServer);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'kakao') => {
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin }
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* 헤더 */}
                <div className="text-center mb-10">
                    <Link to="/" className="text-3xl font-black tracking-tighter gold-gradient-text uppercase">MassageShop</Link>
                    <p className="text-muted-foreground mt-2">{t.subtitle}</p>
                </div>

                <div className="glass-card p-8 rounded-2xl">
                    <h1 className="text-3xl font-bold tracking-tighter text-white">CORLEONE</h1>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 이메일 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.email}</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.password}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder={t.pwPlaceholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary/50"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {loading ? t.loggingIn : (<><LogIn size={18} /> {t.loginBtn}</>)}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1c1e] px-2 text-muted-foreground font-bold tracking-widest">{t.snsLabel}</span></div>
                    </div>

                    {/* SNS 버튼 그룹 */}
                    <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleSocialLogin('kakao')} className="flex items-center justify-center py-3 bg-[#FEE500] text-black rounded-xl hover:opacity-90 transition-all font-bold">
                            <MessageCircle size={20} fill="currentColor" />
                        </button>
                        <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center py-3 bg-white text-black rounded-xl hover:opacity-90 transition-all font-bold">
                            <Chrome size={20} />
                        </button>
                        <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center py-3 bg-[#1877F2] text-white rounded-xl hover:opacity-90 transition-all font-bold">
                            <Facebook size={20} fill="currentColor" />
                        </button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        {t.footer}{' '}
                        <Link to="/register" className="text-primary hover:underline font-bold">{t.register}</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
