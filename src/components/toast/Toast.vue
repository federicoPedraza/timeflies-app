<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/stores/toast'

const props = defineProps<{
  timeout: number
}>()

const toastStore = useToast()
const id = defineModel<string>('id') // You pass this via :id

onMounted(() => {
  setTimeout(() => {
    if (id) toastStore.removeToast(id)
  }, props.timeout)
})
</script>


<template>
    <div class=" bg-white border border-gray-200 rounded-lg shadow-md min-w-64">
        <slot />
    </div>
</template>
