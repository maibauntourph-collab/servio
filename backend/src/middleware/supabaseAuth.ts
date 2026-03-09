/**
 * 👨‍🏫 Supabase JWT 검증 미들웨어
 * 프론트엔드에서 보낸 Supabase 토큰이 진짜인지 확인하는 '신분증 검사대'입니다.
 * 학생들에게 "서버는 아무나 믿지 않는다"는 보안의 기본 원칙을 설명하기 좋습니다!
 */
import { Context, Next } from 'hono';
import { decode, verify } from 'hono/jwt';

export const supabaseAuth = () => {
    return async (c: Context, next: Next) => {
        const authHeader = c.req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ success: false, message: '인증 헤더가 없거나 형식이 올바르지 않습니다.' }, 401);
        }

        const token = authHeader.split(' ')[1];

        try {
            // 💡 Supabase의 JWT_SECRET을 환경 변수에서 가져와 검증합니다.
            const secret = (c.env as any).SUPABASE_JWT_SECRET;
            if (!secret) {
                console.error('❌ Missing SUPABASE_JWT_SECRET in environment variables');
                return c.json({ success: false, message: 'Server configuration error.' }, 500);
            }

            const payload = await verify(token, secret, 'HS256');

            // 검증 성공 시 페이로드에서 유저 ID 추출하여 Context에 저장
            if (payload && payload.sub) {
                c.set('userId' as any, payload.sub);
                c.set('userEmail' as any, payload.email);
                console.log(`🔒 Authenticated User: ${payload.email} (ID: ${payload.sub})`);
            } else {
                console.warn('⚠️ JWT payload verified but missing "sub" field.');
            }

            await next();
        } catch (err: any) {
            console.error('❌ Supabase Auth Verification Failed:', err.message);
            // 학생들에게 디버그 팁: Secret이 틀리면 'invalid signature' 에러가 발생합니다.
            return c.json({
                success: false,
                message: '만료되었거나 유효하지 않은 인증 토큰입니다.',
                debug: err.message // 개발 단계에서만 확인용
            }, 401);
        }
    };
};
