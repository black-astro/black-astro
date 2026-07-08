// 포트폴리오 — 케이스 스터디(코드·SQL 포함) · 역량 매핑

export interface ProvenItem {
  no: number
  title: string
  desc: string
}

export const provenFive: ProvenItem[] = [
  { no: 1, title: '대용량 처리', desc: 'StAX 스트리밍 상태머신, 파서 풀 + 단일 라이터 backpressure 파이프라인, MyBatis BATCH, direct-path INSERT' },
  { no: 2, title: 'DB / SQL 깊이', desc: 'PL/SQL 프로시저·UDF, MERGE UPSERT, 동적 인덱스 제어, 복합인덱스 재설계로 회차 누적 스캔 제거' },
  { no: 3, title: '인증 / 인가 설계', desc: '멀티 SecurityFilterChain 3종, JWT 발급/검증 분리, 이중 백엔드 토큰 핸드오프' },
  { no: 4, title: '운영 안정성 / 트러블슈팅', desc: '발송 상태머신, 조건부 UPDATE race 차단, 멱등성, 사고 재현·복구·문서화(재발 0건)' },
  { no: 5, title: '품질 자동화 & OSS', desc: 'Jenkins/SonarQube/JaCoCo/SBOM, 사내 CI/CD 단독 구축, Maven Central 배포 라이브러리' },
]

export interface CaseBlock {
  type: 'text' | 'code' | 'diagram'
  heading?: string
  content: string
  lang?: string
}

export interface CaseStudy {
  id: string
  title: string
  tag: string
  summary: string
  stack: string[]
  metrics: { value: string; label: string }[]
  blocks: CaseBlock[]
  learned: string
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'case-batch',
    title: 'KT_BatchServer — 대용량 청구서 ETL 성능 튜닝',
    tag: '대용량 · DB 튜닝',
    summary:
      '델파이 레거시를 Java 21로 재구축. 규모별 파싱 전략 분리, 파서 풀 + 단일 라이터 파이프라인, 프로시저 집합 기반 재설계로 배치 시간을 절반 이하로 단축.',
    stack: ['Java 21', 'Spring Boot 3.4.5', 'Tibero 6', 'StAX/JAXB', 'MyBatis(BATCH)'],
    metrics: [
      { value: '50→25분', label: '대량 INSERT' },
      { value: '5→2시간', label: '중복제거 프로시저' },
      { value: 'OOM 0건', label: '1GB+ XML' },
      { value: '~1,000만 row', label: '회차당 INSERT' },
    ],
    blocks: [
      {
        type: 'text',
        heading: '왜 StAX인가 — DOM → JAXB → StAX 시행착오',
        content:
          '처음엔 DOM으로 접근했지만 대용량에서 단건 파싱 속도가 나오지 않았고, JAXB로 전체 객체 바인딩하니 이번엔 메모리 점유가 치솟아 OOM이 빈발했다. 최종적으로 StAX 커서/이벤트 스트리밍으로 전환 — 문서를 통째로 올리지 않고 흘려보내며 처리해, 힙 수십 MB로 매월 명세서 약 100만 건을 안정 처리한다. 세 방식을 직접 다 겪으며 트레이드오프(속도 · 메모리 · 편의성)를 확인하고 내린 선택.',
      },
      {
        type: 'text',
        heading: '해결 1 — 규모별 파싱 전략 + StAX 상태머신',
        content:
          '01001(텍스트, 10만 라인 flush) / 01002(중규모, JAXB) / 01003(대규모, StAX)으로 분기. StAX는 BILLINFO 단위 상태머신으로 섹션을 이벤트로 분해 → DTO 생성 → 즉시 배치 INSERT → 버퍼 해제. 문서를 트리로 올리지 않아 1GB+ 파일도 힙 수십 MB로 처리.',
      },
      {
        type: 'diagram',
        heading: '해결 2 — 파서 풀 + 단일 라이터 파이프라인',
        content: `[XML 파일들]                                      (Tibero)
     │  분배                                          ▲
     ▼                                                │ 단일 커밋 스트림
┌────────────┐   DTO   ┌──────────────────┐   batch   │
│ 파서 스레드 N │ ──────▶ │ ArrayBlockingQueue │ ──────▶ 라이터 스레드 1
│ (CPU 병렬)   │          │  (backpressure)   │          (BATCH 2,000건 flush)
└────────────┘          └──────────────────┘
  · poison pill로 종료 전파   · 실패 시 큐 드레인으로 생산자 데드락 방지`,
      },
      {
        type: 'text',
        heading: '해결 3 — 프로시저 집합 기반 재설계 + 복합인덱스 재설계',
        content:
          '커서 루프(그룹당 5-SQL) 중복제거를 집합 기반(배치당 MERGE 2문장)으로 재설계. Tibero 2시간 세션 강제종료 정책을 콜당 1만 그룹 분할 + 청크 커밋 + 반복 호출로 우회, 중단 시 재개되는 복구 스크립트 운영. 처리 상태 컬럼을 복합인덱스 선두로 이동해 완료 행을 스캔에서 제외.',
      },
      {
        type: 'code',
        heading: '인덱스 재설계 (실 DDL 기반 재구성 예시 — 식별자 일반화)',
        lang: 'sql',
        content: `-- [BEFORE] 상태 컬럼이 뒤 → 회차마다 처리 완료 행까지 재스캔 (회차² 누적)
CREATE INDEX IX_DEDUP_BILL
    ON BILL_BUILD_DATA (SERVER_NO, DEDUP_CI, PROC_STATUS);

-- [AFTER] PROC_STATUS 선두 → 미처리('N') 구간만 레인지 스캔
CREATE INDEX IX_DEDUP_BILL
    ON BILL_BUILD_DATA (PROC_STATUS, SERVER_NO, DEDUP_CI);

SELECT SERVER_NO, DEDUP_CI
  FROM BILL_BUILD_DATA
 WHERE PROC_STATUS = 'N'      -- 선두 등치 조건: 완료 행은 진입 자체 배제
   AND SERVER_NO   = :serverNo;`,
      },
    ],
    learned:
      '대용량의 3원칙 — 메모리에 다 올리지 않는다(StAX), 라운드트립을 줄인다(BATCH), 병렬에는 경계를 만든다(단일 라이터). 인덱스는 존재 여부가 아니라 컬럼 순서가 성능을 좌우한다.',
  },
  {
    id: 'case-auth',
    title: 'GibisbizCenter — 단일 백엔드, 3종 클라이언트 멀티 인증',
    tag: '인증 · 인가 설계',
    summary:
      'JSP→Vue2→Vue3→Electron으로 진화한 클라이언트와 외부 OpenAPI를 하나의 백엔드가 동시 수용. 필터체인을 3개로 분리해 정책 충돌을 제거.',
    stack: ['Java 8', 'Spring Security(OAuth2)', 'jjwt', 'MyBatis 멀티 DataSource', 'Caffeine'],
    metrics: [
      { value: '3 체인', label: 'SecurityFilterChain' },
      { value: '4 세트', label: '멀티 DataSource' },
      { value: '3 세대', label: '콘솔 전환(무중단)' },
    ],
    blocks: [
      {
        type: 'diagram',
        heading: '해결 — 체인 자체를 3개로 분리',
        content: `                    ┌── @Order(1) /api/**      ─ OpenAPI 체인 (토큰 30일)
클라이언트 요청 ──▶ ├── @Order(2) /electron/** ─ 데스크톱 체인 (Access 5분·Refresh 8h)
                    └── @Order(3) 그 외        ─ Vue3 어드민 체인 (ROLE_ADMIN)
   각 체인: STATELESS · 전용 JwtAuthenticationConverter · 독립 인가 정책`,
      },
      {
        type: 'text',
        content:
          'prefix 분기의 정책 충돌을 제거하고 변경 영향 범위를 체인 단위로 한정. JwtTokenProvider / OpenApiTokenProvider로 발급 책임 분리, type 클레임 검증으로 토큰 오용 차단, HS256 서명키 부팅 시 1회 캐싱, Clock Skew 10초. Access Token에 권한을 실어 GET /me 왕복 제거. @MapperScan dao.db1~4로 DataSource 4세트 명시 분리.',
      },
    ],
    learned: '"단일 백엔드 + 다중 클라이언트"는 분기가 아니라 분리로 풀어야 운영 변경이 추적 가능해진다.',
  },
  {
    id: 'case-kakao',
    title: 'KakaoApiServer — 발송 상태머신 + 운영 트러블슈팅',
    tag: '운영 안정성',
    summary:
      '다중 스케줄러가 동일 행을 중복 처리하지 않도록 조건부 UPDATE(compare-and-set)로 락 없이 race를 차단하고, SRC_KEY 공백 매칭 운영 사고를 재현·복구·문서화.',
    stack: ['Java 21', 'Spring Boot 3.3', 'Spring 6 RestClient', 'MyBatis 동적 SQL', 'Tibero 6'],
    metrics: [
      { value: '재발 0건', label: '운영 사고' },
      { value: '중복 0건', label: '다중 스케줄러 발송' },
    ],
    blocks: [
      {
        type: 'code',
        heading: '해결 1 — 락 없는 race 차단 (실 구현 기반 재구성 예시)',
        lang: 'sql',
        content: `-- 상태 전이를 조건부 UPDATE(compare-and-set)로: 한 워커만 성공
UPDATE SEND_MASTER
   SET TRANS_GBN = 'B'
 WHERE MASTER_KEY = #{key}
   AND TRANS_GBN  = 'N';   -- N→B→P→S 상태머신, DB 원자성에 위임`,
      },
      {
        type: 'text',
        heading: '해결 2 — SRC_KEY 공백 매칭 사고 (재현 → 복구 → 재발 방지)',
        content:
          '증상: 카카오 결과 콜백이 "발송데이터 미존재"로 실패, RESULT 미처리 적재. 원인: SRC_KEY 양끝 공백이 카카오 측 trim과 자사 값 사이에서 비매칭됨을 SQL 분석으로 식별. 조치: 복구 SQL로 재처리 유도 → 조회 SQL에 TRIM(SRC_KEY) 명시 → 재현 절차·영향 범위·복구 SQL을 문서화. 이후 재발 0건.',
      },
    ],
    learned: '외부 API 호출은 트랜잭션 경계 밖으로, 상태 전이는 DB 원자성에 위임한다. 사고는 복구로 끝내지 않고 "증상→원인→복구→재발 방지" 문서로 조직 지식화한다.',
  },
]

export interface CapabilityMap {
  capability: string
  projects: string
}

export const capabilityMap: CapabilityMap[] = [
  { capability: '대용량 처리 (스트리밍·파이프라인·BATCH)', projects: 'KT_BatchServer, PassApiServer' },
  { capability: 'DB / SQL 깊이 (프로시저 재설계·인덱스·PL/SQL)', projects: 'KT_BatchServer, KakaoApiServer' },
  { capability: '레거시 현대화 (델파이→Java, JSP→Vue3, 인수 재구축)', projects: 'KT_BatchServer, GibisbizCenter, iM라이프' },
  { capability: '인증 / 인가 설계', projects: 'GibisbizCenter, G-HUB, 전자고지 열람 서버' },
  { capability: '외부 API 연동·상태머신·멱등성', projects: 'KakaoApiServer, PassApiServer, iM라이프' },
  { capability: '운영 트러블슈팅·문서화', projects: 'KakaoApiServer, KT_BatchServer' },
  { capability: '캐시 전략 (제약 하 의사결정)', projects: 'GibisbizCenter (Redis→Caffeine)' },
  { capability: '품질 자동화 · 인프라 구축', projects: 'PassApiServer, 사내 CI/CD, 폐쇄망 툴킷' },
  { capability: 'ORM 동적 쿼리 · 테스트', projects: 'GibisMonitoring' },
  { capability: '프레임워크 내부 / OSS', projects: 'easy-quartz, smart-msg' },
]
