# 핸드오프 — 언어 가이드 확장 (2026-08-31 16차 갱신)

> **새 세션이라면 여기부터** — 큰 숙제가 전부 끝났습니다. §남은 일을 보고 다음을 정하세요.
> **브라우저 실측은 열 가이드 1,388개 전부 완료**(2026-08-28) — 미실측 0.
> 집필 지침서와 등록 스크립트는 **저장소에 있습니다**: `web/guide-src/AUTHORING.md` · `web/guide-src/tools/reg.mjs`
> **시각화 모델 30종 카탈로그가 새로 생겼습니다**: `web/guide-src/DIAGRAM-MODELS.md` ·
> 본보기 `web/guide-src/shared/models/*.html` · 갤러리 `npm run diag:lab` → `public/diag-lab/index.html`

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
| **csharp** | **15** | **206** | **149** |

**총 시각화 1,388개 · 총 섹션 2,212개.**
(시각화는 `class="diag"` 카드 수로 셉니다 — 이전 표의 1,439 는 집계 기준이 섞인 값이었습니다.
 지금은 `class="diag"` 와 `<svg viewBox` 개수가 열 가이드 전부에서 일치합니다.)

### 이번 회차 ② — C# 엔터프라이즈 서버 3개 탭 (사용자 요청 · 완료 · 카탈로그를 처음 실전에 쓴 사례)

> 배경: "Java → C# 으로 갈아탈 생각이다. Spring 특화 같은 걸 .NET 으로 하는 내용이 필요하다.
> 백엔드 · DB · 배치 서버 · 대규모 파일 및 API 통신 · C# 전용 서버 구축 방법."

기존 csharp 서버 탭들이 전부 **게임 백엔드 관점**이라 엔터프라이즈 업무 시스템 관점이 통째로 비어 있었습니다.
새 그룹 5 **"엔터프라이즈 · 서버"** 를 만들고 세 탭을 넣었습니다.

| 탭 | 섹션 | 그림 | 내용 |
|---|---|---|---|
| 🏢 `ent` 엔터프라이즈 백엔드 | e01~e13 | 16 | Spring↔.NET 대응 지도 · 호스팅/부팅 · DI 심화 · 계층 · EF Core vs JPA · 트랜잭션과 아웃박스 · Dapper · 검증/매핑 · 설정 · 인증인가 · 관측 · 테스트 · 사내 결재 시스템 실전 |
| 🗂️ `batch` 배치 · 파일 · 통신 | f01~f13 | 14 | 배치 선택지 지도 · Worker Service · 스케줄링 · 청크 처리(Spring Batch 대응) · 대용량 DB · 대용량 파일(EUC-KR 포함) · 스트리밍 업로드 · EAI/SFTP · HttpClient+Polly · gRPC/메시징 · Channels · 배치 운영 · 일별 정산 배치 실전 |
| 🖧 `host` 서버 구축 · 배포 | h01~h14 | 18 | 톰캣이 없는 세상 · Kestrel · IIS(ANCM) · Windows Service · systemd · 리버스 프록시 · YARP · HTTPS · publish 옵션 · 무중단 배포 · 컨테이너 · 성능 튜닝 · 문제 해결 사전(28행) · 사내 서버 구축 실전 2벌 |

- **csharp 12탭 166섹션 → 15탭 206섹션**, 시각화 101 → 149개.
- 세 탭 모두 **새 시각화 카탈로그를 써서** 그렸습니다 — 탭당 12~14종, 같은 모델 최대 2~3회.
  `compare`(Spring↔.NET · 톰캣↔Kestrel) · `waterfall`(N+1 지연) · `gantt`(DI 수명 · 무중단 배포) ·
  `anatomy`(systemd 유닛) · `sankey`(Channels 백프레셔) · `gauge` · `funnel` · `swim` · `hub` · `pyramid` 등.
- **브라우저 실측 완료** — csharp 149개 전부 OVER/BOX/LAP/CUT **0건**
  (정적 검사는 통과했는데 실측에서 h02·h07 겹침 2건이 나와 고쳤습니다. 정적 검사만으로는 부족하다는 증거입니다.)
- 탭 15개 전환 스모크 통과 · JS 오류 0.

---

### 이번 회차 ① — 시각화 모델 30종 카탈로그 (사용자 요청)

> "매번 똑같은 것만 쓰지 말고 다양한 시각화 모델로. 나중에 다른 곳에도 적용할 수 있게, 최소 20가지."

**먼저 실측했습니다** — 기존 다이어그램 1,340개를 구성 요소로 분류한 결과:

| 모양 | 개수 | 비율 |
|---|---|---|
| 사각 박스 + 직선 화살표 | 835 | 62% |
| 사각 박스 나열 | 458 | 34% |
| 원 노드 | 17 | 1.3% |
| 그 밖 | 30 | 2% |

`<ellipse>` 6개 · `<polygon>` 1개 · **좌표축과 채워진 영역은 0개**였습니다.
그림 종류가 부족한 게 아니라 **CSS 어휘가 없어서** 매번 같은 걸 그린 것이었습니다.

**만든 것**

| 무엇 | 어디 |
|---|---|
| 모델 30종 본보기 (복붙용) | `web/guide-src/shared/models/{10-structure,20-relation,30-time,40-quantity,50-concept}.html` |
| 카탈로그 문서 (언제 쓰고 언제 피하나 · 이식 방법) | `web/guide-src/DIAGRAM-MODELS.md` |
| CSS 어휘 60여 개 (§7 모델 라이브러리) | `web/guide-src/shared/css/06-diag.css` |
| 화살촉 마커 3종 추가 `#ar-vi` `#ar-sm` `#ar-op` | 열 가이드 `parts/10-body-open.html` |
| 갤러리 빌더 | `web/guide-src/tools/lab.mjs` · `npm run diag:lab` / `npm run check:lab` |
| 렌더된 갤러리 | `web/public/diag-lab/index.html` (300 KB · 30종 한 페이지) |

**30종** — 구조 8 `flow layer pipe swim seq state tree graph` ·
관계 5 `matrix quad venn hub orbit` · 시간 4 `timeline gantt waterfall cycle` ·
수량 8 `bar line stack sankey funnel scatter gauge spark` ·
개념 5 `memory pyramid decision compare anatomy`

- 계열 색 `.s1~.s4`(청록→호박→보라→초록)는 **색각 이상 시뮬레이션 검증 통과**
  (인접 쌍 최소 ΔE 19.5 deutan · 27.0 정상). 5번째 색은 만들지 않습니다.
- 30종 전부 `check:lab` 0건 · **브라우저 실측 OVER/BOX/LAP/CUT 0건**.
- `AUTHORING.md` §0·§2, `DIAGRAM-STYLE.md` 머리말, `.claude/skills/diag/SKILL.md` §0·§7,
  `tools/README.md` 에 전부 연결해 두었으므로 **집필 에이전트가 자동으로 읽습니다.**
- 새 클래스 이름이 기존 다이어그램과 충돌하지 않는지 확인했습니다(충돌 0건).

**다른 프로젝트로 옮기려면** 세 가지만 있으면 됩니다 —
CSS 토큰 12개 · `shared/css/06-diag.css` · 마커 `<defs>` 블록. 자세한 건 `DIAGRAM-MODELS.md` 마지막 절.

---

### 지난 회차 — 기술 스택 공백 5개 (언급 빈도를 실측해 고름)
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

---

## 남은 일 · 끝낸 일


**새 세션에서 바로 시작할 수 있게 준비돼 있습니다.** 지침서와 등록 스크립트를
**저장소에 영구 보관**했으므로(§도구) 세션이 바뀌어도 사라지지 않습니다.

새 세션 첫 5분에 할 일:
```bash
cd D:/gibis/workTool/astro/black-astro
cat HANDOFF.md                      # 이 파일 (현재 상태 · 남은 일)
cat web/guide-src/AUTHORING.md      # 집필 지침서 (에이전트에게 그대로 읽힘)
cat web/guide-src/tools/README.md   # 검사 도구 5종 + reg.mjs
git log --oneline -5                # 최근 작업 확인
cd web && npm run verify:guide      # 현재 상태가 깨끗한지
```
그다음은 `(A) 에이전트에 과제 주기 → (B) reg.mjs 로 등록 → (C) 검증 → (D) 커밋` 반복입니다.

### 1. ✅ 브라우저 실측 — 열 가이드 전부 완료 (2026-08-28)

**1,388개 전부 실측했습니다. 미실측 누적 0.** 오래 밀려 있던 숙제가 끝났습니다.

| 가이드 | 개수 | 고친 건 | | 가이드 | 개수 | 고친 건 |
|---|---|---|---|---|---|---|
| cpp | 169 | 1 | | rust | 142 | 0 |
| server | 150 | 3 | | cs | 133 | 3 |
| csharp | 149 | 3 | | java | 123 | 1 |
| js-ts | 146 | 2 | | kotlin | 118 | 0 |
| python | 144 | 2 | | db | 114 | 1 |

**고친 16건은 전부 정적 검사(`svgcheck`)가 통과시킨 것들**이었습니다. 유형은 세 가지뿐입니다.

1. **좌우 박스 사이 좁은 틈에 놓인 라벨**이 양쪽 테두리를 침범 (가장 많음 — 6건)
   → 라벨을 박스 위/아래 여백 줄로 옮깁니다. x 는 건드리지 않습니다.
2. **위아래 두 묶음이 서로 침범** — 윗 절의 박스가 아랫 절 영역까지 내려옴 (4건)
   → 이제 `svgcheck` 의 **OVL 검사**가 정적으로 잡습니다.
3. **긴 문구가 ±5px 넘침** (3건) → 문구를 줄입니다.

**도구가 좋아졌습니다** — `svgcheck.mjs` 에 **OVL(박스 겹침)** 검사를 넣었습니다.
박스 좌표는 소스에 그대로 있으므로 브라우저 없이 잡힙니다. 겹침이 곧 그림의 뜻인 경우
(java g11 타임아웃 계단 · js-ts c08 쌓임 맥락)는 `<svg data-ovl="ok">` 로 표시해 건너뜁니다.

#### 다시 재야 할 때 (새 그림을 많이 추가한 뒤)
1. 로컬 서버 — `web/public` 에서 8899 (§관련 명령어). 대개 이미 떠 있습니다.
2. `http://localhost:8899/<가이드>-web/index.html?v=N` — **재빌드 후에는 `?v=` 를 올릴 것**
3. §관련 명령어의 실측 스크립트를 evaluate → OVER/BOX/LAP/CUT 이 none 이 될 때까지 반복
4. 고칠 때는 **x 를 옮기지 말고 문구를 줄이거나 y 를 옮깁니다** (x 를 옮기면 LAP 이 새로 생깁니다)
5. 측정 후에는 페이지를 새로고침하세요(`content-visibility` 를 강제로 풀어 둔 상태입니다)

> 오탐 두 가지를 기억해 두세요 — ① 여러 칸에 걸친 필드 이름(rust k04 "w (u32)")은
> 셀 경계를 넘는 것이 정상입니다. ② 의도적 중첩 그림은 `data-ovl="ok"` 로 표시돼 있습니다.

### 2. ✅ C# 엔터프라이즈 서버 3개 탭 — 완료 (2026-08-28)

`ent`(e01~e13) · `batch`(f01~f13) · `host`(h01~h14) 세 탭을 새 그룹 5 "엔터프라이즈 · 서버" 에 넣었습니다.
내용과 시각화 구성은 위 **§이번 회차 ②** 를 보세요. csharp 은 **15탭 206섹션 149그림**이 되었고
브라우저 실측까지 끝났습니다. **이 항목은 더 할 일이 없습니다.**

남은 관련 아이디어(우선순위 낮음) — 세 탭에서 기존 탭으로 `(🔷 w03)` 처럼 넘긴 교차 참조가 많습니다.
나중에 게임 관점 탭(`api` `scale` `net` `tool`)을 손볼 일이 있으면 반대 방향 참조도 걸어 두면 좋습니다.

### 3. 🟡 기존 그림에 카탈로그 역적용 — 12개 완료, 계속 하면 됩니다

**끝낸 것 (2026-08-31 · 12개)** — 전부 "의도는 이미 그 모델인데 사각형으로 그려져 있던" 것들입니다.

| 대상 | 무엇이 문제였나 | 바꾼 모델 |
|---|---|---|
| `server/y09` 알림 깔때기 | 이름이 깔때기인데 사각형 · 마지막 두 단이 같은 4건인데 폭이 달랐음 | `funnel` |
| `server/y10` 에러 예산 | 축·눈금 없는 꺾은선 | `line` (축·그리드·영역·데이터점) |
| `server/y07` 트레이스 폭포수 | 구조는 맞았고 축 어휘만 구조선(.ln) | `waterfall` |
| `rust/b10` 바이너리 크기 | 막대는 정확히 비례했는데 축이 없고 값이 막대에서 멀었음 | `bar` |
| `cpp/w11` 평균과 꼬리 | 위와 같음 | `bar` |
| `csharp/g03` 프레임 예산 | 두 줄의 축이 서로 달라 비교가 안 됐음 | `stack` + 예산선 |
| `kotlin/kt06` 순차 vs 병렬 | "합계 450ms" 가 폭 150 짜리 박스라 150ms 구간처럼 읽혔음 | `gantt` |
| `js-ts/g07` 콜드 스타트 | 시간축은 정확한데 축 어휘가 구조선 | `waterfall` |
| `js-ts/v14` 앱 기동 | 완벽한 워터폴인데 **축·눈금이 아예 없어** 크기를 못 읽었음 | `waterfall` |
| `server/y04` 카운터 vs rate | 꺾은선이 구조선 어휘 | `line` (영역 채움 추가) |
| `csharp/b10` WASM 크기 | 축·눈금 없음 | `bar` |
| `cpp/w06` 파싱 처리량 | 축·눈금 없음 (20배 차이가 안 보였음) | `bar` |

**배운 것** — 손대 보니 대부분은 **모델을 통째로 바꿀 필요가 없었습니다.**
이미 값에 비례하는 막대를 그려 놓고 ① 축·눈금이 없고 ② 값 라벨이 막대에서 멀고
③ 어휘가 `.bx`/`.ln` 이라 차트로 안 읽히는 경우가 대부분이었습니다.
**축을 붙이고 `.bar`/`.ax`/`.gr`/`.tk` 로 바꾸는 것만으로 확 달라집니다.**

**남은 후보 찾는 법** — 전용 도구를 만들어 두었습니다 (`web/` 에서):
```bash
node guide-src/tools/chartcand.mjs            # 전체 (지금 60개)
node guide-src/tools/chartcand.mjs server rust  # 가이드 지정
node guide-src/tools/chartcand.mjs --all       # 조건을 넓혀서
```
판정 기준은 하나입니다 — **같은 단위의 서로 다른 수치가 3개 이상인데 차트 어휘를 안 쓴 그림.**
나온 것을 전부 바꿀 필요는 없습니다. 다음 순번으로 확실한 것들:

| 후보 | 내용 | 바꿀 모델 |
|---|---|---|
| `server/m10` | 분산 트레이스 (y07 과 같은 형태) | `waterfall` |
| `server/y13` | 알림 후 5분 대응 순서 | `timeline` |
| `cpp/h10` `rust/h08` | 행 지향 vs 열 지향 | `bar` + `compare` |
| `cpp/h11` | 로컬 LLM 추론 · GB 단위 | `bar` |
| `js-ts/g13` | 짧은 주소 넘겨주는 동안 (ms 7개) | `waterfall` |
| `cpp/x06` | vector 가 늘어나는 방식 (1·2·4·8·16) | `bar` |
| `server/y11` | 플레임그래프 | 이미 맞는 모양 — 어휘만 |

**손대지 않기로 한 것** (후보로 잡히지만 지금이 맞습니다)
- `python/g01` 복잡도 배수 — 표 성격이고 이미 읽기 쉽습니다.
- `rust/u01` 배포물 비교 — 이미 `compare` 가 맞습니다.
- `server/y04` 히스토그램 버킷 — 누적 비율이라 0 부터 그리는 지금이 정직합니다.
- `rust/k04` 메모리 배치 — 4칸에 걸친 필드 이름이라 셀 경계를 넘는 게 정상입니다.

**작업 요령**
1. 원본 SVG 를 먼저 읽고 **막대가 이미 값에 비례하는지** 확인합니다(대개 비례합니다).
2. 비례하면 축·눈금만 붙이고 어휘를 바꿉니다. 안 하면 전체를 다시 그립니다.
3. `svgcheck` → **미리보기 페이지로 눈 확인** → 본문 실측 순서로 봅니다.

> **본문 페이지는 캡처가 타임아웃됩니다**(1.5~3MB). `getBBox` 실측은 되지만 스크린샷이 안 나옵니다.
> 그래서 `guide-src/tools/preview.mjs` 를 만들었습니다 —
> `node guide-src/tools/preview.mjs server/y09 rust/b10` → `public/diag-preview/index.html`
> 손본 그림만 담은 작은 페이지라 캡처가 됩니다. 확인 후 폴더는 지워도 됩니다.

---
### 4. 기술 스택 — 그 밖의 공백은 다 메웠습니다
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

### 5. 매 작업 마무리 체크리스트 (커밋 전 필수)
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide                             # ① 빌드 + 정합성 (열 가이드 전부 ✓ 여야)
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes   # ② 넘침·겹침 0건
node guide-src/tools/integrity.mjs               # ③ NUL·미이스케이프 (인자 없으면 전체)
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html      # ④ 탭 정합성
node guide-src/tools/lab.mjs --check             # ⑤ 모델 본보기를 고쳤으면
npx vue-tsc -b                                   # ⑥ router 고쳤으면
```
- [ ] 새 탭이 기존 그룹에 들어갔다면 `11-sidebar.html` 의 `data-g="N"` 버튼 `title`·`ics` 갱신
- [ ] `src/router/index.ts` 의 stats(탭 수·섹션 수)를 `verify:guide` 출력값으로 맞추기
- [ ] 가이드 성격이 바뀌었으면 hero·`#hello` 배너·사이드바 브랜드·`00-head.html` title/description/og 도 함께
- [ ] HANDOFF 의 현황표·다이어그램 수·미실측 누적 갱신
- [ ] 커밋 → `git fetch && git rebase origin/main` → push
      (원격에 GitHub Action 커밋이 수시로 들어와 그냥 push 하면 거부됩니다.
       `web/src/App.vue` 에 세션 이전부터 있던 수정이 남아 있으면 `git stash` 로 잠시 빼고 리베이스)

---

## 도구 — 저장소에 영구 보관되어 있습니다 ✅

세션이 바뀌어도 사라지지 않습니다. **새 세션은 이 두 파일만 읽으면 바로 시작할 수 있습니다.**

| 파일 | 무엇 |
|---|---|
| `web/guide-src/AUTHORING.md` | **집필 지침서** — 집필 에이전트에게 그대로 읽히는 단일 지침(pane 골격 · 컴포넌트 · .diag SVG 규칙 · 금지사항 · meta 스키마 · 검증 · 보고 형식) |
| `web/guide-src/tools/reg.mjs` | **탭 등록 스크립트** — meta.json 하나로 7곳 자동 등록 |
| `web/guide-src/tools/README.md` | 검사 도구 5종 + reg.mjs 사용법 |
| `web/guide-src/DIAGRAM-STYLE.md` | 시각화 디자인 기준 원문 — **어떻게** 그리나 (색·글자·viewBox) |
| `web/guide-src/DIAGRAM-MODELS.md` | **시각화 모델 30종 카탈로그** — **무엇을** 그리나 (고르는 기준 · 이식 방법) |
| `web/guide-src/shared/models/*.html` | 모델 본보기 소스 (복사해서 라벨·좌표만 바꿔 쓴다) |
| `web/guide-src/tools/lab.mjs` | 갤러리 빌더 · `npm run diag:lab` / `npm run check:lab` |
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

## 작업 흐름 (검증된 절차)
```bash
cd D:/gibis/workTool/astro/black-astro/web
# 1) 에이전트가 pane 파일 + meta.json 작성 (다른 파일은 절대 건드리지 않음)
node guide-src/tools/reg.mjs <스크래치패드>/<가이드>-<탭>.meta.json   # 등록 7곳
npm run build:guide -- <가이드>
node guide-src/tools/fixcut.mjs   guide-src/<가이드>/parts/panes    # 높이 보정 (먼저)
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes    # 넘침·겹침
node guide-src/tools/integrity.mjs <가이드>                          # NUL · 미이스케이프
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html        # 탭 정합성
npm run verify:guide                                                 # 커밋 전 필수
npx vue-tsc -b                                                       # router 고쳤으면
```
- 조각 파일에 `height="0"` 빈 rect 를 남기지 말 것
- svgcheck 지적의 대부분은 **좌우 316폭 박스에 긴 한 줄** — 두 줄로 쪼개고 박스 높이 52→68
- 넘침은 **x 를 옮기지 말고 문구를 줄여서** 해결 (옮기면 LAP 이 생깁니다)

## 다이어그램 현황 — 총 1,388개 (`class="diag"` 카드 수)
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| cpp | 169 | | server | 150 |
| **csharp** | **149** | | js-ts | 146 |
| python | 144 | | rust | 142 |
| cs | 133 | | java | 123 |
| kotlin | 118 | | db | 114 |

**모든 가이드의 모든 탭이 7개 이상**입니다.

앞으로 새로 그리는 그림은 `DIAGRAM-MODELS.md` 의 30종에서 골라 씁니다 —
**한 탭에서 같은 모델을 3번 넘게 쓰지 않는 것**이 규칙입니다.

## 시각화 공통 인프라 (2026-08-10 확정 — 유지)
1. 스타일 단일 기준 `shared/css/06-diag.css` (가이드 css 의 .diag 는 옛 사본, 공통이 이긴다)
2. 모션 `shared/js/06-diag-motion.js` · 탭 paneIn · SVG 0.45s 전환 · reduced-motion 존중
3. 마커 defs 는 각 가이드 `parts/10-body-open.html`
4. 작업 절차 `.claude/skills/diag/SKILL.md` + `web/guide-src/DIAGRAM-STYLE.md`
5. **Windows 10 은 Emoji 12까지** — U+1FA70~1FAFF 금지 (🪟 U+1FA9F 도 금지 — 🖥️ 를 씀)

## 조심할 것 (실제로 겪은 실패 — 누적)
1. `</section>` 누락 — verify:guide 가 잡아 줌
2. SVG 텍스트 넘침 — viewBox 680 기준 한글 `.lbl` x=16 → 약 60자 · x=366 → 약 28자
3. `.lbl` 에 font-size 얹어도 CSS 가 이긴다 — 9px 곁주석은 `.ann`
4. perl -pi 는 Windows 에서 CRLF 를 심는다 — node 스크립트로. `String.replace` 치환문자열의 `$$`는 `$` — 함수형 replace 쓸 것
5. `git add` 는 저장소 루트에서 · `public/*-web/index.html` 직접 수정 금지(빌드가 덮음)
6. 원격에 GitHub Action 커밋 수시 유입 — push 거부되면 `git fetch && git rebase origin/main`
7. `file://` 은 Chrome MCP 거부 — 8899 로컬 서버 경유
8. `content-visibility` 안 풀면 `getBBox()` 가 0 — 측정 전 visible 강제, **측정 후 새로고침**
9. 문체 — 합니다체 · `<b>` 포인트 · note tip/warn/info · 가이드별 컴포넌트가 조금 다르니 해당 파일 먼저 읽기
10. Chrome MCP `resize_window` 는 최대화 창에서 안 먹힘
11. **verify:guide 는 JS 런타임 오류를 못 잡는다** — 탭·JS 수정 후 switchTab 스모크 필수
12. **재빌드 후 실측은 캐시버스터(?v=N)** — 같은 URL 재방문은 옛 파일일 수 있다
13. **큰 HTML 조각은 bash 히어독이 깨진다** — Write 도구로 파일을 만들고 node 스크립트로 삽입할 것
14. **한 조각 파일에 여러 pane 의 섹션을 섞지 말 것** — 삽입 스크립트는 pane 하나만 다룬다
15. **코드블록 안의 `2>&1` 같은 `&`** 는 `&amp;` 로 — integrity 가 잡기 전에 미리 바꿔 두면 왕복이 줄어듭니다
16. **Write 로 쓰는 조각 안에서 `\$` 이스케이프 금지** — 백슬래시가 그대로 화면에 나옵니다
17. **bash 안에서 node -e 에 백틱이 든 템플릿 리터럴을 넣지 말 것** — 셸이 먼저 해석해 깨집니다
18. **동시 에이전트는 5개까지** — 19개를 한 번에 돌리면 세션 토큰 한도에 걸려 전부 날아갑니다
19. **여러 에이전트가 같은 스크래치패드를 쓰면 파일명이 충돌한다** — 에이전트마다 전용 하위 폴더를 지정할 것
20. **`shared/models/` 는 가이드 조각이 아니다** — `build.mjs` 의 shared 고아 검사에서 제외돼 있다(`SHARED_NOT_PARTS`)
21. **`svgcheck.mjs` 는 `<section class="sec" id=...>` 단위로만 읽는다** — 조각만 검사하려면 감싸야 한다(`lab.mjs` 가 그렇게 한다)
22. **rotate 로 세운 텍스트는 svgcheck 가 가로 폭으로 잘못 잰다** — `writing-mode` 를 쓰거나 가로로 눕힐 것

## 관련 파일/명령어
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide          # 빌드 + 정합성 (커밋 전 필수)
npm run build:guide -- cpp    # 특정 가이드만

# 로컬 서버 (public 폴더, 8899)
cd public && node -e "const http=require('http'),fs=require('fs'),p=require('path');http.createServer((q,r)=>{let f=p.join(process.cwd(),decodeURIComponent(q.url.split('?')[0]));try{if(fs.statSync(f).isDirectory())f=p.join(f,'index.html');r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(fs.readFileSync(f));}catch(e){r.writeHead(404);r.end('nf')}}).listen(8899)"
```

**SVG 실측** (Chrome MCP): `http://localhost:8899/<가이드>-web/index.html?v=N` 열고 실행 →
OVER/BOX/LAP 가 none 이 될 때까지 문구 축약:
```js
document.querySelectorAll('.pane, .sec').forEach(e=>e.style.contentVisibility='visible');
document.documentElement.style.scrollBehavior='auto';
const panes=[...document.querySelectorAll('.pane')];const prev=panes.map(p=>p.className);panes.forEach(p=>p.classList.add('on'));
const over=[],lap=[],box=[];
document.querySelectorAll('.diag svg').forEach(svg=>{
  const vb=svg.viewBox.baseVal, sec=svg.closest('section')?.id||'?';
  const rects=[...svg.querySelectorAll('rect')].map(r=>{try{return r.getBBox()}catch(e){return null}}).filter(Boolean);
  const ts=[...svg.querySelectorAll('text')].map(t=>{let b;try{b=t.getBBox()}catch(e){return null}return b&&b.width?{b,s:t.textContent.slice(0,14)}:null}).filter(Boolean);
  ts.forEach(({b,s})=>{
    const o=Math.round(b.x+b.width-vb.width);if(o>0)over.push(sec+' +'+o+' '+s);
    const cy=b.y+b.height/2;
    rects.forEach(r=>{if(cy>r.y&&cy<r.y+r.height&&b.x>=r.x-1&&b.x<r.x+r.width){const ov=Math.round(b.x+b.width-(r.x+r.width));if(ov>2)box.push(sec+' +'+ov+' ['+s+']')}});
  });
  for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){
    const a=ts[i].b,c=ts[j].b;
    if(Math.min(a.x+a.width,c.x+c.width)-Math.max(a.x,c.x)>2 && Math.min(a.y+a.height,c.y+c.height)-Math.max(a.y,c.y)>3)
      lap.push(sec+' ['+ts[i].s+']x['+ts[j].s+']');
  }
});
panes.forEach((p,i)=>p.className=prev[i]);
'DIAGS: '+document.querySelectorAll('.diag svg').length+' | OVER: '+(over.join(' / ')||'none')+' | BOX: '+(box.join(' / ')||'none')+' | LAP: '+(lap.join(' / ')||'none')
```

## 목표
열 가이드(`web/guide-src/*` → `web/public/*-web/index.html`)를
**"기초부터 전문가까지 이 페이지만 보고 실서비스를 만들 수 있는"** 수준으로.
열 가이드 전부가 **설치 → 기초 → 실전** 축을 갖췄습니다. 다음은 **브라우저 실측**(크롬 MCP 준비됨)과 남은 기술 스택 공백입니다.
