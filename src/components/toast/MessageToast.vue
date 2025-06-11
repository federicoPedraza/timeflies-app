<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<template>
  <div class="p-4">
    <div class="text-sm text-gray-700">{{ message }}</div>
  </div>
</template>
