// 경력 연혁 · 프로젝트 상세 — 경력기술서 기반

export interface TimelineEntry {
  period: string
  title: string
  role: string
  highlight?: boolean
}

export const timeline: TimelineEntry[] = [
  { period: '종료', title: '농정원 직불금 전자고지(NJW) · 관리자 콘솔 1세대(JSP)', role: '신입 — 발송 배치·열람 페이지 개발' },
  { period: '운영 중', title: 'GibisbizCenter 통합 백엔드 (주력)', role: '백엔드 설계·개발·운영 · 콘솔 Vue2→Vue3 전환', highlight: true },
  { period: '운영 중', title: '카카오 전자문서 발송·열람·유통증명 서버군', role: '주 개발자 — 설계·개발·운영' },
  { period: '운영 중', title: 'G-HUB Electron 데스크톱 전환 (풀스택)', role: '클라이언트 개발 + 인증 계약 설계' },
  { period: '운영 중', title: 'PASS 전자고지 발송·구축 서버', role: '주 개발자 — 설계·개발·운영' },
  { period: '운영 중', title: 'iM라이프 공인알림문자 발송 엔진', role: '인수·재구축 주도 (주 개발자)' },
  { period: '운영 중', title: 'KT_BatchServer 대용량 ETL 재구축', role: '핵심 설계·개발·성능 개선', highlight: true },
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
    period: '약 12개월 · 운영 중',
    role: '백엔드 핵심 설계·개발·운영 (파싱·적재 아키텍처, DB 튜닝, 성능 개선)',
    stack: ['Java 21', 'Spring Boot 3.4.5', 'Tibero 6', 'MyBatis(BATCH)', 'StAX/JAXB', 'SQLite', 'Spring Integration SFTP', 'Jenkins'],
    featured: true,
    overview: [
      'KT로부터 매월 수신되는 청구서 원천(텍스트 .snd / XML)을 파싱·검증·중복제거 후 Tibero에 적재하고, MMS·공공알림문자·카카오 채널별 발송 데이터로 가공하는 배치 서버.',
      '원래 델파이 프로그램이 종일 처리하던 업무로, 1차 Java 전환(2022)을 거쳐 Java 21 기반 성능 재설계 버전으로 재구축. 안내문 코드별 규모가 달라(01001 텍스트 약 400만 / 01002 XML 약 10만 / 01003 XML 약 100만 건 — 01003은 디테일 분해로 DB INSERT 약 1,000만 row) 코드별 파싱·적재 전략을 분리 설계.',
    ],
    sections: [
      {
        heading: '데이터 규모별 파싱 전략 분리 (OOM 해결)',
        points: [
          '문제 — 처음엔 DOM 파싱이 대용량에서 단건 속도가 나오지 않았고, JAXB로 전체 객체화하니 메모리 점유가 치솟아 OutOfMemoryError 빈발.',
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
        heading: '중복제거 아키텍처 재설계 — 튜닝의 한계를 구조 변경으로 (4시간+ → 약 31분)',
        points: [
          '문제 정의 — 프로시저를 집합 기반으로 바꿔 5시간→2시간까지 줄였지만 한 회차 전 구간은 여전히 4시간을 넘었다. SQL을 더 다듬어도 자릿수는 안 바뀐다고 보고, 병목을 연산의 위치 문제로 다시 정의. 원천 1,000만 행을 먼저 적재한 뒤 그 넓은 테이블에서 정렬·집계를 반복하는 순서 자체가 비용이었다.',
          '착안 — 중복 판정에 실제로 필요한 컬럼은 IPIN_CI · SRC_KEY · 금액 · 순번 네 개뿐. 수십 컬럼 1,000만 행에서 할 일이 아니라고 보고, 판정을 적재 이전 단계로 끌어올려 4컬럼 100만 행짜리 로컬 SQLite에서 끝내는 구조로 재설계.',
          '설계 — 1차 파싱으로 키만 수집 → 윈도우 함수(COUNT/SUM/ROW_NUMBER OVER PARTITION BY) 한 번으로 대표 선정·건수/금액 집계·SEQ 채번 동시 처리 → 확정값을 채워 1회 적재. 판정 20초로 끝나 중복제거 프로시저 호출이 사라졌고, 병합 대상 URL을 적재 시점에 알게 되어 1,000만 행 조인 사후 UPDATE도 함께 제거.',
          '트레이드오프 — 확정값(SEQ·URL)은 마지막 파일까지 읽어야 정해지는데 첫 레코드에도 필요. 전량을 힙에 들면 OOM, 다시 읽으면 파싱 2회. 파싱 비용 2배가 메모리 폭발보다 싸다고 판단해 재파싱을 택하고, 1차에서 파일별 건수를 기록해 두 패스의 순번이 어긋나면 즉시 중단하도록 안전장치를 뒀다.',
          '임시 스토어 운영 — 인덱스는 적재가 끝난 뒤에 만들어 적재 중 인덱스 갱신 비용을 없앴고, 회차마다 새로 만들고 버리는 파일이라 저널·동기화를 꺼 내구성 대신 속도를 택했다. URL 채번의 조회 조건에 전용 인덱스를 두어 건수 제곱으로 늘어나던 비용을 선형화.',
          '결과 — 명세 101만 건 / DB 적재 753만 행(XML 506개) 기준 전 구간 약 31분 (1차 파싱 8분 47초 · 판정 20초 · URL 채번 15분 9초 · 적재 6분 52초). 운영 동일 규모 실데이터, 개발 환경 실측(2026-09-08).',
        ],
      },
      {
        heading: '병목 규명 — 목표를 먼저 세우고 측정으로 좁히기 (파일당 44초 → 0.8초)',
        points: [
          '문제 인지 — 재설계 후에도 적재가 파일당 44초. "느리다"로 두지 않고 파일당 2~3초라는 목표를 먼저 못 박아 미달을 문제로 규정. 코드상으로는 이미 배치 적재라 눈으로는 원인이 보이지 않았다.',
          '1단계 — 실행 중 프로세스의 스레드 덤프를 6회 샘플링해 5회가 executeBatch 소켓 대기 상태임을 확인. 애플리케이션 연산이 아니라 DB 왕복이 원인임을 먼저 확정하고 탐색 범위를 좁혔다.',
          '2단계 — 적재 구간에 로그가 없어 판단 근거가 없었다. MAIN/BASIC/CHAGE/PAY_INFO 구간별 소요를 남기는 계측을 먼저 심고 재측정 — 같은 2,000행인데 MAIN만 12.8초, BASIC은 0.1초라는 100배 비대칭을 특정.',
          '3단계 — 두 SQL의 유일한 차이는 MAIN에만 있던 ${server_no} 치환. 값이 행마다 1~5로 순환하며 SQL 문자열이 달라져, 직전 문장과 동일할 때만 묶는 MyBatis BATCH가 사실상 매 행 개별 왕복으로 동작하고 있었다.',
          '해결 — #{} 바인딩으로 전환해 문장을 하나로 고정, 2,000행이 한 번에 전송되도록 복원. 파일당 44초 → 0.8초, 506개 파일 전체 적재 6분 52초로 목표를 넘어섰다.',
          '같은 방식으로 URL 채번 정리 — UPDATE가 인덱스 없는 컬럼을 조건으로 써서 느려진다는 가설을 5천/1만/2만 건 벤치마크로 검증(1.3초 / 4.8초 / 19.9초 — 건수 2배마다 4배)하고 인덱스를 추가해 2만 건 기준 19.9초 → 81ms로 선형화.',
        ],
      },
      {
        heading: '장애 역추적 · 실패 안전성 · 결과 검증',
        points: [
          '원인 메시지가 비어 있던 장애 — 인덱스 리빌드가 3회 모두 실패했는데 로그에 원인이 없었다. 실패 간격의 비대칭(1회차 39분, 2·3회차 각 3분)에서 공간 부족을 가설로 세우고, 예외 원인을 끝까지 따라가 남기도록 로깅을 보강해 ORA-01652(임시 세그먼트 확장 불가)를 확인. 인덱스 12개가 회차당 약 7.4GB를 쓰는 구조임을 세그먼트 크기로 검증하고 테이블스페이스 여유 기준을 문서화.',
          'UNUSABLE 방치 차단 — 적재 실패 시 인덱스가 사용 불가로 남으면 이후 조회·구축이 전부 깨지므로 리빌드를 finally로 옮기고 잠금 경합에 대비한 재시도를 뒀다.',
          '원본 파일 정리 시점 — 작업 테이블을 TRUNCATE하고 시작하는 전부-아니면-전무 구조에서 파일을 하나씩 지우면 중간 실패 시 남은 파일만으로 잘못된 회차가 성립한다. 회차 전체 성공 후 일괄 삭제·실패 시 격리로 정하고, 비정상 종료 시에는 파일이 남아 다음 회차에 자동 재처리되도록 설계.',
          '결과 검증 — 병합 로직이 바뀐 만큼 건수·금액 보존을 DB에 직접 질의해 확인. 원본 건수(101만 건)와 적재 행 수 일치, SUM(LIST_CNT) 일치, 병합 전후 금액 합계 177억 3,156만 5,208원 완전 일치, SEQ_NO 1~919,114 연속·무중복, 잔여 중복 그룹 0건. 수신 목록과 대조할 때 병합 후 통 수가 아니라 원본 행을 기준으로 봐야 한다는 점을 검증 기준으로 정리해 문서화.',
        ],
      },
      {
        heading: '구조 전면 재편 — 동작을 고정한 채 읽을 수 있는 코드로',
        points: [
          '문제 — 설정·DAO·스케줄러가 도메인 밖에 흩어져 있고 클래스·매퍼 id·메서드명이 제각각이라, 파일명만으로는 어느 안내문(01001/01002/01003)의 어느 처리인지 알 수 없었다.',
          '원칙 — 계획서를 먼저 써서 변경 대상 전체를 표로 확정하고 대원칙을 못 박았다. SQL 본문·프로시저명·테이블/컬럼명은 절대 건드리지 않는다, 단계마다 빌드로 검증하고 단계별로 커밋한다, 하드코딩된 매퍼 문자열은 네임스페이스 변경과 반드시 동시에 고친다(누락하면 런타임에서만 터지는 가장 위험한 지점).',
          '실행 — 패키지를 안내문 코드 중심으로 통합(Phase A) → 매퍼 xml id·DAO 메서드명 정리(B) → 미사용 코드·메서드명 정리(C·D) → 미사용 SQL 제거·주입 필드명 정리(E)까지 5단계로 나눠 진행. 폴더 하나만 열면 Parser → BatchInserter → ProcedureCaller → mapper → dto가 한자리에 보이는 배치.',
          '곁들여 정리한 것 — 참조 0인 클래스(대용량 zip 추출기 271줄 등)와 죽은 SQL 10문(매퍼 XML 138줄), 백업 잔재 파일 537줄 제거. 하드코딩된 매퍼 문자열을 sqlSession.getMapper(X.class)로 바꿔 "DAO 메서드명 = XML id = 문자열" 3중 동기화를 2중으로 축소 — 누락 시 런타임에서만 터지던 위험 지점을 줄였다.',
          '결과 — 68개 파일 +1,241 / −1,935 (순 −694줄). 단계마다 컴파일 검증과 DAO↔id 바인딩 전수 대조를 거쳐, 기능 변경 0건으로 동작을 그대로 유지한 채 구조만 교체.',
        ],
      },
      {
        heading: '적재 모드 분기 (단일 / 병렬)',
        points: [
          '01003 적재를 파서 N스레드 + 단일 writer 스레드(BlockingQueue) 파이프라인으로 전환하고, INSERT 본문을 <sql>로 공통화해 단일 모드는 direct-path(APPEND_VALUES), 병렬 모드는 일반 INSERT로 분기.',
          '병렬 스레드 수와 direct-path 사용 여부를 설정으로 빼 회차 상황에 맞게 선택 가능.',
          '중복제거 정체 판정을 실제 중복 잔여건수 기준으로 바꾸고 진척 로그를 보강해, 오래 도는 구간이 멈춘 것인지 진행 중인지 구분되도록 개선.',
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
      'INSERT 50분 → 25분, 중복제거 프로시저 5시간 → 2시간 (운영 실측). 이후 중복 판정을 적재 이전으로 옮기는 아키텍처 재설계로 적재~중복제거 전 구간 4시간+ → 약 31분, 적재 구간 파일당 44초 → 0.8초 (운영 동일 규모 실데이터, 개발 환경 실측). 회차당 DB INSERT 약 1,000만 row 처리, 대용량 XML OOM 0건(운영 로그 기준). 정합성 검증 완료 후 운영 전환 준비 중.',
  },
  {
    id: 'gibisbiz',
    index: 2,
    title: 'GibisbizCenter',
    subtitle: '다채널 발송·인증·모니터링 통합 백엔드 (주력, 4년)',
    period: '약 4년 · 운영 중',
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
    period: '집중 개발 약 12개월 · 이후 운영 유지 중',
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
    period: '운영 중 (채널 오픈부터 담당)',
    role: '주 개발자 — 설계·개발·운영 (외부 API 연동, 발송 파이프라인, 열람 인증, 장애 대응)',
    stack: ['Java 21', 'Spring Boot 3.3/3.4', 'Spring 6 RestClient', 'MyBatis', 'Tibero 6', 'jakarta.validation'],
    featured: true,
    overview: [
      'KT 모바일 전자고지의 카카오 채널 전담 백엔드 3종. 수신자는 카카오톡 알림 메시지로 안내를 받고, 링크 접근 시 토큰 인증 후 안내문을 열람.',
      'KakaoApiServer(벌크 발송·결과 폴링·정산) / KakaoApi_mybatis(열람 인증 API, 카카오 규격 3.4·3.5) / KakaoCertEnjin(유통증명서 PDF 자동 수집 배치)로 구성.',
    ],
    sections: [
      {
        heading: '카카오 초당 상한 대응 페이서 직접 구현 (200문서/초)',
        points: [
          '문제 — 카카오 발송 API는 초당 처리 문서 수에 상한(200문서/초)을 둔다. 발송 스케줄러 3개가 각자 벌크 호출을 하면 합계가 순간적으로 상한을 넘어 rate limit으로 실패한다. 아침에 프로시저가 2~3만 건을 한 번에 생성하는 버스트 구간이 특히 위험했다.',
          '해결 — 세 스레드가 공유하는 페이서를 외부 라이브러리 없이 15줄로 구현. 카운터나 시간 윈도우 없이 "다음 발송 가능 시각" 하나만 들고, 발송 직전 이번 건의 문서 수만큼 미래 타임라인에서 자기 구간을 예약한 뒤 자기 슬롯까지만 대기한다. 과거 시각은 현재로 끌어올려 버스트 크레딧이 쌓이지 않게 해, 어느 1초 구간을 잘라도 상한을 넘지 못한다.',
          '설계의 핵심 — 예약 계산만 잠금 안에서 하고 대기는 잠금 밖에서 수행. 잠금을 쥔 채 자면 스레드가 직렬화되지만, 예약만 원자적으로 끊어 두면 세 스레드가 순차 슬롯을 나눠 갖고 각자 자기 몫만 자면 된다. 임계 구역에 산술 연산만 남아 사실상 무경합.',
          '워커당 한도를 3분할하지 않고 공유 페이서 단일 지점을 통과시킴 — 나눠 주면 노는 워커의 몫이 버려지지만, 단일 지점이면 유휴 워커가 있어도 전체 처리량 손실이 없다. 차감 단위도 요청이 아니라 문서 기준(상한이 문서 수 기준이라 벌크 1회가 N건이면 N슬롯 예약).',
          '상한값을 yml로 외부화하고 카카오 상한 200보다 낮은 190을 기본값으로 둠 — 지터 여유를 남겨 경계에서 실패하지 않게 하고, 한도 변경 시 재빌드 없이 설정 수정 + 재기동만으로 대응.',
          '속도조절을 상태 선점(B)보다 앞 단계에 배치 — 대기 중 서버가 내려가도 아직 선점 전이라 다음 주기에 그대로 다시 잡힌다. 중복 발송이 생기지 않도록 순서 자체를 설계에 반영. 건당 과금이라 실패는 자동 재발송 대신 보류(E) + 사유 기록 후 수동 확인으로 정책화하고 주석·문서에 명문화.',
          '관측 — 기동 시 적용값 1회 로그, 대기가 1초 이상 밀릴 때만 관찰 로그 1줄. 평상시엔 대기 0이라 조용하고 버스트 때만 남아 페이스 적정성을 운영 데이터로 판단.',
          '한계를 숨기지 않고 운영 절차로 보완 — 단일 JVM 기준이며 인스턴스를 늘리면 분산 제한이 필요하다는 점을 코드 주석에 명시하고, 무중단 병렬 배포 순간 신·구 컨텍스트 합산 초과는 발송 스위치 OFF → WAR 교체 → ON 절차로 덮었다.',
          '결과 — 아침 대량 생성(2~3만 건) 버스트를 약 2.5~3분에 걸쳐 평탄하게 드레인. 발송이 뜸한 평상시에는 대기 0으로 상시 지연 없음.',
        ],
      },
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
    period: '인수 후 재구축 · 운영 중',
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
    period: '약 12개월 · 운영 중',
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
    subtitle: '사내 공용 업무 시스템 백엔드',
    period: '약 6개월',
    role: '백엔드 설계·개발 (도메인 모델링, 동적 조회, 실시간 연동, 테스트)',
    stack: ['Java 21', 'Spring Boot 3.5', 'Spring Data JPA + QueryDSL 5.0', 'MyBatis', 'MariaDB/Tibero', 'WebSocket(STOMP)', 'JUnit5'],
    featured: false,
    overview: [
      '사내 구성원이 함께 쓰는 업무 시스템의 백엔드 — 주소록·메모·업무 인수인계 같은 협업 기능과 업무 현황 모니터링, 메뉴·권한·사용자 프로필을 다룹니다.',
      '동적 검색 조건이 많은 조회는 JPA + QueryDSL로, 정형 쿼리는 MyBatis로 나눠 처리합니다.',
    ],
    sections: [
      {
        heading: 'JPA + QueryDSL 동적 조회 · 테스트 관행 도입',
        points: [
          '동적 조회를 JPAQueryFactory 기반 커스텀 리포지토리(*DSLImpl)로 타입 안전하게 구성, 정형 쿼리는 MyBatis 혼용 — 조회 특성별 도구 선택.',
          '메모·업무 인수인계 채널의 WebSocket(STOMP) 실시간 전송에 인증 인터셉터(ChannelWebSocketAuthInterceptor)를 붙여 비인가 구독 차단. MariaDB + Tibero 이기종 멀티 DataSource 분리.',
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
