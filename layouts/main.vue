<script setup lang="ts">
import { usePrimeVue } from 'primevue/config';

const { auth } = useSupabaseClient();
const isDarkMode = ref<boolean>(true);

const PrimeVue = usePrimeVue();

const navItems = ref([
  {
    label: 'Home',
    route: '/home',
    icon: 'pi pi-home',
    visible: true,
    command: () => {
      navigateTo('/home');
    },
  },
  {
    label: 'People',
    route: '/people',
    icon: 'pi pi-user',
    visible: true,
    command: () => {
      navigateTo('/home');
    },
  },
]);

function toggleTheme() {
  if (isDarkMode.value)
    PrimeVue.changeTheme('lara-dark-green', 'lara-light-green', 'theme');
  else
    PrimeVue.changeTheme('lara-light-green', 'lara-dark-green', 'theme');

  isDarkMode.value = !isDarkMode.value;
}
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
              class=""
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
    <Toast />
  </body>
</template>

<style scoped></style>
