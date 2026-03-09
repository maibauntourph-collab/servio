/**
 * 👨‍🏫 관리자 설정 API 라우터 (2026-03-04)
 * GCash 번호 및 QR 코드 주소 등 시스템 설정을 관리합니다.
 */
import { Hono } from 'hono';
import { getDb } from '../db';

type Bindings = {
    DATABASE_URL: string;
    JWT_SECRET: string;
    SUPABASE_JWT_SECRET: string; // 👨‍🏫 Supabase 필수 연동
};
const adminSettings = new Hono<{ Bindings: Bindings }>();

// ── GET /api/admin/settings/gcash ──
// 현재 설정된 GCash 정보 조회 (공개 가능 또는 관리자 전용 선택)
adminSettings.get('/gcash', async (c) => {
    try {
        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`SELECT key, value FROM settings WHERE key IN ('gcash_number', 'gcash_qr_url')`;

        const settings = rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return c.json({ success: true, data: settings });
    } catch (err) {
        return c.json({ success: false, message: '설정 조회 실패' }, 500);
    }
});

// ── PUT /api/admin/settings/gcash ──
// GCash 정보 업데이트 (관리자 권한 필수)
adminSettings.put('/gcash', async (c) => {
    try {
        const { gcash_number, gcash_qr_url } = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        if (gcash_number) {
            await sql`
                INSERT INTO settings (key, value) VALUES ('gcash_number', ${gcash_number})
                ON CONFLICT (key) DO UPDATE SET value = ${gcash_number}, updated_at = CURRENT_TIMESTAMP
            `;
        }

        if (gcash_qr_url) {
            await sql`
                INSERT INTO settings (key, value) VALUES ('gcash_qr_url', ${gcash_qr_url})
                ON CONFLICT (key) DO UPDATE SET value = ${gcash_qr_url}, updated_at = CURRENT_TIMESTAMP
            `;
        }

        return c.json({ success: true, message: '설정이 저장되었습니다.' });
    } catch (err) {
        return c.json({ success: false, message: '설정 저장 실패' }, 500);
    }
});

export default adminSettings;
