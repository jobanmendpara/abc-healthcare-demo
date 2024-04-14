<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import queries from '~/queries';

const dayjs = useDayjs();

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

const { data, isFetching: isTimecardsFetching } = useQuery({
  ...queries.timecards.list(activeTimecardsListParams),
  placeholderData: keepPreviousData,
  staleTime: 0,
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

definePageMeta({
  layout: 'main',
  name: 'timecards',
});
</script>

<template>
  <h1 class="text-left text-2xl font-semibold">
    Timecards
  </h1>
  <div class="space-y-5">
    <div class="flex flex-row justify-between items-center w-full">
      <DateRangePicker v-model:dateRange="filterDateRange" />
    </div>
    <TimecardsDataTable
      :loading="isTimecardsFetching"
      :data="data"
      @export="(val: TableTimecard[]) => exportTimecards(val)"
    />
  </div>
</template>
