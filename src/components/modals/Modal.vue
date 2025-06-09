<script lang="ts" setup>

</script>


<template>
    <teleport to="body">
        <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center"
            role="dialog" aria-modal="true">
            <transition name="modal-fade">
                <slot />
            </transition>
        </div>
    </teleport>
</template>



<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
