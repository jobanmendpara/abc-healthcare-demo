import type { ColumnDef } from '@tanstack/vue-table';
import type { Invite } from '~/types';

export const columns: ColumnDef<Invite>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];
