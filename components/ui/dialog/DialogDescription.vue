<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ DialogDescriptionProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <DialogDescription
    v-bind="props"
    :class="cn('text-muted-foreground text-sm', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
