# 핸드오프 — 언어 가이드 확장 (2026-08-28 11차 갱신)

> **새 세션이라면 여기부터** — §남은 일 1번(브라우저 실측) 또는 2번(C# 엔터프라이즈 3탭)이 다음 작업입니다.
> 집필 지침서와 등록 스크립트는 **저장소에 있습니다**: `web/guide-src/AUTHORING.md` · `web/guide-src/tools/reg.mjs`

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

---

## 🔴 남은 일 — 순서대로 (이어서 하면 됩니다)


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

### 1. 브라우저 실측 — **이제 할 수 있습니다** 🔴

**크롬 MCP 를 이 PC 에 등록해 두었습니다**(2026-08-28):
```bash
claude mcp add chrome-devtools -s user -- npx -y chrome-devtools-mcp@latest
```
`claude mcp list` 에서 `chrome-devtools ✔ Connected` 로 확인됩니다.
**MCP 도구는 세션 시작 때 로드되므로 새 세션에서만 잡힙니다.** 세션을 새로 열면
`mcp__chrome-devtools__*` 도구가 잡힙니다(`ToolSearch` 로 이름 확인 후 사용).

#### 절차
1. **로컬 서버 띄우기** — `web/public` 에서 8899 (§관련 명령어의 한 줄 서버). 백그라운드로 돌리세요.
2. **페이지 열기** — `http://localhost:8899/<가이드>-web/index.html?v=1`
   (재빌드 후에는 **`?v=` 숫자를 반드시 올릴 것** — 안 그러면 옛 파일을 봅니다)
3. **측정 스크립트 실행** — §관련 명령어의 SVG 실측 스크립트를 페이지에서 evaluate.
   결과가 `OVER: none | BOX: none | LAP: none` 이 될 때까지 아래를 반복합니다.
4. **고치기** — 지적된 섹션의 pane 소스(`guide-src/<가이드>/parts/panes/*.html`)에서
   **x 좌표를 옮기지 말고 문구를 줄입니다**(옮기면 LAP 이 새로 생깁니다).
   좌우 316폭 박스에 긴 한 줄이면 두 줄로 쪼개고 박스 높이 52→68.
5. **재빌드 후 재측정** — `npm run build:guide -- <가이드>` → `?v=2` 로 다시 열어 확인.

#### 측정 순서 (미실측이 많은 것부터)
`cpp`(169) → `server`(150) → `js-ts`(146) → `python`(144) → `rust`(142) →
`cs`(133) → `java`(123) → `kotlin`(118) → `db`(114) → `csharp`(100)

한 가이드가 100~170개라 **한 세션에 2~3개 가이드**가 현실적입니다.
끝낸 가이드는 이 문단에 체크로 남기세요 — 예: `- [x] cpp 실측 완료(2026-09-01, 수정 12건)`

- [ ] cpp · [ ] server · [ ] js-ts · [ ] python · [ ] rust
- [ ] cs · [ ] java · [ ] kotlin · [ ] db · [ ] csharp

#### 왜 필요한가
정적 검사(`svgcheck.mjs`)는 글자 폭을 **한글 ×0.95 / ASCII ×0.6 으로 근사**합니다.
전 가이드가 0건을 통과했지만 **±5px 안쪽 차이는 못 잡습니다** — 실제 폰트로 렌더한
`getBBox()` 값과는 다릅니다. 그래서 브라우저 실측이 마지막 관문입니다.
**미실측 누적 = 2차 290 + 3차 224 + 4차 68 + 5차 63 + 6차 90 + 7차 175 + 8차 163 + 9차 88 = 1,161건.**

> 주의: `content-visibility` 때문에 화면 밖 요소는 `getBBox()` 가 0 을 반환합니다.
> 측정 스크립트가 이를 강제로 풀어 주지만, **측정 후에는 페이지를 새로고침**하세요.

### 2. 🔴 C# 엔터프라이즈 서버 3개 탭 (사용자 요청 · 2026-08-28)

> **배경(사용자 원문 요지)** — "Java → C# 으로 갈아탈 생각이 있다. Java 로 치면 Spring 특화 같은 걸
> .NET 으로 하는 내용이 필요하다. 백엔드 서버 · DB · **배치 서버** · **대규모 파일 및 API 통신** ·
> 그리고 **C# 전용 서버 구축 방법**. 자바는 그냥 Nginx/Apache + 톰캣이면 끝인데 C# 은 아예 모른다.
> 아주 자세하고 시각화 모델도 잘 만들어 달라."

**왜 진짜 공백인가** — csharp 가이드의 기존 서버 탭은 전부 **게임 백엔드 관점**입니다:
`net`(게임 서버 소켓·룸·틱), `api`(게임 백엔드 API — 재화/인벤토리 설계, GM 도구),
`scale`(게임 서버 스케일링). **엔터프라이즈 업무 시스템 관점이 통째로 비어 있습니다** —
Spring 대응 개념 지도도, 배치 서버도, 대용량 파일 연계도, IIS/Kestrel/Windows Service 호스팅도 없습니다.

**새 그룹 하나를 만듭니다** — csharp 가이드에 `data-g="5"`,
groupLabel `"엔터프라이즈 · 서버"`, groupIcs `🏢🗂️🖧`,
groupTitle `"엔터프라이즈 백엔드 · 배치·파일·통신 · 서버 구축"`, sheetLabel `"엔터프라이즈"`.
세 탭 모두 이 그룹입니다. 접두사 `e` `f` `h` 는 csharp 가이드에서 미사용임을 확인했습니다
(기존: a c d g k n st t u w z b).

---

#### 탭 ① 🏢 엔터프라이즈 백엔드 — Spring 을 .NET 으로
pane `web/guide-src/csharp/parts/panes/12-ent.html` · 탭 id `ent` · 접두사 `e` (e01~e13) ·
`<span class="no">ENT 01</span>` · cls `en` · grad `["#0284c7","#075985"]` · after `blazor`
meta 파일명 `csharp-ent.meta.json`

**주제** — Spring/JPA 를 아는 사람이 .NET 10 으로 같은 시스템을 짓는 법. 계속 1:1 대조.

1. e01 ★ **Spring ↔ .NET 대응 지도** — @Component/@Autowired↔DI 등록, @Transactional↔TransactionScope/SaveChanges, AOP↔미들웨어·필터·인터셉터, application.yml↔appsettings.json, Actuator↔HealthChecks, Maven/Gradle↔NuGet/csproj, 톰캣↔Kestrel. **큰 대응표 하나 + 개념 지도 그림**
2. e02 ★ **호스팅 모델 · 앱 부팅** — `Program.cs` 최소 호스팅, `WebApplicationBuilder`, 미들웨어 파이프라인이 서블릿 필터 체인과 다른 점(순서가 곧 코드), `IHost` 수명주기, `IHostedService`, 종료 신호 처리
3. e03 ★ **DI 컨테이너 심화** — Singleton/Scoped/Transient 와 Spring scope 대조, captive dependency 함정, 키드 서비스(.NET 8+), `IOptions<T>`·검증, Scrutor 로 어셈블리 스캔(@ComponentScan 대응), 팩토리·데코레이터
4. e04 ★ **계층 아키텍처** — Controller-Service-Repository 를 .NET 으로, 클린 아키텍처 폴더 구조, MediatR 로 CQRS, `Result<T>` 패턴 vs 예외, 도메인 이벤트, 프로젝트 분리(`.csproj` 참조 방향)
5. e05 ★ **EF Core 심화 vs JPA** — ChangeTracker↔영속성 컨텍스트, 지연 로딩 차이, **N+1 진단과 `Include`/Split Query**, `AsNoTracking`, 컴파일 쿼리, 인터셉터(@EntityListeners 대응), 마이그레이션 운영(운영 DB 에 `Update-Database` 를 쓰지 않는 법), 낙관적 동시성(`RowVersion`)
6. e06 ★ **트랜잭션** — `SaveChanges` 단위, 명시적 `BeginTransaction`, `TransactionScope` 와 격리 수준, @Transactional 전파(REQUIRES_NEW 등) 대응 패턴, 분산 트랜잭션이 없는 세계 → **아웃박스 패턴**·보상 트랜잭션, 데드락 재시도
7. e07 **Dapper · 저장 프로시저 · 멀티 DB** — MyBatis 대응으로 Dapper, 복잡 조회는 SQL 로, `SqlBulkCopy`, 저장 프로시저 호출, 멀티 테넌시(DB per tenant vs 스키마 분리), 읽기 전용 복제본 라우팅
8. e08 **검증 · 매핑 · 예외** — FluentValidation↔Bean Validation, DataAnnotations, `ProblemDetails` 표준 에러 응답, 전역 예외 핸들러(`IExceptionHandler`), Mapperly(소스 생성기)↔MapStruct, DTO 설계
9. e09 **설정 · 프로파일 · 시크릿** — `appsettings.{Environment}.json`↔application-{profile}.yml, 환경 변수 이중 밑줄 규약, User Secrets, Azure Key Vault/AWS Secrets Manager, `IOptionsMonitor` 로 런타임 갱신, 설정 검증 실패 시 기동 중단
10. e10 ★ **인증 · 인가 (엔터프라이즈)** — ASP.NET Core Identity, JWT 발급·검증, OIDC/Entra ID(구 Azure AD)·Keycloak 연동, **정책 기반 권한**(`AddPolicy`)↔@PreAuthorize, 다중 인증 스킴, API Key, 사내 AD 통합(Windows 인증·Negotiate)
11. e11 **관측 · 헬스체크** — Serilog 구조화 로그(+싱크), `ILogger` 스코프, OpenTelemetry 계측, `AddHealthChecks`↔Actuator, 메트릭, 상관 관계 ID (서버기술 가이드 🔭 관측 탭과 겹치는 인프라 이야기는 그쪽으로 넘길 것)
12. e12 **테스트** — xUnit, `WebApplicationFactory`↔@SpringBootTest, Testcontainers 로 실제 DB, 인증 우회 핸들러, 데이터 빌더, 통합 테스트 격리(트랜잭션 롤백)
13. e13 ★ **실전 — 사내 결재 시스템 API** 끝까지: 프로젝트 구조 · 도메인 모델 · EF Core 매핑 · 권한 정책 · 결재선 트랜잭션 · 감사 로그 · 통합 테스트 · Docker. 같은 기능의 Spring Boot 코드와 나란히 비교

**시각화 최소 9개** — Spring↔.NET 개념 대응 지도 · 미들웨어 파이프라인 vs 서블릿 필터 체인 ·
DI 수명 3종과 captive dependency · 계층/의존 방향 · ChangeTracker 상태 전이 ·
N+1 발생과 해소 · 트랜잭션 경계와 아웃박스 · 인증/인가 통과 경로 · 테스트 격리 구조

---

#### 탭 ② 🗂️ 배치 · 대용량 파일 · 통신
pane `web/guide-src/csharp/parts/panes/13-batch.html` · 탭 id `batch` · 접두사 `f` (f01~f13) ·
`<span class="no">BATCH 01</span>` · cls `bt` · grad `["#7c3aed","#4c1d95"]` · after `ent`
meta 파일명 `csharp-batch.meta.json`

**주제** — Spring Batch·Quartz 자리에 무엇을 놓는가, 그리고 수백만 건·수 GB 를 다루는 실제 코드.

1. f01 ★ **배치 서버 선택지 지도** — Worker Service vs Hangfire vs Quartz.NET vs Windows 작업 스케줄러 vs 클라우드 함수 비교표, **Spring Batch 대응**은 무엇인가(정답: 직접 구성), 선택 흐름도, 온프레미스 사내 환경 기준 권장
2. f02 ★ **Worker Service 만들기** — `BackgroundService`·`IHostedService`, 수명주기와 graceful stop, `CancellationToken` 전파, Windows Service/systemd 로 등록, **단일 실행 보장**(뮤텍스·DB 락)
3. f03 ★ **스케줄링** — Quartz.NET(크론·미스파이어·잡 스토어 DB), Hangfire(대시보드·재시도·큐·연속 작업), 분산 환경 중복 실행 방지, 시간대(KST/UTC)와 서머타임 함정
4. f04 ★ **청크 처리 패턴 (Spring Batch 대응)** — Reader-Processor-Writer 를 직접 구현, 커밋 단위 설계, **재시작 가능성**(체크포인트 테이블), 실패 건 스킵·재처리 큐, 배치 실행 이력 스키마, 멱등성
5. f05 ★ **대용량 DB 처리** — `SqlBulkCopy`·EFCore.BulkExtensions, 키셋 페이징(OFFSET 이 느린 이유), `ExecuteUpdate/ExecuteDelete`(EF7+), 배치 커밋 단위와 로그 증가, 인덱스 비활성화·재구성, 임시 테이블 활용
6. f06 ★ **대용량 파일 읽기·쓰기** — `StreamReader`/`PipeReader`, CsvHelper 로 수백만 행, 엑셀(ClosedXML·EPPlus 라이선스 주의)과 대용량 시 스트리밍 방식, 고정폭 레코드, **한글 인코딩(EUC-KR/CP949)** 과 BOM, 메모리 사용량 실측·`ArrayPool`
7. f07 ★ **파일 업로드 · 다운로드** — 멀티파트 버퍼링을 피하는 스트리밍 업로드(`DisableFormValueModelBinding`·`MultipartReader`), 크기 제한 3곳(Kestrel·IIS·앱), **청크 업로드와 이어받기(Range)**, 대용량 다운로드 스트리밍, 저장소(로컬·S3·Azure Blob) 추상화, 바이러스 검사 연계, 임시 파일 정리
8. f08 **파일 연계 · EAI** — FTP/SFTP(SSH.NET), `FileSystemWatcher` 의 함정(누락·중복·잠김)과 폴링 대안, **원자적 이동**(임시 확장자 → rename), 인터페이스 파일 규약(헤더·트레일러·건수 검증), 재전송·중복 방지, 배치 인터페이스 설계 문서화
9. f09 ★ **HTTP 클라이언트 · 외부 API** — `IHttpClientFactory`(소켓 고갈·DNS 문제), Polly 재시도·서킷 브레이커·타임아웃·벌크헤드, Refit 로 인터페이스 선언, 대용량 응답 스트리밍(`HttpCompletionOption`), 인증서·프록시·mTLS, 레이트 리밋 대응
10. f10 ★ **gRPC · 메시징** — gRPC 서버/클라이언트와 스트리밍(서버 간 대량 전송), RabbitMQ·Kafka + MassTransit, **아웃박스와 멱등 소비**, DLQ 재처리, Spring 의 @KafkaListener 대응
11. f11 ★ **병렬 파이프라인** — `System.Threading.Channels` 생산자-소비자, 백프레셔(BoundedChannel), `Parallel.ForEachAsync` 병렬도 제어, `IAsyncEnumerable` 스트리밍, CPU/IO 바운드 구분, 실측 튜닝
12. f12 **배치 운영** — 실행 로그·알림(실패 시 메일/슬랙), 재처리 관리 화면, 실행 이력 대시보드, 야간 배치 창(window) 설계와 SLA, 성능 측정, 운영 이관 체크리스트
13. f13 ★ **실전 — 일별 정산 배치 + 대용량 파일 연계** 끝까지: SFTP 로 3GB 거래 파일 수신 → 검증 → 청크 처리(체크포인트) → 벌크 적재 → 집계 → 결과 파일 생성·송신 → 실패 재처리. 전체 코드·성능 수치·운영 절차

**시각화 최소 9개** — 배치 선택 흐름도 · Worker 수명주기 · 스케줄러 중복 실행 방지 ·
청크 처리 루프와 체크포인트 · 스트리밍 vs 전체 로드 메모리 곡선 · 청크 업로드/이어받기 ·
파일 연계 원자적 이동 · HttpClientFactory 핸들러 수명 · Channels 백프레셔 · 정산 배치 전체 흐름

---

#### 탭 ③ 🖧 C# 서버 구축 · 호스팅 · 배포
pane `web/guide-src/csharp/parts/panes/14-host.html` · 탭 id `host` · 접두사 `h` (h01~h14) ·
`<span class="no">HOST 01</span>` · cls `hs` · grad `["#0f766e","#134e4a"]` · after `batch`
meta 파일명 `csharp-host.meta.json`

**주제** — **"자바는 Nginx/Apache + 톰캣이면 끝인데 C# 은 무엇을 깔아야 하나"** 에 정면으로 답합니다.
Windows(IIS) 와 Linux(systemd+Nginx) 두 갈래를 모두 끝까지.

1. h01 ★ **톰캣이 없는 세상 — .NET 호스팅 지도** — 자바 1:1 대응표(톰캣↔**Kestrel(앱에 내장)**, WAR 배포↔publish 폴더, Nginx/Apache↔여전히 리버스 프록시, IIS↔Windows 전용 프론트, 서블릿 컨테이너 개념이 왜 사라졌나), 배포 형태 결정 흐름도
2. h02 ★ **Kestrel 파고들기** — 엔드포인트·포트·유닉스 소켓, HTTP/1.1·2·3 켜기, 커넥션/요청 제한, 요청 본문 크기, 타임아웃(KeepAlive·RequestHeaders), 스레드풀과 비동기 모델, 단독 노출해도 되는가에 대한 실무 답
3. h03 ★ **Windows ① IIS 에 올리기** — ASP.NET Core Hosting Bundle 설치, **ASP.NET Core Module(ANCM)** 이 하는 일, in-process vs out-of-process, 앱 풀(ID·유휴 타임아웃·재활용) 설정, `web.config`, 사이트/바인딩 만들기, 폴더 권한(`IIS AppPool\<이름>`), 배포 절차 화면 단계별
4. h04 ★ **Windows ② Windows Service** — `AddWindowsService()`, `sc.exe create`, 실행 계정·자동 시작·복구 옵션, 이벤트 로그, IIS 없이 서비스로 띄우는 경우(내부 API·배치 서버), 방화벽 인바운드
5. h05 ★ **Linux 에 올리기** — 런타임 설치, publish 결과 배치, **systemd 유닛 파일 전문**(User·WorkingDirectory·Restart·Environment), `journalctl` 로그, 권한·SELinux, 배포 스크립트, 파일 디스크립터 한계
6. h06 ★ **리버스 프록시** — Nginx 설정 전문(proxy_pass·헤더·타임아웃·버퍼·WebSocket 업그레이드), IIS ARR, **`ForwardedHeaders` 미들웨어를 반드시 켜야 하는 이유**(실제 IP·스킴), 정적 파일은 누가 서빙하나, 압축·캐시 헤더
7. h07 **YARP — C# 으로 만드는 게이트웨이** — 라우트·클러스터 설정, 경로 재작성·헤더 변환, 로드밸런싱 정책·헬스체크, 인증 통합, Spring Cloud Gateway 대응, 언제 Nginx 대신 YARP 인가
8. h08 ★ **HTTPS · 인증서** — 개발 인증서(`dotnet dev-certs`), Windows 인증서 저장소와 IIS 바인딩, PFX 파일과 Kestrel 설정, Let's Encrypt(certbot·win-acme) 자동 갱신, **사내 CA·자체 서명** 배포, TLS 종료 지점 결정, HSTS
9. h09 ★ **게시(publish) 옵션** — framework-dependent vs **self-contained**(런타임 설치 불필요), `--runtime win-x64/linux-x64`, single-file, ReadyToRun, **NativeAOT**, 트리밍 주의, 각 조합의 크기·시작 시간·제약 비교표, 어떤 걸 고를 것인가
10. h10 ★ **무중단 배포** — IIS 앱 풀 오버랩 재활용·`app_offline.htm`, systemd 재시작 중 커넥션 처리, 블루그린·롤링(로드밸런서 뒤 2대), 헬스 체크 연동, 마이그레이션과 배포 순서(하위 호환 스키마), 롤백 절차
11. h11 **컨테이너로 올리기** — 멀티스테이지 Dockerfile, `mcr.microsoft.com/dotnet/aspnet` 태그 고르기(chiseled·alpine), 비루트 사용자, **컨테이너 메모리 제한과 GC**, 환경 변수 설정 주입, 이미지 크기 줄이기
12. h12 ★ **성능 튜닝** — 서버 GC vs 워크스테이션 GC(언제 바꾸나), TieredPGO, ThreadPool 최소 스레드, 커넥션 풀(DB·HTTP), 응답 압축·출력 캐싱, 부하 테스트(bombardier·k6), `dotnet-counters`/`dotnet-trace`/`dotnet-dump` 로 병목 찾기
13. h13 ★ **운영 · 문제 해결 사전** — 502.5/500.30(ANCM 시작 실패), 504 타임아웃, 포트 점유(`netstat`·`ss`), 권한 거부, 인증서 신뢰 실패, 메모리 누수 진단(덤프 분석), 높은 CPU, 한글 로그 깨짐, **증상 → 원인 → 해결 표 20행 이상** + 진단 흐름도
14. h14 ★ **실전 — 사내 서버에 올리기 처음부터 끝까지** (A) Windows Server + IIS 버전 · (B) Ubuntu + Nginx + systemd 버전 두 벌. 방화벽·도메인·인증서·배포 스크립트·모니터링·백업까지 체크리스트로

**시각화 최소 10개** — 자바 톰캣 구조 vs .NET Kestrel 구조 대조 · 요청이 Nginx→Kestrel→앱 으로 가는 경로 ·
IIS ANCM in-process/out-of-process 비교 · Windows Service 등록 구조 · systemd 유닛 관계 ·
ForwardedHeaders 없을 때 IP 가 사라지는 그림 · YARP 라우팅 · publish 옵션 4종 비교(크기·시작시간) ·
무중단 배포 시간축 · GC 모드별 힙 · 진단 도구 선택 흐름 · 문제 진단 사다리

---

**세 탭 공통 주의**
- 기존 `api`(w01~w14)·`scale`(k01~k12)·`net`(n01~n15)·`tool`(t01~t12)·`deep` 을 **먼저 읽고**
  겹치는 곳은 `(🔷 w03 참고)` 형식으로 넘길 것. 특히 api 탭의 EF Core 기초·JWT·Docker 배포,
  tool 탭의 Serilog·Polly/Refit·xUnit·Testcontainers·CI/CD 와 중복 주의.
- 기존 서버 탭들이 **게임 관점**이라는 점을 활용해, 이 세 탭은 **업무 시스템 관점**으로 각도를 틀 것.
- 2026 기준: **.NET 10 LTS · C# 14 · EF Core 10 · Visual Studio 2026**.
- Java/Spring 대조를 **모든 섹션에서** 유지 — 사용자가 자바 개발자입니다.

**등록 후 할 일** — 새 그룹 5 는 reg.mjs 가 첫 탭 등록 때 만들어 줍니다.
세 탭을 `ent` → `batch` → `host` **순서대로** 등록하세요(after 가 앞 탭을 참조합니다).
등록 뒤 `csharp` 의 head description·router desc/tags/stats 를 갱신하고,
소개 문구에 "엔터프라이즈 백엔드"를 추가하세요.

### 3. 기술 스택 — 그 밖의 공백은 다 메웠습니다
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

### 4. 매 작업 마무리 체크리스트 (커밋 전 필수)
```bash
cd D:/gibis/workTool/astro/black-astro/web
npm run verify:guide                             # ① 빌드 + 정합성 (열 가이드 전부 ✓ 여야)
node guide-src/tools/svgcheck.mjs guide-src/<가이드>/parts/panes   # ② 넘침·겹침 0건
node guide-src/tools/integrity.mjs               # ③ NUL·미이스케이프 (인자 없으면 전체)
node guide-src/tools/smoke.mjs public/<가이드>-web/index.html      # ④ 탭 정합성
npx vue-tsc -b                                   # ⑤ router 고쳤으면
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

## 다이어그램 현황 — 총 1,439개
| 가이드 | 개수 | | 가이드 | 개수 |
|---|---|---|---|---|
| cpp | 169 | | **server** | **150** |
| **js-ts** | **146** | | python | 144 |
| rust | 142 | | **cs** | **133** |
| java | 123 | | kotlin | 118 |
| **db** | **114** | | **csharp** | **100** |

**모든 가이드의 모든 탭이 7개 이상**입니다.

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
