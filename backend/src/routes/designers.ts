import { Hono } from 'hono';
import { getDb } from '../db';

const designers = new Hono<{ Bindings: { DATABASE_URL: string } }>();

// ── GET /api/designers : 모든 디자이너 조회 (공개 가능) ──
designers.get('/', async (c) => {
    try {
        const sql = getDb(c.env.DATABASE_URL);
        const list = await sql`SELECT * FROM designers ORDER BY created_at DESC`;
        return c.json({ success: true, data: list });
    } catch (err: any) {
        return c.json({ success: false, message: err.message }, 500);
    }
});

// ── POST /api/designers : [관리자] 신규 디자이너 등록 ──
designers.post('/', async (c) => {
    try {
        const { name, role, description, image_url } = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        const [newDesigner] = await sql`
            INSERT INTO designers (name, role, description, image_url)
            VALUES (${name}, ${role}, ${description}, ${image_url})
            RETURNING *
        `;

        return c.json({ success: true, message: '디자이너가 등록되었습니다.', data: newDesigner });
    } catch (err: any) {
        return c.json({ success: false, message: err.message }, 500);
    }
});

// ── PATCH /api/designers/:id : [관리자] 디자이너 정보 수정 ──
designers.patch('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const { name, role, description, image_url } = await c.req.json();
        const sql = getDb(c.env.DATABASE_URL);

        const [updated] = await sql`
            UPDATE designers 
            SET name = ${name}, role = ${role}, description = ${description}, image_url = ${image_url}
            WHERE id = ${id}
            RETURNING *
        `;

        if (!updated) return c.json({ success: false, message: '디자이너를 찾을 수 없습니다.' }, 404);
        return c.json({ success: true, message: '디자이너 정보가 수정되었습니다.', data: updated });
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
