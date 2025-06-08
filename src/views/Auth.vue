<template>
    <form @submit.prevent="handleLogin">
        <input v-model="identifier" placeholder="Email or username" />
        <input v-model="password" placeholder="Password" type="password" />
        <button type="submit" :disabled="loading">
            {{ loading ? 'Loading...' : 'Login' }}
        </button>
    </form>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const identifier = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)

const handleLogin = async () => {
    try {
        loading.value = true
        await auth.login(identifier.value, password.value)
        router.push('/calendar')
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
</script>
