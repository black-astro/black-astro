<script setup lang="ts">
import { navRoutes } from '@/router'
import ThemeToggle from './ThemeToggle.vue'
</script>

<template>
  <header class="hd">
    <div class="hd-inner container">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">&lt;/&gt;</span>
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
.brand-mark {
  font-family: var(--font-mono);
  color: var(--accent);
  font-size: 1rem;
  font-weight: 700;
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
}
</style>
