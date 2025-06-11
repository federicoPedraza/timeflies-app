<script setup lang="ts">
import { useToast } from '@/stores/toast'
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  initialTimeout: number
  message: string
  id: string
}>()

const toastStore = useToast()

const timeoutPercentage = ref(0)
let frameId: number

const progressColor = computed(() => {
  const toast = toastStore.toasts.find(t => t.id === props.id)
  if (!toast) return 'bg-blue-500'
  switch (toast.type) {
    case 'success': return 'bg-green-500'
    case 'error': return 'bg-red-500'
    case 'warning': return 'bg-yellow-500'
    case 'info': return 'bg-blue-500'
  }
})

onMounted(() => {
  const start = performance.now()

  const animate = (now: number) => {
    const elapsed = now - start
    timeoutPercentage.value = Math.min((elapsed / props.initialTimeout) * 100, 100)
    if (elapsed < props.initialTimeout) {
      frameId = requestAnimationFrame(animate)
    } else {
      toastStore.removeToast(props.id)
    }
  }

  frameId = requestAnimationFrame(animate)
})

onUnmounted(() => cancelAnimationFrame(frameId))
</script>
