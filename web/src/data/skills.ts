// 주로 하는 일 · 쓰는 도구

export interface Competency {
  title: string
  icon: string
  desc: string
}

export const competencies: Competency[] = [
  {
    title: '동시성과 정합성',
    icon: 'activity',
    desc: '여러 워커가 같은 건을 가져가지 않게 조건부 UPDATE로 상태를 바꾸고, 같은 작업이 동시에 들어오면 공정 락으로 순서대로 처리합니다. 외부 API 호출은 트랜잭션 밖에서 합니다.',
  },
  {
    title: 'DB와 프로시저',
    icon: 'database',
    desc: 'Tibero·Oracle 프로시저가 같이 돌아가는 서비스를 매일 다룹니다. 커서 루프를 집합 기반으로 바꾸고, 인덱스 컬럼 순서를 다시 잡고, 로그에 원인이 남지 않은 장애도 끝까지 추적합니다.',
  },
  {
    title: '운영 중인 서버 고치기',
    icon: 'refresh',
    desc: '멈출 수 없는 서버는 테스트를 먼저 만들고 조금씩 커밋하면서 정리합니다. 델파이 배치를 Java로 다시 만들었고, 관리자 화면은 JSP에서 Vue3까지 바꿔 왔습니다.',
  },
  {
    title: '대용량 배치',
    icon: 'layers',
    desc: '파일 크기에 따라 읽는 방법을 나누고(텍스트, JAXB, StAX), 여러 파서와 라이터 하나를 큐로 연결합니다. 튜닝으로 더 줄지 않으면 처리 위치부터 다시 봅니다.',
  },
  {
    title: '인증과 인가',
    icon: 'shield',
    desc: '백엔드 하나에서 SecurityFilterChain을 클라이언트별로 나누고, 토큰 수명과 갱신, 1회용 코드 로그인까지 클라이언트와 맞춥니다.',
  },
  {
    title: '빌드와 서버 운영',
    icon: 'settings',
    desc: 'Jenkins와 SonarQube로 빌드할 때마다 품질 기준을 확인하고, 웹·WAS 서버를 동료들과 같이 운영합니다. 폐쇄망 설치도 스크립트로 만들어 뒀습니다.',
  },
]

export interface SkillGroup {
  category: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    category: 'Language',
    items: ['Java 8 / 21', 'SQL · PL/SQL', 'Kotlin', 'TypeScript'],
  },
  {
    category: 'Framework',
    items: [
      'Spring Boot 2.7~3.5 (Kotlin 서비스는 4.1)',
      'Spring MVC',
      'Spring Security (OAuth2 · JWT)',
      'Spring AOP',
      'Scheduling · Async',
      'Integration (SFTP)',
      'WebSocket (STOMP)',
    ],
  },
  {
    category: 'DB (주로 쓰는 것)',
    items: ['Tibero 6', 'Oracle', 'PL/SQL 프로시저 · UDF'],
  },
  {
    category: 'DB (써 본 것)',
    items: ['MariaDB', 'SQLite', 'PostgreSQL', 'Redis (검증 후 Caffeine으로 전환)'],
  },
  {
    category: 'Persistence',
    items: ['MyBatis (BATCH)', 'Spring Data JPA + QueryDSL', 'HikariCP', 'Caffeine'],
  },
  {
    category: '대용량 · 동시성',
    items: ['StAX / JAXB', 'ThreadPoolTaskScheduler', 'BlockingQueue 파이프라인', 'ReentrantLock · TransactionTemplate'],
  },
  {
    category: 'Build · CI · 품질',
    items: ['Gradle', 'Jenkins', 'SonarQube', 'JaCoCo', 'CycloneDX SBOM', 'GitHub Actions'],
  },
  {
    category: 'Infra',
    items: ['Docker', 'Gitea', 'Nginx', 'Apache · Tomcat', 'CentOS / Ubuntu / Rocky', 'VMware'],
  },
  {
    category: 'Frontend · Desktop',
    items: ['Vue 3 (TypeScript)', 'Vuetify', 'Pinia', 'Electron (TypeScript)'],
  },
  {
    category: 'Test',
    items: ['JUnit5', 'Mockito', 'AssertJ', 'MyBatis 매퍼 바인딩 · SQL 스모크 테스트', 'Playwright'],
  },
  {
    category: '공부 중',
    items: ['Kafka', 'Redis (분산 캐시 · rate limit)', 'Spring Cloud (Eureka · Gateway)', 'Resilience4j', 'k6'],
  },
]
