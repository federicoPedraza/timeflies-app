<script setup lang="ts">
const hours = Array.from({ length: 24 }, (_, i) => i)
defineProps<{
  containerClass?: string,
  hourClass?: string
}>()
</script>

<template>
    <div class="flex flex-col" :class="containerClass">
      <!-- HOURS -->
      <div class="flex flex-row min-h-16 min-w-36" v-for="hour in hours" :key="hour" :class="hourClass">
        <template v-if="hour !== 24">
            <span class="hour flex whitespace-nowrap" v-if="hour !== 0">
              {{ hour === 12 ? 12 : hour > 12 ? hour - 12 : hour }} {{ hour < 12 ? 'AM' : 'PM' }} </span>
        </template>
      </div>
    </div>
</template>

<style scoped lang="css">
  .hour {
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0%;
    color: #71717A;
  }
</style>
