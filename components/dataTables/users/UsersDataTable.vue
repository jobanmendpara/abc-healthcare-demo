<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table';
import { FlexRender, getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { columns as defaultColumns } from '~/components/dataTables/users/usersDataTableColumns';
import type { CompleteUser } from '~/types';

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

const emits = defineEmits(['info', 'assignments']);

const useTable = useVueTable({
  get data() { return props.data; },
  get columns() { return props.columns; },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
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
            <UsersDataTableActions
              :id="(row.original as CompleteUser).id"
              @info="(id: string) => emits('info', id)"
              @assignments="(id: string) => emits('assignments', id)"
            />
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
  <div class="flex items-center justify-end py-4 space-x-2">
    <Button
      variant="outline"
      size="sm"
      :disabled="!useTable.getCanPreviousPage()"
      @click="useTable.previousPage()"
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="!useTable.getCanNextPage()"
      @click="useTable.nextPage()"
    >
      Next
    </Button>
  </div>
</template>
