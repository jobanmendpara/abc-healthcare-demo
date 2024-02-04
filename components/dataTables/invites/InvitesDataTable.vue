<script setup lang="ts" generic="TValue">
import type { ColumnDef } from '@tanstack/vue-table';
import { FlexRender, getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { columns as defaultColumns } from '~/components/dataTables/invites/inviteDataTableColumns';
import type { InviteFormData } from '~/types';

const props = defineProps({
  columns: {
    type: Array as PropType<ColumnDef<InviteFormData, TValue>[]>,
    default: () => defaultColumns,
  },
  data: {
    type: Array as PropType<InviteFormData[]>,
    default: () => [],
  },
  hasNextPage: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Number,
    default: 1,
  },
  size: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(['update:page', 'update:size', 'delete']);

const localPage = useVModel(props, 'page', emit);
const localSize = useVModel(props, 'size', emit);

const table = useVueTable({
  get data() { return props.data; },
  get columns() { return props.columns; },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

function goToNextPage() {
  table.nextPage();
  localPage.value = table.getState().pagination.pageIndex + 1;
}

function goToPreviousPage() {
  table.previousPage();
  localPage.value = table.getState().pagination.pageIndex + 1;
}
</script>

<template>
  <Table>
    <TableHeader>
      <TableRow
        v-for="headerGroup in table.getHeaderGroups()"
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
      <template v-if="table.getRowModel().rows?.length">
        <TableRow
          v-for="row in table.getRowModel().rows "
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
  <div class="flex items-center justify-end py-4 space-x-2">
    <Button
      variant="outline"
      size="sm"
      :disabled="localPage < 2"
      @click="goToPreviousPage"
    >
      Previous
    </Button>
    <Button
      variant="outline"
      size="sm"
      :disabled="!hasNextPage"
      @click="goToNextPage"
    >
      Next
    </Button>
  </div>
</template>
