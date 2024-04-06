<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import { queries } from '~/queries';

const { $api, $toast, $user } = useNuxtApp();

const queryClient = useQueryClient();
const isPinVerificationModalOpen = ref(false);
const timecardIdToVerify = ref('');

const { data: user, status } = useQuery({
  ...queries.app.user($user.value!.id),
  staleTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
});

const assignedClientIds = computed(() => {
  if (!user.value)
    return [];

  return user.value?.assignments.map(assignment => assignment.client.id);
});

const { data: clients } = useQuery({
  ...queries.users.id(assignedClientIds),
  placeholderData: keepPreviousData,
  staleTime: 0,
});

const { data: activeTimecards } = useQuery({
  ...queries.timecards.active(user.value!.id),
  refetchInterval: 1000 * 60 * 5,
  staleTime: Number.POSITIVE_INFINITY,
  select: (data) => {
    if (!data)
      return [];

    const output = data.map(timecard => ({
      ...timecard,
      assignment: {
        id: timecard.assignment!.id,
        client: timecard.assignment!.client[0],
        employee: timecard.assignment!.employee[0],
      },
    }));

    return output;
  },
  enabled: user.value?.role === 'employee',
});

const clockInMutation = useMutation({
  mutationFn: async ({
    assignmentId,
    coords,
  }: {
    assignmentId: string;
    coords: Pick<GeolocationCoordinates, 'latitude' | 'longitude'>;
  }) =>
    await $api.timecards.clockIn.mutate({
      assignmentId,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }),
  onSuccess: (data) => {
    timecardIdToVerify.value = data.id;
    $toast.success('Verification code sent to client');
    isPinVerificationModalOpen.value = true;
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    queryClient.invalidateQueries(queries.timecards.active(user.value!.id));
  },
});

const clockOutMutation = useMutation({
  mutationFn: async (id: string) => await $api.timecards.clockOut.mutate({
    timecardId: id,
  }),
  onSuccess: () => {
    $toast.success('Clocked out successfully');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    queryClient.invalidateQueries(queries.timecards.active(user.value!.id));
  },
});

const verifyClockInMutation = useMutation({
  mutationFn: async (pin: string) => await $api.timecards.verifyClockIn.mutate({
    timecardId: timecardIdToVerify.value,
    verificationCode: pin,
  }),
  onSuccess: () => {
    timecardIdToVerify.value = '';
    $toast.success('Clocked in');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    queryClient.invalidateQueries(queries.timecards.active(user.value!.id));
  },
});

function getTimecardName(assignmentId: string) {
  const firstName = user.value?.assignments.find(assignment => assignment.id === assignmentId)?.client.first_name;
  const lastName = user.value?.assignments.find(assignment => assignment.id === assignmentId)?.client.last_name;

  return `${firstName} ${lastName}`;
}

definePageMeta({
  layout: 'main',
  name: 'Home',
});
</script>

<template>
  <div class="space-y-10">
    <div
      v-if="status === 'success' && user"
      class="text-center"
    >
      <h1 class="text-left text-2xl font-semibold">
        Hi, {{ user.first_name }}
      </h1>
    </div>
    <div
      v-if="activeTimecards && activeTimecards.length < 1 && clients && user && user.role === 'employee'"
      class="space-y-3"
    >
      <div
        v-for="assignment in user.assignments"
        :key="assignment.id"
        class="flex flex-row justify-between items-center border border-gray-500 p-4 text-lg"
      >
        <p>
          {{ `${assignment.client.first_name} ${assignment.client.last_name}` }}
        </p>
        <ClockInModal
          :user="clients.get(assignment.client.id)"
          @submit="(coords: GeolocationCoordinates) => clockInMutation.mutate({ assignmentId: assignment.id, coords })"
        />
      </div>
    </div>
    <Timecard
      v-for="timecard in activeTimecards"
      v-else-if="activeTimecards && activeTimecards.length >= 1"
      :key="timecard.id"
      :timecard="timecard"
      :name="getTimecardName(timecard.assignment?.id ?? '')"
      @clock-out="(id: string) => clockOutMutation.mutate(id)"
    />
    <PinVerificationModal
      v-model:open="isPinVerificationModalOpen"
      @submit="(val: string) => verifyClockInMutation.mutate(val)"
    />
  </div>
</template>
