<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const name = ref(authStore.user?.name);
const newName = ref(authStore.user?.name);
const newNameHasError = ref(false);

const deleteWarning = ref(false);
const deletePasswordWarning = ref('');

const password = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const seePassword = ref(false);
const seeNewPassword = ref(false);
const seeConfirmPassword = ref(false);

onMounted(() => {
    newName.value = authStore.user?.name;
    newNameHasError.value = false;

    validateNewName();
});

const editModeName = ref(false);

const discardChanges = () => {
    newName.value = authStore.user?.name;
    editModeName.value = false;
}

const validateNewName = () => {
    newNameHasError.value = newName.value?.trim().length === 0;
}

const handleSaveName = () => {
    if (newNameHasError.value) return;

    editModeName.value = false;
    console.log('save name');
}

const validatePasswordStrength = () => {
    return newPassword.value.length >= 6;
}

const validateConfirmPassword = () => {
    return newPassword.value === confirmNewPassword.value;
}

const handleSavePassword = () => {
    if (!validatePasswordStrength() || !validateConfirmPassword()) return;

    authStore.changePassword(password.value, newPassword.value)
}
</script>

<template>
    <div class="flex flex-col justify-start h-full overflow-y-auto">
        <div class="flex flex-col">
            <h2 class="text-lg font-semibold">Account</h2>
            <span class="text-sm text-gray-500">
                Manage your account settings and preferences.
            </span>
            <div class="w-full h-[1px] my-4 bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-start gap-2">
            <h3 class="text-sm font-semibold">Personal Information</h3>
            <div class="flex flex-row justify-start items-center gap-4">
                <div class="flex flex-row justify-start items-center gap-2">
                    <img src="@/assets/icons/user-icon.svg" alt="user" class="w-4 h-4" />
                    <span class="text-sm underline underline-offset-4">Name:</span>
                </div>
                <div v-if="editModeName"
                    class="flex flex-row justify-start items-center gap-2 w-full border-l-2 focus-within:border-[#0EA5E9] pl-2"
                    :class="{ 'border-red-500': newNameHasError, 'border-green-500': !newNameHasError && newName?.trim() !== name?.trim() }">
                    <input type="text"
                        class="text-sm w-full bg-transparent shadow-xs focus:outline-none border-b border-gray-100 focus:border-gray-300"
                        v-model="newName" @input="validateNewName" />
                </div>
                <span v-else class="text-sm">{{ name }}</span>
                <div class="flex w-full flex-row justify-end items-center gap-2">
                    <button v-if="!editModeName" @click="editModeName = !editModeName"
                        class="bg-gray-200 hover:bg-gray-250 hover:shadow-md rounded-full p-2">
                        <img src="@/assets/icons/square-pen.svg" alt="edit" class="w-4 h-4" />
                    </button>
                    <div v-else class="flex flex-row justify-center items-center gap-4">
                        <button @click="handleSaveName"
                            class="bg-gray-200 hover:bg-gray-250 hover:shadow-md rounded-full p-2"
                            :class="{ 'opacity-50 cursor-not-allowed': newNameHasError || newName?.trim() === name?.trim() }">
                            <img src="@/assets/icons/save-icon.svg" alt="save" class="w-4 h-4" />
                        </button>
                        <button @click="discardChanges"
                            class="bg-gray-200 hover:bg-gray-250 hover:shadow-md rounded-full p-2">
                            <img src="@/assets/icons/circle-x.svg" alt="cancel" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div class="flex flex-row justify-start items-center gap-2">
                <div class="flex flex-row justify-start items-center gap-2">
                    <img src="@/assets/icons/mail-icon.svg" alt="mail" class="w-4 h-4" />
                    <span class="text-sm underline underline-offset-4">Email:</span>
                </div>
                <span class="text-sm">{{ authStore.user?.email }}</span>
            </div>
            <div class="w-full h-[1px] my-4 bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-start items-start w-full gap-4">
            <h3 class="text-sm font-semibold">Security</h3>
            <span class="text-sm text-gray-500">You must enter your password to change it.</span>
            <div class="flex flex-col justify-start items-start gap-2 w-full">
                <div class="flex flex-col w-full md:w-1/3">
                    <span class="text-sm text-gray-500">Current password</span>
                    <div class="flex flex-row items-center justify-start gap-2 w-full relative">
                        <input :type="seePassword ? 'text' : 'password'" placeholder=""
                            class="border rounded w-full py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline"
                            v-model="password" />
                        <button type="button"
                            class="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full p-2.5 border hover:bg-yellow-50"
                            @click="seePassword = !seePassword"
                            :class="seePassword ? 'bg-yellow-100' : (password.length === 0 ? 'bg-white' : (validatePasswordStrength() ? 'bg-green-100 hover:bg-gray-100' : 'bg-red-100 hover:bg-gray-100'))">
                            <img v-if="!seePassword" src="@/assets/icons/lightbulb-off.svg" alt="see password"
                                class="w-4 h-4" />
                            <img v-else src="@/assets/icons/lightbulb.svg" alt="hide password" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col w-full md:w-1/3">
                    <span class="text-sm text-gray-500">New password</span>
                    <div class="flex flex-row items-center justify-start gap-2 w-full relative">
                        <input :type="seeNewPassword ? 'text' : 'password'" placeholder=""
                            class="border rounded w-full py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline"
                            v-model="newPassword" />
                        <button type="button"
                            class="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full p-2.5 border hover:bg-yellow-50"
                            @click="seeNewPassword = !seeNewPassword"
                            :class="seeNewPassword ? 'bg-yellow-100' : (newPassword.length === 0 ? 'bg-white' : (validatePasswordStrength() ? 'bg-green-100 hover:bg-gray-100' : 'bg-red-100 hover:bg-gray-100'))">
                            <img v-if="!seeNewPassword" src="@/assets/icons/lightbulb-off.svg" alt="see password"
                                class="w-4 h-4" />
                            <img v-else src="@/assets/icons/lightbulb.svg" alt="hide password" class="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div class="flex flex-col w-full md:w-1/3">
                    <span class="text-sm text-gray-500">Confirm password</span>
                    <div class="flex flex-row items-center justify-start gap-2 w-full relative">
                        <input :type="seeConfirmPassword ? 'text' : 'password'" placeholder=""
                            class="border rounded w-full py-2 px-3 text-sm focus:outline-[#0EA5E9] focus:outline"
                            v-model="confirmNewPassword" />
                        <button type="button"
                            class="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full p-2.5 border hover:bg-yellow-50"
                            @click="seeConfirmPassword = !seeConfirmPassword"
                            :class="seeConfirmPassword ? 'bg-yellow-100' : (confirmNewPassword.length === 0 ? 'bg-white' : (validateConfirmPassword() ? 'bg-green-100 hover:bg-gray-100' : 'bg-red-100 hover:bg-gray-100'))">
                            <img v-if="!seeConfirmPassword" src="@/assets/icons/lightbulb-off.svg" alt="see password"
                                class="w-4 h-4" />
                            <img v-else src="@/assets/icons/lightbulb.svg" alt="hide password" class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div
                    class="bg-gray-100 border w-full md:w-1/3 rounded-md flex flex-col items-start justify-center text-sm px-4 py-4 md:py-2 gap-2 shadow-md">
                    <div class="flex items-center justify-center gap-2">
                        <img v-if="!validatePasswordStrength()" src="@/assets/icons/badge-minus.svg"
                            alt="password too weak" class="w-4 h-4" />
                        <img v-else src="@/assets/icons/badge-check.svg" alt="password strong" class="w-4 h-4" />
                        <span class="text-shadow-sm">
                            Password must be at least 6 characters
                        </span>
                    </div>

                    <!-- CONFIRM PASSWORD -->
                    <div class="flex items-center justify-center gap-2">
                        <img v-if="!validateConfirmPassword()" src="@/assets/icons/badge-minus.svg"
                            alt="passwords do not match" class="w-4 h-4" />
                        <img v-else src="@/assets/icons/badge-check.svg" alt="passwords match" class="w-4 h-4" />
                        <span class="text-shadow-sm">
                            Passwords must match
                        </span>
                    </div>
                </div>
                <button type="button" class="text-sm underline pl-2 py-2 rounded-md"
                            :class="!validatePasswordStrength() || !validateConfirmPassword() ? 'text-gray-300' : 'text-gray-700 hover:text-gray-900'"
                            @click="handleSavePassword" :disabled="!validatePasswordStrength() || !validateConfirmPassword()">Save new password</button>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <div class="w-full my-4 h-[1px] bg-gray-200"></div>
            <h3 class="text-sm font-semibold">Other</h3>
            <div class="flex flex-col">
                <span class="text-sm text-gray-500">
                    If you want to change your email, please <a href="https://www.linkedin.com/in/federico-pedraza/"
                        target="_blank" class="underline hover:text-[#0EA5E9] transition-all duration-300">contact
                        support</a>.
                </span>
                <span class="text-sm text-gray-500">If you want to delete your account, <span
                        class="underline hover:text-gray-700 cursor-pointer"
                        @click="deleteWarning = !deleteWarning">click here</span></span>
                <div v-if="deleteWarning" class="w-full h-[1px]  bg-gray-200 my-2"></div>
                <div v-if="deleteWarning" class="flex flex-col gap-8">
                    <div class="flex flex-col">
                        <h2 class="text-sm font-semibold mb-2">Delete account</h2>
                        <span class="text-sm text-gray-500 text-start">
                            Remember that this action is irreversible and you will be logged out immediately.
                        </span>
                        <span class="text-sm text-gray-500 text-start">
                            You need to enter your password to delete your account.
                        </span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row justify-center md:justify-start items-center gap-4 w-full">
                            <input type="password" placeholder="Enter your password"
                                class="text-sm bg-transparent w-full md:w-1/3 shadow-xs focus:outline-none border-b text-center border-gray-300 focus:border-gray-300"
                                v-model="deletePasswordWarning" />
                        </div>
                        <div class="flex flex-row justify-start items-center gap-4 w-full">
                            <button @click="authStore.deleteAccount(deletePasswordWarning)"
                                class="bg-red-400 hover:bg-red-600 shadow-md flex justify-center items-center gap-2 hover:shadow-lg rounded-md p-2 m-2 w-full md:w-1/3"
                                :class="{ 'opacity-50 cursor-not-allowed': deletePasswordWarning.length === 0 }">
                                <span class="text-sm text-white">I want to delete my account</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
