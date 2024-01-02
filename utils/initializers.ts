import type { Location, User } from '~/models';

export function initLocation(): Location {
  return {
    id: 0,
    latitude: 0,
    longitude: 0,
    aptNumber: '',
    formattedAddress: '',
  };
};

export function initUser(): User {
  return {
    id: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: initLocation(),
    role: 'employee',
    assignments: [],
  };
};
