import { defineStore } from 'pinia'
import { h, ref } from 'vue'
import { useAuthStore } from './auth.ts'
import { useCalendarStore } from './calendar.ts'
import { getStartOfMonth } from '@/utils/dates/date-formatter.ts'
import { getEndOfMonth } from '@/utils/dates/date-formatter.ts'
import { startOfWeek, endOfWeek } from 'date-fns'
import { useToast } from './toast.ts'
import MessageToast from '@/components/toast/MessageToast.vue'
import { useSettingsStore } from './settings.ts'

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
  const toastStore = useToast()

  async function fetchEvents(start?: Date, end?: Date) {
    const calendarStore = useCalendarStore()
    const settingsStore = useSettingsStore()
    if (!start || !end) {
      const monthStart = getStartOfMonth(calendarStore.visibleMonth, settingsStore.timezone)
      const monthEnd = getEndOfMonth(calendarStore.visibleMonth, settingsStore.timezone)

      start = startOfWeek(monthStart, { weekStartsOn: settingsStore.startsWithSunday ? 0 : 1 })
      end = endOfWeek(monthEnd, { weekStartsOn: settingsStore.startsWithSunday ? 0 : 1 })
    }

    loading.value = true
    error.value = null

    const authStore = useAuthStore()
    const token = authStore.accessToken || localStorage.getItem('accessToken')

    if (!token) {
      toastStore.addToast(
        h(MessageToast, {
          message: 'There was an error fetching events. Please try logging in again.',
        }),
        'error',
      )
      loading.value = false
      authStore.logout()
      return
    }

    try {
      const res = await fetch(`${API}/v1/calendar/events?start=${start.toISOString()}&end=${end.toISOString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        toastStore.addToast(
          h(MessageToast, {
            message: 'There was an error fetching events.',
          }),
          'error',
        )
        loading.value = false
        return
      }

      const json = await res.json()
      events.value = json.data.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }))
    } catch (err: any) {
      toastStore.addToast(
        h(MessageToast, {
          message: 'There was an error fetching events.',
        }),
        'error',
      )
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function modifyEvent(event: Partial<TimeEvent>) {
    const authStore = useAuthStore()
    const token = authStore.accessToken || localStorage.getItem('accessToken')

    if (!event.id) {
      toastStore.addToast(
        h(MessageToast, {
          message: 'There was an error modifying this event.',
        }),
        'error',
      )
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

      if (!res.ok) {
        toastStore.addToast(
          h(MessageToast, {
            message: 'There was an error modifying this event. Please try again.',
          }),
          'error',
        )
        return
      }

      await res.json()
    } catch (err: any) {
      console.log(err)
      toastStore.addToast(
        h(MessageToast, {
          message: 'There was an error modifying this event. Please try again.',
        }),
        'error',
      )
      error.value = err.message
    } finally {
      toastStore.addToast(
        h(MessageToast, {
          message: 'Event modified successfully.',
        }),
        'success',
      )
      loading.value = false
    }
  }

  async function createEvent(event: Partial<TimeEvent>) {
    const authStore = useAuthStore()
    const token = authStore.accessToken || localStorage.getItem('accessToken')

    if (!event.title) {
      toastStore.addToast(
        h(MessageToast, {
          message: 'You need to give this event a title before creating it.',
        }),
        'error',
      )
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

      if (!res.ok) {
        toastStore.addToast(
          h(MessageToast, {
            message: 'There was an error creating this event. Please try again.',
          }),
          'error',
        )
        return
      }

      await res.json()
      await fetchEvents()
    } catch (err: any) {
      toastStore.addToast(
        h(MessageToast, {
          message: 'There was an error creating this event. Please try again.',
        }),
        'error',
      )
      error.value = err.message
    } finally {
      toastStore.addToast(
        h(MessageToast, {
          message: 'Event created successfully.',
        }),
        'success',
      )
      loading.value = false
    }
  }

  async function deleteEvent(eventId: string) {
    const authStore = useAuthStore()
    const token = authStore.accessToken || localStorage.getItem('accessToken')

    try {
      const res = await fetch(`${API}/v1/calendar/delete/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        toastStore.addToast(
          h(MessageToast, {
            message: 'There was an error deleting this event. Please try again.',
          }),
          'error',
        )
        return
      }

      await fetchEvents()
    } catch (err: any) {
      toastStore.addToast(
        h(MessageToast, {
          message: 'There was an error deleting this event. Please try again.',
        }),
        'error',
      )
      error.value = err.message
    } finally {
      toastStore.addToast(
        h(MessageToast, {
          message: 'Event deleted successfully.',
        }),
        'success',
      )
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
