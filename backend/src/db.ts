/**
 * 👨‍🏫 교수님의 코딩 노트: NeonDB 연결 설정 파일 (2026-03-03)
 * 
 * 학생 여러분, 이 파일은 우리 서버리스 백엔드가 거대한 데이터베이스(NeonDB)와
 * 어떻게 소통할지 정의하는 핵심 연락처 역할을 합니다!
 * 
 * 기존의 무거운 연결 방식과 달리, Cloudflare Workers와 환상적인 효율을 보여주는
 * `@neondatabase/serverless` 모듈을 사용합니다. 요청이 올 때만 가볍게 연결하고,
 * 응답이 끝나면 깔끔하게 끊어주어 요금도 절약하고 성능도 올릴 수 있죠!
 */

import { neon } from '@neondatabase/serverless';

/**
 * 💡 getDb 함수: 언제 어디서든 DB를 불러오는 마법의 지팡이
 * @param databaseUrl 환경변수(Wrangler/Cloudflare)에서 가져온 비밀스런 DB 접속 주소
 * @returns 쿼리를 실행할 수 있는 sql 객체
 */
export const getDb = (databaseUrl: string) => {
    // 만약 주소가 없다면 에러를 던져서 우리가 깜빡했다는 것을 알려줍니다!
    if (!databaseUrl) {
        throw new Error('데이터베이스 URL이 설정되지 않았습니다. 환경변수(DATABASE_URL)를 확인해주세요.');
    }

    // neon 함수에 주소를 넣으면, 서버리스 환경에 최적화된 SQL 커넥터가 완성됩니다.
    // 자, 이제 이 sql 객체를 통해 세상을 향한 쿼리를 날릴 수 있어요! 🚀
    const sql = neon(databaseUrl);

    return sql;
};
