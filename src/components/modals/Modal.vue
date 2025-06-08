<template>
  <div class="fixed inset-0 w-screen h-screen backdrop-blur-md bg-black/40 flex items-center justify-center z-[1000]" @click.self="close">
    <div class="bg-white p-6 rounded-lg min-w-[300px]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ close: () => void }>()
</script>
