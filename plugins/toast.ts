import type { useToast } from 'primevue/usetoast';

export default defineNuxtPlugin((nuxtApp) => {
  const getToast: typeof useToast = () => nuxtApp.vueApp.config.globalProperties.$toast;
  const toastService = getToast();

  return {
    provide: {
      toast: toastService,
    },
  };
});
