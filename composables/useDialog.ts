export function useDialog() {
  const isOpen = ref(false);

  function show() {
    isOpen.value = true;
  }

  return {
    isOpen,
    show,
  };
}
