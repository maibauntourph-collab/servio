-- =====================================================
-- K-BARBER DB 스키마 (NeonDB PostgreSQL) 2026-03-03
-- 학생 여러분, 이 파일은 데이터를 저장할 "그릇(테이블)"을 만드는 설계도입니다!
-- NeonDB 콘솔의 SQL 에디터에 그대로 붙여넣기 해서 실행하세요.
-- =====================================================

-- 확장 기능: UUID 생성을 위한 함수 활성화
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. 사용자(users) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,           -- 로그인에 사용할 이메일 (중복 불가)
    password_hash TEXT NOT NULL,               -- 절대 평문 저장 금지! 해시값만 저장
    name        TEXT NOT NULL,                 -- 사용자 실명
    phone       TEXT,                          -- 연락처 (선택)
    role        TEXT DEFAULT 'customer',       -- 'customer' 또는 'admin'
    created_at  TIMESTAMPTZ DEFAULT NOW()      -- 가입일시 (시간대 포함)
);

-- =====================================================
-- 2. 헤어스타일(hairstyles) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS hairstyles (
    id          SERIAL PRIMARY KEY,
    name_ko     TEXT NOT NULL,                 -- 한국어 이름
    name_en     TEXT NOT NULL,                 -- 영어 이름
    name_tl     TEXT,                          -- 따갈로그어 이름
    name_ceb    TEXT,                          -- 세부아노어 이름
    price       INTEGER NOT NULL,              -- 가격 (원)
    category    TEXT NOT NULL,                 -- 카테고리 (클래식, 페이드 등)
    description_ko TEXT,                       -- 한국어 설명
    description_en TEXT,                       -- 영어 설명
    duration    INTEGER DEFAULT 45,            -- 시술 시간 (분)
    designer    TEXT,                          -- 담당 디자이너
    img_url     TEXT,                          -- 이미지 URL
    is_active   BOOLEAN DEFAULT TRUE,          -- 노출 여부
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 예약(bookings) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL, -- 예약한 사용자
    style_id    INTEGER REFERENCES hairstyles(id),            -- 예약한 스타일
    designer    TEXT NOT NULL,                                -- 담당 디자이너
    booking_date DATE NOT NULL,                               -- 예약 날짜
    booking_time TIME NOT NULL,                               -- 예약 시간
    status      TEXT DEFAULT 'pending',                       -- pending / confirmed / cancelled
    notes       TEXT,                                         -- 요청사항
    ref_number  TEXT,                                         -- GCash 결제 확인 번호
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 시스템 설정(settings) 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터
INSERT INTO settings (key, value) VALUES 
('gcash_number', '0917-123-4567'),
('gcash_qr_url', 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GCash:09171234567')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 5. 인덱스 (자주 검색하는 컬럼에 붙여 속도 향상!)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
CREATE INDEX IF NOT EXISTS idx_styles_cat    ON hairstyles(category);
