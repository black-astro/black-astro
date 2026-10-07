<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import MatrixRain from './components/MatrixRain.vue'
import ScrollProgress from './components/ScrollProgress.vue'
</script>

<template>
  <ScrollProgress />
  <MatrixRain />
  <AppHeader />
  <main>
    <RouterView v-slot="{ Component, route }">
      <Transition name="route" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>
