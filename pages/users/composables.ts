import type { Role, User } from '~/types';

export enum Views {
  EMPLOYEES = 'Employees',
  ADMINS = 'Admins',
  CLIENTS = 'Clients',
  INVITES = 'Invites',
}

export function useUserInfo() {
  const user = ref<User | undefined>();
  const isOpen = ref(false);

  function showUserInfo(newUser: User) {
    isOpen.value = true;
    user.value = newUser;
  }

  return {
    isOpen,
    showUserInfo,
    user,
  };
}

export function useViewController() {
  const defaultView = Views.EMPLOYEES;
  const activeView = ref<Views>(defaultView);
  const activeRole = computed<Role>(() => {
    if (activeView.value === Views.EMPLOYEES)
      return 'employee';
    else if (activeView.value === Views.ADMINS)
      return 'admin';
    else if (activeView.value === Views.CLIENTS)
      return 'client';
    else
      return 'employee';
  });
  const tabs: Views[] = [
    Views.EMPLOYEES,
    Views.ADMINS,
    Views.CLIENTS,
    Views.INVITES,
  ];

  function setView(view: Views) {
    activeView.value = view;
  }

  return {
    activeRole,
    activeView,
    setView,
    tabs,
  };
}
