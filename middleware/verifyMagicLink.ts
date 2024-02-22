import type { AuthTokenResponse } from '@supabase/supabase-js';
import { api } from '~/plugins/server';
import { toast } from '~/plugins/toast';
import { useSupabaseClient } from '#imports';

export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { auth } = useSupabaseClient();

  const magicLinkLoginMutation = useMutation({
    mutationFn: async ({ email, token }: { email: string; token: string }) => await api.auth.loginWithMagicLink.mutate({ email, token }) as AuthTokenResponse['data'],
    onSuccess: async (data) => {
      if (!data.session)
        throw new Error('No session found in response');

      await auth.setSession(data.session);

      toast.success('Logged in successfully');

      navigateTo({ name: 'Home' });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!to.query.email)
    return;

  if (!to.query.token)
    return;

  const token = to.query.token.toString();
  const email = to.query.email.toString();

  magicLinkLoginMutation.mutate({ email, token });
});
