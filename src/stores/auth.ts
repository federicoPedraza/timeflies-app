import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

const API = import.meta.env.VITE_API_BASE_URL

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as null | { email: string, name: string, id: string },
        token: null as null | string,
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

        const token = response.data.token
        this.token = token
        localStorage.setItem('token', token)

        const decoded = jwtDecode<{ id: string, email: string, name: string }>(token);
        this.user = { id: decoded.id, email: decoded.email, name: decoded.name}
        console.log(this.user)
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
        const token = response.data.token
        this.token = token
        localStorage.setItem('token', token)

        const decoded = jwtDecode<{ id: string, email: string, name: string }>(token);
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
        this.token = null
        localStorage.removeItem('token')
        this.persistToken()
    },
    persistToken() {
        const token = localStorage.getItem('token')
        if (!token) return

        this.token = token
    }
  },
})
