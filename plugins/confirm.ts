import type { useConfirm } from 'primevue/useconfirm';

export default defineNuxtPlugin((nuxtApp) => {
  const getConfirm: typeof useConfirm = () => nuxtApp.vueApp.config.globalProperties.$confirm;

  return {
    provide: {
      confirm: getConfirm(),
    },
  };
});
