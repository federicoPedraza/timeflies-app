<script setup lang="ts">
import { format, subMonths, addMonths, isSameMonth } from 'date-fns';
import { useCalendarStore } from '@/stores/calendar';
import { computed } from 'vue';
import { useEventStore } from '@/stores/events';
import { getStartOfMonth } from '@/utils/dates/date-formatter.ts';
import { getEndOfMonth } from '@/utils/dates/date-formatter.ts';
import { useRouter } from 'vue-router'
import { startOfWeek, endOfWeek } from 'date-fns'
import { useSettingsStore } from '@/stores/settings'

const calendarStore = useCalendarStore()
const eventStore = useEventStore()
const router = useRouter()
const settingsStore = useSettingsStore()

const getVisibleDateRange = () => {
  const monthStart = getStartOfMonth(calendarStore.visibleMonth)
  const monthEnd = getEndOfMonth(calendarStore.visibleMonth)

  return {
    start: startOfWeek(monthStart, { weekStartsOn: settingsStore.startsWithSunday ? 0 : 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: settingsStore.startsWithSunday ? 0 : 1 })
  }
}

const props = defineProps<{
    month: Date
}>()

const handlePreviousMonth = async () => {
    calendarStore.setVisibleMonth(subMonths(props.month, 1))
    calendarStore.lastFocusedDate = null

    // fetch events for the new month
    const { start, end } = getVisibleDateRange()
    await eventStore.fetchEvents(start, end)

    // update query params
    router.push({ query: { month: format(calendarStore.visibleMonth, 'MMMM').toLowerCase() } })

    calendarStore.destroyGhostEvent()
}

const handleNextMonth = async () => {
    calendarStore.setVisibleMonth(addMonths(props.month, 1))
    calendarStore.lastFocusedDate = null

    // fetch events for the new month
    const { start, end } = getVisibleDateRange()
    await eventStore.fetchEvents(start, end)

    // update query params
    router.push({ query: { month: format(calendarStore.visibleMonth, 'MMMM').toLowerCase() } })

    calendarStore.destroyGhostEvent()
}

const handleResetView = async () => {
    calendarStore.setVisibleMonth(calendarStore.today)

    // fetch events for the new month
    const { start, end } = getVisibleDateRange()
    await eventStore.fetchEvents(start, end)

    // update query params
    router.push({ query: { month: format(calendarStore.visibleMonth, 'MMMM').toLowerCase() } })

    calendarStore.destroyGhostEvent()
}

const shouldShowResetView = computed(() => !isSameMonth(calendarStore.visibleMonth, calendarStore.today))
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-row justify-between items-center">
            <div class="flex flex-row gap-2">
                <h1 class="text-white text-3xl">{{ format(props.month, 'MMMM') }}</h1>
                <span class="text-[#EF4444] text-3xl">{{ format(props.month, 'yyyy') }}</span>
            </div>
            <div class="flex flex-row gap-2">
                <button type="button" v-if="shouldShowResetView"  @click="handleResetView" class="p-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#ffffff24] active:bg-[#ffffff32] active:scale-95">
                    <img src="@/assets/icons/sidebar/locate-icon.svg" alt="reset view" />
                </button>
                <button type="button" @click="handlePreviousMonth" class="p-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#ffffff24] active:bg-[#ffffff32] active:scale-95">
                    <img src="@/assets/icons/sidebar/back-icon.svg" alt="previous month" />
                </button>
                <button type="button" @click="handleNextMonth" class="p-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#ffffff24] active:bg-[#ffffff32] active:scale-95">
                    <img src="@/assets/icons/sidebar/next-icon.svg" alt="next month" />
                </button>
            </div>
        </div>
    </div>
</template>
