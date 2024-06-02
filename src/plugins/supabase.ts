import { defineNuxtPlugin, useSupabaseClient, useSupabaseUser } from '#imports';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      user: useSupabaseUser(),
      db: useSupabaseClient(),
    },
  };
});
