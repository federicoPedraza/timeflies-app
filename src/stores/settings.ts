import { defineStore } from 'pinia'
import { ref } from 'vue'
import moment from 'moment-timezone'

export const useSettingsStore = defineStore('settings', () => {
    // Load settings from local storage or use defaults
    const storedSettings = localStorage.getItem('settings')
    const defaultSettings = {
        timeNotation: '12' as '12' | '24',
        startsWithSunday: false,
        focusHourOnStart: true,
        timezone: 'UTC'
    }
    const settings = storedSettings ? JSON.parse(storedSettings) : defaultSettings

    const timeNotation = ref<'12' | '24'>(settings.timeNotation)
    const startsWithSunday = ref(settings.startsWithSunday)
    const focusHourOnStart = ref(settings.focusHourOnStart)
    const timezone = ref(settings.timezone)

    const settimezone = (newTimezone: string) => {
        timezone.value = newTimezone
        writeSettings()
    }

    const setWeekStartsOnSunday = (value: boolean) => {
        startsWithSunday.value = value
        writeSettings()
    }

    const writeSettings = () => {
        const currentSettings = {
            timeNotation: timeNotation.value,
            startsWithSunday: startsWithSunday.value,
            focusHourOnStart: focusHourOnStart.value,
            timezone: timezone.value
        }
        localStorage.setItem('settings', JSON.stringify(currentSettings))
    }

    const toTimezone = (date: Date): string => {
        return toMoment(date).format('YYYY-MM-DD HH:mm:ss z')
    }

    const toMoment = (date: Date): moment.Moment => {
        return moment.utc(date).tz(timezone.value)
    }

    return {
        timeNotation,
        startsWithSunday,
        focusHourOnStart,
        timezone,
        settimezone,
        setWeekStartsOnSunday,
        toTimezone,
        toMoment
    }
})
