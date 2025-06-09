<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar';
import type { TimeEvent } from '@/stores/events'
import { format } from 'date-fns';
import { computed } from 'vue';

const calendarStore = useCalendarStore()

const props = defineProps<{
  event: TimeEvent,
  variant: 'default' | 'edit',
  overlappingEventsCount: number
  eventIndex: number
}>()

const getEventTime = (event: TimeEvent) => {
  return format(event.start, 'HH:mm a')
}

const getEventTimeShort = (event: TimeEvent) => {
  return format(event.start, 'HH:mm')
}

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'resize:start', deltaMinutes: number): void
  (e: 'resize:end', deltaMinutes: number): void
}>()

const startGhostDrag = (event: TimeEvent, resizeTarget?: 'start' | 'end') => (e: MouseEvent) => {
  e.stopPropagation()
  const startY = e.clientY
  const originalStart = new Date(event.start)
  const originalEnd = new Date(event.end)

  calendarStore.ghostEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    start: new Date(originalStart),
    end: new Date(originalEnd),
    x: 0,
    y: 0
  }

  let animationFrameId: number | null = null
  const tempGhost = { ...calendarStore.ghostEvent! }

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaY = moveEvent.clientY - startY
    const deltaMinutes = Math.round((deltaY / 72) * 60)

    if (resizeTarget === 'start') {
      tempGhost.start = new Date(originalStart.getTime() + deltaMinutes * 60 * 1000)
    } else if (resizeTarget === 'end') {
      tempGhost.end = new Date(originalEnd.getTime() + deltaMinutes * 60 * 1000)
    } else {
      tempGhost.start = new Date(originalStart.getTime() + deltaMinutes * 60 * 1000)
      tempGhost.end = new Date(originalEnd.getTime() + deltaMinutes * 60 * 1000)
    }

    if (animationFrameId == null) {
      animationFrameId = requestAnimationFrame(() => {
        calendarStore.ghostEvent = { ...tempGhost }
        animationFrameId = null
      })
    }
  }

  const onMouseUp = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)

    if (resizeTarget === 'start') {
      const delta = (calendarStore.ghostEvent!.start.getTime() - originalStart.getTime()) / 1000 / 60
      emit('resize:start', delta)
    } else if (resizeTarget === 'end') {
      const delta = (calendarStore.ghostEvent!.end.getTime() - originalEnd.getTime()) / 1000 / 60
      emit('resize:end', delta)
    }

    calendarStore.destroyGhostEvent()
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const handleClick = (e: MouseEvent) => {
  emit('click', e)
}

const isShortEvent = computed(() => {
  const durationMs = props.event.end.getTime() - props.event.start.getTime()
  return durationMs <= 30 * 60 * 1000 // 30 minutes is considered short
})

const isTooOverlapped = computed(() => {
  return props.overlappingEventsCount >= 3
})
</script>

<template>
  <div
    class="absolute border-l-[3px] rounded-[4px] p-1.5 overflow-hidden flex gap-0 hover:cursor-pointer transition-all duration-100 hover:shadow-xl z-20"
    @click="handleClick" :style="{
      width: `${100 / overlappingEventsCount}%`,
      left: `${(100 / overlappingEventsCount) * eventIndex}%`
    }" :class="{
      'flex-row items-center gap-2': isShortEvent,
      'flex-col justify-start items-start gap-0.5': !isShortEvent,
      'border-solid border-[#0EA5E9] bg-[#0EA5E91A]': variant === 'default',
      'border-dashed border-2 border-[#3bb1e8] bg-[#3bb1e826]': variant === 'edit'
    }">

    <!-- TOP RESIZE HANDLE -->
    <div class="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-30"
      @mousedown="(e) => startGhostDrag(event, 'start')(e)" />

    <!-- BOTTOM RESIZE HANDLE -->
    <div class="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-30"
      @mousedown="(e) => startGhostDrag(event, 'end')(e)" />

    <template v-if="isShortEvent">
      <span v-if="!isTooOverlapped" class="text-xs text-[#0369A1]">{{ getEventTimeShort(event) }}</span>
      <span class="text-xs font-semibold text-ellipsis overflow-hidden whitespace-nowrap text-[#0369A1]">{{
        event.title }}</span>
    </template>
    <template v-else>
      <span v-if="!isTooOverlapped" class="text-xs text-[#0369A1]">{{ getEventTime(event) }}</span>
      <span class="text-xs font-semibold text-[#0369A1]">{{ event.title }}</span>
    </template>
  </div>
</template>
