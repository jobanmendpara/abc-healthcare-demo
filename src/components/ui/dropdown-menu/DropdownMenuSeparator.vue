<script setup lang="ts">
import {
  DropdownMenuSeparator,
  type DropdownMenuSeparatorProps,
} from 'radix-vue'

interface Props extends /* @vue-ignore */ DropdownMenuSeparatorProps {}

const props = defineProps<Props>()
</script>

<template>
  <DropdownMenuSeparator v-bind="props" class="-mx-1 my-1 h-px bg-muted" />
</template>
