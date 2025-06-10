<script setup lang="ts">
import { useTokenRefresh } from '@/composables/useTokenRefresh'

// Initialize token refresh
useTokenRefresh()
</script>

<template>
  <main>
    <router-view />
  </main>
</template>

<style scoped lang="css">
main {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
