-- =====================================================
-- 🏢 SaaS 멀티테넌시 DB 스키마 (NeonDB PostgreSQL) 2026-03-09
-- 여러 샵을 관리하기 위해 'shop_id'를 도입한 확장판입니다!
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 0. 샵 정보(shops) 테이블 - NEW!
-- =====================================================
CREATE TABLE IF NOT EXISTS shops (
    id          TEXT PRIMARY KEY,              -- 고유 샵 코드 (예: 'massage01', 'barber01')
    name        TEXT NOT NULL,                 -- 샵 이름
    type        TEXT NOT NULL DEFAULT 'massage', -- 'massage' 또는 'hair'
    theme_color TEXT DEFAULT '#d4af37',        -- 샵별 테마 색상
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 1. 사용자(users) 테이블 (샵별 분리)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     TEXT REFERENCES shops(id) ON DELETE CASCADE, -- 소속된 샵 코드
    email       TEXT NOT NULL,                 -- 샵 내에서 고유 (전체 고유일 필요는 없으나 보안상 보수적 설정)
    password_hash TEXT NOT NULL,
    name        TEXT NOT NULL,
    phone       TEXT,
    role        TEXT DEFAULT 'customer',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, email)                    -- 샵 내에서 이메일 중복 금지
);

-- =====================================================
-- 2. 스타일/메뉴(styles) 테이블 (샵별 분리)
-- =====================================================
CREATE TABLE IF NOT EXISTS hairstyles ( -- 마사지샵의 경우 'treatments'로 볼 수 있음
    id          SERIAL PRIMARY KEY,
    shop_id     TEXT REFERENCES shops(id) ON DELETE CASCADE,
    name_ko     TEXT NOT NULL,
    name_en     TEXT NOT NULL,
    name_tl     TEXT,
    name_ceb    TEXT,
    price       INTEGER NOT NULL,
    category    TEXT NOT NULL,
    description_ko TEXT,
    description_en TEXT,
    duration    INTEGER DEFAULT 45,
    designer    TEXT,
    img_url     TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 예약(bookings) 테이블 (샵별 분리)
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     TEXT REFERENCES shops(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    style_id    INTEGER REFERENCES hairstyles(id),
    designer    TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status      TEXT DEFAULT 'pending',
    notes       TEXT,
    ref_number  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 디자이너/테라피스트(designers) 테이블 (샵별 분리)
-- =====================================================
CREATE TABLE IF NOT EXISTS designers (
    id          SERIAL PRIMARY KEY,
    shop_id     TEXT REFERENCES shops(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    role        TEXT,
    description TEXT,
    image_url   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. 시스템 설정(settings) 테이블 (샵별 분리)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    shop_id     TEXT REFERENCES shops(id) ON DELETE CASCADE,
    key         TEXT NOT NULL,
    value       TEXT,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (shop_id, key)
);

-- =====================================================
-- 6. 인덱스 및 초기 데이터
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shops_type ON shops(type);
CREATE INDEX IF NOT EXISTS idx_users_shop ON users(shop_id);
CREATE INDEX IF NOT EXISTS idx_styles_shop ON hairstyles(shop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_shop ON bookings(shop_id);
CREATE INDEX IF NOT EXISTS idx_designers_shop ON designers(shop_id);

-- 초기 시드 데이터 (테스트용)
INSERT INTO shops (id, name, type) VALUES ('barber01', 'K-Barber Shop', 'hair') ON CONFLICT DO NOTHING;
INSERT INTO shops (id, name, type) VALUES ('massage01', 'Premium Massage', 'massage') ON CONFLICT DO NOTHING;
