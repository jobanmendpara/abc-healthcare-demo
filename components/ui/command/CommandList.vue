<script setup lang="ts">
import type { ComboboxContentEmits, ComboboxContentProps } from 'radix-vue'
import { ComboboxContent, useForwardPropsEmits } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ ComboboxContentProps { }
interface Emits extends /* @vue-ignore */ ComboboxContentEmits { }

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ComboboxContent v-bind="forwarded" :class="cn('max-h-[300px] overflow-y-auto overflow-x-hidden', $attrs.class ?? '')">
    <div role="presentation">
      <slot />
    </div>
  </ComboboxContent>
</template>
