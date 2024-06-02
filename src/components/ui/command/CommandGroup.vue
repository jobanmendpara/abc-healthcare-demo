<script setup lang="ts">
import type { ComboboxGroupProps } from 'radix-vue'
import { ComboboxGroup, ComboboxLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ ComboboxGroupProps {
  heading?: string
}

const props = defineProps<Props>()
</script>

<template>
  <ComboboxGroup
    v-bind="props"
    :class="cn('overflow-hidden p-1 text-foreground', $attrs.class ?? '')"
  >
    <ComboboxLabel v-if="heading" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
      {{ heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
