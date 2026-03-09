/**
 * 👨‍🏫 인증(Auth) API 라우터 - 개선판 (2026-03-03)
 * POST /api/auth/register — 회원가입
 * POST /api/auth/login    — 로그인 + JWT 발급
 * GET  /api/auth/me       — 내 정보 조회 (JWT 필요)
 *
 * 보안 원칙: 비밀번호는 절대 평문 저장 금지! (bcryptjs 해싱)
 * JWT: 서버 서명 토큰으로 세션 없이 인증 유지
 */
import { Hono } from 'hono';
import { getDb } from '../db';
import { sign, verify } from 'hono/jwt';

type Bindings = { DATABASE_URL: string; JWT_SECRET: string };
type Variables = { userId: string };

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// ──────────────────────────────────────────────────
// 간단한 비밀번호 해싱 유틸 (Cloudflare Workers 환경 호환)
// Workers에서 bcryptjs가 불안정하여 WebCrypto API를 사용합니다.
// ──────────────────────────────────────────────────
async function hashPassword(pw: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(pw: string, hash: string): Promise<boolean> {
    return (await hashPassword(pw)) === hash;
}

// ──────────────────────────────────────────────────
// POST /api/:shopId/auth/register — 회원가입
// ──────────────────────────────────────────────────
auth.post('/register', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const { email, password, name, phone } = await c.req.json();

        if (!email || !password || !name)
            return c.json({ success: false, message: '이메일, 비밀번호, 이름은 필수입니다.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);

        // 샵 존재 여부 확인 (SaaS 무결성)
        const shop = await sql`SELECT id FROM shops WHERE id = ${shopId}`;
        if (shop.length === 0)
            return c.json({ success: false, message: '유효하지 않은 샵 코드입니다.' }, 404);

        // 중복 이메일 확인 (샵 내에서)
        const existing = await sql`SELECT id FROM users WHERE shop_id = ${shopId} AND email = ${email}`;
        if (existing.length > 0)
            return c.json({ success: false, message: '이미 이 샵에 등록된 이메일입니다.' }, 409);

        const password_hash = await hashPassword(password);
        const result = await sql`
            INSERT INTO users (shop_id, email, password_hash, name, phone)
            VALUES (${shopId}, ${email}, ${password_hash}, ${name}, ${phone ?? null})
            RETURNING id, email, name, role, created_at
        `;

        return c.json({ success: true, message: '🎉 회원가입 성공!', user: result[0] }, 201);
    } catch (err) {
        console.error('회원가입 에러:', err);
        return c.json({ success: false, message: '서버 에러가 발생했습니다.' }, 500);
    }
});

// ──────────────────────────────────────────────────
// POST /api/:shopId/auth/login — 로그인
// ──────────────────────────────────────────────────
auth.post('/login', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const { email, password } = await c.req.json();
        if (!email || !password)
            return c.json({ success: false, message: '이메일과 비밀번호를 입력하세요.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);

        // 해당 샵의 사용자만 조회!
        const users = await sql`SELECT * FROM users WHERE shop_id = ${shopId} AND email = ${email} LIMIT 1`;
        if (users.length === 0)
            return c.json({ success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' }, 401);

        const user = users[0] as any;
        const valid = await verifyPassword(password, user.password_hash);
        if (!valid)
            return c.json({ success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' }, 401);

        const token = await sign(
            {
                userId: user.id,
                shopId: user.shop_id,
                email: user.email,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
            },
            c.env.JWT_SECRET
        );

        return c.json({
            success: true,
            message: '✅ 로그인 성공!',
            token,
            user: { id: user.id, shopId: user.shop_id, email: user.email, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error('로그인 에러:', err);
        return c.json({ success: false, message: '서버 에러가 발생했습니다.' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/:shopId/auth/me — 내 정보 조회
// ──────────────────────────────────────────────────
auth.get('/me', async (c) => {
    try {
        const shopId = c.req.param('shopId');
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return c.json({ success: false, message: '인증 토큰이 필요합니다.' }, 401);

        const token = authHeader.split(' ')[1];
        const payload = (await verify(token, c.env.JWT_SECRET, 'HS256')) as { userId: string; shopId: string };

        // 토큰의 shopId와 현재 접근한 shopId가 일치하는지 확인 (보안 강화)
        if (payload.shopId !== shopId) {
            return c.json({ success: false, message: '다른 샵의 계정으로는 접근할 수 없습니다.' }, 403);
        }

        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`
            SELECT id, shop_id, email, name, phone, role, created_at
            FROM users WHERE id = ${payload.userId} AND shop_id = ${shopId} LIMIT 1
        `;

        if (rows.length === 0)
            return c.json({ success: false, message: '사용자를 찾을 수 없습니다.' }, 404);

        return c.json({ success: true, user: rows[0] });
    } catch (err) {
        console.error('내 정보 조회 에러:', err);
        return c.json({ success: false, message: '유효하지 않은 토큰입니다.' }, 401);
    }
});

export default auth;
