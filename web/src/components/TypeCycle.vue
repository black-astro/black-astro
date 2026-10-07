<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 문구를 한 글자씩 쳤다가 지우고 다음 문구로 넘어간다.
const props = defineProps<{ words: string[] }>()
const out = ref(props.words[0] ?? '')
let t = 0

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || props.words.length < 2) return
  let wi = 0
  let ci = out.value.length
  let deleting = true
  const tick = () => {
    const word = props.words[wi]
    if (deleting) {
      ci--
      out.value = word.slice(0, ci)
      if (ci <= 0) {
        deleting = false
        wi = (wi + 1) % props.words.length
      }
      t = window.setTimeout(tick, 28)
    } else {
      const next = props.words[wi]
      ci++
      out.value = next.slice(0, ci)
      if (ci >= next.length) {
        deleting = true
        t = window.setTimeout(tick, 2400)
        return
      }
      t = window.setTimeout(tick, 55 + Math.random() * 40)
    }
  }
  t = window.setTimeout(tick, 2600)
})

onBeforeUnmount(() => clearTimeout(t))
</script>

<template>
  <span class="tc"><span class="sr-only">{{ words.join(', ') }}</span><span aria-hidden="true">{{ out }}</span><span class="tc-caret" aria-hidden="true"></span></span>
</template>

<style scoped>
.tc-caret {
  display: inline-block;
  width: 0.55ch;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: var(--accent);
  animation: blink 1s step-end infinite;
}
</style>
