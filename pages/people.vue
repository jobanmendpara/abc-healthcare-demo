<script setup lang="ts">
import type { UserRoles } from '~/models';

definePageMeta({
  layout: 'main',
});

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
const activeSubView = ref<number>(0);
const isInviteFormVisible = ref<boolean>(false);
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
        class="w-fit px-2"
        @click="isInviteFormVisible = true"
      >
        Invite
      </Button>
    </div>
  </div>
  <InviteUserForm
    :is-visible="isInviteFormVisible"
    :role="activeSubView === 0 ? 'employee' : 'admin'"
    @hide="isInviteFormVisible = false"
  />
</template>

<style scoped></style>
