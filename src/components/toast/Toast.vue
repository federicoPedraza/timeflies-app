<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useToast } from '@/stores/toast'

const props = defineProps<{
  timeout: number
}>()

const toastStore = useToast()
const id = defineModel<string>('id')
const progress = ref(100)
let frameId: number

const handleClose = () => {
  if (id.value) {
    cancelAnimationFrame(frameId)
    toastStore.removeToast(id.value)
  }
}

onMounted(() => {
  const start = performance.now()
  const animate = (now: number) => {
    const elapsed = now - start
    progress.value = Math.max(0, 100 - (elapsed / props.timeout) * 100)

    if (elapsed < props.timeout) {
      frameId = requestAnimationFrame(animate)
    } else {
      if (id.value) toastStore.removeToast(id.value)
    }
  }
  frameId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  cancelAnimationFrame(frameId)
})

const progressColor = computed(() => {
  const toast = toastStore.toasts.find(t => t.id === id.value)
  if (!toast) return 'bg-blue-500'
  switch (toast.type) {
    case 'success': return 'bg-green-500'
    case 'error': return 'bg-red-500'
    case 'warning': return 'bg-yellow-500'
    case 'info': return 'bg-blue-500'
  }
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-md min-w-80 relative">
    <button
      @click="handleClose"
      class="absolute top-2 right-2 hover:bg-gray-200 p-1 rounded-full  transition-colors"
    >
      <img src="@/assets/icons/circle-x.svg" alt="close" class="w-4 h-4" />
    </button>
    <slot />
    <div class="h-1 w-full bg-gray-200 rounded-b-lg">
      <div
        class="h-full rounded-b-lg"
        :class="progressColor"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>
