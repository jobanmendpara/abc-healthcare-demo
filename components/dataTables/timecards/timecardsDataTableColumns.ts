import type { ColumnDef } from '@tanstack/vue-table';
import type { TableTimecard } from '~/types';

export const columns: ColumnDef<TableTimecard>[] = [
  {
    accessorKey: 'index',
    header: '#',
  },
  {
    accessorKey: 'started_at',
    header: 'Start Time',
  },
  {
    accessorKey: 'ended_at',
    header: 'End Time',
  },
  {
    accessorKey: 'assignment.employee.name',
    header: 'Employee',
  },
  {
    accessorKey: 'assignment.client.name',
    header: 'Client',
  },
];
