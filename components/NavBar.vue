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

const isDarkMode = props.isDarkMode;

const navItems = computed<NavItem[]>(() => [
  {
    label: 'Home',
    name: 'Home',
    icon: 'ph:house',
    visible: true,
  },
  {
    label: 'Users',
    name: 'Users',
    params: {
      role: 'employee',
      page: 1,
      perPage: 10,
    } as PageParams,
    icon: 'ph:users-three',
    visible: props.role === 'admin',
  },
  {
    label: 'Timecards',
    name: 'Timecards',
    icon: 'ph:clock',
    visible: true,
  },
]);
</script>

<template>
  <NavigationMenu class="bg-secondary text-primary">
    <NavigationMenuList class="w-screen md:w-full md:h-screen text-center">
      <div class="w-full md:h-full flex flex-row md:flex-col justify-between items-center">
        <div class="md:w-full">
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="{ name: item.name }"
          >
            <NavigationMenuItem
              v-if="item.visible"
              class="flex items-center gap-2 hover:cursor-pointer hover:bg-primary hover:text-secondary px-3 py-2"
            >
              <Icon :name="item.icon ?? ''" />
              <NavigationMenuLink>
                {{ item.label }}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NuxtLink>
        </div>
        <div class="w-full">
          <div class="flex items-center">
            <NavigationMenuItem
              class="px-3 py-2 hover:cursor-pointer w-full hover:bg-primary hover:text-secondary"
              @click="emit('toggleDarkMode')"
            >
              <Icon
                v-if="isDarkMode"
                name="ph:sun-fill"
              />
              <Icon
                v-else
                name="ph:moon-fill"
              />
            </NavigationMenuItem>
            <NavigationMenuItem
              class="px-3 py-2 hover:cursor-pointer w-full hover:bg-primary hover:text-secondary"
              @click="emit('showAccountSettings')"
            >
              <Icon name="ph:gear" />
            </NavigationMenuItem>
          </div>
          <NavigationMenuItem class="px-3 py-2 hover:cursor-pointer w-full hover:bg-primary hover:text-secondary">
            <NavigationMenuLink
              class="flex justify-center items-center gap-2"
              @click="emit('signOut')"
            >
              <p>Sign Out</p>
              <Icon name="ph:sign-out" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </div>
      </div>
    </NavigationMenuList>
  </NavigationMenu>
</template>
