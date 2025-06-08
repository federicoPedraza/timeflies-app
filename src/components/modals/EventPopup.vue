<script setup lang="ts">
import type { TimeEvent } from '@/stores/events'
import { formatDate } from 'date-fns';
import { ref } from 'vue';

defineProps<{
  event: TimeEvent & { x: number; y: number },
  close: () => void
}>()

const getEventDayName = (event: TimeEvent) => {
  return formatDate(event.start, 'EEEE')
}

const isEditMode = ref(false)
const isTryingToDelete = ref(false)

const toggleViewMode = () => {
  isEditMode.value = false
}

const toggleEditMode = () => {
  isEditMode.value = true
}

const toggleDeleteMode = () => {
  isTryingToDelete.value = !isTryingToDelete.value
}
</script>

<template>
  <div class="absolute z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[240px]"
    :style="{ left: `${event.x}px`, top: `${event.y}px` }">
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-start">
        <div class="flex flex-row gap-2 justify-start items-center">
          <img src="@/assets/icons/event-icons/event-default-icon.svg" alt="calendar icon" class="w-4 h-4" />
          <h1 class="text-sm font-semibold text-gray-800">{{ event.title }}</h1>
        </div>
        <button @click="close" class="text-gray-400 hover:text-gray-600 text-sm">×</button>
      </div>
      <span class="text-xs text-[#71717A]">
        {{ getEventDayName(event) }} {{ formatDate(event.start, 'dd') }} at {{ formatDate(event.start, 'HH:mm a') }} -
        {{ formatDate(event.end, 'HH:mm a') }}
      </span>
      <div class="mt-2 flex flex-row gap-2 justify-start items-center">
        <img src="@/assets/icons/text-icon.svg" alt="location icon" class="w-4 h-4" />
        <span class="text-sm text-gray-600 whitespace-pre-line break-words leading-snug max-w-[270px]">
          {{ event.description }}
        </span>
      </div>
    </div>
    <div class="mt-8 w-3/4 shadow-md mx-auto flex flex-row justify-stretch items-center border rounded-lg border-gray-200">
      <button type="button" @click="toggleViewMode" :disabled="isTryingToDelete" class="rounded-l-lg  w-full h-full flex justify-center items-center p-1" :class="[{ 'bg-gray-100': !isEditMode || isTryingToDelete }, {'hover:shadow-md': !isTryingToDelete}]">
        <img src="@/assets/icons/eye-icon.svg" alt="enable view mode" class="w-4 h-4" />
      </button>
      <button type="button" @click="toggleEditMode" :disabled="isTryingToDelete" class="w-full h-full flex justify-center items-center p-1 border-x-[1px]" :class="[{ 'bg-gray-100': isEditMode || isTryingToDelete }, {'hover:shadow-md': !isTryingToDelete}]">
        <img src="@/assets/icons/edit-icon.svg" alt="enable edit mode" class="w-4 h-4" />
      </button>
      <button type="button" @click="toggleDeleteMode" class="w-full rounded-r-lg h-full flex justify-center items-center p-1" :class="[{ 'bg-red-100': isTryingToDelete }, {'hover:shadow-md': !isTryingToDelete}]">
        <img src="@/assets/icons/trash-icon.svg" alt="delete event" class="w-4 h-4" />
      </button>
    </div>
    <div v-if="isTryingToDelete" class="mt-4 flex flex-col justify-center items-center gap-2">
      <span class="text-sm text-gray-600">Are you sure you’d like to delete this event?</span>
      <div class="flex flex-row justify-center items-center gap-8">
        <button type="button" class="text-red-400 text-sm rounded-md hover:text-red-500 hover:text-shadow">Delete</button>
        <button type="button" @click="toggleDeleteMode" class="text-gray-600 text-sm rounded-md hover:text-gray-700 hover:text-shadow">Cancel</button>
      </div>
    </div>
  </div>
</template>
