/**
 * 👨‍🏫 헤어스타일 API 라우터 (2026-03-03)
 * GET /api/styles          — 전체 목록 (페이지네이션)
 * GET /api/styles/:id      — 단일 상세
 * GET /api/styles/category/:cat — 카테고리 필터
 */
import { Hono } from 'hono';
import { getDb } from '../db';

type Bindings = { DATABASE_URL: string };

const styles = new Hono<{ Bindings: Bindings }>();

// ──────────────────────────────────────────────────
// GET /api/styles  전체 스타일 목록 (최대 100개)
// ──────────────────────────────────────────────────
styles.get('/', async (c) => {
    try {
        const sql = getDb(c.env.DATABASE_URL);
        // ORDER BY id 로 등록 순서 유지, is_active=true만 노출
        const rows = await sql`
            SELECT * FROM hairstyles
            WHERE is_active = TRUE
            ORDER BY id ASC
        `;
        return c.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
        console.error('스타일 목록 조회 에러:', err);
        return c.json({ success: false, message: '스타일 목록을 불러오지 못했습니다.' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/styles/category/:cat  카테고리 필터
// ──────────────────────────────────────────────────
styles.get('/category/:cat', async (c) => {
    try {
        const cat = c.req.param('cat');
        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`
            SELECT * FROM hairstyles
            WHERE category = ${cat} AND is_active = TRUE
            ORDER BY id ASC
        `;
        return c.json({ success: true, data: rows, category: cat });
    } catch (err) {
        console.error('카테고리 조회 에러:', err);
        return c.json({ success: false, message: '카테고리 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/styles/:id  단일 스타일 상세
// ──────────────────────────────────────────────────
styles.get('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'));
        if (isNaN(id)) return c.json({ success: false, message: '잘못된 ID입니다.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`SELECT * FROM hairstyles WHERE id = ${id} LIMIT 1`;

        if (rows.length === 0)
            return c.json({ success: false, message: '해당 스타일을 찾을 수 없습니다.' }, 404);

        return c.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('스타일 상세 조회 에러:', err);
        return c.json({ success: false, message: '상세 조회 실패' }, 500);
    }
});

export default styles;
