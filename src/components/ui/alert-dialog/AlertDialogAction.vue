<script setup lang="ts">
import { AlertDialogAction, type AlertDialogActionProps } from 'radix-vue'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/button'

interface Props extends /* @vue-ignore */ AlertDialogActionProps {
  variant?: 'default' | 'link' | 'destructive' | 'outline',
}
const props = defineProps<Props>()
</script>

<template>
  <AlertDialogAction v-bind="props"  :class="cn(buttonVariants({ variant: props.variant }), 'mt-2 sm:mt-0', $attrs.class ?? '')">
    <slot />
  </AlertDialogAction>
</template>
