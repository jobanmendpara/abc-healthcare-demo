<script setup lang="ts">
import type { ComboboxEmptyProps } from 'radix-vue'
import { ComboboxEmpty } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ ComboboxEmptyProps { }

const props = defineProps<Props>()
</script>

<template>
  <ComboboxEmpty v-bind="props" :class="cn('py-6 text-center text-sm', $attrs.class ?? '')">
    <slot />
  </ComboboxEmpty>
</template>
