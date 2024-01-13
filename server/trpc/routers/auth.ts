import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/trpc/trpc';
import { AppRoutes, roleEnumSchema, signInCredentialsSchema } from '~/types';

export const authRouter = createTRPCRouter({
  invite: publicProcedure
    .input(z.object({
      email: z.string().email(),
      role: roleEnumSchema,
    }))
    .output(z.void())
    .mutation(async ({ ctx: { db }, input: { email, role } }) => {
      const checkIfUserExistsQueryResult = await db.from('users').select().eq('email', email);
      if (checkIfUserExistsQueryResult.error)
        throw new Error(checkIfUserExistsQueryResult.error.message);
      if (checkIfUserExistsQueryResult.data.length > 0)
        throw new Error('User already exists.');

      const inviteUserResults = await db.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${useRuntimeConfig().public.baseUrl}${AppRoutes.SIGN_UP}?email=${email}`,
      });
      if (inviteUserResults.error)
        throw new Error(inviteUserResults.error.message);

      const { id } = inviteUserResults.data.user;

      await db.from('invites').upsert(
        {
          id,
          email,
          role,
        },
        {
          onConflict: 'email',
        },
      ).select();
    }),
  signInWithCredentials: publicProcedure
    .input(z.object({
      credentials: signInCredentialsSchema,
    }))
    .output(z.object({
      user: z.unknown(),
      session: z.unknown(),
    }))
    .mutation(async ({ ctx: { db }, input: { credentials } }) => {
      const { data, error } = await db.auth.signInWithPassword(credentials);

      if (error)
        throw new Error(error.message);
      if (!data || !data.user || !data.session)
        throw new Error('No data returned.');

      return data;
    }),
  signInWithPhone: publicProcedure
    .input(z.object({ phone: z.string() }))
    .output(z.object({
      user: z.unknown(),
      session: z.unknown(),
    }))
    .mutation(async ({ ctx: { db }, input: { phone } }) => {
      const { data, error } = await db.auth.signInWithOtp({ phone });

      if (error)
        throw new Error(error.message);
      if (!data || !data.user || !data.session)
        throw new Error('No data returned.');

      return data;
    }),
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      phone: z.string().min(10),
    }))
    .output(z.object({
      userId: z.string().uuid(),
      role: roleEnumSchema,
    }))
    .mutation(async ({ ctx: { db }, input: { email, password, phone } }) => {
      const getInviteResults = await db.from('invites').select().eq('email', email).single();
      if (getInviteResults.error)
        throw new Error(getInviteResults.error.message);

      const signUpResponse = await db.auth.signUp({ email, password });
      if (signUpResponse.error)
        throw new Error(signUpResponse.error.message);

      const authResponse = await db.auth.admin.updateUserById(getInviteResults.data.id, { email, phone, password });
      if (authResponse.error)
        throw new Error(authResponse.error.message);

      const role = getInviteResults.data.role;
      await db.from('invites').delete().eq('email', email);

      return {
        userId: authResponse.data.user.id,
        role,
      };
    }),
});
