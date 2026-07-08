<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import MatrixRain from './components/MatrixRain.vue'
</script>

<template>
  <MatrixRain />
  <AppHeader />
  <main>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </main>
  <AppFooter />
</template>
