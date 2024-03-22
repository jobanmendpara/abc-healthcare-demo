<script setup lang="ts">
import { DropdownMenuRoot, type DropdownMenuRootEmits, type DropdownMenuRootProps, useForwardPropsEmits } from 'radix-vue'

interface Props extends /* @vue-ignore */ DropdownMenuRootProps {}
interface Emits extends DropdownMenuRootEmits {}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuRoot v-bind="forwarded">
    <slot />
  </DropdownMenuRoot>
</template>
