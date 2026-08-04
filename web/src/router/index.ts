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
      '그리고 FastAPI·Celery로 대규모 트래픽을 받는 법까지 ' +
      '데이터가 움직이는 과정을 눈으로 보면서 익히는 단일 페이지 가이드입니다.',
    tags: [
      'Python',
      'Pandas',
      'NumPy',
      '업무 자동화',
      'PySide6',
      'FastAPI',
      '대규모 트래픽',
      'SQL',
    ],
    stats: [
      { value: '11', label: '주제 탭' },
      { value: '161', label: '섹션' },
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
      'Security·Gateway·POI 엑셀·JavaFX, 그리고 Redis·Kafka·분산 락으로 대규모 트래픽을 ' +
      '버티는 방법까지 실무에서 바로 쓰는 코드로 정리했습니다.',
    tags: [
      'Java 25',
      'Spring Boot',
      'WebFlux',
      'JPA · QueryDSL',
      'Security',
      '대규모 트래픽',
      'Redis · Kafka',
      'JavaFX',
    ],
    stats: [
      { value: '10', label: '주제 탭' },
      { value: '134', label: '섹션' },
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
      '초고급 영역을 실무 코드로 정리했습니다.',
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
      { value: '146', label: '섹션' },
      { value: '0', label: '설치 필요' },
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
