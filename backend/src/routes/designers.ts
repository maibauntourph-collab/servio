import { Hono } from 'hono';
import { getDb } from '../db';

const designers = new Hono<{ Bindings: { DATABASE_URL: string } }>();

// ──────────────────────────────────────────────────
// GET /api/:shopId/designers  — 모든 디자이너 조회
// ──────────────────────────────────────────────────
designers.get('/', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const sql = getDb(c.env.DATABASE_URL);
        const list = await sql`SELECT * FROM designers WHERE shop_id = ${shopId} ORDER BY created_at DESC`;
        return c.json({ success: true, data: list });
    } catch (err: any) {
        return c.json({ success: false, message: err.message }, 500);
    }
});

// ──────────────────────────────────────────────────
// POST /api/:shopId/designers  — [관리자] 디자이너 등록
// ──────────────────────────────────────────────────
designers.post('/', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const { name, role, description, image_url } = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        const [newDesigner] = await sql`
            INSERT INTO designers (shop_id, name, role, description, image_url)
            VALUES (${shopId}, ${name}, ${role}, ${description}, ${image_url})
            RETURNING *
        `;

        return c.json({ success: true, message: '등록되었습니다.', data: newDesigner });
    } catch (err: any) {
        return c.json({ success: false, message: err.message }, 500);
    }
});

// ──────────────────────────────────────────────────
// PATCH /api/:shopId/designers/:id — [관리자] 정보 수정
// ──────────────────────────────────────────────────
designers.patch('/:id', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const id = c.req.param('id');
        const { name, role, description, image_url } = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        const [updated] = await sql`
            UPDATE designers 
            SET name = ${name}, role = ${role}, description = ${description}, image_url = ${image_url}
            WHERE shop_id = ${shopId} AND id = ${id}
            RETURNING *
        `;

        if (!updated) return c.json({ success: false, message: '찾을 수 없습니다.' }, 404);
        return c.json({ success: true, data: updated });
    } catch (err: any) {
        return c.json({ success: false, message: err.message }, 500);
    }
});

// ── DELETE /api/designers/:id : [관리자] 디자이너 삭제 ──
designers.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const sql = getDb(c.env.DATABASE_URL);

        const [deleted] = await sql`
            DELETE FROM designers WHERE id = ${id}
            RETURNING id
        `;

        if (!deleted) return c.json({ success: false, message: '디자이너를 찾을 수 없습니다.' }, 404);
        return c.json({ success: true, message: '디자이너가 삭제되었습니다.' });
    } catch (err: any) {
        return c.json({ success: false, message: err.message }, 500);
    }
});

export default designers;
