<script setup lang="ts">
import type { TimeEvent } from '@/stores/events'

defineProps<{
  event: TimeEvent & { x: number; y: number },
  close: () => void
}>()
</script>

<template>
    <div
      class="absolute z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[240px]"
      :style="{ left: `${event.x}px`, top: `${event.y}px` }"
    >
      <div class="flex justify-between items-start mb-2">
        <h1 class="text-sm font-semibold text-gray-800">{{ event.title }}</h1>
        <button @click="close" class="text-gray-400 hover:text-gray-600 text-sm">×</button>
      </div>
      <p class="text-sm text-gray-600 whitespace-pre-line">{{ event.description }}</p>
    </div>
</template>
