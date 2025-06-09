<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const seePassword = ref(false)
const seeConfirmPassword = ref(false)

const emailIsUsed = ref(false)
const isLoadingEmailValidation = ref(false)

const proposedUsername = ref('')
const likedHisUsername = ref(true)

const termsOfServiceAndPrivacyPolicy = ref(false)

const errors = ref({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
})

const name = ref('')

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)

const signUpMode = ref(true)

// Add signup phase state
const signupPhase = ref(0) // 0: email/pass, 1: username, 2: welcome

async function nextPhase() {
    if (signupPhase.value < 2) {
        if (signupPhase.value === 0 && likedHisUsername.value) {
            proposedUsername.value = proposeUsername()
        }
        signupPhase.value++
    }
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

const validateEmail = () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email.value)) {
        errors.value.email = 'Invalid email format'
        isLoadingEmailValidation.value = true
        return false
    }
    isLoadingEmailValidation.value = false
    errors.value.email = ''
    return true
}

const validatePasswordStrength = () => {
    if (password.value.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
        return false
    }
    errors.value.password = ''
    return true
}

const validateConfirmPassword = () => {
    if (password.value !== confirmPassword.value || !validatePasswordStrength()) {
        errors.value.confirmPassword = 'Passwords do not match'
        return false
    }
    errors.value.confirmPassword = ''
    return true
}

const validateName = () => {
    if (name.value.trim().length > 15) {
        errors.value.name = 'Username must be less than 15 characters'
        return false
    }
    errors.value.name = ''
    return true
}

const runEmailValidation = async () => {
    if (!validateEmail()) return

    isLoadingEmailValidation.value = true
    const isAvailable = await auth.checkEmail(email.value)
    emailIsUsed.value = !isAvailable
    isLoadingEmailValidation.value = false
}

const proposeUsername = () => {
    const prefix = email.value.split('@')[0]
    const parts = prefix.split(/[\.\-_]/).filter(Boolean)

    if (parts.length === 2 && parts[0].length <= 3 && /^[a-z]{1,3}$/.test(parts[0])) {
        return parts[0].toUpperCase()
    }

    const cleaned = parts
        .filter(p => !/^\d+$/.test(p))
        .map(p =>
            p.length <= 3 && /^[a-z]{1,3}$/.test(p)
                ? p.toUpperCase()
                : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        )

    const preferred = cleaned.find(p => p.length > 1) || 'User'

    name.value = preferred
    return preferred
}

const isPhaseValid = () => {
    if (signupPhase.value === 0) {
        return validateEmail() && validatePasswordStrength() && validateConfirmPassword()
    }
    if (signupPhase.value === 1) {
        return validateName()
    }
    if (signupPhase.value === 2) {
        return termsOfServiceAndPrivacyPolicy.value
    }
}

const nextPhaseButtonLabel = () => {
    if (signupPhase.value === 2) {
        return 'Start flying'
    }
    if (signupPhase.value === 1 && likedHisUsername.value) {
        return 'Yes'
    }
    return 'Next'
}

watch([email, password, confirmPassword, name], () => {
    if (signupPhase.value === 0) {
        validateEmail()
        validatePasswordStrength()
        validateConfirmPassword()
    }
    if (signupPhase.value === 1) {
        validateName()
    }
})

onMounted(() => {
    if (auth.token) {
        router.push('/')
    }
})
</script>

<template>
    <template v-if="loading">
        <div class="flex flex-col items-center justify-center w-full h-screen background-grid">
            <div class="flex flex-col items-center justify-center gap-2">
                <img src="@/assets/logo.svg" alt="Logo" class="w-24 h-24" />
                <span class="text-sm text-gray-500">Loading...</span>
            </div>
        </div>
    </template>
    <template v-else>
        <div class="relative flex flex-col items-center justify-center w-full h-screen background-grid">
            <div
                class="bg-white shadow-lg border backdrop-blur-xl border-gray-200 w-1/4 min-h-1/2 rounded-3xl relative z-10">
                <div
                    class="absolute left-1/2 -translate-x-1/2 -top-20 z-10 flex p-2 rounded-full border-2 border-gray-300 shadow-lg bg-white items-center justify-center">
                    <img src="@/assets/logo.svg" alt="Logo" class="w-24 h-24" />
                </div>
                <div v-if="signUpMode" class="flex flex-col items-center justify-center pt-12 gap-4">
                    <form class="flex flex-col items-center justify-center gap-4 w-3/4">
                        <div v-if="signupPhase === 0" class="w-full flex flex-col items-center gap-6">
                            <div class="flex flex-col items-center justify-center gap-2">
                                <h1 class="text-2xl  font-semibold">Welcome to Timeflies</h1>
                                <h2 class="text-sm text-gray-500">Create an account to get started</h2>
                            </div>
                            <div class="flex flex-col w-full gap-2">
                                <div class="flex flex-col w-full relative">
                                    <span class="text-sm text-gray-500">Email</span>
                                    <div class="flex flex-row items-center justify-start gap-2 w-full relative">
                                        <input type="email" placeholder=""
                                            class="border rounded w-full py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline"
                                            v-model="email" @blur="runEmailValidation" @input="validateEmail" />
                                        <!-- VALIDATION BUTTON -->
                                        <button type="button"
                                            class="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full p-2.5 border disabled:opacity-50"
                                            :disabled="isLoadingEmailValidation" @click="runEmailValidation"
                                            :class="!isLoadingEmailValidation ? (emailIsUsed ? 'bg-red-100 hover:bg-red-200' : 'bg-green-100 hover:bg-gray-100') : 'bg-white hover:bg-gray-100'">
                                            <img v-if="emailIsUsed && !isLoadingEmailValidation"
                                                src="@/assets/icons/circle-x.svg" alt="email is used" class="w-4 h-4" />
                                            <img v-if="!emailIsUsed && !isLoadingEmailValidation && validateEmail()"
                                                src="@/assets/icons/check.svg" alt="email is not used"
                                                class="w-4 h-4" />
                                            <img v-if="isLoadingEmailValidation || !validateEmail()"
                                                src="@/assets/icons/loader.svg" alt="loading" class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div class="flex flex-col w-full">
                                    <span class="text-sm text-gray-500">Password</span>
                                    <div class="flex flex-row items-center justify-start gap-2 w-full relative">
                                        <input :type="seePassword ? 'text' : 'password'" placeholder=""
                                            class="border rounded w-full py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline"
                                            v-model="password" />
                                        <button type="button"
                                            class="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full p-2.5 border hover:bg-yellow-50"
                                            @click="seePassword = !seePassword"
                                            :class="seePassword ? 'bg-yellow-100' : (password.length === 0 ? 'bg-white' : (validatePasswordStrength() ? 'bg-green-100 hover:bg-gray-100' : 'bg-red-100 hover:bg-gray-100'))">
                                            <img v-if="!seePassword" src="@/assets/icons/lightbulb-off.svg"
                                                alt="see password" class="w-4 h-4" />
                                            <img v-else src="@/assets/icons/lightbulb.svg" alt="hide password"
                                                class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div class="flex flex-col w-full">
                                    <span class="text-sm text-gray-500">Confirm Password</span>
                                    <div class="flex flex-row items-center justify-start gap-2 w-full relative">
                                        <input :type="seeConfirmPassword ? 'text' : 'password'" placeholder=""
                                            class="border rounded w-full py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline"
                                            v-model="confirmPassword" />
                                        <button type="button"
                                            class="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full p-2.5 border hover:bg-yellow-50"
                                            @click="seeConfirmPassword = !seeConfirmPassword"
                                            :class="seeConfirmPassword ? 'bg-yellow-100' : (confirmPassword.length === 0 ? 'bg-white' : (validateConfirmPassword() ? 'bg-green-100 hover:bg-gray-100' : 'bg-red-100 hover:bg-gray-100'))">
                                            <img v-if="!seeConfirmPassword" src="@/assets/icons/lightbulb-off.svg"
                                                alt="see password" class="w-4 h-4" />
                                            <img v-else src="@/assets/icons/lightbulb.svg" alt="hide password"
                                                class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <!-- VALIDATION PANEL: EMAIL + PASSWORD + CONFIRM PASSWORD -->
                            <div
                                class="bg-gray-100 border w-full rounded-md flex flex-col items-start justify-center text-sm px-4 py-2 gap-2 shadow-md">
                                <!-- EMAIL -->
                                <div class="flex items-center justify-center gap-2">
                                    <img v-if="!validateEmail()" src="@/assets/icons/badge-minus.svg"
                                        alt="email is not valid" class="w-4 h-4" />
                                    <img v-else src="@/assets/icons/badge-check.svg" alt="email is valid"
                                        class="w-4 h-4" />
                                    <span class="text-shadow-sm">
                                        Email must be valid
                                    </span>
                                </div>
                                <div class="flex items-center justify-center gap-2">
                                    <img v-if="!validateEmail()" src="@/assets/icons/badge-minus.svg"
                                        alt="email is not used" class="w-4 h-4" />
                                    <img v-else-if="emailIsUsed && !isLoadingEmailValidation"
                                        src="@/assets/icons/badge-alert.svg" alt="email is used" class="w-4 h-4" />
                                    <img v-else src="@/assets/icons/badge-check.svg" alt="email is used"
                                        class="w-4 h-4" />
                                    <span class="text-shadow-sm">
                                        Email is not already taken
                                    </span>
                                </div>

                                <!-- PASSWORD STRENGTH -->
                                <div class="flex items-center justify-center gap-2">
                                    <img v-if="!validatePasswordStrength()" src="@/assets/icons/badge-minus.svg"
                                        alt="password too weak" class="w-4 h-4" />
                                    <img v-else src="@/assets/icons/badge-check.svg" alt="password strong"
                                        class="w-4 h-4" />
                                    <span class="text-shadow-sm">
                                        Password must be at least 6 characters
                                    </span>
                                </div>

                                <!-- CONFIRM PASSWORD -->
                                <div class="flex items-center justify-center gap-2">
                                    <img v-if="!validateConfirmPassword()" src="@/assets/icons/badge-minus.svg"
                                        alt="passwords do not match" class="w-4 h-4" />
                                    <img v-else src="@/assets/icons/badge-check.svg" alt="passwords match"
                                        class="w-4 h-4" />
                                    <span class="text-shadow-sm">
                                        Passwords must match
                                    </span>
                                </div>
                            </div>

                        </div>
                        <div v-else-if="signupPhase === 1" class="w-full flex flex-col items-center gap-2">
                            <div class="w-full">
                                <div v-if="likedHisUsername" class="flex flex-col items-center justify-center gap-4">
                                    <span class="text-sm">Is it okay if we call you...</span>
                                    <span class="text-2xl font-bold">{{ proposedUsername }}</span>
                                </div>
                                <div v-else class="flex flex-col items-center justify-center gap-2">
                                    <span class="text-sm">Please enter your username</span>
                                    <input v-if="!likedHisUsername" type="text" placeholder="Username"
                                        class="border-b-2 border-gray-300 px-3 py-2 w-full text-center focus:outline-none"
                                        v-model="name" />
                                </div>
                            </div>
                        </div>
                        <div v-else-if="signupPhase === 2" class="w-full flex flex-col items-center gap-2">
                            <div class="text-lg font-semibold">Welcome aboard {{ name }}!</div>
                            <div class="flex flex-row items-center justify-center gap-2">
                                <input type="checkbox" class="w-4 h-4" v-model="termsOfServiceAndPrivacyPolicy" />
                                <span class="text-sm whitespace-nowrap text-center">I agree to the <a
                                        href="https://en.wikipedia.org/wiki/Fly" class="text-blue-500">Terms of
                                        Service</a> and <a href="https://en.wikipedia.org/wiki/Fly"
                                        class="text-blue-500">Privacy Policy</a></span>
                            </div>
                        </div>
                    </form>
                    <div class="flex flex-row items-center justify-center w-3/4 gap-4 mb-4">
                        <button type="button" v-if="signupPhase !== 1 || !likedHisUsername"
                            class="text-sm underline pl-2 py-2 rounded-md" :disabled="signupPhase === 0"
                            :class="signupPhase === 0 ? 'text-gray-300' : 'text-gray-700 hover:text-gray-900'"
                            @click="prevPhase">Back</button>
                        <button type="button" v-if="signupPhase === 1 && likedHisUsername"
                            class="text-sm underline pl-2 py-2 rounded-md"
                            :class="!isPhaseValid() ? 'text-gray-300' : 'text-gray-700 hover:text-gray-900'"
                            @click="likedHisUsername = !likedHisUsername">No</button>
                        <button type="button" v-if="signupPhase !== 2" class="text-sm underline pl-2 py-2 rounded-md"
                            :class="!isPhaseValid() ? 'text-gray-300' : 'text-gray-700 hover:text-gray-900'"
                            @click="nextPhase" :disabled="!isPhaseValid()">{{ nextPhaseButtonLabel() }}</button>
                        <button type="button" v-if="signupPhase === 2" class="text-sm underline pl-2 py-2 rounded-md"
                            :class="!isPhaseValid() ? 'text-gray-300' : 'text-gray-700 hover:text-gray-900'"
                            @click="handleSignUp" :disabled="!isPhaseValid()">{{ nextPhaseButtonLabel() }}</button>
                    </div>
                    <button v-if="signUpMode && signupPhase === 0" class="text-white rounded-md pb-4"
                        @click="signUpMode = !signUpMode">
                        <span class="text-sm underline"
                            :class="emailIsUsed ? 'text-gray-950 font-bold hover:text-gray-600' : 'text-gray-500 hover:text-gray-700'">
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
</template>

<style scoped>
.background-grid {
    position: relative;
    overflow: hidden;
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
