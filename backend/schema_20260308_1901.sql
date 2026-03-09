-- 1. Profiles 테이블: 사용자 역할을 정의합니다 (Admin, Owner, Therapist, Customer)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'owner', 'therapist', 'customer')) DEFAULT 'customer'
);

-- 2. Shops 테이블: 매장 및 GPS 위치 정보를 저장합니다
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Campaigns 테이블: AI 마케팅 캠페인 및 자동화 규칙을 저장합니다
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id),
  title TEXT NOT NULL,
  description TEXT,
  target_radius_km INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  automation_type TEXT, -- 'auto' or 'manual_approval'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 설정: 보안을 위해 필수입니다
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 정책 설정 예시 (교수님 설명: 오직 본인의 프로필만 수정 가능하게 합니다)
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
