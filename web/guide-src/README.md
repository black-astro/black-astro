# 학습 가이드 소스 (Python · Java)

`public/python-web/index.html`(약 20,000줄)과 `public/java-web/index.html`(약 13,700줄)의 **원본**입니다.
편집은 여기서 하고, 빌드하면 조각들이 합쳐져 각각 단일 HTML로 나갑니다.

> ⚠️ `public/python-web/` · `public/java-web/` 의 index.html 을 직접 고치지 마세요.
> 다음 빌드에서 덮어써집니다.

| 가이드 | 소스 | 배포 경로 |
|---|---|---|
| 🐍 Python | `guide-src/python/` | `/python-web/` |
| ☕ Java | `guide-src/java/` | `/java-web/` |

두 가이드는 **CSS 5개를 공유**합니다(테마 동일). Java 쪽 `css/06-java.css` 만 자바 전용입니다.
`build.mjs` 상단의 `GUIDES` 배열에 항목을 추가하면 가이드를 더 늘릴 수 있습니다.

## 왜 조각으로 두고 결과물은 한 파일인가

가이드는 **단일 HTML일 때가 가장 빠릅니다.** 요청 1번, 프레임워크 부팅 없음,
탭 11개를 넘나드는 통합 검색(`Ctrl+K`)이 그냥 됩니다(전송량 약 291 KB, gzip 기준).
문제는 사용자 쪽이 아니라 **편집**이었습니다 — 한 파일 2만 줄은 IDE·git diff·AI 수정 모두 버겁습니다.

그래서 **소스만 쪼개고 결과물은 그대로** 두는 방식을 씁니다.
빌더는 문자열을 잇기만 하고 가공은 일절 하지 않으므로, 결과물이 예상과 달라질 여지가 없습니다.

## 명령어

| 명령 | 하는 일 |
|---|---|
| `npm run build:guide` | 조각 → 각 `index.html` 생성 (python·java 모두) |
| `npm run build:guide -- java` | 특정 가이드만 |
| `npm run dev:guide` | 조각이 바뀌면 자동 재빌드 (작업 중 켜두세요) |
| `npm run check:guide` | 결과물이 조각과 일치하는지 검사만 (커밋 전 확인용) |
| `npm run build` | `prebuild` 훅으로 가이드 빌드가 **자동 선행**된 뒤 사이트 빌드 |

## 구조

빌드 순서는 각 가이드의 `parts.json` 에 적힌 배열 그대로입니다.
아래는 python 기준이며, java 도 같은 구조입니다(`panes/` 가 9개, `js/` 가 4개). 조각을 추가·삭제하면
**`parts.json` 도 함께 고쳐야 합니다** (누락·고아 파일은 빌드가 에러로 잡아 줍니다).

```
guide-src/
  build.mjs          빌더 (의존성 없음 · 두 가이드를 모두 처리)
  python/
    parts.json       조각 순서 = 최종 파일의 순서
    parts/
    00-head.html         doctype · <head> · <style> 여는 태그
    css/                 스타일 5개로 분할
      01-tokens-base-layout.css    디자인 토큰 · 기본 · 레이아웃
      02-typography-components.css 히어로 · 섹션 · 카드 · 코드 · 표 · 컨트롤
      03-demo-stage.css            데모 스테이지 · 탭별 전용 위젯
      04-panels-beginner.css       옵션 패널 · 초보자 편의 · 리빌 · 푸터
      05-responsive.css            반응형 · 도구상자 · 터치 대응
    10-body-open.html    </style> ~ <body> 시작
    11-sidebar.html      좌측 내비게이션 (탭별 목차)
    12-tabbar.html       상단 주제 탭 · 환영 배너
    panes/               탭 본문 — 여기가 실제 콘텐츠
      01-pandas.html  02-numpy.html  03-python.html  04-uv.html   05-img.html
      06-auto.html    07-qt.html     08-toolbox.html 09-algo.html 10-db.html
    90-footer.html       푸터 · <script> 여는 태그
    js/                  스크립트 13개로 분할
      00-core.js               공통 유틸 · 데이터셋 · 스크롤/리빌
      10-pandas-demos.js       [S01]~[S16] 판다스 데모
      20-tab-switch.js         탭 전환 · 검색 · 목차 · 하이라이터
      30-numpy.js  40-python.js  50-uv-img.js  60-auto-qt.js
      70-toolbox-hud-option.js 도구 추천기 · 성능 HUD · 옵션 패널
      80-algo.js  85-qt-gallery.js  86-db.js
      90-extra-demos.js        .str 체험기 · cut/qcut · 기능 색인 · Traceback
      99-init.js               최초 실행 (여기는 항상 마지막)
    99-tail.html         </script> · </body>
```

## 자주 하는 작업

**섹션 내용 고치기** → `parts/panes/*.html` 에서 해당 섹션을 찾아 수정.

**섹션 추가하기** → 4곳을 같이 손봐야 화면·검색·요약이 모두 맞습니다.
1. `parts/panes/<탭>.html` — `<section class="sec" id="s23">` 본문
2. `parts/11-sidebar.html` — 해당 탭 `.navset` 에 `<a href="#s23">` 링크 (검색 색인이 이 링크에서 만들어집니다)
3. `parts/js/20-tab-switch.js` — `SEC_KW` 에 검색 키워드, `SEC_LV` 에 난이도(`b`/`i`/`a`)
4. `parts/js/20-tab-switch.js` — `EZ` 에 「쉽게 말하면」 한 줄 요약

**데모(인터랙션) 추가하기** → `parts/js/90-extra-demos.js` 에 함수를 넣고,
최초 실행이 필요하면 `99-init.js` 또는 해당 탭의 `TAB_INIT` 에 등록.

**조각을 더 잘게 쪼개기** → 파일을 나눈 뒤 `parts.json` 의 해당 자리에 순서대로 넣으면 끝입니다.
(`05-responsive.css`, `panes/03-python.html` 이 상대적으로 큽니다)
