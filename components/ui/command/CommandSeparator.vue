<script setup lang="ts">
import type { ComboboxSeparatorProps } from 'radix-vue'
import { ComboboxSeparator } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ ComboboxSeparatorProps { }

const props = defineProps<Props>()
</script>

<template>
  <ComboboxSeparator
    v-bind="props"
    :class="cn('-mx-1 h-px bg-border', $attrs.class ?? '')"
  >
    <slot />
  </ComboboxSeparator>
</template>
