<script setup lang="ts">
import {
  NavigationMenuTrigger,
  type NavigationMenuTriggerProps,
} from 'radix-vue'
import { ChevronDown } from 'lucide-vue-next'
import { navigationMenuTriggerStyle } from './navigationMenuTriggerStyle'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ NavigationMenuTriggerProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <NavigationMenuTrigger
    :class="cn(navigationMenuTriggerStyle(), 'group', props.class)"
    v-bind="props"
  >
    <slot />
    <ChevronDown
      class="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuTrigger>
</template>
