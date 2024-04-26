<script setup lang="ts">
const dayjs = useDayjs();

const model = defineModel('modelValue', {
  type: Object as PropType<Date>,
  default: new Date(),
});
const period = defineModel('period', {
  type: String as PropType<'AM' | 'PM'>,
  default: 'AM',
});

const hours = computed({
  get: () => {
    const numHours = dayjs(model.value).get('hour');

    return numHours > 12 ? numHours - 12 : numHours;
  },
  set: val => model.value = dayjs(model.value).set('h', val).toDate(),
});
const minutes = computed({
  get: () => dayjs(model.value).get('m'),
  set: val => model.value = dayjs(model.value).set('m', val).toDate(),
});
const seconds = computed({
  get: () => dayjs(model.value).get('s'),
  set: val => model.value = dayjs(model.value).set('s', val).toDate(),
});
</script>

<template>
  <div class="flex-center gap-3">
    <div>
      <Label>Hours</Label>
      <Input
        v-model="hours"
        type="number"
        max="12"
        min="1"
        class="w-auto"
      />
    </div>
    <div>
      <Label>Minutes</Label>
      <Input
        v-model="minutes"
        type="number"
        max="59"
        min="0"
        class="w-auto"
      />
    </div>
    <div>
      <Label>Seconds</Label>
      <Input
        v-model="seconds"
        type="number"
        max="999"
        min="0"
        class="w-auto"
      />
    </div>
    <div>
      <Label>Period</Label>
      <Select
        v-model="period"
        class="p-2"
      >
        <SelectTrigger>
          <SelectValue placeholder="AM / PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="item in ['AM', 'PM']"
              :key="item"
              :value="item"
            >
              {{ item }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
