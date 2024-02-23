<script setup lang="ts">
import {
  NavigationMenuLink,
  type NavigationMenuLinkEmits,
  type NavigationMenuLinkProps,
  useEmitAsProps,
} from 'radix-vue'

interface Props extends /* @vue-ignore */ NavigationMenuLinkProps {}
interface Emits extends /* @vue-ignore */ NavigationMenuLinkEmits {}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
</script>

<template>
  <NavigationMenuLink v-bind="{ ...props, ...useEmitAsProps(emits) }">
    <slot />
  </NavigationMenuLink>
</template>
