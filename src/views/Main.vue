<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Calendar from './Calendar.vue'
import { useEventStore } from '@/stores/events'
import { onMounted, onUnmounted, ref, watch } from 'vue'
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
const sidebarRef = ref<InstanceType<typeof Sidebar>>()

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

const isSidebarOpen = ref(false)
const isConfigModalOpen = ref<boolean>(false)

const handleConfigModalOpen = (open: boolean) => {
  console.log('handleConfigModalOpen', open)
  isConfigModalOpen.value = open
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="flex h-screen overflow-hidden ">
    <!-- Desktop sidebar (md+) -->
    <aside class="hidden md:flex md:flex-col md:w-auto  bg-bland-dark text-white p-6">
      <Sidebar @config-modal-open="handleConfigModalOpen" />
    </aside>

    <!-- Main area -->
    <div class="flex-1 relative flex flex-col">
      <!-- Mobile toggle button -->
      <button
        v-if="!isConfigModalOpen"
        @click="toggleSidebar"
        class="fixed top-[30px]  right-6 z-[51] md:hidden  bg-bland-dark text-white rounded-lg shadow focus:outline-none focus:ring"
        aria-label="Toggle menu"
      >
        <!-- Hamburger when closed -->
        <svg
          v-if="!isSidebarOpen"
          class="w-9 h-9 p-2.5 border-gray-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>

        <!-- X when open -->
        <svg
          v-else
          class="w-9 h-9 p-2.5 border-gray-200 border rounded-md"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Mobile drawer (full viewport) -->
      <aside
        class="fixed inset-0 bg-bland-dark text-white transform transition-transform duration-300 z-50 ease-in-out md:hidden
               p-3 sm:p-4"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <Sidebar @config-modal-open="handleConfigModalOpen" />
      </aside>

      <!-- Main content area -->
      <main class="flex-1 bg-gray-100 overflow-auto pt-2 md:p-8">
        <Calendar />
      </main>
    </div>
  </div>
</template>
