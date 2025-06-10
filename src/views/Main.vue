<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Calendar from './Calendar.vue'
import { useEventStore } from '@/stores/events'
import { onMounted, onUnmounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { getStartOfMonth, getEndOfMonth } from '@/utils/dates/date-formatter'
import { useRoute } from 'vue-router'
import { startOfWeek, endOfWeek } from 'date-fns'

const eventStore = useEventStore()
const calendarStore = useCalendarStore()

const getVisibleDateRange = () => {
  const monthStart = getStartOfMonth(calendarStore.visibleMonth)
  const monthEnd = getEndOfMonth(calendarStore.visibleMonth)

  return {
    start: startOfWeek(monthStart, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })
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

onMounted(() => {
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
    <Sidebar />
    <Calendar />
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
