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

// ── GET /api/:shopId/admin/settings/gcash ──
adminSettings.get('/gcash', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`SELECT key, value FROM settings WHERE shop_id = ${shopId} AND key IN ('gcash_number', 'gcash_qr_url')`;

        const settings = rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return c.json({ success: true, shopId, data: settings });
    } catch (err) {
        return c.json({ success: false, message: '설정 조회 실패' }, 500);
    }
});

// ── PUT /api/:shopId/admin/settings/gcash ──
adminSettings.put('/gcash', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const { gcash_number, gcash_qr_url } = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        if (gcash_number) {
            await sql`
                INSERT INTO settings (shop_id, key, value) VALUES (${shopId}, 'gcash_number', ${gcash_number})
                ON CONFLICT (shop_id, key) DO UPDATE SET value = ${gcash_number}, updated_at = CURRENT_TIMESTAMP
            `;
        }

        if (gcash_qr_url) {
            await sql`
                INSERT INTO settings (shop_id, key, value) VALUES (${shopId}, 'gcash_qr_url', ${gcash_qr_url})
                ON CONFLICT (shop_id, key) DO UPDATE SET value = ${gcash_qr_url}, updated_at = CURRENT_TIMESTAMP
            `;
        }

        return c.json({ success: true, message: '설정이 저장되었습니다.' });
    } catch (err) {
        console.error('설정 저장 에러:', err);
        return c.json({ success: false, message: '설정 저장 실패' }, 500);
    }
});

export default adminSettings;
