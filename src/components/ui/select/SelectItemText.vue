<script setup lang="ts">
import { SelectItemText, type SelectItemTextProps } from 'radix-vue'

interface Props extends /* @vue-ignore */ SelectItemTextProps {}

const props = defineProps<Props>()
</script>

<template>
  <SelectItemText v-bind="props">
    <slot />
  </SelectItemText>
</template>
