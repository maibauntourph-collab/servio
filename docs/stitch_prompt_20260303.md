# Stitch(Cursor) 전용 프리미엄 바버샵 UI 생성 프롬프트
**작성일시:** 2026년 3월 3일 14:55

아래의 프롬프트를 복사하여 **V0, Cursor의 Stitch, 혹은 기타 UI 제너레이터**에 붙여넣기 하면 학생분이 원하시는 '최고급 한국형 바버샵 디자인' 코드를 한 번에 뽑아낼 수 있습니다.

---

## 📋 [복사본] 프론트엔드 전체 랜딩 & 예약 페이지 레이아웃 프롬프트

```text
Create a stunning, premium, and hyper-modern landing and booking page for a high-end Korean men's barbershop and hair salon. 

**[Design System & Aesthetic Guidelines]**
- Theme: Completely Dark mode with a sophisticated, cinematic feel. 
- Color Palette: Deep blacks (#0A0A0A), charcoal grays (#1A1A1A), with elegant metallic gold (#D4AF37) or subtle neon blue accents for interactive elements.
- Style: Use Glassmorphism (blurred translucent backgrounds) for cards, navbars, and panels. Use large, bold, and modern typography (like 'Pretendard' or 'Inter').
- Animations: Add subtle micro-animations (Framer Motion style) such as smooth fade-ins, hover scaling on cards, and button pulse effects.
- You must make this a "Wow" experience. Avoid flat, generic designs. It should look like an Awwwards-winning site.

**[Dependencies]**
- React, Tailwind CSS, Lucide React (for icons), and Framer Motion (if applicable).

**[Required UI Sections (Single Page Scrollable)]**
1. **Hero Section:**
   - Full-width dark cinematic background image of a stylish barbershop interior or a sharp men's haircut.
   - A bold headline in Korean: "당신의 가치를 증명하는 단 하나의 바버샵" (The only barbershop that proves your value).
   - A prominent, glowing CTA button: "예약하기 (Book Now)".

2. **Services & Pricing (Menu):**
   - Glassmorphic styled cards detailing services like 'Signature Cut', 'Classic Shave', and 'Down Perm'.
   - Include price tags with gold accents.

3. **Trend Portfolio (Gallery):**
   - A sleek, masonry or grid-style photo gallery showing trendy Korean men's hairstyles (Ivy League cut, Drop cut, Pointing cut). 
   - Hovering over an image should smoothly reveal the name of the designer who did the cut.

4. **Booking Widget (Interactive):**
   - A beautiful, intuitive calendar UI for selecting a date.
   - Time slots displayed as pill-shaped buttons that glow when selected.
   - Designer selection dropdown or horizontal scroll list with their circular profile avatars.

5. **Footer:**
   - Store location, operating hours, Instagram link icon, and KakaoTalk consultation button.

Make the code extremely modular, responsive, and visually perfect on both mobile devices and desktop screens. Do not use generic placeholders; simulate real-world data and text.
```

---

## 💡 활용 팁 (Professor's Tip)
학생, 이 프롬프트를 **Stitch 환경이나 v0.dev**에 그대로 복사해서 넣어보세요. 

1. **테마(Theme):** 다크 모드와 골드 포인트(Glassmorphism)를 강제하여 싸구려 느낌이 나지 않게 방어했습니다.
2. **섹션(Sections):** 랜딩 화면부터 포트폴리오, 가장 뷰티 시스템에서 퀄리티를 내기 힘든 **'예약 캘린더 위젯'**까지 한 페이지 안에 렌더링되도록 엔지니어링 했습니다.
3. 결과를 뽑아낸 뒤 마음에 드는 구조(React + Tailwind / 혹은 CSS) 코드를 `e:/HAIRSHOP/frontend` 폴더에 복사해서 씌우면, 우리의 텅 빈 도면에 순식간에 명품 인테리어가 완성되는 마법을 볼 수 있을 겁니다!
