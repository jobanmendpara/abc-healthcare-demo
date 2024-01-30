<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Assignment, CompleteUser, Role } from '~/types';
import { buildCompleteUser } from '~/utils/objectBuilders';
import { queries } from '~/queries';

const { $server, $toast, $user } = useNuxtApp();
const { id: userId } = $user.value!;

const {
  usersData,
  inviteData,
} = useTable();
const { toggleAssignments } = useAssignments();
const { activeUser, isUserInfoOpen, setUserInfo } = useUserInfo();
const { getCompleteUser } = useHelpers();
const { activeView, tabs, Views } = useViewController();
const queryClient = useQueryClient();

function getRole(view: string): Role {
  switch (view) {
    case Views.EMPLOYEES:
      return 'employee';
    case Views.ADMINS:
      return 'admin';
    case Views.CLIENTS:
      return 'client';
    default:
      return 'employee';
  }
}

function usePageData() {
  const users = useQuery({
    ...queries.users.page({
      userIds: [userId],
      role: getRole(activeView.value),
      page: 1,
      size: 10,
    }),
    enabled: activeView.value !== Views.INVITES,
  });

  const invites = useQuery({
    ...queries.invites.page(1, 10),
  });

  return {
    users,
  };
}
const { data, status: usersQueryStatus } = useQuery({
  queryKey: [usersKeys.all],
  queryFn: async () => {
    const usersResponse = await $server.users.fetch.query({ userId });
    const geopointIds = Object.values(usersResponse.users).map(user => user.geopoint_id);

    const geopointsResponse = await $server.geopoints.get.query({ ids: geopointIds });
    const { geopoints } = geopointsResponse;

    const userIds = Object.values(usersResponse.users).map(user => user.id);
    const assignmentResponse = await $server.assignments.fetch.query({ userIds });
    const { assignments } = assignmentResponse;

    const assignmentsByUserId = Object.values(assignments).reduce(
      (acc: Record<string, Record<string, Assignment>>, assignment) => {
        if (!acc[assignment.employee_id]) {
          acc[assignment.employee_id] = {
            [assignment.id]: assignment,
          };
        }
        if (acc[assignment.employee_id])
          acc[assignment.employee_id][assignment.id] = assignment;

        if (!acc[assignment.client_id]) {
          acc[assignment.client_id] = {
            [assignment.id]: assignment,
          };
        }
        if (acc[assignment.client_id])
          acc[assignment.client_id][assignment.id] = assignment;

        return acc;
      },
      {},
    );

    const users = Object.values(usersResponse.users).reduce(
      (acc: Record<string, CompleteUser>, user) => {
        const completeUser = buildCompleteUser(user, geopoints[user.geopoint_id], assignmentsByUserId[user.id]);

        acc[user.id] = completeUser;

        return acc;
      },
      {},
    );

    function reduceByRole(role: Role) {
      return Object.values(users).filter(user => user.role === role).reduce(
        (acc: Record<string, CompleteUser>, user) => {
          acc[user.id] = user;

          return acc;
        },
        {},
      );
    }

    return {
      admins: reduceByRole('admin'),
      clients: reduceByRole('client'),
      employees: reduceByRole('employee'),
      invites: usersResponse.invites,
    };
  },
  staleTime: 1000 * 60 * 2,
});

const deleteInviteMutation = useMutation({
  mutationFn: async (id: string) => await $server.auth.deleteInvite.mutate({ ids: [id] }),
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
  mutationFn: async (id: string) => await $server.users.delete.mutate({ userIds: [id] }),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: [],
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

function useAssignments() {
  const isAssignmentsDetailsOpen = ref(false);

  function toggleAssignments(id?: string) {
    isAssignmentsDetailsOpen.value = !isAssignmentsDetailsOpen.value;
    if (id)
      activeUser.value = getCompleteUser(id);
  }

  return {
    isAssignmentsDetailsOpen,
    toggleAssignments,
  };
}

function useTable() {
  const usersData = computed(() => {
    const dataMap = new Map<string, CompleteUser[]>();
    dataMap.set(Views.EMPLOYEES, Object.values(data.value!.employees));
    dataMap.set(Views.ADMINS, Object.values(data.value!.admins));
    dataMap.set(Views.CLIENTS, Object.values(data.value!.clients));

    return dataMap;
  });

  const inviteData = computed(() => Object.values(data.value!.invites ?? {}));

  return {
    usersData,
    inviteData,
  };
}

function useUserInfo() {
  const activeUser = ref<CompleteUser>(initCompleteUser());
  const isUserInfoOpen = ref(false);

  function setUserInfo(id: string) {
    isUserInfoOpen.value = true;
    return activeUser.value = getCompleteUser(id);
  }

  return {
    activeUser,
    isUserInfoOpen,
    setUserInfo,
  };
}

function useViewController() {
  enum Views {
    EMPLOYEES = 'Employees',
    ADMINS = 'Admins',
    CLIENTS = 'Clients',
    INVITES = 'Invites',
  }

  const activeView = ref(Views.EMPLOYEES);
  const tabs: Record<string, Views> = {};
  tabs[Views.EMPLOYEES] = Views.EMPLOYEES;
  tabs[Views.ADMINS] = Views.ADMINS;
  tabs[Views.CLIENTS] = Views.CLIENTS;
  tabs[Views.INVITES] = Views.INVITES;

  return {
    activeView,
    Views,
    tabs,
  };
}

function useHelpers() {
  function getCompleteUser(id: string) {
    switch (activeView.value) {
      case Views.EMPLOYEES:
        return data.value!.employees[id];
      case Views.ADMINS:
        return data.value!.admins[id];
      case Views.CLIENTS:
        return data.value!.clients[id];
      default:
        return initCompleteUser();
    }
  }

  return {
    getCompleteUser,
  };
}

definePageMeta({
  layout: 'main',
  name: 'Users',
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
      v-model:modelValue="activeView"
      class="w-full"
      @update:model-value="(newValue: string) => activeView = tabs[newValue]"
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
    <p v-if="usersQueryStatus === 'pending'">
      Loading...
    </p>
    <div v-if="usersQueryStatus === 'success'">
      <UsersDataTable
        v-if="activeView !== Views.INVITES"
        :data="usersData.get(activeView)"
        @info="(id: string) => setUserInfo(id)"
        @assignments="(id: string) => toggleAssignments(id)"
      />
      <InvitesDataTable
        v-else
        :data="inviteData"
        @delete="(id: string) => deleteInviteMutation.mutate(id)"
      />
      <UserInfo
        v-model:open="isUserInfoOpen"
        v-model:user="activeUser"
        @delete="(id: string) => deleteUserMutation.mutate(id)"
      />
    </div>
  </div>
</template>
