<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// "1,000만", "44초 → 0.8초" 같은 문자열 안의 숫자만 0에서부터 올라가게 한다.
const props = defineProps<{ value: string }>()
const root = ref<HTMLElement | null>(null)
const parts = props.value.split(/(\d[\d,]*(?:\.\d+)?)/)
const out = ref(props.value)
let raf = 0
let io: IntersectionObserver | null = null

function render(p: number) {
  out.value = parts
    .map((s, i) => {
      if (i % 2 === 0) return s
      const dec = s.includes('.') ? s.split('.')[1].length : 0
      const n = parseFloat(s.replace(/,/g, ''))
      const v = n * p
      const fixed = v.toFixed(dec)
      return s.includes(',') ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: dec }) : fixed
    })
    .join('')
}

function run() {
  const t0 = performance.now()
  const dur = 1100
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / dur)
    render(1 - Math.pow(1 - k, 3))
    if (k < 1) raf = requestAnimationFrame(step)
    else out.value = props.value
  }
  raf = requestAnimationFrame(step)
}

// 숫자가 하나일 때만 센다. "44초 → 0.8초", "0.0.2" 같은 건 세면 오히려 이상해 보인다
const countable = parts.length === 3 && !/\d\.\d+\.\d/.test(props.value)

onMounted(() => {
  if (!countable || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  render(0)
  io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    io?.disconnect()
    run()
  }, { threshold: 0.4 })
  if (root.value) io.observe(root.value)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  io?.disconnect()
})
</script>

<template>
  <span ref="root" :aria-label="value"><span aria-hidden="true">{{ out }}</span></span>
</template>
