import { defineStore } from 'pinia'
import { h, ref } from 'vue'
import { useAuthStore } from './auth'
import MessageToast from '@/components/toast/MessageToast.vue'
import { useToast } from './toast'

const API = import.meta.env.VITE_API_BASE_URL
const WEATHER_CACHE_KEY = 'weather_cache'
const WEATHER_ERROR_TOAST_KEY = 'weather_error_toast'
const TOAST_DEBOUNCE_MS = 10 * 60 * 1000 // 10 minutes

export interface WeatherForecast {
    date: Date
    minTempC: number
    maxTempC: number
    minTempF: number
    maxTempF: number
    weatherType: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'stormy' | 'windy' | 'unknown'
}

export const useWeatherStore = defineStore('weather', () => {
    const weather = ref<WeatherForecast[]>([])
    const toastStore = useToast()

    const showErrorToast = () => {
        const lastToastTime = localStorage.getItem(WEATHER_ERROR_TOAST_KEY)
        const now = Date.now()

        if (!lastToastTime || (now - parseInt(lastToastTime)) > TOAST_DEBOUNCE_MS) {
            toastStore.addToast(
                h(MessageToast, {
                    message: 'There was an error fetching weather.',
                }),
                'error',
            )
            localStorage.setItem(WEATHER_ERROR_TOAST_KEY, now.toString())
        }
    }

    const loadCachedWeather = () => {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY)
        if (cached) {
            try {
                const parsed = JSON.parse(cached)
                weather.value = parsed.map((e: any) => ({
                    ...e,
                    date: new Date(e.date)
                }))
            } catch (err) {
                console.error('Failed to parse cached weather:', err)
                localStorage.removeItem(WEATHER_CACHE_KEY)
            }
        }
    }

    const cacheWeather = (data: WeatherForecast[]) => {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data))
    }

    const fetchWeather = async (city: string, days: number) => {
        const authStore = useAuthStore()
        const token = authStore.accessToken || localStorage.getItem('accessToken')

        if (!token) {
            showErrorToast()
            return
        }

        try {
            const res = await fetch(`${API}/v1/calendar/weather?city=${city}&days=${days}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!res.ok) {
                showErrorToast()
                return
            }

            const json = await res.json()
            const formattedData = json.data.map((e: any) => ({
                date: new Date(e.date),
                minTempC: e.minTempC,
                maxTempC: e.maxTempC,
                minTempF: cToF(e.minTempC),
                maxTempF: cToF(e.maxTempC),
                weatherType: e.weatherType
            }))

            weather.value = formattedData
            cacheWeather(formattedData)
        } catch (err: any) {
            loadCachedWeather()
            showErrorToast()
        }
    }

    const cToF = (c: number) => {
        return (c * 9/5) + 32
    }

    // Load cached data on store initialization
    loadCachedWeather()

    return {
        weather,
        fetchWeather,
        cToF,
    }
})
