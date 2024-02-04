import type { ColumnDef } from '@tanstack/vue-table';
import type { User } from '~/types';

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'first_name',
    header: 'First Name',
  },
  {
    accessorKey: 'last_name',
    header: 'Last Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone_number',
    header: 'Phone',
    cell: (value) => {
      return formatToPhone(value.getValue() as string);
    },
  },
];
