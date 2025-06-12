<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import moment from 'moment-timezone';
import { useAuthStore } from '@/stores/auth';
import { useCalendarStore } from '@/stores/calendar';

const settingsStore = useSettingsStore();
const calendarStore = useCalendarStore();

const timezone = ref(settingsStore.timezone);
const isOpen = ref(false);
const timezoneSearchInput = ref('');
const searchInputRef = ref<HTMLInputElement | null>(null);
const dropdownRef = ref<HTMLDivElement | null>(null);

const timezones = moment.tz.names();

const formatTimezoneDisplay = (tz: string) => {
    return tz.split('/').pop()?.replace(/_/g, ' ') || tz;
}

const filteredTimezones = computed(() => {
    const searchTerm = timezoneSearchInput.value.toLowerCase().replace(/\s+/g, '_');
    return timezones.filter(tz =>
        tz.toLowerCase().includes(searchTerm) ||
        tz.toLowerCase().replace(/_/g, ' ').includes(timezoneSearchInput.value.toLowerCase())
    );
});

const handleTimezoneChange = async (value: string) => {
    timezone.value = value;
    settingsStore.settimezone(value);
    isOpen.value = false;
    timezoneSearchInput.value = '';

    await useAuthStore().updateSettings({
        timeNotation: settingsStore.timeNotation,
        weekStartsOnSunday: settingsStore.startsWithSunday,
        focusHourOnStart: settingsStore.focusHourOnStart,
        timezone: value,
    })
}

const handleWeekStartChange = async (value: boolean) => {
    settingsStore.setWeekStartsOnSunday(value);

    await useAuthStore().updateSettings({
        timeNotation: settingsStore.timeNotation,
        weekStartsOnSunday: value,
        focusHourOnStart: settingsStore.focusHourOnStart,
        timezone: settingsStore.timezone,
    })
}

const handleReset = async () => {
    const guessedTimezone = moment.tz.guess();
    timezone.value = guessedTimezone;
    settingsStore.settimezone(guessedTimezone);
    isOpen.value = false;
    timezoneSearchInput.value = '';

    await useAuthStore().updateSettings({
        timeNotation: settingsStore.timeNotation ,
        weekStartsOnSunday: settingsStore.startsWithSunday,
        focusHourOnStart: settingsStore.focusHourOnStart,
        timezone: guessedTimezone,
    })
}

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value;
    if (!isOpen.value) {
        timezoneSearchInput.value = '';
    } else {
        await nextTick();
        searchInputRef.value?.focus();
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isOpen.value = false;
        timezoneSearchInput.value = '';
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
})
</script>

<template>
    <div class="flex flex-col justify-start h-full overflow-y-auto">
        <div class="flex flex-col">
            <h2 class="text-lg font-semibold">Time</h2>
            <span class="text-sm text-gray-500">
                Manage your time settings and preferences.
            </span>
            <div class="w-full h-[1px] my-4 bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-start gap-2">
            <h3 class="text-sm font-semibold">Timezone</h3>
            <span class="text-sm text-gray-500">Select your timezone.</span>
            <div class="relative" ref="dropdownRef">
                <button
                    @click="toggleDropdown"
                    class="w-full md:w-1/4 p-2 bg-white rounded-md border border-gray-300 text-left flex justify-between items-center"
                >
                    <span class="text-sm">{{ formatTimezoneDisplay(timezone) }}</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div v-if="isOpen" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <input
                        ref="searchInputRef"
                        type="text"
                        v-model="timezoneSearchInput"
                        class="w-full p-2 border-b border-gray-300 focus:outline-none text-sm"
                        placeholder="Search timezone..."
                        @click.stop
                    />
                    <div class="max-h-48 overflow-y-auto">
                        <div
                            v-for="tz in filteredTimezones"
                            :key="tz"
                            @click="handleTimezoneChange(tz)"
                            class="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            :class="{ 'bg-gray-100': tz === timezone }"
                        >
                            {{ formatTimezoneDisplay(tz) }}
                        </div>
                    </div>
                </div>
            </div>
            <button @click="handleReset" class="text-sm text-left w-full md:w-1/3  text-gray-500 hover:text-gray-900 hover:underline">Reset to local timezone</button>
            <div class="w-full h-[1px] my-4 bg-gray-200"></div>
        </div>
        <div class="flex flex-col justify-start gap-2">
            <h3 class="text-sm font-semibold">Preferences</h3>
            <span class="text-sm text-gray-500">Select your time notation and week start.</span>
            <div class="flex flex-col justify-start items-start my-2">
                <div class="flex flex-col md:flex-row justify-between items-center w-full gap-4">
                    <label class="flex flex-row justify-start items-center gap-2 w-full">
                        <input type="checkbox" v-model="settingsStore.startsWithSunday" @change="(e) => handleWeekStartChange((e.target as HTMLInputElement).checked)" />
                        <div class="flex flex-row justify-between items-center w-full">
                            <span class="text-sm text-gray-500">Week starts on Sunday</span>
                            <div class="flex-row justify-start items-center gap-1 text-xs hidden md:flex">
                                <template v-for="(day, index) in calendarStore.getDayNamesInOrder()" :key="day">
                                    <span :class="index === 0 || index === calendarStore.getDayNamesInOrder().length - 1 ? 'text-gray-600' : 'text-gray-400'">{{ day }}</span>
                                    <span v-if="index < calendarStore.getDayNamesInOrder().length - 1" class="text-gray-400"> | </span>
                                </template>
                            </div>
                        </div>
                    </label>
                    <div class="flex flex-row md:hidden justify-start items-start w-full gap-1 text-xs">
                        <template v-for="(day, index) in calendarStore.getDayNamesInOrder()" :key="day">
                            <span :class="index === 0 || index === calendarStore.getDayNamesInOrder().length - 1 ? 'text-gray-600' : 'text-gray-400'">{{ day }}</span>
                            <span v-if="index < calendarStore.getDayNamesInOrder().length - 1" class="text-gray-400"> | </span>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
