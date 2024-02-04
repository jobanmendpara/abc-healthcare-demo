import type { AppDatabaseClient } from '~/types';

export async function deleteInvite(db: AppDatabaseClient, ids: string[]) {
  const deleteInviteResults = await db.from('invites').delete().in('id', ids);
  if (deleteInviteResults.error)
    throw new Error(deleteInviteResults.error.message);

  ids.forEach(async (id) => {
    const deleteAuthResults = await db.auth.admin.deleteUser(id);
    if (deleteAuthResults.error)
      throw new Error(deleteAuthResults.error.message);
  });
}
