import { Hono } from 'hono'
import { cors } from 'hono/cors'

/**
 * Hono API Server - Cloudflare Workers에서 실행됩니다.
 * 학생 여러분: 이 서버는 프론트엔드와 데이터베이스(Supabase/NeonDB) 사이의 가상 다리 역할을 합니다.
 */
const app = new Hono()

// CORS 설정: 모든 도메인에서의 접근을 허용합니다 (개발 단계)
app.use('/*', cors())

app.get('/', (c) => {
    return c.text('Massage Shop Global AI Marketing API 가동 중! 🚀')
})

/**
 * POST /api/marketing/check - 사용자의 위치를 기반으로 마케팅 트리거를 확인합니다.
 */
app.post('/api/marketing/check', async (c) => {
    const { userId, location } = await c.req.json()

    // 여기서 앞서 만든 marketingAI.js 로직을 호출하거나 연동합니다.
    console.log(`사용자 ${userId} 위치 확인:`, location)

    return c.json({
        success: true,
        message: '위치 기반 캠페인 확인 완료',
        triggers: [] // 실제 기능 연동 예정
    })
})

export default app
