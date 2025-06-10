import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth.ts'
import { useCalendarStore } from './calendar.ts'
import { getStartOfMonth } from '@/utils/dates/date-formatter.ts'
import { getEndOfMonth } from '@/utils/dates/date-formatter.ts'
import { startOfWeek, endOfWeek } from 'date-fns'

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

  async function fetchEvents(start?: Date, end?: Date) {
    const calendarStore = useCalendarStore()

    if (!start || !end) {
      const monthStart = getStartOfMonth(calendarStore.visibleMonth)
      const monthEnd = getEndOfMonth(calendarStore.visibleMonth)

      start = startOfWeek(monthStart, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })
      end = endOfWeek(monthEnd, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })
    }

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
      const res = await fetch(`${API}/v1/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to fetch events')

      const json = await res.json()
      events.value = json.data.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }))
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function modifyEvent(event: Partial<TimeEvent>) {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('token')

    if (!event.id) {
      error.value = 'Event ID is required'
      return
    }

    try {
      const res = await fetch(`${API}/v1/calendar/modify/${event.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          start: event.start?.toISOString(),
          end: event.end?.toISOString()
        })
      })

      if (!res.ok) throw new Error('Failed to modify event')

      const json = await res.json()
      events.value = json.data.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }))
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createEvent(event: Partial<TimeEvent>) {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('token')

    if (!event.title) {
      error.value = 'Event title is required'
      return
    }

    try {
      const res = await fetch(`${API}/v1/calendar/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          start: event.start?.toISOString(),
          end: event.end?.toISOString()
        })
      })

      if (!res.ok) throw new Error('Failed to create event')

      await res.json()
      await fetchEvents()
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function deleteEvent(eventId: string) {
    const authStore = useAuthStore()
    const token = authStore.token || localStorage.getItem('token')

    try {
      const res = await fetch(`${API}/v1/calendar/delete/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Failed to delete event')

      await fetchEvents()
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
    fetchEvents,
    modifyEvent,
    createEvent,
    deleteEvent
  }
})
