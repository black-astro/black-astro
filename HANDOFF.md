# 핸드오프 — 언어 가이드 확장 (2026-10-01 11차 갱신 · UX 전면 개편 1차)

## 🆕 11차 — java · python · kotlin · js-ts UX 전면 개편 (완료)

| 가이드 | 탭 | 섹션 | 새 실무 탭 | 박스형 그림 비율 (전 → 후) |
|---|---|---|---|---|
| python | 19→**20** | 292→**305** | 🏭 실무 프로젝트 · 운영 (`prod`, pj01~13) | 탭 대부분 100% → **14~57%** |
| java | 17→**18** | 258→**271** | 🚑 장애 대응 · 운영 (`ops`, op01~13) | 89~100% → **21~56%** |
| kotlin | 14→**15** | 219→**232** | 🧪 테스트 · 로깅 · 운영 (`qa`, qa01~13) | 75~100% → **19~71%** |
| js-ts | 19→**20** | 283→**296** | 🚑 프론트 실무 · 트러블슈팅 (`pf`, pf01~13) | 89~100% → **23~79%** |

### 무엇이 바뀌었나
1. **학습 레이어** `shared/css/07-study.css` + `shared/js/07-study.js` (네 가이드 parts.json 에만 등록)
   - 읽기 열 1120px 로 글·그림·카드 왼쪽 선 통일 · 본문 860px · **한국어 `word-break:keep-all`**
   - 코드 카드 + 설명 카드가 나란하면 코드 쪽 1.35배 (`:has()`)
   - 섹션마다 **읽기 시간 · "다 읽음"** · 끝에 **다음 섹션/다음 탭** 버튼 · 사이드바 **탭 진도 막대** · 다 읽은 탭 점
   - 탭바 **"Aa 읽기"**: 글자 크기 4단(zoom) · 집중 모드 · 진도 초기화(두 번 누르기)
   - **이어 읽기** 알림 (#조각 없이 들어왔을 때만) · 그림 **크게 보기**(라이트박스) · `[` `]` 섹션 이동
   - 화면 밖 `.diag` 애니메이션 정지(CSS `.zz` + SMIL `pauseAnimations`) · 등장 효과 26px→10px
   - 클래스 접두사는 **`lx-`** — `st-` 는 파이썬 알고리즘 시각화(`st-done` 등)가 이미 씀. 바꾸지 마세요.
   - 저장은 localStorage `st:<가이드>` 한 키.
2. **가이드 정체성 색** `shared/css/08-id-<가이드>.css` — 바탕·UI 강조(`--blue*`, `--ac-rgb`)·서명색(`--sig-a/b`)만.
   Java 엠버/앰버 · Python 파랑→노랑 · Kotlin 보라→주황 · JS·TS 노랑+TS 파랑. **다이어그램 의미 색은 그대로.**
3. **다이어그램 개편** — 박스형 그림을 카탈로그 모델(timeline·gantt·bar·line·matrix·tree·memory·decision…)로 다시 그림.
   **같은 섹션에 똑같은 그림이 두 번** 들어간 곳이 네 가이드에 60곳 넘게 있었음(이전 회차 삽입 도구 중복 실행 흔적).
   대부분 두 번째를 다른 모델로 다시 그렸고, 남은 25건은 `dupdiag.mjs --fix` 로 지움.
4. **값 오류 수정** — python 10-db B-tree 리프·블록 수(25만 배→약 2,500배), 09-algo g05 이진 탐색 단계,
   80-algo.js factorial(6)·비교 횟수·"6시간"(→3~8분), 00-core retry 점 간격(2배씩), java t10 빌드 순서 등.
5. **공통 CSS** `06-diag.css` 끝에 조합 우선순위 추가 — `class="tk ok-t"` 가 회색, `class="li s2-l"` 이 청록으로 나오던 버그.
   (전 가이드 공통 · server/csharp 결과물도 CSS 11줄만 바뀜)
6. **도구** — `tools/diagaudit.mjs`(TIP·PK·CTR·ROW·GAP + `--summary` 박스형 %) · `tools/dupdiag.mjs`(중복 그림, `--fix`).
   seq 본보기 참가자 간격 58/68/58 → 62/62/62. 플러그인 `frontend-design`(공식) 프로젝트 범위 설치.

### ⚠ 이번에 겪은 사고 — 다음 세션도 조심
- **중복 제거를 정규식으로 하면 안 됩니다.** `.diag` 블록을 `</div>` 첫 매치에서 끊었더니 안쪽 `.cap` 의 닫힘이라
  바깥 `</div>` 가 남아 **pane 이 일찍 닫혔습니다**(섹션이 pane 밖으로 샘). `verify:guide` 와 `smoke.mjs` 는 **통과**했습니다.
  지금 `dupdiag.mjs` 는 `<div>` 균형으로 끝을 찾습니다. 브라우저 스모크에서 반드시
  `#pane-<탭> section.sec` 개수 == `.navset.on a` 개수, `section.sec` 중 `.pane` 밖 0 을 확인하세요.
- **셸에서 `node -e` 로 JS 를 고칠 때 `\b` `\s` 가 망가집니다** — `\b` 가 백스페이스(0x08)로 파일에 박혔습니다.
  정규식이 들어가는 수정은 Write/Edit 도구나 스크립트 파일로 하세요.

## 🔜 다음 작업 — UX 개편 2차 (나머지 그룹 탭)

대상: **server · db · cs · csharp · cpp · rust** (6개 가이드). 1차와 같은 순서로 하면 됩니다.

### 0. ✅ 해결됨 — 사라진 탭 4개 복구 (커밋 d88047f 계열, 2026-10-01)
커밋 c6a8a38(9/11)의 일괄 그림 삽입 중 cpp `15-jvm` · rust `11-web` 삭제, cs `13-ml` · db `13-olap` 0바이트가 됐고,
CI 빌드가 멈춰 **9/22~10/1 배포가 전부 실패**(사이트가 9/9 버전에 머묾)했다. `c6a8a38^` 내용으로 복구 → 배포 성공 확인.
같은 커밋이 전 가이드에 **중복 그림**을 넣었다 — 1차 네 가이드는 정리했고, 나머지 6개에 **73건** 남음(2단계에서 `dupdiag --fix`).
**교훈:** 배포 후 `gh run list --workflow deploy-portfolio.yml` 로 성공까지 확인할 것. verify 는 로컬 결과물만 본다.

### 1. 학습 레이어 붙이기 (가이드당 5분)
- `shared/css/08-id-<가이드>.css` 를 만든다 — 08-id-java.css 를 복사해 색만. 제안:
  server 청록·네이비 / db 앰버·슬레이트 / cs 보라·잉크 / csharp 보라(#512bd4)·라임 / cpp 파랑(#00599c)·강철 / rust 녹·구리(#ce422b)
- parts.json 에서 `shared/css/06-diag.css` 뒤에 `shared/css/07-study.css`, `shared/css/08-id-<가이드>.css`,
  `js/99-init.js` 앞에 `shared/js/07-study.js`. (네 가이드 parts.json 참고)
- db·cs·server 는 `90-demos.js` 가 커서 클래스 충돌 확인: `grep -rn "lx-" <가이드>/parts` 가 0 이어야 함.

### 2. 다이어그램
```bash
node guide-src/tools/dupdiag.mjs server db cs csharp cpp rust          # 중복 먼저 (있으면 --fix)
node guide-src/tools/diagaudit.mjs guide-src/<가이드>/parts/panes --summary
```
박스형 60% 넘는 탭마다 3~4개를 다른 모델로. 1차에 쓴 에이전트 지침이 그대로 쓸 만합니다
(가이드당 에이전트 1개, python 처럼 탭이 많으면 둘로 — 동시에 5~9개까지 문제없었음).

### 3. 실무 탭 (선택)
1차처럼 가이드마다 "현업 투입" 탭 하나 — 후보: server 🚑 장애 대응 런북 · db 🩺 운영 DBA 체크리스트 ·
csharp 🧪 테스트·배포 · cpp/rust 🐞 디버깅·프로파일링. AUTHORING.md + reg.mjs 절차 그대로.

### 4. 검증 순서 (1차에서 확정)
fixcut → svgcheck → diagaudit → dupdiag → integrity → build → verify → smoke →
**브라우저: 전 탭 switchTab + pane/navset 개수 대조 + 고아 섹션 0 + getBBox OVER/LAP 실측 + 데모 버튼 전부 클릭 오류 0**

### 1차에서 남긴 것
- kotlin 04-boot 박스형 71%(7개), js-ts 08-native 78% · 16-next 79% · 17-edge 73% — 아직 손 안 댄 탭
- `_wip/log-tabs/kotlin/` 로깅 초안(lg01~10)은 qa05·qa06 과 겹침 — 등록하지 말고 정리 대상
- 에이전트가 기억으로 적은 버전 표기(새 실무 탭 4개): datasource-proxy 1.10, Hibernate `log_slow_query`, detekt 1.23.8,
  ruff-pre-commit v0.13.0 등 — 한 번 확인 필요
- 06-auto a01·a09 의 `.lbl` + `font-size` 속성 동시 사용(규칙 위반) · java `90-demos.js` 주석 "(t12)" → 실제 t13
- python 09-algo g13: 지수 시간 naive fib 에 "O(n²) 격자" 미니 시각화를 쓰고 있음 — 지수형 미니 시각화가 없음

---

## (10차까지의) 현재 상태

열 가이드 전부 **설치 → 기초 → 실전** 축을 갖췄고, 2026 기준 기술 스택 공백도 메웠습니다.

| 가이드 | 탭 | 섹션 | 다이어그램 |
|---|---|---|---|
| python | 18 | 280 | 144 |
| **js-ts** | **18** | **271** | **146** |
| **server** | **17** | **225** | **150** |
| java | 16 | 246 | 123 |
| cpp | 16 | 201 | 169 |
| rust | 15 | 174 | 142 |
| **db** | **14** | **204** | **114** |
| kotlin | 14 | 219 | 118 |
| **cs** | **13** | **186** | **133** |
| **csharp** | **12** | **166** | **100** |

**총 시각화 1,439개 · 총 섹션 2,072개.**

### 이번 회차 — 기술 스택 공백 5개 (언급 빈도를 실측해 고름)
| 가이드 | 새 탭 | 섹션 | 그림 | 왜 |
|---|---|---|---|---|
| cs | 🤖 **머신러닝 · 딥러닝 이론** | m01~m13 | 27 | 머신러닝 5회 · 신경망 2회뿐 — CS 기본기의 한 축이 비어 있었습니다 |
| db | 📊 **분석 · 벡터 DB** | v01~v13 | 17 | ClickHouse·DuckDB **0회** · pgvector 9회뿐 |
| csharp | 🔥 **Blazor · Aspire** | b01~b13 | 15 | Blazor 7회 · Aspire 3회 |
| js-ts | 🔥 **Hono · Bun · Deno · 엣지** | g01~g13 | 15 | Hono 2회 — 엣지·서버리스 축 공백 |
| server | 🔭 **관측 · 모니터링** | y01~y13 | 14 | Grafana 3회 — 장애 대응 체계가 흩어져 있었습니다 |

- **cs ML 탭**은 파이썬 가이드(라이브러리 사용법)와 갈라 **원리와 수학**만 다룹니다 —
  경사하강 · 편향/분산 · 역전파 계산 그래프 · 옵티마이저 궤적 · CNN/LSTM · **트랜스포머 어텐션** · PAC/VC.
  선형대수 탭과 겹치는 수학(최소제곱 유도 · 고유값 · 엔트로피 · 베이즈)은 전부 그쪽으로 넘겼습니다.
- **db 분석 탭**은 행/컬럼 저장 원리 · DuckDB · Parquet · ClickHouse MergeTree · 시계열 ·
  **벡터 검색 원리(HNSW/IVFFlat)** · pgvector 인덱스 파라미터 · 하이브리드 검색(RRF) · RAG 스키마 · CDC.

### 그 앞 회차 (요약)
- **cpp** 9→16탭 — 설치 · 데스크톱 앱 · 백엔드 서버 · 게임 서버 · 고성능 · 자바 모듈(JNI) · C# 모듈, C 언어 탭 12→26섹션
- **rust** 9→15탭 — 설치 · Axum · 고성능 서비스 · Tauri · 자바 모듈(UniFFI) · C# 모듈(csbindgen)
- **python** — PySide6 탭에 QML/Qt Quick 12섹션(Controls 2 · Material/FluentWinUI3 · MultiEffect · Material Symbols/Lucide)
- 여덟 가이드에 🧰 **설치 · 환경 세팅** 탭 신설
- **js-ts** ▲ Next.js · **java** 🧵 최신 Java(가상 스레드·Spring AI) · **kotlin** 🚀 Ktor · **server** ☸️ 도커·쿠버네티스
- cpp · rust 소개 문구를 "앱을 만들지 않습니다" → **강점 소개**로 교체

- 전 가이드 `verify:guide` 통과 · svgcheck 0건 · integrity 0건 · smoke 통과 · `vue-tsc -b` 통과

### 2. 기술 스택 — 큰 공백은 다 메웠습니다
남은 것은 우선순위가 낮은 후보뿐입니다. 필요하면 그때 판단하세요.

| 가이드 | 후보 | 현재 상태 |
|---|---|---|
| kotlin | 🎨 Compose Multiplatform 데스크톱 | Composable 43회 · CMP 18회 — Android·KMP 탭에 이미 상당량, **중복 위험** |
| java | 🧪 테스트 · 품질 | JUnit·Mockito·Testcontainers 가 도구 탭에 이미 있음 |
| js-ts | 🧪 테스트 | o05(Vitest) · o06(Playwright) 섹션이 이미 있음 |
| python | Polars · RAG | Polars 21회 · DuckDB 14회 · RAG 30회 — 이미 다뤄짐 |
| cpp/rust | — | 16 · 15탭으로 포화 |

**점검 방법**(다음에 또 할 때): `grep -o -i "키워드" public/<가이드>-web/index.html | sort | uniq -c` 로
언급 빈도를 세고, **한 자릿수면 공백 · 전용 탭 없음이면 후보**로 봅니다.

## 다이어그램 현황 — 총 1,439개
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| cpp | 169 | | **server** | **150** |
| **js-ts** | **146** | | python | 144 |
| rust | 142 | | **cs** | **133** |
| java | 123 | | kotlin | 118 |
| **db** | **114** | | **csharp** | **100** |

**모든 가이드의 모든 탭이 7개 이상**입니다.

## 도구 — 저장소에 영구 보관되어 있습니다 ✅

세션이 바뀌어도 사라지지 않습니다. **새 세션은 이 두 파일만 읽으면 바로 시작할 수 있습니다.**

| 파일 | 무엇 |
|---|---|
| `web/guide-src/AUTHORING.md` | **집필 지침서** — 집필 에이전트에게 그대로 읽히는 단일 지침(pane 골격 · 컴포넌트 · .diag SVG 규칙 · 금지사항 · meta 스키마 · 검증 · 보고 형식) |
| `web/guide-src/tools/reg.mjs` | **탭 등록 스크립트** — meta.json 하나로 7곳 자동 등록 |
| `web/guide-src/tools/README.md` | 검사 도구 5종 + reg.mjs 사용법 |
| `web/guide-src/DIAGRAM-STYLE.md` | 시각화 디자인 기준 원문 |
| `.claude/skills/diag/SKILL.md` | 시각화 제작 절차 스킬 |

**집필 에이전트에게 줄 프롬프트 뼈대** (이 형태로 주면 됩니다):
```
당신은 한국어 학습 가이드(<가이드명>)의 새 탭을 집필합니다.
먼저 `web/guide-src/AUTHORING.md` 를 끝까지 읽고 거기 적힌 "먼저 읽을 것"을 읽은 뒤 작업하세요.
예시 pane 은 <대상 가이드의 비슷한 탭 경로> 를 읽고 문체·컴포넌트를 맞추세요.
당신의 작업 폴더는 <스크래치패드>/<가이드>-<탭>/ 입니다.

## 과제
- 가이드 `X` · 탭 id `Y` · pane `...` · 접두사 `z` (z01~z13) · <span class="no">LABEL 01</span>
- meta.json: 스크래치패드 최상위 `X-Y.meta.json`. label/short/icon/cls/grad/group/groupLabel/
  groupIcs/groupTitle/sheetLabel/after 값 지정
- 주제: ...

## 섹션 (13개)   ← 한 줄씩 제목 + 다룰 내용을 구체적으로
1. z01 ★ ...

## 분량·시각화
- 섹션당 9~15KB, 총 140KB 이상. 시각화 최소 9개(무엇을 그릴지 나열)
- 검증(AUTHORING §5) 후 §6 형식으로 보고.
```

**에이전트 운용 요령** — 탭 하나에 에이전트 하나. **동시에 5개까지**가 안전합니다
(19개를 한꺼번에 돌렸다가 세션 토큰 한도로 전부 중단됐습니다). 한 탭이 대략 20만 토큰 · 30분.
완료되면 통합 담당(메인 세션)이 `reg.mjs` 로 등록 → 검증 → 그룹 라벨 보정 → router stats → 커밋.

**통합할 때 잊기 쉬운 것 두 가지**
1. `reg.mjs` 는 **이미 있는 그룹 버튼을 안 고칩니다.** 새 탭이 기존 그룹에 들어가면
   `11-sidebar.html` 의 `data-g="N"` 버튼 `title`·`ics` 를 손으로 갱신하세요.
2. `src/router/index.ts` 의 stats(탭 수·섹션 수)는 `verify:guide` 출력값으로 맞추세요.


