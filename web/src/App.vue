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
        <!-- 뷰마다 루트가 여러 개라 Transition이 끝을 못 잡는다. 한 겹 감싸서 넘긴다 -->
        <div :key="route.path" class="route-view">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <AppFooter />
</template>
