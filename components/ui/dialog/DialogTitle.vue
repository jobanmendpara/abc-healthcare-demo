<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ DialogTitleProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <DialogTitle
    v-bind="props"
    :class="
      cn(
        'text-lg text-foreground font-semibold leading-none tracking-tight',
        props.class,
      )
    "
  >
    <slot />
  </DialogTitle>
</template>
