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
// POST /api/auth/register — 회원가입
// ──────────────────────────────────────────────────
auth.post('/register', async (c) => {
    try {
        const { email, password, name, phone } = await c.req.json();

        // 필수값 검증
        if (!email || !password || !name)
            return c.json({ success: false, message: '이메일, 비밀번호, 이름은 필수입니다.' }, 400);

        // 이메일 형식 검사 (간단한 정규식)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return c.json({ success: false, message: '이메일 형식이 올바르지 않습니다.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);

        // 중복 이메일 확인
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existing.length > 0)
            return c.json({ success: false, message: '이미 사용 중인 이메일입니다.' }, 409);

        // 비밀번호 해싱 후 저장
        const password_hash = await hashPassword(password);
        const result = await sql`
            INSERT INTO users (email, password_hash, name, phone)
            VALUES (${email}, ${password_hash}, ${name}, ${phone ?? null})
            RETURNING id, email, name, role, created_at
        `;

        return c.json({ success: true, message: '🎉 회원가입 성공!', user: result[0] }, 201);
    } catch (err) {
        console.error('회원가입 에러:', err);
        return c.json({ success: false, message: '서버 에러가 발생했습니다.' }, 500);
    }
});

// ──────────────────────────────────────────────────
// POST /api/auth/login — 로그인 + JWT 발급
// ──────────────────────────────────────────────────
auth.post('/login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password)
            return c.json({ success: false, message: '이메일과 비밀번호를 입력하세요.' }, 400);

        const sql = getDb(c.env.DATABASE_URL);

        // 사용자 조회
        const users = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
        if (users.length === 0)
            return c.json({ success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' }, 401);

        const user = users[0] as any;

        // 비밀번호 검증
        const valid = await verifyPassword(password, user.password_hash);
        if (!valid)
            return c.json({ success: false, message: '이메일 또는 비밀번호가 틀렸습니다.' }, 401);

        // JWT 발급 (유효기간 7일)
        const token = await sign(
            { userId: user.id, email: user.email, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
            c.env.JWT_SECRET
        );

        return c.json({
            success: true,
            message: '✅ 로그인 성공!',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error('로그인 에러:', err);
        return c.json({ success: false, message: '서버 에러가 발생했습니다.' }, 500);
    }
});

// ──────────────────────────────────────────────────
// GET /api/auth/me — 내 정보 조회 (JWT Bearer 토큰 필요)
// ──────────────────────────────────────────────────
auth.get('/me', async (c) => {
    try {
        // Authorization: Bearer <token> 헤더에서 토큰 추출
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return c.json({ success: false, message: '인증 토큰이 필요합니다.' }, 401);

        const token = authHeader.split(' ')[1];
        const payload = await verify(token, c.env.JWT_SECRET) as any;

        const sql = getDb(c.env.DATABASE_URL);
        const rows = await sql`
            SELECT id, email, name, phone, role, created_at
            FROM users WHERE id = ${payload.userId} LIMIT 1
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
