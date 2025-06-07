<script setup lang="ts">
import CalendarHours from '../components/calendar/CalendarHours.vue'
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
  <!-- CALENDAR TABLE -->
  <div class="flex flex-row justify-between w-full p-4 gap-4">
    <!-- SIDE LEFT HOURS-->
    <div class="flex flex-col">
      <!-- DAY HEADER SPACER -->
      <div class="min-w-36 min-h-16 bg-red-500"></div>
      <!-- HOURS -->
      <CalendarHours hourClass="justify-end" />
    </div>

    <!-- CALENDAR -->
    <div class="">
      <!-- DAYS HEADER -->
      <div class="flex flex-row">
        <div class="flex flex-col" v-for="(day, index) in days" :key="day">
          <CalendarCell :class="[
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
          <!-- HOURS ON DAY -->
          <div class="flex flex-col">
            <CalendarCell :class="[
            'pt-1 pr-2 pb-4 pl-2 border-[#E0E0E0] border-[1px] border-t-0',
            isToday(day) ? 'bg-[#EFF6FF]' : isWeekend(day) ? 'bg-[#FAFAFA]' : 'bg-white',
            index === 0 ? 'border-l-0' : '',
            index === days.length - 1 ? 'border-r-0' : '',
          ]" v-for="hour in hours" :key="hour">
            <span>{{ hour }}</span>
</CalendarCell>
          </div>
        </div>
      </div>
    </div>
    <!-- SIDE RIGHT HOURS -->
    <div class="flex flex-col">
      <!-- DAY HEADER SPACER -->
      <div class="min-w-36 min-h-16 bg-red-500"></div>
      <!-- HOURS -->
      <CalendarHours />
    </div>
  </div>
</template>
