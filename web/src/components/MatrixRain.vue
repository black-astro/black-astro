<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()

const el = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drops: number[] = []
let raf = 0
let last = 0
let running = false
const fontSize = 15
const glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈ0123456789<>=/\\{}[]$#*+'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function resize() {
  const c = el.value
  if (!c) return
  c.width = window.innerWidth
  c.height = window.innerHeight
  const cols = Math.ceil(c.width / fontSize)
  drops = Array.from({ length: cols }, () => Math.floor((Math.random() * -c.height) / fontSize))
}

function frame(t: number) {
  if (!running || !ctx || !el.value) return
  raf = requestAnimationFrame(frame)
  // 약 22fps로 제한 (은은하게 + 저부하)
  if (t - last < 45) return
  last = t

  const c = el.value
  // 잔상 페이드
  ctx.fillStyle = 'rgba(8, 11, 8, 0.11)'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.font = `${fontSize}px 'JetBrains Mono', monospace`

  for (let i = 0; i < drops.length; i++) {
    const ch = glyphs[Math.floor(Math.random() * glyphs.length)]
    const x = i * fontSize
    const y = drops[i] * fontSize
    // 선두 글자는 밝게, 나머지는 어둑한 그린
    ctx.fillStyle = Math.random() > 0.975 ? 'rgba(140, 255, 180, 0.9)' : 'rgba(46, 224, 106, 0.55)'
    ctx.fillText(ch, x, y)
    if (y > c.height && Math.random() > 0.975) drops[i] = 0
    drops[i]++
  }
}

function start() {
  if (running || reduceMotion) return
  running = true
  last = 0
  raf = requestAnimationFrame(frame)
}

function stop() {
  running = false
  cancelAnimationFrame(raf)
  if (ctx && el.value) ctx.clearRect(0, 0, el.value.width, el.value.height)
}

function onResize() {
  resize()
}

onMounted(() => {
  const c = el.value
  if (!c) return
  ctx = c.getContext('2d')
  resize()
  window.addEventListener('resize', onResize)
  if (theme.value === 'dark') start()
})

watch(theme, (t) => {
  if (t === 'dark') start()
  else stop()
})

onBeforeUnmount(() => {
  stop()
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas ref="el" class="rain" aria-hidden="true"></canvas>
</template>

<style scoped>
.rain {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.38;
  /* 중앙(콘텐츠 영역)은 비우고 좌우 사이드에만 보이게 */
  -webkit-mask-image: linear-gradient(90deg, #000 0%, transparent 15%, transparent 85%, #000 100%);
  mask-image: linear-gradient(90deg, #000 0%, transparent 15%, transparent 85%, #000 100%);
}
/* 라이트 테마에서는 숨김 (start/stop으로 렌더도 중단) */
:root[data-theme='light'] .rain {
  display: none;
}
</style>
