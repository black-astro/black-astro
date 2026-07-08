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
// 매트릭스 영화 원본 폰트(Matrix Code NFI) 구성 — 반각 카타카나 + 숫자 + 일부 라틴
const glyphs =
  'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺｿﾁﾄﾉﾌﾔﾖﾙﾚﾛﾝ0123456789Z:."=*+-<>¦｜╌'

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
    // 선두 글자는 진한 매트릭스 그린으로 밝게, 나머지는 어둑한 그린
    ctx.fillStyle = Math.random() > 0.96 ? 'rgba(70, 255, 100, 0.97)' : 'rgba(48, 226, 108, 0.75)'
    // 원본 Matrix Code 폰트처럼 글자를 좌우 반전(거울상)으로 그림
    ctx.save()
    ctx.translate(x + fontSize, y)
    ctx.scale(-1, 1)
    ctx.fillText(ch, 0, 0)
    ctx.restore()
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
  opacity: 0.5;
  /* 좌우 가장자리에서만 보이고 중앙은 완전히 비움 */
  -webkit-mask-image: linear-gradient(90deg, #000 0%, transparent 13%, transparent 87%, #000 100%);
  mask-image: linear-gradient(90deg, #000 0%, transparent 13%, transparent 87%, #000 100%);
}
/* 라이트 테마에서는 숨김 (start/stop으로 렌더도 중단) */
:root[data-theme='light'] .rain {
  display: none;
}
</style>
