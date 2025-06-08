<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
        router.push('/')
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="relative flex flex-col items-center justify-center w-full h-screen background-grid">
        <div
            class="bg-white shadow-lg border backdrop-blur-xl border-gray-200 w-1/4 h-1/2 rounded-3xl relative z-10">
            <div
                class="absolute left-1/2 -translate-x-1/2 -top-20 z-10 flex p-2 rounded-full border-2 border-gray-300 shadow-lg bg-white items-center justify-center">
                <img src="@/assets/logo.svg" alt="Logo" class="w-24 h-24" />
            </div>
            <div class="flex flex-col items-center justify-center pt-12">
                
            </div>
        </div>
    </div>
</template>

<style scoped>
.background-grid {
    position: relative;
    overflow: hidden;
}

.auth-orange-light {
    width: 420px;
    height: 420px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle at 50% 50%, #fff3e2 0%, #ffc079 60%, transparent 100%);
    animation: orange-pulse 6s ease-in-out infinite;
}

@keyframes orange-pulse {
    0%, 100% {
        opacity: 0.2;
        filter: blur(120px) brightness(1);
        transform: translate(-50%, -50%) scale(0.2);
    }
    50% {
        opacity: 0.7;
        filter: blur(120px) brightness(1);
        transform: translate(-50%, -50%) scale(0.4);
    }
}

.background-grid::before,
.background-grid::after {
    content: '';
    position: absolute;
    top: -50vh;
    bottom: -50vh;
    height: 200vh;
    width: 50vw;
    background-image:
        linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    background-size: 144px 72px;
    z-index: 0;
    transform-origin: center;
}

.background-grid::before {
    left: 0;
    transform: perspective(800px) rotateY(45deg);
    mask-image: linear-gradient(to left, transparent 0%, black 100%);
    -webkit-mask-image: linear-gradient(to left, transparent 0%, black 100%);
}

.background-grid::after {
    right: 0;
    transform: perspective(800px) rotateY(-45deg);
    mask-image: linear-gradient(to right, transparent 0%, black 100%);
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 100%);
}

.background-grid::before {
    animation: moveLeft 3s linear infinite;
}

.background-grid::after {
    animation: moveRight 3s linear infinite;
}

@keyframes moveLeft {
    from {
        background-position: 0 0;
    }

    to {
        background-position: -144px 0px;
    }
}

@keyframes moveRight {
    from {
        background-position: 0 0;
    }

    to {
        background-position: 144px 0px;
    }
}
</style>
