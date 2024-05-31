<script setup lang="ts">
import { TabsRoot, useForwardPropsEmits } from 'radix-vue'
import type { TabsRootEmits, TabsRootProps } from 'radix-vue'

interface Props extends /* @vue-ignore */ TabsRootProps {
  class?: string
}

interface Emits extends TabsRootEmits {}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <TabsRoot v-bind="forwarded">
    <slot />
  </TabsRoot>
</template>
