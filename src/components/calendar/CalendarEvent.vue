<script setup lang="ts">
import type { TimeEvent } from '@/stores/events'
import { format } from 'date-fns';
import { computed } from 'vue';

const props = defineProps<{
    event: TimeEvent,
    variant: 'default' | 'edit',
    overlappingEventsCount: number
    eventIndex: number
}>()

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
    const durationMs = props.event.end.getTime() - props.event.start.getTime()
    return durationMs <= 30 * 60 * 1000 // 30 minutes is considered short
})

const isTooOverlapped = computed(() => {
    return props.overlappingEventsCount >= 3
})
</script>

<template>
    <div class="absolute border-l-[3px] rounded-[4px] p-1.5 overflow-hidden flex gap-0 hover:cursor-pointer transition-all duration-100 hover:shadow-xl z-20"
        @click="handleClick" :style="{
            width: `${100 / overlappingEventsCount}%`,
            left: `${(100 / overlappingEventsCount) * eventIndex}%`
        }"
        :class="{
            'flex-row items-center gap-2': isShortEvent,
            'flex-col justify-start items-start gap-0.5': !isShortEvent,
            'border-solid border-[#0EA5E9] bg-[#0EA5E91A]': variant === 'default',
            'border-dashed border-2 border-[#3bb1e8] bg-[#3bb1e826]': variant === 'edit'
        }">
        <template v-if="isShortEvent">
            <span v-if="!isTooOverlapped" class="text-xs text-[#0369A1]">{{ getEventTimeShort(event) }}</span>
            <span class="text-xs font-semibold text-ellipsis overflow-hidden whitespace-nowrap text-[#0369A1]">{{ event.title }}</span>
        </template>
        <template v-else>
            <span v-if="!isTooOverlapped" class="text-xs text-[#0369A1]">{{ getEventTime(event) }}</span>
            <span class="text-xs font-semibold text-[#0369A1]">{{ event.title }}</span>
        </template>
    </div>
</template>
