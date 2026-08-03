<script setup lang="ts">
import { navRoutes, externalNavLinks } from '@/router'
import ThemeToggle from './ThemeToggle.vue'
import logoUrl from '@/style/img/matrix_hyeon.png'
</script>

<template>
  <header class="hd">
    <div class="hd-inner container">
      <RouterLink to="/" class="brand">
        <img :src="logoUrl" class="brand-logo" alt="김현우 로고" width="36" height="36" draggable="false" />
        <span class="brand-name">김현우<span class="brand-sub">Backend</span></span>
      </RouterLink>

      <nav class="nav" aria-label="주요 메뉴">
        <RouterLink v-for="r in navRoutes" :key="r.name" :to="r.path" class="nav-link">
          {{ r.meta?.label }}
        </RouterLink>
        <a
          v-for="l in externalNavLinks"
          :key="l.label"
          :href="l.href"
          :title="l.title"
          class="nav-link nav-link-ext"
        >
          {{ l.label }}<span class="ext" aria-hidden="true">↗</span>
        </a>
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
  border-bottom: 1px solid var(--border);
}
.hd-inner {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: 16px;
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
  transition: height 0.25s ease, width 0.25s ease;
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
.nav-link:hover {
  color: var(--text);
  background: var(--surface-2);
}
.nav-link.router-link-active {
  color: var(--accent);
  font-weight: 600;
}
.nav-link-ext {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.nav-link-ext .ext {
  font-size: 0.72em;
  opacity: 0.65;
}
.hd-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
@media (max-width: 720px) {
  .brand-sub {
    display: none;
  }
  .nav {
    gap: 0;
  }
  .nav-link {
    padding: 8px 10px;
    font-size: 0.85rem;
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
