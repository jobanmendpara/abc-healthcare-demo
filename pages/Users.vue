<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import { queries } from '~/queries';
import { Views } from '~/types';
import type { Assignment, AssignmentChanges, AssignmentUser } from '~/types';

const { $api, $toast, $user } = useNuxtApp();

const { isOpen: isUserInfoOpen, showUserInfo } = useUserInfo();
const { isOpen: isAssignmentsOpen, showAssignments } = useAssignments();
const { activeRole, activeView, setView, tabs } = useViewController();
const queryClient = useQueryClient();

const usersTablePage = ref(1);
const invitesTablePage = ref(1);
const localUser = ref<Omit<User, 'settings'>>(await useQueryClient().fetchQuery(queries.app.user($user.value!.id)));
const isInviteFormOpen = ref(false);
const localUserId = computed(() => localUser.value.id);

const activeUsersListParams = computed<UsersListParams>(() => ({
  role: activeRole.value,
  page: usersTablePage.value,
  size: 10,
}));

const activeInvitesListParams = computed<ListParams>(() => ({
  page: invitesTablePage.value,
  size: 10,
}));

// @ts-expect-error queryKeyFactory type error
const { data: usersResponse, isFetching: isUsersFetching } = useQuery({
  ...queries.users.list(activeUsersListParams),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 60,
});

// @ts-expect-error queryKeyFactory type error
const { data: invitesResponse, isFetching: isInvitesFetching } = useQuery({
  ...queries.invites.list(activeInvitesListParams),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 60,
});

// @ts-expect-error queryKeyFactory type error
const { data: assignmentsData, status: assignmentsQueryStatus } = useQuery({
  ...queries.assignments.user(localUserId),
  staleTime: 0,
  placeholderData: {
    assignable: [],
    assigned: [],
  },
  select: ({ assignable, assigned }: { assignable: AssignmentUser[], assigned: Assignment[] }) => {
    const formattedAssignments = assigned.reduce((acc: AssignmentUser[], assignment) => {
      if (localUser.value.role === 'admin')
        return acc;

      const { id, name } = assignment[
        `${localUser.value.role === 'employee' ? 'client' : 'employee'}`
      ];
      acc.push({
        id,
        name,
      });

      return acc;
    }, []);

    return {
      assigned: formattedAssignments,
      assignable,
    };
  },
});

const deleteInviteMutation = useMutation({
  mutationFn: async (id: string) => await $api.auth.deleteInvite.mutate({ ids: [id] }),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queries.invites.list._def,
    });
    $toast.success('Invite deleted');
  },
  onError: (error) => {
    $toast.error(error);
  },
});

const deleteUserMutation = useMutation({
  mutationFn: async (id: string) => await $api.users.delete.mutate({ userIds: [id] }),
  onSuccess: () => {
    queryClient.invalidateQueries({
      ...queries.users.list(activeUsersListParams),
    });
    $toast.success('User deleted');
  },
  onError: (error) => {
    $toast.error(error);
  },
  onSettled: () => {
    isUserInfoOpen.value = false;
  },
});

const inviteUserMutation = useMutation({
  mutationFn: async (inviteFormData: Invite) => await $api.auth.invite.mutate(inviteFormData),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queries.invites.list._def,
    });
    isInviteFormOpen.value = false;
    $toast.success('Invite sent');
  },
  onError: (error) => {
    $toast.error(error);
  },
});

const updateAssignmentsMutation = useMutation({
  mutationFn: async (assignmentChanges: AssignmentChanges) => await $api.assignments.update.mutate(assignmentChanges),
  onSuccess: () => {
    queryClient.invalidateQueries({
      ...queries.assignments.user(localUserId),
    });
    isAssignmentsOpen.value = false;
    $toast.success('Assignments updated');
  },
  onError: (error) => {
    $toast.error(error);
  },
});

function setUser(id: string) {
  localUser.value = usersResponse.value?.list.find(user => user.id === id) || initUser();
}

definePageMeta({
  layout: 'main',
  name: 'Users',
  middleware: ['verify-admin'],
});

watchEffect(() => {
  if (activeView.value !== Views.INVITES)
    usersTablePage.value = 1;
  else
    invitesTablePage.value = 1;
});
</script>

<template>
  <h1 class="text-left text-2xl font-semibold">
    Users
  </h1>
  <div class="flex-basis-1/2 flex justify-end flex-grow px-5">
    <InviteUserForm
      v-model:open="isInviteFormOpen"
      :is-mutation-pending="inviteUserMutation.status.value === 'pending'"
      @submit="(invite: Invite) => inviteUserMutation.mutate(invite)"
    />
  </div>
  <div class="space-y-1">
    <Tabs
      v-model="activeView"
      class="w-full"
      @update:model-value="(newView: Views) => setView(newView)"
    >
      <TabsList>
        <TabsTrigger
          v-for="tab in tabs"
          :value="tab"
        >
          {{ tab }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <UsersDataTable
      v-if="activeView !== Views.INVITES"
      v-model:page="usersTablePage"
      :data="usersResponse?.list"
      :has-next-page="usersResponse?.hasNextPage"
      :loading="isUsersFetching"
      @click-menu="(id: string) => setUser(id)"
      @show-info="showUserInfo(localUser)"
      @show-assignments="showAssignments()"
    />
    <InvitesDataTable
      v-if="activeView === Views.INVITES"
      v-model:page="invitesTablePage"
      :data="invitesResponse?.list"
      :has-next-page="invitesResponse?.hasNextPage"
      :loading="isInvitesFetching"
      @delete-invite="(id: string) => deleteInviteMutation.mutate(id)"
    />
    <UserInfo
      v-model:open="isUserInfoOpen"
      :user="localUser"
      @delete-user="(id: string) => deleteUserMutation.mutate(id)"
    />
    <AssignmentsPickList
      v-if="assignmentsQueryStatus !== 'pending'"
      v-model:open="isAssignmentsOpen"
      :initial-assigned="assignmentsData!.assigned"
      :initial-assignable="assignmentsData!.assignable"
      :user="localUser"
      @submit="(assignmentChanges: Omit<AssignmentChanges, 'id'>) => updateAssignmentsMutation.mutate({
        id: localUser.id,
        ...assignmentChanges,
      })"
    />
  </div>
</template>
