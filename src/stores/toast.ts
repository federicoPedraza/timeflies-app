import { defineStore } from 'pinia'
import { h, ref, type Component } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export class Toast {
  constructor(public id: string, public type: ToastType, public timeout: number, public component: Component) {}
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])

    function addToast(component: Component, type: ToastType = 'info', timeout: number = 10000) {
        const id = Math.random().toString(36).substring(7)
        const wrapped = h(component, { id }) // inject `id` into the component
        toasts.value.push(new Toast(id, type, timeout, wrapped))
      }


    function removeToast(id: string) {
        toasts.value = toasts.value.filter(toast => toast.id !== id)
    }

    return { toasts, addToast, removeToast }
})

export const useToast = () => {
    const toastStore = useToastStore()
    return toastStore
}
