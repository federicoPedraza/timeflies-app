<script setup lang="ts">
import SidebarHeaderButton from '@/components/sidebar/SidebarHeaderButton.vue';
import SidebarMonth from '@/components/sidebar/SidebarMonth.vue';

const handleMoreClick = () => {
  console.log('more clicked')
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
    <SidebarMonth />
  </div>
</template>
