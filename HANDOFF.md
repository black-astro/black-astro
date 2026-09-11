# 핸드오프 — 언어 가이드 확장 (2026-08-28 10차 갱신)

## 현재 상태

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


