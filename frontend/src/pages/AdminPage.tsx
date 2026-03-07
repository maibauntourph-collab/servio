/**
 * 👨‍🏫 관리자 전용 대시보드 페이지 (2026-03-04)
 * 모든 예약 현황을 한눈에 관리하는 점주 전용 페이지입니다.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, RefreshCcw, Calendar, Clock,
    CheckCircle2, XCircle, UserPlus, Edit, Trash2, X
} from 'lucide-react';
import { api, designersApi } from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

// 👨‍🏫 관리자 페이지 번역 데이터
const translations: Record<string, any> = {
    en: {
        nav: { home: "Back to Home", bookings: "Bookings", designers: "Designers" },
        stats: { total: "Total Bookings", pending: "Pending", confirmed: "Confirmed" },
        filter: { all: "ALL", pending: "PENDING", confirmed: "CONFIRMED", cancelled: "CANCELLED" },
        table: { customer: "Customer", style: "Style/Designer", schedule: "Schedule", status: "Status", action: "Actions" },
        designer: { title: "Designer Mgmt", add: "New Designer", edit: "Edit Designer", name: "Name", role: "Role", desc: "Description", img: "Image URL", submit: "Save", addBtn: "Add" },
        settings: { title: "Payment Settings", gcashNum: "GCash Number", qrUrl: "QR Code URL", save: "Update Settings", success: "Settings updated!" },
        msg: { loading: "Loading...", fetchTalent: "Fetching Talent...", noDesigners: "No designers found.", confirmStatus: "Change status?", confirmDelete: "Delete this designer?", authError: "Authorized only. Please re-login if needed." }
    },
    ko: {
        nav: { home: "홈으로", bookings: "예약 관리", designers: "디자이너 관리" },
        stats: { total: "전체 예약", pending: "승인 대기", confirmed: "예약 확정" },
        filter: { all: "전체", pending: "대기", confirmed: "확정", cancelled: "취소" },
        table: { customer: "고객", style: "스타일/디자이너", schedule: "일정", status: "상태", action: "액션" },
        designer: { title: "헤어디자이너 관리", add: "신규 등록", edit: "디자이너 수정", name: "이름", role: "직급", desc: "설명", img: "이미지 URL", submit: "저장하기", addBtn: "등록 완료" },
        settings: { title: "결제 설정 관리", gcashNum: "GCash 수금 번호", qrUrl: "QR 코드 이미지 URL", save: "설정 저장하기", success: "설정이 저장되었습니다!" },
        msg: { loading: "데이터 로딩 중...", fetchTalent: "인재 정보를 불러오는 중...", noDesigners: "등록된 디자이너가 없습니다.", confirmStatus: "상태를 변경하시겠습니까?", confirmDelete: "정말 삭제하시겠습니까?", authError: "관리자 전용 페이지입니다. 권한이 있다면 로그아웃 후 다시 로그인해주세요!" }
    },
    tl: {
        nav: { home: "Bumalik sa Home", bookings: "Mga Booking", designers: "Mga Designer" },
        stats: { total: "Kabuuang Booking", pending: "Nakabinbin", confirmed: "Kumpirmado" },
        filter: { all: "LAHAT", pending: "NAKABINBIN", confirmed: "KUMPIRMADO", cancelled: "KINANSELA" },
        table: { customer: "Customer", style: "Istilo/Designer", schedule: "Iskedyul", status: "Katayuan", action: "Mga Aksyon" },
        designer: { title: "Pamamahala ng Designer", add: "Bagong Designer", edit: "I-edit ang Designer", name: "Pangalan", role: "Tungkulin", desc: "Paglalarawan", img: "URL ng Larawan", submit: "I-save", addBtn: "Idagdag" },
        msg: { loading: "Naglo-load...", fetchTalent: "Kinukuha ang Talent...", noDesigners: "Walang nahanap na mga designer.", confirmStatus: "Baguhin ang katayuan?", confirmDelete: "I-delete ang designer na ito?", authError: "Para sa authorized lang. Mangyaring mag-re-login kung kinakailangan." }
    },
    ceb: {
        nav: { home: "Balik sa Home", bookings: "Mga Booking", designers: "Mga Designer" },
        stats: { total: "Tanan nga Booking", pending: "Nagpaabut", confirmed: "Kumpirmado" },
        filter: { all: "TANAN", pending: "NAGPAABUT", confirmed: "KUMPIRMADO", cancelled: "GIKANSELA" },
        table: { customer: "Customer", style: "Style/Designer", schedule: "Iskedyul", status: "Status", action: "Mga Aksyon" },
        designer: { title: "Pagdumala sa Designer", add: "Bag-ong Designer", edit: "Usba ang Designer", name: "Pangalan", role: "Papel", desc: "Deskripsyon", img: "URL sa Imahe", submit: "I-save", addBtn: "Idugang" },
        msg: { loading: "Nag-load...", fetchTalent: "Nagkuha og Talent...", noDesigners: "Walay nakit-an nga mga designer.", confirmStatus: "Usbon ang status?", confirmDelete: "Papason kini nga designer?", authError: "Para sa authorized lang. Palihug pag-re-login kung gikinahanglan." }
    }
};

// 타입 정의
interface AdminBooking {
    id: number;
    user_name: string;
    user_email: string;
    style_name: string;
    designer: string;
    booking_date: string;
    booking_time: string;
    status: string;
    notes: string;
    ref_number: string;
}

interface Designer {
    id: number;
    name: string;
    role: string;
    description: string;
    image_url: string;
}

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useAuthContext();
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'DESIGNERS' | 'SETTINGS'>('BOOKINGS');

    // 예약 관련 상태
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');

    // 디자이너 관련 상태
    const [designers, setDesigners] = useState<Designer[]>([]);
    const [isDesignerModalOpen, setIsDesignerModalOpen] = useState(false);
    const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
    const [designerForm, setDesignerForm] = useState({ name: '', role: '', description: '', image_url: '' });

    // 설정 관련 상태
    const [gcashSettings, setGcashSettings] = useState({ gcash_number: '', gcash_qr_url: '' });

    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | string | null>(null);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            if (activeTab === 'BOOKINGS') {
                const res = await api.get('/bookings/all');
                if (res.success) setBookings(res.data);
                else setError(res.message);
            } else if (activeTab === 'DESIGNERS') {
                const res = await designersApi.list();
                if (res.success) setDesigners(res.data);
                else setError(res.message);
            } else if (activeTab === 'SETTINGS') {
                const { settingsApi } = await import('../services/api');
                const res = await settingsApi.getGcash();
                if (res.success) setGcashSettings(res.data);
                else setError(res.message);
            }
        } catch (err) {
            setError('데이터를 불러오는 중 에러가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            alert(t.msg.authError);
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate, activeTab, language]);

    // ── 예약 관리 로직 ──
    const handleUpdateBookingStatus = async (id: number, status: string) => {
        if (!confirm(t.msg.confirmStatus)) return;
        setActionLoading(id);
        try {
            const res = await api.patch(`/bookings/${id}/status`, { status });
            if (res.success) setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
            else alert(res.message);
        } finally { setActionLoading(null); }
    };

    // ── 디자이너 관리 로직 ──
    const openDesignerModal = (designer: Designer | null = null) => {
        if (designer) {
            setEditingDesigner(designer);
            setDesignerForm({ ...designer });
        } else {
            setEditingDesigner(null);
            setDesignerForm({ name: '', role: '', description: '', image_url: '' });
        }
        setIsDesignerModalOpen(true);
    };

    const handleDesignerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('submit');
        try {
            let res;
            if (editingDesigner) {
                res = await designersApi.update(editingDesigner.id, designerForm);
            } else {
                res = await designersApi.create(designerForm);
            }

            if (res.success) {
                setIsDesignerModalOpen(false);
                fetchData();
            } else alert(res.message);
        } finally { setActionLoading(null); }
    };

    const handleDeleteDesigner = async (id: number) => {
        if (!confirm(t.msg.confirmDelete)) return;
        setActionLoading(id);
        try {
            const res = await designersApi.delete(id);
            if (res.success) setDesigners(prev => prev.filter(d => d.id !== id));
            else alert(res.message);
        } finally { setActionLoading(null); }
    };


    const handleGcashUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading('settings');
        try {
            const { settingsApi } = await import('../services/api');
            const res = await settingsApi.updateGcash(gcashSettings);
            if (res.success) alert(t.settings.success);
            else alert(res.message);
        } finally { setActionLoading(null); }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING': return 'text-yellow-500 bg-yellow-500/10';
            case 'CONFIRMED': return 'text-green-500 bg-green-500/10';
            case 'CANCELLED': return 'text-red-500 bg-red-500/10';
            default: return 'text-muted-foreground bg-white/5';
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <nav className="flex items-center justify-between mb-8">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft size={18} /> {t.nav.home}
                </button>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('BOOKINGS')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BOOKINGS' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
                    >
                        {t.nav.bookings}
                    </button>
                    <button
                        onClick={() => setActiveTab('DESIGNERS')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'DESIGNERS' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
                    >
                        {t.nav.designers}
                    </button>
                    <button
                        onClick={() => setActiveTab('SETTINGS')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SETTINGS' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-white'}`}
                    >
                        Settings
                    </button>
                </div>
                <button onClick={fetchData} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </nav>

            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'BOOKINGS' ? (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                                    <div className="bg-primary/20 p-3 rounded-xl text-primary"><Calendar size={24} /></div>
                                    <div><p className="text-sm text-muted-foreground">{t.stats.total}</p><p className="text-2xl font-bold">{bookings.length}</p></div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border-yellow-500/20">
                                    <div className="bg-yellow-500/20 p-3 rounded-xl text-yellow-500"><Clock size={24} /></div>
                                    <div><p className="text-sm text-muted-foreground">{t.stats.pending}</p><p className="text-2xl font-bold">{bookings.filter(b => b.status === 'PENDING').length}</p></div>
                                </div>
                                <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border-green-500/20">
                                    <div className="bg-green-500/20 p-3 rounded-xl text-green-500"><CheckCircle2 size={24} /></div>
                                    <div><p className="text-sm text-muted-foreground">{t.stats.confirmed}</p><p className="text-2xl font-bold">{bookings.filter(b => b.status === 'CONFIRMED').length}</p></div>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                                {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(s => (
                                    <button key={s} onClick={() => setFilterStatus(s as any)} className={`px-4 py-2 rounded-full text-xs font-bold ${filterStatus === s ? 'bg-primary text-black' : 'bg-white/5 text-muted-foreground'}`}>
                                        {t.filter[s.toLowerCase() as keyof typeof t.filter]}
                                    </button>
                                ))}
                            </div>

                            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                                    <h2 className="text-xl font-bold">{t.nav.bookings}</h2>
                                    {error && <span className="text-red-500 text-sm">{error}</span>}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                                            <tr><th className="px-6 py-4">{t.table.customer}</th><th className="px-6 py-4">{t.table.style}</th><th className="px-6 py-4">{t.table.schedule}</th><th className="px-6 py-4">{t.table.status}</th><th className="px-6 py-4">Ref No.</th><th className="px-6 py-4 text-center">{t.table.action}</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {isLoading ? (
                                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">{t.msg.loading}</td></tr>
                                            ) : bookings.filter(b => filterStatus === 'ALL' || b.status === filterStatus).map(b => (
                                                <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4"><p className="font-bold text-sm">{b.user_name}</p><p className="text-[10px] text-muted-foreground">{b.user_email}</p></td>
                                                    <td className="px-6 py-4"><p className="text-sm">{b.style_name}</p><p className="text-[10px] text-primary">{b.designer}</p></td>
                                                    <td className="px-6 py-4"><p className="text-sm">{b.booking_date}</p><p className="text-[10px] text-muted-foreground">{b.booking_time}</p></td>
                                                    <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase ${getStatusColor(b.status)}`}>{b.status}</span></td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">
                                                            {b.ref_number || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 flex justify-center gap-2">
                                                        {b.status === 'PENDING' ? (
                                                            <>
                                                                <button
                                                                    disabled={actionLoading === b.id}
                                                                    onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                                                                    className="p-1.5 text-green-500 hover:bg-green-500/20 rounded-md transition-all"
                                                                >
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                                <button
                                                                    disabled={actionLoading === b.id}
                                                                    onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                                                    className="p-1.5 text-red-500 hover:bg-red-500/20 rounded-md transition-all"
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            </>
                                                        ) : <span className="text-[10px] text-white/20 italic">Done</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'DESIGNERS' ? (
                        <motion.div
                            key="designers"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">{t.designer.title}</h2>
                                <button
                                    onClick={() => openDesignerModal()}
                                    className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
                                >
                                    <UserPlus size={18} /> {t.designer.add}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {isLoading ? (
                                    <div className="col-span-full py-20 text-center text-muted-foreground italic tracking-widest uppercase">{t.msg.fetchTalent}</div>
                                ) : designers.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-muted-foreground">{t.msg.noDesigners}</div>
                                ) : designers.map(d => (
                                    <motion.div
                                        layout key={d.id}
                                        className="glass-card rounded-2xl overflow-hidden group border border-white/5 hover:border-primary/50 transition-all"
                                    >
                                        <div className="h-40 overflow-hidden relative">
                                            <img src={d.image_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400'} alt={d.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <button onClick={() => openDesignerModal(d)} className="p-2 bg-black/50 text-white rounded-lg hover:bg-white hover:text-black transition-colors"><Edit size={14} /></button>
                                                <button
                                                    disabled={actionLoading === d.id}
                                                    onClick={() => handleDeleteDesigner(d.id)}
                                                    className="p-2 bg-black/50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-xs text-primary font-black uppercase mb-1 tracking-widest">{d.role}</p>
                                            <h3 className="text-lg font-bold mb-2">{d.name}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="max-w-2xl mx-auto"
                        >
                            <h2 className="text-2xl font-bold mb-6">{t.settings.title}</h2>
                            <div className="glass-card p-8 rounded-3xl border border-white/5">
                                <form onSubmit={handleGcashUpdate} className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase">{t.settings.gcashNum}</label>
                                        <input
                                            type="text"
                                            value={gcashSettings.gcash_number}
                                            onChange={e => setGcashSettings({ ...gcashSettings, gcash_number: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-primary outline-none transition-all"
                                            placeholder="0917-000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase">{t.settings.qrUrl}</label>
                                        <input
                                            type="text"
                                            value={gcashSettings.gcash_qr_url}
                                            onChange={e => setGcashSettings({ ...gcashSettings, gcash_qr_url: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:border-primary outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                                        <p className="text-xs text-primary leading-relaxed">
                                            💡 QR 코드 이미지가 없을 경우, 구글 드라이브나 이미지 호스팅 서비스의 직링크를 사용하세요.
                                            기본값은 0917 번호를 포함한 자동 생성 QR 주소입니다.
                                        </p>
                                    </div>
                                    <button
                                        disabled={actionLoading === 'settings'}
                                        type="submit"
                                        className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === 'settings' ? <RefreshCcw className="animate-spin mx-auto" size={20} /> : t.settings.save}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 디자이너 등록/수정 모달 */}
            <AnimatePresence>
                {isDesignerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDesignerModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl p-8 relative z-10 overflow-hidden"
                        >
                            <button onClick={() => setIsDesignerModalOpen(false)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors"><X size={20} /></button>
                            <h2 className="text-2xl font-black mb-6">{editingDesigner ? t.designer.edit : t.designer.add}</h2>

                            <form onSubmit={handleDesignerSubmit} className="space-y-4">
                                <div><label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">{t.designer.name}</label><input required type="text" value={designerForm.name} onChange={e => setDesignerForm({ ...designerForm, name: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none transition-all" /></div>
                                <div><label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">{t.designer.role}</label><input required placeholder="eg. Senior Designer, Artist" type="text" value={designerForm.role} onChange={e => setDesignerForm({ ...designerForm, role: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none transition-all" /></div>
                                <div><label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">{t.designer.img}</label><input type="text" value={designerForm.image_url} onChange={e => setDesignerForm({ ...designerForm, image_url: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none transition-all" placeholder="https://..." /></div>
                                <div><label className="text-xs font-bold text-muted-foreground mb-1 block uppercase">{t.designer.desc}</label><textarea rows={3} value={designerForm.description} onChange={e => setDesignerForm({ ...designerForm, description: e.target.value })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:border-primary outline-none transition-all resize-none" /></div>

                                <button
                                    disabled={actionLoading === 'submit'}
                                    type="submit"
                                    className="w-full bg-primary text-black py-4 rounded-xl font-black uppercase tracking-widest mt-4 flex items-center justify-center disabled:opacity-50"
                                >
                                    {actionLoading === 'submit' ? <RefreshCcw className="animate-spin" size={20} /> : (editingDesigner ? t.designer.submit : t.designer.addBtn)}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

