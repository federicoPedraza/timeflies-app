import type { TimeEvent } from "./events";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useSettingsStore } from "./settings";
import moment from 'moment-timezone';

export const useCalendarStore = defineStore('calendar', () => {
    // settings
    const settingsStore = useSettingsStore();

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    // current state
    const today = new Date();
    const visibleMonth = ref(moment.tz(settingsStore.timezone).toDate())

    const lastFocusedDate = ref<Date | null>(null);

    // actions
    const setVisibleMonth = (month: Date) => {
        visibleMonth.value = month;
    }

    // ghosts
    const ghostEvent = ref<TimeEvent & { x: number; y: number } | null>(null);

    // create ghost event
    const createGhostEvent = (startingDate: Date = new Date(), x: number = 0, y: number = 0) => {
        const endDate = new Date(startingDate.getTime() + 60 * 60 * 1000) // 1 hour

        const newGhostEvent: TimeEvent & { x: number; y: number } = {
            id: crypto.randomUUID(),
            title: 'New Event',
            description: '',
            start: startingDate,
            end: endDate,
            x: x,
            y: y
        }

        ghostEvent.value = newGhostEvent;
    }

    const destroyGhostEvent = () => {
        ghostEvent.value = null;
    }

    const getDayNamesInOrder = () => {
        if (settingsStore.startsWithSunday) {
            return dayNames;
        } else {
            return dayNames.slice(1).concat(dayNames[0]);
        }
    }

    const getDayName = (date: number) => {
        return dayNames[date]
    }

    return {
        dayNames,
        today,
        visibleMonth,
        setVisibleMonth,
        getDayNamesInOrder,
        getDayName,
        lastFocusedDate,
        ghostEvent,
        createGhostEvent,
        destroyGhostEvent,
    }
})
