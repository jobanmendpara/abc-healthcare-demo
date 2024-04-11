import type { inferQueryKeyStore } from '@lukemorales/query-key-factory';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import type { PageParams } from '@supabase/supabase-js';
import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker';
import { api } from '~/plugins/server';

export const queries = createQueryKeyStore({
  timecards: {
    active: (userId: MaybeRef<string>) => ({
      queryKey: [userId] as const,
      queryFn: async () => await api.timecards.getActive.query(),
    }),
    list: (input: MaybeRef<PageParams & { dateRange: DatePickerRangeObject }>) => ({
      queryKey: [input] as const,
      queryFn: async () => await api.timecards.list.query({
        dateRange: {
          start: toValue(input).dateRange.start.toString(),
          end: toValue(input).dateRange.end.toString(),
        },
      }),
    }),
  },
});

export type TimecardsQueryKeys = inferQueryKeyStore<typeof queries>;
