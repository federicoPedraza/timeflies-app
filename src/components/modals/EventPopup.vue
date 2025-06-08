<script setup lang="ts">
import type { TimeEvent } from '@/stores/events'
import { formatDate } from 'date-fns';
import { computed, ref } from 'vue';

const props = defineProps<{
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

const changes = ref({
  title: props.event.title,
  description: props.event.description
})

const isChanged = (field: 'title' | 'description') => {
  return changes.value[field].trim() !== props.event[field].trim()
}

const hasChanges = computed(() => {
  return isChanged('title') || isChanged('description')
})

const discardChanges = (field: 'title' | 'description') => {
  changes.value[field] = props.event[field]
}

const titleBorderClass = computed(() => {
  return {
    'border-l-gray-300': !isChanged('title'),
    'border-l-green-500': isChanged('title') && !titleHasError(),
    'border-l-red-500': titleHasError()
  }
})

const descriptionBorderClass = computed(() => {
  return {
    'border-l-gray-300': !isChanged('description'),
    'border-l-green-500': isChanged('description') && !descriptionHasError(),
    'border-l-red-500': descriptionHasError()
  }
})

const onTitleChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  changes.value.title = input.value.trim()
}

const onDescriptionChange = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  // trim spaces on start and end
  const value = textarea.value.trim()
  changes.value.description = value
}

const titleHasError = () => {
  return changes.value.title === ''
}

const descriptionHasError = () => {
  return false
}

const handleInput = (field: 'title' | 'description', value: string) => {
  changes.value[field] = value
}

const canBeSaved = computed(() => {
  return hasChanges.value && !titleHasError() && !descriptionHasError()
})

</script>

<template>
  <div class="absolute z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[240px]"
    :style="{ left: `${event.x}px`, top: `${event.y}px` }">
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <div class="flex flex-row gap-2 justify-start items-center">
          <img src="@/assets/icons/event-icons/event-default-icon.svg" alt="calendar icon" class="w-4 h-4" />
          <template v-if="!isEditMode">
            <h1 class="text-sm font-semibold text-gray-800">{{ event.title }}</h1>
          </template>
          <div v-else class="flex flex-row gap-2 justify-start items-center">
          <input type="text"
            placeholder="Add a title..."
            class="border-l-2 pl-2 text-sm font-semibold text-gray-800 underline focus:outline-none focus:border-[#0EA5E9]"
            :class="titleBorderClass"
            :value="changes.title"
            @change="onTitleChange"
            @input="(e) => handleInput('title', (e.target as HTMLInputElement).value)" />
          </div>
        </div>
        <div class="flex justify-center items-center p-1">
          <button class="flex justify-center items-center p-1 rounded-full  bg-gray-100 hover:bg-gray-200 hover:shadow-md" @click="close">
            <img src="@/assets/icons/sidebar/close-icon.svg" alt="close" class="w-4 h-4" />
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-xs text-[#71717A]">
          {{ getEventDayName(event) }} {{ formatDate(event.start, 'dd') }} at {{ formatDate(event.start, 'HH:mm a') }} -
          {{ formatDate(event.end, 'HH:mm a') }}
        </span>
        <div class="mt-2 flex flex-row gap-2 justify-center items-start">
          <div class="flex flex-col justify-center items-center p-1">
            <img src="@/assets/icons/text-icon.svg" alt="description icon" class="w-4 h-4" />
          </div>
          <span v-if="!isEditMode"
            class="text-sm text-gray-600 whitespace-pre-line break-words leading-snug max-w-[270px]"
            :class="{ 'text-gray-400': event.description.trim() === '' }">
            {{ event.description || 'No description' }}
          </span>
          <textarea v-else rows="2"
            placeholder="Add a description..."
            class="text-sm border-l-2  text-gray-600 leading-snug w-[270px] resize-none rounded-sm px-1 py-[2px] focus:outline-none focus:border-[#0EA5E9] h-32 border pt-2"
            :class="descriptionBorderClass"
            :value="changes.description"
            @change="onDescriptionChange"
            @input="(e) => handleInput('description', (e.target as HTMLTextAreaElement).value)" />
        </div>
      </div>
    </div>
    <div v-if="isEditMode" class="my-2 flex flex-row justify-center items-center gap-4">
      <button type="button" :disabled="!canBeSaved" class="hover:bg-gray-100 shadow-sm bg-gray-100 disabled:bg-gray-200  disabled:text-gray-400 disabled:cursor-not-allowed hover:shadow-md p-1 rounded-full flex justify-center items-center gap-1">
        <div class="flex justify-center items-center p-1">
          <img src="@/assets/icons/save-icon.svg" alt="save description changes" class="w-3 h-3" :class="{ 'save-icon-disabled': !canBeSaved }" />
        </div>
        <span class="text-xs">Save changes</span>
        </button>
    </div>
    <div
      class="w-3/4 shadow-md mx-auto flex flex-row justify-stretch items-center border rounded-lg border-gray-200" :class="{ 'mt-8': !isEditMode }">
      <button type="button" @click="toggleViewMode" :disabled="isTryingToDelete"
        class="rounded-l-lg  w-full h-full flex justify-center items-center p-1"
        :class="[{ 'bg-gray-100': !isEditMode || isTryingToDelete }, { 'hover:shadow-md': !isTryingToDelete }]">
        <img src="@/assets/icons/eye-icon.svg" alt="enable view mode" class="w-4 h-4" />
      </button>
      <button type="button" @click="toggleEditMode" :disabled="isTryingToDelete"
        class="w-full h-full flex justify-center items-center p-1 border-x-[1px]"
        :class="[{ 'bg-gray-100': isEditMode || isTryingToDelete }, { 'hover:shadow-md': !isTryingToDelete }]">
        <img src="@/assets/icons/edit-icon.svg" alt="enable edit mode" class="w-4 h-4" />
      </button>
      <button type="button" @click="toggleDeleteMode"
        class="w-full rounded-r-lg h-full flex justify-center items-center p-1"
        :class="[{ 'bg-red-100': isTryingToDelete }, { 'hover:shadow-md': !isTryingToDelete }]">
        <img src="@/assets/icons/trash-icon.svg" alt="delete event" class="w-4 h-4" />
      </button>
    </div>
    <div v-if="isTryingToDelete" class="mt-4 flex flex-col justify-center items-center gap-2">
      <span class="text-sm text-gray-600">Are you sure you'd like to delete this event?</span>
      <div class="flex flex-row justify-center items-center gap-8">
        <button type="button"
          class="text-red-400 text-sm rounded-md hover:text-red-500 hover:text-shadow">Delete</button>
        <button type="button" @click="toggleDeleteMode"
          class="text-gray-600 text-sm rounded-md hover:text-gray-700 hover:text-shadow">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.save-icon-disabled {
  filter: brightness(0) invert(0.5);
}
</style>
