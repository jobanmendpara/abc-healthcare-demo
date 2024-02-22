<script setup lang="ts">
import { SelectSeparator, type SelectSeparatorProps } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Props extends /* @vue-ignore */ SelectSeparatorProps {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <SelectSeparator :class="cn('-mx-1 my-1 h-px bg-muted', props.class)" />
</template>
