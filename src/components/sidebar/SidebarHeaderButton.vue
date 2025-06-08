<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    icon: string
    alt: string
    onClick: () => void
}>()

const iconPath = computed(() => new URL(`../../assets/icons/sidebar/${props.icon}.svg`, import.meta.url).href)
</script>

<template>
    <button
        class="flex items-center justify-center w-10 h-8 bg-[#ffffff16] rounded-lg shadow-md
               transition-all duration-200 ease-in-out
               hover:bg-[#ffffff24] active:bg-[#ffffff32] active:scale-95"
        @click="onClick">
        <div class="flex items-center justify-center w-6 h-6">
            <img :src="iconPath" :alt="alt" class="w-4 h-4" />
        </div>
    </button>
</template>
