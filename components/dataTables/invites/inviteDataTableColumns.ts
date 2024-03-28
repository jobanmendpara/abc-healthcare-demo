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
    accessorFn: row => (row.role.charAt(0).toUpperCase() + row.role.slice(1)),
  },
];
