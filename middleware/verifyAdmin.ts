import { api } from '~/plugins/server';
import { useSupabaseUser } from '#imports';

export default defineNuxtRouteMiddleware(async (_to, from) => {
  const user = useSupabaseUser();

  if (!user.value)
    return navigateTo({ name: 'index' });

  const isUserAdmin = await api.auth.verifyAdmin.query();

  if (!isUserAdmin)
    return navigateTo(from);
});
