<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCalendarStore } from '@/stores/calendar'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
  isSameDay
} from 'date-fns'

const calendarStore = useCalendarStore()

const dayNames = calendarStore.getDayNamesInOrder()

const monthStart = startOfMonth(calendarStore.visibleMonth)
const monthEnd = endOfMonth(calendarStore.visibleMonth)

const firstVisibleDate = startOfWeek(monthStart, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })
const lastVisibleDate = endOfWeek(monthEnd, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })

const fullGridDates = eachDayOfInterval({ start: firstVisibleDate, end: lastVisibleDate })

// split into rows of 7
const weeks = ref<Date[][]>([])
for (let i = 0; i < fullGridDates.length; i += 7) {
  weeks.value.push(fullGridDates.slice(i, i + 7))
}

const isToday = (date: Date) => isSameDay(date, calendarStore.today)

watch(() => calendarStore.visibleMonth, (newMonth) => {
  const monthStart = startOfMonth(newMonth)
  const monthEnd = endOfMonth(newMonth)

  const firstVisibleDate = startOfWeek(monthStart, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })
  const lastVisibleDate = endOfWeek(monthEnd, { weekStartsOn: calendarStore.startsWithSunday ? 0 : 1 })

  const fullGridDates = eachDayOfInterval({ start: firstVisibleDate, end: lastVisibleDate })

  // ✅ mutate the ref reactively
  weeks.value = []
  for (let i = 0; i < fullGridDates.length; i += 7) {
    weeks.value.push(fullGridDates.slice(i, i + 7))
  }
})

const handleDateClick = (date: Date) => {
  const isOutsideMonth = !isSameMonth(date, calendarStore.visibleMonth)
  if (isOutsideMonth) {
    calendarStore.visibleMonth = date
  }
  calendarStore.lastFocusedDate = date
}

</script>

<template>
  <table class="w-full">
    <!-- HEADER -->
    <thead class="flex w-full">
      <tr class="flex w-full">
        <th v-for="day in dayNames" :key="day" class="flex-1 text-[10px] font-semibold text-[#71717A] text-center p-2">
          {{ day }}
        </th>
      </tr>
    </thead>

    <!-- BODY -->
    <tbody class="flex flex-col w-full">
      <tr v-for="(week, wi) in weeks" :key="wi" class="flex w-full">
        <td v-for="date in week" :key="date.toDateString()"
          class="flex-1 text-center text-sm flex flex-col items-center justify-center"
          :class="isSameMonth(date, calendarStore.visibleMonth) ? 'text-white' : 'text-[#71717A]'">
          <button type="button" @click="handleDateClick(date)" class="flex flex-col items-center justify-center rounded-full w-8 h-8 transition-colors duration-150"
            :class="[
              isToday(date) ? 'bg-[#3B82F6]' : 'bg-transparent hover:bg-[#EFF6FF]',
              isToday(date) ? 'hover:bg-[#6aa3ff]' : 'hover:bg-[#EFF6FF]',
              isToday(date) ? 'hover:text-white' : 'hover:text-black',
              !isSameMonth(date, calendarStore.visibleMonth) && 'hover:bg-[#FAFAFA]',
              calendarStore.lastFocusedDate && isSameDay(date, calendarStore.lastFocusedDate) && 'border-2 border-dashed border-red-500'
            ]">
            <span class="font-semibold text-[11px]">
              {{ format(date, 'd') }}
            </span>
            <div v-if="false" class="w-1 h-1 rounded-full" :class="!isToday(date) ? 'bg-[#3B82F6]' : 'bg-white'"></div>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
