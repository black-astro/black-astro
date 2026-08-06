<script setup lang="ts">
import { nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { links, profile } from '@/data/profile'
import AppIcon from './AppIcon.vue'

const route = useRoute()
const router = useRouter()

/**
 * 가이드를 하나하나 나열하는 대신 '학습 가이드' 링크 하나만 둔다.
 * 홈의 학습 자료 섹션(#guides)이 실제 목록이므로 그리로 데려간다.
 */
async function goGuides() {
  if (route.path !== '/') await router.push('/')
  await nextTick()
  document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <footer class="ft">
    <div class="container ft-inner">
      <div class="ft-left">
        <span class="ft-name">{{ profile.name }} · {{ profile.role }}</span>
      </div>
      <div class="ft-links">
        <a href="#/" class="ft-link ft-guide" title="직접 만든 학습 가이드 모음" @click.prevent="goGuides">
          <span aria-hidden="true">📚</span>
          <span>학습 가이드</span>
        </a>
        <a v-for="l in links" :key="l.label" :href="l.href" class="ft-link" target="_blank" rel="noopener">
          <AppIcon :name="l.icon" :size="15" />
          <span>{{ l.value }}</span>
        </a>
      </div>
    </div>
    <div class="container ft-copy">
      © {{ new Date().getFullYear() }} {{ profile.name }} · Vue 3 · TypeScript · Vite
    </div>
  </footer>
</template>

<style scoped>
.ft {
  border-top: 1px solid var(--border);
  background: var(--surface);
  padding: 20px 0 22px;
}
.ft-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 18px;
}
.ft-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.86rem;
}
.ft-name {
  font-weight: 700;
}
.ft-sep {
  color: var(--text-muted);
}
.ft-meta {
  color: var(--text-muted);
}
.ft-links {
  display: flex;
  align-items: center;
  gap: 16px;
}
.ft-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-family: var(--font-mono);
  transition: color 0.18s ease;
}
.ft-link:hover {
  color: var(--accent);
}
.ft-guide {
  color: var(--accent);
}
.ft-copy {
  margin-top: 10px;
  color: var(--text-muted);
  font-size: 0.74rem;
  font-family: var(--font-mono);
}
@media (max-width: 560px) {
  .ft-inner {
    gap: 6px;
  }
  .ft-links {
    gap: 12px;
  }
}
</style>
