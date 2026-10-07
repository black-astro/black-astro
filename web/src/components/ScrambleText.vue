<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 글자가 무작위 기호에서 하나씩 풀리며 나타난다. 스크린리더에는 원문만 읽힌다.
const props = withDefaults(defineProps<{ text: string; delay?: number; speed?: number }>(), {
  delay: 0,
  speed: 38,
})

const pool = '01アカサタナハマヤラワ<>/#$%&*+=?'
const shown = ref(props.text.replace(/\S/g, ' '))
let timer = 0
let start = 0

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = props.text
    return
  }
  const chars = [...props.text]
  start = window.setTimeout(() => {
    let frame = 0
    timer = window.setInterval(() => {
      frame++
      const done = Math.floor(frame / 3)
      shown.value = chars
        .map((c, i) => {
          if (c === ' ' || i < done) return c
          if (i > done + 6) return ' '
          return pool[Math.floor(Math.random() * pool.length)]
        })
        .join('')
      if (done >= chars.length) {
        shown.value = props.text
        clearInterval(timer)
      }
    }, props.speed)
  }, props.delay)
})

onBeforeUnmount(() => {
  clearTimeout(start)
  clearInterval(timer)
})
</script>

<template>
  <span class="scramble" :aria-label="text"><span aria-hidden="true">{{ shown }}</span></span>
</template>

<style scoped>
.scramble {
  white-space: pre;
}
</style>
