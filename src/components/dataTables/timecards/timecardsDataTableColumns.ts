import type { ColumnDef } from '@tanstack/vue-table';
import { Checkbox } from '~/components/ui/checkbox';
import type { TableTimecard } from '~/types';

export const columns: ColumnDef<TableTimecard>[] = [
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'checked': table.getIsAllPageRowsSelected(),
      'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Select all',
    }),
    cell: ({ row }) => h(Checkbox, {
      'checked': row.getIsSelected(),
      'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
      'ariaLabel': 'Select row',
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'index',
    header: '#',
  },
  {
    accessorKey: 'started_at',
    header: 'Start Date Time',
  },
  {
    accessorKey: 'ended_at',
    header: 'End Date Time',
  },
  {
    accessorKey: 'assignment.employee.name',
    header: 'Employee',
  },
  {
    accessorKey: 'assignment.client.name',
    header: 'Client',
  },
  {
    accessorKey: 'edited_count',
    header: '# of Edits',
  },
];
