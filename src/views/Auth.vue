<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)

const signUpMode = ref(true)

// Add signup phase state
const signupPhase = ref(0) // 0: email/pass, 1: username, 2: welcome

// For fly animation
const flyPositions = ["0%", "50%", "100%"] // left positions for each phase

function nextPhase() {
  if (signupPhase.value < 2) signupPhase.value++
}
function prevPhase() {
  if (signupPhase.value > 0) signupPhase.value--
}

const handleSignUp = async () => {
    try {
        loading.value = true
        await auth.signUp(email.value, name.value, password.value)
        router.push('/')
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const handleLogin = async () => {
    try {
        loading.value = true
        await auth.login(email.value, password.value)
        router.push('/')
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const validatePassword = () => {
    return password.value === confirmPassword.value
}
</script>

<template>
    <div class="relative flex flex-col items-center justify-center w-full h-screen background-grid">
        <div
            class="bg-white shadow-lg border backdrop-blur-xl border-gray-200 w-1/4 min-h-1/2 rounded-3xl relative z-10">
            <div
                class="absolute left-1/2 -translate-x-1/2 -top-20 z-10 flex p-2 rounded-full border-2 border-gray-300 shadow-lg bg-white items-center justify-center">
                <img src="@/assets/logo.svg" alt="Logo" class="w-24 h-24" />
            </div>
            <div v-if="signUpMode" class="flex flex-col items-center justify-center pt-12 gap-4">
                <div class="flex flex-col items-center justify-center gap-2">
                    <h1 class="text-2xl  font-semibold">Welcome to Timeflies</h1>
                    <h2 class="text-sm text-gray-500">Create an account to get started</h2>
                </div>
                <form class="flex flex-col items-center justify-center gap-4 w-3/4">
                  <div v-if="signupPhase === 0" class="w-full flex flex-col items-center gap-2">
                    <div class="flex flex-col w-full">
                        <span class="text-sm text-gray-500">Email</span>
                        <input type="email" placeholder="" class="border rounded py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline" v-model="email" />
                    </div>
                    <div class="flex flex-col w-full">
                        <span class="text-sm text-gray-500">Password</span>
                        <input type="password" placeholder="" class="border rounded py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline" v-model="password" />
                    </div>
                    <div class="flex flex-col w-full">
                        <span class="text-sm text-gray-500">Confirm Password</span>
                        <input type="password" placeholder="" class="border rounded py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline" v-model="confirmPassword" />
                    </div>
                    <div class="flex flex-row items-center justify-center w-3/4 gap-4">
                        <button type="button" class="text-gray-500 hover:text-gray-700 text-sm underline pl-2 py-2 rounded-md" @click="nextPhase" :disabled="!validatePassword()">Back</button>
                        <button type="button" class="text-gray-500 hover:text-gray-700 text-sm underline pl-2 py-2 rounded-md" @click="nextPhase" :disabled="!validatePassword()">Next</button>
                    </div>
                  </div>
                  <div v-else-if="signupPhase === 1" class="w-full flex flex-col items-center gap-2">
                    <input type="text" placeholder="Username" class="border rounded px-3 py-2 w-3/4" />
                    <div class="flex gap-2 mt-2">
                      <button type="button" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md" @click="prevPhase">Back</button>
                      <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded-md" @click="nextPhase">Next</button>
                    </div>
                  </div>
                  <div v-else-if="signupPhase === 2" class="w-full flex flex-col items-center gap-2">
                    <div class="text-lg font-semibold">Welcome aboard! 🎉</div>
                    <button type="button" class="bg-blue-500 text-white px-4 py-2 rounded-md mt-2" @click="signUpMode = false">Continue</button>
                  </div>
                </form>
                <button class="text-white rounded-md py-4" @click="signUpMode = !signUpMode">
                    <span class="text-sm underline hover:text-gray-700 text-gray-500 transition-all duration-300">
                        I already have an account
                    </span>
                </button>
            </div>
            <div v-else class="flex flex-col items-center justify-center pt-16">
                <h1 class="text-2xl  font-semibold">Welcome back</h1>
                <button class="bg-blue-500 text-white px-4 py-2 rounded-md" @click="signUpMode = !signUpMode">
                    Create an account
                </button>
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
    transform: perspective(800px) rotateY(60deg);
    mask-image: linear-gradient(to left, transparent 0%, black 100%);
    -webkit-mask-image: linear-gradient(to left, transparent 0%, black 100%);
}

.background-grid::after {
    right: 0;
    transform: perspective(800px) rotateY(-60deg);
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
