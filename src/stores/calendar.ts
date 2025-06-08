import { defineStore } from "pinia";
import { ref } from "vue";

export const useCalendarStore = defineStore('calendar', () => {
    // settings
    const startsWithSunday = false;
    const focusOnCurrentHour = true;
    const timeNotation = ref<'12h' | '24h'>('12h');
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    // current state
    const today = new Date();
    const visibleMonth = ref(new Date());

    // actions
    const setVisibleMonth = (month: Date) => {
        visibleMonth.value = month;
    }

    return {
        startsWithSunday,
        focusOnCurrentHour,
        timeNotation,
        dayNames,
        today,
        visibleMonth,
        setVisibleMonth,
    }
})
