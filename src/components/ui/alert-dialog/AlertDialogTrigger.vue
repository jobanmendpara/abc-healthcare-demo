<script setup lang="ts">
import { AlertDialogTrigger, type AlertDialogTriggerProps } from 'radix-vue'

interface Props extends /* @vue-ignore */ AlertDialogTriggerProps { }

const props = defineProps<Props>()
</script>

<template>
  <AlertDialogTrigger v-bind="props">
    <slot />
  </AlertDialogTrigger>
</template>
