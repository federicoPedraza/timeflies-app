<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { startOfWeek, addDays, isSameDay } from 'date-fns'
import CalendarHour from '../components/calendar/CalendarHour.vue'
import CalendarCell from '../components/calendar/CalendarCell.vue'
import { formatDate } from '@/utils/dates/date-formatter'

const startsWithSunday = true

const baseDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const days = startsWithSunday
  ? [...baseDays.slice(-1), ...baseDays.slice(0, -1)]
  : baseDays

const today = new Date()
const weekStart = startOfWeek(today, { weekStartsOn: startsWithSunday ? 0 : 1 })

const dateObjects = days.map((_, index) => addDays(weekStart, index))

const hours = Array.from({ length: 24 }, (_, i) => i)

const isWeekend = (day: string) => day === 'SAT' || day === 'SUN'
const isToday = (date: Date) => isSameDay(date, today)

const bodyScrollContainer = ref<HTMLElement | null>(null)

const timeNotation = ref<'12h' | '24h'>('12h')

onMounted(async () => {
  await nextTick()
  const el = bodyScrollContainer.value
  if (el) {
    const hourHeight = el.scrollHeight / 24
    el.scrollTop = hourHeight * 7
  }
})
</script>

<template>
  <div class="flex flex-col w-full py-4 px-4">
    <!-- HEADER -->
    <div class="flex flex-row w-full">
      <!-- LEFT HOUR SPACER -->
      <div class="min-w-12 min-h-16"></div>

      <!-- DAY HEADERS -->
      <div class="flex flex-grow w-full">
        <div class="flex flex-grow" v-for="(day, index) in days" :key="day">
          <CalendarCell class="w-full" :class="[
            'pt-1 pr-2 pb-4 pl-2 border-[#E0E0E0]',
            isToday(dateObjects[index]) ? 'bg-[#EFF6FF]' : isWeekend(day) ? 'bg-[#FAFAFA]' : 'bg-white',
            index === 0 ? 'border-l-[0px]' : 'border-l-[1px]',
          ]">
            <div class="flex flex-col">
              <span class="whitespace-nowrap font-bold text-[10px] text-[#71717A]">{{ day }}</span>
              <span class="whitespace-nowrap text-2xl text-[#000000] font-bold">
                {{ formatDate(dateObjects[index], 'dd') }}
              </span>
            </div>
          </CalendarCell>
        </div>
      </div>

      <!-- RIGHT HOUR SPACER -->
      <div class="min-w-12 min-h-16"></div>
    </div>

    <!-- BODY -->
    <div ref="bodyScrollContainer" class="overflow-y-auto h-screen">
      <div v-for="hour in hours" :key="hour" class="flex flex-row min-h-16 w-full">
        <!-- LEFT HOUR LABEL -->
        <CalendarHour :timeNotation="timeNotation" class="min-w-12 pr-2 whitespace-nowrap" :hour="hour" containerClass="justify-end" />

        <!-- MAIN CALENDAR CELLS -->
        <div class="flex flex-grow w-full">
          <div class="flex flex-grow" v-for="(day, index) in days" :key="day + '-' + hour">
            <CalendarCell class="w-full h-full" :class="[
              'pt-1 pr-2 pb-4 pl-2 border-[#E0E0E0] border-[1px] border-b-0 border-r-0',
              isToday(dateObjects[index]) ? 'bg-[#EFF6FF]' : isWeekend(day) ? 'bg-[#FAFAFA]' : 'bg-white',
              index === 0 ? 'border-l-0' : '',
            ]" />
          </div>
        </div>

        <!-- RIGHT HOUR LABEL -->
        <CalendarHour :timeNotation="timeNotation" class="min-w-12 pl-2 whitespace-nowrap" :hour="hour" containerClass="justify-start" />
      </div>
    </div>
  </div>
</template>
