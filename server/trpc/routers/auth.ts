import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { appRouter } from '../root';
import { authorizedProcedure, createTRPCRouter, publicProcedure } from '~/server/trpc/trpc';
import { deleteInvite, inviteUser } from '~/server/db/helpers';
import { inviteRequest, loginCredentialsSchema, roleEnumSchema, userSchema } from '~/types';

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

      deleteInvite(db, ids);
    }),
  invite: authorizedProcedure
    .input(
      inviteRequest,
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

      inviteUser(db, input);
    }),
  loginWithCredentials: publicProcedure
    .input(z.object({
      credentials: loginCredentialsSchema,
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
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      phone: z.string().min(10),
      user: userSchema,
    }))
    .output(z.object({
      userId: z.string().uuid(),
      role: roleEnumSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { email, password, phone, user } = input;

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

      const caller = appRouter.createCaller(ctx);
      await caller.users.create({ user });

      return {
        userId: authResponse.data.user.id,
        role,
      };
    }),
});
