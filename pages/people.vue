<script setup lang="ts">
import type { Invite, User } from '~/types';

const usersStore = useUsersStore();
const subViews = ref([
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
]);

// TODO: Come up a with a much better way to handle view changes than this
const activeSubView = ref(0);
const isConfirmDeleteFormVisible = ref(false);
const isInviteFormVisible = ref(false);
const tableData = computed((): User[] | Invite[] => {
  switch (activeSubView.value) {
    case 0:
      return Object.values(usersStore.users).filter((user: User) => user.role === 'employee');
    case 1:
      return Object.values(usersStore.users).filter((user: User) => user.role === 'admin');
    case 2:
      return Object.values(usersStore.users).filter((user: User) => user.role === 'client');
    case 3:
      return Object.values(usersStore.invites);
    default:
      return [];
  }
});

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
        v-if="activeSubView !== 3"
        class="w-fit p-2"
        @click="isInviteFormVisible = true"
      >
        Invite
      </Button>
    </div>
  </div>
  <DataView
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
            <p v-if="activeSubView !== 3">
              {{ item.last_name }}, {{ item.first_name }}
            </p>
            <p v-else>
              {{ item.email }}
            </p>
          </div>
          <Button
            class="p-2"
            severity="danger"
            :outlined="false"
            @click="isConfirmDeleteFormVisible = true"
          >
            Delete
          </Button>
        </div>
      </div>
    </template>
  </DataView>
  <InviteUserForm
    :is-visible="isInviteFormVisible"
    :role="activeSubView === 0 ? 'employee' : 'admin'"
    @hide="isInviteFormVisible = false"
  />
  <ConfirmAction
    :is-visible="isConfirmDeleteFormVisible"
    :header="`Delete ${activeSubView === 3 ? 'Invite' : 'User'}`"
    :prompt="`Are you sure you want to delete this ${activeSubView === 3 ? 'invite' : 'user'}?`"
    severity="danger"
    @hide="isConfirmDeleteFormVisible = false"
  />
</template>

<style scoped></style>
