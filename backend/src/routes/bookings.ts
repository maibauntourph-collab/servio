/**
 * 👨‍🏫 예약 API 라우터 (2026-03-03)
 * POST /api/bookings         — 예약 생성 (로그인 필요)
 * GET  /api/bookings/my      — 내 예약 목록
 * GET  /api/bookings/available — 예약 가능 슬롯 조회
 * DELETE /api/bookings/:id   — 예약 취소
 */
import { Hono } from 'hono';
import { getDb } from '../db';

type Bindings = {
    DATABASE_URL: string;
    JWT_SECRET: string;
    SUPABASE_JWT_SECRET: string;
};

// 💡 c.get('userId')로 supabaseAuth 미들웨어에서 넘어온 사용자 ID(UUID)를 꺼냅니다.
type Variables = { userId: string; userEmail: string };

const bookings = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ──────────────────────────────────────────────────
// GET /api/:shopId/bookings/available  — 예약 가능 슬롯
// ──────────────────────────────────────────────────
bookings.get('/available', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const date = c.req.query('date') ?? new Date().toISOString().split('T')[0];
        const sql = getDb(c.env.DATABASE_URL);

        const booked = await sql`
            SELECT booking_time, designer FROM bookings
            WHERE shop_id = ${shopId} AND booking_date = ${date} AND status != 'cancelled'
        `;

        const allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        const bookedTimes = booked.map((b: any) => b.booking_time.slice(0, 5));
        const available = allSlots.filter(t => !bookedTimes.includes(t));

        return c.json({ success: true, shopId, date, available });
    } catch (err) {
        console.error('가용 슬롯 조회 에러:', err);
        return c.json({ success: false, message: '가용 슬롯 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/:shopId/bookings/my  — 내 예약 목록
// ──────────────────────────────────────────────────
bookings.get('/my', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const userId = c.get('userId');
        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);

        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`
            SELECT b.*, h.name_ko, h.name_en, h.img_url
            FROM bookings b
            LEFT JOIN hairstyles h ON b.style_id = h.id
            WHERE b.shop_id = ${shopId} AND b.user_id = ${userId}
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `;
        return c.json({ success: true, data: rows });
    } catch (err) {
        console.error('내 예약 조회 에러:', err);
        return c.json({ success: false, message: '예약 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// POST /api/:shopId/bookings  — 신규 예약 생성
// ──────────────────────────────────────────────────
bookings.post('/', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const userId = c.get('userId');
        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);

        const body = await c.req.json();
        const { style_id, designer, booking_date, booking_time, notes, ref_number } = body;

        if (!style_id || !designer || !booking_date || !booking_time)
            return c.json({ success: false, message: '필수 정보가 누락되었습니다.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);

        // 소셜 로그인 유저 동기화 (샵별 격리)
        const userEmail = c.get('userEmail' as any) as string || 'unknown@sns.com';
        const defaultName = userEmail.split('@')[0];

        let dbUserId = userId;
        const [existingUser] = await sql`SELECT id FROM users WHERE shop_id = ${shopId} AND email = ${userEmail}`;

        if (!existingUser) {
            await sql`
                INSERT INTO users (id, shop_id, email, password_hash, name)
                VALUES (${userId}, ${shopId}, ${userEmail}, 'social_login', ${defaultName})
            `;
        } else {
            dbUserId = existingUser.id;
        }

        // 중복 예약 방지
        const conflict = await sql`
            SELECT id FROM bookings
            WHERE shop_id = ${shopId} 
              AND designer = ${designer}
              AND booking_date = ${booking_date}
              AND booking_time = ${booking_time}
              AND status != 'cancelled'
        `;
        if (conflict.length > 0)
            return c.json({ success: false, message: '해당 시간은 이미 예약되었습니다.' }, 409);

        const result = await sql`
            INSERT INTO bookings (shop_id, user_id, style_id, designer, booking_date, booking_time, notes, ref_number)
            VALUES (${shopId}, ${dbUserId}, ${style_id}, ${designer}, ${booking_date}, ${booking_time}, ${notes ?? ''}, ${ref_number ?? ''})
            RETURNING *
        `;
        return c.json({ success: true, message: '예약이 완료되었습니다! 🎉', data: result[0] }, 201);
    } catch (err) {
        console.error('예약 생성 에러:', err);
        return c.json({ success: false, message: '예약 생성 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// DELETE /api/:shopId/bookings/:id — 예약 취소
// ──────────────────────────────────────────────────
bookings.delete('/:id', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const userId = c.get('userId');
        const id = c.req.param('id');
        const sql = getDb(c.env.DATABASE_URL);

        const result = await sql`
            UPDATE bookings SET status = 'cancelled'
            WHERE shop_id = ${shopId} AND id = ${id} AND user_id = ${userId} AND status = 'pending'
            RETURNING id
        `;
        if (result.length === 0)
            return c.json({ success: false, message: '취소할 수 없는 예약입니다.' }, 404);

        return c.json({ success: true, message: '예약이 취소되었습니다.' });
    } catch (err) {
        console.error('예약 취소 에러:', err);
        return c.json({ success: false, message: '취소 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// PATCH /api/bookings/:id/status  — [관리자 전용] 예약 상태 변경 (승인/거절)
// ──────────────────────────────────────────────────
bookings.patch('/:id/status', async (c) => {
    try {
        const userId = c.get('userId');
        const bookingId = c.req.param('id');
        const { status } = await c.req.json();

        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);
        if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
            return c.json({ success: false, message: '올바르지 않은 상태값입니다.' }, 400);
        }

        const sql = getDb(c.env.DATABASE_URL);

        // 1. 관리자 권한 확인
        const [user] = await sql`SELECT role FROM users WHERE id = ${userId}`;
        if (!user || user.role !== 'ADMIN') {
            return c.json({ success: false, message: '관리자 권한이 없습니다.' }, 403);
        }

        // 2. 상태 업데이트
        const [updated] = await sql`
            UPDATE bookings 
            SET status = ${status} 
            WHERE id = ${bookingId}
            RETURNING id, status
        `;

        if (!updated) {
            return c.json({ success: false, message: '해당 예약을 찾을 수 없습니다.' }, 404);
        }

        return c.json({ success: true, message: `예약 상태가 ${status}로 변경되었습니다.`, data: updated });
    } catch (err) {
        console.error('예약 상태 업데이트 에러:', err);
        return c.json({ success: false, message: '상태 업데이트 실패' }, 500);
    }
});

export { bookings };
