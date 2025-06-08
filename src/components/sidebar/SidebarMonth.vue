<script setup lang="ts">
import { format, subMonths, addMonths } from 'date-fns';
import { useCalendarStore } from '@/stores/calendar';

const calendarStore = useCalendarStore()

const props = defineProps<{
    month: Date
}>()

const handlePreviousMonth = () => {
    calendarStore.setVisibleMonth(subMonths(props.month, 1))
}

const handleNextMonth = () => {
    calendarStore.setVisibleMonth(addMonths(props.month, 1))
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-row justify-between items-center">
            <div class="flex flex-row gap-2">
                <h1 class="text-white text-3xl">{{ format(props.month, 'MMMM') }}</h1>
                <span class="text-[#EF4444] text-3xl">{{ format(props.month, 'yyyy') }}</span>
            </div>
            <div class="flex flex-row gap-2">
                <button @click="handlePreviousMonth" class="p-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#ffffff24] active:bg-[#ffffff32] active:scale-95">
                    <img src="@/assets/icons/sidebar/back-icon.svg" alt="previous month" />
                </button>
                <button @click="handleNextMonth" class="p-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#ffffff24] active:bg-[#ffffff32] active:scale-95">
                    <img src="@/assets/icons/sidebar/next-icon.svg" alt="next month" />
                </button>
            </div>
        </div>
    </div>
</template>
