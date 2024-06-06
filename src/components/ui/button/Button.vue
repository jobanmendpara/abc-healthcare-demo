<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { Primitive, type PrimitiveProps } from 'radix-vue'
import { buttonVariants } from './buttonVariants';
import { cn } from '@/lib/utils'

interface ButtonVariantProps extends VariantProps<typeof buttonVariants> {}

interface Props extends /* @vue-ignore */ PrimitiveProps {
  asChild?: boolean
  variant?: ButtonVariantProps['variant']
  size?: ButtonVariantProps['size']
  as?: string
}

withDefaults(defineProps<Props>(), {
  asChild: false,
  variant: 'default',
  size: 'default',
  as: 'button',
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), $attrs.class ?? '')"
  >
    <slot />
  </Primitive>
</template>
