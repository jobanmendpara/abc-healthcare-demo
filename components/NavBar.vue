<script setup lang="ts">
import type { PageParams } from '@supabase/supabase-js';
import { useDark } from '@vueuse/core';
import type { NavItem, Role } from '~/types';
import { queries } from '~/queries';

const props = defineProps({
  role: {
    type: String as PropType<Role>,
    default: 'employee',
  },
});

const emit = defineEmits(['signOut', 'toggleDarkMode']);

const queryClient = useQueryClient();
const { $api, $toast, $user } = useNuxtApp();
const { auth } = useSupabaseClient();
const isDarkMode = useDark();

const { mutate: signOut } = useMutation({
  mutationFn: async () => await auth.signOut({ scope: 'local' }),
  onSuccess: () => {
    $toast.success('Signed out successfully');
    navigateTo({ name: 'Login' });
  },
});

const toggleThemeMutation = useMutation({
  mutationFn: async () => await $api.userSettings.update.mutate({
    userSettings: [{ id: $user.value!.id, is_dark_mode: !isDarkMode.value }],
  }),
  onSuccess: () => {
    queryClient.invalidateQueries(queries.app.user($user.value!.id));
  },
  onError: (error) => {
    $toast.error(error);
  },
  onSettled: () => {
    emit('toggleDarkMode');
  },
});

const viewport = useViewport();

const navItems = computed<NavItem[]>(() => [
  {
    label: 'Home',
    name: 'Home',
    icon: 'lucide:home',
    visible: true,
  },
  {
    label: 'Users',
    name: 'Users',
    params: {
      role: 'employee',
      page: 1,
      perPage: 10,
    } as { role: Role } & PageParams,
    icon: 'lucide:users-round',
    visible: props.role === 'admin',
  },
  {
    label: 'Timecards',
    name: 'Timecards',
    icon: 'lucide:calendar-clock',
    visible: true,
  },
]);
</script>

<template>
  <div class="bg-secondary text-primary">
    <NavigationMenu>
      <NavigationMenuList class="flex justify-between w-screen md:w-auto md:h-screen md:flex-col md:space-x-0">
        <div class="w-full">
          <NavigationMenuItem v-if="viewport.isLessThan('md')">
            <NavigationMenuTrigger class="bg-secondary text-lg">
              <p>Menu</p>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div class="h-full">
                <div
                  v-for="item in navItems"
                  :key="item.label"
                >
                  <NuxtLink
                    v-if="item.visible"
                    class="flex items-center gap-1 p-3 hover:cursor-pointer hover:bg-primary hover:text-secondary"
                    :to="{ name: item.name }"
                  >
                    <Icon :name="item.icon ?? ''" />
                    <p>{{ item.label }}</p>
                  </NuxtLink>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <div
            v-for="item in navItems"
            v-else
            :key="item.label"
          >
            <NavigationMenuItem
              v-if="item.visible"
              class="w-full"
            >
              <NuxtLink
                class="flex items-center gap-1 p-3 hover:cursor-pointer hover:bg-primary hover:text-secondary"
                :to="{ name: item.name }"
              >
                <Icon :name="item.icon ?? ''" />
              </NuxtLink>
            </NavigationMenuItem>
          </div>
        </div>
        <div class="flex md:flex-col">
          <NavigationMenuItem>
            <div
              class="flex justify-center items-center gap-1 p-3 hover:cursor-pointer w-full hover:bg-primary hover:text-secondary"
              @click="toggleThemeMutation.mutate"
            >
              <Icon
                v-if="isDarkMode"
                name="lucide:sun"
              />
              <Icon
                v-else
                name="lucide:moon"
              />
            </div>
          </NavigationMenuItem>
          <NavigationMenuItem class="w-full">
            <NuxtLink
              class="flex items-center gap-1 p-3 hover:cursor-pointer hover:bg-primary hover:text-secondary"
              :to="{ name: 'Account' }"
            >
              <Icon name="lucide:user" />
            </NuxtLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              class="flex justify-around items-center gap-1 p-3 hover:cursor-pointer hover:bg-primary hover:text-secondary"
              @click="signOut"
            >
              <Icon name="lucide:log-out" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
