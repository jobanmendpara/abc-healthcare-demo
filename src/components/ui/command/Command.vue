<script setup lang="ts">
import type { ComboboxRootEmits, ComboboxRootProps } from 'radix-vue';
import { ComboboxRoot, useForwardPropsEmits } from 'radix-vue';
import { cn } from '@/lib/utils';

interface Props extends /* @vue-ignore */ ComboboxRootProps { }
interface Emits extends ComboboxRootEmits { }

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <ComboboxRoot
    v-bind="forwarded"
    :open="true"
    model-value=""
    :class="cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', $attrs.class ?? '')"
  >
    <slot />
  </ComboboxRoot>
</template>
