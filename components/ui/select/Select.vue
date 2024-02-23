<script setup lang="ts">
import type { SelectRootEmits, SelectRootProps } from 'radix-vue'
import { SelectRoot, useForwardPropsEmits } from 'radix-vue'

interface Props extends /* @vue-ignore */ SelectRootProps {}
interface Emits extends /* @vue-ignore */ SelectRootEmits {}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <SelectRoot v-bind="forwarded">
    <slot />
  </SelectRoot>
</template>
