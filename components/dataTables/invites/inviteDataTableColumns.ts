import type { ColumnDef } from '@tanstack/vue-table';
import type { InviteFormData } from '~/types';

export const columns: ColumnDef<InviteFormData>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];
