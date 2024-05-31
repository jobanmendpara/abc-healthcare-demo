import { z } from 'zod';
import { publicProcedure } from '~/server/trpc/trpc';
import { roleEnumSchema, signUpFormDataSchema } from '~/types';
import { appRouter } from '~/server/trpc/root';

export const signUp = publicProcedure
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

    const signUpResponse = await db.auth.signUp({
      email,
      phone,
      password,
      options: {
        emailRedirectTo: `${useRuntimeConfig().public.baseUrl}/confirm?email=${input.email}`,
      },
    });
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
        geopoint: input.geopoint,
        phone_number: input.phone,
      },
    });

    return {
      userId: authResponse.data.user.id,
      role,
    };
  });
