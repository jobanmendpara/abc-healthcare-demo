import type { Role } from '~/types';
import { UsersPageViews } from '~/types';

export function useUsersPageController() {
  const defaultView = UsersPageViews.EMPLOYEES;
  const activeView = ref<UsersPageViews>(defaultView);
  const activeRole = computed<Role>(() => {
    if (activeView.value === UsersPageViews.EMPLOYEES)
      return 'employee';
    else if (activeView.value === UsersPageViews.ADMINS)
      return 'admin';
    else if (activeView.value === UsersPageViews.CLIENTS)
      return 'client';
    else
      return 'employee';
  });
  const tabs: UsersPageViews[] = [
    UsersPageViews.EMPLOYEES,
    UsersPageViews.ADMINS,
    UsersPageViews.CLIENTS,
    UsersPageViews.INVITES,
  ];

  function setView(view: UsersPageViews) {
    activeView.value = view;
  }

  return {
    activeRole,
    activeView,
    setView,
    tabs,
  };
}
