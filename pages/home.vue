<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import { queries } from '~/queries';

const { $api, $toast, $user } = useNuxtApp();

const queryClient = useQueryClient();

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
  onSuccess: () => {
    $toast.success('Clocked in successfully');
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
    <div v-if="activeTimecards && activeTimecards.length < 1">
      <div
        v-if="clients && user && user.role === 'employee'"
        class="space-y-3"
      >
        <div
          v-for="assignment in user.assignments"
          :key="assignment.id"
          class="flex flex-row justify-between items-center border border-gray-500 p-4 text-lg"
        >
          <p>
            {{ assignment.client.name }}
          </p>
          <ClockInModal
            :user="clients.get(assignment.client.id)"
            @submit="(coords: GeolocationCoordinates) => clockInMutation.mutate({ assignmentId: assignment.id, coords })"
          />
        </div>
      </div>
    </div>
    <Timecard
      v-for="timecard in activeTimecards"
      v-else-if="activeTimecards && activeTimecards.length >= 1"
      :key="timecard.id"
      :timecard="timecard"
      :name="user?.assignments.find(assignment => assignment.id === timecard.assignment_id)?.client.name"
      @clock-out="(id: string) => clockOutMutation.mutate(id)"
    />
  </div>
</template>
