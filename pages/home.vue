<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import { queries } from '~/queries';

const { $user } = useNuxtApp();

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

function toggleTimecardOTPDialog(timecardId: string) {
  timecardIdToVerify.value = timecardId;
  isPinVerificationModalOpen.value = true;
}

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
      class="space-y-3"
    >
      <h1 class="text-2xl font-semibold">
        Home
      </h1>
      <p>
        Currently there are no announcements from your admins.
      </p>
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
        <ClockInDialog
          :user="clients.get(assignment.client.id)"
          :assignment-id="assignment.id"
          @submit="(val: string) => toggleTimecardOTPDialog(val)"
        />
      </div>
    </div>
    <TimecardDialog
      v-for="timecard in activeTimecards"
      v-else-if="activeTimecards && activeTimecards.length >= 1"
      :key="timecard.id"
      :timecard="timecard"
      :name="getTimecardName(timecard.assignment?.id ?? '')"
    />
    <TimecardOTPDialog
      v-model:open="isPinVerificationModalOpen"
      :timecard-id="timecardIdToVerify"
    />
  </div>
</template>
