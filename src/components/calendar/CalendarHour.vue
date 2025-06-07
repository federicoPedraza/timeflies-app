<script setup lang="ts">
defineProps<{
  containerClass?: string,
  hour: number,
  timeNotation: '12h' | '24h'
}>()
</script>

<template>
  <div class="flex justify-start items-start" :class="containerClass">
    <span v-if="hour !== 0" class="text-[12px] text-[#71717A] font-normal leading-none -mt-[12px]">
      {{ timeNotation === '12h' ? (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour) + (hour < 12 ? ' AM' : ' PM') : hour + ':00' }}
    </span>
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
