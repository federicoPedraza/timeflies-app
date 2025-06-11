<script setup lang="ts">
import { useTokenRefresh } from '@/composables/useTokenRefresh'
import Toast from '@/components/toast/Toast.vue'
import { useToast } from '@/stores/toast'

// Initialize token refresh
useTokenRefresh()

const toastStore = useToast()
</script>

<template>
  <main>
    <router-view />
  </main>
  <div class="toast-container flex flex-col gap-4">
    <Toast
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      :id="toast.id"
      :timeout="toast.timeout"
    >
      <component :is="toast.component" />
    </Toast>
  </div>
</template>

<style scoped lang="css">
main {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.toast-container {
  position: fixed;
  bottom: 5vh;
  right: 10vh;
  z-index: 1000;
}
</style>
