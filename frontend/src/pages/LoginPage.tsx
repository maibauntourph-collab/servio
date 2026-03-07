/**
 * 👨‍🏫 로그인 페이지 (2026-03-03)
 * 이메일/비밀번호 입력 → API 호출 → JWT 저장 → 메인으로 이동
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Chrome, Facebook, MessageCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { error } = await login(form.email, form.password);
            if (!error) {
                navigate('/');
            } else {
                setError('이메일 또는 비밀번호가 일치하지 않습니다.');
            }
        } catch {
            setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
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
                    <Link to="/" className="text-3xl font-black tracking-tighter gold-gradient-text uppercase">K-Barber</Link>
                    <p className="text-muted-foreground mt-2">프리미엄 바버샵 예약 서비스</p>
                </div>

                <div className="glass-card p-8 rounded-2xl">
                    <h1 className="text-2xl font-bold mb-6">로그인</h1>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* 이메일 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">이메일</label>
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
                            <label className="text-sm text-muted-foreground mb-1.5 block">비밀번호</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="비밀번호를 입력하세요"
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
                            {loading ? '로그인 중...' : (<><LogIn size={18} /> 로그인</>)}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1c1e] px-2 text-muted-foreground font-bold tracking-widest">OR SNS LOGIN</span></div>
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
                        아직 회원이 아니신가요?{' '}
                        <Link to="/register" className="text-primary hover:underline font-bold">회원가입</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
