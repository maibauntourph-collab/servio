# K-Barber 다채널 SNS 로그인 (Supabase Auth) 설정 가이드 🚀
> 작성일: 2026-03-06 | 작성자: Antigravity AI Assistant

K-Barber 웹앱의 사용자 편의성을 극대화하기 위해 구글, 카카오, 페이스북 3가지 소셜 로그인을 통합 지원합니다.
프론트엔드 버튼과 Supabase 코드는 이미 모두 연동되어 있습니다. **마지막으로 각 소셜 개발자 센터에서 키를 발급받아 Supabase에 입력하는 작업**만 완료하면 바로 실제 로그인이 가능해집니다.

---

## 🌟 1단계: 필수 공통 준비 (Supabase Callback URL 확인)
각 플랫폼 설정 전에 🌟**콜백(리다이렉트) URL**을 미리 준비해야 합니다.

1. **[Supabase 디비(대시보드)](https://app.supabase.com/) 로그인**
2. 해당 프로젝트 선택 > 좌측 톱니바퀴 ⚙️ (Project Settings) > **[Authentication]** 메뉴 이동
3. `Site URL` 입력란에 배포된 홈페이지 주소 입력: `https://barbershop-ui.pages.dev`
4. 우측 메뉴 중 **[URL Configuration]**
프론트엔드 환경 설정(

.env
) 파일을 확인해 본 결과, 현재 시스템에 연결된 Supabase 프로젝트 ID는 다음과 같습니다:

프로젝트 ID: blmqucses99nnfn

따라서 각 소셜 설정에 넣으실 공통 콜백(리다이렉트) URL은 아래와 같습니다: 👉 https://tbhjylbktoyhysisbzbe.supabase.co/auth/v1/callback

이 주소를 구글, 카카오, 페이스북 개발자 콘솔의 리다이렉트 URI 입력란에 복사해서 붙여넣으시면 됩니다!


 > `Redirect URLs` 탭 확인
   > 이곳에 표시된 `https://blmqucses99nnfn.supabase.co/auth/v1/callback` 주소가 공통 콜백 URL입니다. 이 주소를 복사해 둡니다.

---

## 🔵 2단계: 구글(Google) 로그인 설정
> ※ 안드로이드 사용자 및 글로벌 고객의 기본 이메일 가입률을 높여줍니다.

1. **구글 클라우드 콘솔 이동:** [Google Cloud Console](https://console.cloud.google.com/)
2. 새 프로젝트 생성 후, 좌측 메뉴 **[API 및 서비스] > [사용자 인증 정보]** 클릭
3. 상단 **[+ 사용자 인증 정보 만들기] > [OAuth 클라이언트 ID]** 선택
4. **옵션 설정:**
   - **애플리케이션 유형:** `웹 애플리케이션`
   - **이름:** `K-Barber Login`
   - **승인된 리디렉션 URI:** 아까 복사한 **Supabase 공통 콜백 URL** 붙여넣기 후 [만들기]
5. **발급된 키 복사:** `클라이언트 ID`와 `클라이언트 보안 비밀번호(Secret)` 복사
6. **Supabase로 돌아오기:**
   - 대시보드 좌측 도어 아이콘 🚪 (Authentication) > **[Providers]** 클릭
   - `Google` 찾아 클릭 후 활성화(Enable) 버튼 ON
   - 방금 복사한 ID와 Secret을 붙여넣고 **[Save]**

---

## 🟡 3단계: 카카오(Kakao) 로그인 설정
> ※ 한국 고객의 예약 시 이탈률을 획기적으로 낮춥니다.

1. **카카오 디벨로퍼스 이동:** [Kakao Developers](https://developers.kakao.com/)
2. **[내 애플리케이션] > [애플리케이션 추가하기]** 클릭 (앱 이름: `K-Barber`)
3. 생성된 앱 클릭 > 좌측 메뉴 🔑 **[앱 키]**
   - 여기서 **[REST API 키]**를 복사합니다. (이것이 Client ID 역할)
4. **플랫폼 등록 및 Redirect URI 설정:**
   - 좌측 메뉴 **[플랫폼] > [Web 플랫폼 등록]**: 배포된 도메인(`https://barbershop-ui.pages.dev`) 입력
   - 좌측 메뉴 **[카카오 로그인] > 활성화 ON**
   - 하단 **[Redirect URI]**에 **Supabase 공통 콜백 URL** 붙여넣기
5. **보안 코드 (선택이지만 필수 권장):**
   - 좌측 메뉴 **[카카오 로그인] > [보안] > Client Secret 코드 생성** 후 복사
6. **Supabase로 돌아오기:**
   - `Authentication > Providers` 메뉴에서 `Kakao` 클릭, 활성화 ON
   - `REST API 키`를 `Client ID`란에, `Client Secret`을 `Secret`란에 붙여넣고 **[Save]**

---

## 🔷 4단계: 페이스북(Facebook) 로그인 설정
> ※ 필리핀 및 동남아 현지 타겟 고객을 위한 핵심 기능입니다.

1. **메타 디벨로퍼스 이동:** [Meta for Developers](https://developers.facebook.com/)
2. **[내 앱] > [앱 만들기]** (유형: `소비자` 또는 `비즈니스` 선택)
3. 앱 대시보드로 이동 후 **[제품 추가] > [Facebook 로그인]** 부분의 **[설정]** 클릭
4. **설정:**
   - 웹(Web) 선택, 홈페이지 URL(`https://barbershop-ui.pages.dev`) 입력
   - 좌측 메뉴 **[Facebook 로그인] > [설정]**으로 이동
   - **유효한 OAuth 리디렉션 URI** 란에 **Supabase 공통 콜백 URL** 붙여넣기 후 저장
5. **앱 정보 확인:**
   - 좌측 메뉴 **[설정] > [기본 설정]** 이동
   - 개인정보처리방침 URL 등 필수값 채우기 (홈페이지 URL 임시 입력 무방)
   - 이곳에 표시된 **[앱 ID]**와 **[앱 비밀코드(Secret)]** 복사
6. **Supabase로 돌아오기:**
   - `Authentication > Providers` 메뉴에서 `Facebook` 클릭, 활성화 ON
   - 앱 ID와 Secret을 붙여넣고 **[Save]**

---

## ✅ 5단계: 최종 테스트
세 가지 플랫폼의 키가 모두 Supabase에 안전하게 저장되었다면, 설정은 모두 끝났습니다! 🎉

1. 스마트폰이나 PC에서 `https://barbershop-ui.pages.dev` 접속 (또는 PWA 아이콘 터치)
2. 하단 탭 4번째 메뉴(유저 모양 아이콘) 터치하여 로그인 모달 띄우기
3. 구글, 페이스북, 카카오 버튼을 각각 눌러 실제로 로그인/가입이 완료되는지 3초 안에 확인!

> 로그인이 성공하면 자동으로 DB 회원 정보가 연동되며, 추후 예약 기능 활성화 시 이메일 재입력 없이 카카오톡 프로필만으로 모든 절차가 통과됩니다.
