<script setup lang="ts">
import { AlertDialogCancel, type AlertDialogCancelProps } from 'radix-vue'
import { cn } from '@/lib/utils'
import { buttonVariants } from '~/components/ui/button/buttonVariants'

interface Props extends /* @vue-ignore */ AlertDialogCancelProps {
  variant?: 'default' | 'link' | 'destructive' | 'outline',
}

const props = defineProps<Props>()
</script>

<template>
  <AlertDialogCancel v-bind="props" :class="cn(buttonVariants({ variant: props.variant }), 'mt-2 sm:mt-0', $attrs.class ?? '')">
    <slot />
  </AlertDialogCancel>
</template>
