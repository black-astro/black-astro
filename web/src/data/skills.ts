// 핵심 역량 · 보유 기술 — 이력서 기반

export interface Competency {
  title: string
  icon: string
  desc: string
}

export const competencies: Competency[] = [
  {
    title: '대용량 배치 처리',
    icon: 'layers',
    desc: '규모별 파싱 전략 분리(텍스트/JAXB/StAX 스트리밍), 파서 풀 + 단일 라이터 파이프라인으로 DB 커밋 경합 제거, MyBatis BATCH·direct-path INSERT 적재.',
  },
  {
    title: 'DB · SQL 튜닝',
    icon: 'database',
    desc: 'PL/SQL 프로시저 5종 직접 작성. 커서 루프를 집합 기반(MERGE)으로 재설계하고 DB 세션 제약을 청크 커밋·재개 구조로 우회, 복합인덱스 재설계로 회차 누적 스캔 제거.',
  },
  {
    title: '인증 · 인가 설계',
    icon: 'shield',
    desc: '단일 백엔드에서 SecurityFilterChain 3종(OpenAPI/Electron/어드민) 분리 운영, JWT 발급·검증 책임 분리, 수신자 열람용 토큰 검증 커스텀 필터.',
  },
  {
    title: '동시성 · 운영 안정성',
    icon: 'activity',
    desc: '다중 워커 분산 + 조건부 UPDATE로 락 없는 race 차단, 발송 상태머신·멱등 INSERT·graceful shutdown, 인프라 제약 하 캐시 전략 전환(Redis 검증→Caffeine 선제 갱신).',
  },
  {
    title: '빌드 · 품질 · 인프라',
    icon: 'settings',
    desc: 'Jenkins + SonarQube Quality Gate + JaCoCo + SBOM 파이프라인, Jasypt 설정 암호화, 폐쇄망 오프라인 설치 자동화.',
  },
  {
    title: '레거시 현대화',
    icon: 'refresh',
    desc: '델파이 월 배치를 Java로 재구축, 관리자 콘솔 JSP→Vue2→Vue3 3세대 전환, 전임 보험사 발송 엔진 인수·재구축을 주도.',
  },
]

export interface SkillGroup {
  category: string
  items: string[]
}

export const skillGroups: SkillGroup[] = [
  {
    category: 'Language',
    items: ['Java 8 / 21 (LTS)', 'TypeScript / JavaScript', 'SQL · PL/SQL'],
  },
  {
    category: 'Framework',
    items: [
      'Spring Boot 2.7~3.4',
      'Spring MVC',
      'Spring Security (OAuth2 · JWT)',
      'Spring AOP',
      'Scheduling',
      'Integration (SFTP)',
      'WebSocket (STOMP)',
    ],
  },
  {
    category: 'Persistence · DB',
    items: ['MyBatis (BATCH)', 'Spring Data JPA + QueryDSL', 'Tibero 6', 'Oracle', 'MariaDB', 'HikariCP', 'Caffeine'],
  },
  {
    category: '대용량 · 동시성',
    items: [
      'StAX / JAXB',
      'ThreadPoolTaskScheduler',
      'producer-consumer (BlockingQueue)',
      'Netty 4.1',
    ],
  },
  {
    category: 'Build · CI · 품질',
    items: ['Gradle', 'Jenkins', 'SonarQube', 'JaCoCo', 'CycloneDX SBOM', 'GitHub Actions'],
  },
  {
    category: 'Infra · DevOps',
    items: ['Docker', 'Gitea', 'Nginx', 'PostgreSQL', 'CentOS / Ubuntu / Rocky', 'VMware', '폐쇄망 오프라인 설치 자동화'],
  },
  {
    category: 'Frontend · Desktop',
    items: ['Vue 3', 'Vuetify', 'Pinia', 'Electron'],
  },
  {
    category: 'Test · OSS',
    items: ['JUnit5', 'Mockito', 'AssertJ', 'Playwright (E2E)', 'Maven Central · npm 배포'],
  },
]
