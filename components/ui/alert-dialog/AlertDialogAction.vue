<script setup lang="ts">
import { AlertDialogAction, type AlertDialogActionProps } from 'radix-vue'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/button'

interface Props extends /* @vue-ignore */ AlertDialogActionProps { }

const props = defineProps<Props>()
</script>

<template>
  <AlertDialogAction v-bind="props" :class="cn(buttonVariants(), $attrs.class ?? '')">
    <slot />
  </AlertDialogAction>
</template>
