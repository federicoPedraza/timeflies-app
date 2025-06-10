<script setup lang="ts">
import { ref, onMounted, watchEffect, watch, nextTick, computed } from 'vue'
import { startOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isSameMonth } from 'date-fns'
import CalendarHour from '../components/calendar/CalendarHour.vue'
import CalendarCell from '../components/calendar/CalendarCell.vue'
import CalendarEvent from '../components/calendar/CalendarEvent.vue'
import { formatDate } from '@/utils/dates/date-formatter'
import { useCalendarStore } from '@/stores/calendar'
import { useEventStore, type TimeEvent } from '@/stores/events'
import EventPopup from '../components/modals/EventPopup.vue'

const calendarStore = useCalendarStore()
const eventStore = useEventStore()

const { startsWithSunday, timeNotation, dayNames, focusOnCurrentHour } = calendarStore

const getDayName = (date: Date) => dayNames[date.getDay()]

const currentWeekStart = ref(startOfWeek(calendarStore.today, { weekStartsOn: startsWithSunday ? 0 : 1 }))
const dateObjects = ref<Date[]>([])

watch(
  () => calendarStore.visibleMonth,
  (newMonth, oldMonth) => {
    const isPreviousMonth = oldMonth && isBefore(newMonth, oldMonth)

    dateObjects.value = generateMonthRange(newMonth)
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
const isToday = (date: Date) => isSameDay(date, calendarStore.today)

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
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  currentHourFraction.value = hour + (minute / 60)
}

const dayWidth = ref(144)
const VISIBLE_DAYS = 7
const calendarWidth = ref(`${dayWidth.value * VISIBLE_DAYS}px`)

const recalculateDayWidth = () => {
  if (calendarContainerRef.value) {
    const containerWidth = calendarContainerRef.value.clientWidth
    dayWidth.value = containerWidth / VISIBLE_DAYS
    calendarWidth.value = `${dayWidth.value * VISIBLE_DAYS}px`
  }
}

const getStartingVisibleHour = () => {
  if (focusOnCurrentHour) {
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

const scrollToDay = (dayIndex: number) => {
  const el = bodyScrollContainer.value
  if (el) {
    el.scrollLeft = dayIndex * dayWidth.value
  }
}
const getEventsForCell = (date: Date, hour: number) => {
  return eventStore.events.filter(event => {
    const start = new Date(event.start)
    return isSameDay(start, date) && start.getHours() === hour
  })
}

const getEventStyle = (event: TimeEvent) => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const topOffset = (start.getMinutes() / 60) * 72
  const height = durationHours * 72

  return {
    top: `${topOffset}px`,
    height: `${height}px`,
    position: 'absolute'
  }
}

const hasEventCrossingHalfHour = (date: Date, hour: number) => {
  const cellStart = new Date(date)
  cellStart.setHours(hour, 0, 0, 0)

  const halfHour = new Date(cellStart)
  halfHour.setMinutes(30)

  const cellEnd = new Date(cellStart)
  cellEnd.setHours(hour + 1, 0, 0, 0)

  return eventStore.events.some(event => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)

    // Event spans across the :30 mark within this hour
    return isSameDay(eventStart, date) &&
      eventStart < halfHour &&
      eventEnd > halfHour
  })
}

const hasEventOnFullHour = (date: Date, hour: number) => {
  const fullHour = new Date(date)
  fullHour.setHours(hour, 0, 0, 0)

  return eventStore.events.some(event => {
    const start = new Date(event.start)
    const end = new Date(event.end)

    return isSameDay(start, date) &&
      start.getTime() < fullHour.getTime() &&
      end.getTime() > fullHour.getTime() &&
      end.getTime() !== fullHour.getTime() // ← filter exact match
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
    meta.set(date.toDateString(), dayMap)
  }

  return meta;
});

onMounted(() => {
  recalculateDayWidth()
  updateCurrentHourFraction()
  setInterval(updateCurrentHourFraction, 60000)
  window.addEventListener('resize', recalculateDayWidth)
  currentWeekStart.value = startOfWeek(calendarStore.today, { weekStartsOn: startsWithSunday ? 0 : 1 })
  dateObjects.value = generateMonthRange(calendarStore.visibleMonth)
  requestAnimationFrame(() => {
    if (calendarStore.lastFocusedDate) {
      scrollToDay(dateObjects.value.findIndex(d => isSameDay(d, calendarStore.lastFocusedDate!)))
    } else {
      scrollToToday(-1) // we do -1 because we want to see at least the past day
      scrollToHour(getStartingVisibleHour())
    }
  })
  onMounted(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEventPopup()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })
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
const highlightedEventId = ref<string | null>(null)

const highlightEvent = (eventId: string) => {
  const event = eventStore.events.find(e => e.id === eventId)
  if (!event) return

  const container = bodyScrollContainer.value
  if (!container) return

  const eventElement = container.querySelector(`[data-event-id="${eventId}"]`) as HTMLElement
  if (!eventElement) return

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

  // prevent opening event popup on event click
  const target = e.target as HTMLElement
  if (target.closest('.calendar-event')) return

  const cellRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const clickY = e.clientY - cellRect.top
  const minutes = Math.round((clickY / 72) * 60)

  const start = new Date(date)
  start.setHours(hour, minutes, 0, 0)
  calendarStore.createGhostEvent(start)
}

defineExpose({ scrollToHour, highlightEvent })
</script>

<template>
  <!-- GRID CONTAINER: LEFT HOUR | CALENDAR | RIGHT HOUR -->
  <div class="grid grid-cols-[auto_1fr_auto] h-screen w-full overflow-hidden p-4 gap-x-0">
    <!-- LEFT FIXED HOUR COLUMN -->
    <div class="relative w-12  z-10 overflow-hidden"
      style="mask-image: linear-gradient(to bottom, transparent 0px, black 64px); -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 64px);">
      <div ref="leftHourColumnRef" class="flex flex-col overflow-y-auto h-full scrollbar-none">
        <div class="h-[64px] shrink-0"></div>
        <div v-for="hour in hours" :key="'hour-left-' + hour" class="h-[72px] shrink-0">
          <CalendarHour :timeNotation="timeNotation" :hour="hour" containerClass="justify-end pr-2 whitespace-nowrap" />
        </div>
      </div>
    </div>

    <!-- CENTER CALENDAR COLUMN -->
    <div class="flex flex-col" ref="calendarContainerRef">
      <!-- HEADER SCROLL AREA -->
      <div ref="headerScrollContainer" class="overflow-x-hidden scrollbar-none" :style="{ width: calendarWidth }">
        <div class="flex w-max">
          <div v-for="(date, index) in dateObjects" :key="'head-' + date.toDateString()"
            :style="{ width: `${dayWidth}px` }">
            <CalendarCell :width="dayWidth" :class="[
              'h-[64px] border-[#E0E0E0] border-b-[1px]',
              isToday(date) ? 'bg-[#EFF6FF]' : isWeekend(getDayName(date)) ? 'bg-[#FAFAFA]' : 'bg-white',
              index === 0 ? 'border-l-[0px]' : 'border-l-[1px]'
            ]">
              <div class="flex flex-col pt-1 pr-2 pb-4 pl-2">
                <span class="text-[10px] font-bold text-[#71717A]">{{ getDayName(date) }}</span>
                <span class="text-2xl text-black">{{ formatDate(date, 'dd') }}</span>
              </div>
            </CalendarCell>
          </div>
        </div>
      </div>

      <!-- BODY SCROLL AREA -->
      <div ref="bodyScrollContainer" class="overflow-x-auto overflow-y-auto calendar-body-scroll"
        :style="{ height: 'calc(100vh - 72px)', width: calendarWidth }">
        <div class="w-max relative">
          <div v-for="hour in hours" :key="'row-' + hour" class="flex h-[72px]">
            <div v-for="(date, index) in dateObjects" :key="date.toDateString() + '-' + hour"
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
                <CalendarEvent variant="default" v-for="(event) in getEventsForCell(date, hour)" :key="event.id"
                  :event="event"
                  :data-event-id="event.id"
                  :style="calendarStore.ghostEvent?.id === event.id ? { display: 'none' } : getEventStyle(event)"
                  :overlappingEventsCount="overlappingMeta.get(date.toDateString())?.get(event.id)?.count ?? 1"
                  :eventIndex="overlappingMeta.get(date.toDateString())?.get(event.id)?.index ?? 0"
                  @click="() => highlightEvent(event.id)"
                  @resize:start="(minutes) => {
                    onResizeEvent(event, minutes, true)
                  }" @resize:end="(minutes) => {
                    onResizeEvent(event, minutes, false)
                  }" />
                <!-- GHOST EVENT -->
                <CalendarEvent
                  v-if="calendarStore.ghostEvent && isSameDay(new Date(calendarStore.ghostEvent.start), date) && new Date(calendarStore.ghostEvent.start).getHours() === hour"
                  variant="edit" :event="calendarStore.ghostEvent" :style="getEventStyle(calendarStore.ghostEvent)"
                  :overlappingEventsCount="1" :eventIndex="0" @click="(e: MouseEvent) => {
                    const container = bodyScrollContainer
                    const targetEl = e.currentTarget as HTMLElement

                    if (container && targetEl) {
                      const containerRect = container.getBoundingClientRect()
                      const eventRect = targetEl.getBoundingClientRect()

                      const popupWidth = 240
                      const rightGap = 8
                      const leftGap = 100

                      const rightX = eventRect.right - containerRect.left + container.scrollLeft + rightGap
                      const leftX = eventRect.left - containerRect.left + container.scrollLeft - popupWidth - leftGap

                      const fitsOnRight = rightX + popupWidth < container.scrollLeft + container.clientWidth

                      selectedEvent = calendarStore.ghostEvent ? {
                        ...calendarStore.ghostEvent,
                        x: fitsOnRight ? rightX : Math.max(leftX, 0),
                        y: eventRect.top - containerRect.top + container.scrollTop
                      } : null
                    }
                  }"
                  @resize:start="(minutes) => {
                    onResizeGhostEvent(minutes, true)
                  }"
                  @resize:end="(minutes) => {
                    onResizeGhostEvent(minutes, false)
                  }" />
              </CalendarCell>
            </div>
          </div>
          <div v-if="selectedEvent" class="absolute inset-0 z-[99]" @click="closeEventPopup">
          </div>
          <EventPopup v-if="selectedEvent" :event="selectedEvent"
              :isGhostEvent="selectedEvent.id === calendarStore.ghostEvent?.id" :close="closeEventPopup" @delete="onDeleteEvent" :style="{
              position: 'absolute',
              left: `${selectedEvent.x}px`,
              top: `${selectedEvent.y}px`,
              zIndex: 100
            }" @update:event="(updatedEvent) => selectedEvent = updatedEvent" />
        </div>
      </div>
    </div>

    <!-- RIGHT FIXED HOUR COLUMN -->
    <div class="relative w-24 z-10 overflow-hidden scrollbar-none"
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
