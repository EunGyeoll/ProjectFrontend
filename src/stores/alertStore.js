import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alert', {
  state: () => ({
    message: '',
    visible: false,
  }),
  actions: {
    show(msg) {
      this.message = msg
      this.visible = true
      setTimeout(() => {
        this.visible = false
        this.message = ''
      }, 3000)
    },
  },
})
