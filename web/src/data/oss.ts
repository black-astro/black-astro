// 오픈소스 활동 — easy-quartz · smart-msg · code T

export interface OssProject {
  name: string
  tagline: string
  lang: string
  badges: { label: string; kind: 'primary' | 'default' }[]
  repo: string
  desc: string
  points: string[]
  install?: { lang: string; code: string }
  featured: boolean
}

export const ossProjects: OssProject[] = [
  {
    name: 'easy-quartz',
    tagline: 'Spring Boot Starter · Maven Central 정식 배포',
    lang: 'Java',
    badges: [
      { label: 'Maven Central', kind: 'primary' },
      { label: 'Apache-2.0', kind: 'default' },
      { label: 'Spring Boot Starter', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/easy-quartz',
    desc:
      '@EasyQuartzScheduled 어노테이션 하나로 5종 스케줄(CRON/FIXED_RATE/FIXED_DELAY/CALENDAR/DAILY_TIME) × 2엔진(Quartz/Spring TaskScheduler)을 단일 추상화로 통합한 Spring Boot Starter. 단독 설계·구현·배포·유지보수.',
    points: [
      'autoconfigure / starter / sample 3-tier 멀티모듈, SPI 기반 Auto-Configuration으로 Spring Boot 관례 준수.',
      'AOP 프록시 우회 문제를 getBean() + AopUtils.getTargetClass() 시그니처 검사로 해결 — 트랜잭션·캐시 어드바이스 보존.',
      'FIXED_DELAY를 Quartz rescheduleJob으로 직접 구현, Misfire 4종·DST·jitter·requestRecovery 지원.',
      '태그 push → GPG 서명 → Sonatype Central 배포까지 릴리즈 파이프라인을 GitHub Actions로 무인 자동화.',
    ],
    install: {
      lang: 'gradle',
      code: 'implementation "io.github.black-astro:easy-quartz-spring-boot-starter:0.0.2"',
    },
    featured: true,
  },
  {
    name: 'smart-msg',
    tagline: 'AI Git 커밋 메시지 생성 CLI · npm',
    lang: 'TypeScript',
    badges: [
      { label: 'npm', kind: 'primary' },
      { label: 'CLI: sm', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/smart-msg',
    desc:
      '다중 LLM(OpenAI · Claude · Gemini · Groq · Ollama)을 지원하는 AI Git 커밋 메시지 생성 CLI. Conventional Commits · 한/영 출력 지원.',
    points: [
      '스테이징된 diff를 분석해 컨벤셔널 커밋 메시지를 제안, 프로바이더별 API 추상화.',
      'TypeScript로 구현, npm 배포.',
    ],
    install: {
      lang: 'bash',
      code: 'npm install -g smart-msg   # 사용: sm',
    },
    featured: false,
  },
  {
    name: 'code T',
    tagline: '코딩테스트 학습 데스크톱 앱 · PySide6',
    lang: 'Python',
    badges: [
      { label: 'PySide6', kind: 'primary' },
      { label: '자동 채점', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/coding-test',
    desc:
      'PySide6 기반 코딩 테스트 연습 데스크톱 앱. 문법→자료구조→알고리즘 단계 학습, 케이스별 실행 시간(ms)·최대 메모리까지 측정하는 자동 채점 엔진(Python · Java · C++ · JavaScript)을 직접 구현.',
    points: [
      '4개 언어 자동 채점 엔진 — 테스트 케이스별 실행시간·최대 메모리 실측. SQL은 내장 sqlite로 채점.',
      '문제 357종(코딩테스트 326 · SQL 실전 50제 포함 / 데이터분석 31) · 강의 212종(문법 155 / 데이터분석 57) 수록.',
      '데이터분석 트랙은 회귀·분류·군집·PCA·CNN·RNN·트랜스포머를 sklearn/torch 없이 numpy로 직접 구현. PyInstaller 배포본 제공.',
    ],
    featured: false,
  },
]

export const ossNote =
  '그 외 ShadowPort — 레거시 리버스 터널을 Java 21 · Netty · AES-GCM / X25519 · JavaFX로 재설계한 네트워크·보안 사이드 프로젝트 (비공개).'
