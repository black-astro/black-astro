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
 * (import.meta.env.BASE_URL = vite.config 의 base = '/black-astro/')
 *
 * 진입점이 헤더·홈 히어로·홈 카드·푸터 네 군데라 주소는 여기 한 곳에서만 정의한다.
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
      '파이썬 문법부터 Pandas·NumPy·이미지 처리·업무 자동화·PySide6 GUI·알고리즘·DB, ' +
      'FastAPI·Celery로 대규모 트래픽을 받는 법, 그리고 CPython 내부·GIL·메타클래스까지 ' +
      '데이터가 움직이는 과정을 눈으로 보면서 익히는 단일 페이지 가이드입니다.',
    tags: [
      'Python',
      'Pandas',
      'NumPy',
      '업무 자동화',
      'PySide6',
      'FastAPI',
      '대규모 트래픽',
      'CPython 내부',
    ],
    stats: [
      { value: '14', label: '주제 탭' },
      { value: '200', label: '섹션' },
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
      'Java 25 문법과 가상 스레드부터 Spring Boot Web·WebFlux·JPA/QueryDSL·MyBatis· ' +
      'Security·Gateway·JavaFX, Redis·Kafka로 대규모 트래픽을 버티는 방법, ' +
      '그리고 바이트코드·JIT·메모리 모델까지 실무에서 바로 쓰는 코드로 정리했습니다.',
    tags: [
      'Java 25',
      'Spring Boot',
      'WebFlux',
      'JPA · QueryDSL',
      'Security',
      '대규모 트래픽',
      'JVM 내부',
      'JavaFX',
    ],
    stats: [
      { value: '11', label: '주제 탭' },
      { value: '159', label: '섹션' },
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
      'React Native·Electron, 그리고 대규모 트래픽 운영과 V8 내부 동작까지 ' +
      '전문가 영역을 실무 코드로 정리했습니다.',
    tags: [
      'JavaScript',
      'TypeScript',
      'Node.js',
      'NestJS',
      'React Native',
      'Electron',
      '대규모 트래픽',
      'V8 · 성능',
    ],
    stats: [
      { value: '10', label: '주제 탭' },
      { value: '152', label: '섹션' },
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
      { value: '153', label: '섹션' },
      { value: '4', label: 'DB 전용 탭' },
    ],
  },
  {
    key: 'server',
    label: 'Server Guide',
    emoji: '🌐',
    href: `${import.meta.env.BASE_URL}server-web/`,
    title: '웹서버 · Nginx · Apache · Tomcat · Caddy 실전 가이드 (별도 페이지)',
    heading: 'Web Server Visual Guide',
    desc:
      '웹서버 설치부터 리버스 프록시·HTTPS 인증서 발급과 갱신, 언어별(Java·Python·Node·PHP) ' +
      '배포 전 과정, 성능 튜닝과 보안 운영, 그리고 epoll·HTTP/3·로드밸런싱 같은 ' +
      '내부 동작까지 Nginx·Apache·Tomcat·Caddy 를 한 페이지로 다룹니다.',
    tags: [
      'Nginx',
      'Apache',
      'Tomcat',
      'Caddy',
      'HTTPS · 인증서',
      '리버스 프록시',
      '성능 튜닝',
      '보안 운영',
    ],
    stats: [
      { value: '10', label: '주제 탭' },
      { value: '138', label: '섹션' },
      { value: '4', label: '서버 전용 탭' },
    ],
  },
]

export const externalNavLinks = guides.map((g) => ({
  label: g.label,
  href: g.href,
  title: g.title,
}))

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
