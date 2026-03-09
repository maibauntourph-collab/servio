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
// GET /api/:shopId/styles  전체 스타일 목록 (최대 100개)
// ──────────────────────────────────────────────────
styles.get('/', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const sql = getDb(c.env.DATABASE_URL);
        // 샵 코드별로 필터링하여 데이터 격리!
        const rows = await sql`
            SELECT * FROM hairstyles
            WHERE shop_id = ${shopId} AND is_active = TRUE
            ORDER BY id ASC
        `;
        return c.json({ success: true, data: rows, total: rows.length });
    } catch (err) {
        console.error('스타일 목록 조회 에러:', err);
        return c.json({ success: false, message: '스타일 목록을 불러오지 못했습니다.' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/:shopId/styles/category/:cat  카테고리 필터
// ──────────────────────────────────────────────────
styles.get('/category/:cat', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const cat = c.req.param('cat');
        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`
            SELECT * FROM hairstyles
            WHERE shop_id = ${shopId} AND category = ${cat} AND is_active = TRUE
            ORDER BY id ASC
        `;
        return c.json({ success: true, data: rows, category: cat });
    } catch (err) {
        console.error('카테고리 조회 에러:', err);
        return c.json({ success: false, message: '카테고리 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/:shopId/styles/:id  단일 스타일 상세
// ──────────────────────────────────────────────────
styles.get('/:id', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const id = Number(c.req.param('id'));
        if (isNaN(id)) return c.json({ success: false, message: '잘못된 ID입니다.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`SELECT * FROM hairstyles WHERE shop_id = ${shopId} AND id = ${id} LIMIT 1`;

        if (rows.length === 0)
            return c.json({ success: false, message: '해당 스타일을 찾을 수 없습니다.' }, 404);

        return c.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error('스타일 상세 조회 에러:', err);
        return c.json({ success: false, message: '상세 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// PATCH /api/:shopId/styles/:id  스타일 수정
// ──────────────────────────────────────────────────
styles.patch('/:id', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const id = Number(c.req.param('id'));
        if (isNaN(id)) return c.json({ success: false, message: '잘못된 ID입니다.' }, 400);

        const body = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        // 👨‍🏫 교수님 팁: 서버리스 SQL에서는 업데이트 필드를 명시적으로 지정하는 것이 안전합니다!
        const result = await sql`
            UPDATE hairstyles
            SET 
                img_url = ${body.img_url !== undefined ? body.img_url : sql`img_url`},
                price = ${body.price !== undefined ? Number(body.price) : sql`price`},
                name_ko = ${body.ko !== undefined ? body.ko : sql`name_ko`},
                name_en = ${body.en !== undefined ? body.en : sql`name_en`},
                category = ${body.category !== undefined ? body.category : sql`category`},
                is_active = ${body.is_active !== undefined ? body.is_active : sql`is_active`}
            WHERE shop_id = ${shopId} AND id = ${id}
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
