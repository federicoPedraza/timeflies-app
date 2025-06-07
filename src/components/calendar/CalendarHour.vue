<script setup lang="ts">
defineProps<{
  containerClass?: string,
  hour: number
}>()
</script>

<template>
    <div class="w-4 flex items-start justify-start text-xs text-gray-500" :class="containerClass">
      <span class="hour" v-if="hour !== 0">{{ hour === 0 ? 12 : hour > 12 ? hour - 12 : hour }} {{ hour < 12 ? 'AM' : 'PM' }}</span>
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
