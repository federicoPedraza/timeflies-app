<script setup lang="ts">
import { ref, onMounted, watchEffect, watch, nextTick, computed, onUnmounted } from 'vue'
import { startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, subDays, addDays } from 'date-fns'
import CalendarHour from '../components/calendar/CalendarHour.vue'
import CalendarCell from '../components/calendar/CalendarCell.vue'
import CalendarEvent from '../components/calendar/CalendarEvent.vue'
import { useCalendarStore } from '@/stores/calendar'
import { useEventStore, type TimeEvent } from '@/stores/events'
import EventPopup from '../components/modals/EventPopup.vue'
import { useSettingsStore } from '@/stores/settings'
import moment from 'moment-timezone'

const calendarStore = useCalendarStore()
const eventStore = useEventStore()
const settingsStore = useSettingsStore()

const { startsWithSunday, timeNotation, focusHourOnStart } = settingsStore

const getDayName = (date: Date) => calendarStore.dayNames[date.getDay()]

const currentWeekStart = ref(startOfWeek(calendarStore.today, { weekStartsOn: startsWithSunday ? 0 : 1 }))
const dateObjects = ref<Date[]>([])
const headerDateObjects = ref<Date[]>([])

const updateDateObjects = () => {
  // if VISIBLE_DAYS > 1, show all days in the month
  // if VISIBLE_DAYS === 1, show only the current day
  if (VISIBLE_DAYS.value > 1) {
    dateObjects.value = generateMonthRange(calendarStore.visibleMonth)
    headerDateObjects.value = generateMonthRange(calendarStore.visibleMonth)
  } else {
    if (!selectedHeaderDay.value) {
      selectedHeaderDay.value = calendarStore.today
    }
    dateObjects.value = [selectedHeaderDay.value]
    // show previous 3 and next 3 days
    headerDateObjects.value = [
      subDays(selectedHeaderDay.value, 3),
      subDays(selectedHeaderDay.value, 2),
      subDays(selectedHeaderDay.value, 1),
      selectedHeaderDay.value,
      addDays(selectedHeaderDay.value, 1),
      addDays(selectedHeaderDay.value, 2),
      addDays(selectedHeaderDay.value, 3),
    ]
  }
}

watch(
  () => calendarStore.visibleMonth,
  (newMonth, oldMonth) => {
    const isPreviousMonth = oldMonth && isBefore(newMonth, oldMonth)

    updateDateObjects()

    nextTick(() => {
      if (!isPreviousMonth) {
        scrollToToday(-1)
      } else {
        scrollToDay(dateObjects.value.length - 1)
      }
    })
  }
)

watch(
  () => calendarStore.lastFocusedDate,
  (newDate) => {
    if (newDate) {
      scrollToDay(dateObjects.value.findIndex(d => isSameDay(d, newDate)))
    }
  }
)

watch(
  () => eventStore.events,
  (newEvents) => {
    if (!hasScrolledToStartingHour) {
      scrollToHour(getStartingVisibleHour())
      hasScrolledToStartingHour = true
    }
  }
)

let hasScrolledToStartingHour = false

const hours = Array.from({ length: 24 }, (_, i) => i)

const isWeekend = (day: string) => day === 'SAT' || day === 'SUN'

const isToday = (date: Date) => {
  return settingsStore.toMoment(date).isSame(settingsStore.toMoment(new Date()), 'day')
}

const isHeaderDay = (date: Date) => {
  return selectedHeaderDay.value && isSameDay(date, selectedHeaderDay.value)
}

const calendarContainerRef = ref<HTMLElement | null>(null)
const bodyScrollContainer = ref<HTMLElement | null>(null)
const headerScrollContainer = ref<HTMLElement | null>(null)
const leftHourColumnRef = ref<HTMLElement | null>(null)
const rightHourColumnRef = ref<HTMLElement | null>(null)

const currentHourFraction = ref<number | null>(null)

const getCurrentHourIndicator = () => {
  if (currentHourFraction.value === null) return 0
  return 72 * currentHourFraction.value
}

const updateCurrentHourFraction = () => {
  const now = settingsStore.toMoment(new Date())
  const hour = now.hour()
  const minute = now.minute()
  currentHourFraction.value = hour + (minute / 60)
}

const dayWidth = ref(144)
const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  recalculateDayWidth()
  updateDateObjects()
  windowWidth.value = window.innerWidth
}

const VISIBLE_DAYS = computed(() => {
  const width = windowWidth.value
  if (width < 640) return 1
  if (width < 1280) return 2
  if (width < 1536) return 4
  return 7
})

const HEADER_DAYS = computed(() => {
  return VISIBLE_DAYS.value > 1 ? VISIBLE_DAYS.value : 1
})

const calendarWidth = computed(() => `${dayWidth.value * VISIBLE_DAYS.value}px`)
const headerWidth = computed(() => `${dayWidth.value * HEADER_DAYS.value}px`)

watch(VISIBLE_DAYS, () => {
  recalculateDayWidth()
})

const recalculateDayWidth = () => {
  if (calendarContainerRef.value) {
    const containerWidth = calendarContainerRef.value.clientWidth
    dayWidth.value = containerWidth / VISIBLE_DAYS.value
  }
}

const getStartingVisibleHour = () => {
  if (focusHourOnStart) {
    return calendarStore.today.getHours()
  }
  const today = calendarStore.today
  const eventsToday = eventStore.events.filter(event => isSameDay(new Date(event.start), today))
  const closestEvent = eventsToday.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0]
  return closestEvent ? closestEvent.start.getHours() : 8
}

const generateMonthRange = (center: Date) => {
  const start = startOfMonth(center);
  const end = endOfMonth(center);

  return eachDayOfInterval({ start, end })
}

const scrollToToday = (offset: number = 0) => {
  const today = calendarStore.today
  scrollToDay(dateObjects.value.findIndex(d => isSameDay(d, today)) + offset)
}

const displayDay = (date: Date) => {
  // only available if VISIBLE_DAYS === 1
  if (VISIBLE_DAYS.value === 1) {
    const dayIndex = dateObjects.value.findIndex(d => isSameDay(d, date))
    if (dayIndex === -1) return
    selectedDay.value = date
  }

  selectedHeaderDay.value = date
}

const updateSelectedHeaderDay = (date: Date) => {
  selectedHeaderDay.value = date
  updateDateObjects()
}

const selectedDay = ref<Date | null>(null)
const selectedHeaderDay = ref<Date | null>(null)

const scrollToDay = (dayIndex: number) => {
  const el = bodyScrollContainer.value
  if (el) {
    el.scrollLeft = dayIndex * dayWidth.value
  }
}

const getEventsForCell = (date: Date, hour: number) => {
  const allEvents = [...eventStore.events]
  if (calendarStore.ghostEvent) {
    allEvents.push(calendarStore.ghostEvent)
  }

  const renderedEventIds = new Set<string>()

  const events = allEvents.filter(event => {
    const id = event.id
    const start = settingsStore.toMoment(event.start)
    const end = settingsStore.toMoment(event.end)

    const cellStart = settingsStore.toMoment(date).hour(hour).minute(0).second(0).millisecond(0)
    const cellEnd = cellStart.clone().add(1, 'hour')

    const shouldRender = start.isBefore(cellEnd) && end.isAfter(cellStart)

    if (!shouldRender) return false
    if (renderedEventIds.has(id)) return false

    // Check if this is the first hour in this day the event overlaps
    for (let h = 0; h < hour; h++) {
      const prevStart = settingsStore.toMoment(date).hour(h).minute(0).second(0).millisecond(0)
      const prevEnd = prevStart.clone().add(1, 'hour')
      if (start.isBefore(prevEnd) && end.isAfter(prevStart)) {
        return false
      }
    }

    renderedEventIds.add(id)
    return true
  })

  return events
}


const getEventStyle = (event: TimeEvent, currentDate: Date) => {
  const start = settingsStore.toMoment(event.start)
  const end = settingsStore.toMoment(event.end)
  const current = settingsStore.toMoment(currentDate).startOf('day')

  const isStartDay = start.isSame(current, 'day')

  const topOffset = isStartDay ? (start.minutes() / 60) * 72 : 0

  let height: number

  if (isStartDay) {
    const durationHours = end.diff(start, 'minutes') / 60
    const endOfDay = current.clone().endOf('day')
    const maxDuration = endOfDay.diff(start, 'minutes') / 60
    height = Math.min(durationHours * 72, maxDuration * 72)
  } else {
    const startOfDay = current.clone().startOf('day')
    const endTime = moment.min(end, current.clone().endOf('day'))
    const durationHours = endTime.diff(startOfDay, 'minutes') / 60
    height = durationHours * 72
  }

  return {
    top: `${topOffset}px`,
    height: `${height}px`,
    position: 'absolute'
  }
}


const shouldRenderGhostEvent = (ghost: TimeEvent, date: Date, hour: number) => {
  const start = settingsStore.toMoment(ghost.start)
  const end = settingsStore.toMoment(ghost.end)
  const current = settingsStore.toMoment(date).startOf('hour')

  const isStartDay = start.isSame(current, 'day')
  const isContinuation = !isStartDay && (end.isSame(current, 'day') || (current.isAfter(start) && current.isBefore(end)))

  return (isStartDay && start.hour() === hour) || (isContinuation && hour === 0)
}

const isMultiDay = (event: TimeEvent) => {
  const start = settingsStore.toMoment(event.start)
  const end = settingsStore.toMoment(event.end)

  return !start.isSame(end, 'day')
}

const hasEventCrossingHalfHour = (date: Date, hour: number) => {
  const cellStart = settingsStore.toMoment(date).hour(hour).minute(0).second(0).millisecond(0)
  const halfHour = cellStart.clone().add(30, 'minutes')

  return eventStore.events.some(event => {
    const start = settingsStore.toMoment(event.start)
    const end = settingsStore.toMoment(event.end)

    return start.isSame(cellStart, 'day') &&
      start.isBefore(halfHour) &&
      end.isAfter(halfHour)
  })
}

const hasEventOnFullHour = (date: Date, hour: number) => {
  const fullHour = settingsStore.toMoment(date).hour(hour).minute(0).second(0).millisecond(0)

  return eventStore.events.some(event => {
    const start = settingsStore.toMoment(event.start)
    const end = settingsStore.toMoment(event.end)

    return start.isSame(fullHour, 'day') &&
      start.isBefore(fullHour) &&
      end.isAfter(fullHour) &&
      !end.isSame(fullHour)
  })
}


function groupOverlappingClusters(events: TimeEvent[]): TimeEvent[][] {
  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const clusters: TimeEvent[][] = []

  for (const event of sorted) {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    let addedToCluster = false
    for (const cluster of clusters) {
      const overlap = cluster.some(e => {
        const start = new Date(e.start)
        const end = new Date(e.end)
        return start < eventEnd && end > eventStart
      })

      if (overlap) {
        cluster.push(event)
        addedToCluster = true
        break
      }
    }

    if (!addedToCluster) {
      clusters.push([event])
    }
  }

  return clusters
}

function assignColumns(cluster: TimeEvent[]) {
  const columns: TimeEvent[][] = []
  const eventToColumn = new Map<string, number>()

  for (const event of cluster) {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    let assigned = false
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const col = columns[colIndex]
      if (col.every(e => {
        const start = new Date(e.start)
        const end = new Date(e.end)
        return end <= eventStart || start >= eventEnd
      })) {
        col.push(event)
        eventToColumn.set(event.id, colIndex)
        assigned = true
        break
      }
    }

    if (!assigned) {
      columns.push([event])
      eventToColumn.set(event.id, columns.length - 1)
    }
  }

  return { eventToColumn, numColumns: columns.length }
}

function getOverlappingMeta(events: TimeEvent[]): Map<string, { count: number; index: number }> {
  const meta = new Map<string, { count: number; index: number }>()
  const clusters = groupOverlappingClusters(events)

  for (const cluster of clusters) {
    const { eventToColumn, numColumns } = assignColumns(cluster)
    for (const event of cluster) {
      meta.set(event.id, {
        count: numColumns,
        index: eventToColumn.get(event.id)!
      })
    }
  }

  return meta
}

const overlappingMeta = computed(() => {
  const meta = new Map<string, Map<string, { count: number; index: number }>>();

  for (const date of dateObjects.value) {
    const dayEvents = eventStore.events.filter(e => isSameDay(new Date(e.start), date));
    const clusterMeta = getOverlappingMeta(dayEvents)
    const dayMap = new Map<string, { count: number; index: number }>()
    for (const [id, value] of clusterMeta.entries()) {
      dayMap.set(id, value)
    }
    meta.set(moment(date).format('YYYY-MM-DD'), dayMap)
  }

  return meta;
});

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  recalculateDayWidth()
  updateCurrentHourFraction()
  setInterval(updateCurrentHourFraction, 60000)
  currentWeekStart.value = startOfWeek(calendarStore.today, { weekStartsOn: startsWithSunday ? 0 : 1 })
  updateDateObjects()
  requestAnimationFrame(() => {
    if (calendarStore.lastFocusedDate) {
      scrollToDay(dateObjects.value.findIndex(d => isSameDay(d, calendarStore.lastFocusedDate!)))
    } else {
      scrollToToday(VISIBLE_DAYS.value > 1 ? -1 : 0)
      scrollToHour(getStartingVisibleHour())
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const scrollToHour = (hour: number, highlightEventId: string | null = null) => {
  const elB = bodyScrollContainer.value
  const elH = leftHourColumnRef.value
  const elR = rightHourColumnRef.value
  if (elB && elH && elR) {
    const hourHeight = elH.scrollHeight / 24
    elB.scrollTop = hourHeight * (hour - 1)
    elH.scrollTop = hourHeight * (hour - 1)
    elR.scrollTop = hourHeight * (hour - 1)
    if (highlightEventId) {
      highlightEvent(highlightEventId)
    }
  }
}

const selectedEvent = ref<TimeEvent & { x: number; y: number } | null>(null)

const highlightGhostEvent = () => {
  const ghost = calendarStore.ghostEvent
  const container = bodyScrollContainer.value
  if (!ghost || !container) return

  const startDate = new Date(ghost.start)

  const dayIndex = dateObjects.value.findIndex(d => isSameDay(d, startDate))
  if (dayIndex === -1) return

  const startHour = startDate.getHours()
  const startMinutes = startDate.getMinutes()
  const topOffset = (startHour + startMinutes / 60) * 72

  const leftOffset = dayIndex * dayWidth.value

  const popupWidth = 240
  const rightGap = 8
  const leftGap = 100
  const rightX = leftOffset + dayWidth.value + rightGap
  const leftX = leftOffset - popupWidth - leftGap
  const fitsOnRight = rightX + popupWidth < container.scrollLeft + container.clientWidth

  selectedEvent.value = {
    ...ghost,
    x: fitsOnRight ? rightX : Math.max(leftX, 0),
    y: topOffset
  }
}


const highlightEvent = async (eventId: string) => {
  const event = [...eventStore.events, calendarStore.ghostEvent].find(e => e?.id === eventId)
  if (!event) return

  await nextTick()

  const container = bodyScrollContainer.value
  if (!container) return

  const eventElement = container.querySelector(`[data-event-id="${eventId}"]`) as HTMLElement
  if (!eventElement || eventElement.offsetParent === null) return

  const containerRect = container.getBoundingClientRect()
  const eventRect = eventElement.getBoundingClientRect()

  const popupWidth = 240
  const rightGap = 8
  const leftGap = 100

  const rightX = eventRect.right - containerRect.left + container.scrollLeft + rightGap
  const leftX = eventRect.left - containerRect.left + container.scrollLeft - popupWidth - leftGap

  const fitsOnRight = rightX + popupWidth < container.scrollLeft + container.clientWidth

  selectedEvent.value = {
    ...event,
    x: fitsOnRight ? rightX : Math.max(leftX, 0),
    y: eventRect.top - containerRect.top + container.scrollTop
  }
}

const closeEventPopup = () => {
  selectedEvent.value = null
}

const onDeleteEvent = () => {
  selectedEvent.value = null
}

const onResizeEvent = async (event: TimeEvent, minutes: number, isStart: boolean) => {
  if (isStart) {
    event.start = new Date(event.start.getTime() + minutes * 60 * 1000)
    await eventStore.modifyEvent(event)
  } else {
    event.end = new Date(event.end.getTime() + minutes * 60 * 1000)
    await eventStore.modifyEvent(event)
  }

  calendarStore.destroyGhostEvent()
}

const onResizeBothEvent = async (event: TimeEvent, minutes: number) => {
  event.start = new Date(event.start.getTime() + minutes * 60 * 1000)
  event.end = new Date(event.end.getTime() + minutes * 60 * 1000)
  await eventStore.modifyEvent(event)

  calendarStore.destroyGhostEvent()
}

const onResizeGhostEvent = async (minutes: number, isStart: boolean) => {
  if (!calendarStore.ghostEvent) return

  if (isStart) {
    calendarStore.ghostEvent.start = new Date(calendarStore.ghostEvent.start.getTime())
  } else {
    calendarStore.ghostEvent.end = new Date(calendarStore.ghostEvent.end.getTime())
  }
}

// HEADER -> BODY SCROLL
watchEffect(() => {
  if (headerScrollContainer.value && bodyScrollContainer.value) {
    bodyScrollContainer.value.addEventListener('scroll', () => {
      if (headerScrollContainer.value && bodyScrollContainer.value) {
        headerScrollContainer.value.scrollLeft = bodyScrollContainer.value.scrollLeft
      }
    })
  }
})

// BODY -> LEFT HOUR COLUMN SCROLL
watchEffect(() => {
  if (bodyScrollContainer.value && leftHourColumnRef.value) {
    bodyScrollContainer.value.addEventListener('scroll', () => {
      if (leftHourColumnRef.value && bodyScrollContainer.value) {
        leftHourColumnRef.value.scrollTop = bodyScrollContainer.value.scrollTop
      }
    })
  }
})

// BODY -> RIGHT HOUR COLUMN SCROLL
watchEffect(() => {
  if (bodyScrollContainer.value && rightHourColumnRef.value) {
    bodyScrollContainer.value.addEventListener('scroll', () => {
      if (rightHourColumnRef.value && bodyScrollContainer.value) {
        rightHourColumnRef.value.scrollTop = bodyScrollContainer.value.scrollTop
      }
    })
  }
})

watchEffect(() => {
  recalculateDayWidth()
})

const onCellClick = (date: Date, hour: number, e: MouseEvent) => {
  if (calendarStore.ghostEvent) return

  const target = e.target as HTMLElement
  if (target.closest('.calendar-event')) return

  const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickY = e.clientY - cellRect.top
  const minutes = Math.round((clickY / 72) * 60)

  const start = settingsStore
    .toMoment(date)
    .hour(hour)
    .minute(minutes)
    .second(0)
    .millisecond(0)
    .toDate()

  calendarStore.createGhostEvent(start, cellRect.left, cellRect.top)
}

defineExpose({ scrollToHour, highlightEvent })
</script>

<template>
  <!-- GRID CONTAINER: LEFT HOUR | CALENDAR | RIGHT HOUR -->
  <div class="grid h-screen w-full overflow-hidden p-1 md:p-2 gap-x-0"
  :class="[
    VISIBLE_DAYS > 1 ? 'grid-cols-[auto_1fr_auto]' : 'grid-cols-[1fr]'
  ]">
    <!-- LEFT FIXED HOUR COLUMN -->
    <div class="w-10 sm:w-12 z-10 overflow-hidden"
      :class="[
        VISIBLE_DAYS > 1 ? 'relative' : 'absolute'
      ]"
      style="mask-image: linear-gradient(to bottom, transparent 0px, black 64px); -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 64px);">
      <div ref="leftHourColumnRef" class="flex flex-col overflow-y-auto h-full scrollbar-none">
        <div class="h-[64px] shrink-0"></div>
        <div v-for="hour in hours" :key="'hour-left-' + hour" class="h-[72px] shrink-0">
          <CalendarHour :timeNotation="timeNotation" :hour="hour" containerClass="justify-end pr-2 whitespace-nowrap" />
        </div>
      </div>
    </div>

    <!-- CENTER CALENDAR COLUMN -->
    <div class="flex flex-col w-full " ref="calendarContainerRef">
      <!-- DISPLAY ALL VISIBLE DAYS-->
      <div v-if="VISIBLE_DAYS > 1" ref="headerScrollContainer" class="overflow-x-hidden scrollbar-none" :style="{ width: headerWidth }">
        <div class="flex w-max">
          <div v-for="(date, index) in dateObjects" :key="'head-' + moment(date).format('YYYY-MM-DD')"
            :style="{ width: `${dayWidth}px` }">
            <CalendarCell :width="dayWidth" :class="[
              'h-[64px] border-[#E0E0E0] border-b-[1px]',
              isToday(date) ? 'bg-[#EFF6FF]' : isWeekend(getDayName(date)) ? 'bg-[#FAFAFA]' : 'bg-white',
              index === 0 ? 'border-l-[0px]' : 'border-l-[1px]'
            ]">
              <div class="flex flex-col pt-1 pr-2 pb-4 pl-2">
                <span class="text-[10px] font-bold text-[#71717A]">{{ getDayName(date) }}</span>
                <span class="text-2xl text-black">{{ settingsStore.toMoment(date).format('DD') }}</span>
              </div>
            </CalendarCell>
          </div>
        </div>
      </div>
      <!-- DISPLAY 7 DAYS -->
      <div v-else ref="headerScrollContainer" class="overflow-x-hidden scrollbar-none w-full">
        <div class="flex justify-between w-full">
          <div v-for="(date, index) in headerDateObjects" :key="'head-' + moment(date).format('YYYY-MM-DD')" class="w-full">
            <CalendarCell
              @click="updateSelectedHeaderDay(date)"
              class="hover:cursor-pointer"
              :class="[
              'h-[64px] border-[#E0E0E0] border-b-[1px]',
              isToday(date) ? 'bg-[#EFF6FF]' : isWeekend(getDayName(date)) ? 'bg-[#FAFAFA]' : 'bg-white',
              index === 0 ? 'border-l-[0px]' : 'border-l-[1px]'
            ]">
              <div class="flex flex-col justify-center items-center md:items-start md:justify-center  pt-1 pr-2 pb-4 pl-2">
                <span class="text-[10px] font-bold text-[#71717A]">{{ getDayName(date) }}</span>
                <span class="text-xl text-black">{{ settingsStore.toMoment(date).format('DD') }}</span>
                <div v-if="isHeaderDay(date)" class="h-[6px] w-[6px] bg-[#0EA5E9] rounded-full"></div>
              </div>
            </CalendarCell>
          </div>
        </div>
      </div>

      <!-- BODY SCROLL AREA -->
      <div ref="bodyScrollContainer" class="overflow-x-auto overflow-y-auto calendar-body-scroll bg-red-500"
        :style="{ height: 'calc(100vh - 72px)', width: calendarWidth }">
        <div class="w-max relative">
          <div v-for="hour in hours" :key="'row-' + hour" class="flex h-[72px]">
            <div v-for="(date, index) in dateObjects" :key="moment(date).format('YYYY-MM-DD') + '-' + hour"
              :style="{ width: `${dayWidth}px` }">
              <CalendarCell :width="dayWidth"
                :displayHourIndicator="isToday(date) && currentHourFraction !== null && hour === 0"
                :hourIndicator="getCurrentHourIndicator()" :style="{ width: `${dayWidth}px` }" :class="[
                  'h-full border-b-[1px]',
                  isToday(date) ? 'bg-[#EFF6FF]' : isWeekend(getDayName(date)) ? 'bg-[#FAFAFA]' : 'bg-white',
                  index === 0 ? 'border-l-[0px]' : 'border-l-[1px]',
                  hasEventOnFullHour(date, hour + 1) ? 'border-b-transparent' : 'border-b-[#E0E0E0]',
                  'border-l-[#E0E0E0]'
                ]" @click="(e) => onCellClick(date, hour, e)">
                <!-- FINE LINE -->
                <template v-if="!hasEventCrossingHalfHour(date, hour)">
                  <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-[#F7F7F7]"></div>
                </template>
                <!-- CURRENT HOUR INDICATOR -->
                <template v-if="isToday(date) && currentHourFraction !== null && hour === 0">
                  <!-- DOT -->
                  <div class="absolute left-[-4px] right-0 h-[8px] w-[8px] rounded-full  z-30"
                    :style="{ top: `${72 * currentHourFraction - 4}px` }"></div>
                  <div class="absolute left-0 right-0 h-[2px]  z-30" :style="{ top: `${72 * currentHourFraction}px` }">
                  </div>
                </template>
                <!-- EVENTS -->
                <template v-for="(event) in getEventsForCell(date, hour)" :key="event.id">
                  <CalendarEvent v-show="!calendarStore.ghostEvent || calendarStore.ghostEvent.id !== event.id"
                    variant="default" :highlighted="selectedEvent?.id === event.id" :event="event"
                    :isMultiDay="isMultiDay(event)" :isGhostEvent="false" :data-event-id="event.id"
                    :style="getEventStyle(event, date)"
                    :overlappingEventsCount="overlappingMeta.get(moment(date).format('YYYY-MM-DD'))?.get(event.id)?.count ?? 1"
                    :eventIndex="overlappingMeta.get(moment(date).format('YYYY-MM-DD'))?.get(event.id)?.index ?? 0"
                    @click-event="highlightEvent" @resize:start="(minutes) => onResizeEvent(event, minutes, true)"
                    @resize:end="(minutes) => onResizeEvent(event, minutes, false)"
                    @resize:both="(minutes) => onResizeBothEvent(event, minutes)" />
                </template>
                <!-- GHOST EVENT -->
                <CalendarEvent v-show="shouldRenderGhostEvent(calendarStore.ghostEvent!, date, hour)"
                  v-if="calendarStore.ghostEvent" variant="edit" :event="calendarStore.ghostEvent"
                  :isMultiDay="isMultiDay(calendarStore.ghostEvent)"
                  :highlighted="selectedEvent?.id === calendarStore.ghostEvent?.id" :isGhostEvent="true"
                  :data-event-id="calendarStore.ghostEvent?.id" :style="getEventStyle(calendarStore.ghostEvent, date)"
                  :overlappingEventsCount="1" :eventIndex="0" @click-event="highlightGhostEvent"
                  @resize:start="(minutes) => onResizeGhostEvent(minutes, true)"
                  @resize:end="(minutes) => onResizeGhostEvent(minutes, false)"
                  @resize:both="(minutes) => onResizeGhostEvent(minutes, true)" />
              </CalendarCell>
            </div>
          </div>
          <div v-if="selectedEvent" class="absolute inset-0 z-[99]" @click="closeEventPopup">
          </div>
          <EventPopup v-if="selectedEvent" :event="selectedEvent"
            :isGhostEvent="selectedEvent.id === calendarStore.ghostEvent?.id" :close="closeEventPopup"
            @delete="onDeleteEvent" :style="{
              position: 'absolute',
              left: `${selectedEvent.x}px`,
              top: `${selectedEvent.y}px`,
              zIndex: 100
            }" @update:event="(updatedEvent) => selectedEvent = updatedEvent" />
        </div>
      </div>
    </div>

    <!-- RIGHT FIXED HOUR COLUMN -->
    <div v-if="VISIBLE_DAYS > 2" class="relative w-24 z-10 overflow-hidden scrollbar-none"
      style="mask-image: linear-gradient(to bottom, transparent 0px, black 64px); -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 64px);">
      <div ref="rightHourColumnRef" class="flex flex-col overflow-y-auto h-full scrollbar-none">
        <div class="h-[64px] shrink-0"></div>
        <div v-for="hour in hours" :key="'hour-right-' + hour" class="h-[72px] shrink-0">
          <CalendarHour :timeNotation="timeNotation" :hour="hour"
            containerClass="justify-start pl-2 whitespace-nowrap" />
        </div>
      </div>
    </div>
  </div>
</template>
