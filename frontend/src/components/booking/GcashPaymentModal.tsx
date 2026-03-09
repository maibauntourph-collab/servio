/**
 * 👨‍🏫 GCash 결제 영수증 제출 모달 (2026-03-08 업데이트)
 * 필리핀 국민 결제 수단인 GCash를 통해 입금한 영수증(Reference Number)을 수집합니다.
 * 학습 포인트: 복잡한 팝업 UI를 Framer Motion을 이용해 프리미엄 애니메이션으로 구현하는 예시입니다.
 * 필리핀 현지 고객들을 위한 최적화된 결제 UX를 제공합니다.
 * Glassmorphism 디자인과 애니메이션이 적용되어 있습니다.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Info, CreditCard } from 'lucide-react';
import { settingsApi } from '../../services/api';
import { useShop } from '../../context/ShopContext';

interface GcashPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (refNumber: string) => void;
    amount: number;
    loading?: boolean;
}

export default function GcashPaymentModal({ isOpen, onClose, onConfirm, amount, loading }: GcashPaymentModalProps) {
    const [refNumber, setRefNumber] = useState('');
    const [copied, setCopied] = useState(false);
    const [gcashInfo, setGcashInfo] = useState({ number: '09XX-XXX-XXXX', qrUrl: '' });
    const [fetching, setFetching] = useState(false);

    // 👨‍🏫 관리자 설정에서 GCash 정보를 가져옵니다.
    const { shop } = useShop();
    const shopId = shop?.slug || shop?.id || '';

    useEffect(() => {
        if (isOpen && shopId) {
            setFetching(true);
            settingsApi.getGcash(shopId).then(res => {
                if (res.ok && res.data) {
                    setGcashInfo({
                        number: res.data.gcash_number || '0917-123-4567',
                        qrUrl: res.data.gcash_qr_url || '/assets/gcash-qr-placeholder.png'
                    });
                }
            }).finally(() => setFetching(false));
        }
    }, [isOpen, shopId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(gcashInfo.number);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* 배경 블러 처리 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* 모달 본체 */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md glass border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                    {/* 상단 헤더 */}
                    <div className="bg-[#007DFE] p-6 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-black italic tracking-tighter">GCash Payment</h3>
                            <p className="text-xs opacity-80 font-medium">Safe & Secured Transaction</p>
                        </div>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* 결제 금액 */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">Total Amount</p>
                            <h2 className="text-4xl font-black text-primary gold-gradient-text tracking-tight">₱ {amount.toLocaleString()}</h2>
                        </div>

                        {/* GCash 번호 복사 영역 */}
                        <div className="glass-card bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">GCash Number</p>
                                <p className="text-lg font-black tracking-wider">{gcashInfo.number}</p>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:scale-105'}`}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>

                        {/* QR 코드 (플레이스홀더 또는 실제 이미지) */}
                        <div className="relative aspect-square max-w-[180px] mx-auto bg-white rounded-2xl p-3 shadow-inner overflow-hidden group">
                            {fetching ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                                    <div className="w-8 h-8 border-4 border-[#007DFE] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <img
                                    src={gcashInfo.qrUrl}
                                    alt="GCash QR"
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=GCash_Payment_Placeholder';
                                    }}
                                />
                            )}
                        </div>

                        {/* 레퍼런스 번호 입력 */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                <CreditCard size={14} /> GCash Reference Number
                            </label>
                            <input
                                type="text"
                                maxLength={13}
                                placeholder="Enter 8-13 digit reference number"
                                value={refNumber}
                                onChange={(e) => setRefNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl font-black tracking-[0.2em] focus:outline-none focus:border-[#007DFE] transition-all placeholder:text-gray-600 focus:ring-2 focus:ring-[#007DFE]/20"
                            />
                            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                                <Info size={10} /> After paying, please enter the reference number from your receipt.
                            </p>
                        </div>

                        {/* 최종 확인 버튼 */}
                        <button
                            disabled={refNumber.length < 8 || loading}
                            onClick={() => onConfirm(refNumber)}
                            className="w-full bg-[#007DFE] hover:bg-[#0077F0] disabled:bg-gray-600 text-white py-4 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-lg shadow-[#007DFE]/20"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Confirm Payment'
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
