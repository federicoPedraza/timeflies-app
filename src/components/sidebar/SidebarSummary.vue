<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { format, addDays, addMonths, isBefore, subMonths } from 'date-fns';
import { getStartOfMonth, getEndOfMonth } from '@/utils/dates/date-formatter';
import { useEventStore, type TimeEvent } from '@/stores/events';
import { useCalendarStore } from '@/stores/calendar';
import { useWeatherStore } from '@/stores/weather';
import { useSettingsStore } from '@/stores/settings';
import moment from 'moment-timezone';

// Import weather icons
const weatherIcons = {
    sun: new URL('@/assets/icons/weather-icons/sun.svg', import.meta.url).href,
    cloudy: new URL('@/assets/icons/weather-icons/cloudy.svg', import.meta.url).href,
    'cloud-rain': new URL('@/assets/icons/weather-icons/cloud-rain.svg', import.meta.url).href,
    snow: new URL('@/assets/icons/weather-icons/snow.svg', import.meta.url).href,
    'cloud-fog': new URL('@/assets/icons/weather-icons/cloud-fog.svg', import.meta.url).href,
    'cloud-lightning': new URL('@/assets/icons/weather-icons/cloud-lightning.svg', import.meta.url).href,
    'cloud-wind': new URL('@/assets/icons/weather-icons/cloud-rain-wind.svg', import.meta.url).href,
    'cloud-off': new URL('@/assets/icons/weather-icons/cloud-off.svg', import.meta.url).href
}

const eventStore = useEventStore()
const calendarStore = useCalendarStore()
const weatherStore = useWeatherStore()

const events = computed(() => eventStore.events)
const weather = computed(() => weatherStore.weather)
const weatherLoading = ref(false)

const summaryCount = ref(4)
const maxEventsPerDay = 2
const WEATHER_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const LAST_WEATHER_FETCH_KEY = 'last_weather_fetch'
let weatherInterval: number | null = null

const settingsStore = useSettingsStore()

const today = new Date()

const isToday = (date: Date) => {
    return moment.tz(date, settingsStore.timezone).isSame(moment.tz(settingsStore.toMoment(new Date()), settingsStore.timezone), 'day')
}

const isSameDay = (a: Date, b: Date) => {
    return moment.tz(a, settingsStore.timezone).isSame(moment.tz(b, settingsStore.timezone), 'day')
}

const isAfter = (a: Date, b: Date) => {
    return moment.tz(a, settingsStore.timezone).isAfter(moment.tz(b, settingsStore.timezone))
}

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

const formatTime = (date: Date) => moment.tz(date, settingsStore.timezone).format('HH:mm')

const getEvents = (day: Date) => {
    const now = moment.tz(settingsStore.timezone).toDate()
    if (isToday(day)) {
        return events.value
            .filter(event => isSameDay(event.start, day) && isAfter(event.start, now))
            .slice(0, maxEventsPerDay)
    }

    return events.value
        .filter(event => isSameDay(event.start, day))
        .slice(0, maxEventsPerDay)
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

const fetchWeatherIfNeeded = async () => {
    const lastFetch = localStorage.getItem(LAST_WEATHER_FETCH_KEY)
    const now = Date.now()

    if (!lastFetch || now - parseInt(lastFetch) >= WEATHER_CACHE_DURATION) {
        weatherLoading.value = true
        await weatherStore.fetchWeather('Mar del Plata', summaryCount.value + 1)
        localStorage.setItem(LAST_WEATHER_FETCH_KEY, now.toString())
        weatherLoading.value = false
    }
}

const startWeatherFetch = async () => {
    if (weatherInterval) {
        clearInterval(weatherInterval)
    }
    await fetchWeatherIfNeeded()
    weatherInterval = window.setInterval(fetchWeatherIfNeeded, WEATHER_CACHE_DURATION)
}

const stopWeatherFetch = () => {
    if (weatherInterval) {
        clearInterval(weatherInterval)
        weatherInterval = null
    }
}

const updateSummaryCount = async () => {
    summaryCount.value = 4
    await fetchWeatherIfNeeded()
}

const getWeatherType = (day: Date) => {
    return weather.value.find(w => isSameDay(w.date, day))?.weatherType
}

const getWeatherTypeIcon = computed(() => (day: Date): string | undefined => {
    const weatherType = getWeatherType(day)
    switch (weatherType) {
        case 'sunny':
            return 'sun'
        case 'cloudy':
            return 'cloudy'
        case 'rainy':
            return 'cloud-rain'
        case 'snowy':
            return 'snow'
        case 'foggy':
            return 'cloud-fog'
        case 'stormy':
            return 'cloud-lightning'
        case 'windy':
            return 'cloud-wind'
        case 'unknown':
            return 'cloud-off'
        default:
            return undefined
    }
})

const getWeatherMinTemp = (day: Date) => {
    return weather.value.find(w => isSameDay(w.date, day))?.minTempC
}

const getWeatherMaxTemp = (day: Date) => {
    return weather.value.find(w => isSameDay(w.date, day))?.maxTempC
}

updateSummaryCount()

watch(eventStore.events, updateSummaryCount)

onMounted(() => {
    startWeatherFetch()
})

onUnmounted(() => {
    stopWeatherFetch()
})
</script>

<template>
    <div class="flex flex-col gap-4 h-full pl-4 overflow-y-auto">
        <div v-for="day in summaryCount" :key="day" class="flex flex-row gap-2">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex flex-row justify-between items-center">
                    <div class="flex flex-row justify-start items-center gap-2">
                        <span class="text-sm font-bold" :class="getDayColor(getDay(day))">{{
                            getDayName(getDay(day)).toUpperCase() }}</span>
                        <span class="text-sm tracking-wider" :class="getDayColor(getDay(day))">{{ format(getDay(day),
                            'd/M/yyyy') }}</span>
                    </div>
                    <div class="flex flex-row gap-2 justify-start items-start">
                        <div class="flex flex-row gap-2 justify-start items-start">
                            <span class="text-xs font-bold text-[#A1A1AA]">{{ getWeatherMinTemp(getDay(day)) ?? '⋅'
                                }}°C</span>
                            <span class="text-xs text-[#A1A1AA]">/</span>
                            <span class="text-xs text-[#A1A1AA]">{{ getWeatherMaxTemp(getDay(day)) ?? '⋅' }}°C</span>
                            <div class="flex flex-row gap-2 justify-start items-start">
                                <img v-if="getWeatherTypeIcon(getDay(day))"
                                    :src="weatherIcons[getWeatherTypeIcon(getDay(day)) as keyof typeof weatherIcons]"
                                    alt="weather type" class="w-4 h-4 invert brightness-0" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col gap-2 w-full">
                    <button v-for="event in getEvents(getDay(day))" :key="event.id"
                        class="flex flex-row justify-start items-start gap-2 group w-full" @click="onEventClick(event)">
                        <div class="flex flex-row gap-2">
                            <div class="flex flex-row gap-2 justify-start items-start">
                                <div class="w-3 h-3 rounded-full mt-0.5 bg-[#3B82F6]"></div>
                                <div class="flex flex-col justify-start items-start gap-1">
                                    <span class="text-xs font-semibold text-[#A1A1AA]">{{ formatTime(event.start) }} -
                                        {{ formatTime(event.end) }}</span>
                                    <span class="text-sm text-white group-hover:underline">{{ event.title }}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                    <div v-if="getEvents(getDay(day))?.length === 0" class="flex flex-row gap-2">
                        <div class="flex flex-row gap-2 justify-start items-start">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-xs font-semibold text-[#A1A1AA]">{{ isToday(getDay(day)) ? 'No events for the rest of the day!' : 'No events for this day!' }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-if="getEventOverflowCount(getDay(day)) > 0" class="flex flex-row gap-2">
                        <div class="flex flex-row gap-2 justify-start items-start">
                            <div class="flex flex-col gap-1.5">
                                <span class="text-xs font-semibold text-[#3B82F6]">+{{
                                    getEventOverflowCount(getDay(day)) }} more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
