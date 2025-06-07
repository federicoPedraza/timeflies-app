<script setup lang="ts">
import CalendarHour from '../components/calendar/CalendarHour.vue'
import CalendarCell from '../components/calendar/CalendarCell.vue'
import CalendarEvent from '../components/calendar/CalendarEvent.vue'

const startsWithSunday = true

const baseDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const days = startsWithSunday
  ? [...baseDays.slice(-1), ...baseDays.slice(0, -1)]
  : baseDays

const hours = Array.from({ length: 24 }, (_, i) => i)

const isWeekend = (day: string) => day === 'SAT' || day === 'SUN'
const isToday = (day: string) => day === 'MON'
</script>

<template>
  <div class="flex flex-col w-full py-4 px-4">
    <!-- HEADER -->
    <div class="flex flex-row w-full">
      <!-- LEFT HOUR SPACER -->
      <div class="min-w-10 min-h-16"></div>

      <!-- DAY HEADERS -->
      <div class="flex flex-grow w-full">
        <div class="flex flex-grow" v-for="(day, index) in days" :key="day">
          <CalendarCell class="w-full" :class="[
            'pt-1 pr-2 pb-4 pl-2 border-[#E0E0E0] border-[1px] border-t-0',
            isToday(day) ? 'bg-[#EFF6FF]' : isWeekend(day) ? 'bg-[#FAFAFA]' : 'bg-white',
            index === 0 ? 'border-l-0' : '',
            index === days.length - 1 ? 'border-r-0' : '',
          ]">
            <div class="flex flex-col">
              <span class="whitespace-nowrap font-bold text-[10px] text-[#71717A]">{{ day }}</span>
              <span class="whitespace-nowrap text-2xl text-[#000000] font-bold">21</span>
            </div>
          </CalendarCell>
        </div>
      </div>

      <!-- RIGHT HOUR SPACER -->
      <div class="min-w-10 min-h-16"></div>
    </div>

    <!-- BODY -->
    <div v-for="hour in hours" :key="hour" class="flex flex-row min-h-16 w-full">
      <!-- LEFT HOUR LABEL -->
      <CalendarHour class="min-w-10 pr-4 whitespace-nowrap" :hour="hour" containerClass="justify-end" />

      <!-- MAIN CALENDAR CELLS -->
      <div class="flex flex-grow w-full">
        <div class="flex flex-grow" v-for="(day, index) in days" :key="day + '-' + hour">
          <CalendarCell class="w-full h-full" :class="[
            'pt-1 pr-2 pb-4 pl-2 border-[#E0E0E0] border-[1px]',
            isToday(day) ? 'bg-[#EFF6FF]' : isWeekend(day) ? 'bg-[#FAFAFA]' : 'bg-white',
            index === 0 ? 'border-l-0' : '',
            index === days.length - 1 ? 'border-r-0' : '',
          ]" />
        </div>
      </div>

      <!-- RIGHT HOUR LABEL -->
      <CalendarHour class="min-w-10 pl-4 whitespace-nowrap" :hour="hour" containerClass="justify-start" />
    </div>
  </div>
</template>
