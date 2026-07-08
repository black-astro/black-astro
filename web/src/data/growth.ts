// 성장 로드맵 — 대규모 트래픽 설계로의 확장 (긍정적 로드맵으로 재구성)

export const growthIntro =
  '발송·배치 대용량 경험을 실시간 트래픽 설계로 확장하기 위해, 실무에서 다루지 못한 영역을 개인 학습 프로젝트로 직접 구현하며 채우고 있습니다. 아래는 진행 중인 학습과 다음 목표입니다.'

export interface LearningProject {
  name: string
  goal: string
  stack: string[]
  points: string[]
  status: string
}

export const learningProjects: LearningProject[] = [
  {
    name: 'realtime-shortlink',
    goal: 'Redis 기반 URL 단축기 — 캐시·rate limit·관측성 실습',
    stack: ['Redis INCR', 'Base62', 'Micrometer', 'Testcontainers', 'k6'],
    points: [
      'Redis INCR + Base62 URL 단축, Micrometer 커스텀 메트릭(캐시 hit/miss) 노출.',
      'IP별 슬라이딩 윈도우 rate limiter 직접 구현, Testcontainers 통합 테스트.',
      'k6 부하 시나리오 작성 — 로컬 단일 인스턴스 실측 진행 중(p95/p99·RPS 기록 목표).',
    ],
    status: '진행 중',
  },
  {
    name: 'msa-demo',
    goal: 'Eureka + Gateway + 이벤트 기반 주문/재고 — MSA 회복탄력성 실습',
    stack: ['Spring Cloud Gateway', 'Eureka', 'Kafka', 'Resilience4j'],
    points: [
      '동기 호출은 Resilience4j CircuitBreaker + fallback으로 보호.',
      '상태 변경은 Kafka 이벤트로 비동기 분리, 소비 실패 시 지수 백오프 재시도 큐·DLQ 직접 구현.',
      '다음 단계 — 인메모리 저장소를 H2/JPA로 교체, 통합 테스트 보강.',
    ],
    status: '진행 중',
  },
  {
    name: 'commerce-core',
    goal: '트랜잭션 저장 + 이벤트 발행 + 캐시 정합성 흐름 검증',
    stack: ['JPA', 'Kafka', '@CacheEvict', 'EmbeddedKafka'],
    points: [
      'JPA 트랜잭션 저장 → Kafka 이벤트 발행 → 컨슈머 재고 차감 → @CacheEvict Redis 캐시 정합성 흐름.',
      'EmbeddedKafka 통합 테스트로 발행-저장 원자성·캐시 무효화 검증.',
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
      '코딩테스트 정기 연습 (자체 학습 도구 code T 활용)',
      '발송 도메인 경험(폴링→큐, 상태머신, 멱등성)을 메시지 큐·URL 단축기·결제 멱등 표준 문제로 매핑해 언어화',
    ],
  },
  {
    title: 'JPA / Hibernate 깊이',
    icon: 'database',
    items: [
      '영속성 컨텍스트·flush·dirty checking·N+1 심화',
      'MyBatis 편중을 보완 — QueryDSL 경험을 JPA 중심 설계로 확장',
    ],
  },
  {
    title: 'Kafka · Redis 운영 수준',
    icon: 'layers',
    items: [
      '학습 3종을 k6 실측·공개까지 완성',
      '파티션 키/순서 보장, 서킷브레이커 상태 전이, 아웃박스 패턴 학습',
    ],
  },
  {
    title: '관측성 · 인프라',
    icon: 'activity',
    items: [
      'Micrometer + Prometheus + Grafana 대시보드 구성',
      'JVM 심화(G1/ZGC 로그 분석, heap dump, JFR), Docker/K8s Deployment·Helm 실습',
    ],
  },
]
