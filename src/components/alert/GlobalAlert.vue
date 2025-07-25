<template>
  <div v-if="visible" class="alert alert-warning position-fixed top-0 start-50 translate-middle-x mt-3" style="z-index: 9999;">
    {{ message }}
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAlertStore } from '@/stores/alertStore'

const alertStore = useAlertStore()
const { message, visible } = storeToRefs(alertStore)
</script>