<script setup lang="ts">
import {
  DropdownMenuRadioGroup,
  type DropdownMenuRadioGroupEmits,
  type DropdownMenuRadioGroupProps,
} from 'radix-vue'

interface Props extends /* @vue-ignore */ DropdownMenuRadioGroupProps {}
interface Emits extends DropdownMenuRadioGroupEmits {}

const props = defineProps<Props>()

const emits = defineEmits<Emits>()
</script>

<template>
  <DropdownMenuRadioGroup
    v-bind="props"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <slot />
  </DropdownMenuRadioGroup>
</template>
