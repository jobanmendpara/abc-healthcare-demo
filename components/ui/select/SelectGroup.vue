<script setup lang="ts">
import { SelectGroup, type SelectGroupProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ SelectGroupProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <SelectGroup :class="cn('p-1 w-full', props.class)" v-bind="props">
    <slot />
  </SelectGroup>
</template>
