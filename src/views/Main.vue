<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Calendar from './Calendar.vue'
import { useEventStore } from '@/stores/events'
import { onMounted } from 'vue'
const eventStore = useEventStore()

onMounted(() => {
  eventStore.fetchEvents()
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
