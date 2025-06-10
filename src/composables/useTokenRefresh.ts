import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const REFRESH_INTERVAL = 1000 * 60 * 60 // 1 hour
const LAST_REFRESH_KEY = 'last_token_refresh'

export function useTokenRefresh() {
  const auth = useAuthStore()
  let refreshInterval: number | null = null

  const startTokenRefresh = () => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }

    const getNextRefreshDelay = () => {
      const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY)
      if (!lastRefresh) {
        // If no last refresh time, start immediately
        localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString())
        return 0
      }

      const lastRefreshTime = parseInt(lastRefresh)
      const now = Date.now()
      const timeSinceLastRefresh = now - lastRefreshTime
      const remainingTime = Math.max(0, REFRESH_INTERVAL - timeSinceLastRefresh)

      return remainingTime
    }

    const scheduleNextRefresh = () => {
      const delay = getNextRefreshDelay()

      // Clear any existing timeout
      if (refreshInterval) {
        clearTimeout(refreshInterval)
      }

      // Schedule the next refresh
      refreshInterval = window.setTimeout(async () => {
        try {
          if (auth.accessToken) {
            await auth.refreshAccessToken()
            localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString())
          }
        } catch (error) {
          console.error('Failed to refresh token:', error)
          if (refreshInterval) {
            clearTimeout(refreshInterval)
            refreshInterval = null
          }
          return
        }
        // Schedule the next refresh
        scheduleNextRefresh()
      }, delay)
    }

    // Start the refresh cycle
    scheduleNextRefresh()
  }

  const stopTokenRefresh = () => {
    if (refreshInterval) {
      clearTimeout(refreshInterval)
      refreshInterval = null
    }
    localStorage.removeItem(LAST_REFRESH_KEY)
  }

  onMounted(() => {
    if (auth.accessToken) {
      startTokenRefresh()
    }
  })

  onUnmounted(() => {
    stopTokenRefresh()
  })

  return {
    startTokenRefresh,
    stopTokenRefresh
  }
}
