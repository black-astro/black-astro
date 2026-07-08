<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import AppIcon from './AppIcon.vue'

const { theme, toggle } = useTheme()
</script>

<template>
  <button class="toggle" :aria-label="theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'" @click="toggle">
    <AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}
.toggle:hover {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}
</style>
