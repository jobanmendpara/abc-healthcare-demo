<script setup lang="ts">
import { keepPreviousData } from '@tanstack/vue-query';
import type { PageParams } from '@supabase/supabase-js';
import queries from '~/queries';
import { UsersPageViews } from '~/types';

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();

const { activeRole, activeView, setView, tabs } = useUsersPageController();

const usersTablePage = ref(1);
const invitesTablePage = ref(1);

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
  refetchOnMount: 'always',
});

const { data: invitesResponse, isFetching: isInvitesFetching } = useQuery({
  ...queries.invites.list(activeInvitesListParams),
  placeholderData: keepPreviousData,
  refetchOnMount: 'always',
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
    $toast.error(error.message);
  },
});

definePageMeta({
  layout: 'main',
  name: 'users',
  middleware: ['verify-admin'],
});

watchEffect(() => {
  if (activeView.value !== UsersPageViews.INVITES)
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
    <CreateClientDialog v-if="activeView === UsersPageViews.CLIENTS" />
    <InviteUserDialog
      v-else
      :role="activeRole"
    />
  </div>
  <div class="space-y-1">
    <Tabs
      v-model="activeView"
      class="w-full"
      @update:model-value="(newView: string) => setView(newView as UsersPageViews)"
    >
      <TabsList>
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab"
          :value="tab"
        >
          {{ tab }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <UsersDataTable
      v-if="activeView !== UsersPageViews.INVITES"
      v-model:page="usersTablePage"
      :data="usersResponse?.list"
      :has-next-page="usersResponse?.hasNextPage"
      :loading="isUsersFetching"
      @click-user="(id: string) => navigateTo({
        name: 'users-id',
        params: {
          id,
        },
      })"
    />
    <InvitesDataTable
      v-if="activeView === UsersPageViews.INVITES && invitesResponse"
      v-model:page="invitesTablePage"
      :data="invitesResponse.list"
      :has-next-page="invitesResponse?.hasNextPage"
      :loading="isInvitesFetching"
      @delete-invite="(id: string) => deleteInviteMutation.mutate(id)"
    />
  </div>
</template>
