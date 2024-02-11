<script setup lang="ts">
import type { ListParams, NavItem, Role } from '~/types';

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
      size: 10,
    } as ListParams,
    icon: 'ph:users-three',
    visible: props.role === 'admin',
  },
]);
</script>

<template>
  <NavigationMenu class="bg-secondary text-primary">
    <NavigationMenuList class="w-full h-screen text-center flex flex-col justify-between">
      <div class="w-full flex flex-col justify-between h-full">
        <div>
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="{ name: item.name }"
          >
            <NavigationMenuItem
              v-if="item.visible"
              class="flex items-center gap-2 hover:cursor-pointer hover:bg-primary hover:text-secondary px-3 py-2"
            >
              <Icon :name="item.icon" />
              <NavigationMenuLink>
                {{ item.label }}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NuxtLink>
        </div>
        <div>
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
          <NuxtLink
            :to="{ name: 'Login' }"
            class="w-full hover:cursor-pointer"
            @click="emit('signOut')"
          >
            <NavigationMenuItem class="flex items-center gap-1 hover:bg-primary hover:text-secondary px-3 py-2">
              <Icon name="ph:sign-out" />
              <NavigationMenuLink>
                Sign Out
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NuxtLink>
        </div>
      </div>
    </NavigationMenuList>
  </NavigationMenu>
</template>
