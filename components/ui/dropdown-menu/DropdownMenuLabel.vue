<script setup lang="ts">
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ DropdownMenuLabelProps {
  inset?: boolean
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <DropdownMenuLabel
    v-bind="props"
    :class="
      cn('px-2 py-1.5 text-sm font-semibold',
         inset && 'pl-8', props.class)"
  >
    <slot />
  </DropdownMenuLabel>
</template>
