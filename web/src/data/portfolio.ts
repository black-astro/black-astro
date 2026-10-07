// 케이스 노트 — 코드·SQL과 함께 남겨 둔 기록

export interface ProvenItem {
  no: number
  title: string
  desc: string
}

// 자주 붙잡고 있는 주제들
export const provenFive: ProvenItem[] = [
  { no: 1, title: '동시성과 정합성', desc: '조건부 UPDATE 상태 전이, 공정 락으로 채번 직렬화, 멱등 INSERT, 외부 호출은 트랜잭션 밖으로' },
  { no: 2, title: 'DB와 프로시저', desc: 'Tibero·Oracle PL/SQL 프로시저와 UDF, 집합 기반 MERGE, 인덱스 제어와 컬럼 순서, 장애 역추적' },
  { no: 3, title: '대용량 처리', desc: 'StAX 스트리밍, 파서 여러 개와 라이터 하나를 잇는 큐, MyBatis BATCH, direct-path INSERT' },
  { no: 4, title: '운영 중에 고치기', desc: '테스트를 먼저 깔고 단계마다 커밋하는 리팩터링, 장애 재현과 복구 SQL, 문서로 남기기' },
  { no: 5, title: '인증과 도구 만들기', desc: 'SecurityFilterChain 분리, 1회용 코드 핸드오프, 사내 CI/CD, Maven Central·npm 배포' },
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
    id: 'case-pass',
    title: 'PASS 발송 서버 — 운영 중인 코드를 테스트부터 깔고 줄이기',
    tag: '리팩터링 · 동시성',
    summary:
      '운영/개발, 채널, 발송/결과 조합마다 복제돼 있던 스케줄러를 멈추지 않고 정리한 기록입니다. 같은 구축을 동시에 부르면 번호가 겹치던 문제도 이때 같이 풀었습니다.',
    stack: ['Java 21', 'Spring Boot 3.4', 'MyBatis', 'Tibero 6', 'JUnit5', 'SonarQube'],
    metrics: [
      { value: '1,042 → 약 260줄', label: '스케줄러 코드' },
      { value: '8 → 2개', label: '스케줄러 클래스' },
      { value: '6 → 16개', label: '단위 테스트' },
      { value: '약 126건', label: 'SonarQube 지적 해소' },
    ],
    blocks: [
      {
        type: 'text',
        heading: '먼저 안전망',
        content:
          '구조를 건드리기 전에 테스트 세 가지를 만들었습니다. DB 없이 매퍼 XML을 파싱해서 DAO 메서드에 맞는 SQL이 없으면 실패하는 바인딩 테스트, 채널과 환경 조합별 SQL을 실 DB에서 롤백 조건으로 돌리는 스모크 테스트, 애플리케이션 기동 테스트. 의존성은 생성자 주입 타입으로 바꿔 배선 오류가 컴파일 단계에서 보이게 했고, 일부러 배선을 망가뜨린 네 가지 경우를 테스트가 다 잡는 걸 확인한 다음에 시작했습니다.',
      },
      {
        type: 'text',
        heading: '그다음 줄이기',
        content:
          '환경 차이는 이미 파라미터로 표현돼 있었기 때문에 클래스 복제를 걷어내고 스케줄러를 발송과 결과 두 축으로 다시 묶었습니다. 처음에는 조합 전체를 enum 표 한 장으로 만들었는데, 짧긴 해도 사람이 읽기 어려워서 클래스가 조금 늘더라도 한눈에 읽히는 구조로 되돌렸습니다. 동작과 로그 문구, 설정 키는 바꾸지 않았고 단계마다 빌드가 통과하면 커밋했습니다.',
      },
      {
        type: 'code',
        heading: '같은 구축을 동시에 부를 때 (요지만 옮김)',
        lang: 'java',
        content: `// 관리자 화면과 외부 호출이 같은 락을 쓴다
private final ReentrantLock buildLock = new ReentrantLock(true); // 공정 락

public BuildResult buildFromHttp(Request req) throws InterruptedException {
    // HTTP는 30초만 기다리고 바로 돌려준다 — 오래 붙잡으면 재시도가 중복을 만든다
    if (!buildLock.tryLock(30, TimeUnit.SECONDS)) {
        return BuildResult.busy("다른 구축이 진행 중입니다");
    }
    try {
        return tx.execute(status -> {        // 채번부터 쓰기까지 한 트랜잭션
            long seq = nextSeq();
            insertMessageAndMaster(seq, req);
            return BuildResult.ok(seq);
        });
    } finally {
        buildLock.unlock();
    }
}`,
      },
    ],
    learned:
      '운영 중인 코드를 줄일 때 제일 빠른 길은 결국 테스트를 먼저 까는 쪽이었습니다. 그리고 기다리는 시간은 호출하는 쪽마다 달라야 합니다. 오래 붙잡는 게 친절해 보여도 재시도와 겹치면 중복이 됩니다.',
  },
  {
    id: 'case-kakao',
    title: '카카오 전자문서 — 초당 상한 페이서와 상태 전이',
    tag: '동시성 · 외부 연동',
    summary:
      '초당 200문서 상한을 라이브러리 없이 작은 페이서로 맞추고, 여러 스케줄러가 같은 건을 집지 않게 조건부 UPDATE로 막은 기록입니다.',
    stack: ['Java 21', 'Spring Boot 3.3', 'Spring 6 RestClient', 'MyBatis', 'Tibero 6'],
    metrics: [
      { value: '200문서/초', label: '외부 API 상한' },
      { value: '2.5~3분', label: '2~3만 건을 나눠 보내는 시간' },
      { value: '0건', label: '여러 워커 환경의 중복 발송' },
    ],
    blocks: [
      {
        type: 'code',
        heading: '예약 방식 페이서',
        lang: 'java',
        content: `// 카운터도 시간 창도 없다. 상태는 "다음에 보내도 되는 시각" 하나뿐
public void acquire(int documents) throws InterruptedException {
    if (documents <= 0) return;
    long waitNanos;
    synchronized (this) {                            // (1) 예약 계산만 잠금 안에서
        long now     = System.nanoTime();
        long startAt = Math.max(nextFreeNanos, now); // 지난 시각은 지금으로 당긴다
        waitNanos    = startAt - now;
        nextFreeNanos = startAt + (long)(documents * nanosPerPermit);
    }
    if (waitNanos > 0) Thread.sleep(...);            // (2) 기다리는 건 잠금 밖에서
}`,
      },
      {
        type: 'text',
        heading: '왜 이렇게 했나',
        content:
          '(1)과 (2)를 떼어 놓은 게 전부입니다. 잠금을 쥔 채로 자면 스레드가 줄을 서지만, 예약만 원자적으로 끊어 두면 스케줄러 세 개가 차례를 나눠 갖고 각자 자기 몫만 잡니다. 워커마다 63건씩 나눠 주면 쉬는 워커의 몫이 버려져서 한 지점을 통과시키는 쪽을 골랐습니다. 상한은 문서 수 기준이라 묶음 하나가 N건이면 N칸을 예약합니다. 기본값은 190으로 두고 설정으로 뺐습니다. 속도 조절을 상태 선점보다 앞에 둬서 기다리는 중에 서버가 내려가도 중복이 생기지 않습니다. 한 JVM 기준이라는 한계는 주석에 적고, 병렬 배포 순간은 발송 스위치를 끄고 교체하는 절차로 덮었습니다.',
      },
      {
        type: 'code',
        heading: '상태 전이는 DB에 맡긴다 (식별자는 일반화)',
        lang: 'sql',
        content: `-- 상태가 '신규'인 건만 '선점'으로 바꾼다. 명시적 잠금 없이 한 워커만 성공
UPDATE SEND_MASTER
   SET STATUS = 'B'
 WHERE MASTER_KEY = #{key}
   AND STATUS = 'N';   -- N → B → P → S`,
      },
    ],
    learned:
      '외부 API 호출은 트랜잭션 밖으로, 상태 전이는 DB 원자성에 맡깁니다. 건당 과금인 곳에서는 실패 후 재시도보다 처음부터 넘치지 않게 맞추는 쪽이 안전했습니다.',
  },
  {
    id: 'case-batch',
    title: 'KT 청구서 배치 — 튜닝이 막혀서 처리 위치를 옮기기',
    tag: '대용량 · DB',
    summary:
      '델파이 레거시를 Java 21로 옮기면서, 프로시저 튜닝으로 자릿수가 안 바뀌자 중복 판정을 적재 이전의 로컬 SQLite로 옮긴 기록입니다.',
    stack: ['Java 21', 'Spring Boot 3.4', 'Tibero 6', 'StAX/JAXB', 'MyBatis(BATCH)', 'SQLite'],
    metrics: [
      { value: '4시간 50분 → 31분', label: '적재~중복제거 (개발 환경 실측)' },
      { value: '44초 → 0.8초', label: '적재 (파일당)' },
      { value: '19.9초 → 81ms', label: '2만 건 UPDATE' },
      { value: '0건', label: '1GB급 XML 메모리 부족 (운영 로그)' },
    ],
    blocks: [
      {
        type: 'diagram',
        heading: '파서 여러 개, 라이터 하나',
        content: `[XML 파일들]                                       (Tibero)
     │  분배                                           ▲
     ▼                                                 │ 커밋은 한 줄로
┌────────────┐   DTO   ┌──────────────────┐   batch   │
│ 파서 스레드 N │ ──────▶ │ ArrayBlockingQueue │ ──────▶ 라이터 스레드 1
│ (CPU 병렬)   │          │  (꽉 차면 대기)     │          (2,000건씩 flush)
└────────────┘          └──────────────────┘
  · 종료는 poison pill로 전달   · 한쪽이 실패하면 큐를 비워 생산자가 멈추지 않게`,
      },
      {
        type: 'code',
        heading: '인덱스 컬럼 순서 (식별자는 일반화)',
        lang: 'sql',
        content: `-- [BEFORE] 중간 컬럼에 막혀 상태 조건이 필터로만 쓰임
--          → 중복제거 루프가 돌수록 처리 끝난 행까지 다시 읽는다
CREATE INDEX IX_DEDUP_BILL
    ON BILL_BUILD_DATA (SERVER_NO, DEDUP_KEY, STATUS);

-- [AFTER] 등치 조건 두 개를 앞으로 → 미처리 구간만 범위 스캔
CREATE INDEX IX_DEDUP_BILL
    ON BILL_BUILD_DATA (STATUS, SERVER_NO, DEDUP_KEY);`,
      },
      {
        type: 'diagram',
        heading: '처리 위치를 옮긴 그림',
        content: `[BEFORE]  XML 전량 파싱 ─▶ 1,000만 행 적재 ─▶ 프로시저 반복(정렬·집계·순번)
                                              └─ URL 동기화 UPDATE(1,000만 행 조인)

[AFTER]   XML 1차 파싱 ─▶ 판정 키 4개만 로컬 SQLite
                          └─▶ 윈도우 함수 1회: 대표 선정 + 건수/금액 집계 + 순번  (20초)
                              └─▶ XML 2차 파싱 ─▶ 확정값을 채워 1회 적재

· 확정값은 마지막 파일까지 읽어야 정해지는데 첫 레코드에도 필요하다.
  다 들고 있으면 메모리가 터지고, 다시 읽으면 파싱이 두 번. 두 번 읽기를 골랐다.
  1차에서 파일별 건수를 남겨, 두 번의 순번이 어긋나면 바로 멈춘다.`,
      },
      {
        type: 'code',
        heading: '배치 묶음이 풀리던 한 글자',
        lang: 'xml',
        content: `<!-- BEFORE : 값이 바뀔 때마다 다른 SQL 문장 → 배치 묶음이 끊김 -->
VALUES (..., 'Y', \${server_no}, ...)

<!-- AFTER : 문장은 하나, 값만 바인딩 → 2,000행이 한 번에 -->
VALUES (..., 'Y', #{server_no}, ...)`,
      },
      {
        type: 'text',
        heading: '로그에 원인이 없던 장애',
        content:
          '인덱스 리빌드가 세 번 다 실패했는데 원인이 비어 있었습니다. 실패 간격(39분, 3분, 3분)의 차이에서 공간 부족을 의심했고, 예외 원인을 끝까지 남기게 로깅을 고쳐 ORA-01652를 확인했습니다. 인덱스 12개가 회차당 약 7.4GB를 쓴다는 걸 세그먼트 크기로 확인하고 기준을 문서로 남겼습니다. 마지막으로 병합 전후 건수와 금액을 DB에 직접 물어봤고, 금액 합계는 원 단위까지 맞았습니다(약 177억 원 규모).',
      },
    ],
    learned:
      '메모리에 다 올리지 않고, 왕복을 줄이고, 병렬에는 경계를 만든다. 인덱스는 있느냐보다 컬럼 순서가 중요했고, 튜닝이 막히면 같은 일을 더 빨리 하기보다 더 작은 데이터에서 하도록 옮기는 편이 자릿수를 바꿨습니다. 성능 작업은 목표 숫자를 먼저 정해야 끝이 났습니다.',
  },
  {
    id: 'case-auth',
    title: 'GibisbizCenter — 백엔드 하나, 클라이언트 셋',
    tag: '인증 · 인가',
    summary:
      'Vue3 어드민, Electron 데스크톱, 외부 OpenAPI를 백엔드 하나가 받으면서 인증 정책이 부딪히던 문제를 필터체인을 나눠 정리했습니다.',
    stack: ['Java 8', 'Spring Security(OAuth2)', 'jjwt', 'MyBatis', 'Caffeine'],
    metrics: [
      { value: '3개', label: 'SecurityFilterChain' },
      { value: '4벌', label: 'DataSource · 트랜잭션 매니저' },
      { value: '60초', label: '데스크톱 1회용 로그인 코드' },
    ],
    blocks: [
      {
        type: 'diagram',
        heading: '체인을 아예 나눈다',
        content: `                    ┌── @Order(1) /api/**      OpenAPI 체인 (토큰 30일)
클라이언트 요청 ──▶ ├── @Order(2) /electron/** 데스크톱 체인 (Access 5분 · Refresh 8시간)
                    └── @Order(3) 그 외        어드민 체인
   체인마다: STATELESS · 전용 JwtAuthenticationConverter · 따로 노는 인가 정책`,
      },
      {
        type: 'text',
        content:
          '접두사로 나누던 때의 충돌이 사라지고, 무언가를 바꿀 때 영향이 체인 하나 안에서 끝납니다. 발급과 검증 책임을 나누고 토큰 type 클레임을 검사해 다른 용도의 토큰이 섞여 들어오지 못하게 했습니다. 데스크톱 로그인은 토큰을 URL에 싣지 않고 60초짜리 1회용 코드로 바꿔 받습니다. 꺼내는 순간 사라지고, 앱 식별 키는 상수 시간 비교로 확인합니다.',
      },
    ],
    learned: '백엔드 하나에 클라이언트가 늘어날 때는 분기를 더하는 것보다 나누는 쪽이 나중에 추적하기 쉬웠습니다.',
  },
]

export interface CapabilityMap {
  capability: string
  projects: string
}

export const capabilityMap: CapabilityMap[] = [
  { capability: '동시성 · 상태 전이 · 멱등성', projects: 'PASS 발송 서버, 카카오 전자문서, iM라이프' },
  { capability: '운영 중 리팩터링 · 테스트', projects: 'PASS 발송 서버, KT 청구서 배치' },
  { capability: 'DB · 프로시저 · 인덱스', projects: 'KT 청구서 배치, KT 서버 운영' },
  { capability: '대용량 처리 (스트리밍 · 파이프라인 · BATCH)', projects: 'KT 청구서 배치' },
  { capability: '외부 API 연동 · 속도 제한', projects: '카카오 전자문서, PASS 발송 서버, iM라이프' },
  { capability: '장애 추적 · 문서화', projects: '카카오 전자문서, KT 청구서 배치' },
  { capability: '인증 · 인가', projects: 'GibisbizCenter, 수신자 열람 서버' },
  { capability: '캐시 (제약 아래에서의 선택)', projects: 'GibisbizCenter (Redis 검증 후 Caffeine)' },
  { capability: 'Kotlin', projects: 'nts_status, GibisbizCenter 이전 준비' },
  { capability: '도구 만들기 · 인프라', projects: 'easy-quartz, smart-msg, claude-statusline-astro, 사내 CI/CD' },
]
