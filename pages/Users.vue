<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import { queries } from '~/queries';
import { Views } from '~/types';

const { $api, $toast, $user } = useNuxtApp();

const { isOpen: isUserInfoOpen, showUserInfo, user } = useUserInfo();
const { isOpen: isAssignmentsOpen, showAssignments } = useAssignments();
const { activeRole, activeView, setView, tabs } = useViewController();
const queryClient = useQueryClient();

const usersTablePage = ref(1);
const invitesTablePage = ref(1);
const localUserId = ref($user.value!.id);

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
const { data: assignmentsData } = useQuery({
  ...queries.assignments.user(localUserId),
  staleTime: 1000 * 60,
});

const deleteInviteMutation = useMutation({
  mutationFn: async (id: string) => await $api.auth.deleteInvite.mutate({ ids: [id] }),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: [],
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

definePageMeta({
  layout: 'main',
  name: 'Users',
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
    <InviteUserForm />
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
      @click-menu="(id: string) => localUserId = id"
      @show-info="showUserInfo(usersResponse!.list.find((user) => user.id === localUserId) || initUser())"
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
      :user="user"
      @delete-user="(id: string) => deleteUserMutation.mutate(id)"
    />
    <AssignmentsPickList
      v-if="assignmentsData"
      v-model:open="isAssignmentsOpen"
      :assigned="assignmentsData.assigned"
      :assignable="assignmentsData.assignable"
    />
  </div>
</template>
