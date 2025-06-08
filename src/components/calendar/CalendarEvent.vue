<script setup lang="ts">
import type { TimeEvent } from '@/stores/events'
import { format } from 'date-fns';

const props = defineProps<{
    event: TimeEvent
}>()

const getEventStyle = (event: TimeEvent) => {
    return {
        top: `${event.start.getHours()}px`,
        height: `${event.end.getHours() - event.start.getHours()}px`,
    }
}

const getEventTime = (event: TimeEvent) => {
    return format(event.start, 'HH:mm a')
}
</script>

<template>
    <div class="absolute border-l-[3px] border-[#0EA5E9] left-0 right-0 rounded-[4px] bg-[#0EA5E91A] p-1.5 overflow-hidden z-40 flex flex-col gap-2"
        :style="getEventStyle(event)">
        <span class="text-xs text-[#0369A1]">{{ getEventTime(event) }}</span>
        <span class="text-xs font-semibold text-[#0369A1]">{{ event.title }}</span>
    </div>
</template>
