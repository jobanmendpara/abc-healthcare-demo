<script setup lang="ts">
import type { PageParams } from '@supabase/supabase-js';
import type { NavItem, Role } from '~/types';

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String as PropType<Role>,
    default: 'employee',
  },
});

const emit = defineEmits(['signOut', 'toggleDarkMode', 'showAccountSettings']);

const { isMedium } = useScreen();

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
  <div class="w-screen bg-secondary text-primary md:w-full">
    <NavigationMenu :orientation="isMedium ? 'vertical' : 'horizontal'">
      <NavigationMenuList :class="`flex justify-between ${isMedium ? 'w-screen' : 'h-screen flex-col space-x-0'}`">
        <div class="w-full">
          <NavigationMenuItem v-if="isMedium">
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
          <NavigationMenuItem
            v-for="item in navItems"
            v-else
            class="w-full"
          >
            <NuxtLink
              class="flex items-center gap-1 p-3 hover:cursor-pointer hover:bg-primary hover:text-secondary"
              :to="{ name: item.name }"
            >
              <Icon :name="item.icon ?? ''" />
              <p>{{ item.label }}</p>
            </NuxtLink>
          </NavigationMenuItem>
        </div>
        <div :class="isMedium ? 'flex' : 'w-full'">
          <NavigationMenuItem>
            <div
              class="flex justify-center items-center gap-1 p-3 hover:cursor-pointer w-full hover:bg-primary hover:text-secondary"
              @click="emit('toggleDarkMode')"
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
          <NavigationMenuItem>
            <div
              class="flex justify-around items-center gap-1 p-3 hover:cursor-pointer w-full hover:bg-primary hover:text-secondary"
              @click="emit('showAccountSettings')"
            >
              <p v-if="!isMedium">
                Profile
              </p>
              <Icon name="lucide:user" />
            </div>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              class="flex justify-around items-center gap-1 p-3 hover:cursor-pointer hover:bg-primary hover:text-secondary"
              @click="emit('signOut')"
            >
              <p v-if="!isMedium">
                Sign Out
              </p>
              <Icon name="lucide:log-out" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
</template>
