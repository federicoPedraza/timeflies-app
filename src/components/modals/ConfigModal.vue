<script setup lang="ts">
import { ref } from 'vue';
import Modal from './Modal.vue';
import ConfigAccount from './ConfigViews/ConfigAccount.vue';
import ConfigAppearance from './ConfigViews/ConfigAppearance.vue';
import ConfigTime from './ConfigViews/ConfigTime.vue';
import ConfigPrivacy from './ConfigViews/ConfigPrivacy.vue';

const emit = defineEmits<{
    (e: 'close'): void
}>()

const activeTab = ref<'account' | 'appearance' | 'time' | 'privacy'>('account')

const handleTabClick = (tab: 'account' | 'appearance' | 'time' | 'privacy') => {
    activeTab.value = tab
}
</script>

<template>
    <Modal>
        <div class="flex flex-row justify-between items-start w-3/4 bg-white rounded-2xl h-2/3">
            <div class="flex flex-col justify-start w-1/4 shadow-lg items-start h-full gap-4 p-8">
                <h1 class="text-xl font-semibold">Settings</h1>
                <div class="flex flex-col justify-center w-full gap-4">
                    <button type="button" @click="handleTabClick('account')" class="flex justify-start items-center gap-2 bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl py-2 w-full px-4 border-2"
                    :class="{ 'border-2 border-[#0EA5E9]/50 bg-[#0EA5E9]/5': activeTab === 'account' }">
                        <img src="@/assets/icons/user-icon.svg" alt="account" class="w-4 h-4" />
                        <h1 class="text-sm font-semibold">Account</h1>
                    </button>
                    <button type="button" @click="handleTabClick('appearance')" class="flex justify-start items-center gap-2 bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl py-2 w-full px-4 border-2"
                    :class="{ 'border-2 border-[#0EA5E9]/50 bg-[#0EA5E9]/5': activeTab === 'appearance' }">
                        <img src="@/assets/icons/swatch-book.svg" alt="appearance" class="w-4 h-4" />
                        <h1 class="text-sm font-semibold">Appearance</h1>
                    </button>
                    <button type="button" @click="handleTabClick('time')" class="flex justify-start items-center gap-2 bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl py-2 w-full px-4 border-2"
                    :class="{ 'border-2 border-[#0EA5E9]/50 bg-[#0EA5E9]/5': activeTab === 'time' }">
                        <img src="@/assets/icons/clock-icon.svg" alt="time" class="w-4 h-4" />
                        <h1 class="text-sm font-semibold">Time</h1>
                    </button>
                    <button type="button" @click="handleTabClick('privacy')" class="flex justify-start items-center gap-2 bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl py-2 w-full px-4 border-2"
                    :class="{ 'border-2 border-[#0EA5E9]/50 bg-[#0EA5E9]/5': activeTab === 'privacy' }">
                        <img src="@/assets/icons/cookie.svg" alt="privacy" class="w-4 h-4" />
                        <h1 class="text-sm font-semibold">Privacy</h1>
                    </button>
                </div>
                <div class="flex flex-col h-full justify-end w-full">
                    <span class="text-xs text-gray-500 leading-loose">
                        v1.0.0
                    </span>
                    <span class="text-xs text-gray-500 leading-loose">
                        All rights reserved
                    </span>
                    <span class="text-xs text-gray-500 leading-loose">
                        © 2025 - Made by <a href="https://www.linkedin.com/in/federico-pedraza/" target="_blank" class="underline hover:text-[#0EA5E9] transition-all duration-300">Federico Pedraza</a>
                    </span>
                </div>
            </div>
            <div class="flex flex-row justify-start border-l-2 border-gray-200 shadow-lg  bg-gray-100 w-3/4 rounded-r-2xl p-2 items-start h-full">
                <div class="w-full flex justify-end items-start h-full p-4">
                    <div class="w-full h-full">
                        <ConfigAccount v-if="activeTab === 'account'" />
                        <ConfigAppearance v-if="activeTab === 'appearance'" />
                        <ConfigTime v-if="activeTab === 'time'" />
                        <ConfigPrivacy v-if="activeTab === 'privacy'" />
                    </div>
                    <button
                        class="flex justify-center items-center p-1 rounded-full  bg-gray-200 hover:bg-gray-200 hover:shadow-md"
                        @click="emit('close')">
                        <img src="@/assets/icons/sidebar/close-icon.svg" alt="close" class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </Modal>
</template>
