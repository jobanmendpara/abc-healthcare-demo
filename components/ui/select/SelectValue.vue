<script setup lang="ts">
import { SelectValue, type SelectValueProps } from 'radix-vue'

interface Props extends /* @vue-ignore */ SelectValueProps {}

const props = defineProps<Props>()
</script>

<template>
  <SelectValue v-bind="props">
    <slot />
  </SelectValue>
</template>
