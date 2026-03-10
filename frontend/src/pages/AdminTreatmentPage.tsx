import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Check, X, Search, Image as ImageIcon } from 'lucide-react';
import { stylesApi, api } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

interface Style {
    id: number;
    ko: string;
    en: string;
    img_url: string;
    price: number;
    category: string;
    designer: string;
}

export default function AdminStylesPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthContext();
    const [styles, setStyles] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Style>>({});

    useEffect(() => {
        if (!isLoggedIn) navigate('/login');
        loadStyles();
    }, [isLoggedIn, navigate]);

    const loadStyles = async () => {
        try {
            // 👨‍🏫 shopId 'kbarber'를 명시적으로 전달합니다.
            const res = await stylesApi.list('kbarber');
            if (res.ok) setStyles(res.data.data);
        } catch (err) {
            console.error('Failed to load styles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (style: Style) => {
        setEditingId(style.id);
        setEditForm(style);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async (id: number) => {
        try {
            const res = await api.patch(`/api/styles/${id}`, editForm);
            if (res.ok) {
                setStyles(prev => prev.map(s => s.id === id ? { ...s, ...editForm } as Style : s));
                setEditingId(null);
            } else {
                alert(res.data.message || '수정 실패');
            }
        } catch (err) {
            alert('서버 연결 실패');
        }
    };

    const filtered = styles.filter(s =>
        (s.ko || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.en || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 flex items-center justify-between">
                <button onClick={() => navigate('/mypage')} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <ArrowLeft size={18} /> 관리홈
                </button>
                <span className="text-xl font-black gold-gradient-text tracking-tighter uppercase">Style Management</span>
                <div className="w-20"></div>
            </nav>

            <div className="pt-28 px-6 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-2xl font-bold">헤어스타일 라이브 관리</h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="스타일 검색..."
                            className="bg-secondary/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 w-full md:w-64 focus:border-primary transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-muted-foreground italic text-lg animate-pulse">스타일 목록을 불러오는 중...</div>
                ) : (
                    <div className="grid gap-4">
                        {filtered.map(style => (
                            <motion.div
                                key={style.id}
                                layout
                                className={`glass-card rounded-2xl p-4 border ${editingId === style.id ? 'border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-white/5'}`}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden relative group shrink-0 bg-black/40">
                                        <img
                                            src={editingId === style.id ? editForm.img_url : style.img_url}
                                            alt={style.en}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImageIcon size={24} className="text-white/80" />
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        {editingId === style.id ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Image URL</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-3 text-sm focus:border-primary outline-none"
                                                        value={editForm.img_url || ''}
                                                        onChange={e => setEditForm({ ...editForm, img_url: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Style Name (KO)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-3 text-sm focus:border-primary outline-none"
                                                        value={editForm.ko || ''}
                                                        onChange={e => setEditForm({ ...editForm, ko: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest pl-1">Price (₱)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg py-1.5 px-3 text-sm focus:border-primary outline-none"
                                                        value={editForm.price || 0}
                                                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="flex items-end justify-end gap-2 pt-2">
                                                    <button onClick={handleCancel} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-all">
                                                        <X size={18} />
                                                    </button>
                                                    <button onClick={() => handleSave(style.id)} className="p-2 rounded-lg bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all">
                                                        <Check size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold">{style.ko} <span className="text-muted-foreground font-normal text-sm ml-2">{style.en}</span></h3>
                                                        <p className="text-primary font-black text-xl mt-1">₱ {Number(style.price).toLocaleString()}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleEdit(style)}
                                                        className="p-2.5 rounded-xl bg-white/5 hover:bg-primary/20 hover:text-primary transition-all text-muted-foreground"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-muted-foreground font-bold border border-white/5 uppercase tracking-tighter">{style.category}</span>
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-muted-foreground font-bold border border-white/5 uppercase tracking-tighter">{style.designer}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
