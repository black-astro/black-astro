<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; desc?: string }>()
</script>

<template>
  <div class="sh">
    <span v-if="eyebrow" v-reveal class="eyebrow">{{ eyebrow }}</span>
    <h2 v-reveal="1" class="section-title sh-title">{{ title }}</h2>
    <p v-if="desc" v-reveal="2" class="lead sh-desc">{{ desc }}</p>
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
.sh-title {
  font-size: clamp(1.7rem, 3.6vw, 2.3rem);
}
.sh-desc {
  margin-top: 12px;
  max-width: 760px;
  line-height: 1.7;
}
</style>
