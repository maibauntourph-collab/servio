/**
 * 👨‍🏫 프리미엄 로그인 모달 (LoginModal)
 * 구글, 페이스북, 이메일 로그인을 하나로 통합한 우아한 인터페이스입니다.
 * 학생들에게 "보이는 것이 전부가 아니라, 그 뒤의 인증 로직이 핵심"이라고 설명해 주세요!
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, Chrome, Facebook, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    // 소셜 로그인 처리 (Google, Facebook)
    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            setMessage({ type: 'error', text: error.message });
            setIsLoading(false);
        }
    };

    // 이메일 로그인/회원가입 처리
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: email.split('@')[0], // 기본 이름 설정
                        }
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: '가입 확인 이메일을 보냈습니다. 이메일을 확인해주세요!' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden bg-[#0a0a0a] border border-gold/20 rounded-2xl shadow-2xl"
            >
                {/* 상단 장식 바 */}
                <div className="h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    {/* 로고 및 제목 */}
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-xl bg-gold/10 mb-4 border border-gold/20">
                            <Lock className="text-gold w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">K-Barber Membership</h2>
                        <p className="text-gray-400 text-sm">프리미엄 서비스를 위해 로그인해 주세요</p>
                    </div>

                    {/* 소셜 로그인 버튼 세트 */}
                    <div className="space-y-3 mb-8">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <Chrome size={20} />
                            Google로 계속하기
                        </button>
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] text-white font-semibold rounded-xl hover:bg-[#166fe5] transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <Facebook size={20} />
                            Facebook으로 계속하기
                        </button>
                        <button
                            onClick={() => handleSocialLogin('kakao' as any)} // Supabase Auth Kakao provider
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#FEE500] text-black font-semibold rounded-xl hover:bg-[#FDD800] transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {/* 단순 텍스트 'K' 대신 svg로 카카오풍 말풍선 아이콘을 간단히 넣습니다 */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C6.47715 3 2 6.58172 2 11C2 13.8242 3.7383 16.3056 6.36 17.7818C6.12461 18.6657 5.25 21.0829 5.21557 21.1891C5.10549 21.5283 5.37893 21.758 5.67919 21.5837C5.97607 21.4113 9.38799 18.9958 10.3702 18.3072C10.9038 18.3976 11.4485 18.4444 12 18.4444C17.5228 18.4444 22 14.8627 22 11C22 6.58172 17.5228 3 12 3Z" />
                            </svg>
                            카카오로 계속하기
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-gray-500">또는 이메일로</span></div>
                    </div>

                    {/* 이메일 폼 */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">이메일 주소</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">비밀번호</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-all"
                                />
                            </div>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-sm p-3 rounded-lg ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-gold to-[#d4af37] text-black font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {mode === 'login' ? '로그인하기' : '회원가입하기'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* 모드 전환 */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            {mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="ml-2 text-gold hover:underline font-medium"
                            >
                                {mode === 'login' ? '회원가입' : '로그인'}
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginModal;
