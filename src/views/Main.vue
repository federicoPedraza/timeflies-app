<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Calendar from './Calendar.vue'
import { useEventStore } from '@/stores/events'
import { onMounted, onUnmounted } from 'vue'
const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents()
  intervalId = setInterval(() => {
    eventStore.fetchEvents()
  }, 60_000) // every 60 seconds
})

let intervalId: ReturnType<typeof setInterval>

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="main">
    <Sidebar />
    <Calendar />
  </div>
</template>

<style scoped lang="css">
.main {
    display: flex;
    flex-direction: row;
    height: 100vh;
    width: 100vw;
}

.main :deep(.sidebar) {
    width: 26%;
    height: 100%;
}

.main :deep(.calendar) {
    flex: 1;
    height: 100%;
}
</style>
