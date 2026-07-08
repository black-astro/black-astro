<script setup lang="ts">
import { links, profile } from '@/data/profile'
import AppIcon from './AppIcon.vue'
</script>

<template>
  <footer class="ft">
    <div class="container ft-inner">
      <div class="ft-top">
        <div class="ft-brand">
          <div class="ft-name">{{ profile.name }} · {{ profile.role }}</div>
          <p class="ft-desc">{{ profile.company }} — {{ profile.companyDesc }} · {{ profile.tenure }}</p>
        </div>
        <div class="ft-links">
          <a v-for="l in links" :key="l.label" :href="l.href" class="ft-link" target="_blank" rel="noopener">
            <AppIcon :name="l.icon" :size="16" />
            <span>{{ l.value }}</span>
          </a>
        </div>
      </div>
      <div class="ft-bottom">
        <span>© {{ new Date().getFullYear() }} {{ profile.name }}. Built with Vue 3 · TypeScript · Vite.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ft {
  border-top: 1px solid var(--border);
  background: var(--surface);
  padding: 40px 0 48px;
}
.ft-top {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 22px;
}
.ft-name {
  font-weight: 700;
  font-size: 1.05rem;
}
.ft-desc {
  color: var(--text-muted);
  font-size: 0.88rem;
  margin-top: 4px;
}
.ft-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ft-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-family: var(--font-mono);
  transition: color 0.18s ease;
}
.ft-link:hover {
  color: var(--accent);
}
.ft-bottom {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>
