import type { AuthTokenResponse } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import type { Role, SignInCredentials, SignUpFormData } from '~/types';
import { AppRoutes } from '~/types';

export const useAuthStore = defineStore('auth', () => {
  const { $client, $toast } = useNuxtApp();
  const { auth } = useSupabaseClient();
  const usersStore = useUsersStore();

  async function inviteUser(email: string, role: Role): Promise<void> {
    try {
      if (!validateEmail(email))
        throw new Error('Please enter a valid email.');

      await $client.auth.invite.mutate({ email, role });

      $toast.add({
        severity: 'success',
        detail: 'User invited',
        life: 2000,
      });
    }
    catch (error) {
      $toast.add({
        severity: 'error',
        detail: getUnknownErrorMessage(error),
        life: 2000,
      });
    }
  }

  async function signInWithCredentials(credentials: SignInCredentials): Promise<void> {
    try {
      const authResponse = await $client.auth.signInWithCredentials.mutate({ credentials }) as AuthTokenResponse['data'];

      await auth.setSession(authResponse.session!);

      navigateTo(AppRoutes.HOME);
    }
    catch (error) {
      $toast.add({
        severity: 'error',
        detail: getUnknownErrorMessage(error),
        life: 2000,
      });
    }
  }

  async function signInWithPhone(phone: string): Promise<void> {
    try {
      const authResponse = await $client.auth.signInWithPhone.mutate({ phone }) as AuthTokenResponse['data'];

      await auth.setSession(authResponse.session!);

      navigateTo(AppRoutes.HOME);
    }
    catch (error) {
      $toast.add({
        severity: 'error',
        detail: getUnknownErrorMessage(error),
        life: 2000,
      });
    }
  }

  async function signUp(signUpData: SignUpFormData): Promise<void> {
    const { email, password, phone } = signUpData.credentials;

    try {
      if (!validateEmail(email))
        throw new Error('Please enter a valid email.');

      if (phone && !validatePhone(phone))
        throw new Error('Please enter a valid phone number.');

      if (!validatePassword(password))
        throw new Error('Passwords must contain 1 lowercase, 1 uppercase, and 1 numerical character.');

      const { userId, role } = await $client.auth.signUp.mutate(signUpData.credentials);

      await usersStore.create(userId, role, signUpData);

      $toast.add({
        severity: 'success',
        summary: 'Signed Up!',
        detail: 'Check your email for a confirmation email.',
        life: 2000,
      });
    }
    catch (error) {
      $toast.add({
        severity: 'error',
        detail: getUnknownErrorMessage(error),
        life: 2000,
      });
    }
  }

  return {
    inviteUser,
    signInWithCredentials,
    signInWithPhone,
    signUp,
  };
});
