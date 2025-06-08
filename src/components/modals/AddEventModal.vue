<template>
    <Modal :close="close">
        <div class="flex flex-col gap-8">
            <div class="flex flex-col gap-4">
                <div class="flex flex-row gap-8 ">
                    <input type="text" class="w-full p-2 text-xl border-b border-[#0EA5E9]" placeholder="Add Title" />
                    <button @click="close">
                        <img src="@/assets/icons/sidebar/close-icon.svg" alt="close" class="w-6 h-6" />
                    </button>
                </div>
                <div class="border border-[#959494] rounded-lg p-4 flex flex-col gap-4">
                    <div class="flex flex-row gap-2 justify-start items-center">
                        <img src="@/assets/icons/clock-icon.svg" alt="clock" class="w-4 h-4" />
                        <span class="text-sm text-[#3e3e3e]">Date and Time</span>
                    </div>
                    <div class="flex flex-col gap-2 justify-start items-start">
                        <!-- START -->
                        <div class="flex flex-row justify-start items-center">
                            <div class="flex flex-row gap-2 justify-start items-center">
                                <span class="text-sm font-semibold text-[#3e3e3e]">Starts</span>
                                <input type="date" class="text-sm text-[#3e3e3e] border-[#959494]"
                                    :value="form.startDate" @change="handleStartDateChange" />
                            </div>
                            <div class="flex flex-row gap-2 justify-start items-center">
                                <span class="text-sm font-semibold text-[#3e3e3e]">at</span>
                                <input type="time" class="text-sm text-[#3e3e3e] border-[#959494]"
                                    :value="form.startHour" @change="handleStartHourChange" />
                            </div>
                        </div>
                        <!-- SEPARATOR -->
                        <div class="w-full h-[1px] my-2 bg-[#e7e7e7]"></div>
                        <!-- END -->
                        <div class="flex flex-row gap-2 justify-start items-center">
                            <div class="flex flex-row gap-2 justify-start items-center">
                                <span class="text-sm font-semibold text-[#3e3e3e]">Until</span>
                                <input type="date" class="text-sm text-[#3e3e3e] border-[#959494]" :value="form.endDate"
                                    @change="handleEndDateChange" />
                            </div>
                            <div class="flex flex-row gap-2 justify-start items-center">
                                <span class="text-sm font-semibold text-[#3e3e3e]">at</span>
                                <input type="time" class="text-sm text-[#3e3e3e] border-[#959494]" :value="form.endHour"
                                    @change="handleEndHourChange" />
                            </div>
                        </div>
                        <!-- SEPARATOR -->
                        <div class="w-full h-[1px] my-2 bg-[#e7e7e7]"></div>
                        <!-- DURATION-->
                        <div class="flex flex-row gap-2 justify-start items-center">
                            <span class="text-sm font-semibold text-[#3e3e3e]">Duration</span>
                            <span class="text-sm text-[#3e3e3e]">{{ duration }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/modals/Modal.vue';
import { ref, onMounted, computed } from 'vue';

const form = ref({
    title: '',
    description: '',
    startHour: '',
    endHour: '',
    startMinute: '',
    endMinute: '',
    startDate: '',
    endDate: '',
})

const formatDate = (d: Date) => d.toISOString().split('T')[0]
const formatTime = (d: Date) => d.toTimeString().slice(0, 5)

onMounted(() => {
    const now = new Date()
    const plus1h = new Date(now.getTime() + 60 * 60 * 1000)

    form.value.startDate = formatDate(now)
    form.value.endDate = formatDate(plus1h)

    form.value.startHour = formatTime(now)
    form.value.endHour = formatTime(plus1h)
})

const duration = computed(() => {
  if (!form.value.startDate || !form.value.endDate || !form.value.startHour || !form.value.endHour)
    return '0h 0m'

  const start = new Date(`${form.value.startDate}T${form.value.startHour}`)
  const end = new Date(`${form.value.endDate}T${form.value.endHour}`)

  const diffMs = end.getTime() - start.getTime()
  const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${minutes}m`
})



const handleStartDateChange = (event: Event) => {
    form.value.startDate = (event.target as HTMLInputElement).value
}

const handleEndDateChange = (event: Event) => {
    form.value.endDate = (event.target as HTMLInputElement).value
}

const handleStartHourChange = (event: Event) => {
    form.value.startHour = (event.target as HTMLInputElement).value
}

const handleEndHourChange = (event: Event) => {
    form.value.endHour = (event.target as HTMLInputElement).value
}

defineProps<{ close: () => void }>()
</script>

<style scoped lang="css">
input[type="date"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    border: none;
    outline: none;

    background: transparent;
    padding: 0;
    font-family: inherit;
    width: 100%;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
}

input[type="time"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    border: none;
    outline: none;

    background: transparent;
    padding: 0;
    font-family: inherit;
    width: 100%;
}

input[type="time"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
}
</style>
