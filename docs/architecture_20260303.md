# 바버샵 아키텍처 및 데이터베이스 설계
**작성일시:** 2026년 3월 3일 13:36

## 1. 애플리케이션 라우팅 구조 (Routes)

### 📌 Frontend Routes (React + Vite)
사용자에게 보여지는 화면 경로입니다.
| 기능 | 경로 (URL) | 설명 및 연결 컴포넌트 |
|---|---|---|
| **메인 홈** | `/` | 랜딩 페이지, 베스트 포트폴리오 노출, 간편 예약 버튼 (`Home.tsx`) |
| **포트폴리오** | `/portfolio` | 전체 헤어/바버 스타일 갤러리 (`Portfolio.tsx`) |
| **예약 시작** | `/booking` | 디자이너 선택 리스트 화면 (`BookingSelect.tsx`) |
| **시간 선택** | `/booking/time/:designerId` | 특정 디자이너의 예약 가능 시간표 (`BookingTime.tsx`) |
| **결제/확정** | `/booking/confirm` | 서비스 최종 확인 및 예약금 결제 연동 (`BookingConfirm.tsx`) |
| **로그인** | `/auth/login` | 카카오/일반 로그인 지원 (`Login.tsx`) |
| **마이페이지** | `/mypage` | 내 예약 내역 및 프로필 관리 (`MyPage.tsx`) |
| **관리자 대시보드** | `/admin` | 점주/바버 전용 통합 대시보드 (`AdminDashboard.tsx`) |

### 📌 Backend API Routes (Hono + Cloudflare Workers)
데이터 처리를 위한 엣지 서버 API 엔드포인트입니다.
| Method | 경로 (URL) | 설명 | 연결 테이블 (DB) |
|---|---|---|---|
| **GET** | `/api/styles` | 포트폴리오 스타일 목록 조회 | `Styles` |
| **GET** | `/api/designers` | 예약 가능한 바버/디자이너 목록 조회 | `Designers` |
| **GET** | `/api/bookings/available` | 특정 일자/디자이너의 예약 가능 시간 조회 | `Bookings` |
| **POST** | `/api/bookings` | 신규 예약 생성 (결제 전 예약 대기 상태) | `Bookings`, `Users` |
| **POST** | `/api/auth/login` | 회원가입 및 로그인 토큰 발급 (JWT) | `Users` |
| **GET** | `/api/mypage/bookings` | 내 예약 내역 및 상태(승인, 취소 등) 조회 | `Bookings` |


---

## 2. NeonDB Serverless Postgres 스키마 설계

학생에게 설명하듯 쉽게 정리했습니다! 각 데이터(테이블)가 어떻게 연결되어 바버샵 시스템을 굴러가게 하는지 보여주는 핵심 뼈대입니다.

### 👥 Users (사용자 및 관리자 정보)
고객과 직원을 모두 담는 테이블입니다. `role`을 통해 고객과 바버(관리자)를 구분합니다.
```sql
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    oauth_id VARCHAR(255) UNIQUE,       -- 카카오 로그인 등 소셜 연동 ID
    name VARCHAR(100) NOT NULL,         -- 고객 이름 번호
    phone VARCHAR(20) NOT NULL,         -- 예약 연락용 전화번호
    role VARCHAR(20) DEFAULT 'CLIENT',  -- 'CLIENT' (고객) OR 'ADMIN' / 'BARBER' (바버)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ✂️ Designers (바버/디자이너 프로필)
`Users` 테이블과 연결되며, 디자이너의 상세 경력과 예약 정보를 담습니다.
```sql
CREATE TABLE Designers (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),   -- Users 테이블의 바버 데이터와 연결
    bio TEXT,                           -- 디자이너 소개글 (ex: '정통 포마드 스타일 마스터')
    profile_img_url VARCHAR(255),       -- 디자이너 사진
    working_hours JSONB,                 -- 요일별 근무 시간 (ex: {"mon": "10-20", "tue": "off"...})
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 💇‍♂️ Services & Styles (제공 서비스 및 스타일 갤러리)
바버샵에서 제공하는 커트, 펌, 면도 등의 메뉴와 샘플 사진을 정의합니다.
```sql
CREATE TABLE Services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,         -- 서비스 명 (ex: "시그니처 바버 커트")
    description TEXT,
    price INT NOT NULL,                  -- 가격 (ex: 35000)
    duration_min INT NOT NULL            -- 소요 시간 (ex: 60분)
);

CREATE TABLE Styles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,        -- 포트폴리오 제목 (ex: "깔끔한 사이드 파트")
    img_url VARCHAR(255) NOT NULL,      -- 이미지 URL (CDN)
    designer_id INT REFERENCES Designers(id) -- 이 스타일을 시술한 디자이너
);
```

### 🗓️ Bookings (예약 시스템 통합)
가장 중요한 테이블입니다. '누가', '언제', '어떤 디자이너에게', '어떤 서비스'를 받는지 모두 저장합니다.
```sql
CREATE TABLE Bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id),            -- 예약한 고객
    designer_id INT REFERENCES Designers(id),    -- 지정된 바버
    service_id INT REFERENCES Services(id),      -- 선택된 시술
    booking_date DATE NOT NULL,                  -- 예약 날짜 (ex: 2026-03-05)
    start_time TIME NOT NULL,                    -- 시작 시간 (ex: 14:00)
    status VARCHAR(20) DEFAULT 'PENDING',        -- 상태 ('PENDING' 대기, 'CONFIRMED' 확정, 'CANCELED' 취소)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
