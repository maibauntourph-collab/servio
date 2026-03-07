# 목적
사용자가 4가지 고급 프리미엄 QR 프레임 중 하나를 선택할 수 있게 하여 맞춤화된 앱 설치 뷰를 제공합니다. 또한 선택된 프레임을 유지하면서, 중앙의 스캔 작동 가능한 금속 질감 QR 패턴(CSS Mask)은 100% 보존합니다.

## 제안된 에이전트 및 프롬프트
이후 바로 **Agentic Coding Assistant**를 활용해 코드를 작성할 계획입니다.
* 추천 에이전트: `Antigravity`
* 사용할 프롬프트: 
> 교수님이 요청하신 대로 4가지 QR 코드 프레임을 사용자가 직접 클릭해 고를 수 있는 기능을 `LandingPage.tsx`에 구현해줘.

## 상세 실행 단계

### 1. 프론트엔드 상태 추가 (`LandingPage.tsx`)
- `useState`를 사용하여 현재 선택된 `qrStyle`을 관리합니다. (기본값은 `premium-qr-original.png` 등으로 지정)

### 2. 선택 버튼 UI 구성
- QR 코드 바로 하단에, 또는 측면에 작고 고급스러운 동그란 버튼(4종)을 추가합니다.
- 각 버튼을 클릭하면 `qrStyle` 상태가 변경됩니다.
- 각 스타일은 다음 이미지 경로와 매핑됩니다.
   - 1️⃣ A 스타일: `premium-qr-original-A.png`
   - 2️⃣ B 스타일: `premium-qr-original-B.png`
   - 3️⃣ C 스타일: `premium-qr-inal-C.png`
   - 4️⃣ Original: `premium-qr-original.png` (기본)

### 3. QR 배경 렌더링 변경
- 이미 뚫어놓은 CSS 마스킹 메탈릭 QR 코드는 유지한 채, 그 뒤에 깔리는 `<img>` 태그의 `src`만 `qrStyle` 상태에 따라 동적으로 바뀌게 합니다.

### 4. 배포
- 터미널을 열고, 변경된 UI를 운영 환경(`https://barbershop-ui.pages.dev`)에 `npm run deploy` 명령어를 통해 최신화합니다.

---
**교수님 확인 요청:**
위 계획대로 사용자가 클릭해서 바꿀 수 있는 예쁜 4가지 둥근 버튼을 화면에 달아드릴까요? "A, B, C, 기본형" 이렇게 4개가 들어갈 예정입니다. 승인해주시면 바로 코드를 짜겠습니다!
