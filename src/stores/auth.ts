import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import router from '@/router'
import { useToast } from './toast'
import { h } from 'vue'
import MessageToast from '@/components/toast/MessageToast.vue'

const API = import.meta.env.VITE_API_BASE_URL

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as null | { email: string, name: string, id: string },
        accessToken: null as null | string,
        refreshToken: null as null | string,
        loading: false,
    }),
    actions: {
    async login(email: string, password: string) {
        const toastStore = useToast()
        this.loading = true

        try {
            const res = await fetch(`${API}/v1/users/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const response = await res.json()

            if (!res.ok) {
                if (response.statusCode === 401)
                    throw new Error('Email or password is incorrect')
                throw new Error(response.message)
            }

            this.accessToken = response.data.accessToken
            localStorage.setItem('accessToken', response.data.accessToken)
            this.refreshToken = response.data.refreshToken
            localStorage.setItem('refreshToken', response.data.refreshToken)

            const decoded = jwtDecode<{ id: string, email: string, name: string }>(this.accessToken as string);
            this.user = { id: decoded.id, email: decoded.email, name: decoded.name}
            this.persistToken()
        } catch (err: any) {
            if (err.message !== 'Email or password is incorrect')
                toastStore.addToast(
                    h(MessageToast, {
                        message: 'An error occurred, please try again later.',
                    }),
                    'error',
                )

            throw err
        } finally {
            this.loading = false
        }
    },
    async signUp(email: string, name: string, password: string) {
        const toastStore = useToast()
        this.loading = true

        try {
            const res = await fetch(`${API}/v1/users/sign-up`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name, password }),
            }).catch((err) => {
                throw err
            })
            this.loading = false

            if (!res.ok)
                toastStore.addToast(
                    h(MessageToast, {
                        message: 'Failed to sign up. Please try again later.',
                    }),
                    'error',
                )

            const response = await res.json()
            this.accessToken = response.data.accessToken
            localStorage.setItem('accessToken', response.data.accessToken)
            this.refreshToken = response.data.refreshToken
            localStorage.setItem('refreshToken', response.data.refreshToken)

            const decoded = jwtDecode<{ id: string, email: string, name: string }>(this.accessToken as string);
            this.user = { id: decoded.id, email: decoded.email, name: decoded.name}
            this.persistToken()
        } catch (err) {
            this.loading = false
            console.error(err)
            toastStore.addToast(
                h(MessageToast, {
                    message: 'Failed to sign up. Please try again later.',
                }),
                'error',
            )
        }
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

        const toastStore = useToast()
        toastStore.addToast(
            h(MessageToast, {
                message: 'Logged out successfully.',
            }),
            'info',
        )

        this.persistToken()
    },
    async deleteAccount(password: string) {
        if (!this.accessToken)
            throw new Error('No token found')

        const res = await fetch(`${API}/v1/users/me`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({
                password,
            }),
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
    async changePassword(oldPassword: string, newPassword: string) {
        if (!this.accessToken)
            throw new Error('No token found')

        const res = await fetch(`${API}/v1/users/change-password`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({
                oldPassword,
                newPassword,
            }),
        })
        if (!res.ok)
            throw new Error('Failed to change password')
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
