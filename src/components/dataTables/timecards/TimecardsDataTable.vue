<script setup lang="ts" generic="TValue">
import type { ColumnDef } from '@tanstack/vue-table';

// eslint-disable-next-line unused-imports/no-unused-imports
import { FlexRender, getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table';
import { columns as defaultColumns } from './timecardsDataTableColumns';
import type { TableTimecard, Timecard } from '~/types';
import queries from '~/queries';

const props = defineProps({
  data: {
    type: Array as PropType<Timecard[]>,
    default: () => [],
  },
  columns: {
    type: Array as PropType<ColumnDef<TableTimecard, TValue>[]>,
    default: () => defaultColumns,
  },
  hasNextPage: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(['delete', 'export', 'update:page', 'update:size']);

const { $user } = useNuxtApp();

const { data: user } = useQuery({
  ...queries.users.ids([$user.value!.id]),
  select: (data) => {
    return data.get($user.value!.id) ?? initUser();
  },
  initialData: new Map<string, User>(),
});

const localData = computed(() => {
  return props.data.map((timecard, index) => ({
    id: timecard.id,
    index: index + 1,
    started_at: formatToAppDateTimePeriod(timecard.started_at),
    ended_at: formatToAppDateTimePeriod(timecard.ended_at ?? ''),
    is_active: timecard.is_active,
    assignment: {
      id: timecard.assignment.id,
      client: {
        id: timecard.assignment.client?.id,
        name: `${timecard.assignment.client?.first_name} ${timecard.assignment.client?.last_name}`,
      },
      employee: {
        id: timecard.assignment.employee?.id,
        name: `${timecard.assignment.employee?.first_name} ${timecard.assignment.employee?.last_name}`,
      },
    },
    edited_count: timecard.edited_count,
  }));
});

const localPage = ref(1);
const localSize = useVModel(props, 'size', emit);

const table = useVueTable({
  get data() { return localData.value; },
  get columns() { return props.columns; },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

function goToNextPage() {
  table.nextPage();
  localPage.value += 1;
}

function goToPreviousPage() {
  table.previousPage();
  localPage.value -= 1;
}
</script>

<template>
  <div class="flex flex-row gap-3 justify-between items-center">
    <div class="flex flex-row justify-between items-center gap-7">
      <Button @click="emit('export', table.getFilteredSelectedRowModel().rows.map(row => row.original))">
        Export
      </Button>
      <p class="text-lg">
        Selected: {{ table.getFilteredSelectedRowModel().rows.length }} / {{ props.data.length }}
      </p>
    </div>
    <div class="space-x-3">
      <Button @click="table.toggleAllRowsSelected(true)">
        Select All
      </Button>
      <Button
        variant="outline"
        @click="table.toggleAllRowsSelected(false)"
      >
        Clear
      </Button>
    </div>
  </div>
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
          <TableCell
            v-if="user.role === 'admin'"
            class="flex-center gap-2"
          >
            <EditTimecardDialog
              :timecard="row.original"
            />
            <DeleteTimecardDialog
              @confirm="emit('delete', row.original.id)"
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
      :disabled="!table.getCanPreviousPage()"
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
      :disabled="!table.getCanNextPage()"
      @click="goToNextPage"
    >
      Next
    </Button>
  </div>
</template>
