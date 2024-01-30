import { toast } from 'vue-sonner';
import { defineNuxtPlugin } from '#imports';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast,
    },
  };
});
