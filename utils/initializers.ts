import type { Geopoint, User } from '~/types';

export function initGeopoint(): Geopoint {
  return {
    id: '',
    latitude: 0,
    longitude: 0,
    apt_number: '',
    formatted_address: '',
  };
};

export function initUser(): User {
  return {
    id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    geopoint: initGeopoint(),
    role: 'employee',
    is_active: false,
  };
};
