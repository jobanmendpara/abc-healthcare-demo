<script setup lang="ts">
import { AlertDialogTitle, type AlertDialogTitleProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ AlertDialogTitleProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <AlertDialogTitle
    :as-child="props.asChild"
    :class="cn('text-lg text-foreground font-semibold', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
