import type { useToast } from 'primevue/usetoast';

export default defineNuxtPlugin((nuxtApp) => {
  const getToast: typeof useToast = () => nuxtApp.vueApp.config.globalProperties.$toast;

  return {
    provide: {
      toast: getToast(),
    },
  };
});
