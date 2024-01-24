<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { CompleteUser, InviteFormData, Role, User } from '~/types';
import { buildCompleteUser } from '~/utils/objectBuilders';
import { formatToPhone } from '~/utils/formatters';

enum SubViews {
  'employee' = 0,
  'admin' = 1,
  'client' = 2,
  'invite' = 3,
}

const { $confirm, $server, $toast } = useNuxtApp();
const queryClient = useQueryClient();
const userToView = ref(initCompleteUser());
const userId = useSupabaseUser().value!.id;

const usersQuery = useQuery({
  queryKey: ['people'],
  queryFn: async () => {
    const usersResponse = await $server.users.fetch.query({ userId });
    const geopointIds = Object.values(usersResponse.users).map(user => user.geopoint_id);

    const geopointsResponse = await $server.geopoints.get.query({ ids: geopointIds });
    const { geopoints } = geopointsResponse;

    const userIds = Object.values(usersResponse.users).map(user => user.id);
    const assignmentResponse = await $server.assignments.fetch.query({ userIds });
    const { assignments } = assignmentResponse;

    const users = Object.values(usersResponse.users).reduce(
      (acc: Record<string, CompleteUser>, user) => {
        let assignmentsRecords = {};

        if (user.role === 'employee')
          assignmentsRecords = Object.values(assignments).filter(assignment => assignment.employee_id === user.id);

        if (user.role === 'client')
          assignmentsRecords = Object.values(assignments).filter(assignment => assignment.client_id === user.id);

        acc[user.id] = buildCompleteUser(user, geopoints[user.geopoint_id], assignmentsRecords);

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
  mutationFn: async (inviteId: string) => await $server.auth.deleteInvite.mutate({ ids: [inviteId] }),
  onSuccess(_data, _variables, _context) {
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });
  },
});

const deleteUsersMutation = useMutation({
  mutationFn: async (userId: string) => await $server.users.delete.mutate({ userIds: [userId] }),
  onSuccess(_data, _variables, _context) {
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });
  },
});

const subViews = [
  {
    label: 'Employees',
    icon: 'pi pi-user',
  },
  {
    label: 'Admin',
    icon: 'pi pi-building',
  },
  {
    label: 'Clients',
    icon: 'pi pi-users',
  },
  {
    label: 'Invites',
    icon: 'pi pi-send',
  },
];

// TODO: Come up a with a much better way to handle view changes than this
const activeSubView = ref(SubViews.employee);
const isInviteFormVisible = ref(false);
const isAssignmentsListVisible = ref(false);
const isUserDetailsModalVisible = ref(false);
const tableData = computed((): User[] | InviteFormData[] => {
  if (!usersQuery.data.value)
    return [];

  const { admins, clients, employees, invites } = usersQuery.data.value;

  switch (activeSubView.value) {
    case 0:
      return Object.values(employees ?? {});
    case 1:
      return Object.values(admins ?? {});
    case 2:
      return Object.values(clients ?? {});
    case 3:
      return Object.values(invites ?? {});
    default:
      return [];
  }
});

function confirmDelete(event: MouseEvent, id: string) {
  if (activeSubView.value === SubViews.invite) {
    $confirm.require({
      message: 'Are you sure you want to delete this invite?',
      header: 'Delete Invite',
      icon: 'pi pi-exclamation-triangle m-2 text-red-500',
      accept: () => {
        deleteInviteMutation.mutate(id);

        $toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invite deleted',
          life: 2000,
        });
      },
      acceptClass: 'bg-red-500 p-button-danger p-button-danger-text mx-1',
      rejectClass: 'mx-1',
      target: event.target as HTMLElement,
    });
  }
  else {
    $confirm.require({
      message: 'Are you sure you want to delete this user?',
      header: 'Delete User',
      icon: 'pi pi-exclamation-triangle m-2 text-red-500',
      accept: () => {
        deleteUsersMutation.mutate(id);

        $toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted',
          life: 2000,
        });
      },
      acceptClass: 'bg-red-500 p-button-danger p-button-danger-text mx-1',
      rejectClass: 'mx-1',
      target: event.target as HTMLElement,
    });
  }
}

function getAvailableAssignments(assignedUsersIds: string[]) {
  if (!usersQuery.data.value)
    return {};

  const { clients, employees } = usersQuery.data.value;

  switch (activeSubView.value) {
    case SubViews.employee:
      return Object.values(clients ?? {}).filter(client => !assignedUsersIds.includes(client.id)).reduce(
        (acc: Record<string, { id: string, name: string }>, client) => {
          acc[client.id] = {
            id: client.id,
            name: `${client.last_name}, ${client.first_name}`,
          };

          return acc;
        },
        {},
      );
    case SubViews.client:
      return Object.values(employees ?? {}).filter(employee => !assignedUsersIds.includes(employee.id)).reduce(
        (acc: Record<string, { id: string, name: string }>, employee) => {
          acc[employee.id] = {
            id: employee.id,
            name: `${employee.last_name}, ${employee.first_name}`,
          };

          return acc;
        },
        {},
      );
    default:
      return {};
  }
}

async function showUserDetails(id: string) {
  if (!usersQuery.data.value)
    return;

  const { admins, clients, employees } = usersQuery.data.value;

  switch (activeSubView.value) {
    case SubViews.employee:
      userToView.value = employees[id];
      break;
    case SubViews.admin:
      userToView.value = admins[id];
      break;
    case SubViews.client:
      userToView.value = clients[id];
      break;
    default:
      break;
  }

  isUserDetailsModalVisible.value = true;
}

function showAssignmentsList(id: string) {
  if (!usersQuery.data.value)
    return;

  const { admins, clients, employees } = usersQuery.data.value;

  switch (activeSubView.value) {
    case SubViews.employee:
      userToView.value = employees[id];
      break;
    case SubViews.admin:
      userToView.value = admins[id];
      break;
    case SubViews.client:
      userToView.value = clients[id];
      break;
    default:
      break;
  }

  isAssignmentsListVisible.value = true;
}

definePageMeta({
  layout: 'main',
});
</script>

<template>
  <h1 class="text-left text-2xl font-semibold">
    People
  </h1>
  <div class="flex-basis-1/2 flex flex-shrink flex-grow justify-between">
    <TabMenu
      v-model:activeIndex="activeSubView"
      :model="subViews"
    >
      <template #item="{ item, index }">
        <div
          class="m-3 inline-flex items-center gap-2 p-3 text-base font-semibold hover:cursor-pointer hover:text-primary-500"
          :class="{
            'border-b border-solid border-b-primary-500 text-primary-500':
              activeSubView === index,
          }"
        >
          <i :class="item.icon" />
          <a>
            {{ item.label }}
          </a>
        </div>
      </template>
    </TabMenu>
    <div>
      <Button
        v-if="activeSubView !== SubViews.invite"
        class="w-fit p-2"
        @click="isInviteFormVisible = true"
      >
        Invite
      </Button>
    </div>
  </div>
  <p v-if="usersQuery.isLoading.value">
    Loading...
  </p>
  <DataView
    v-if="usersQuery.isSuccess.value"
    :value="tableData"
    layout="list"
    :rows="25"
    :paginator="true"
    paginator-position="bottom"
    data-key="id"
  >
    <template #list="slotProps">
      <div
        v-for="(item, index) in slotProps.items"
        :key="index"
        class="col-12"
      >
        <div class="inline-flex items-center w-full border border-gray-500 px-5 py-3">
          <div class="flex-grow">
            <div
              v-if="activeSubView !== 3"
              class="inline-flex justify-start gap-10 w-full"
            >
              <p>
                <b>Name: </b>{{ item.last_name }}, {{ item.first_name }}
              </p>
              <p>
                <b>Email: </b>
                <a
                  class="text-blue-400 hover:text-blue-600"
                  :href="`mailto:${item.email}`"
                >
                  {{ item.email }}
                </a>
              </p>
              <p>
                <b>Phone: </b>{{ formatToPhone(item.phone_number) }}
              </p>
            </div>
            <div
              v-else
              class="inline-flex justify-start gap-10 w-full"
            >
              <p>
                <b>Email: </b>{{ item.email }}
              </p>
              <p>
                <b>Role: </b>{{ item.role.toUpperCase() }}
              </p>
            </div>
          </div>
          <div class="space-x-2">
            <Button
              v-if="[SubViews.employee, SubViews.client].includes(activeSubView)"
              class="p-2"
              severity="secondary"
              icon="pi pi-users"
              @click="showAssignmentsList(item.id)"
            />
            <Button
              v-if="activeSubView !== 3"
              class="p-2"
              severity="info"
              icon="pi pi-info-circle"
              @click="showUserDetails(item.id)"
            />
            <Button
              class="p-2"
              severity="danger"
              icon="pi pi-trash"
              @click="(event) => confirmDelete(event, item.id)"
            />
          </div>
        </div>
      </div>
    </template>
  </DataView>
  <UserDetails
    :user="userToView"
    :is-visible="isUserDetailsModalVisible"
    @hide="isUserDetailsModalVisible = false"
  />
  <AssignmentsList
    :assignments="{
      assignments: userToView.assignments,
      available: getAvailableAssignments(Object.values(userToView.assignments ?? {}).map(assignment =>
        [SubViews.employee, SubViews.client].includes(activeSubView) ? assignment.client_id : assignment.employee_id),
      ),
    }"
    :is-visible="isAssignmentsListVisible"
    @hide="isAssignmentsListVisible = false"
  />
  <InviteUserForm
    :is-visible="isInviteFormVisible"
    :role="SubViews[activeSubView]"
    @hide="isInviteFormVisible = false"
  />
  <ConfirmPopup />
</template>

<style scoped></style>
