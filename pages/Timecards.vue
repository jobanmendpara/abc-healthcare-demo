<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import dayjs from 'dayjs';
import { queries } from '~/queries';

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

const { data: timecards, isFetching: isTimecardsFetching } = useQuery({
  ...queries.timecards.list(activeTimecardsListParams),
  placeholderData: keepPreviousData,
  staleTime: 0,
});

definePageMeta({
  layout: 'main',
  name: 'Timecards',
});
</script>

<template>
  <h1 class="text-left text-2xl font-semibold">
    Timecards
  </h1>
  <DateRangePicker v-model:dateRange="filterDateRange" />
  <TimecardsDataTable
    :loading="isTimecardsFetching"
    :data="timecards"
  />
</template>
