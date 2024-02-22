<script setup lang="ts">
import {
  AlertDialogDescription,
  type AlertDialogDescriptionProps,
} from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ AlertDialogDescriptionProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <AlertDialogDescription
    :class="cn('text-muted-foreground text-sm', props.class)"
    :as-child="props.asChild"
  >
    <slot />
  </AlertDialogDescription>
</template>
