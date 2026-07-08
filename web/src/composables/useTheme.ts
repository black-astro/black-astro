import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'ba-theme'

function resolveInitial(): ThemeMode {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  // 저장된 선택이 없으면 무조건 다크(매트릭스) 기본
  return 'dark'
}

const theme = ref<ThemeMode>('light')

function apply(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode)
  theme.value = mode
}

export function initTheme() {
  apply(resolveInitial())
}

export function useTheme() {
  function toggle() {
    const next: ThemeMode = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    apply(next)
  }
  return { theme, toggle }
}
