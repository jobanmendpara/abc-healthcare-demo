<script setup lang="ts">
import { DialogRoot, type DialogRootEmits, type DialogRootProps, useForwardPropsEmits } from 'radix-vue';

interface Props extends /* @vue-ignore */ DialogRootProps { }
interface Emits extends /* @vue-ignore */ DialogRootEmits { }

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>
