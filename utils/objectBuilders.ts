import type { Assignment, CompleteUser, Geopoint, User } from '~/types';

export function buildCompleteUser(user: User, geopoint: Geopoint, assignments: Record<string, Assignment>): CompleteUser {
  return {
    id: user.id,
    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,
    is_active: user.is_active,
    role: user.role,
    geopoint,
    assignments,
  };
}
