import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { appRouter } from '~~/server/trpc/root';
import { authorizedProcedure, createTRPCRouter, publicProcedure } from '~/server/trpc/trpc';
import {
  emailLoginSchema,
  invitesTableSchema,
  roleEnumSchema,
  signUpFormDataSchema,
} from '~/types';

export const authRouter = createTRPCRouter({
  deleteInvite: authorizedProcedure
    .input(z.object({
      ids: z.array(z.string().uuid()),
    }))
    .output(
      z.void(),
    )
    .mutation(async ({
      ctx: { db, requestor },
      input: { ids },
    }) => {
      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      const deleteInviteResults = await db.from('invites').delete().in('id', ids);
      if (deleteInviteResults.error)
        throw new Error(deleteInviteResults.error.message);

      ids.forEach(async (id) => {
        const deleteAuthResults = await db.auth.admin.deleteUser(id);
        if (deleteAuthResults.error)
          throw new Error(deleteAuthResults.error.message);
      });
    }),
  invite: authorizedProcedure
    .input(
      invitesTableSchema,
    )
    .output(
      z.void(),
    )
    .mutation(async ({
      ctx: { db, requestor },
      input,
    }) => {
      if (requestor.role !== 'admin')
        throw new TRPCError({ code: 'PRECONDITION_FAILED' });

      const { id: token, email, role } = input;
      const redirectTo = `${useRuntimeConfig().public.baseUrl}/signup?token=${token}`;

      const checkIfUserExistsQueryResult = await db.from('users').select().eq('email', email);
      if (checkIfUserExistsQueryResult.error)
        throw new Error(checkIfUserExistsQueryResult.error.message);
      if (checkIfUserExistsQueryResult.data.length > 0)
        throw new Error('User already exists.');

      const inviteUserResults = await db.auth.admin.inviteUserByEmail(email, {
        redirectTo,
      });
      if (inviteUserResults.error)
        throw new Error(inviteUserResults.error.message);

      const { id } = inviteUserResults.data.user;

      await db.from('invites').upsert(
        {
          id,
          email,
          role,
          token,
        },
        {
          onConflict: 'email',
        },
      ).select();
    }),
  loginWithEmail: publicProcedure
    .input(
      emailLoginSchema,
    )
    .output(z.object({
      user: z.unknown(),
      session: z.unknown(),
    }))
    .mutation(async ({ ctx: { db }, input }) => {
      const { data, error } = await db.auth.signInWithPassword(input);

      if (error)
        throw new Error(error.message);
      if (!data || !data.user || !data.session)
        throw new Error('No data returned.');

      return data;
    }),
  loginWithPhone: publicProcedure
    .input(
      z.object({ phone: z.string() }),
    )
    .output(z.object({
      user: z.unknown(),
      session: z.unknown(),
    }))
    .mutation(async ({
      ctx: { db },
      input: { phone },
    }) => {
      const { data, error } = await db.auth.signInWithOtp({ phone });

      if (error)
        throw new Error(error.message);

      return data;
    }),
  signUp: publicProcedure
    .input(
      signUpFormDataSchema,
    )
    .output(z.object({
      userId: z.string().uuid(),
      role: roleEnumSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { email, password, phone } = input;
      const caller = appRouter.createCaller(ctx);

      const getInviteResults = await db.from('invites').select().eq('email', email).single();
      if (getInviteResults.error)
        throw new Error(getInviteResults.error.message);

      const getDuplicateEmailResults = await db.from('users').select().eq('email', email);
      if (getDuplicateEmailResults.error)
        throw new Error(getDuplicateEmailResults.error.message);
      if (getDuplicateEmailResults.data.length > 0)
        throw new Error('User already exists.');

      const getDuplicatePhoneResults = await db.from('users').select().eq('phone_number', phone);
      if (getDuplicatePhoneResults.error)
        throw new Error(getDuplicatePhoneResults.error.message);
      if (getDuplicatePhoneResults.data.length > 0)
        throw new Error('User already exists.');

      const signUpResponse = await db.auth.signUp({ email, phone, password });
      if (signUpResponse.error)
        throw new Error(signUpResponse.error.message);

      const authResponse = await db.auth.admin.updateUserById(getInviteResults.data.id, { email, phone, password });
      if (authResponse.error)
        throw new Error(authResponse.error.message);

      const role = getInviteResults.data.role;
      await db.from('invites').delete().eq('email', email);

      await caller.users.create({
        user: {
          ...input,
          id: authResponse.data.user.id,
          role,
          is_active: true,
          geopoint_id: input.geopoint.id,
          phone_number: input.phone,
        },
      });

      return {
        userId: authResponse.data.user.id,
        role,
      };
    }),
  verifyAdmin: authorizedProcedure
    .input(
      z.void(),
    )
    .output(
      z.boolean(),
    )
    .query(async ({
      ctx: { requestor },
    }) => {
      return requestor.role === 'admin';
    }),
});
