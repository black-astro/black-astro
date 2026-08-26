import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { label: 'Home' } },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue'), meta: { label: 'About' } },
  { path: '/career', name: 'career', component: () => import('@/views/CareerView.vue'), meta: { label: 'Career' } },
  { path: '/portfolio', name: 'portfolio', component: () => import('@/views/PortfolioView.vue'), meta: { label: 'Portfolio' } },
  { path: '/oss', name: 'oss', component: () => import('@/views/OssView.vue'), meta: { label: 'OSS' } },
  { path: '/growth', name: 'growth', component: () => import('@/views/GrowthView.vue'), meta: { label: 'Growth' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const navRoutes = routes.filter((r) => r.meta?.label)

/**
 * SPA 밖의 정적 페이지 주소.
 * public/ 아래 그대로 배포되는 단독 HTML이라 라우터가 아닌 <a>로 이동한다.
 *
 * 진입점은 홈의 '직접 만든 학습 자료' 카드 한 군데다.
 * (헤더·히어로에 링크를 늘어놓지 않고, 푸터는 그 섹션으로 데려가는 링크 하나만 둔다)
 * (import.meta.env.BASE_URL = vite.config 의 base = '/black-astro/')
 */
export interface Guide {
  key: string
  label: string
  emoji: string
  href: string
  title: string
  heading: string
  desc: string
  tags: string[]
  stats: { value: string; label: string }[]
}

export const guides: Guide[] = [
  {
    key: 'python',
    label: 'Python Guide',
    emoji: '🐍',
    href: `${import.meta.env.BASE_URL}python-web/`,
    title: '파이썬 · Pandas 시각 가이드 (별도 페이지)',
    heading: 'Python Visual Guide',
    desc:
      '파이썬 문법부터 Pandas·NumPy·이미지 처리·업무 자동화·PySide6 GUI(위젯과 QML/Qt Quick)·알고리즘·DB, ' +
      'FastAPI·Celery로 대규모 트래픽을 받는 법, 그리고 CPython 내부·GIL·메타클래스까지 ' +
      '데이터가 움직이는 과정을 눈으로 보면서 익히는 단일 페이지 가이드입니다.',
    tags: [
      'Python',
      'Pandas',
      'NumPy',
      '업무 자동화',
      'PySide6 · QML',
      'FastAPI',
      '대규모 트래픽',
      'CPython 내부',
    ],
    stats: [
      { value: '17', label: '주제 탭' },
      { value: '268', label: '섹션' },
      { value: '0', label: '설치 필요' },
    ],
  },
  {
    key: 'java',
    label: 'Java Guide',
    emoji: '☕',
    href: `${import.meta.env.BASE_URL}java-web/`,
    title: '자바 · Spring Boot · JPA 실전 가이드 (별도 페이지)',
    heading: 'Java Visual Guide',
    desc:
      'Java 25 문법과 가상 스레드부터 Spring Boot Web·WebFlux, JPA 심화·QueryDSL·MyBatis 전용 탭, ' +
      'Security·Gateway·JavaFX, Redis·Kafka로 대규모 트래픽을 버티는 방법, ' +
      '그리고 바이트코드·JIT·메모리 모델까지 실무에서 바로 쓰는 코드로 정리했습니다.',
    tags: [
      'Java 25',
      'Spring Boot',
      'WebFlux',
      'JPA 심화',
      'QueryDSL',
      'MyBatis',
      '대규모 트래픽',
      'JVM 내부',
    ],
    stats: [
      { value: '14', label: '주제 탭' },
      { value: '221', label: '섹션' },
      { value: '0', label: '설치 필요' },
    ],
  },
  {
    key: 'kotlin',
    label: 'Kotlin Guide',
    emoji: '🟠',
    href: `${import.meta.env.BASE_URL}kotlin-web/`,
    title: '코틀린 · 코루틴 · Spring · Android · KMP 실전 가이드 (별도 페이지)',
    heading: 'Kotlin Visual Guide',
    desc:
      '코틀린 문법과 null 안전성부터 코루틴·Flow, Spring Boot·WebFlux·JPA/Exposed, ' +
      'Jetpack Compose 안드로이드 앱과 Kotlin Multiplatform, 대규모 트래픽 운영과 ' +
      'K2 컴파일러 내부까지 서버·앱을 한 언어로 잇는 방법을 정리했습니다.',
    tags: [
      'Kotlin 2.x',
      '코루틴 · Flow',
      'Spring Boot',
      'WebFlux',
      'JPA · Exposed',
      'Jetpack Compose',
      'KMP',
      'K2 내부',
    ],
    stats: [
      { value: '12', label: '주제 탭' },
      { value: '189', label: '섹션' },
      { value: '0', label: '설치 필요' },
    ],
  },
  {
    key: 'js-ts',
    label: 'JS · TS Guide',
    emoji: '🟨',
    href: `${import.meta.env.BASE_URL}js-ts-web/`,
    title: 'JavaScript · TypeScript · Node · NestJS 실전 가이드 (별도 페이지)',
    heading: 'JS · TS Visual Guide',
    desc:
      'JavaScript 기본기와 TypeScript 타입 시스템부터 Node.js 런타임·Express·NestJS· ' +
      'React Native·Electron, C++·Rust 네이티브 확장과 음성·화면 공유·OSR 같은 ' +
      '상용 데스크탑 앱 기술, 대규모 트래픽 운영과 V8 내부 동작까지 정리했습니다.',
    tags: [
      'JavaScript',
      'TypeScript',
      'Node.js',
      'NestJS',
      'React Native',
      'Electron',
      'C++ · Rust 네이티브',
      'WebRTC · OSR',
    ],
    stats: [
      { value: '11', label: '주제 탭' },
      { value: '178', label: '섹션' },
      { value: '0', label: '설치 필요' },
    ],
  },
  {
    key: 'csharp',
    label: 'C# · Unity Guide',
    emoji: '🟣',
    href: `${import.meta.env.BASE_URL}csharp-web/`,
    title: 'C# · Unity · 게임 서버 · 데스크탑 실전 가이드 (별도 페이지)',
    heading: 'C# · Unity Visual Guide',
    desc:
      'C# 문법과 비동기·메모리부터 Unity 게임 개발과 최적화·출시, ' +
      '실시간 게임 서버(UDP·권위 서버·클라이언트 예측)와 ASP.NET Core 게임 백엔드, ' +
      'WPF 데스크탑 앱과 CLR·GC 내부까지 한 언어로 이어지는 단일 페이지 가이드입니다.',
    tags: [
      'C#',
      'Unity',
      '게임 서버',
      '실시간 동기화',
      'ASP.NET Core',
      'WPF',
      '대규모 트래픽',
      'CLR · GC 내부',
    ],
    stats: [
      { value: '10', label: '주제 탭' },
      { value: '120', label: '섹션' },
      { value: '0', label: '설치 필요' },
    ],
  },
  {
    key: 'db',
    label: 'DB Guide',
    emoji: '🗄️',
    href: `${import.meta.env.BASE_URL}db-web/`,
    title: '데이터베이스 · SQL 실전 가이드 (별도 페이지)',
    heading: 'Database Visual Guide',
    desc:
      '설치부터 SQL 기초·전문가 문법, Oracle·PostgreSQL·MySQL/MariaDB·SQLite3 각 DB의 ' +
      '방언과 운영, 인덱스·실행계획·트랜잭션 튜닝, MVCC·WAL 같은 내부 구조, ' +
      '그리고 파이썬·자바·노드 연동까지 프로그래밍을 몰라도 따라올 수 있게 정리했습니다.',
    tags: [
      'SQL',
      'Oracle',
      'PostgreSQL',
      'MySQL · MariaDB',
      'SQLite3',
      '인덱스 · 튜닝',
      '트랜잭션',
      'DB 내부 구조',
    ],
    stats: [
      { value: '10', label: '주제 탭' },
      { value: '154', label: '섹션' },
      { value: '4', label: 'DB 전용 탭' },
    ],
  },
  {
    key: 'server',
    label: 'Server Guide',
    emoji: '🌐',
    href: `${import.meta.env.BASE_URL}server-web/`,
    title: '서버기술 · 웹서버 · Kafka · MSA · 대규모 트래픽 실전 가이드 (별도 페이지)',
    heading: 'Server Tech Visual Guide',
    desc:
      '웹서버(Nginx·Apache·Tomcat·Caddy) 설치·프록시·HTTPS부터 백엔드 서버 구조, ' +
      'Kafka 로 하는 대규모 데이터 처리, MSA 설계, 로드밸런싱·무중단 배포, ' +
      '대규모 트래픽 처리까지 — 언어와 무관한 서버 기술을 한 페이지로 다룹니다.',
    tags: [
      'Nginx',
      'Kafka',
      'MSA',
      '대규모 트래픽',
      'HTTPS · 인증서',
      '로드밸런싱',
      '무중단 배포',
      '보안 운영',
    ],
    stats: [
      { value: '14', label: '주제 탭' },
      { value: '186', label: '섹션' },
      { value: '3', label: 'MSA·Kafka·대규모' },
    ],
  },
  {
    key: 'cpp',
    label: 'C / C++ Guide',
    emoji: '🔵',
    href: `${import.meta.env.BASE_URL}cpp-web/`,
    title: 'C · C++ 종합 가이드 — 서버 · 게임 서버 · 고성능 시스템 · 네이티브 모듈 (별도 페이지)',
    heading: 'C / C++ Visual Guide',
    desc:
      '가장 빠른 코드가 필요한 자리에 여전히 서 있는 언어를 한 페이지로 다룹니다. ' +
      '설치와 환경 세팅(MSVC·MSYS2·CMake·vcpkg)부터 C 언어 26개 섹션, 왕기초 문법과 ' +
      '현대 C++(RAII·스마트 포인터·이동), Drogon·Asio·gRPC 로 만드는 백엔드 서버, ' +
      'IOCP·넷코드·매치메이킹까지 다루는 게임 서버, 락프리·SIMD·CUDA·io_uring 고성능 시스템, ' +
      '그리고 pybind11·N-API·C ABI 로 파이썬·Node 에서 불러 쓰는 모듈까지 이어집니다.',
    tags: [
      'C17 · C23',
      'C++23',
      '설치 · CMake · vcpkg',
      'Drogon · Asio 서버',
      '게임 서버 · IOCP',
      '락프리 · SIMD · CUDA',
      'pybind11 · N-API',
      'C ABI · FFI',
    ],
    stats: [
      { value: '16', label: '주제 탭' },
      { value: '201', label: '섹션' },
      { value: '7', label: '실전 · 모듈 탭' },
    ],
  },
  {
    key: 'rust',
    label: 'Rust Guide',
    emoji: '🦀',
    href: `${import.meta.env.BASE_URL}rust-web/`,
    title: 'Rust 가이드 — 설치 · Axum 서버 · 고성능 서비스 · Tauri · 네이티브 모듈 (별도 페이지)',
    heading: 'Rust Visual Guide',
    desc:
      'C++ 만큼 빠르면서 메모리 사고와 데이터 레이스를 컴파일 단계에서 막는 언어를 한 페이지로 다룹니다. ' +
      'rustup 설치와 환경 세팅부터 왕기초 문법과 소유권·빌림·트레이트, Axum 0.8 + sqlx 로 만드는 ' +
      '백엔드 서버와 JWT·OpenAPI·관측·Docker 배포, Tokio 내부와 락프리·Kafka·Polars 고성능 서비스, ' +
      'Tauri 2 로 만드는 데스크톱 앱, 그리고 PyO3·napi-rs·C ABI 로 파이썬·Node 에서 불러 쓰는 ' +
      '모듈까지 이어집니다.',
    tags: [
      '설치 · rustup',
      '소유권 · 빌림',
      'Axum · sqlx',
      'Tokio · 락프리',
      'Tauri 2 데스크톱',
      'PyO3 · maturin',
      'napi-rs · WASM',
      'C ABI · unsafe',
    ],
    stats: [
      { value: '13', label: '주제 탭' },
      { value: '150', label: '섹션' },
      { value: '3', label: '실전 탭' },
    ],
  },
  {
    key: 'cs',
    label: 'CS Guide',
    emoji: '🎓',
    href: `${import.meta.env.BASE_URL}cs-web/`,
    title: 'CS 기술 · 컴퓨터 과학 기본기 종합 가이드 (별도 페이지)',
    heading: 'CS 기술 Visual Guide',
    desc:
      '언어에 종속되지 않는 컴퓨터 과학 기본기를 한 페이지에 모았습니다. ' +
      '이산수학·선형대수·확률 같은 프로그래밍에 필요한 수학부터 계산이론과 빅오, ' +
      '자료구조·알고리즘, 컴퓨터구조·캐시·부동소수점 같은 하드웨어, ' +
      '운영체제와 네트워크, 컴파일러·GC·타입 시스템, 암호와 보안, ' +
      '분산·동시성, 소프트웨어 공학까지 실무에서 마주치는 자리와 함께 정리했습니다.',
    tags: [
      '이산수학',
      '자료구조 · 알고리즘',
      '빅오 · 계산이론',
      '컴퓨터구조 · 캐시',
      '운영체제',
      '네트워크 · TCP/TLS',
      '보안 · 암호',
      '분산 · 동시성',
    ],
    stats: [
      { value: '12', label: '주제 탭' },
      { value: '156', label: '섹션' },
      { value: '0', label: '언어 종속' },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
