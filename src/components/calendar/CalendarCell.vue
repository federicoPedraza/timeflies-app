<script setup lang="ts">
const props = defineProps({
  width: Number,
  displayHourIndicator: Boolean,
  hourIndicator: Number
})
</script>

<template>
  <div class="min-h-16 relative" :style="{ width: `${props.width}px` }">
    <template v-if="props.displayHourIndicator">
      <div
        class="absolute left-[-4px] right-0 h-[8px] w-[8px] rounded-full bg-red-500 z-20"
        :style="{ top: `${(props.hourIndicator || 0) - 3}px` }"
      ></div>
      <div
        class="absolute left-0 right-0 h-[2px] bg-red-500 z-20"
        :style="{ top: `${props.hourIndicator}px` }"
      ></div>
    </template>
    <!-- CHILD CONTENT -->
    <slot />
  </div>
</template>
