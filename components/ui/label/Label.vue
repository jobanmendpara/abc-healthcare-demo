<script setup lang="ts">
import { Label, type LabelProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ LabelProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <Label
    v-bind="props"
    :class="
      cn(
        'block text-sm tracking-tight font-medium text-foreground text-left',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
