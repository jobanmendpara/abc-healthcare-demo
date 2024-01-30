<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table';
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table';
import { columns as defaultColumns } from '~/components/dataTables/invites/inviteDataTableColumns';
import type { InviteFormData } from '~/types';

const props = defineProps({
  columns: {
    type: Array as PropType<ColumnDef<TData, TValue>[]>,
    default: () => defaultColumns,
  },
  data: {
    type: Array as PropType<TData[]>,
    default: () => [],
  },
});

const emit = defineEmits(['delete']);

const useTable = useVueTable({
  get data() { return props.data; },
  get columns() { return props.columns; },
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow
        v-for="headerGroup in useTable.getHeaderGroups()"
        :key="headerGroup.id"
      >
        <TableHead
          v-for="header in headerGroup.headers"
          :key="header.id"
        >
          <FlexRender
            v-if="!header.isPlaceholder"
            :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <template v-if="useTable.getRowModel().rows?.length">
        <TableRow
          v-for="row in useTable.getRowModel().rows "
          :key="row.id"
          :data-state="row.getIsSelected() ? 'selected' : undefined"
        >
          <TableCell
            v-for="cell in row.getVisibleCells() "
            :key="cell.id"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </TableCell>
          <TableCell>
            <InviteDataTableActions
              :id="(row.original as InviteFormData).id"
              @delete="(id: string) => emit('delete', id)"
            />
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
