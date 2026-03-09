/**
 * 👨‍🏫 API 통신 헬퍼 서비스 (2026-03-08 업데이트)
 * 백엔드 fetch 요청을 한 곳에서 관리하며, 모든 요청에 JWT 인증 토큰을 자동으로 첨부합니다.
 * 학습 포인트: 중복되는 fetch 로직을 apiFetch라는 하나의 함수로 캡슐화하여 유지보수성을 높였습니다.
 */

import { supabase } from '../lib/supabase';

// 백엔드 API 주소: 개발 중에는 로컬, 배포 시에는 real URL
const API_BASE = (import.meta as any).env.VITE_API_URL || 'https://massageshop-api.maibauntourph.workers.dev';

// 💡 공통 fetch 함수: JWT 토큰 자동 첨부, 에러 처리 통합
async function apiFetch(path: string, options: RequestInit = {}) {
    // 💡 [2026-03-08] 최신 세션 토큰 가져오기 (만료 대비)
    const { data: { session } } = await supabase.auth.getSession();
    let token = session?.access_token || localStorage.getItem('massage_shop_token');

    if (session?.access_token) {
        localStorage.setItem('massage_shop_token', session.access_token);
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`📡 Sending request to: ${API_BASE}${path}`);
    try {
        const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        console.log(`📥 Response status: ${res.status} from ${path}`);

        // 401 자동 로그아웃
        if (res.status === 401) {
            localStorage.removeItem('massage_shop_token');
            localStorage.removeItem('massage_shop_user');
        }

        const contentType = res.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            data = { message: await res.text() };
        }

        return { ok: res.ok, status: res.status, data };
    } catch (err: any) {
        console.error('🌐 Network Error or Fetch Failure:', err);
        return { ok: false, status: 0, data: { message: err.message || 'Network connection failed' } };
    }
}

// 💡 관리자용이나 커스텀 요청을 위한 범용 api 객체
export const api = {
    get: (path: string) => apiFetch(path),
    post: (path: string, body: any) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: (path: string, body: any) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
    put: (path: string, body: any) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (path: string) => apiFetch(path, { method: 'DELETE' }),
};

// ── Auth API ──
export const authApi = {
    register: (shopId: string, body: { email: string; password: string; name: string; phone?: string }) =>
        apiFetch(`/api/${shopId}/auth/register`, { method: 'POST', body: JSON.stringify(body) }),

    login: (shopId: string, body: { email: string; password: string }) =>
        apiFetch(`/api/${shopId}/auth/login`, { method: 'POST', body: JSON.stringify(body) }),

    me: (shopId: string) => apiFetch(`/api/${shopId}/auth/me`),
};

// ── Treatments API ──
export const treatmentsApi = {
    list: (shopId: string) => apiFetch(`/api/${shopId}/styles`),
    detail: (shopId: string, id: number) => apiFetch(`/api/${shopId}/styles/${id}`),
    byCategory: (shopId: string, cat: string) => apiFetch(`/api/${shopId}/styles/category/${encodeURIComponent(cat)}`),
};

// ── Bookings API ──
export const bookingsApi = {
    available: (shopId: string, date: string) => api.get(`/api/${shopId}/bookings/available?date=${date}`),
    myBookings: (shopId: string) => api.get(`/api/${shopId}/bookings/my`),
    all: (shopId: string) => api.get(`/api/${shopId}/bookings/all`),
    updateStatus: (shopId: string, id: number, status: string) => api.patch(`/api/${shopId}/bookings/${id}/status`, { status }),
    create: (shopId: string, body: { style_id: number; designer: string; booking_date: string; booking_time: string; notes?: string; ref_number?: string }) =>
        api.post(`/api/${shopId}/bookings`, body),
    cancel: (shopId: string, id: string) => api.delete(`/api/${shopId}/bookings/${id}`),
};

// ── Therapists API ──
export const therapistsApi = {
    list: (shopId: string) => api.get(`/api/${shopId}/designers`),
    create: (shopId: string, body: { name: string; role: string; description: string; image_url: string }) => api.post(`/api/${shopId}/designers`, body),
    update: (shopId: string, id: number, body: { name: string; role: string; description: string; image_url: string }) => api.patch(`/api/${shopId}/designers/${id}`, body),
    delete: (shopId: string, id: number) => api.delete(`/api/${shopId}/designers/${id}`),
};

// ── Settings API ──
export const settingsApi = {
    getGcash: (shopId: string) => api.get(`/api/${shopId}/admin/settings/gcash`),
    updateGcash: (shopId: string, body: { gcash_number?: string; gcash_qr_url?: string }) => api.put(`/api/${shopId}/admin/settings/gcash`, body),
};
