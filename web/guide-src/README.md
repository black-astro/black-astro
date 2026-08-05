# 학습 가이드 소스 (Python · Java · JS/TS · Database · Web Server)

`public/*-web/index.html` 다섯 개의 **원본**입니다.
편집은 여기서 하고, 빌드하면 조각들이 합쳐져 각각 단일 HTML로 나갑니다.

> ⚠️ `public/python-web/` · `public/java-web/` · `public/js-ts-web/` ·
> `public/db-web/` · `public/server-web/` 의 index.html 을
> 직접 고치지 마세요. 다음 빌드에서 덮어써집니다.

| 가이드 | 소스 | 배포 경로 | 규모 |
|---|---|---|---|
| 🐍 Python | `guide-src/python/` | `/python-web/` | 14탭 · 207섹션 |
| ☕ Java | `guide-src/java/` | `/java-web/` | 11탭 · 166섹션 |
| 🟨 JS · TS | `guide-src/js-ts/` | `/js-ts-web/` | 11탭 · 178섹션 |
| 🗄️ Database | `guide-src/db/` | `/db-web/` | 10탭 · 154섹션 |
| 🌐 Web Server | `guide-src/server/` | `/server-web/` | 11탭 · 152섹션 |

다섯 가이드는 **CSS 5개(01~05)를 공유**합니다(테마 동일).
각 폴더의 `css/06-*.css` 만 그 가이드 전용입니다.
`build.mjs` 상단의 `GUIDES` 배열에 항목을 추가하면 가이드를 더 늘릴 수 있습니다.

## 왜 조각으로 두고 결과물은 한 파일인가

가이드는 **단일 HTML일 때가 가장 빠릅니다.** 요청 1번, 프레임워크 부팅 없음,
탭 전체를 넘나드는 통합 검색(`Ctrl+K`)이 그냥 됩니다.
문제는 사용자 쪽이 아니라 **편집**이었습니다 — 한 파일 2만 줄은 IDE·git diff·AI 수정 모두 버겁습니다.

그래서 **소스만 쪼개고 결과물은 그대로** 두는 방식을 씁니다.
빌더는 문자열을 잇기만 하고 가공은 일절 하지 않으므로, 결과물이 예상과 달라질 여지가 없습니다.

## 명령어

| 명령 | 하는 일 |
|---|---|
| `npm run build:guide` | 조각 → 각 `index.html` 생성 (다섯 가이드 모두) |
| `npm run build:guide -- java` | 특정 가이드만 (`python` · `java` · `js-ts` · `db` · `server`) |
| `npm run dev:guide` | 조각이 바뀌면 자동 재빌드 (작업 중 켜두세요) |
| `npm run check:guide` | 결과물이 조각과 일치하는지 검사만 (커밋 전 확인용) |
| `npm run verify:guide` | 빌드 + **정합성 점검** — 사이드바 ↔ 섹션 · 탭 ↔ pane · SEC_LV/EZ/CAP 커버리지 |
| `npm run build` | `prebuild` 훅으로 가이드 빌드가 **자동 선행**된 뒤 사이트 빌드 |

## 구조

빌드 순서는 각 가이드의 `parts.json` 에 적힌 배열 그대로입니다.
다섯 가이드가 같은 뼈대를 씁니다. 조각을 추가·삭제하면
**`parts.json` 도 함께 고쳐야 합니다** (누락·고아 파일은 빌드가 에러로 잡아 줍니다).

```
guide-src/
  build.mjs            빌더 (의존성 없음 · 세 가이드를 모두 처리)
  README.md            이 문서

  <가이드>/            python · java · js-ts · db · server
    parts.json         조각 순서 = 최종 파일의 순서
    parts/
      00-head.html         doctype · <head> · <style> 여는 태그
      css/                 스타일 (01~05 는 세 가이드 공통)
        01-tokens-base-layout.css    디자인 토큰 · 기본 · 레이아웃
        02-typography-components.css 히어로 · 섹션 · 카드 · 코드 · 표 · 컨트롤
        03-demo-stage.css            데모 스테이지 · 탭별 전용 위젯
        04-panels-beginner.css       옵션 패널 · 초보자 편의 · 리빌 · 푸터
        05-responsive.css            반응형 · 도구상자 · 터치 대응
        06-*.css                     ★ 그 가이드 전용 (계층도 · 비교표 · 배지)
      10-body-open.html    </style> ~ <body> 시작
      11-sidebar.html      좌측 내비게이션 — 주제 탭(그룹별) + 탭별 목차
                           ★ 검색 색인의 원천 · 탭 그룹은 05-nav.js 가 접어 준다
      12-tabbar.html       상단 주제 탭 · 환영 배너
      panes/               탭 본문 — 여기가 실제 콘텐츠
      90-footer.html       푸터 · <script> 여는 태그
      js/                  스크립트
        00-core.js               공통 유틸 · 검색(TAB_KW/SEC_KW) · 하이라이터
        05-nav.js                사이드바 주제 탭 그룹 접기 · 목차 난이도 색 (공통)
        20-tab-switch.js         탭 전환 · SEC_LV(난이도) · EZ(쉽게 말하면)
        90-demos.js              탭별 데모 (도구 찾기 필터 등)
        99-init.js               최초 실행 (항상 마지막)
      99-tail.html         </script> · </body>
```

Python 가이드만 데모 스크립트가 많아 `js/` 가 13개로 더 잘게 쪼개져 있습니다
(`10-pandas-demos.js`, `30-numpy.js`, `80-algo.js` 등).

### 가이드별 탭 구성

| 가이드 | 탭 |
|---|---|
| 🐍 Python | Python 기본 · uv · Pandas · NumPy · 이미지 · 윈도우 매크로 · PySide6 · 도구상자 · 알고리즘 · DB 연동 · **웹 · API** · **테스트** · **대규모 트래픽** · **전문가** |
| ☕ Java | Java 기초 · 고급/동시성 · Spring Boot · WebFlux · 데이터/JPA · Security · Gateway · 실전 도구 · JavaFX · **대규모 트래픽** · **전문가** |
| 🟨 JS · TS | JavaScript · TypeScript · Node.js · Express · NestJS · Electron · React Native · **네이티브 · 미디어** · **대규모 트래픽** · **전문가** · 실전 도구 |
| 🗄️ Database | 시작·설치 · SQL 기초 · SQL 전문가 · Oracle · PostgreSQL · MySQL/MariaDB · SQLite3 · 설계·튜닝 · **전문가(내부)** · 앱 연동 |
| 🌐 Web Server | 시작·개념 · Nginx · Apache · Tomcat · Caddy · HTTPS·인증서 · **로드밸런싱** · 언어별 연동 · 성능·튜닝 · 보안·운영 · **전문가(내부)** |

언어 가이드 세 개는 마지막 두 탭이 **대규모 트래픽 + 전문가**입니다.
전문가 탭은 각 언어의 런타임 내부(CPython / JVM / V8)와
메모리·프로파일링·보안·아키텍처를 같은 뼈대로 다룹니다.

DB·웹서버 가이드는 **언어에 종속되지 않는 주제**를 다루므로
언어 가이드에서 상호 링크로 이어집니다.

## 자주 하는 작업

**섹션 내용 고치기** → `<가이드>/parts/panes/*.html` 에서 해당 섹션을 찾아 수정.

**섹션 추가하기** → 4곳을 같이 손봐야 화면·검색·요약이 모두 맞습니다.
1. `parts/panes/<탭>.html` — `<section class="sec" id="k16">` 본문
2. `parts/11-sidebar.html` — 해당 탭 `.navset` 에 `<a href="#k16">` 링크
   (**검색 색인이 이 링크에서 만들어집니다** — 빠뜨리면 검색에 안 잡힙니다)
3. `parts/js/20-tab-switch.js` — `SEC_LV` 에 난이도(`b` 기초 / `i` 중급 / `a` 고급)
4. `parts/js/20-tab-switch.js` — `EZ` 에 「쉽게 말하면」 한 줄 요약
5. `parts/js/20-tab-switch.js` — `CAP` 에 「실전 도달점」(`s`/`p`/`e` + 한 문장)

넣고 나서 `npm run verify:guide` 를 돌리면 위 다섯 곳 중 빠뜨린 것을 짚어 줍니다.

검색어를 보강하려면 `parts/js/00-core.js` 의 `SEC_KW` 에 한글 키워드를 추가하세요.

**탭 추가하기** → 위 4곳에 더해:
- `parts/12-tabbar.html` — 탭 버튼 (단축키 `<span class="k">`)
- `parts/11-sidebar.html` — `.navtab` 버튼 + `.navset` 블록
- `parts/js/20-tab-switch.js` — `TAB_LABEL`, `TAB_ORDER`
- `parts/js/00-core.js` — `TAB_KW` (탭 전체 검색 키워드)
- `parts/panes/` 에 pane 파일 추가 후 **`parts.json` 에 등록**

**데모(인터랙션) 추가하기** → `parts/js/90-demos.js`(python 은 `90-extra-demos.js`)에
함수를 넣고, 최초 실행이 필요하면 `TAB_INIT.<탭키>` 에 등록하세요.

**빌드 후 검증** (커밋 전에 한 번씩 돌려 보세요)
```bash
npm run check:guide       # 결과물이 조각과 일치하는지
```
사이드바 링크 ↔ 섹션 id 일치, `SEC_LV`/`EZ` 커버리지, 태그 균형은
빌드 결과물(`public/*-web/index.html`)을 대상으로 확인하는 것이 가장 확실합니다.

## 다섯 가이드의 관계

- 각 가이드의 **사이드바·탭바에서 서로를 오갈 수 있습니다**
- 포트폴리오 진입점(헤더 · 홈 히어로 · 홈 카드 · 푸터)은
  `src/router/index.ts` 의 `guides` 배열 **한 곳**에서만 정의합니다
  → 가이드를 추가하면 그 배열에도 항목을 넣어야 사이트에 노출됩니다
- **역할 분담**
  - 언어 가이드(🐍 ☕ 🟨) — 그 언어로 코드를 쓰는 법
  - 🗄️ Database — SQL 문법 · DB별 방언 · 설치 · 튜닝 · 내부 구조 (언어 무관)
  - 🌐 Web Server — 배포 · 프록시 · HTTPS · 운영 (언어 무관)
  - 파이썬 가이드의 `DB 연동` · `웹 · API` 탭은 **파이썬 관점**만 다루고
    나머지는 위 두 가이드로 링크합니다
- **대규모 트래픽** 탭은 언어 가이드 세 개에 있지만 관점이 다릅니다
  - Java — 스레드 풀 · JVM · 분산 락(Redisson) · Kafka
  - JS · TS — 이벤트 루프 · 싱글 스레드 · BullMQ · 무상태 확장
  - Python — GIL · 비동기 함정 · Celery · 멀티프로세싱
- **전문가** 탭도 마찬가지로 같은 주제를 언어별 관점으로 다룹니다
  - Java(🔬) — 바이트코드/JIT · JMM · CAS · GC 내부 · JFR/힙덤프 · 역직렬화 보안
  - JS · TS(🧬) — V8 히든 클래스 · 마이크로태스크 · Proxy · WASM · 번들 최적화
  - Python(🧬) — CPython 바이트코드 · 참조 카운팅 · 디스크립터 · 메타클래스 · GIL 내부
  - 공통 — 메모리 누수 추적 · 프로파일링 · 함수형 · 디자인 패턴 · 공급망 보안 · 아키텍처

## 탭·목차를 늘릴 때의 화면 규칙

탭이 10개를 넘기면서 "고르기 어려움"이 먼저 온다는 것을 확인하고 다음 규칙을 뒀습니다.
**접는 것은 탭이고, 목차는 접지 않습니다** — 목차를 접으면 훑어보기가 안 됩니다.

- **주제 탭은 그룹으로 묶고, 열려 있는 그룹은 항상 하나**입니다
  (`js/05-nav.js`). 탭을 고르면 나머지 그룹이 접히면서
  **목차가 바로 위로 올라옵니다.** 마지막에 연 그룹은 가이드별로 `localStorage` 에 남습니다
- 같은 그룹 제목을 상단 드롭다운(`12-tabbar.html` 의 `.tabs .tgrp`)에도 씁니다
- **사이드바 탭 라벨이 길거나 반 칸만 남으면 한 줄을 통째로** 씁니다(`.wide`) —
  잘려서 `대규모 트래..` 가 되거나 옆이 빈 채로 남지 않게 (한글 2칸·영문 1칸으로 세어 12칸 초과면 `wide`,
  2열을 채우고 짝이 없는 버튼도 `wide`)
- **GUI · 코딩테스트처럼 곁가지 주제는 그룹 맨 아래**로, 다운로드·다른 가이드는 `더 보기` 그룹으로
- **목차에는 그룹 제목을 넣지 않습니다** — 01 부터 번호 순서대로 이어져야 흐름이 보입니다
- **번호 색이 난이도**입니다(`SEC_LV`: 초록 기초 · 파랑 중급 · 보라 고급).
  초보자는 초록만 따라가고 경력자는 보라만 집어 읽습니다. 범례는 `05-nav.js` 가 자동으로 답니다
- 단축키 `1`~`0` 은 `TAB_ORDER` 순서입니다. **탭 순서를 바꾸면 탭바의 `<span class="k">` 숫자도 함께** 고쳐야 하고,
  `npm run verify:guide` 가 둘의 불일치를 잡아 줍니다

## 그림(다이어그램)

글로 열 줄 쓸 것이 그림 한 장이면 끝나는 자리가 있습니다(리버스 터널의 연결 방향, 프로세스 격리 구조 등).
그런 곳에는 **인라인 SVG**를 씁니다 — 외부 이미지가 없으니 단일 HTML 원칙이 유지됩니다.

```html
<div class="diag rv">
  <svg viewBox="0 0 660 160" role="img" aria-label="무엇을 보여 주는 그림인지 한 문장">
    <rect class="bx" .../>              <!-- 상자 -->
    <path class="ln" .../>              <!-- 고정선 -->
    <path class="fl" .../>              <!-- 흐르는 선 (점선이 움직인다) -->
    <circle class="pk" r="3.5">         <!-- 흐름 위를 도는 점 -->
      <animateMotion dur="2s" repeatCount="indefinite" path="..."/></circle>
  </svg>
  <div class="cap">그림이 말하려는 한 문장</div>
</div>
```

- 스타일은 각 가이드의 `css/06-*.css` 맨 아래 **`개념 그림` 블록**에 있습니다(다섯 가이드 동일)
- `aria-label` 은 **필수** — 그림을 못 보는 사용자에게 이 문장이 그림입니다
- `prefers-reduced-motion` 에서는 움직임이 꺼지도록 이미 처리돼 있습니다
- **텍스트가 `viewBox` 밖으로 나가지 않게** 하세요(아래쪽 라벨은 높이에 여유를 두고 배치)
