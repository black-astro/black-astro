<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const p = ref(0)
let raf = 0

function update() {
  raf = 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  p.value = max > 0 ? Math.min(1, window.scrollY / max) : 0
}
function onScroll() {
  if (!raf) raf = requestAnimationFrame(update)
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div class="sp" aria-hidden="true"><div class="sp-bar" :style="{ transform: `scaleX(${p})` }"></div></div>
</template>

<style scoped>
.sp {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 60;
  pointer-events: none;
}
.sp-bar {
  height: 100%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  transform-origin: 0 50%;
  transform: scaleX(0);
}
</style>
