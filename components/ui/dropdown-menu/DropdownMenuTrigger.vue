<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from 'radix-vue'

interface Props extends /* @vue-ignore */ DropdownMenuTriggerProps {}

const props = defineProps<Props>()
</script>

<template>
  <DropdownMenuTrigger class="outline-none" v-bind="props">
    <slot />
  </DropdownMenuTrigger>
</template>
