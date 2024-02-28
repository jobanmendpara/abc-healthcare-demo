<script setup lang="ts">
import { PopoverRoot, useForwardPropsEmits } from 'radix-vue'
import type { PopoverRootEmits, PopoverRootProps } from 'radix-vue'

interface Props extends /* @vue-ignore */ PopoverRootProps {}
interface Emits extends /* @vue-ignore */ PopoverRootEmits {}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <PopoverRoot v-bind="forwarded">
    <slot />
  </PopoverRoot>
</template>
