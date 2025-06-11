import { defineStore } from 'pinia'
import { ref } from 'vue'

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
        // Update local storage when timezone changes
        const currentSettings = {
            timeNotation: timeNotation.value,
            startsWithSunday: startsWithSunday.value,
            focusHourOnStart: focusHourOnStart.value,
            timezone: timezone.value
        }
        localStorage.setItem('settings', JSON.stringify(currentSettings))
    }

    return {
        timeNotation,
        startsWithSunday,
        focusHourOnStart,
        timezone,
        settimezone
    }
})
