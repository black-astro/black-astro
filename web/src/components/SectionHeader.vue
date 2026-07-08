<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; desc?: string }>()
</script>

<template>
  <div class="sh">
    <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
    <h2 class="section-title">{{ title }}</h2>
    <p v-if="desc" class="lead sh-desc">{{ desc }}</p>
  </div>
</template>

<style scoped>
.sh {
  margin-bottom: 34px;
}
.eyebrow {
  display: block;
  margin-bottom: 10px;
}
.sh-desc {
  margin-top: 12px;
  max-width: 760px;
  line-height: 1.7;
}
</style>
