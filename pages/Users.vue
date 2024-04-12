<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import type { PageParams } from '@supabase/supabase-js';
import queries from '~/queries';
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
const localUserId = computed(() => localUser.value.id);

const activeUsersListParams = computed<UsersListParams>(() => ({
  role: activeRole.value,
  page: usersTablePage.value,
  perPage: 10,
}));

const activeInvitesListParams = computed<PageParams>(() => ({
  page: invitesTablePage.value,
  perPage: 10,
}));

const { data: usersResponse, isFetching: isUsersFetching } = useQuery({
  ...queries.users.list(activeUsersListParams),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 60 * 3,
});

const { data: invitesResponse, isFetching: isInvitesFetching } = useQuery({
  ...queries.invites.list(activeInvitesListParams),
  placeholderData: keepPreviousData,
  staleTime: 1000 * 60 * 3,
});

// @ts-expect-error string as key
const { data: assignmentsData, status: assignmentsQueryStatus } = useQuery({
  ...queries.assignments.user(localUserId),
  staleTime: 1000 * 60 * 3,
  placeholderData: {
    assignable: [],
    assigned: [],
  },
  select: ({ assignable, assigned }: { assignable: AssignmentUser[]; assigned: Assignment[] }) => {
    const formattedAssignments = assigned.reduce((acc: AssignmentUser[], assignment) => {
      if (localUser.value.role === 'admin')
        return acc;

      const { id, first_name, last_name } = assignment[
        `${localUser.value.role === 'employee' ? 'client' : 'employee'}`
      ];
      acc.push({
        id,
        first_name,
        last_name,
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
    queryClient.invalidateQueries({
      queryKey: queries.assignments._def,
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

const updateAssignmentsMutation = useMutation({
  mutationFn: async (assignmentChanges: AssignmentChanges) => await $api.assignments.update.mutate(assignmentChanges),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queries.assignments._def,
    });
    isAssignmentsOpen.value = false;
    $toast.success('Assignments updated');
  },
  onError: (error) => {
    $toast.error(error);
  },
});

const updateUserMutation = useMutation({
  mutationFn: async (editedUser: Partial<User>) => await $api.users.updateClient.mutate(editedUser),
  onSuccess: () => {
    queryClient.invalidateQueries({
      ...queries.users.list(activeUsersListParams),
    });
    $toast.success('User updated');
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
  name: 'users',
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
    <CreateClientDialog v-if="activeView === Views.CLIENTS" />
    <InviteUserDialog
      v-else
      :role="activeRole"
    />
  </div>
  <div class="space-y-1">
    <Tabs
      v-model="activeView"
      class="w-full"
      @update:model-value="(newView: string) => setView(newView as Views)"
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
      @show-assignments="showAssignments"
    />
    <InvitesDataTable
      v-if="activeView === Views.INVITES && invitesResponse"
      v-model:page="invitesTablePage"
      :data="invitesResponse.list"
      :has-next-page="invitesResponse?.hasNextPage"
      :loading="isInvitesFetching"
      @delete-invite="(id: string) => deleteInviteMutation.mutate(id)"
    />
    <UserInfo
      v-model:open="isUserInfoOpen"
      :user="localUser"
      @delete-user="(id: string) => deleteUserMutation.mutate(id)"
      @update-user="(editedUser: Partial<User>) => updateUserMutation.mutate(editedUser)"
    />
    <AssignmentsPickList
      v-if="assignmentsQueryStatus !== 'pending' && assignmentsData"
      v-model:open="isAssignmentsOpen"
      :initial-assigned="assignmentsData.assigned"
      :initial-assignable="assignmentsData.assignable"
      :user="localUser"
      @submit="(assignmentChanges: Omit<AssignmentChanges, 'id'>) => updateAssignmentsMutation.mutate({
        id: localUser.id,
        ...assignmentChanges,
      })"
    />
  </div>
</template>
