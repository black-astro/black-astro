// 공부하고 있는 것 · 다음에 해 보고 싶은 것

export const growthIntro =
  '회사에서는 아직 써 보지 못한 것들을 작은 프로젝트로 먼저 만들어 보고 있습니다. 실무에서 쓴 것과 섞이지 않게 여기에 따로 적어 둡니다.'

export interface LearningProject {
  name: string
  goal: string
  stack: string[]
  points: string[]
  status: string
}

export const learningProjects: LearningProject[] = [
  {
    name: 'Kotlin 전환 연습',
    goal: '회사 통합 백엔드를 Kotlin으로 옮기기 전에 감 잡기',
    stack: ['Kotlin 2.3', 'Spring Boot 4.1', 'MyBatis'],
    points: [
      '국세청 발송·열람 대사 API(nts_status)를 Kotlin으로 먼저 만들어 배포해 봤습니다.',
      'MyBatis와 data class를 잇는 방법, Spring 프록시를 위한 all-open 설정처럼 Java에서는 신경 쓰지 않던 부분을 정리하는 중입니다.',
      '다음은 통합 백엔드의 작은 모듈 하나를 골라 Kotlin으로 옮겨 보는 것입니다.',
    ],
    status: '진행 중',
  },
  {
    name: 'realtime-shortlink',
    goal: 'Redis로 URL 단축기를 만들며 캐시와 rate limit 연습',
    stack: ['Redis INCR', 'Base62', 'Micrometer'],
    points: [
      'Redis INCR과 Base62로 단축 URL을 만들고, 캐시 hit/miss를 Micrometer 메트릭으로 내보냅니다.',
      'IP별 슬라이딩 윈도우 rate limiter를 직접 짰습니다.',
      '다음은 부하를 걸어 p95, p99, RPS를 재고 기록하는 것입니다.',
    ],
    status: '진행 중',
  },
  {
    name: 'msa-demo',
    goal: 'Eureka, Gateway, 이벤트 기반 주문/재고로 장애 대응 연습',
    stack: ['Spring Cloud Gateway', 'Eureka', 'Kafka'],
    points: [
      'Gateway와 Eureka로 라우팅과 서비스 발견을 구성했습니다.',
      '상태 변경은 Kafka 이벤트로 넘기고, 소비가 실패하면 지수 백오프 재시도 큐와 DLQ로 보냅니다.',
      '다음은 동기 호출 구간에 서킷브레이커를 붙이고 통합 테스트를 늘리는 것입니다.',
    ],
    status: '진행 중',
  },
  {
    name: 'commerce-core',
    goal: '트랜잭션 저장, 이벤트 발행, 캐시 정합성을 한 흐름으로 확인',
    stack: ['JPA', 'Kafka', '@CacheEvict', 'EmbeddedKafka'],
    points: [
      'JPA로 저장하고 Kafka로 이벤트를 보내고, 소비 쪽에서 재고를 줄인 뒤 캐시를 비우는 흐름입니다.',
      'EmbeddedKafka 통합 테스트로 저장과 발행이 같이 성공하거나 같이 실패하는지 확인합니다.',
    ],
    status: '진행 중',
  },
]

export interface RoadmapArea {
  title: string
  icon: string
  items: string[]
}

export const roadmap: RoadmapArea[] = [
  {
    title: '알고리즘 · 시스템 디자인',
    icon: 'target',
    items: [
      '직접 만든 code T로 꾸준히 문제 풀기',
      '발송 서버에서 겪은 것(폴링에서 큐로, 상태머신, 멱등성)을 메시지 큐, URL 단축기, 결제 멱등 같은 익숙한 문제로 바꿔 말해 보기',
    ],
  },
  {
    title: 'JPA 깊이',
    icon: 'database',
    items: [
      '영속성 컨텍스트, flush, dirty checking, N+1을 제대로 정리하기',
      '모니터링 화면에서 써 본 QueryDSL과 비관적 락을 더 큰 도메인에 적용해 보기',
    ],
  },
  {
    title: 'Kafka · Redis',
    icon: 'layers',
    items: [
      '공부용 프로젝트 세 개를 부하 측정과 공개까지 마무리하기',
      '파티션 키와 순서 보장, 아웃박스 패턴 정리하기',
    ],
  },
  {
    title: '관측성 · 인프라',
    icon: 'activity',
    items: [
      'Micrometer, Prometheus, Grafana로 대시보드 만들기',
      'G1/ZGC 로그, 힙 덤프, JFR 읽는 연습과 Docker/K8s 실습',
    ],
  },
]
