<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar';
import { useSettingsStore } from '@/stores/settings';
import type { TimeEvent } from '@/stores/events'
import { format } from 'date-fns';
import { computed } from 'vue';

const calendarStore = useCalendarStore()
const settingsStore = useSettingsStore()

const props = defineProps<{
  event: TimeEvent,
  variant: 'default' | 'edit',
  overlappingEventsCount: number
  isMultiDay: boolean
  eventIndex: number
  highlighted: boolean
  isGhostEvent: boolean
}>()

const getEventTime = (event: TimeEvent) => {
  const time = settingsStore.toMoment(event.start)
  return props.isMultiDay ? time.format('MMM d') + ' ⋅ ' + time.format(' HH:mm a') : time.format('HH:mm')
}

const getEventTimeEnd = (event: TimeEvent) => {
  const time = settingsStore.toMoment(event.end)
  return time.format('HH:mm a')
}

const getEventTimeShort = (event: TimeEvent) => {
  return format(event.start, 'HH:mm')
}

const emit = defineEmits<{
  (e: 'click-event', eventId: string): void
  (e: 'resize:start', deltaMinutes: number): void
  (e: 'resize:end', deltaMinutes: number): void
  (e: 'resize:both', deltaMinutes: number): void
}>()

const startGhostDrag = (event: TimeEvent, resizeTarget?: 'start' | 'end') => (e: MouseEvent) => {
  e.stopPropagation()
  const startY = e.clientY
  const startX = e.clientX
  const dragThreshold = 4
  let hasMoved = false

  const originalStart = new Date(event.start)
  const originalEnd = new Date(event.end)
  const duration = originalEnd.getTime() - originalStart.getTime()

  let animationFrameId: number | null = null
  let tempGhost: TimeEvent | null = null

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = Math.abs(moveEvent.clientX - startX)
    const deltaY = Math.abs(moveEvent.clientY - startY)

    if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
      hasMoved = true
      const ghostEvent: TimeEvent & { x: number; y: number } = {
        id: event.id,
        title: event.title,
        description: event.description,
        start: new Date(originalStart),
        end: new Date(originalEnd),
        x: 0,
        y: 0
      }
      calendarStore.ghostEvent = ghostEvent
      tempGhost = { ...ghostEvent }
    }

    if (!hasMoved) return

    const dy = moveEvent.clientY - startY
    const dx = moveEvent.clientX - startX
    let deltaMinutes = Math.round((dy / 72) * 60)
    let deltaDays = Math.round(dx / 144) // 144px is the day width

    if (moveEvent.shiftKey) {
      const snapToNearest15 = (date: Date) => {
        const minutes = date.getMinutes()
        const snappedMinutes = Math.round(minutes / 15) * 15
        date.setMinutes(snappedMinutes)
        date.setSeconds(0)
        date.setMilliseconds(0)
        return date
      }

      if (resizeTarget === 'start') {
        const newStart = new Date(originalStart.getTime() + deltaMinutes * 60 * 1000)
        if (newStart >= originalEnd) return
        tempGhost!.start = snapToNearest15(newStart)
      } else if (resizeTarget === 'end') {
        const newEnd = new Date(originalEnd.getTime() + deltaMinutes * 60 * 1000)
        if (newEnd <= originalStart) return
        tempGhost!.end = snapToNearest15(newEnd)
      } else {
        // For dragging, update both start and end times
        const newStart = new Date(originalStart.getTime() + deltaMinutes * 60 * 1000)
        newStart.setDate(newStart.getDate() + deltaDays)
        const newEnd = new Date(newStart.getTime() + duration)

        if (moveEvent.shiftKey) {
          tempGhost!.start = snapToNearest15(newStart)
          tempGhost!.end = new Date(tempGhost!.start.getTime() + duration)
        } else {
          tempGhost!.start = newStart
          tempGhost!.end = newEnd
        }
      }
    } else {
      if (resizeTarget === 'start') {
        const newStart = new Date(originalStart.getTime() + deltaMinutes * 60 * 1000)
        if (newStart >= originalEnd) return
        tempGhost!.start = newStart
      } else if (resizeTarget === 'end') {
        const newEnd = new Date(originalEnd.getTime() + deltaMinutes * 60 * 1000)
        if (newEnd <= originalStart) return
        tempGhost!.end = newEnd
      } else {
        // For dragging, update both start and end times
        const newStart = new Date(originalStart.getTime() + deltaMinutes * 60 * 1000)
        newStart.setDate(newStart.getDate() + deltaDays)
        const newEnd = new Date(newStart.getTime() + duration)
        tempGhost!.start = newStart
        tempGhost!.end = newEnd
      }
    }

    if (animationFrameId == null) {
      animationFrameId = requestAnimationFrame(() => {
        calendarStore.ghostEvent = { ...tempGhost!, x: 0, y: 0 }
        animationFrameId = null
      })
    }
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)

    if (!hasMoved) {
      handleClick(e)
    } else if (resizeTarget === 'start') {
      const delta = (calendarStore.ghostEvent!.start.getTime() - originalStart.getTime()) / 1000 / 60
      emit('resize:start', delta)
    } else if (resizeTarget === 'end') {
      const delta = (calendarStore.ghostEvent!.end.getTime() - originalEnd.getTime()) / 1000 / 60
      emit('resize:end', delta)
    } else {
      const delta = (calendarStore.ghostEvent!.start.getTime() - originalStart.getTime()) / 1000 / 60
      emit('resize:both', delta)
    }
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const handleClick = (e: MouseEvent) => {
  // Ignore clicks on the discard button
  if ((e.target as HTMLElement).closest('button')) return
  e.stopPropagation()
  emit('click-event', props.event.id)
}

const isShortEvent = computed(() => {
  const durationMs = props.event.end.getTime() - props.event.start.getTime()
  return durationMs <= 30 * 60 * 1000 // 30 minutes is considered short
})

const isTooOverlapped = computed(() => {
  return props.overlappingEventsCount >= 3
})

const discardGhostEvent = (e: MouseEvent) => {
  e.stopPropagation()
  calendarStore.destroyGhostEvent()
}

</script>

<template>
  <div
    class="calendar-event absolute border-l-[3px] rounded-[4px] p-1.5 overflow-hidden flex gap-0 hover:cursor-pointer transition-all duration-100 hover:shadow-xl z-20"
    @mousedown.left="(e) => startGhostDrag(event)(e)" :style="{
      width: highlighted ? '100%' : `${100 / overlappingEventsCount}%`,
      left: highlighted ? '0' : `${(100 / overlappingEventsCount) * eventIndex}%`
    }" :class="{
      'flex-row items-center gap-2': isShortEvent,
      'flex-col justify-start items-start gap-0.5': !isShortEvent,
      'border-solid border-[#0EA5E9] bg-[#0EA5E91A]': variant === 'default' ,
      'border-dashed border-2 border-[#3bb1e8] bg-[#D3F5FF]': variant === 'edit',
      'border-[#0b75a7] bg-[#D3F5FF] shadow-xl z-50': highlighted
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
      <div class="flex h-full w-full justify-start items-end">
        <span v-if="variant === 'edit'" class="text-xs text-[#0369A1]">{{ getEventTimeEnd(event) }}</span>
      </div>
    </template>

    <!-- DISCARD BUTTON FOR GHOST EVENTS -->
    <button v-if="variant === 'edit' && isGhostEvent"
      class="absolute top-1 right-1 w-4 h-4 rounded-full bg-white hover:bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-100"
      @click.stop="discardGhostEvent">
      <img src="@/assets/icons/sidebar/close-icon.svg" alt="discard" class="w-3 h-3" />
    </button>

  </div>
</template>
