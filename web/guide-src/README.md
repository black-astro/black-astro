# 학습 가이드 소스 (Python · Java · JS/TS · C#/Unity · C++ · Rust · Database · Web Server)

`public/*-web/index.html` 여덟 개의 **원본**입니다.
편집은 여기서 하고, 빌드하면 조각들이 합쳐져 각각 단일 HTML로 나갑니다.

> ⚠️ `public/*-web/index.html` 을 직접 고치지 마세요. 다음 빌드에서 덮어써집니다.

| 가이드 | 소스 | 배포 경로 | 규모 |
|---|---|---|---|
| 🐍 Python | `guide-src/python/` | `/python-web/` | 14탭 · 207섹션 |
| ☕ Java | `guide-src/java/` | `/java-web/` | 11탭 · 166섹션 |
| 🟨 JS · TS | `guide-src/js-ts/` | `/js-ts-web/` | 11탭 · 178섹션 |
| 🟣 C# · Unity | `guide-src/csharp/` | `/csharp-web/` | 10탭 · 120섹션 |
| 🔵 C++ | `guide-src/cpp/` | `/cpp-web/` | 8탭 · 88섹션 |
| 🦀 Rust | `guide-src/rust/` | `/rust-web/` | 8탭 · 88섹션 |
| 🗄️ Database | `guide-src/db/` | `/db-web/` | 10탭 · 154섹션 |
| 🌐 Web Server | `guide-src/server/` | `/server-web/` | 11탭 · 152섹션 |

여덟 가이드는 **뼈대 CSS 5개와 사이드바 스크립트를 공유**합니다(테마 동일).
공유 조각은 `guide-src/shared/` 한 곳에만 있습니다 — **한 번 고치면 여덟 가이드에 함께 반영됩니다.**
예전에는 가이드마다 복사본을 두고 `cp` 로 퍼뜨렸는데, 한두 곳이 빠져 서로 어긋나는 일이 반복됐습니다.

## 🔵 C++ · 🦀 Rust 가이드의 4층 구조

두 가이드는 **한 섹션 안에 난이도 층을 쌓습니다**. 숨김 필터는 없고,
스크롤만 내리면 전문가 층까지 그대로 보입니다.

| 층 | h3 형태 | 배지 | `data-lv` |
|---|---|---|---|
| 기초 | (섹션 본문 카드) | JS 가 자동 주입 | — |
| 중급 | `이렇게도 쓸 수 있다 — …` | `<span class="lvl m">🟡 중급</span>` | `i` |
| 실무 | `실무에선 이렇게 — …` | `<span class="lvl h">🔴 실무</span>` | `a` |
| 전문가 | `한 단계 더 — …` | `<span class="lvl x">🧬 전문가</span>` | `x` |

두 가이드는 같은 다섯 원칙으로 수렴합니다 —
① 경계를 넘는 횟수를 데이터 크기와 분리 ② 좁고 안정된 경계(C ABI·abi3·N-API)
③ 측정하고 결정 ④ 되돌릴 수 있게(폴백 + parity 테스트) ⑤ 안 쓰는 판단도 실력.
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
| `npm run build:guide` | 조각 → 각 `index.html` 생성 (여덟 가이드 모두) |
| `npm run build:guide -- java` | 특정 가이드만 (`python` · `java` · `js-ts` · `csharp` · `cpp` · `rust` · `db` · `server`) |
| `npm run dev:guide` | 조각이 바뀌면 자동 재빌드 (작업 중 켜두세요) |
| `npm run check:guide` | 결과물이 조각과 일치하는지 검사만 (커밋 전 확인용) |
| `npm run verify:guide` | 빌드 + **정합성 점검** — 사이드바 ↔ 섹션 · 탭 ↔ pane · SEC_LV/EZ/CAP 커버리지 |
| `npm run build` | `prebuild` 훅으로 가이드 빌드가 **자동 선행**된 뒤 사이트 빌드 |

## 구조

빌드 순서는 각 가이드의 `parts.json` 에 적힌 배열 그대로입니다.
여덟 가이드가 같은 뼈대를 씁니다. 조각을 추가·삭제하면
**`parts.json` 도 함께 고쳐야 합니다** (누락·고아 파일은 빌드가 에러로 잡아 줍니다).

```
guide-src/
  build.mjs            빌더 (의존성 없음 · 여덟 가이드를 모두 처리)
  verify.mjs           결과물 정합성 · 회귀 점검
  README.md            이 문서

  shared/              ★ 여덟 가이드가 글자 하나까지 같이 쓰는 조각
    css/                 여기를 고치면 여덟 가이드가 함께 바뀝니다
      01-tokens-base-layout.css    디자인 토큰 · 기본 · 레이아웃
      02-typography-components.css 히어로 · 섹션 · 카드 · 코드 · 표 · 컨트롤
      03-demo-stage.css            데모 스테이지 · 탭별 전용 위젯
      04-panels-beginner.css       옵션 패널 · 초보자 편의 · 리빌 · 푸터
      05-responsive.css            반응형 · 도구상자 · 터치 대응
    js/
      05-nav.js          사이드바 그룹 ↔ 헤더 탭 줄 · 목차 난이도 색 · 탭 ↔ 내용 연결

  <가이드>/            python · java · js-ts · csharp · cpp · rust · db · server
    parts.json         조각 순서 = 최종 파일의 순서
                       ("shared/…" 로 시작하면 공용 폴더에서 읽습니다)
    parts/
      00-head.html         doctype · <head> · <style> 여는 태그
      css/
        06-*.css                     ★ 그 가이드 전용 (계층도 · 비교표 · 배지)
      10-body-open.html    </style> ~ <body> 시작
      11-sidebar.html      좌측 내비게이션 — 주제 '그룹' + 탭별 목차
                           ★ 검색 색인의 원천 (탭 자체는 헤더에서 고른다)
      12-tabbar.html       헤더 — 그룹별 탭 줄(.tabrow) + 모바일 드롭다운(.tabs) · 환영 배너
      panes/               탭 본문 — 여기가 실제 콘텐츠
      90-footer.html       푸터 · <script> 여는 태그
      js/                  스크립트
        00-core.js               공통 유틸 · 검색(TAB_KW/SEC_KW) · 하이라이터 · 섹션 이동
        20-tab-switch.js         탭 전환 · SEC_LV(난이도) · EZ(쉽게 말하면)
        90-demos.js              탭별 데모 (도구 찾기 필터 등)
        99-init.js               최초 실행 (항상 마지막)
      99-tail.html         </script> · </body>
```

공용 조각을 고칠 때는 **여덟 가이드가 모두 바뀐다는 점**을 염두에 두세요.
`npm run verify:guide` 가 여덟 개를 한꺼번에 점검하므로 어긋나면 바로 드러납니다.

Python 가이드만 데모 스크립트가 많아 `js/` 가 13개로 더 잘게 쪼개져 있습니다
(`10-pandas-demos.js`, `30-numpy.js`, `80-algo.js` 등).

### 가이드별 탭 구성

| 가이드 | 탭 |
|---|---|
| 🐍 Python | Python 기본 · uv · Pandas · NumPy · 이미지 · 윈도우 매크로 · PySide6 · 도구상자 · 알고리즘 · DB 연동 · **웹 · API** · **테스트** · **대규모 트래픽** · **전문가** |
| ☕ Java | Java 기초 · 고급/동시성 · Spring Boot · WebFlux · 데이터/JPA · Security · Gateway · 실전 도구 · JavaFX · **대규모 트래픽** · **전문가** |
| 🟨 JS · TS | JavaScript · TypeScript · Node.js · Express · NestJS · Electron · React Native · **네이티브 · 미디어** · **대규모 트래픽** · **전문가** · 실전 도구 |
| 🗄️ Database | 시작·설치 · SQL 기초 · SQL 전문가 · Oracle · PostgreSQL · MySQL/MariaDB · SQLite3 · 설계·튜닝 · **전문가(내부)** · 앱 연동 |
| 🟣 C# · Unity | C# 기초 · C# 고급 · **Unity 기초** · **Unity 실전** · **게임 서버** · ASP.NET Core · 대규모 트래픽 · 데스크탑 · 실전 도구 · **전문가(CLR)** |
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

**탭 추가하기** → 위 5곳에 더해:
- `parts/12-tabbar.html` — **두 곳**: 헤더 줄(`.tabrow`, `data-g` 로 그룹 지정)과
  모바일 드롭다운(`.tabs`). 단축키는 `<span class="k">`
- `parts/11-sidebar.html` — `.navset` 블록 (그룹을 새로 만들 때만 `.navgrp` 에 버튼 추가)
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

## 여덟 가이드의 관계

- 각 가이드의 **사이드바·탭바에서 서로를 오갈 수 있습니다**
- 포트폴리오 진입점(헤더 · 홈 히어로 · 홈 카드 · 푸터)은
  `src/router/index.ts` 의 `guides` 배열 **한 곳**에서만 정의합니다
  → 가이드를 추가하면 그 배열에도 항목을 넣어야 사이트에 노출됩니다
- **역할 분담**
  - 언어 가이드(🐍 ☕ 🟨 🟣) — 그 언어로 코드를 쓰는 법
    (🟣 C# 은 여기에 **게임 엔진 · 게임 서버 · 데스크탑**까지 한 언어로 이어 붙인 형태입니다)
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

## 화면 규칙 — 사이드바는 '그룹', 헤더는 '그 그룹의 탭'

탭이 열몇 개가 되자 두 가지가 동시에 문제였습니다.
사이드바에 탭을 다 세우면 **목차가 화면 밖으로 밀리고**,
접어 두면 **무엇이 있는지 판단이 안 됩니다.** 그래서 역할을 나눴습니다.

- **사이드바 = 주제 그룹만** (`.navgrp`) — 언어 · 데이터 · 웹 · 심화 …
  항상 전부 보이고, 버튼 오른쪽의 작은 아이콘 줄이 그 그룹에 무엇이 들었는지 미리 보여 줍니다
- **헤더 = 지금 그룹의 탭만** (`.tabrow`) — 그룹을 고르면 헤더 줄이 통째로 바뀌고
  그 그룹의 첫 탭으로 이동합니다. 단축키·검색으로 건너뛰어도 그 탭의 그룹으로 헤더가 맞춰집니다
- **그룹에 마우스를 올리면 그 안의 탭이 옆으로 펼쳐집니다**(`.ngpop`) —
  "그룹 클릭 → 첫 탭 → 헤더에서 다시 고르기"를 한 번으로 줄입니다.
  사이드바가 세로 스크롤 영역이라 팝오버는 `body` 에 붙이고 위치만 계산하며,
  터치 기기(`hover:none`)에서는 만들지 않습니다
- **목차는 접지 않습니다.** 그룹 제목도 넣지 않습니다 —
  01 부터 번호 순서대로 이어져야 흐름이 보입니다
- **번호 색이 난이도**입니다(`SEC_LV`: 초록 기초 · 파랑 중급 · 보라 고급).
  초보자는 초록만 따라가고 경력자는 보라만 집어 읽습니다. 범례는 `05-nav.js` 가 자동으로 답니다
- **≤1080px(사이드바가 숨는 폭)에서는 헤더 줄 대신 드롭다운**(`.tabcur`/`.tabs`)이 뜹니다.
  드롭다운도 같은 2단입니다 — 위의 **그룹 칩**(`.tabsg`)을 누르면 아래 **탭 목록**(`.tabsl`)이
  2열로 바뀌고, **시트는 닫히지 않습니다.** 탭을 눌러야 이동하며 닫힙니다
  (그룹만 누르고 닫히면 탭을 고를 방법이 없습니다)
- 단축키 `1`~`0` 은 `TAB_ORDER` 순서입니다. **탭 순서를 바꾸면 헤더·드롭다운의 `<span class="k">` 숫자도 함께** 고쳐야 하고,
  `npm run verify:guide` 가 둘의 불일치를 잡아 줍니다

## 여백은 CSS 가 잡습니다 — 인라인 style 로 맞추지 마세요

카드·그리드 사이 여백은 `02-typography-components.css` 가 책임집니다.

- `.card > :first-child{margin-top:0}` · `.card > :last-child{margin-bottom:0}` —
  카드 안쪽 여백은 `.card` 의 `padding` 하나로 결정됩니다.
  조각에 `style="margin-top:0"` 을 붙이지 않아도 위아래가 맞습니다
- `section.sec > * + .grid2 / .grid3 / .grid-a / .card / .tw{margin-top:22px}` —
  `.grid2` 를 연달아 쓰면 카드가 맞붙던 문제를 막습니다.
  `sec-head`·`h3.sub`·`h4.mini` 바로 뒤는 각자의 margin 을 쓰므로 예외입니다
- `pre.code + .out{margin-top:-6px}` — 실행 결과 상자는 **코드 바로 밑일 때만** 붙습니다

새 섹션을 넣은 뒤 눈으로 보기 전에, 브라우저 콘솔에서 인접 블록 간격을 한 번 재 보면 빠릅니다
(`.rv` 리빌 애니메이션 때문에 측정 전 `document.body.classList.add('noanim')` 를 켜야 값이 정확합니다).

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

- 스타일은 각 가이드의 `css/06-*.css` 맨 아래 **`개념 그림` 블록**에 있습니다(여덟 가이드 동일)
- `aria-label` 은 **필수** — 그림을 못 보는 사용자에게 이 문장이 그림입니다
- `prefers-reduced-motion` 에서는 움직임이 꺼지도록 이미 처리돼 있습니다
- **텍스트가 `viewBox` 밖으로 나가지 않게** 하세요(아래쪽 라벨은 높이에 여유를 두고 배치)
