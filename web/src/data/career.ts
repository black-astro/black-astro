// 경력 연혁 · 프로젝트 상세 — 경력기술서 기반

export interface TimelineEntry {
  period: string
  title: string
  role: string
  highlight?: boolean
}

export const timeline: TimelineEntry[] = [
  { period: '2021 ~ 2022', title: '농정원 직불금 전자고지(NJW) · 관리자 콘솔 1세대(JSP)', role: '신입 — 발송 배치·열람 페이지 개발' },
  { period: '2022 ~ 재직 중', title: 'GibisbizCenter 통합 백엔드 (주력)', role: '백엔드 설계·개발·운영 · 콘솔 Vue2→Vue3 전환', highlight: true },
  { period: '2023 ~ 운영 중', title: '카카오 전자문서 발송·열람·유통증명 서버군', role: '주 개발자 — 설계·개발·운영' },
  { period: '2024 ~ 2025', title: 'G-HUB Electron 데스크톱 전환 (풀스택)', role: '클라이언트 개발 + 인증 계약 설계' },
  { period: '2024 ~ 운영 중', title: 'PASS 전자고지 발송·구축 서버', role: '주 개발자 — 설계·개발·운영' },
  { period: '2025.03 ~ 운영 중', title: 'iM라이프 공인알림문자 발송 엔진', role: '인수·재구축 주도 (주 개발자)' },
  { period: '2025 ~ 2026', title: 'KT_BatchServer 대용량 ETL 재구축', role: '핵심 설계·개발·성능 개선', highlight: true },
  { period: '상시 (병행)', title: '사내 CI/CD 인프라 · 리버스 터널 재구현 · 폐쇄망 자동화', role: '단독 구축·운영' },
]

export interface ProjectSection {
  heading: string
  points: string[]
}

export interface CareerProject {
  id: string
  index: number
  title: string
  subtitle: string
  period: string
  role: string
  stack: string[]
  featured: boolean
  overview: string[]
  sections: ProjectSection[]
  outcome: string
}

export const projects: CareerProject[] = [
  {
    id: 'kt-batch',
    index: 1,
    title: 'KT_BatchServer',
    subtitle: 'KT 청구서 원천 대용량 ETL 배치 (델파이 레거시 재구축)',
    period: '약 12개월 · 2025 ~ 2026',
    role: '백엔드 핵심 설계·개발·운영 (파싱·적재 아키텍처, DB 튜닝, 성능 개선)',
    stack: ['Java 21', 'Spring Boot 3.4', 'Tibero 6', 'MyBatis(BATCH)', 'StAX/JAXB', 'Spring Integration SFTP', 'Jenkins'],
    featured: true,
    overview: [
      'KT로부터 매월 수신되는 청구서 원천(텍스트 .snd / XML)을 파싱·검증·중복제거 후 Tibero에 적재하고, MMS·공공알림문자·카카오 채널별 발송 데이터로 가공하는 배치 서버.',
      '원래 델파이 프로그램이 종일 처리하던 업무로, 1차 Java 전환(2022)을 거쳐 Java 21 기반 성능 재설계 버전으로 재구축. 안내문 코드별 규모가 달라(01001 텍스트 약 400만 / 01002 XML 약 10만 / 01003 XML 약 100만 건 — 01003은 디테일 분해로 DB INSERT 약 1,000만 row) 코드별 파싱·적재 전략을 분리 설계.',
    ],
    sections: [
      {
        heading: '데이터 규모별 파싱 전략 분리 (OOM 해결)',
        points: [
          '문제 — 대규모 XML(1GB+)을 JAXB로 통째 객체화하다 OutOfMemoryError 빈발.',
          '해결 — 01001(텍스트, BufferedReader 10만 라인 flush) / 01002(중규모, JAXB) / 01003(대규모, StAX 스트리밍 상태머신)으로 분기. StAX는 BILLINFO 단위로 DTO 생성 → 즉시 배치 INSERT → 버퍼 해제 순으로 힙 점유 억제.',
          '결과 — 1GB급 XML을 수십 MB 힙 안에서 처리, 운영 OOM 0건. 01002는 수신~적재 전 구간 약 10분 내 완료(운영 로그 기준).',
        ],
      },
      {
        heading: '파서 풀 + 단일 라이터 파이프라인 (커밋 경합 제거)',
        points: [
          '문제 — 파일 병렬 처리 시 다수 스레드가 동시에 INSERT/commit 하면 DB 커밋·redo 경합으로 오히려 느려짐.',
          '해결 — 파싱(CPU)은 고정 스레드 풀 N개로 병렬화, DB 쓰기는 ArrayBlockingQueue를 거쳐 단일 라이터 스레드로 직렬화하는 producer-consumer 구조. 큐 상한 backpressure, poison pill 종료 전파, AtomicReference<Throwable>로 큐 드레인해 생산자 데드락 방지.',
          '결과 — 병렬 파싱 처리량과 단일 커밋 스트림 안정성을 동시에 확보.',
        ],
      },
      {
        heading: '대량 INSERT 성능 개선 (50분 → 25분)',
        points: [
          '인덱스 UNUSABLE → ExecutorType.BATCH 2,000건 청크 적재 → 인덱스 REBUILD + DBMS_STATS 통계 갱신 순으로 재설계.',
          '대량 구간에는 direct-path INSERT(/*+ APPEND_VALUES */)를 스위치로 분기 적용.',
          '결과 — 데이터 INSERT 50분 → 25분 (약 50% 단축, 실측).',
        ],
      },
      {
        heading: '중복제거 프로시저 재설계 (5시간 → 2시간)',
        points: [
          '문제 — 커서 루프로 그룹당 5개 SQL을 행 단위 실행(호출 폭증) + 회차마다 처리 완료 행까지 재스캔(quadratic). Tibero 2시간 세션 강제종료 정책에 걸려 장시간 단일 호출 불가.',
          '해결 — 프로시저를 집합 기반(배치당 MERGE 2문장)으로 재설계, 콜당 1만 그룹 분할 + 청크 커밋 + Java 측 반복 호출로 2시간 제약 우회. 중단 시 이어서 재개되는 복구 스크립트 작성. 복합인덱스에서 처리 상태 컬럼(PROC_STATUS)을 선두로 이동해 완료 행이 스캔 범위에서 빠지도록 재설계.',
          '결과 — 5시간 → 2시간 (약 60% 단축, 실측). 회차가 늘어도 처리 시간이 평탄하게 유지.',
        ],
      },
      {
        heading: '운영 안정성 / 보안',
        points: [
          '중복제거 루프 maxLoop(500) + 직전 건수 감소 검증으로 정체 시 fail-fast, 메모리 80% 임계 WARN, flush 소요시간 통계.',
          'XMLInputFactory 외부 엔티티·DTD 차단으로 XXE 방어. SFTP 병렬 전송 + 파일별 ReentrantLock으로 중복 처리 차단.',
          'SERVER_NO(1~5) 분산 스케줄러(10초 워커 5 + 30초 워커 2)로 단일 스케줄러 병목 제거.',
        ],
      },
    ],
    outcome:
      'INSERT 50분 → 25분, 프로시저 5시간 → 2시간 (운영 실측). 회차당 DB INSERT 약 1,000만 row 처리, 대용량 XML OOM 0건(운영 로그 기준).',
  },
  {
    id: 'gibisbiz',
    index: 2,
    title: 'GibisbizCenter',
    subtitle: '다채널 발송·인증·모니터링 통합 백엔드 (주력, 4년)',
    period: '약 4년 · 2022 ~ 재직 중',
    role: '백엔드 설계·개발·운영 (인증·인가 재설계, 멀티 DataSource, 캐시 전략, 클라이언트 3세대 전환)',
    stack: ['Java 8', 'Spring Boot 2.7', 'Spring Security(OAuth2)', 'jjwt', 'MyBatis', 'Oracle/Tibero', 'Caffeine', 'WebSocket(STOMP)'],
    featured: true,
    overview: [
      'SMS·MMS·카카오·공지 등 다채널 발송을 단일 어드민에서 예약·즉시·대량 발송하고, 발송 결과·유통·스케줄러 상태를 모니터링하는 통합 플랫폼. 4년간 주력으로 담당.',
      '관리자 콘솔을 JSP(AdminLTE) → Vue2(vue-cli·Vuex) → Vue3(Vite·Pinia·Vuetify, 컴포넌트 98개) 3세대에 걸쳐 전환·재구축했고, 운영 권한 분리 요구로 Electron 데스크톱까지 확장. 외부 파트너와는 OpenAPI(Bearer JWT)로 연동.',
    ],
    sections: [
      {
        heading: '멀티 SecurityFilterChain — 단일 백엔드, 3종 클라이언트',
        points: [
          '문제 — 단일 필터체인에서 URL prefix별 인증 정책 충돌, 토큰 역할 모호로 운영 권한 분리 곤란.',
          '해결 — @Order + antMatcher로 SecurityFilterChain 3종(/api 외부 OpenAPI / /electron 데스크톱 / 그 외 Vue3 어드민)을 분리. 각 체인은 STATELESS + 전용 JwtAuthenticationConverter + 독립 인가 정책.',
          '결과 — 클라이언트별 토큰 수명·인가·예외 정책 독립 운영(OpenAPI 30일 / Electron Access 5분·Refresh 8시간). 변경 영향 범위를 코드로 추적.',
        ],
      },
      {
        heading: 'JWT 발급/검증 분리',
        points: [
          'JwtTokenProvider / OpenApiTokenProvider로 발급 책임 분리, HS256 서명키를 부팅 시 1회 생성·캐싱해 요청마다 키 생성 비용 제거.',
          'type 클레임 검증으로 토큰 오용 차단, Clock Skew 10초 허용으로 분산 환경 시간차 401 방지. Access Token에 권한을 실어 프론트 GET /me 왕복 제거.',
        ],
      },
      {
        heading: 'Redis → Caffeine 캐시 전환 (인프라 제약 하 의사결정)',
        points: [
          '문제 — 모니터링 데이터 캐시로 Redis를 도입·검증하던 단계에서, 운영 Windows 서버가 구형 Redis 3.0(공식 지원 종료)까지만 구동 가능한 제약 확인.',
          '해결 — 단일 WAS 배포 환경임을 근거로 Spring Cache 추상화 + Caffeine 로컬 캐시로 결정. @Cacheable 6종/@CachePut 6종 분리, 기동 시 예열 + 9분 주기 선제 갱신(TTL 30분 대비)으로 cache stampede를 구조적으로 차단.',
          '결과 — 인프라 제약을 수용하면서 캐시 계층은 추상화 뒤에 격리 — Redis 재도입 시 CacheManager 교체만으로 복귀 가능한 구조.',
        ],
      },
      {
        heading: '멀티 DataSource(DB1~DB4) 분리 설계',
        points: [
          '@MapperScan을 DAO 패키지(dao.db1~db4)에 매칭해 DataSource–Mapper–SqlSessionFactory–TransactionManager를 4세트로 명시 분리.',
          '@Primary는 DB1에만 부여하고 HikariCP 풀을 도메인별로 분리. @Around AOP 로깅 + @RestControllerAdvice로 예외 표준화.',
        ],
      },
    ],
    outcome:
      '단일 백엔드에서 3종 클라이언트의 인증·트랜잭션·예외를 명시 분리해 운영 변경 영향 범위를 구조적으로 좁힘. 콘솔 3세대(JSP→Vue2→Vue3) 전환과 SPA→데스크톱 전환을 서버 측에서 흡수해 무중단 완료.',
  },
  {
    id: 'pass',
    index: 3,
    title: 'PASS 전자고지',
    subtitle: 'PassApiServer / PassBuildServer (SKT PASS지갑 연동)',
    period: '집중 개발 약 12개월 · 2024 ~ 운영 중',
    role: '주 개발자 — 설계·개발·운영 (구축/발송 분리, 분산 스케줄러, 암호화, CI 파이프라인)',
    stack: ['Java 21', 'Spring Boot 3.4', 'MyBatis(BATCH)', 'Tibero 6', 'Log4j2(Disruptor)', 'Jasypt', 'Jenkins', 'SonarQube'],
    featured: false,
    overview: [
      'KT PASS 공인알림문자 시스템에서 SKT PASS지갑으로 전자고지 PUSH를 발송하는 파이프라인. SKT 공식 연동 규격(PASS지갑 IF정의서 v1.9) 기반으로 단건/벌크(BULK) 발송과 결과 회수를 구현.',
      '국세청·건보공단·국민연금공단·외교부 등 공공기관 안내문이 대상이며, 일 발송 리미트 180만 건 체계로 대량 발송 흐름을 통제. 데이터 구축 전용 서버(PassBuildServer)와 발송·결과 서버(PassApiServer)를 분리 설계.',
    ],
    sections: [
      {
        heading: 'ThreadPoolTaskScheduler N-스레드 분산 발송',
        points: [
          '도메인(send/result)·환경(prod/test)별 스케줄러를 분리하고 IntStream.rangeClosed로 워커 등록(MOD(SERVER_NO-1, N)+1 분담). 워커 시작 시각을 서버 번호만큼 지연(stagger)해 동시 폭주 평탄화.',
          '@PreDestroy에서 ScheduledFuture 일괄 cancel(true)로 종료 시 스레드 누수·중복 발송 차단.',
        ],
      },
      {
        heading: '발송 상태머신 + 운영/테스트 이중계',
        points: [
          'MASTER의 TRANS_GBN을 7단계 상태머신(구축→발송→결과)으로 관리, BULK/SINGLE을 PUSH_TYPE으로 이원화.',
          '운영/테스트 스키마를 매퍼 쌍으로 분리하고 DB 스위치(SwitchCode)로 런타임 ON/OFF — 운영 중 검증 환경을 무중단 분리.',
        ],
      },
      {
        heading: '정밀 예외 분기 / 로깅 / 암호화',
        points: [
          '외부 호출 예외를 4xx/5xx / 타임아웃 / 일반으로 분리해 504·500 구분 응답. 잔여 DETAIL이 0일 때만 MASTER 승격(멱등).',
          'Log4j2 + LMAX Disruptor 비동기 로깅(RollingFile 100MB·180일). 민감 컬럼(CI)은 발송 시점 AES 암호화 + Jasypt yml 평문 제거, 키 검증 실패 시 부팅 차단.',
        ],
      },
      {
        heading: '빌드 · 품질 자동화',
        points: [
          'Jenkins Declarative Pipeline: Checkout → Unit → Integration → SonarQube → Quality Gate(실패 시 중단) → BootWar.',
          'JaCoCo 리포트 연동, CycloneDX SBOM·License Report를 빌드 산출물로 자동 생성해 감사 자료를 수작업 없이 제공.',
        ],
      },
    ],
    outcome:
      '공공기관 전자고지 PUSH 발송 체계를 구축/발송 분리 아키텍처로 운영 — 발송-결과 대사 기준 중복 발송 0건. SonarQube Quality Gate가 코드 품질을 강제하는 파이프라인 확립.',
  },
  {
    id: 'kakao',
    index: 4,
    title: '카카오 전자문서 서버군',
    subtitle: '발송·결과·열람 인증·유통증명',
    period: '2023 ~ 운영 중',
    role: '주 개발자 — 설계·개발·운영 (외부 API 연동, 발송 파이프라인, 열람 인증, 장애 대응)',
    stack: ['Java 21', 'Spring Boot 3.3/3.4', 'Spring 6 RestClient', 'MyBatis', 'Tibero 6', 'jakarta.validation'],
    featured: true,
    overview: [
      'KT 모바일 전자고지의 카카오 채널 전담 백엔드 3종. 수신자는 카카오톡 알림 메시지로 안내를 받고, 링크 접근 시 토큰 인증 후 안내문을 열람.',
      'KakaoApiServer(벌크 발송·결과 폴링·정산) / KakaoApi_mybatis(열람 인증 API, 카카오 규격 3.4·3.5) / KakaoCertEnjin(유통증명서 PDF 자동 수집 배치)로 구성.',
    ],
    sections: [
      {
        heading: '발송 상태머신 + 다중 스케줄러 race 차단',
        points: [
          '문제 — 다중 스케줄러가 동일 행을 중복 처리할 위험.',
          '해결 — MASTER의 TRANS_GBN을 N→B→P→S 상태머신으로 사용, 상태 전이를 UPDATE ... WHERE TRANS_GBN=\'N\' 조건부 UPDATE(compare-and-set)로 처리해 별도 락 없이 DB 원자성만으로 한 워커만 성공. MOD(SERVER_NO, N) 분담, 도메인별 fixedDelay 차등, Switch 테이블로 무중단 ON/OFF.',
          '결과 — 다중 스케줄러 환경에서 중복 발송 0건 유지.',
        ],
      },
      {
        heading: '열람 인증 API + 지연 열람 처리',
        points: [
          '수신자가 카카오 링크로 열람 페이지 접근 시 호출되는 토큰 유효성검증(규격 3.4)·문서 열람처리(규격 3.5) REST API 구현. 계약 UUID 기반 카카오 본사/카카오페이 계약 이원 분기.',
          '15초 주기 지연 열람처리 스케줄러 + BlockingQueue 비동기 호출로 사용자 응답 경로에서 외부 API 지연을 분리.',
          '사전문자 3시간 / 본문자 24시간 미수신 건을 자동 실패처리(TIMEOUT_3H/24H)해 결과 대사 누락 차단.',
        ],
      },
      {
        heading: '운영 사고 — SRC_KEY 공백 매칭 (대표 트러블슈팅)',
        points: [
          '증상 — 카카오 결과 콜백이 "발송데이터 미존재"로 떨어져 RESULT가 미처리로 적재.',
          '원인 — SRC_KEY 양끝 공백이 카카오 측 trim 처리와 자사 값 사이에서 비매칭됨을 SQL 분석으로 식별.',
          '해결 — 복구 SQL로 기존 데이터 재처리 유도, 조회 SQL에 TRIM(SRC_KEY) 명시. 재현 절차·영향 범위·복구 SQL을 README에 문서화.',
          '결과 — 이후 결과 대사 기준 동일 사고 재발 0건. "증상→원인→복구→재발 방지" 조직 지식으로 남김.',
        ],
      },
    ],
    outcome:
      '락 없는 상태머신 설계로 중복 처리 0건. 발송→열람 인증→유통증명까지 카카오 채널 전 구간을 담당하고, 사고 대응을 재발 방지 문서로 체계화.',
  },
  {
    id: 'imlife',
    index: 5,
    title: 'iM라이프 공인알림문자 발송 엔진',
    subtitle: '전임 시스템 인수·재구축',
    period: '2025.03 ~ 운영 중',
    role: '인수·재구축 주도, 주 개발자 (WBS·저장소 등록·핵심 파이프라인. 유통증명 구간 단독)',
    stack: ['Java 21', 'Spring Boot 3.2', 'MyBatis', 'Oracle', 'Spring AOP', 'Apache HttpClient5'],
    featured: false,
    overview: [
      '보험사(iM라이프) 공인알림문자 발송 엔진. 전임자의 기존 시스템을 인수해 iM라이프 전용으로 재구축 — 신규 저장소 등록부터 WBS 수립, 핵심 발송 파이프라인 개발을 주도.',
      '기초데이터 구축 → SHA-256 해시 생성 → KT Open API 발송 → 결과 수신 → 유통증명서(PDF) 발급·저장까지 5개 스케줄러 파이프라인으로 처리.',
    ],
    sections: [
      {
        heading: '상태머신 파이프라인',
        points: [
          'DB 상태 테이블 기반 발송 단계별(구축·승인·발송·결과·열람) 진행 상태 추적. BuildScheduler(10초) → SendScheduler(30초) → ResultScheduler(60초) → CertScheduler 폴링 체인.',
          'DB 스위치 테이블로 스케줄러별 무중단 ON/OFF, SEND_SEQ 홀수/짝수 분할 스케줄링으로 처리량 분산.',
        ],
      },
      {
        heading: '장애 격리 / 데이터 정합성 / 외부 연동',
        points: [
          '발송 전 KT API ping 헬스체크로 외부 장애 시 조기 반환(early return) 안전 종료.',
          'SRC_KEY 중복 검증으로 정합성 보장·오류 데이터 자동 마킹, @Transactional(rollbackFor) 롤백 정책 + AOP 커스텀 어노테이션 공통 로깅.',
          '기관별 KT Open API Bearer 토큰을 DB로 관리해 인증 헤더 구성, Apache HttpClient5 커넥션 풀(라우트당 50) 기반 타임아웃 정책 수립.',
        ],
      },
    ],
    outcome:
      '인수 시스템을 보험사 전용 발송 엔진으로 재구축해 운영 이관 완료 — 구축~유통증명 전 구간을 스케줄러 파이프라인으로 무인 처리.',
  },
  {
    id: 'ghub',
    index: 6,
    title: 'G-HUB / simple-cs',
    subtitle: 'Electron · Vue3 운영 어드민 데스크톱 (풀스택)',
    period: '약 12개월 · 2024 ~ 2025',
    role: '데스크톱 클라이언트 개발 + 백엔드 인증 계약 설계 (풀스택)',
    stack: ['Electron', 'electron-vite', 'Vue 3', 'Vuetify', 'Pinia', 'TypeScript', 'better-sqlite3', 'STOMP', 'electron-updater', 'NSIS', 'Playwright'],
    featured: false,
    overview: [
      'GibisbizCenter 백엔드 전환의 클라이언트 결과물. 발송/스위치/PASS/공지/유통/정산/권한 관리를 단일 데스크톱 앱에서 처리.',
    ],
    sections: [
      {
        heading: '이중 백엔드 토큰 핸드오프',
        points: [
          'KT JWT 획득 → GIBIS에 Bearer 제출 → GIBIS JWT 발급의 핸드오프 로그인 구현.',
          '토큰 자동 갱신 시 동시 요청이 겹쳐도 refresh가 1회만 실행되도록 공유 promise로 직렬화, 401/403을 SESSION_EXPIRED로 표준화. refresh token은 인메모리로만 보관해 세션 정책(8시간) 강제.',
        ],
      },
      {
        heading: 'IPC 아키텍처 / 로컬 DB 격리',
        points: [
          'contextBridge로 window.api만 노출하고 IPC 핸들러 24종(채널 120+)을 중앙 등록.',
          'better-sqlite3는 Worker Thread 전용 접근(WAL, busy_timeout)으로 메인 프로세스 블로킹 차단. STOMP 실시간 수신, node-cron 헬스체크·토큰 선제 갱신.',
        ],
      },
      {
        heading: '보안 / 배포 / 품질',
        points: [
          'contextIsolation 활성·nodeIntegration 비활성, 외부 링크는 시스템 브라우저 강제, 운영 빌드 DevTools 차단.',
          'electron-updater + electron-builder(NSIS, perMachine, 한국어)로 자동 업데이트·설치본 구성. Playwright E2E(로그인·화면·서브탭 3종)로 화면 회귀 자동 검증.',
          'simple-cs는 MAC 주소 + bcrypt 라이선스 검증, Worker 스레드 스케줄러, winston 로깅으로 별도 구성.',
        ],
      },
    ],
    outcome:
      '백엔드 인증 계약(토큰 수명·갱신·만료)을 클라이언트 끝단까지 일관 구현해 서버-클라이언트 계약 불일치로 인한 운영 이슈를 차단.',
  },
  {
    id: 'monitoring',
    index: 7,
    title: 'GibisMonitoring',
    subtitle: '상담·업무 현황 실시간 모니터링 백엔드',
    period: '약 6개월',
    role: '백엔드 설계·개발 (도메인 모델링, 동적 조회, 실시간 연동, 테스트)',
    stack: ['Java 21', 'Spring Boot 3.x', 'Spring Data JPA + QueryDSL 5.0', 'MyBatis', 'MariaDB/Tibero', 'WebSocket', 'JUnit5'],
    featured: false,
    overview: [
      '동적 검색 조건이 많은 상담·업무 현황을 실시간으로 조회·전송하는 모니터링 백엔드. JPA + QueryDSL 중심에 MyBatis를 혼용.',
    ],
    sections: [
      {
        heading: 'JPA + QueryDSL 동적 조회 · 테스트 관행 도입',
        points: [
          '동적 조회를 JPAQueryFactory 기반 커스텀 리포지토리(*DSLImpl)로 타입 안전하게 구성, 정형 쿼리는 MyBatis 혼용 — 조회 특성별 도구 선택.',
          'WebSocket 실시간 채널에 인증 인터셉터(ChannelWebSocketAuthInterceptor)를 붙여 비인가 구독 차단. MariaDB + Tibero 이기종 멀티 DataSource 분리.',
          '메뉴 계층·권한 로직에 Mockito(@Mock/@InjectMocks)·AssertJ 단위 테스트 작성 — MyBatis 중심 조직에 테스트 관행을 도입.',
        ],
      },
    ],
    outcome: 'MyBatis 편중 조직에 JPA·QueryDSL 동적 조회와 단위 테스트 관행을 함께 도입한 사례.',
  },
]

// 사내 인프라 — CI/CD, 리버스 터널, 폐쇄망 자동화
export interface InfraItem {
  title: string
  desc: string
}

export const infra: InfraItem[] = [
  {
    title: 'CI/CD 단독 구축',
    desc: 'VMware에 OS 설치부터 시작해 Docker 위에 Gitea(형상)·Jenkins(CI)·SonarQube(정적분석)·PostgreSQL·Nginx(리버스 프록시)를 단독 구축. push → 빌드 → 테스트(JaCoCo) → SonarQube → Quality Gate → WAR/JAR + CycloneDX SBOM 파이프라인을 전 프로젝트에 적용.',
  },
  {
    title: '리버스 터널 재구현 (ShadowPort)',
    desc: '내부망 WAS에 인바운드 포트를 열지 않고 외부와 통신하는 사내 구형 터널(Java 1.4, 블로킹 IO)을 Java 21 + Netty 4.1 이벤트루프로 재구현. streamId 프레임 멀티플렉싱, AES-256-GCM + X25519 세션 키 합의, HMAC 토큰 인증, 하트비트 + 지수 백오프 재접속. AI 코딩 도구를 적극 활용해 설계·검증을 주도.',
  },
  {
    title: '폐쇄망 설치 자동화',
    desc: '인터넷이 차단된 폐쇄망을 위한 Apache·Tomcat·mod_jk 소스 컴파일 설치 자동화 툴킷(Rocky/Ubuntu 스크립트, HTTPS·vhost 템플릿)을 제작해 오프라인 서버 구축을 표준화.',
  },
  {
    title: '런타임 이관 사전 검토',
    desc: 'WAS OS(Windows→Rocky Linux)·DB(Tibero→Oracle) 전환을 위해 운영 프로젝트 7종의 경로 하드코딩·인코딩·드라이버·프로파일 구조를 전수 조사하고, 프로젝트별 위험도 등급과 P1~P3 작업 우선순위를 문서화.',
  },
]
