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
    latitude,
    longitude,
  }: {
    assignmentId: string;
    latitude: number;
    longitude: number;
  }) =>
    await $api.timecards.clockIn.mutate({
      assignmentId,
      latitude,
      longitude,
    }),
  onSuccess: (data) => {
    $toast.success('Verification code sent to client');
    emit('submit', data.id);
    isOpen.value = false;
    pause();
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

async function onSubmit() {
  mutate({
    assignmentId: props.assignmentId,
    latitude: coords.value.latitude,
    longitude: coords.value.longitude,
  });
}

watchEffect(() => {
  if (isOpen.value) {
    resume();
  }
});
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogTrigger>
      <Button>
        Clock In
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ localUser.first_name }} {{ localUser.last_name }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          Please confirm your location.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <p>Address: <span>{{ localUser.geopoint.formatted_address }}</span></p>
      <AlertDialogFooter class="space-y-5">
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          class="w-full"
          :disabled="isPending"
          @click="onSubmit"
        >
          Verify Location
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
