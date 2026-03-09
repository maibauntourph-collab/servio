/**
 * 👨‍🏫 Supabase 클라이언트 설정 (2026-03-08 업데이트)
 * 백엔드 데이터베이스와 인증 서버(Supabase)를 연결하는 통로입니다.
 * 학습 포인트: 환경 변수(.env)를 통해 보안 정보를 관리하는 패턴을 익힐 수 있습니다.
 */
import { createClient } from '@supabase/supabase-js';

// 교수님, 이 환경 변수들은 나중에 .env 파일에 채워주시면 됩니다.
// 학생들에게는 '인증 서버의 주소와 열쇠'라고 설명하면 좋습니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 👨‍🏫 교수님, 이 경고가 뜬다면 .env 에 Supabase 키를 넣어주세요! (2026-03-08)
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase')) {
    console.error('⚠️ Supabase 설정이 누락되었습니다! (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
    console.log('👉 docs/가이드_Supabase연동_20260305.md 를 참고하여 .env를 채워주세요.');
}

// 💡 설정이 없어도 앱이 완전히 죽어서 '블랙 스크린'이 되지 않도록 빈 값으로라도 생성 시도
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
