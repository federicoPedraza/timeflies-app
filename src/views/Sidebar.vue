<script setup lang="ts">
import SidebarHeaderButton from '@/components/sidebar/SidebarHeaderButton.vue';
import SidebarMonth from '@/components/sidebar/SidebarMonth.vue';
import SidebarCalendar from '@/components/sidebar/SidebarCalendar.vue';
import { useCalendarStore } from '@/stores/calendar';
import Modal from '@/components/modals/Modal.vue';
import { ref } from 'vue';
import AddEventModal from '@/components/modals/AddEventModal.vue';

const calendarStore = useCalendarStore()
const showModal = ref(false)

const handleMoreClick = () => {
  showModal.value = true
}

const handleSettingsClick = () => {
  console.log('settings clicked')
}

const handleLogoutClick = () => {
  console.log('logout clicked')
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
  </div>

  <Modal v-if="showModal" :close="() => showModal = false">
    <AddEventModal :close="() => showModal = false" />
  </Modal>
</template>
