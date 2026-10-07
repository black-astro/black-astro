<script setup lang="ts">
// 기술 이름이 옆으로 계속 흘러간다. 마우스를 올리면 멈춘다.
const props = defineProps<{ items: string[] }>()
const row = [...props.items]
</script>

<template>
  <div class="mq" :aria-label="row.join(', ')">
    <div class="mq-track" aria-hidden="true">
      <span v-for="(it, i) in row" :key="'a' + i" class="mq-item">{{ it }}</span>
      <span v-for="(it, i) in row" :key="'b' + i" class="mq-item">{{ it }}</span>
    </div>
  </div>
</template>

<style scoped>
.mq {
  position: relative;
  overflow: hidden;
  padding: 14px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.mq-track {
  display: flex;
  width: max-content;
  gap: 34px;
  animation: mq 48s linear infinite;
}
.mq:hover .mq-track {
  animation-play-state: paused;
}
.mq-item {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  color: var(--text-muted);
  white-space: nowrap;
  transition: color 0.2s ease;
}
.mq-item::before {
  content: '◆';
  font-size: 0.5rem;
  margin-right: 12px;
  vertical-align: 0.2em;
  color: var(--accent);
  opacity: 0.6;
}
.mq-item:hover {
  color: var(--accent);
}
@keyframes mq {
  to {
    transform: translateX(calc(-50% - 17px));
  }
}
</style>
