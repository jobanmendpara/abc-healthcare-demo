import { defineStore } from 'pinia';

export const useAlertsStore = defineStore('app', () => {
  const isDarkMode = ref<boolean>(false);

  return {
    isDarkMode,
  };
});
