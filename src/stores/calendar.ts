import type { TimeEvent } from "./events";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useCalendarStore = defineStore('calendar', () => {
    // settings
    const startsWithSunday = false;
    const focusOnCurrentHour = false;
    const timeNotation = ref<'12h' | '24h'>('12h');
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const timeZone = ref('UTC');

    // current state
    const today = new Date();
    const visibleMonth = ref(new Date());

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
        if (startsWithSunday) {
            return dayNames;
        } else {
            return dayNames.slice(1).concat(dayNames[0]);
        }
    }

    const getDayName = (date: number) => {
        return dayNames[date]
    }

    return {
        startsWithSunday,
        focusOnCurrentHour,
        timeNotation,
        timeZone,
        dayNames,
        today,
        visibleMonth,
        setVisibleMonth,
        getDayNamesInOrder,
        getDayName,
        lastFocusedDate,
        ghostEvent,
        createGhostEvent,
        destroyGhostEvent
    }
})
