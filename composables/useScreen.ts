import { useWindowSize } from '@vueuse/core';

export function useScreen() {
  const { width } = useWindowSize();

  const isSmall = computed(() => width.value < 640);
  const isMedium = computed(() => width.value < 768);
  const isLarge = computed(() => width.value < 1024);
  const isXLarge = computed(() => width.value < 1280);
  const is2XLarge = computed(() => width.value < 1536);

  return {
    isSmall,
    isMedium,
    isLarge,
    isXLarge,
    is2XLarge,
  };
}
