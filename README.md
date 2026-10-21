# Dango UX/UI Design Process

반려견과 보호자를 위한 맞춤형 산책 서비스 **댕고(Dango)**의 UX/UI 디자인 프로세스 포트폴리오입니다. 리서치부터 브랜드, 디자인 시스템, 앱 화면과 인터랙션까지 30개 섹션으로 구성했습니다.

이 저장소는 메인 포트폴리오와 별도로 관리하는 정적 웹사이트입니다. 원본 로컬 체크포인트 `5cae5bf`를 기준으로 실행에 필요한 파일을 선별했습니다.

## 주요 섹션

- Cover / Overview / Mission
- User Research / Survey Findings / Interview / Pain Point / Positioning
- Branding / Character / Logo / Design System / Color / Typography / Components
- Information Architecture / Wireframe
- Home / Onboarding / Profile Setup
- Tailored Walk Planning / Immersive Walk Track
- Walk Log Creation / Walk Summary / Personalized Walk Archive
- Community / Convenience Features / Screens Overview / Thank you

## 주요 기능

- 스크롤 진입 모션, 그래프 및 숫자 카운트업, 선 드로잉
- Overview 캡슐 낙하와 제한된 영역 내 포인터 반응
- 인터뷰 카드와 캐릭터의 끊김 없는 순환
- 로고 가이드 라인 누적 드로잉, 발자국 순차 등장
- 산책 배경 경로의 스크롤 연동, 서로 다른 캐릭터 동작, Ending 등장
- 커뮤니티 작성·저장·상세·필터·좋아요·댓글 초안
- Quick Actions 6개: 카메라, 앨범, 위치, 프로필, 음성, 일정
- 만족도 선택·저장, 기록 보관함의 프로필·리듬 표시와 화면 이동
- 키보드 접근과 `prefers-reduced-motion` 지원

커뮤니티와 프로필·일정·만족도 저장은 현재 브라우저의 `localStorage`를 사용합니다. 서버 계정, 공동 게시판, 외부 메시지 전송이나 기기 간 동기화 기능은 없습니다. 저장 키는 `dango-process:v1:*`로 분리해 기존 댕고 데모와 충돌하지 않도록 했습니다. 이전 사이트의 저장 데이터는 자동으로 가져오지 않습니다.

카메라·위치·음성 기능은 브라우저 및 장치 지원과 사용자 권한에 따라 동작합니다. HTTPS 또는 신뢰할 수 있는 localhost에서 확인하세요.

## 실행 방법

이 폴더에서 정적 HTTP 서버를 실행합니다. 별도 빌드나 npm 설치는 필요하지 않습니다.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:8000/`를 엽니다. 파일을 직접 더블클릭하는 `file://` 방식은 SVG fetch와 브라우저 저장 기능에 적합하지 않습니다.

## 사용 기술

HTML, CSS, JavaScript, SVG, Web Animations API, requestAnimationFrame, IntersectionObserver, localStorage 및 로컬 Matter.js 0.20.0을 사용합니다. 이미지·웹폰트·라이브러리는 저장소의 `assets/`에서 읽습니다.

## 폴더 구성

```text
index.html                  포트폴리오 페이지
*.css / *.js                디자인, 반응형, 모션 및 데모 기능
assets/*.svg / *.webp       실행에 필요한 이미지와 아이콘
assets/fonts/               웹폰트와 폰트 라이선스
assets/vendor/              Matter.js와 MIT 라이선스
THIRD_PARTY_NOTICES.md       외부 구성요소 출처 및 라이선스 안내
.nojekyll                   정적 파일 게시용 설정
```

## GitHub Pages 예정 주소

https://eeljun00.github.io/Dango_Process/

사이트 파일은 저장소 루트에 있습니다. 실제 게시에는 별도의 GitHub Pages 설정이 필요하며, 이 로컬 준비 작업만으로 배포되지는 않습니다. 메인 포트폴리오: https://eeljun00.github.io/

## 크레딧 및 공개 범위

화면의 원래 팀 크레딧을 유지합니다: 이준화, 이재하, 황예빈. 팀 작업 기간은 화면에 기재된 2025.11–2026.02를 따릅니다.

프로젝트 디자인·이미지 전체에 일괄적인 오픈소스 라이선스를 부여하지 않습니다. 사진, 지도, 기기 목업, 아이콘과 팀 디자인의 공개·재배포 권한은 원출처와 팀 합의에 따라 별도로 확인해야 합니다. 폰트와 외부 라이브러리의 개별 조건은 `THIRD_PARTY_NOTICES.md`와 동봉한 원문을 확인하세요.
