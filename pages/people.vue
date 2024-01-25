<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import type { Assignment, CompleteUser, InviteFormData, Role, User } from '~/types';
import { buildCompleteUser } from '~/utils/objectBuilders';
import { formatToPhone } from '~/utils/formatters';

const { $confirm, $server, $toast } = useNuxtApp();
const queryClient = useQueryClient();
const { id: userId } = useSupabaseUser().value!;

const { getUserData } = useHelpers();
const { tableData } = useTable();
const { confirmDelete } = useDeleteModal();
const { activeSubView, tabs, SubViews } = useSubViews();
const { assignmentsListData, isAssignmentsListVisible, toggleAssignmentsList } = useAssignmentsList();
const { isInviteFormVisible, toggleInviteForm } = useInviteForm();
const { userToView, isUserDetailsVisible, toggleUserDetails } = useUserDetailsModal();

const { data: people, status: peopleQueryStatus } = useQuery({
  queryKey: ['people'],
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

const { mutate: deleteInviteMutation } = useMutation({
  mutationFn: async (inviteId: string) => await $server.auth.deleteInvite.mutate({ ids: [inviteId] }),
  onSuccess(_data, _variables, _context) {
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });
  },
});

const { mutate: deleteUsersMutation } = useMutation({
  mutationFn: async (userId: string) => await $server.users.delete.mutate({ userIds: [userId] }),
  onSuccess(_data, _variables, _context) {
    queryClient.invalidateQueries({
      queryKey: ['people'],
    });
  },
});

function useAssignmentsList() {
  const user = ref(initCompleteUser());
  const assignments = computed(() => {
    if (!people.value)
      return {};

    const { clients, employees } = people.value;
    const { assignments } = user.value;
    let clientIds: string[] = [];
    let employeeIds: string[] = [];

    switch (activeSubView.value) {
      case SubViews.employee:
        clientIds = Object.values(assignments ?? {}).map(assignment => assignment.client_id);

        return Object.values(clients ?? {}).filter(client => clientIds.includes(client.id)).reduce(
          (acc: Record<string, CompleteUser>, client) => {
            acc[client.id] = client;

            return acc;
          },
          {},
        );
      case SubViews.client:
        employeeIds = Object.values(assignments ?? {}).map(assignment => assignment.employee_id);

        return Object.values(employees ?? {}).filter(employee => employeeIds.includes(employee.id)).reduce(
          (acc: Record<string, CompleteUser>, employee) => {
            acc[employee.id] = employee;

            return acc;
          },
          {},
        );
      default:
        return {};
    }
  });
  const availableAssignments = computed(() => {
    if (!people.value)
      return {};

    const { clients, employees } = people.value;
    const { assignments } = user.value;
    let clientIds: string[] = [];
    let employeeIds: string[] = [];

    switch (activeSubView.value) {
      case SubViews.employee:
        clientIds = Object.values(assignments ?? {}).map(assignment => assignment.client_id);

        return Object.values(clients ?? {}).filter(client => !clientIds.includes(client.id)).reduce(
          (acc: Record<string, CompleteUser>, client) => {
            acc[client.id] = client;

            return acc;
          },
          {},
        );
      case SubViews.client:
        employeeIds = Object.values(assignments ?? {}).map(assignment => assignment.employee_id);

        return Object.values(employees ?? {}).filter(employee => !employeeIds.includes(employee.id)).reduce(
          (acc: Record<string, CompleteUser>, employee) => {
            acc[employee.id] = employee;

            return acc;
          },
          {},
        );
      default:
        return {};
    }
  });
  const assignmentsListData = computed(() => ({
    id: user.value.id,
    assignments: Object.values(assignments.value),
    available: Object.values(availableAssignments.value),
  }));

  const isAssignmentsListVisible = ref(false);

  function toggleAssignmentsList(id?: string) {
    if (id) {
      user.value = getUserData(id) ?? initCompleteUser();
      isAssignmentsListVisible.value = true;
    }
    else {
      user.value = initCompleteUser();
      isAssignmentsListVisible.value = false;
    }
  }

  return {
    assignmentsListData,
    isAssignmentsListVisible,
    toggleAssignmentsList,
  };
}

function useDeleteModal() {
  function confirmDelete(event: MouseEvent, id: string) {
    if (activeSubView.value === SubViews.invite) {
      $confirm.require({
        message: 'Are you sure you want to delete this invite?',
        header: 'Delete Invite',
        icon: 'pi pi-exclamation-triangle m-2 text-red-500',
        accept: () => {
          deleteInviteMutation(id);

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
          deleteUsersMutation(id);

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

  return {
    confirmDelete,
  };
}

function useHelpers() {
  function getUserData(id: string) {
    if (!people.value)
      return;

    const { admins, clients, employees } = people.value;

    switch (activeSubView.value) {
      case SubViews.employee:
        return employees[id];
      case SubViews.admin:
        return admins[id];
      case SubViews.client:
        return clients[id];
      default:
    }
  }

  return {
    getUserData,
  };
}

function useInviteForm() {
  const isInviteFormVisible = ref(false);

  function toggleInviteForm() {
    isInviteFormVisible.value = !isInviteFormVisible.value;
  }

  return {
    isInviteFormVisible,
    toggleInviteForm,
  };
}

function useSubViews() {
  enum SubViews {
    'employee' = 0,
    'admin' = 1,
    'client' = 2,
    'invite' = 3,
  }

  const activeSubView = ref(SubViews.employee);
  const tabs = [];
  tabs[SubViews.employee] = {
    label: 'Employees',
    icon: 'pi pi-user',
  };
  tabs[SubViews.admin] = {
    label: 'Admin',
    icon: 'pi pi-building',
  };
  tabs[SubViews.client] = {
    label: 'Client',
    icon: 'pi pi-clien',
  };
  tabs[SubViews.invite] = {
    label: 'Invites',
    icon: 'pi pi-send',
  };

  return {
    SubViews,
    activeSubView,
    tabs,
  };
}

function useTable() {
  const tableData = computed((): User[] | InviteFormData[] => {
    if (!people.value)
      return [];

    const { admins, clients, employees, invites } = people.value;

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

  return {
    tableData,
  };
}

function useUserDetailsModal() {
  const isUserDetailsVisible = ref(false);
  const userToView = ref(initCompleteUser());

  function toggleUserDetails(id?: string) {
    if (id)
      userToView.value = getUserDetails(id) ?? initCompleteUser();
    if (!id)
      userToView.value = initCompleteUser();

    isUserDetailsVisible.value = !isUserDetailsVisible.value;
  }

  function getUserDetails(id: string) {
    if (!people.value)
      return;

    const { admins, clients, employees } = people.value;

    switch (activeSubView.value) {
      case SubViews.employee:
        return employees[id];
      case SubViews.admin:
        return admins[id];
      case SubViews.client:
        return clients[id];
      default:
        break;
    }
  }

  return {
    getUserDetails,
    isUserDetailsVisible,
    toggleUserDetails,
    userToView,
  };
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
      :model="tabs"
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
  <p v-if="peopleQueryStatus === 'pending'">
    Loading...
  </p>
  <DataView
    v-if="peopleQueryStatus === 'success'"
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
              @click="toggleAssignmentsList(item.id)"
            />
            <Button
              v-if="activeSubView !== 3"
              class="p-2"
              severity="info"
              icon="pi pi-info-circle"
              @click="toggleUserDetails(item.id)"
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
    :is-visible="isUserDetailsVisible"
    @hide="toggleUserDetails"
  />
  <AssignmentsList
    :data="assignmentsListData"
    :is-visible="isAssignmentsListVisible"
    @hide="toggleAssignmentsList"
  />
  <InviteUserForm
    :is-visible="isInviteFormVisible"
    :role="SubViews[activeSubView]"
    @hide="toggleInviteForm"
  />
  <ConfirmPopup />
</template>

<style scoped></style>
