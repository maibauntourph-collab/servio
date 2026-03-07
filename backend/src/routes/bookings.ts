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
// GET /api/bookings/available  — 예약 가능 시간 슬롯
// 특정 날짜에 이미 예약된 시간을 제외하고 반환합니다.
// ──────────────────────────────────────────────────
bookings.get('/available', async (c) => {
    try {
        const date = c.req.query('date') ?? new Date().toISOString().split('T')[0];
        const sql = getDb(c.env.DATABASE_URL);

        // 해당 날짜에 이미 예약된 시간 목록 조회
        const booked = await sql`
            SELECT booking_time, designer FROM bookings
            WHERE booking_date = ${date} AND status != 'cancelled'
        `;

        // 전체 가능한 시간 슬롯 (10:00 ~ 20:00, 1시간 단위)
        const allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        const bookedTimes = booked.map((b: any) => b.booking_time.slice(0, 5));
        const available = allSlots.filter(t => !bookedTimes.includes(t));

        return c.json({ success: true, date, available });
    } catch (err) {
        console.error('가용 슬롯 조회 에러:', err);
        return c.json({ success: false, message: '가용 슬롯 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/bookings/all  — [관리자 전용] 전체 예약 목록 조회
// ──────────────────────────────────────────────────
bookings.get('/all', async (c) => {
    try {
        const userId = c.get('userId');
        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);

        const sql = getDb(c.env.DATABASE_URL);

        // 1. 관리자 권한 확인 (Users 테이블에서 role 조회)
        const [user] = await sql`SELECT role FROM users WHERE id = ${userId}`;
        if (!user || user.role !== 'ADMIN') {
            return c.json({ success: false, message: '관리자 권한이 없습니다.' }, 403);
        }

        // 2. 전체 예약 조회 (사용자 이름, 스타일 이름 포함)
        const rows = await sql`
            SELECT b.*, u.name as user_name, u.email as user_email, h.name_ko as style_name
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            LEFT JOIN hairstyles h ON b.style_id = h.id
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `;
        return c.json({ success: true, data: rows });
    } catch (err) {
        console.error('전체 예약 조회 에러:', err);
        return c.json({ success: false, message: '전체 예약 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/bookings/my  — 내 예약 목록
// ──────────────────────────────────────────────────
bookings.get('/my', async (c) => {
    try {
        // JWT 미들웨어가 userId 변수를 셋팅해줍니다.
        const userId = c.get('userId');
        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);

        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`
            SELECT b.*, h.name_ko, h.name_en, h.img_url
            FROM bookings b
            LEFT JOIN hairstyles h ON b.style_id = h.id
            WHERE b.user_id = ${userId}
            ORDER BY b.booking_date DESC, b.booking_time DESC
        `;
        return c.json({ success: true, data: rows });
    } catch (err) {
        console.error('내 예약 조회 에러:', err);
        return c.json({ success: false, message: '예약 조회 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// POST /api/bookings  — 신규 예약 생성
// ──────────────────────────────────────────────────
bookings.post('/', async (c) => {
    try {
        const userId = c.get('userId');
        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);

        const body = await c.req.json();
        const { style_id, designer, booking_date, booking_time, notes, ref_number } = body;

        // 필수값 검증
        if (!style_id || !designer || !booking_date || !booking_time)
            return c.json({ success: false, message: '필수 정보가 누락되었습니다.' }, 400);

        // 레퍼런스 번호 검증 (있는 경우 8자리 이상)
        if (ref_number && ref_number.length < 8)
            return c.json({ success: false, message: 'Gcash 레퍼런스 번호가 너무 짧습니다. (최소 8자리)' }, 400);

        const sql = getDb(c.env.DATABASE_URL);

        // ────────────────────────────────────────────────────────
        // [중요: 소셜 로그인 유저 자동 동기화]
        // Supabase에서 OAuth로 가입한 유저는 아직 NeonDB `users` 테이블에 없을 수 있습니다.
        // 기존 `email` 기준으로 가입자가 있는지 확인하고, 없으면 새로 등록합니다.
        // ────────────────────────────────────────────────────────
        const userEmail = c.get('userEmail' as any) as string || 'unknown@sns.com';
        const defaultName = userEmail.split('@')[0];
        let dbUserId = userId; // 기본값은 Supabase UUID

        const existingUser = await sql`SELECT id FROM users WHERE email = ${userEmail}`;

        if (existingUser.length === 0) {
            // DB에 없으면 Supabase ID를 그대로 사용하여 새로 삽입
            await sql`
                INSERT INTO users (id, email, password_hash, name)
                VALUES (${userId}, ${userEmail}, 'social_login', ${defaultName})
            `;
        } else {
            // 기존 이메일 가입 유저가 있다면 기존 ID를 사용하여 예약 연결
            dbUserId = existingUser[0].id;
        }

        // 중복 예약 방지: 같은 날, 같은 시간, 같은 디자이너는 예약 불가
        const conflict = await sql`
            SELECT id FROM bookings
            WHERE designer = ${designer}
              AND booking_date = ${booking_date}
              AND booking_time = ${booking_time}
              AND status != 'cancelled'
        `;
        if (conflict.length > 0)
            return c.json({ success: false, message: '해당 시간은 이미 예약되었습니다.' }, 409);

        const result = await sql`
            INSERT INTO bookings (user_id, style_id, designer, booking_date, booking_time, notes, ref_number)
            VALUES (${dbUserId}, ${style_id}, ${designer}, ${booking_date}, ${booking_time}, ${notes ?? ''}, ${ref_number ?? ''})
            RETURNING *
        `;
        return c.json({ success: true, message: '예약이 완료되었습니다! 🎉', data: result[0] }, 201);
    } catch (err) {
        console.error('예약 생성 에러:', err);
        return c.json({ success: false, message: '예약 생성 실패' }, 500);
    }
});

// ──────────────────────────────────────────────────
// DELETE /api/bookings/:id  — 예약 취소
// ──────────────────────────────────────────────────
bookings.delete('/:id', async (c) => {
    try {
        const userId = c.get('userId');
        if (!userId) return c.json({ success: false, message: '로그인이 필요합니다.' }, 401);

        const id = c.req.param('id');
        const sql = getDb(c.env.DATABASE_URL);

        // 본인의 예약만 취소 가능
        const result = await sql`
            UPDATE bookings SET status = 'cancelled'
            WHERE id = ${id} AND user_id = ${userId} AND status = 'pending'
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
