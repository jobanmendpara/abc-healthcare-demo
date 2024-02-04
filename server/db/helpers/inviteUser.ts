import type { AppDatabaseClient, InviteRequest } from '~/types';

export async function inviteUser(db: AppDatabaseClient, invite: InviteRequest) {
  const { email, redirectTo, role } = invite;

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
    },
    {
      onConflict: 'email',
    },
  ).select();
}
