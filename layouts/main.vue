<script setup lang="ts">
import { usePrimeVue } from 'primevue/config';
import { AppRoutes } from '~/types';

const { auth } = useSupabaseClient();
const user = useSupabaseUser();
const primeVue = usePrimeVue();
const store = useAppStore();

const isDarkMode = ref<boolean>(store.isDarkMode);

const navItems = ref([
  {
    label: 'Home',
    route: '/home',
    icon: 'pi pi-home',
    visible: true,
    command: () => {
      navigateTo(AppRoutes.HOME);
    },
  },
  {
    label: 'People',
    route: '/people',
    icon: 'pi pi-user',
    visible: true,
    command: () => {
      navigateTo(AppRoutes.PEOPLE);
    },
  },
]);

function toggleTheme() {
  if (isDarkMode.value)
    primeVue.changeTheme('lara-dark-green', 'lara-light-green', 'theme');
  else primeVue.changeTheme('lara-light-green', 'lara-dark-green', 'theme');

  isDarkMode.value = !isDarkMode.value;
}

onBeforeMount(() => {
  if (user.value)
    store.hydrate(user.value.id);
  toggleTheme();
});
</script>

<template>
  <body class="container mx-auto grid h-screen grid-cols-[auto,1fr] gap-2 p-2">
    <div class="overflow-y-auto">
      <Menu :model="navItems">
        <template #item="{ item }">
          <NuxtLink :to="item.route">
            <div class="p-2">
              <i :class="item.icon" />
              {{ item.label }}
            </div>
          </NuxtLink>
        </template>
        <template #end>
          <hr class="mb-2">
          <div class="inline-flex w-full items-center justify-center gap-2 p-2">
            <i class="pi pi-sun" />
            <InputSwitch
              v-model="isDarkMode"
              @click="toggleTheme"
            />
          </div>
          <NuxtLink
            to="/"
            @click="auth.signOut()"
          >
            <div class="inline-flex w-full items-center justify-between gap-2 p-2 hover:bg-red-500">
              <p>Sign Out</p>
              <i class="pi pi-sign-out" />
            </div>
          </NuxtLink>
        </template>
      </Menu>
    </div>
    <main>
      <Card class="min-h-full overflow-y-auto">
        <template #content>
          <slot />
        </template>
      </Card>
    </main>
  </body>
</template>

<style scoped></style>
