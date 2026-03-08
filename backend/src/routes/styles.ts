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

// ──────────────────────────────────────────────────
// PATCH /api/styles/:id  스타일 수정 (이미지 URL, 가격 등)
// ──────────────────────────────────────────────────
styles.patch('/:id', async (c) => {
    try {
        const id = Number(c.req.param('id'));
        if (isNaN(id)) return c.json({ success: false, message: '잘못된 ID입니다.' }, 400);

        const body = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        // 업데이트할 필드 동적 생성
        const updateData: Record<string, any> = {};
        if (body.img_url) updateData.img_url = body.img_url;
        if (body.price) updateData.price = Number(body.price);
        if (body.ko) updateData.ko = body.ko;
        if (body.en) updateData.en = body.en;
        if (body.category) updateData.category = body.category;
        if (body.is_active !== undefined) updateData.is_active = body.is_active;

        if (Object.keys(updateData).length === 0) {
            return c.json({ success: false, message: '수정할 데이터가 없습니다.' }, 400);
        }

        const result = await sql`
            UPDATE hairstyles
            SET ${sql(updateData)}
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return c.json({ success: false, message: '해당 스타일을 찾을 수 없거나 수정에 실패했습니다.' }, 404);
        }

        return c.json({ success: true, data: result[0], message: '스타일 정보가 업데이트되었습니다.' });
    } catch (err: any) {
        console.error('스타일 수정 에러:', err);
        return c.json({ success: false, message: '수정 처리 중 에러가 발생했습니다.' }, 500);
    }
});

export default styles;
