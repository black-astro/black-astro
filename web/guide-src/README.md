# 학습 가이드 소스 (Python · Java · JS/TS)

`public/*-web/index.html` 세 개의 **원본**입니다.
편집은 여기서 하고, 빌드하면 조각들이 합쳐져 각각 단일 HTML로 나갑니다.

> ⚠️ `public/python-web/` · `public/java-web/` · `public/js-ts-web/` 의 index.html 을
> 직접 고치지 마세요. 다음 빌드에서 덮어써집니다.

| 가이드 | 소스 | 배포 경로 | 규모 |
|---|---|---|---|
| 🐍 Python | `guide-src/python/` | `/python-web/` | 11탭 · 161섹션 |
| ☕ Java | `guide-src/java/` | `/java-web/` | 10탭 · 134섹션 |
| 🟨 JS · TS | `guide-src/js-ts/` | `/js-ts-web/` | 10탭 · 146섹션 |

세 가이드는 **CSS 5개(01~05)를 공유**합니다(테마 동일).
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
| `npm run build:guide` | 조각 → 각 `index.html` 생성 (세 가이드 모두) |
| `npm run build:guide -- java` | 특정 가이드만 (`python` · `java` · `js-ts`) |
| `npm run dev:guide` | 조각이 바뀌면 자동 재빌드 (작업 중 켜두세요) |
| `npm run check:guide` | 결과물이 조각과 일치하는지 검사만 (커밋 전 확인용) |
| `npm run build` | `prebuild` 훅으로 가이드 빌드가 **자동 선행**된 뒤 사이트 빌드 |

## 구조

빌드 순서는 각 가이드의 `parts.json` 에 적힌 배열 그대로입니다.
세 가이드가 같은 뼈대를 씁니다. 조각을 추가·삭제하면
**`parts.json` 도 함께 고쳐야 합니다** (누락·고아 파일은 빌드가 에러로 잡아 줍니다).

```
guide-src/
  build.mjs            빌더 (의존성 없음 · 세 가이드를 모두 처리)
  README.md            이 문서

  <가이드>/            python · java · js-ts
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
      11-sidebar.html      좌측 내비게이션 (탭별 목차) ★ 검색 색인의 원천
      12-tabbar.html       상단 주제 탭 · 환영 배너
      panes/               탭 본문 — 여기가 실제 콘텐츠
      90-footer.html       푸터 · <script> 여는 태그
      js/                  스크립트
        00-core.js               공통 유틸 · 검색(TAB_KW/SEC_KW) · 하이라이터
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
| 🐍 Python | Python 기본 · uv · Pandas · NumPy · 이미지 · 윈도우 매크로 · PySide6 · 도구상자 · 알고리즘 · DB · **대규모 트래픽** |
| ☕ Java | Java 기초 · 고급/동시성 · Spring Boot · WebFlux · 데이터/JPA · Security · Gateway · 실전 도구 · JavaFX · **대규모 트래픽** |
| 🟨 JS · TS | JavaScript · TypeScript · Node.js · Express · NestJS · React Native · Electron · **대규모 트래픽** · 실전 도구 · 초고급 |

## 자주 하는 작업

**섹션 내용 고치기** → `<가이드>/parts/panes/*.html` 에서 해당 섹션을 찾아 수정.

**섹션 추가하기** → 4곳을 같이 손봐야 화면·검색·요약이 모두 맞습니다.
1. `parts/panes/<탭>.html` — `<section class="sec" id="k16">` 본문
2. `parts/11-sidebar.html` — 해당 탭 `.navset` 에 `<a href="#k16">` 링크
   (**검색 색인이 이 링크에서 만들어집니다** — 빠뜨리면 검색에 안 잡힙니다)
3. `parts/js/20-tab-switch.js` — `SEC_LV` 에 난이도(`b` 기초 / `i` 중급 / `a` 고급)
4. `parts/js/20-tab-switch.js` — `EZ` 에 「쉽게 말하면」 한 줄 요약

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

## 세 가이드의 관계

- 각 가이드의 **사이드바·탭바에서 서로를 오갈 수 있습니다**
- 포트폴리오 진입점(헤더 · 홈 히어로 · 홈 카드 · 푸터)은
  `src/router/index.ts` 의 `guides` 배열 **한 곳**에서만 정의합니다
  → 가이드를 추가하면 그 배열에도 항목을 넣어야 사이트에 노출됩니다
- **대규모 트래픽** 탭은 세 가이드 모두에 있지만 관점이 다릅니다
  - Java — 스레드 풀 · JVM · 분산 락(Redisson) · Kafka
  - JS · TS — 이벤트 루프 · 싱글 스레드 · BullMQ · 무상태 확장
  - Python — GIL · 비동기 함정 · Celery · 멀티프로세싱
