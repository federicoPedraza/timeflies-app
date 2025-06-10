import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'

const API = import.meta.env.VITE_API_BASE_URL

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as null | { email: string, name: string, id: string },
        accessToken: null as null | string,
        refreshToken: null as null | string,
        loading: false,
    }),
    actions: {
    async login(identifier: string, password: string) {
        this.loading = true
        const res = await fetch(`${API}/v1/users/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, password }),
        })
        this.loading = false

        const response = await res.json()

        if (!res.ok) {
            if (response.message === 'Invalid credentials')
                throw new Error('Invalid email or password')
            throw new Error('An error occurred, please try again later')
        }

        this.accessToken = response.data.accessToken
        localStorage.setItem('accessToken', response.data.accessToken)
        this.refreshToken = response.data.refreshToken
        localStorage.setItem('refreshToken', response.data.refreshToken)

        const decoded = jwtDecode<{ id: string, email: string, name: string }>(this.accessToken as string);
        this.user = { id: decoded.id, email: decoded.email, name: decoded.name}
        this.persistToken()
    },
    async signUp(email: string, name: string, password: string) {
        this.loading = true
        const res = await fetch(`${API}/v1/users/sign-up`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name, password }),
        })
        this.loading = false
        if (!res.ok)
            throw new Error('Failed to sign up')

        const response = await res.json()
        this.accessToken = response.data.accessToken
        localStorage.setItem('accessToken', response.data.accessToken)
        this.refreshToken = response.data.refreshToken
        localStorage.setItem('refreshToken', response.data.refreshToken)

        const decoded = jwtDecode<{ id: string, email: string, name: string }>(this.accessToken as string);
        this.user = { id: decoded.id, email: decoded.email, name: decoded.name}
        this.persistToken()
    },
    async checkEmail(email: string) {
        const res = await fetch(`${API}/v1/users/check-email?email=${email}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const response = await res.json()

        return response.data.available
    },
    async logout() {
        this.user = null
        this.accessToken = null
        localStorage.removeItem('accessToken')
        this.refreshToken = null
        localStorage.removeItem('refreshToken')
        this.persistToken()
    },
    async deleteAccount() {
        if (!this.accessToken)
            throw new Error('No token found')

        const res = await fetch(`${API}/v1/users/me`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
        })
        if (!res.ok)
            throw new Error('Failed to delete account')
        this.logout()
        router.push('/auth?signup=true')
    },
    async refreshAccessToken() {
        if (!this.refreshToken)
            throw new Error('No refresh token found')

        const res = await fetch(`${API}/v1/users/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: this.refreshToken,
            }),
        })
        const response = await res.json()
        this.accessToken = response.data.accessToken
        localStorage.setItem('accessToken', response.data.accessToken)
        this.refreshToken = response.data.refreshToken
        localStorage.setItem('refreshToken', response.data.refreshToken)

        const decoded = jwtDecode<{ id: string, email: string, name: string }>(this.accessToken as string);
        this.user = { id: decoded.id, email: decoded.email, name: decoded.name}
        this.persistToken()

        return this.accessToken
    },
    persistToken() {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) return

        this.accessToken = accessToken
        this.refreshToken = localStorage.getItem('refreshToken')

        try {
            const decoded = jwtDecode<{ id: string, email: string, name: string }>(accessToken as string)
            this.user = {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
            }
        } catch {
            this.user = null
            this.accessToken = null
            localStorage.removeItem('accessToken')
            this.refreshToken = null
            localStorage.removeItem('refreshToken')
        }
    }
  },
})
