import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.ts'
import { useCalendarStore } from './calendar.ts'
import { toZonedTime } from 'date-fns-tz'

const API = import.meta.env.VITE_API_BASE_URL

export interface TimeEvent {
    id: string
    title: string
    description: string
    start: Date
    end: Date
}

export const useEventStore = defineStore('events', () => {
  const events = ref<TimeEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const calendarStore = useCalendarStore()

  async function fetchEvents() {
    loading.value = true
    error.value = null

    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('token')

    if (!token) {
      error.value = 'Missing token'
      loading.value = false
      return
    }

    try {
      const res = await fetch(`${API}/v1/calendar/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to fetch events')

      const json = await res.json()
      events.value = json.data.map((e: any) => ({
        ...e,
        start: toZonedTime(e.start, calendarStore.timeZone),
        end: toZonedTime(e.end, calendarStore.timeZone),
      }))
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents
  }
})
