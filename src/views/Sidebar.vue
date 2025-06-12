<script setup lang="ts">
import SidebarHeaderButton from '@/components/sidebar/SidebarHeaderButton.vue';
import SidebarMonth from '@/components/sidebar/SidebarMonth.vue';
import SidebarCalendar from '@/components/sidebar/SidebarCalendar.vue';
import SidebarSummary from '@/components/sidebar/SidebarSummary.vue';
import ConfigModal from '@/components/modals/ConfigModal.vue';
import { useCalendarStore } from '@/stores/calendar';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import Calendar from './Calendar.vue';
import { useSettingsStore } from '@/stores/settings';

const router = useRouter()
const calendarStore = useCalendarStore()
const authStore = useAuthStore()
const configModal = ref(false)
const settingsStore = useSettingsStore()

const calendarRef = defineModel<InstanceType<typeof Calendar>>('calendarRef')

const handleScrollToHour = (hour: number, highlightEventId: string | null = null) => {
  calendarRef.value?.scrollToHour(hour, highlightEventId)
}

const handleSettingsClick = () => {
  configModal.value = true
}

const handleLogoutClick = async () => {
  await authStore.logout().then(() => {
    router.push('/auth?signup=false')
  })
}

const handleMoreClick = () => {
  const now = settingsStore.toMoment(new Date())
  const roundedMinute = Math.round(now.minute() / 5) * 5

  const snapped = now
    .minute(roundedMinute)
    .second(0)
    .millisecond(0)
    .toDate()

  calendarStore.createGhostEvent(snapped)
}

</script>

<template>
  <div class="flex flex-col gap-4 p-4 bg-[#18181B] w-[30%]">
    <div class="flex flex-row gap-2.5 w-full justify-center">
      <SidebarHeaderButton icon="more-icon" alt="open add event menu" @click="handleMoreClick" />
      <SidebarHeaderButton icon="settings-icon" alt="open settings menu" @click="handleSettingsClick" />
      <SidebarHeaderButton icon="logout-icon" alt="logout" @click="handleLogoutClick" />
    </div>
    <SidebarMonth :month="calendarStore.visibleMonth" />
    <SidebarCalendar />
    <SidebarSummary @scroll-to-hour="handleScrollToHour" />
    <ConfigModal v-if="configModal" @close="configModal = false" />
  </div>
</template>
