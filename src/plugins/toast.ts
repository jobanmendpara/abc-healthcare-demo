import { Toaster, toast as sonner } from 'vue-sonner';
import { defineNuxtPlugin } from '#imports';

export const toast = sonner;

export default defineNuxtPlugin((app) => {
  app.vueApp.component('Toaster', Toaster);

  return {
    provide: {
      toast,
    },
  };
});
