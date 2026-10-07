<script setup lang="ts">
import { navRoutes } from '@/router'
import ThemeToggle from './ThemeToggle.vue'
import logoUrl from '@/style/img/matrix_hyeon.png'
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 스크롤을 내리면 헤더를 낮추고 배경을 진하게
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 24)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <header class="hd" :class="{ scrolled }">
    <div class="hd-inner container">
      <RouterLink to="/" class="brand">
        <img :src="logoUrl" class="brand-logo" alt="김현우 로고" width="36" height="36" draggable="false" />
        <span class="brand-name">김현우<span class="brand-sub">Backend</span></span>
      </RouterLink>

      <nav class="nav" aria-label="주요 메뉴">
        <RouterLink v-for="r in navRoutes" :key="r.name" :to="r.path" class="nav-link">
          {{ r.meta?.label }}
        </RouterLink>
      </nav>

      <div class="hd-right">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<style scoped>
.hd {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.hd.scrolled {
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  border-bottom-color: var(--border);
  box-shadow: 0 6px 24px -18px rgba(0, 0, 0, 0.6);
}
.hd-inner {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: height 0.3s ease;
}
.hd.scrolled .hd-inner {
  height: 52px;
}
.brand:hover .brand-logo {
  transform: rotate(-8deg) scale(1.06);
}
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 800;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}
.brand-logo {
  height: 36px;
  width: 36px;
  object-fit: contain;
  display: block;
  /* 축소 시 부드러운 리샘플링(픽셀 깨짐 방지) + 리사이즈 전환 매끄럽게 */
  image-rendering: auto;
  -webkit-user-drag: none;
  transition: height 0.25s ease, width 0.25s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.brand-name {
  display: flex;
  align-items: baseline;
  gap: 7px;
  font-size: 1.02rem;
}
.brand-sub {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  overflow-x: auto;
  scrollbar-width: none;
}
.nav::-webkit-scrollbar {
  display: none;
}
.nav-link {
  position: relative;
  padding: 8px 13px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
  transition: color 0.18s ease, background 0.18s ease;
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 13px;
  right: 13px;
  bottom: 3px;
  height: 2px;
  border-radius: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-link:hover {
  color: var(--text);
}
.nav-link:hover::after {
  transform: scaleX(0.5);
}
.nav-link.router-link-active {
  color: var(--accent);
  font-weight: 600;
}
.nav-link.router-link-active::after {
  transform: scaleX(1);
}
.hd-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
/* 좁은 화면에서는 메뉴를 둘째 줄로 내린다.
   가로 스크롤(overflow-x)로 두면 스크롤바가 숨겨져 있어서
   마지막 항목(Python Guide)이 화면 밖으로 잘린 채 존재조차 안 보인다. */
@media (max-width: 900px) {
  .hd-inner {
    height: auto;
    min-height: var(--nav-h);
    flex-wrap: wrap;
    padding-top: 9px;
    padding-bottom: 9px;
    row-gap: 4px;
  }
  .nav {
    order: 3;
    width: 100%;
    margin-left: 0;
    flex-wrap: wrap;
    overflow-x: visible;
    gap: 2px;
  }
  .hd-right {
    margin-left: auto;
  }
}
@media (max-width: 720px) {
  .brand-sub {
    display: none;
  }
  .nav-link {
    padding: 7px 9px;
    font-size: 0.85rem;
  }
}
/* 메뉴가 두 줄이 되는 구간 — sticky 헤더가 화면을 많이 먹지 않게 압축 */
@media (max-width: 560px) {
  .hd-inner {
    padding-top: 6px;
    padding-bottom: 6px;
    row-gap: 0;
  }
  .nav-link {
    padding: 6px 8px;
    font-size: 0.82rem;
  }
}
@media (max-width: 480px) {
  .hd-inner {
    gap: 8px;
  }
  .brand-name {
    font-size: 0.95rem;
  }
  .brand-logo {
    height: 30px;
    width: 30px;
  }
}
</style>
