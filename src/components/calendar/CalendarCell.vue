<script setup lang="ts">
const props = defineProps({
  width: Number
})
</script>

<template>
  <div class="min-h-16 relative" :style="{ width: `${props.width}px` }">
    <!-- CHILD CONTENT -->
    <slot />
  </div>
</template>
