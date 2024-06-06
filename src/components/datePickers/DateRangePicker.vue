<script setup lang="ts">
import { cn } from '~/lib/utils';

const props = defineProps({
  dateRange: {
    type: Object as PropType<{
      start: Date;
      end: Date;
    }>,
    default: () => ({
      start: new Date(),
      end: new Date(),
    }),
  },
});

const emit = defineEmits(['update:dateRange']);

const localDateRange = useVModel(props, 'dateRange', emit);
const isOpen = ref(false);

const dayjs = useDayjs();
const mergeClasses = cn;

function resetDateRange() {
  localDateRange.value = {
    start: dayjs().subtract(2, 'w').toDate(),
    end: new Date(),
  };
}
</script>

<template>
  <div class="flex justify-start items-center gap-3">
    <Popover v-model:open="isOpen">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :class="mergeClasses(
            'my-2 w-[300px] justify-start text-left font-normal hover:cursor-pointer',
            !localDateRange && 'text-muted-foreground',
          )"
        >
          <Icon
            name="lucide:calendar"
            class="mr-2"
          />
          <span>
            {{
              localDateRange.start
                ? (localDateRange.end
                  ? `${dayjs(localDateRange.start).format('MMM D, YYYY')} - ${dayjs(localDateRange.end).format('MMM D, YYYY')}`
                  : dayjs(localDateRange.start).format('MMM D, YYYY'))
                : 'Pick a date'
            }}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        class="w-auto"
        align="start"
      >
        <Calendar
          v-model.range="localDateRange"
          type="range"
          :columns="2"
        />
      </PopoverContent>
    </Popover>
    <Button
      variant="outline"
      @click="resetDateRange"
    >
      Reset
    </Button>
  </div>
</template>
