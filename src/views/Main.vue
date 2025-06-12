<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Calendar from './Calendar.vue'
import { useEventStore } from '@/stores/events'
import { onMounted, onUnmounted, ref } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { getStartOfMonth, getEndOfMonth } from '@/utils/dates/date-formatter'
import { useRoute } from 'vue-router'
import { startOfWeek, endOfWeek } from 'date-fns'
import MessageToast from '@/components/toast/MessageToast.vue'
import { h } from 'vue'
import { useToast } from '@/stores/toast'
import { useSettingsStore } from '@/stores/settings'

const eventStore = useEventStore()
const calendarStore = useCalendarStore()
const settingsStore = useSettingsStore()

const getVisibleDateRange = () => {
  const monthStart = getStartOfMonth(calendarStore.visibleMonth, settingsStore.timezone)
  const monthEnd = getEndOfMonth(calendarStore.visibleMonth, settingsStore.timezone)

  return {
    start: startOfWeek(monthStart, { weekStartsOn: settingsStore.startsWithSunday ? 0 : 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: settingsStore.startsWithSunday ? 0 : 1 })
  }
}

const parseMonthQuery = (month: string) => {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const monthIndex = months.indexOf(month.toLowerCase())
  if (monthIndex === -1) return null

  const date = new Date()
  date.setMonth(monthIndex)
  return date
}

const toastStore = useToast()
const calendarRef = ref()

onMounted(() => {
  toastStore.addToast(
    h(MessageToast, {
      message: 'Welcome to the calendar!',
    }),
    'info',
  )

  // get current month from query
  const route = useRoute()
  const month = route.query.month as string

  if (month) {
    const parsedDate = parseMonthQuery(month)
    if (parsedDate) {
      calendarStore.setVisibleMonth(parsedDate)
    }
  }

  const { start, end } = getVisibleDateRange()
  eventStore.fetchEvents(start, end)

  intervalId = setInterval(() => {
    const { start, end } = getVisibleDateRange()
    eventStore.fetchEvents(start, end)
  }, 60_000) // every 60 seconds
})

let intervalId: ReturnType<typeof setInterval>

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="main">
    <Sidebar v-model:calendar-ref="calendarRef" />
    <Calendar ref="calendarRef" />
  </div>
</template>

<style scoped lang="css">
.main {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
}

.main :deep(.sidebar) {
    width: 26%;
    height: 100%;
}

.main :deep(.calendar) {
    flex: 1;
    height: 100%;
}
</style>
