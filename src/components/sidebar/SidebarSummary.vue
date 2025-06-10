<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { format, addDays, isToday, isSameDay, isAfter, addMonths, isBefore, subMonths } from 'date-fns';
import { getStartOfMonth, getEndOfMonth } from '@/utils/dates/date-formatter';
import { useEventStore, type TimeEvent } from '@/stores/events';
import { useCalendarStore } from '@/stores/calendar';

const eventStore = useEventStore()
const calendarStore = useCalendarStore()

const events = computed(() => eventStore.events)

const summaryCount = ref(4)
const maxEventsPerDay = 2

const today = new Date()

const getDay = (day: number) => {
    return addDays(today, day - 1)
}

const getDayName = (day: Date) => {
    if (isToday(day)) {
        return 'Today'
    }

    if (isSameDay(day, addDays(today, 1))) {
        return 'Tomorrow'
    }

    return format(day, 'EEEE')
}

const getDayColor = (day: Date) => {
    if (isToday(day)) {
        return 'text-[#3B82F6]'
    }

    return 'text-[#FFFFFF]/70'
}

const getEvents = (day: Date) => {
    if (isToday(day)) {
        // get events that are today and are not in the past
        return events.value.filter(event => isSameDay(event.start, day) && isAfter(event.start, new Date())).slice(0, maxEventsPerDay)
    }

    return events.value.filter(event => isSameDay(event.start, day)).slice(0, maxEventsPerDay)
}

const getEventOverflowCount = (day: Date) => {
    if (isToday(day)) {
        return events.value.filter(event => isSameDay(event.start, day) && isAfter(event.start, new Date())).length - maxEventsPerDay
    }
    return events.value.filter(event => isSameDay(event.start, day)).length - maxEventsPerDay
}

const onEventClick = (event: TimeEvent) => {
    // check if the event is in another month
    if (isAfter(event.start, getEndOfMonth(calendarStore.visibleMonth))) {
        calendarStore.setVisibleMonth(addMonths(calendarStore.visibleMonth, 1))
    } else if (isBefore(event.start, getStartOfMonth(calendarStore.visibleMonth))) {
        calendarStore.setVisibleMonth(subMonths(calendarStore.visibleMonth, 1))
    }

    calendarStore.lastFocusedDate = event.start
    handleScrollToHour(event.start.getHours(), event.id)
}

const emit = defineEmits(['scroll-to-hour'])

const handleScrollToHour = (hour: number, highlightEventId: string | null = null) => {
    emit('scroll-to-hour', hour, highlightEventId)
}

const updateSummaryCount = () => {
    summaryCount.value = 4
}

updateSummaryCount()

watch(eventStore.events, updateSummaryCount)
</script>

<template>
    <div class="flex flex-col gap-4 h-full pl-4 overflow-y-auto">
        <div v-for="day in summaryCount" :key="day" class="flex flex-row gap-2">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex flex-row justify-between items-center">
                    <div class="flex flex-row justify-start items-center gap-2">
                        <span class="text-sm font-bold" :class="getDayColor(getDay(day))">{{ getDayName(getDay(day)).toUpperCase() }}</span>
                        <span class="text-sm tracking-wider" :class="getDayColor(getDay(day))">{{ format(getDay(day), 'd/M/yyyy') }}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 w-full">
                    <button v-for="event in getEvents(getDay(day))" :key="event.id" class="flex flex-row justify-start items-start gap-2 group w-full" @click="onEventClick(event)">
                        <div class="flex flex-col gap-2">
                            <div class="flex flex-row gap-2 justify-start items-start">
                                <div class="w-3 h-3 rounded-full mt-0.5 bg-[#3B82F6]"></div>
                                <div class="flex flex-col justify-start items-start gap-1">
                                    <span class="text-xs font-semibold text-[#A1A1AA]">{{ format(event.start, 'HH:mm') }} - {{ format(event.end, 'HH:mm a') }}</span>
                                    <span class="text-sm text-white group-hover:underline">{{ event.title }}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                    <div v-if="getEvents(getDay(day)).length === 0" class="flex flex-row gap-2">
                        <div class="flex flex-row gap-2 justify-start items-start">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-xs font-semibold text-[#A1A1AA]">{{  isToday(getDay(day)) ? 'No events for the rest of the day!' : 'No events for this day!' }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="getEventOverflowCount(getDay(day)) > 0" class="flex flex-row gap-2">
                        <div class="flex flex-row gap-2 justify-start items-start">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-xs font-semibold text-[#3B82F6]">+{{ getEventOverflowCount(getDay(day)) }} more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
