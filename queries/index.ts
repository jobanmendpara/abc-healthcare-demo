import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import type { Role } from '~/types';

const { $server } = useNuxtApp();

interface PageDataRequest {
  page: number
  size: number
}

export const queries = createQueryKeyStore({
  invites: {
    page: ({ page, size }: PageDataRequest) => ({
      queryKey: [page],
      queryFn: $server.invites.list.query({ page, size }),
    }),
  },
  users: {
    page: ({
      userIds,
      role,
      page,
      size,
    }: {
      userIds: string[]
      role: Role
    } & PageDataRequest) => ({
      queryKey: [page],
      queryFn: $server.users.get.query({ userIds, page, size, role }),
    }),
  },
});
