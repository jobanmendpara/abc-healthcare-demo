import type { Role } from '~/types';
import { Views } from '~/types';

export function useUsersPageController() {
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
