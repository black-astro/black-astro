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
export const GUIDE_URL = `${import.meta.env.BASE_URL}python-guide/`
export const GUIDE_TITLE = '파이썬 · Pandas 시각 가이드 (별도 페이지)'

export const externalNavLinks = [{ label: 'Python Guide', href: GUIDE_URL, title: GUIDE_TITLE }]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
