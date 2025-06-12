<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar';
import { useEventStore, type TimeEvent } from '@/stores/events'
import { useSettingsStore } from '@/stores/settings';
import { differenceInMinutes, formatDate, parseISO, getDaysInMonth } from 'date-fns';
import { computed, nextTick, ref, onMounted } from 'vue';
import moment from 'moment-timezone';

const props = defineProps<{
  event: TimeEvent & { x: number; y: number },
  isGhostEvent: boolean,
  close: () => void
  onDelete: () => void
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'update:event', event: TimeEvent & { x: number; y: number }): void
}>()

const eventStore = useEventStore()
const calendarStore = useCalendarStore()
const settingsStore = useSettingsStore()

const popupRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    const popup = document.querySelector('.event-popup') as HTMLElement
    if (!popup) return

    const calendarContainer = document.querySelector('.calendar-body-scroll') as HTMLElement
    if (!calendarContainer) return

    const popupRect = popup.getBoundingClientRect()
    const containerRect = calendarContainer.getBoundingClientRect()

    // Calculate if popup is outside the visible area
    const isOutsideTop = popupRect.top < containerRect.top
    const isOutsideBottom = popupRect.bottom > containerRect.bottom

    if (isOutsideTop) {
      calendarContainer.scrollTop += popupRect.top - containerRect.top - 20 // 20px padding
    } else if (isOutsideBottom) {
      calendarContainer.scrollTop += popupRect.bottom - containerRect.bottom + 20 // 20px padding
    }

    // Focus the popup
    popupRef.value?.focus()
  })
})

const getEventDayName = (date: Date) => {
  return formatDate(date, 'EEEE')
}

const getEventDuration = (start: Date, end: Date) => {
  const duration = differenceInMinutes(end, start)
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days} ${days === 1 ? 'day' : 'days'} ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}` // more than 1 day
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` // less than 1 day
  } else {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` // less than 1 hour
  }
}

const getEventDateDifference = (start: Date, end: Date) => {
  const now = settingsStore.toMoment(new Date())
  const startMoment = settingsStore.toMoment(start)
  const endMoment = settingsStore.toMoment(end)

  if (startMoment.isSame(now, 'day')) {
    if (now.isBefore(startMoment)) {
      const diff = startMoment.from(now, true)
      return `Starts in ${diff}`
    } else if (now.isBetween(startMoment, endMoment)) {
      const diff = endMoment.from(now, true)
      return `Ends in ${diff}`
    } else if (now.isAfter(endMoment)) {
      const diff = endMoment.from(now, true)
      return `Ended ${diff} ago`
    }
  }

  const daysDiff = startMoment.startOf('day').diff(now.startOf('day'), 'days')
  if (daysDiff === 1) return 'Tomorrow'
  if (daysDiff === -1) return 'Yesterday'
  if (daysDiff === 0) return 'Today'
  if (daysDiff > 1) return `In ${daysDiff} days`
  return `${Math.abs(daysDiff)} days ago`
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

const startMoment = settingsStore.toMoment(props.event.start)
const endMoment = settingsStore.toMoment(props.event.end)

const startDayChanges = ref({
  day: startMoment.date().toString(),
  month: (startMoment.month() + 1).toString().padStart(2, '0'),
  year: startMoment.year().toString(),
  time: startMoment.format('HH:mm')
})

const endDayChanges = ref({
  day: endMoment.date().toString(),
  month: (endMoment.month() + 1).toString().padStart(2, '0'),
  year: endMoment.year().toString(),
  time: endMoment.format('HH:mm')
})

const buildEndTime = computed(() => {
  const { year, month, day, time } = endDayChanges.value
  if (!year || !month || !day || !time) return null

  const datetime = `${year}-${month}-${day}T${time}`
  const momentDate = moment.tz(datetime, 'YYYY-MM-DDTHH:mm', settingsStore.timezone)
  return momentDate.isValid() ? momentDate.toDate() : null
})

const buildStartTime = computed(() => {
  const { year, month, day, time } = startDayChanges.value
  if (!year || !month || !day || !time) return null

  const datetime = `${year}-${month}-${day}T${time}`
  const momentDate = moment.tz(datetime, 'YYYY-MM-DDTHH:mm', settingsStore.timezone)
  return momentDate.isValid() ? momentDate.toDate() : null
})


const safeStartDate = computed(() => {
  const date = buildStartTime.value
  if (!date) return null
  return date
})

const safeMaxStartDay = computed(() => {
  const { year, month } = startDayChanges.value
  const iso = `${year}-${month.padStart(2, '0')}-01`
  const date = parseISO(iso)
  return isNaN(date.getTime()) ? 31 : getDaysInMonth(date)
})

const validStartTime = computed(() => {
  const date = safeStartDate.value
  if (!date) return false

  const m = moment.tz(date, settingsStore.timezone)

  const yyyy = m.format('YYYY')
  const mm = m.format('MM')
  const dd = m.format('D')
  const hhmm = m.format('HH:mm')

  return (
    startDayChanges.value.year === yyyy &&
    startDayChanges.value.month === mm &&
    startDayChanges.value.day === dd &&
    startDayChanges.value.time === hhmm
  )
})


const changes = ref({
  title: props.event.title,
  description: props.event.description,
  end: buildEndTime.value || props.event.end
})

const endMonthInput = computed({
  get: () =>
    `${endDayChanges.value.year}-${endDayChanges.value.month.padStart(2, '0')}`,
  set: (val: string) => {
    const [year, month] = val.split('-')
    endDayChanges.value.year = year
    endDayChanges.value.month = month
  }
})

const safeEndDate = computed(() => {
  const date = buildEndTime.value
  if (!date) return null

  changes.value.end = date
  return date
})

const safeMaxEndDay = computed(() => {
  const { year, month } = endDayChanges.value
  const iso = `${year}-${month.padStart(2, '0')}-01` // always use day 1
  const date = parseISO(iso)
  return isNaN(date.getTime()) ? 31 : getDaysInMonth(date)
})

const lastValidEndMonth = ref<string>('')
const preventEndMonthErase = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  if (/^\d{4}-\d{2}$/.test(val)) {
    endMonthInput.value = val
    lastValidEndMonth.value = val
  } else {
    // fallback to last known valid
    nextTick(() => {
      (e.target as HTMLInputElement).value = lastValidEndMonth.value
    })
  }
}

const validEndTime = computed(() => {
  const date = safeEndDate.value
  if (!date) return false

  const m = moment.tz(date, settingsStore.timezone)

  const yyyy = m.format('YYYY')
  const mm = m.format('MM')
  const dd = m.format('D') // Not zero-padded on purpose to match `endDayChanges`
  const hhmm = m.format('HH:mm')

  console.log('validEndTime', {
    date: endDayChanges.value.day === dd,
    yyyy: endDayChanges.value.year === yyyy,
    mm: endDayChanges.value.month === mm,
    dd: endDayChanges.value.day === dd,
    hhmm: endDayChanges.value.time === hhmm
  })

  return (
    endDayChanges.value.year === yyyy &&
    endDayChanges.value.month === mm &&
    endDayChanges.value.day === dd &&
    endDayChanges.value.time === hhmm
  )
})


const isChanged = (field: 'title' | 'description' | 'end' | 'start') => {
  if (field === 'end') {
    return buildEndTime.value?.getTime() !== props.event.end.getTime()
  }
  if (field === 'start') {
    const startTime = buildStartTime.value
    return startTime ? startTime.getTime() !== props.event.start.getTime() : false
  }
  return changes.value[field] !== props.event[field]
}

const hasChanges = computed(() => {
  return isChanged('title') || isChanged('description') || isChanged('end') || isChanged('start')
})

const titleBorderClass = computed(() => {
  return {
    'border-l-gray-300': !isChanged('title'),
    'border-l-green-500': isChanged('title') && !titleHasError(),
    'border-l-red-500': titleHasError()
  }
})

const startBorderClass = computed(() => {
  const changed = isChanged('start')
  const valid = validStartTime.value
  return {
    'border-l-gray-300': !changed,
    'border-l-green-500': changed && valid,
    'border-l-red-500': changed && !valid
  }
})

const endBorderClass = computed(() => {
  const changed = isChanged('end')
  const valid = validEndTime.value
  return {
    'border-l-gray-300': !changed,
    'border-l-green-500': changed && valid,
    'border-l-red-500': changed && !valid
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

const handleInput = (field: 'title' | 'description' | 'end', value: string | number) => {
  changes.value[field] = value as never
}

const handleEndInput = (field: 'day' | 'month' | 'time', value: string | number) => {
  endDayChanges.value[field] = value as never
}

const handleStartInput = (field: 'day' | 'month' | 'time', value: string | number) => {
  startDayChanges.value[field] = value as never
}

const canBeSaved = computed(() => {
  console.log('canBeSaved', {
  hasChanges: hasChanges.value,
  validStart: validStartTime.value,
  validEnd: validEndTime.value,
  titleError: titleHasError()
})
  return hasChanges.value &&
         !titleHasError() &&
         !descriptionHasError() &&
         validStartTime.value &&
         validEndTime.value
})

const deleteEvent = async () => {
  if (props.isGhostEvent) {
    calendarStore.destroyGhostEvent()
    props.onDelete()
    return
  }

  await eventStore.deleteEvent(props.event.id)
  props.onDelete()
}

const createEvent = async () => {
  const eventStore = useEventStore()
  await eventStore.createEvent({
    title: changes.value.title,
    description: changes.value.description,
    start: buildStartTime.value || props.event.start,
    end: buildEndTime.value || props.event.end
  })

  const calendarStore = useCalendarStore()
  calendarStore.destroyGhostEvent()
  close()
}

const saveChanges = async () => {
  if (!canBeSaved.value) return;

  const eventStore = useEventStore()
  const payload: Partial<TimeEvent> = {
    id: props.event.id,
    title: changes.value.title,
    description: changes.value.description,
    start: buildStartTime.value || props.event.start,
    end: buildEndTime.value || props.event.end
  }

  try {
    await eventStore.modifyEvent(payload)
    await eventStore.fetchEvents()

    // Find the updated event in the store
    const updatedEvent = eventStore.events.find(e => e.id === props.event.id)
    if (updatedEvent) {
      // Emit the updated event with the same x,y coordinates
      emit('update:event', { ...updatedEvent, x: props.event.x, y: props.event.y })
    }

    toggleViewMode()
  } catch (error) {
    console.error('Error saving changes:', error)
  }
}

</script>

<template>
  <div ref="popupRef" class="absolute z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 event-popup focus:outline-none"
    :class="[
      isMobile ? 'w-full h-1/4' : 'w-[360px] h-1/4'
    ]"
    :style="isMobile ? { top: `${event.y}px` } : { left: `${event.x}px`, top: `${event.y}px` }"
    @keydown.escape="close"
    tabindex="-1">
    <div class="flex flex-col justify-between items-start h-full gap-2">
      <div class="flex h-full flex-col gap-2  w-full justify-start items-start">
        <div class="flex justify-between w-full items-center">
          <div class="flex flex-row gap-2 justify-start items-center">
            <img src="@/assets/icons/event-icons/event-default-icon.svg" alt="calendar icon" class="w-6 h-6" />
            <template v-if="!isEditMode">
              <h1 class="text-lg font-semibold text-gray-800">{{ event.title }}</h1>
            </template>
            <div v-else class="flex flex-row gap-2 justify-start items-center">
              <input type="text" id="title-input" placeholder="Add a title..."
                class="border-l-2 pl-2 text-lg font-semibold text-gray-800 underline focus:outline-none focus:border-[#0EA5E9]"
                :class="titleBorderClass" :value="changes.title" @change="onTitleChange"
                @input="(e) => handleInput('title', (e.target as HTMLInputElement).value)" />
            </div>
          </div>
          <div class="flex justify-center items-center p-1">
            <button
              class="flex justify-center items-center p-1 rounded-full  bg-gray-50 hover:bg-gray-200 hover:shadow-md"
              @click="close">
              <img src="@/assets/icons/sidebar/close-icon.svg" alt="close" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div v-if="!isEditMode" class="flex flex-col justify-start items-start gap-2 w-full">
            <span class="text-xs text-[#71717A]">
              {{ settingsStore.toMoment(event.start).format('dddd, DD MMMM') }} ⋅ {{
                settingsStore.toMoment(event.start).format('HH:mm') }} - {{ settingsStore.toMoment(event.end).format('HH:mm') }}
                {{ settingsStore.toMoment(event.end).isSame(settingsStore.toMoment(event.start), 'day') ? '' :  '⋅' +  settingsStore.toMoment(event.end).format('dddd, DD MMMM') }}
            </span>
            <span class="text-xs text-[#71717A]">
              {{ getEventDateDifference(event.start, event.end) }} ⋅ Runs for {{ getEventDuration(event.start,
                event.end) }}
            </span>
          </div>
          <div v-else class="flex flex-col justify-start items-start gap-2 w-full">
            <div class="flex flex-col justify-start items-start gap-2">
              <div class="flex flex-row justify-start items-start border-l-2 pl-2 gap-2" :class="startBorderClass">
                <span class="text-xs flex flex-row justify-start items-center gap-2 text-[#71717A]">
                  <span class="text-xs" v-if="safeStartDate">
                    {{ getEventDayName(safeStartDate) }}
                  </span>
                  <span class="text-xs" v-else>⋅⋅⋅⋅⋅⋅⋅⋅</span>

                  <input type="text" inputmode="numeric" pattern="\d*"
                    class="text-xs text-[#71717A] border-b h-4 text-center border-gray-300 outline-none focus:outline-none focus:border-gray-500 w-5"
                    :value="startDayChanges.day" maxlength="2" @input="(e) => {
                      let val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
                      if (val.length > 2) val = val.slice(0, 2)
                      let num = parseInt(val)
                      if (isNaN(num)) return handleStartInput('day', '')
                      const max = safeMaxStartDay
                      if (num < 1) num = 1
                      if (num > max) num = max
                      handleStartInput('day', num.toString())
                    }" />

                  <input type="month"
                    class="text-xs text-[#71717A] h-4 border-b text-center border-gray-300 outline-none focus:outline-none focus:border-gray-500 w-30"
                    :value="`${startDayChanges.year}-${startDayChanges.month}`" @input="(e) => {
                      const [year, month] = (e.target as HTMLInputElement).value.split('-')
                      handleStartInput('month', month)
                      startDayChanges.year = year
                    }" />

                  <input type="time"
                    class="text-xs text-[#71717A] h-4 border-b text-center border-gray-300 outline-none focus:outline-none focus:border-gray-500 w-full"
                    :value="startDayChanges.time"
                    @input="(e) => handleStartInput('time', (e.target as HTMLInputElement).value)" />
                </span>
              </div>
              <div class="flex flex-row justify-start items-start border-l-2 pl-2 gap-2" :class="endBorderClass">
                <span class="text-xs flex flex-row justify-start items-center gap-2 text-[#71717A]">
                  <span class="text-xs" v-if="safeEndDate">
                    {{ getEventDayName(safeEndDate) }}
                  </span>
                  <span class="text-xs" v-else>
                    ⋅⋅⋅⋅⋅⋅⋅⋅
                  </span>
                  <input type="text" inputmode="numeric" pattern="\d*"
                    class="text-xs text-[#71717A] border-b h-4 text-center border-gray-300 outline-none focus:outline-none focus:border-gray-500 w-5"
                    :value="endDayChanges.day" maxlength="2" @input="(e) => {
                      let val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
                      if (val.length > 2) val = val.slice(0, 2)

                      let num = parseInt(val)
                      if (isNaN(num)) return handleEndInput('day', '')

                      const max = safeMaxEndDay
                      if (num < 1) num = 1
                      if (num > max) num = max

                      handleEndInput('day', num.toString())
                    }" />

                  <input type="month"
                    class="text-xs text-[#71717A] h-4 border-b text-center  border-gray-300 outline-none focus:outline-none focus:border-gray-500 w-30"
                    :value="endMonthInput" @input="preventEndMonthErase" />
                  <input type="time"
                    class="text-xs text-[#71717A] h-4 border-b text-center  border-gray-300 outline-none focus:outline-none focus:border-gray-500 w-full"
                    :value="endDayChanges.time"
                    @input="(e) => handleEndInput('time', (e.target as HTMLInputElement).value)" />
                </span>
              </div>
            </div>
          </div>
          <div class="mt-2 flex flex-row gap-2" :class="{ 'items-start': isEditMode, 'items-center': !isEditMode }">
            <div class="flex flex-col h-full justify-start items-center p-1">
              <img src="@/assets/icons/text-icon.svg" alt="description icon" class="w-4 h-4" />
            </div>
            <span v-if="!isEditMode"
              class="text-sm text-gray-600 whitespace-pre-line break-words leading-snug max-w-[270px]"
              :class="{ 'text-gray-400': event.description.trim() === '' }">
              {{ event.description || 'No description' }}
            </span>
            <textarea v-else rows="2" id="description-input" placeholder="Add a description..."
              class="text-sm border-l-2  text-gray-600 leading-snug w-[270px] resize-none rounded-sm px-1 py-[2px] focus:outline-none focus:border-[#0EA5E9] h-32 pt-2 pl-2"
              :class="descriptionBorderClass" :value="changes.description" @change="onDescriptionChange"
              @input="(e) => handleInput('description', (e.target as HTMLTextAreaElement).value)" />
          </div>
        </div>
      </div>
      <div v-if="isEditMode" class="my-2 flex flex-row w-full justify-center items-center gap-4">
        <button type="button" :disabled="!canBeSaved"
          class="hover:bg-gray-100 shadow-sm bg-gray-100 disabled:bg-gray-200  disabled:text-gray-400 disabled:cursor-not-allowed hover:shadow-md p-1 rounded-full flex justify-center items-center gap-1"
          @click="isGhostEvent ? createEvent() : saveChanges()">
          <div class="flex justify-center items-center p-1">
            <img src="@/assets/icons/save-icon.svg" alt="save description changes" class="w-3 h-3"
              :class="{ 'save-icon-disabled': !canBeSaved }" />
          </div>
          <span class="text-xs">{{ isGhostEvent ? 'Create event' : 'Save changes' }}</span>
        </button>
      </div>
      <div class="flex flex-col w-full justify-center items-center gap-4">
        <div
          class="w-3/4 shadow-md mx-auto flex flex-row justify-stretch items-center border rounded-lg border-gray-200"
          :class="{ 'mt-8': !isEditMode }">
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
        <div v-if="isTryingToDelete" class="flex w-full flex-col justify-center items-center gap-2">
          <span class="text-sm text-gray-600">Are you sure you'd like to {{ isGhostEvent ? 'discard' : 'delete' }} this
            event?</span>
          <div class="flex flex-row justify-center items-center gap-8">
            <button type="button" @click="deleteEvent" class="text-red-400 text-sm rounded-md hover:text-red-500 hover:text-shadow">{{
              isGhostEvent
                ? 'Discard' : 'Delete' }}</button>
            <button type="button" @click="toggleDeleteMode"
              class="text-gray-600 text-sm rounded-md hover:text-gray-700 hover:text-shadow">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.save-icon-disabled {
  filter: brightness(0) invert(0.5);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
