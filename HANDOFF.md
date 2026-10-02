# 핸드오프 — 언어 가이드 확장 (2026-10-02 13차 갱신 · 구조 탭 완성 · 읽는 법 · 예제 코드 전수 검토)

> 새 세션은 **13차 절만 읽고 바로 "🔜 이어서 할 일" 1번부터** 하면 됩니다. 12차 · 11차 이전 기록은 아래에 그대로 있습니다.

## 🆕 13차에 한 일 (전부 커밋 · 푸시 완료)

| 작업 | 결과 |
|---|---|
| **📁 프로젝트 구조 탭 10개 완성** | 12차 4개(java · kotlin · python · js-ts)에 이어 **cpp · server · csharp · rust · db · cs** — 탭 id `struct`, `ps01~ps10`, `panes/30-struct.html`. cs 는 아키텍처 패턴 총론 + 다른 가이드 구조 탭 링크 허브(53개) |
| **읽는 법(*) 사전 7개 추가** → 열한 가이드 전부 | c 205 · cpp 196 · rust 211 · csharp 225 · db 223 · server 241 · cs 161 (`js/85-say.js`). 등록 도구 `tools/regsay.mjs` 신설 |
| **예제 코드 전수 검토** (`CODE-AUDIT.md`) | 아래 표. 가이드마다 브라우저로 전 탭 switchTab · 섹션 수 대조 · JS 오류 0 확인 후 커밋 |
| C 가이드 마무리 | 검토 + 사전 + 집필 때 "확신 없음" 사실 확인(FreeRTOS V11 API · UART 허용 오차 · CRA 일정 · IRQ 개수 등 대부분 맞음) |
| 그 밖 | java 람다 섹션에 함수형 인터페이스 한 장 요약(모양 · 호출 메서드 · 코틀린 함수 타입), 가이드 이동 시 깜빡임 수정(아래 🩹), FNV-1a 상수 오타(c · cpp) |

### 예제 코드 전수 검토 현황
| 가이드 | 상태 | 블록 · 수정 | 대표적으로 잡은 것 |
|---|---|---|---|
| c | ✅ | 767 · 47 | 링크 오류(`_sidata`) · project VERSION · FreeRTOSConfig 필수 항목 · bsearch 정렬 기준 · 마운트 실패 후 진행 |
| server | ✅ | 628 · 106 | **줄 끝 `#` 주석을 못 받는 설정**(Apache · systemd · .properties · sysctl · journald · Fluent Bit) 수십 곳, 없는 nginx 지시어 · Alertmanager receiver |
| db | ✅ | 582 · 68 | PostgreSQL 18 이미지 데이터 경로, DISTINCT ON + LIMIT, HNSW 못 타는 RRF, 결과표 행 수 |
| cs | ✅ | 840 · 84 | 실행하면 죽던 예제, 주장과 반대 결과, 출력 주석 실측화, SSRF CGNAT |
| csharp | ✅ (00-setup 제외) | 811 · 155 | SKIP LOCKED 트랜잭션 누락, 동시성 · 수신 버퍼, MapInboundClaims, GCHeapHardLimitPercent 16진수 |
| cpp | 🟡 7/16 탭 | 727 · 102 | 09-clang(C 가이드 수정 14건 이식) · 01-lang · 02-mod · 03-py · 04-node · 05-ffi · 06-build 완료 |
| rust | ⬜ | — | 미착수(중단분은 패치로 보관) |

## 🔜 이어서 할 일 (순서대로)

### 1. 예제 코드 전수 검토 마무리 — cpp 나머지 9탭 · rust 전부 · csharp 00-setup
**중단된 작업의 수정분을 패치로 보관했습니다** — `web/guide-src/_wip/audit-partial/`
| 패치 | 범위 | 상태 |
|---|---|---|
| `cpp-group3-perf-deep-setup-srv.patch` | cpp 07-perf · 08-deep · 10-setup · 12-srv | 검토 도중 중단(어디까지 봤는지 불명) |
| `cpp-group4-app-game-hpc.patch` | cpp 11-app · 13-game · 14-hpc (16-cs · 15-jvm 는 미착수) | 검토 도중 중단 |
| `rust-group1-lang-own-py-node.patch` | rust 01-lang · 02-own · 03-py · 04-node | 검토 도중 중단 |
| `rust-group2-ffi-build.patch` | rust 05-ffi · 06-build (07~09 미착수) | 검토 도중 중단 |
- 저장소 파일은 **되돌린 상태**(반쯤 적용된 수정이 섞이지 않게). 쓰는 법: 에이전트에게 패치를 먼저 읽게 하고(`git apply --check` 후 적용하거나 diff 를 참고), 그 파일을 처음부터 검토해 완성.
- 남은 분할(블록 수 기준, 31-sq · 30-struct 제외):
  - cpp ③ 07-perf · 08-deep · 10-setup · 12-srv (374) · ④ 13-game · 14-hpc · 11-app · 16-cs · 15-jvm (489 — 둘로 나눠도 됨)
  - rust ① 01-lang · 02-own · 03-py · 04-node (437) · ② 05-ffi · 06-build · 07-perf · 08-deep · 09-tool (418) · ③ 10-setup · 11-web · 12-svc (325) · ④ 13-tauri · 14-jvm · 15-cs · 16-log (464)
  - csharp `00-setup.html` (64블록) — 앞/뒤 분할 경계에서 빠졌음
- 프롬프트는 이 회차에 쓴 형태 그대로: `CODE-AUDIT.md` 를 읽게 + 담당 파일만 수정 · 빌드/커밋 금지 + 언어 특화 점검 포인트(11차 §3-a) + 작업 폴더 `SP/audit-<가이드><n>/`.
  cpp ④ 의 15-jvm 은 이 PC 의 JDK 25(`C:/Program Files/Java/jdk-25.0.1+8`)로 javac 확인 가능.
- **분할할 때 파일 목록을 명시**하세요(“앞쪽 절반” 같은 지시는 경계 파일이 빠집니다 — csharp 00-setup 이 그렇게 빠짐).
- 가이드 하나의 모든 묶음이 끝난 뒤 한 번에: `build.mjs <g>` → verify · smoke · integrity → 브라우저 전 탭 switchTab → 커밋.

### 2. 그림 정리 (11차 §1~§3 + 이번 검토에서 나온 것)
- **svgcheck 넘침** — 원래부터 있던 것: db 12건(02-sql q10 · 03-pro e04 e07 · 04-oracle o09 · 08-tune t01 · 11-redis r10 · 12-mongo n03), server 8건(05-caddy c07 · 07-lang l12 · 08-perf p06 p10 · 15-win v06 v10). 문구를 줄여서 해결.
- **같은 그림이 두 번** — db: 10-app a09 · a07, 08-tune t01 · t11, 09-deep z07 · z10, 11-redis r08 · r10, 12-mongo n03 · n08 (+ `dupdiag.mjs server db cs csharp cpp`). cpp 는 dupdiag 11건(08-deep d08 등).
- diagaudit 결함 · 박스형 70% 넘는 탭 다시 그리기(11차 §2 · §3 표 그대로).

### 3. 라이트 테마 · 모바일 점검 — 12 · 13차 새 탭 전부
c-web 12탭 + 각 가이드 `#pane-sq` · `#pane-struct`. 11차 §검증 순서의 라이트 대비(본문 3.2 미만 · `window.lxInkFix(svg)` 후 3 미만) + 390/768 폭.

### 4. 검토 에이전트들이 "확신 없음"으로 남긴 것 (선택)
각 커밋 메시지 본문과 아래 정도: cpp 02-mod `variant` 재귀 Json(표준 비보장) · db Oracle 인터벌 파티션 DROP · server ingress-nginx 은퇴 후 설치 방법 · Helm 4 `--atomic` 이름 · csharp BenchmarkDotNet `RuntimeMoniker.Net100` 이름 · cs DORA 변경 실패율 기준.

## 🧰 13차에 만든 것 · 알게 된 것
- `web/guide-src/tools/regsay.mjs <가이드> <사전 파일>` — 읽는 법 사전 형태 검사(배열 · 2~3칸 · 중복) + `parts/js/85-say.js` 로 두고 parts.json 에서 `shared/js/07-study.js` 앞에 등록
- 원격에 3D 기여 그래프 자동 커밋이 수시로 올라옵니다 — 에이전트가 작업 중이라 rebase 를 못 할 때는 `git merge --no-edit origin/main` 후 push(원격 변경은 `profile-3d-contrib/` 뿐이라 충돌 없음)
- 검토 에이전트는 가이드당 블록 300~450개 단위가 적당(10~20분 · 20~50만 토큰). 동시에 5개.
- 사전 매칭 규칙: `_` 는 단어 문자라 `HAL_` 같은 접두사는 안 걸림, 점 뒤 표기는 `.unwrap()` 처럼 점을 붙여야 함, 기호만인 표기는 경계 검사 없이 어디서나 걸림

---

# (12차) C 가이드 · 스택/큐 · 프로젝트 구조 기록

> ⚠ 이 12차 절의 "이어서 할 일" 1 · 2번은 **13차에서 끝났습니다** — 남은 일은 맨 위 13차 절을 보세요.

## 🆕 12차에 한 일 (전부 커밋 · 푸시 완료)

| 작업 | 결과 |
|---|---|
| 언어 비교 화살표 단순화 (사용자 지적: "코틀린로" 조사 오류·과한 장식) | 라벨·원·그림자·애니메이션 제거, 가는 화살표 하나 (`07-study.js` ③-b · `07-study.css` 7.13) |
| **🔌 C · 임베디드 가이드 신설** (`guide-src/c` → `c-web`) | **12탭 · 155섹션** — 아래 표 |
| **🥞 스택 · 큐 · 덱 탭 × 8** (사용자가 "가장 중요"하다고 한 요청) | java · kotlin · python · js-ts · csharp · cpp · rust · c — 탭 id `sq`, 섹션 `sq01~sq12`, `panes/31-sq.html` |
| **📁 프로젝트 구조 탭 × 4** | java · kotlin · python · js-ts — 탭 id `struct`, 섹션 `ps01~ps10`, `panes/30-struct.html` |
| 핸드오프 잔여 소항목 | python 06-auto `.lbl`+font-size 12곳, java 데모 주석 t13, kotlin `_wip/log-tabs` 삭제 |
| router stats | 실측 반영 — 앞으로는 web/ 에서 **`node guide-src/tools/stats.mjs`** 한 줄이면 verify 출력으로 자동 갱신 |

### C 가이드 탭 구성 (`web/guide-src/c/parts/panes/`)
| 그룹 | 탭 id · 접두사 | 파일 | 비고 |
|---|---|---|---|
| 0 언어 · C | setup `u` · base `c01~13` · sys `c14~26` · sq | 10-setup · 01-base · 02-sys · 31-sq | base/sys 는 **cpp 의 09-clang(C 언어 탭)을 둘로 나눈 복사본** — cpp 쪽 원본은 그대로 둠 |
| 1 하드웨어 · MCU | hw `h` · avr `a` · stm32 `m` · io `p` | 03-hw · 04-avr · 05-stm32 · 06-io | 기준 칩 ATmega328P(Uno R3) · STM32F446RE(Nucleo) |
| 2 RTOS · 구조 · 품질 | rtos `r` · arch `k` · qa `t` | 07-rtos · 08-arch · 09-qa | arch = 사용자 요청 "C 도 규모 커지면 구조 관리" |
| 3 실전 · 양산 | prod `o` | 11-prod | 부트로더 · OTA · 서명 · 워치독 · 생산 · 보안(CRA) |

- 뼈대는 cpp 에서 복제(`00-head`·`11-sidebar`·`12-tabbar`·`js/*`·`css/06-c.css`). 등록된 곳: `build.mjs` GUIDES · `verify.mjs` · `tools/chartcand.mjs` · `tools/integrity.mjs` ·
  `shared/js/07-study.js`(가이드 목록 + 언어 화살표 HOME) · 다른 10개 가이드 `12-tabbar.html` "더 보기" 링크 · `src/router/index.ts`.
- **C 가이드에는 아직 없는 것**: `js/85-say.js`(읽는 법 사전), 예제 코드 전수 검토(CODE-AUDIT), 라이트 테마 대비 측정.

### 검증 상태 (푸시 직전)
- `npm run verify:guide` 11개 가이드 통과 · `integrity.mjs` 전체 0 · `smoke.mjs` 11개 통과 · `vue-tsc -b` 통과
- 브라우저(다크): c-web 12탭 전부 + 각 가이드의 sq/struct 탭 — pane 섹션 수 == navset 링크 수, 고아 섹션 0, SVG 글자 넘침(getBBox) 0, JS 오류 0
- **라이트 테마 대비 측정·모바일 폭 확인은 이번 회차 새 탭에서 안 했습니다** → 이어서 할 일 4번

## 🔜 이어서 할 일 (순서대로)

### 1. 📁 프로젝트 구조 탭 — 남은 6개 (중단된 것 5 + 미착수 1)
지침: **`web/guide-src/briefs/STRUCT-BRIEF.md`** 를 에이전트에게 그대로 읽힘. 산출물은 스크래치패드 → 통합 담당이 등록.
에이전트 프롬프트 뼈대(실제로 쓴 것):
```
당신은 한국어 학습 가이드(<가이드>)의 새 탭 "📁 프로젝트 구조"를 집필합니다.
먼저 web/guide-src/briefs/STRUCT-BRIEF.md 를 끝까지 읽고 전부 따르세요.
## 과제
- 가이드 `<g>` · 산출 pane `SP/struct/<g>-30-struct.html` · meta `SP/<g>-struct.meta.json`
- meta 그룹 값: group N, groupLabel "…", groupIcs "(사이드바 data-g=N 버튼의 현재 값)", groupTitle "(그 버튼의 현재 title)",
  sheetLabel "(12-tabbar.html 의 data-sg=N 버튼 글자)", after "<탭>"
- 문체 본보기 · 겹치지 말 것(기존 섹션 id) · 섹션 10개 목록
```
| 가이드 | group / after | 겹침 주의(기존 섹션) | 섹션 10개 핵심 |
|---|---|---|---|
| csharp | 3 "앱 · 도구" / tool | a11 · g01 · n01 · n15 · b02 · e04 | sln/slnx · Directory.Build.props · CPM / ASP.NET Controllers vs vertical slice / Clean Architecture 프로젝트 참조 / 테스트 / WPF·MAUI MVVM / **Unity Assets/_Project + asmdef** / Blazor · Aspire / 워커 · 여러 실행 프로젝트 / NuGet 라이브러리 / 요약 + NetArchTest |
| cpp | 2 "빌드 · 성능" / build | c25 · build 탭 · n01 · g11 · C 가이드 arch | Pitchfork / 모던 CMake 타깃 PUBLIC·PRIVATE / pimpl·컴파일 시간 / C++20 모듈 / vcpkg·Conan / 라이브러리 ABI·export / Qt 6 / 게임·서버 대형 / 테스트·도구 설정 / 요약 |
| rust | 2 "빌드 · 성능" / build | s04 · b05 · w02 · tauri 탭 | 크레이트·모듈 파일 규칙 / pub(crate)·re-export / workspace.dependencies·lints / Axum 서비스 / CLI / Tauri / 라이브러리 feature flags·semver / 테스트 위치 / build.rs·-sys / 요약 |
| db | 3 "심화 · 연동" / app | 마이그레이션·명명·dbt 기존 섹션 grep | DB 도 코드 / Flyway·Liquibase·Alembic 디렉터리 / 앱 저장소 vs DB 저장소 / 명명·스키마·역할 / SQL 파일 정리 / 시드 / **dbt staging·marts** / 여러 DB·expand-contract / sqlfluff·마이그레이션 CI / 요약 |
| server | 4 "확장 · SCALE" / msa | w07 · h03 · z14 · x09 · y12 · k8s 탭 | 인프라도 코드 / nginx conf.d·snippets / compose override / **Kustomize base/overlays vs Helm** / Terraform modules·environments / **GitOps app-of-apps** / 모노 vs 폴리레포 / 환경·비밀(SOPS 등) / CI 워크플로 / 요약 + 런북·ADR |
| cs | 3 "심화 · 설계" / se | e06 "아키텍처 — 레이어드 · 헥사고날" · e04 | **아키텍처 패턴 총론**: 계층형 · 헥사고날/클린/어니언 · MVC/MVP/MVVM · 모듈러 모놀리스 · 마이크로서비스 · 이벤트 기반 · 플러그인 · 패키지 원칙(ADP/SDP/SAP) · 유형별(웹/데스크톱/모바일/임베디드/라이브러리/파이프라인) 비교 matrix + **각 가이드 구조 탭 링크** |

등록: 산출 pane 을 `guide-src/<g>/parts/panes/30-struct.html` 로 복사 → `node guide-src/tools/reg.mjs <meta>` →
`node guide-src/tools/grpicon.mjs <g> <group> 📁 "프로젝트 구조"` → `build.mjs <g>` → verify · smoke · integrity → 커밋.

### 2. C 가이드 마무리
- `js/85-say.js` 읽는 법 사전(`volatile` · `ISR` · `NVIC` · `DMA` · `HAL_` · `UART` · `I²C` · `SPI` · `RTOS` · `xQueueSend` · `uint32_t` …) — 11차 §3-b 방식
- 예제 코드 전수 검토(`CODE-AUDIT.md`) — C 가이드 12탭 (컴파일러가 이 PC 에 없음 → 손 추적 + node 로 로직 이식)
- 집필 에이전트들이 "확신 없음"으로 남긴 사실 확인 목록(데이터시트·매뉴얼 대조 필요):
  STM32CubeIDE 2.x 가 CubeMX 를 분리했는지(u08) · CMSIS 매크로 `GPIO_MODER_MODER5_0`/`GPIO_ODR_OD5`(u07·h04) · F446 PA4/PA5 TTa 핀(h02) ·
  CubeF4 startup 의 SystemInit 순서(h11) · FreeRTOS V11 `vApplicationGetIdleTaskMemory` 셋째 인자 타입·`configKERNEL_PROVIDED_STATIC_MEMORY`(r03·r10) ·
  CubeMX TIM6 타임베이스 NVIC 기본값(r07) · DMA2 스트림 매핑 표(m10 — RM0390 대조) · UART 수신 허용 오차 3.75/4.375%(p02) · W25Q128JV 시간값(p11) ·
  BOR 임계 전압·`BOR_LEV`(o06) · STM32CubeProgrammer CLI 옵션(o10) · EU CRA 일정(o11) · AVR a12 전류 대략치 · F446 IRQ 개수 97(o02)
- router 의 C 항목 세 번째 stat("4 MCU · 하드웨어 탭")은 손으로 쓴 값 — 그대로 둬도 됨

### 3. 11차에서 넘어온 콘텐츠 품질 작업 (아래 11차 기록 §1~§4 그대로 유효)
- 예제 코드 전수 검토 — **server · db · cs · csharp · cpp · rust** 6개 (가이드당 에이전트 2개, `CODE-AUDIT.md`)
- 읽는 법(*) 사전 — csharp · cpp · rust · db · server · cs (+ c)
- 중복 그림(`dupdiag.mjs`) · 정렬 결함(`diagaudit.mjs`) · 박스형 70%↑ 탭 다시 그리기 — server · db · cs · csharp · cpp · rust
- 실무 탭 후보: server 🚑 장애 대응 런북 · db 🩺 운영 DBA 체크리스트 · csharp 🧪 테스트·배포 · cpp/rust 🐞 디버깅·프로파일링

### 4. 이번 회차 새 탭 20개의 라이트 테마 · 모바일 점검
11차 §검증 순서의 "라이트 대비"(전환 끄고 본문 3.2 미만 · `window.lxInkFix(svg)` 후 3 미만)와 390/768 폭 확인을
c-web 전체 + 각 가이드 `#pane-sq` · `#pane-struct` 에 대해. 에이전트 그림에 인라인 흰 글자(`style="fill:#e8f0ff"`)가 섞였을 수 있음.

## 🩹 12차 이후 수정 — 가이드 이동 시 "예전 화면" 깜빡임 (2026-10-01)

**증상**: 다른 가이드를 누르면 예전 사이드바(상자 그룹 버튼 + 가이드 칩 9개)와 닫아 둔 "처음이신가요?" 상자가 잠깐 보였다가 사라짐.
**원인**: 사이드바·탭바를 지금 디자인으로 바꾸는 코드가 문서 맨 끝(본문 2~3MB 뒤)의 `07-study.js` 에 있어, 네트워크로 받을 때
약 1초 동안 원본 마크업이 그려졌고 가이드 간 View Transition 이 그 첫 화면을 찍어 보여 줌. 안내 상자도 끝의 `00-core.js` 가 숨겼음.
**수정**:
- `shared/13-chrome.html` 신설 — 사이드바 3단 · 가이드 목록 · 목차 머리/진도 막대 · 테마 · 읽기 설정 · 접기 버튼 · `applyPrefs` 를 `07-study.js` 에서 옮김.
  parts.json 에서 **`12-tabbar.html` 바로 다음**. 끝에 표지 `<i id="lx-chrome" hidden>`.
- 각 `00-head.html`: `<link rel="expect" href="#lx-chrome" blocking="render">` (표지까지 첫 그리기 대기 — 미지원 브라우저는 무시) +
  선적용 스크립트에 `dvg-hello` → `html.lx-hello-off` (CSS `07-study.css` 끝에서 `#hello` 숨김).
- `07-study.js` 는 진도(`S`) · `paint()` 만 — `window.LX.onReset` / `LX.onPrefs` 훅으로 설정 창과 이어짐.
- 확인: Fast 4G 로컬 서버에서 첫 프레임(0.48초)부터 완성된 사이드바 · 도구 버튼 · 안내 상자 숨김, 기능(테마 · 글자 크기 · 다 읽음 · 초기화 · 탭 전환 · 접기) 정상, 중복 생성 0.
- **새 가이드를 만들면** parts.json 에 `shared/13-chrome.html`(12-tabbar 다음)과 00-head 의 위 두 줄도 넣어야 합니다.

## 🧰 이번 회차에 만든 것 · 알게 된 것

| 파일 | 무엇 |
|---|---|
| `web/guide-src/briefs/C-BRIEF.md` | C 가이드 탭 집필 공통 지침(탭 지도·접두사·독자·정확성 규칙) |
| `web/guide-src/briefs/SQ-BRIEF.md` | 스택·큐·덱 탭 12섹션 뼈대 |
| `web/guide-src/briefs/STRUCT-BRIEF.md` | 프로젝트 구조 탭 10섹션 뼈대 (가볍게 · 디렉터리 트리 중심) |
| `web/guide-src/tools/grpicon.mjs` | 사이드바 그룹 버튼 title·아이콘 갱신 — `reg.mjs` 가 기존 그룹 버튼을 안 고치므로 등록 뒤 실행 |
| `web/guide-src/tools/stats.mjs` | verify 출력으로 `src/router/index.ts` stats(탭·섹션 수) 자동 반영 |

- **셸 `sed` 로 이모지 치환이 조용히 실패**합니다(Git Bash). 이모지가 든 수정은 node 스크립트 · Edit 도구로. 실제 바이트는 `od -tx1` 로 확인.
- **`reg.mjs` 의 `after` 는 "이미 등록된 탭"만** 됩니다. 탭이 순서 없이 완성되면 이미 있는 앞 탭을 after 로 두고 등록 — 나중 탭을 같은 앞 탭 뒤에 꽂으면 사이에 들어갑니다
  (C 가이드: avr 를 sys 뒤에 먼저 → hw 를 sys 뒤에 → 순서 hw, avr). 반대로 rtos 뒤 arch 다음 qa 는 qa 의 after 를 arch 로 바꿔야 함.
- 가이드 뼈대를 복제할 때 `90-footer.html` 끝의 `</main></div><script>` 와 `99-tail.html` 의 `</script>` 가 짝 — footer 를 새로 쓰면 스크립트 전체가 죽습니다(이번에 한 번 겪음).
- 이 PC: **JDK 25**(`C:/Program Files/Java/jdk-25.0.1+8`, PATH 기본은 21) · IntelliJ 번들 **kotlinc 2.3** · Python 3.14 · Node 24 있음 / gcc·clang·rustc·dotnet **없음**(설치 금지).
- 에이전트 운용: 동시에 5~6개, 탭 하나 20~35분 · 20~37만 토큰. 끝나는 대로 하나씩 등록·커밋하고 빈 자리에 다음 것을 띄우는 방식이 잘 돌았습니다.

---

# (11차까지) 언어 가이드 확장 기록

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
2. **테마** `shared/css/08-theme.css` — 강조색 하나(파랑)로 통일 + **다크/라이트 두 벌** (사용자 요청으로 언어별 색 08-id-* 는 폐기).
   `<head>` 의 선적용 스크립트가 `lx:theme`(light|dark, 없으면 OS 설정)를 첫 그리기 전에 붙인다 — 전 가이드 공통 키.
   탭바 버튼으로 전환. 코드 블록 · `.stage` 데모 · `.out` 은 라이트에서도 어두운 "화면 섬"(다크 토큰 재선언).
   다이어그램 글자는 `07-study.js` 의 `inkFix` 가 라이트에서 글자-바탕 대비 3 미만이면 `lx-ink`/`lx-inv` 로 보정
   (인라인 `style="fill:#e8f0ff"` 같은 다크 전제 값 때문 — 네 가이드 132곳 자동 보정, 측정 0건).
3. **사이드바 3단 · PC 전폭** — 그룹(한국어 13.5px) → 지금 그룹의 탭(진도) → 목차, 다른 가이드 접기,
   읽는 섹션 따라가기. 셸 1720px·읽기 열 가운데 정렬 제거(문단 860px 제한만).
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

## ✅ 공통 틀 · 테마 — 열 가이드 전부 완료 (2026-10-01)

**전체 틀·디자인·테마는 공통입니다. 가이드별로 다르게 만들지 마세요.** (사용자 결정)
- 레이아웃: 사이드바 3단(그룹 → 탭 → 목차) · PC 전폭 · 가이드 목록 10개 **고정 순서**(Java → Kotlin → Python → JS·TS →
  C# → C++ → Rust → DB → 서버기술 → CS) + 현재 가이드 표시 · 상단 사이드바 접기 · **헤더 접기**(접으면 오른쪽 위 "⌄ 헤더" 손잡이) · 데스크톱 탭바 한 줄(탭 줄만 가로 스크롤, 현재 탭 자동 노출)
- 테마: 강조색 하나 · 다크/라이트 (`shared/css/08-theme.css`) — 가이드 고유 css 의 다크 전제 색은 §8.4~8.10 에서 보정
- 읽기 설정(Aa): 글자 크기 · 줄 간격 · 사이드바 접기 · 헤더 접기 · 집중 모드 · 테마 · 진도. 다른 탭에서 바꿔도 storage 이벤트로 즉시 반영. 옵션은 `lx:prefs`, 테마는 `lx:theme`,
  가이드 목록 열림은 `lx:guides` — 전부 전 가이드 공통이고 `<head>` 스크립트가 첫 그리기 전에 적용
- 가이드 사이 이동: 문서 간 View Transition(사이드바·탭바 고정, 본문 교차 페이드) + 링크 호버 시 다음 가이드 미리 렌더(Speculation Rules)
- 모바일: 1080 이하 사이드바·접기 버튼 없음, 480 이하 상단 바 한 줄(검색·목차·Aa 아이콘만), 읽기 설정은 아래 시트
- 새 가이드를 만들면: parts.json 에 `shared/css/07-study.css` · `shared/css/08-theme.css` · `shared/js/07-study.js`,
  `00-head.html` 에 java 와 같은 선적용 스크립트. 그 다음 라이트 대비 측정(아래 §검증).

## 🔜 다음 작업 — 언어별 시각화 모델 · 설명 개선 (콘텐츠)

틀은 끝났으니 남은 일은 **각 가이드 안의 그림과 설명의 질**입니다. 1차(java·python·kotlin·js-ts)와 같은 방식으로:
가이드당 에이전트 1~2개, 지침은 1차에 쓴 "다이어그램 개편 공통 지침"(아래 요약)을 그대로.

### 1. 먼저 — 중복 그림 정리 (c6a8a38 이 넣은 것)
```bash
node guide-src/tools/dupdiag.mjs server db cs csharp cpp      # server 18 · db 16 · cs 17 · csharp 11 · cpp 11 (rust 0)
node guide-src/tools/dupdiag.mjs <가이드> --fix                # <div> 균형으로 지움 — 지운 뒤 브라우저에서 pane 별 섹션 수 대조
```
1차에서는 지우는 대신 두 번째 사본을 **다른 모델로 다시 그려** 그림 수를 지켰습니다(이게 더 좋음). 시간이 없으면 --fix.

### 2. 정렬 · 모션 결함 (diagaudit) — 현재
| server 6 | db 24 | cs 19 | csharp 16 | cpp 5 | rust 9 |
|---|---|---|---|---|---|
db·cs 는 PK(흐름 점이 선을 벗어남)가 대부분입니다.

### 3. 박스형 70% 넘는 탭 (같은 모양 반복) — 탭마다 3~4개를 카탈로그 모델로
- **db** 13탭 전부 88~100% — 실행계획은 tree/waterfall, 인덱스는 tree, 격리 수준은 matrix, 복제는 seq, 용량은 bar
- **server** 15탭 78~100% — TLS 핸드셰이크 seq, LB 알고리즘 bar, Kafka 파티션 matrix, k8s 스케줄링 tree
- **cs** 01·03·04·06·09·11 (89~100%) — 자료구조는 memory/tree/graph, 아키텍처는 layer/pipe, 분산은 seq/state
- **csharp** 01·05·08 (100%) + 7탭 78~89%
- **cpp** 03·05·07 (100%) + 8탭 71~92% · **rust** 01·05 (100%) + 10탭 71~86%

### 3-a. 예제 코드 정확성 검토 — java · python · kotlin · js-ts 진행(2026-10-01), 나머지 6개 남음
사용자가 kotlin 예제의 조합 오류를 찾았습니다: `init { require(amount > 0) }` 인데 보조 생성자가 `this(id, 0L, "DRAFT")` 로 0 을 넘겨
`Order(10)` 이 **반드시 실패**하는 코드. 문법 검사로는 안 잡히고 **코드를 따라가 봐야** 보이는 오류라 전수 검토가 필요합니다.
- 지침서: `web/guide-src/CODE-AUDIT.md` (찾을 것 우선순위 · 확인 방법 · 최소 수정 원칙 · 검증 · 보고 형식) — 에이전트에게 그대로 줍니다
- 분담: 가이드당 에이전트 2개(탭을 블록 수로 반씩). 블록 수 — server ~700 · db ~500 · cs ~600 · csharp ~560 · cpp ~780 · rust ~850
- 실행 가능한 언어는 실제로 돌려 확인(python · node 는 이 PC 에 있음). 패키지 설치로 환경을 바꾸지 말 것.
- 다른 언어 특화 점검 포인트: **csharp** async void·ConfigureAwait·Unity 메인 스레드·IDisposable,
  **cpp** 수명·댕글링 참조·UB·이동 후 사용·예외 안전, **rust** 빌림 규칙 위반이 컴파일되는 것처럼 보이는 예제·unwrap 남용·Send/Sync,
  **db** SQL 결과 주석·격리 수준 주장·방언 차이, **server** 설정 파일 문법(nginx/k8s YAML)·명령어, **cs** 알고리즘 복잡도·계산 값

### 3-b. 읽는 법(*) 사전 — java · python · kotlin · js-ts 완료, 나머지 6개 남음
본문 인라인 코드가 **탭에서 처음 나올 때** 옆에 `*` 가 붙고, 누르거나 올리면 실무 발음 말풍선이 뜹니다
(엔진: `shared/js/07-study.js` ③-c · 끄기: 읽기 설정 "읽는 법 표시"). 가이드마다 사전 파일 하나만 있으면 됩니다.
- 파일: `web/guide-src/<가이드>/parts/js/85-say.js` → `window.LX_SAY = [["표기", "읽는 법", "부르는 말·한 줄 뜻"], ...]`
- parts.json 에서 `shared/js/07-study.js` **바로 앞**에 `"js/85-say.js"` 등록 (없으면 빌드가 "파일은 있는데 parts.json 에 없음"으로 막음)
- **매칭 규칙**: 인라인 코드 텍스트 안의 토큰을 경계 단위로(앞뒤가 영숫자·`·`@`·`.` 이 아니면). 긴 표기 우선.
  그래서 `in`·`by`·`is`·`as` 처럼 짧고 흔한 영단어는 넣지 말 것(에러 메시지 "Caused by" 에도 걸림). `loc` 처럼 점 뒤에 오는 것은 `df.loc` 로.
- 지침서: 1차에 쓴 "say-brief" 요약 — 실제 등장 빈도로 고르고, 120~250개, 한국 현업 발음, 갈리면 둘 다("바라그 / 가변 인자"), 확신 없으면 뺀다.
- 남은 가이드 후보: **csharp**(`async`·`await`·`LINQ`·`=>`·`??=`·`[SerializeField]`·`IEnumerator`) ·
  **cpp**(`std::`·`constexpr`·`noexcept`·`&&`·`->`·`RAII`·`template<typename T>`) · **rust**(`&mut`·`'a`·`impl`·`dyn`·`?`·`unwrap`·`Box`·`Rc`·`Arc`) ·
  **db**(`EXPLAIN`·`COALESCE`·`VACUUM`·`MVCC`·`WAL`) · **server**(`nginx`·`upstream`·`proxy_pass`·`ulimit`·`kubectl`) · **cs**(`O(log n)`·`XOR`·`mutex`·`TCP SYN`)

### 3-c. 언어 비교 화살표 — 공통 (완료)
두 칸 비교(`.vs` · `.grid2`)에서 **두 제목이 서로 다른 언어 이름으로 시작**하면(또는 `.vs` 에서 코드 언어가 다르고 제목 하나가 언어 이름이면)
가운데에 강조색 원 화살표 + "코틀린으로" 같은 말이 자동으로 들어갑니다. 표 머리에 언어 열이 나란하면(자바 | 코틀린) 두 번째 열 제목 앞에 작은 화살표.
→ 새 비교를 쓸 때는 **제목을 "자바 — …" / "코틀린 — …" 처럼 언어 이름으로 시작**하면 됩니다. 지금은 kotlin 기초 탭 11곳 + 표 몇 곳.

### 4. 설명 개선 (그림 다음)
1차 실무 탭처럼 "실무에 바로 투입"되도록 — 각 탭에 운영·장애·리뷰 체크리스트가 없으면 추가, 버전 표기 2026 기준으로 점검.
후보 실무 탭: server 🚑 장애 대응 런북 · db 🩺 운영 DBA 체크리스트 · csharp 🧪 테스트·배포 · cpp/rust 🐞 디버깅·프로파일링.

### 다이어그램 개편 공통 지침 (요약 — 에이전트에게 그대로)
- 먼저 읽기: `.claude/skills/diag/SKILL.md` → `DIAGRAM-STYLE.md` → `DIAGRAM-MODELS.md` → `shared/css/06-diag.css` §7 · `shared/models/*.html`
- 다시 그린 그림은 원래 `.cap` 문장을 그대로 전할 것, 수치는 근거 있는 대표값(그림에 "예시" 명시), aria-label 다시 쓰기
- 흐름 점·점선 흐름은 "무언가 이동한다"가 뜻일 때만. 화살표 끝은 도형 4px 바깥, 박스 글자는 중심, 같은 줄 y·간격 균등
- 위치가 값인 그림(간트·막대)은 `<svg data-align="free">`. 레인 배경은 `class="lane*"`(검사에서 제외됨)
- **흰 글자를 인라인으로 박지 말 것**(`style="fill:#e8f0ff"`) — 라이트 테마에서 inkFix 가 보정하긴 하지만 클래스(`.val` 등)를 쓰는 게 맞다
- 금지: `web/public` 직접 수정 · 동시에 빌드 · shared 파일 수정 · bash heredoc 으로 큰 HTML · `node -e` 로 정규식 수정( 가 0x08 로 박힘)

### 검증 순서
fixcut → svgcheck → diagaudit → dupdiag → integrity → build → verify → smoke →
**브라우저: 두 테마에서 전 탭 switchTab + pane/navset 개수 대조 + 고아 섹션 0 + getBBox OVER/LAP 실측 + 데모 버튼 전부 클릭 오류 0**
+ **라이트 대비**: 전환 애니메이션을 끄고(`*{transition:none!important}`) 본문 글자 대비 3.2 미만, 다이어그램은 `window.lxInkFix(svg)` 후 3 미만을 모은다.
+ **모바일**: 390 · 768 폭 iframe 으로 상단 바 높이(한 줄 ≈ 58px) · 가로 넘침 없음 확인. 창이 가려진 탭에서는 타이머·IO 가 멈추니 기다리는 측정은 피할 것.
+ 푸시 후 `gh run list --workflow deploy-portfolio.yml` 로 **배포 성공까지** 확인.

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


