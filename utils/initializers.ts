import type { Geopoint, User, UserSettings } from '~/types';

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
    geopoint_id: '',
    role: 'employee',
    is_active: false,
    geopoint: initGeopoint(),
    assignments: [],
  };
};

export function initUserSettings(id: string): UserSettings {
  return {
    id,
    is_dark_mode: false,
  };
}
