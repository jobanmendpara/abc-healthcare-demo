<script setup lang="ts">
import type { CompleteUser } from '~/types';
import { formatToPhone } from '~/utils/formatters';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object as PropType<CompleteUser>,
    default: () => ({ ...initUser(), ...initGeopoint() }),
  },
});
const emit = defineEmits(['hide']);
const visible = ref<boolean>(false);
const localUser = ref<CompleteUser>(initCompleteUser());

watch(
  () => props.isVisible,
  (newValue) => {
    visible.value = newValue;
  },
);
watch(
  () => props.user,
  (newValue) => {
    localUser.value = newValue;
  },
);
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="`User Details: ${props.user.first_name} ${props.user.last_name}`"
    @hide="$emit('hide')"
  >
    <p>
      <b>ID:</b> {{ user.id }}
    </p>
    <hr class="my-2">
    <p>
      <b>First Name:</b> {{ user.first_name }}
    </p>
    <p>
      <b>Middle Name:</b> {{ user.middle_name }}
    </p>
    <p>
      <b>Last Name:</b> {{ user.last_name }}
    </p>
    <p>
      <b>Email:</b> <a
        class="text-blue-400 hover:text-blue-600"
        :href="`mailto:${user.email}`"
      >
        {{ user.email }}
      </a>
    </p>
    <p>
      <b>Phone:</b> {{ formatToPhone(user.phone_number) }}
    </p>
    <p>
      <b>Address:</b> {{ user.geopoint.formatted_address }}
    </p>
    <p>
      <b>Apt Number:</b> {{ user.geopoint.apt_number }}
    </p>
  </Dialog>
</template>

<style scoped></style>
