/**
 * 👨‍🏫 백엔드 메인 인덱스 파일 - 최종 (2026-03-03)
 * 모든 API 라우터를 이 파일 하나에서 연결합니다.
 * 마치 회사의 안내데스크처럼, 들어온 요청을 올바른 부서로 안내해주는 역할!
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

import auth from './routes/auth';
import styles from './routes/styles';
import { bookings } from './routes/bookings';
import designers from './routes/designers';
import adminSettings from './routes/admin_settings';
import { supabaseAuth } from './middleware/supabaseAuth';
import { getDb } from './db';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;            // 기존 레거시 (유지)
  SUPABASE_JWT_SECRET: string;   // 👨‍🏫 Supabase 인증용 비밀키 (필수)
};

const app = new Hono<{ Bindings: Bindings }>();

// ── CORS 미들웨어: 모든 Cloudflare Pages 도메인 및 로컬 환경 허용 ──
app.use('/*', cors({
  origin: (origin) => {
    // 로컬 개발 환경 (http/https, localhost/127.0.0.1) 및 barbershop-ui 관련 모든 도메인 허용
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('pages.dev')) {
      return origin || 'https://barbershop-ui.pages.dev';
    }
    return 'https://barbershop-ui.pages.dev';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-client-info'],
  exposeHeaders: ['Content-Length', 'X-KBarber-Version'],
  maxAge: 600,
  credentials: true,
}));

// ── 헬스 체크: 서버 및 DB 상태 확인 ──
app.get('/', async (c) => {
  try {
    const sql = getDb(c.env.DATABASE_URL);
    await sql`SELECT 1`; // DB 연결 테스트
    return c.json({
      status: '✅ K-Barber API 및 DB 정상 가동 중',
      version: '1.1.0',
      auth: 'Supabase Enabled',
      db: 'connected',
      date: new Date().toISOString()
    });
  } catch (err) {
    return c.json({
      status: '⚠️ API는 작동 중이나 DB 연결에 문제가 있습니다.',
      error: (err as any).message
    }, 500);
  }
});

// ── 공개 라우트 (로그인 불필요) ──
app.route('/api/auth', auth);
app.route('/api/styles', styles);
app.route('/api/designers', designers);

// ── 보호 라우트: 👨‍🏫 Supabase 인증 미들웨어 적용 (로그인 필요) ──
app.use('/api/bookings/*', supabaseAuth());

// 디자이너 관리 (CUD) 보호 - 관리자 권한 체크 (추후 Supabase Role 연동 가능)
app.use('/api/designers/*', async (c, next) => {
  if (['POST', 'PATCH', 'DELETE'].includes(c.req.method)) {
    return supabaseAuth()(c, next);
  } else {
    await next();
  }
});

app.route('/api/bookings', bookings);
app.route('/api/admin/settings', adminSettings);

// ── 404 핸들러: 없는 경로 접근 시 친절한 안내 ──
app.notFound((c) => c.json({ success: false, message: '요청한 경로를 찾을 수 없습니다.' }, 404));

export default app;
