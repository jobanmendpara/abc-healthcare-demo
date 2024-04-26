<script setup lang="ts">
import { cn } from '~/lib/utils';

// eslint-disable-next-line unused-imports/no-unused-imports
import { Calendar } from '~/components/ui/calendar';
import queries from '~/queries';

const { timecard } = defineProps({
  timecard: {
    type: Object as PropType<Timecard>,
    required: true,
  },
});
const emit = defineEmits<{
  submit: [payload: {
    id: string;
    newStartedValue: Date;
    newEndedValue: Date;
  }];
}>();

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();
const mergeClasses = cn;
const dayjs = useDayjs();

const startedDateRef = ref(dayjs(timecard.started_at).toDate());
const endedDateRef = ref(dayjs(timecard.ended_at).toDate());

const startedAtDate = computed({
  get: () => startedDateRef.value,
  set: val => startedDateRef.value = dayjs(val).toDate(),
});
const startedPeriod = ref<'AM' | 'PM'>(dayjs(startedDateRef.value).get('h') < 12 ? 'AM' : 'PM');

const endedAtDate = computed({
  get: () => endedDateRef.value,
  set: val => endedDateRef.value = dayjs(val).toDate(),
});
const endedPeriod = ref<'AM' | 'PM'>(dayjs(endedDateRef.value).get('h') < 12 ? 'AM' : 'PM');

const { mutate: update } = useMutation({
  mutationFn: async (input: {
    id: string;
    newStartedValue: Date;
    newEndedValue: Date;
  }) => await $api.timecards.update.mutate(input),
  onSuccess: () => {
    $toast.success('Updated');
    queryClient.invalidateQueries({
      queryKey: queries.timecards.list._def,
    });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

function onSubmit() {
  const startedDateTime = dayjs(startedAtDate.value).format(`${AppDateFormats.DATE} ${AppDateFormats.TIME}`);
  const startedDateTimePeriod = dayjs(`${startedDateTime} ${startedPeriod.value}`).format(`${AppDateFormats.DATE} ${AppDateFormats.TIME} A`);

  const endedDateTime = dayjs(endedAtDate.value).format(`${AppDateFormats.DATE} ${AppDateFormats.TIME}`);
  const endedDateTimePeriod = dayjs(`${endedDateTime} ${endedPeriod.value}`).format(`${AppDateFormats.DATE} ${AppDateFormats.TIME} A`);

  const isStartedDateTimePeriodValid = dayjs(startedDateTimePeriod).isValid();
  const isEndedDateTimePeriodValid = dayjs(endedDateTimePeriod).isValid();

  if (isStartedDateTimePeriodValid && isEndedDateTimePeriodValid) {
    update({
      id: timecard.id,
      newStartedValue: dayjs(startedDateTimePeriod).toDate(),
      newEndedValue: dayjs(endedDateTimePeriod).toDate(),
    });
  }
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="onSubmit"
  >
    <div class="flex-center flex-col gap-5">
      <div class="flex-center gap-3">
        <div>
          <Label>
            Started At
          </Label>
          <div class="flex-center gap-3">
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  :class="mergeClasses(
                    'ps-3 text-start font-normal gap-3',
                    !startedAtDate && 'text-muted-foreground',
                  )"
                >
                  <Icon
                    name="lucide:calendar"
                    class="ms-auto h-4 w-4 opacity-50"
                  />
                  <span>{{ formatToAppDate(startedAtDate) }}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar
                  v-model="startedAtDate"
                  @update:model-value="(val: Date) => startedAtDate = val"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <TimePicker
          v-model="startedAtDate"
          v-model:period="startedPeriod"
        />
      </div>
      <div class="flex-center gap-3">
        <div>
          <Label>
            Ended At
          </Label>
          <div class="flex-center gap-3">
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  :class="mergeClasses(
                    'ps-3 text-start font-normal gap-3',
                    !endedAtDate && 'text-muted-foreground',
                  )"
                >
                  <Icon
                    name="lucide:calendar"
                    class="ms-auto h-4 w-4 opacity-50"
                  />
                  <span>{{ formatToAppDate(endedAtDate) }}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0">
                <Calendar
                  v-model="endedAtDate"
                  @update:model-value="(val: Date) => endedAtDate = val"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <TimePicker
          v-model="endedAtDate"
          v-model:period="endedPeriod"
        />
      </div>
    </div>
    <Button
      class="w-full p-2"
      type="submit"
    >
      Update
    </Button>
  </form>
</template>
