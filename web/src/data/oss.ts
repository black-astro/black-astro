// 직접 만들어 공개한 것들

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
    tagline: 'Spring Boot Starter · Maven Central',
    lang: 'Java',
    badges: [
      { label: 'Maven Central 0.0.2', kind: 'primary' },
      { label: 'Apache-2.0', kind: 'default' },
      { label: 'Spring Boot Starter', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/easy-quartz',
    desc:
      '@EasyQuartzScheduled 하나로 다섯 가지 스케줄(CRON, FIXED_RATE, FIXED_DELAY, CALENDAR, DAILY_TIME)과 Quartz/Spring TaskScheduler 두 엔진을 같은 방식으로 쓰게 해 주는 Starter입니다. 회사 일과 별개로 혼자 만들고 있습니다.',
    points: [
      'autoconfigure, starter, sample 세 모듈로 나누고 Spring Boot 방식의 Auto-Configuration을 따랐습니다.',
      '스케줄 메서드를 직접 호출하면 AOP 프록시가 우회돼 트랜잭션이 안 걸리던 문제를, 빈을 꺼내 대상 클래스 시그니처를 확인하는 방식으로 풀었습니다.',
      'Job 단위 잠금, 지수 백오프 재시도, Micrometer 메트릭, Actuator 엔드포인트, JDBC JobStore 클러스터링을 지원합니다. Misfire 정책은 Cron·Simple 각 3종입니다.',
      '태그를 push하면 GPG 서명을 거쳐 Sonatype Central까지 자동으로 올라갑니다.',
    ],
    install: {
      lang: 'gradle',
      code: 'implementation "io.github.black-astro:easy-quartz-spring-boot-starter:0.0.2"',
    },
    featured: true,
  },
  {
    name: 'smart-msg',
    tagline: 'Git 커밋 메시지 CLI · npm',
    lang: 'TypeScript',
    badges: [
      { label: 'npm 1.3.0', kind: 'primary' },
      { label: 'CLI: sm', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/smart-msg',
    desc:
      '스테이징된 변경을 읽고 커밋 메시지를 제안해 주는 CLI입니다. OpenAI, Claude, Gemini, Groq, Ollama 중 골라 쓸 수 있고 Conventional Commits와 한/영 출력을 지원합니다.',
    points: [
      '프로바이더마다 API가 달라서 공통 인터페이스 뒤에 숨겼습니다.',
      'TypeScript로 만들어 npm에 올렸고, 테스트와 CI 워크플로가 같이 돌아갑니다.',
    ],
    install: {
      lang: 'bash',
      code: 'npm install -g smart-msg   # 사용: sm',
    },
    featured: false,
  },
  {
    name: 'claude-statusline-astro',
    tagline: 'Claude Code 상태줄 플러그인',
    lang: 'Shell · PowerShell',
    badges: [
      { label: 'MIT', kind: 'primary' },
      { label: 'Windows · macOS · Linux', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/claude-statusline-astro',
    desc:
      'Claude Code 하단 상태줄을 원하는 정보로 채워 주는 플러그인입니다. 마켓플레이스로 설치할 수 있습니다.',
    points: [
      'Bash와 PowerShell로 같은 동작을 두 번 구현해 세 운영체제에서 똑같이 보이게 맞췄습니다.',
      '테스트 스크립트를 같이 두고 태그 단위로 릴리즈하고 있습니다.',
    ],
    featured: false,
  },
  {
    name: 'code T',
    tagline: '코딩테스트 연습 데스크톱 앱 · PySide6',
    lang: 'Python',
    badges: [
      { label: 'v1.3.0', kind: 'primary' },
      { label: '자동 채점', kind: 'default' },
    ],
    repo: 'https://github.com/black-astro/coding-test',
    desc:
      '문법부터 자료구조, 알고리즘까지 단계별로 풀어 보는 데스크톱 앱입니다. 케이스마다 실행 시간(ms)과 최대 메모리를 재는 채점기를 Python, Java, C++, JavaScript 네 언어로 직접 만들었습니다.',
    points: [
      '문제 357개(코딩테스트 326, SQL 50 포함 / 데이터분석 31)와 강의 212개를 넣었고, SQL 문제는 내장 sqlite로 채점합니다.',
      '데이터분석 트랙의 회귀, 분류, 군집, PCA, CNN, RNN, 트랜스포머는 sklearn이나 torch 없이 numpy로만 구현했습니다.',
    ],
    featured: false,
  },
]

export const ossNote =
  'ShadowPort는 공개하지 않은 개인 프로젝트입니다. 오래된 리버스 터널 구조를 Java 21과 Netty로 다시 설계하면서 프레임 멀티플렉싱, AES-256-GCM, X25519 세션 키 합의를 붙여 봤습니다.'
