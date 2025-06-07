<script setup lang="ts">
import { ref, onMounted, nextTick, watchEffect } from 'vue'
import { startOfWeek, addDays, isSameDay } from 'date-fns'
import CalendarHour from '../components/calendar/CalendarHour.vue'
import CalendarCell from '../components/calendar/CalendarCell.vue'
import { formatDate } from '@/utils/dates/date-formatter'

const startsWithSunday = true

const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const getDayName = (date: Date) => dayNames[date.getDay()]

const today = new Date()
const weekStart = startOfWeek(today, { weekStartsOn: startsWithSunday ? 0 : 1 })
const visibleWeeks = 3; // this is for prev, curr, and next
const daysPerWeek = 7 * visibleWeeks;

const startDate = addDays(weekStart, -7); // this is for prev
const dateObjects = Array.from({ length: daysPerWeek }, (_, i) => addDays(startDate, i))

const hours = Array.from({ length: 24 }, (_, i) => i)

const isWeekend = (day: string) => day === 'SAT' || day === 'SUN'
const isToday = (date: Date) => isSameDay(date, today)

const calendarContainerRef = ref<HTMLElement | null>(null)
const bodyScrollContainer = ref<HTMLElement | null>(null)
const headerScrollContainer = ref<HTMLElement | null>(null)
const leftHourColumnRef = ref<HTMLElement | null>(null)
const rightHourColumnRef = ref<HTMLElement | null>(null)

const currentHourFraction = ref<number | null>(null)

const getCurrentHourIndicator = (hour: number) => {
  if (currentHourFraction.value === null) return 0
  return 72 * currentHourFraction.value
}

const updateCurrentHourFraction = () => {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  currentHourFraction.value = hour + (minute / 60)
}

const timeNotation = ref<'12h' | '24h'>('12h')

const dayWidth = ref(144)
const VISIBLE_DAYS = 7
const calendarWidth = ref(`${dayWidth.value * VISIBLE_DAYS}px`)

const scrollToCurrentWeek = () => {
  const el = bodyScrollContainer.value
  if (el) {
    const scrollLeft = dayWidth.value * 7 // skip 1 week (prev)
    el.scrollLeft = scrollLeft
    headerScrollContainer.value!.scrollLeft = scrollLeft
  }
}

const recalculateDayWidth = () => {
  if (calendarContainerRef.value) {
    const containerWidth = calendarContainerRef.value.clientWidth
    dayWidth.value = containerWidth / VISIBLE_DAYS
    calendarWidth.value = `${dayWidth.value * VISIBLE_DAYS}px`
  }
}

const startingVisibleHour = 8;

onMounted(() => {
  recalculateDayWidth()
  updateCurrentHourFraction()
  setInterval(updateCurrentHourFraction, 60000)
  window.addEventListener('resize', recalculateDayWidth)
  requestAnimationFrame(() => {
    scrollToCurrentWeek()
    const elB = bodyScrollContainer.value
    const elH = leftHourColumnRef.value
    const elR = rightHourColumnRef.value
    if (elB && elH && elR) {
      const hourHeight = elH.scrollHeight / 24
      elB.scrollTop = hourHeight * (startingVisibleHour - 1)
      elH.scrollTop = hourHeight * (startingVisibleHour - 1)
      elR.scrollTop = hourHeight * (startingVisibleHour - 1)
    }
  })
})

// HEADER -> BODY SCROLL
watchEffect(() => {
  if (headerScrollContainer.value && bodyScrollContainer.value) {
    bodyScrollContainer.value.addEventListener('scroll', () => {
      headerScrollContainer.value!.scrollLeft = bodyScrollContainer.value!.scrollLeft
    })
  }
})

// BODY -> LEFT HOUR COLUMN SCROLL
watchEffect(() => {
  if (bodyScrollContainer.value && leftHourColumnRef.value) {
    bodyScrollContainer.value.addEventListener('scroll', () => {
      leftHourColumnRef.value!.scrollTop = bodyScrollContainer.value!.scrollTop
    })
  }
})

// BODY -> RIGHT HOUR COLUMN SCROLL
watchEffect(() => {
  if (bodyScrollContainer.value && rightHourColumnRef.value) {
    bodyScrollContainer.value.addEventListener('scroll', () => {
      rightHourColumnRef.value!.scrollTop = bodyScrollContainer.value!.scrollTop
    })
  }
})

watchEffect(() => {
  recalculateDayWidth()
})
</script>

<template>
  <!-- GRID CONTAINER: LEFT HOUR | CALENDAR | RIGHT HOUR -->
  <div class="grid grid-cols-[auto_1fr_auto] h-screen w-full overflow-hidden p-4 gap-x-0">
    <!-- LEFT FIXED HOUR COLUMN -->
    <div class="relative w-12  z-10 overflow-hidden"
      style="mask-image: linear-gradient(to bottom, transparent 0px, black 64px); -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 64px);">
      <div ref="leftHourColumnRef" class="flex flex-col overflow-y-auto h-full scrollbar-none">
        <div class="h-[64px] shrink-0"></div>
        <div v-for="hour in hours" :key="'hour-left-' + hour" class="h-[72px] shrink-0">
          <CalendarHour :timeNotation="timeNotation" :hour="hour" containerClass="justify-end pr-2 whitespace-nowrap" />
        </div>
      </div>
    </div>

    <!-- CENTER CALENDAR COLUMN -->
    <div class="flex flex-col" ref="calendarContainerRef">
      <!-- HEADER SCROLL AREA -->
      <div ref="headerScrollContainer" class="overflow-x-auto scrollbar-none" :style="{ width: calendarWidth }">
        <div class="flex w-max">
          <div v-for="(date, index) in dateObjects" :key="'head-' + date.toDateString()"
            :style="{ width: `${dayWidth}px` }">
            <CalendarCell :width="dayWidth" :class="[
              'h-[64px] border-[#E0E0E0] border-b-[1px]',
              isToday(date) ? 'bg-[#EFF6FF]' : isWeekend(getDayName(date)) ? 'bg-[#FAFAFA]' : 'bg-white',
              index === 0 ? 'border-l-[0px]' : 'border-l-[1px]'
            ]">
              <div class="flex flex-col pt-1 pr-2 pb-4 pl-2">
                <span class="text-[10px] font-bold text-[#71717A]">{{ getDayName(date) }}</span>
                <span class="text-2xl text-black">{{ formatDate(date, 'dd') }}</span>
              </div>
            </CalendarCell>
          </div>
        </div>
      </div>

      <!-- BODY SCROLL AREA -->
      <div ref="bodyScrollContainer" class="overflow-x-auto overflow-y-auto"
        :style="{ height: 'calc(100vh - 72px)', width: calendarWidth }">
        <div class="w-max">
          <div v-for="hour in hours" :key="'row-' + hour" class="flex h-[72px]">
            <div v-for="(date) in dateObjects" :key="date.toDateString() + '-' + hour"
              :style="{ width: `${dayWidth}px` }">
              <CalendarCell :width="dayWidth" :displayHourIndicator="isToday(date) && currentHourFraction !== null && hour === 0" :hourIndicator="getCurrentHourIndicator(hour)" :style="{ width: `${dayWidth}px` }" :class="[
                'h-full border-[#E0E0E0] border-l-[1px] border-b-[1px]',
                isToday(date) ? 'bg-[#EFF6FF]' : isWeekend(getDayName(date)) ? 'bg-[#FAFAFA]' : 'bg-white'
              ]">
                <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-[#F7F7F7]"></div>
                <template v-if="isToday(date) && currentHourFraction !== null && hour === 0">
                  <!-- DOT -->
                  <div class="absolute left-[-4px] right-0 h-[8px] w-[8px] rounded-full  z-30"
                    :style="{ top: `${72 * currentHourFraction - 4}px` }"></div>
                  <div class="absolute left-0 right-0 h-[2px]  z-30" :style="{ top: `${72 * currentHourFraction}px` }">
                  </div>
                </template>
              </CalendarCell>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT FIXED HOUR COLUMN -->
    <div class="relative w-24  z-10 overflow-hidden"
      style="mask-image: linear-gradient(to bottom, transparent 0px, black 64px); -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 64px);">
      <div ref="rightHourColumnRef" class="flex flex-col overflow-y-auto h-full scrollbar-none">
        <div class="h-[64px] shrink-0"></div>
        <div v-for="hour in hours" :key="'hour-right-' + hour" class="h-[72px] shrink-0">
          <CalendarHour :timeNotation="timeNotation" :hour="hour"
            containerClass="justify-start pl-2 whitespace-nowrap" />
        </div>
      </div>
    </div>
  </div>
</template>
