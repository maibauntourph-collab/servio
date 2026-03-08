/**
 * 👨‍🏫 회원가입 페이지 (2026-03-08 업데이트)
 * 신규 사용자의 정보를 입력받아 Supabase Auth에 등록합니다.
 * 학습 포인트: 폼 데이터 관리와 유효성 검사(Validation)의 기본적인 흐름을 익힐 수 있습니다.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, Chrome, Facebook, MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { authApi } from '../services/api';

const translations: Record<string, any> = {
    ko: {
        title: "회원가입", subtitle: "회원가입 후 바로 예약하세요!", name: "이름 *", namePlaceholder: "홍길동",
        phone: "연락처", phonePlaceholder: "010-0000-0000", email: "이메일 *", password: "비밀번호 * (6자 이상)",
        pwPlaceholder: "비밀번호 (6자 이상)", submitBtn: "회원가입", processing: "처리 중...",
        errorPwShort: "비밀번호는 6자 이상이어야 합니다.",
        successMsg: "🎉 회원가입 성공! 로그인 페이지로 이동합니다...",
        errorServer: "서버 연결 실패. 잠시 후 다시 시도해주세요.",
        footer: "이미 회원이신가요?", login: "로그인", snsLabel: "OR SNS REGISTER"
    },
    en: {
        title: "Sign Up", subtitle: "Book right after signing up!", name: "Name *", namePlaceholder: "Your Name",
        phone: "Phone", phonePlaceholder: "09XX-XXX-XXXX", email: "Email *", password: "Password * (min. 6 chars)",
        pwPlaceholder: "Password (min. 6 chars)", submitBtn: "Sign Up", processing: "Processing...",
        errorPwShort: "Password must be at least 6 characters.",
        successMsg: "🎉 Sign up success! Redirecting to login...",
        errorServer: "Server connection failed. Please try again later.",
        footer: "Already a member?", login: "Login", snsLabel: "OR SNS REGISTER"
    },
    tl: {
        title: "Mag-sign Up", subtitle: "Mag-book agad pagkatapos mag-sign up!", name: "Pangalan *", namePlaceholder: "Iyong Pangalan",
        phone: "Telepono", phonePlaceholder: "09XX-XXX-XXXX", email: "Email *", password: "Password * (min. 6 chars)",
        pwPlaceholder: "Password (min. 6 chars)", submitBtn: "Mag-sign Up", processing: "Nagpo-proseso...",
        errorPwShort: "Ang password ay dapat na hindi bababa sa 6 na karakter.",
        successMsg: "🎉 Matagumpay ang pag-sign up! Nagre-redirect sa login...",
        errorServer: "Nabigo ang koneksyon sa server. Pakisubukan muli mamaya.",
        footer: "May account ka na ba?", login: "Muli mag-login", snsLabel: "OR SNS REGISTER"
    },
    ceb: {
        title: "Mag-sign Up", subtitle: "Mag-book dayon pagkahuman sa pag-sign up!", name: "Pangalan *", namePlaceholder: "Imong Pangalan",
        phone: "Telepono", phonePlaceholder: "09XX-XXX-XXXX", email: "Email *", password: "Password * (min. 6 chars)",
        pwPlaceholder: "Password (min. 6 chars)", submitBtn: "Mag-sign Up", processing: "Nag-proseso...",
        errorPwShort: "Ang password kinahanglan labing menos 6 ka karakter.",
        successMsg: "🎉 Malampuson ang pag-sign up! Nagre-redirect sa login...",
        errorServer: "Napakyas ang koneksyon sa server. Palihug sulayi pag-usab sa ulahi.",
        footer: "Naa na kay account?", login: "Login", snsLabel: "OR SNS REGISTER"
    }
};

export default function RegisterPage() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const t = translations[language] || translations.en;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) {
            setError(t.errorPwShort);
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.register(form);
            if (res.ok) {
                setSuccess(t.successMsg);
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError(res.data.message ?? 'Registration failed.');
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
                <div className="text-center mb-10">
                    <Link to="/" className="text-3xl font-black tracking-tighter gold-gradient-text uppercase">K-Barber</Link>
                    <p className="text-muted-foreground mt-2">{t.subtitle}</p>
                </div>

                <div className="glass-card p-8 rounded-2xl">
                    <h1 className="text-2xl font-bold mb-6">{t.title}</h1>

                    {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}
                    {success && <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm">{success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 이름 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.name}</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-name" type="text" required value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder={t.namePlaceholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        {/* 이메일 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.email}</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-email" type="email" required value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        {/* 연락처 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.phone}</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-phone" type="tel" value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder={t.phonePlaceholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        {/* 비밀번호 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">{t.password}</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-password" type={showPw ? 'text' : 'password'} required value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder={t.pwPlaceholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary/50" />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button id="reg-submit" type="submit" disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
                            {loading ? t.processing : t.submitBtn}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="relative my-6">
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

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {t.footer}{' '}
                        <Link to="/login" className="text-primary hover:underline font-bold">{t.login}</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
