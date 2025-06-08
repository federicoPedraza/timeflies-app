<script setup lang="ts">
import type { TimeEvent } from '@/stores/events'
import { format } from 'date-fns';
import { computed } from 'vue';

const props = defineProps<{
    event: TimeEvent,
    variant: 'default' | 'edit'
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

const getEventTimeShort = (event: TimeEvent) => {
    return format(event.start, 'HH:mm')
}

const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => {
    emit('click', e)
}

const isShortEvent = computed(() => {
    return props.event.end.getHours() - props.event.start.getHours() < 2
})

</script>

<template>
    <div class="absolute border-l-[3px] border-[#0EA5E9] left-0 right-0 rounded-[4px] bg-[#0EA5E91A] p-1.5 overflow-hidden z-40 flex gap-2 hover:cursor-pointer hover:bg-[#0EA5E926] transition-all duration-100 hover:shadow-sm" @click="handleClick"
        :class="[{ 'flex-row': isShortEvent,
        'flex-col': !isShortEvent,
        'justify-start': !isShortEvent,
        'items-center': isShortEvent,
        'gap-2': isShortEvent,
        'gap-1': !isShortEvent }]"
        :style="getEventStyle(event)">
        <template v-if="isShortEvent">
            <span class="text-xs text-[#0369A1]">{{ getEventTimeShort(event) }}</span>
            <span class="text-xs font-semibold text-[#0369A1]">{{ event.title }}</span>
        </template>
        <template v-else>
            <span class="text-xs text-[#0369A1]">{{ getEventTime(event) }}</span>
            <span class="text-xs font-semibold text-[#0369A1]">{{ event.title }}</span>
        </template>
    </div>
</template>
