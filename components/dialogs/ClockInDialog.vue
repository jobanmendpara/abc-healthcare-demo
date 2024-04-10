<script setup lang="ts">
import { useGeolocation } from '@vueuse/core';

const props = defineProps({
  user: {
    type: Object as PropType<User>,
    default: () => initUser(),
  },
  assignmentId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submit']);
const { $api, $toast } = useNuxtApp();

const { coords, resume, pause } = useGeolocation();
const localUser = computed(() => props.user);
const isOpen = ref(false);

const { mutate, isPending } = useMutation({
  mutationFn: async ({
    assignmentId,
    coords,
  }: {
    assignmentId: string;
    coords: Partial<GeolocationCoordinates>;
  }) =>
    await $api.timecards.clockIn.mutate({
      assignmentId,
      latitude: coords.latitude ?? 0,
      longitude: coords.longitude ?? 0,
    }),
  onSuccess: (data) => {
    $toast.success('Verification code sent to client');
    emit('submit', data.id);
    isOpen.value = false;
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function onSubmit() {
  mutate({
    assignmentId: props.assignmentId,
    coords: coords.value,
  });
}

watch(
  () => isOpen.value,
  (newVal) => {
    if (newVal) {
      resume();
    }
    else {
      pause();
    }
  },
);
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Clock In
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        {{ localUser.first_name }} {{ localUser.last_name }}
      </DialogTitle>
      <DialogDescription>
        Please confirm your location.
      </DialogDescription>
      <div class="space-y-5">
        <p>Address: <span>{{ localUser.geopoint.formatted_address }}</span></p>
        <Button
          class="w-full"
          :disabled="isPending"
          @click="onSubmit"
        >
          Verify Location
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
