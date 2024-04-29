<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';

// eslint-disable-next-line unused-imports/no-unused-imports
import { TimecardsPageViews } from '~/types';
import queries from '~/queries';

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();
const dayjs = useDayjs();

const { activeView, setView, tabs } = useTimecardsPageController();

const filterDateRange = ref({
  start: dayjs().subtract(2, 'w').toDate(),
  end: new Date(),
});

const activeTimecardsListParams = computed(() => ({
  dateRange: {
    start: dayjs(filterDateRange.value.start).format('YYYY-MM-DD'),
    end: dayjs(filterDateRange.value.end).format('YYYY-MM-DD'),
  },
}));

const { data: approvedTimecards, isFetching: isTimecardsFetching } = useQuery({
  ...queries.timecards.list(activeTimecardsListParams),
  placeholderData: keepPreviousData,
});

const {
  data: pendingTimecards,
  isFetching: arePendingTimecardsFetching,
} = useQuery({
  ...queries.timecards.pending(),
  placeholderData: keepPreviousData,
});

const { mutate: deleteTimecard } = useMutation({
  mutationFn: async (id: string) => await $api.timecards.delete.mutate(id),
  onSuccess: () => {
    $toast.success('Timecard deleted');
    queryClient.invalidateQueries(queries.timecards.list(activeTimecardsListParams));
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

function exportTimecards(timecards: TableTimecard[]) {
  const data = timecards.map(timecard => ({
    'ID': timecard.id,
    'Employee': timecard.assignment.employee.name,
    'Client': timecard.assignment.client.name,
    'Started At': timecard.started_at,
    'Ended At': timecard.ended_at,
    'Active': timecard.is_active,
  }));

  useSheet().exportToSheet(data, 'timecards');
}

function getTableData() {
  const data = activeView.value === TimecardsPageViews.APPROVED
    ? approvedTimecards.value
    : pendingTimecards.value;
  if (!data) {
    return [];
  }

  return data;
}

definePageMeta({
  layout: 'main',
  name: 'timecards',
});
</script>

<template>
  <h1 class="text-left text-2xl font-semibold">
    Timecards
  </h1>
  <div class="space-y-1">
    <Tabs
      v-model="activeView"
      class="w-full"
      @update:model-value="(newView: TimecardsPageViews) => setView(newView)"
    >
      <TabsList>
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab"
          :value="tab"
        >
          {{ tab }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
  <div class="space-y-5">
    <div class="flex flex-row justify-between items-center w-full">
      <DateRangePicker v-model:dateRange="filterDateRange" />
    </div>
    <TimecardsDataTable
      :loading="isTimecardsFetching"
      :data="getTableData()"
      @export="(val: TableTimecard[]) => exportTimecards(val)"
      @delete="(val: string) => deleteTimecard(val)"
    />
  </div>
</template>
