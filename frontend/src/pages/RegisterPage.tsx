/**
 * 👨‍🏫 회원가입 페이지 (2026-03-03)
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, Chrome, Facebook, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { authApi } from '../services/api';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) {
            setError('비밀번호는 6자 이상이어야 합니다.');
            return;
        }
        setLoading(true);
        try {
            const res = await authApi.register(form);
            if (res.ok) {
                setSuccess('🎉 회원가입 성공! 로그인 페이지로 이동합니다...');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError(res.data.message ?? '회원가입에 실패했습니다.');
            }
        } catch {
            setError('서버 연결 실패. 잠시 후 다시 시도해주세요.');
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
                    <p className="text-muted-foreground mt-2">회원가입 후 바로 예약하세요!</p>
                </div>

                <div className="glass-card p-8 rounded-2xl">
                    <h1 className="text-2xl font-bold mb-6">회원가입</h1>

                    {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}
                    {success && <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm">{success}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 이름 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">이름 *</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-name" type="text" required value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="홍길동"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        {/* 이메일 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">이메일 *</label>
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
                            <label className="text-sm text-muted-foreground mb-1.5 block">연락처</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-phone" type="tel" value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="010-0000-0000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                            </div>
                        </div>
                        {/* 비밀번호 */}
                        <div>
                            <label className="text-sm text-muted-foreground mb-1.5 block">비밀번호 * (6자 이상)</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input id="reg-password" type={showPw ? 'text' : 'password'} required value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="비밀번호 (6자 이상)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary/50" />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button id="reg-submit" type="submit" disabled={loading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
                            {loading ? '처리 중...' : '회원가입'}
                        </button>
                    </form>

                    {/* 구분선 */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1a1c1e] px-2 text-muted-foreground font-bold tracking-widest">OR SNS REGISTER</span></div>
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
                        이미 회원이신가요?{' '}
                        <Link to="/login" className="text-primary hover:underline">로그인</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
