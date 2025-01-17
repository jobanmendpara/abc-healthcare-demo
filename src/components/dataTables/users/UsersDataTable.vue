<script setup lang="ts" generic="TValue">
import type { ColumnDef } from '@tanstack/vue-table';

import {
  // eslint-disable-next-line unused-imports/no-unused-imports
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useVueTable,
} from '@tanstack/vue-table';
import { columns as defaultColumns } from '~/components/dataTables/users/usersDataTableColumns';
import type { User } from '~/types';

const props = defineProps({
  columns: {
    type: Array as PropType<ColumnDef<User, TValue>[]>,
    default: () => defaultColumns,
  },
  data: {
    type: Array as PropType<User[]>,
    default: () => [],
  },
  hasNextPage: {
    type: Boolean,
    default: false,
  },
  loading: {
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

const emit = defineEmits([
  'clickMenu',
  'clickUser',
  'update:page',
  'update:size',
  'showAssignments',
]);

const localPage = useVModel(props, 'page', emit);
const localSize = useVModel(props, 'size', emit);

const columnVisibility = ref<VisibilityState>({});

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    columnVisibility: {
      id: false,
    },
  },
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
      <template v-if="loading">
        <TableRow v-for="_row in Array.from({ length: localSize })">
          <TableCell v-for="_cell in Array.from({ length: 4 })">
            <Skeleton class="bg-gray-300 w-auto h-[20px] rounded-full" />
          </TableCell>
        </TableRow>
      </template>
      <template v-else>
        <TableRow
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          :data-state="row.getIsSelected() ? 'selected' : undefined"
          class="hover:cursor-pointer"
          @click="emit('clickUser', row.getValue('id'))"
        >
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
          >
            <FlexRender
              :render="cell.column.columnDef.cell"
              :props="cell.getContext()"
            />
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>
  <div class="flex items-center justify-between py-4 space-x-4">
    <Button
      variant="outline"
      size="sm"
      :disabled="localPage < 2"
      @click="goToPreviousPage"
    >
      Previous
    </Button>
    <div>
      <p class="bg-primary text-primary-foreground rounded-md px-7 py-1 text-center">
        {{ localPage }}
      </p>
    </div>
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
