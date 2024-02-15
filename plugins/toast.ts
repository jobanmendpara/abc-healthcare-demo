import { toast as sonner } from 'vue-sonner';
import { defineNuxtPlugin } from '#imports';

export const toast = sonner;

export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast,
    },
  };
});
