import type { AppDatabaseClient, Tables, User } from '~/types';

export async function getCompleteUsers(db: AppDatabaseClient, users: Tables<'users'>[]) {
  const geopointIds = users.map(user => user.geopoint_id);
  const { data: geopoints, error: geopointsError } = await db.from('geopoints').select().in('id', geopointIds);
  if (geopointsError)
    throw new Error(geopointsError.message);
  if (!geopoints)
    throw new Error('No geopoints associated with users.');

  const employeeIds = users.reduce((acc: Set<string>, user) => {
    if (user.role === 'employee')
      acc.add(user.id);
    return acc;
  }, new Set<string>());
  const clientIds = users.reduce((acc: Set<string>, user) => {
    if (user.role === 'client')
      acc.add(user.id);
    return acc;
  }, new Set<string>());

  const { data: employeeAssignments, error: employeeAssignmentsError } = await db.from('assignments').select().in('employee_id', Array.from(employeeIds));
  if (employeeAssignmentsError)
    throw new Error(employeeAssignmentsError.message);
  if (!employeeAssignments)
    throw new Error('No assignments associated with employees.');

  const { data: clientAssignments, error: clientAssignmentsError } = await db.from('assignments').select().in('client_id', Array.from(clientIds));
  if (clientAssignmentsError)
    throw new Error(clientAssignmentsError.message);
  if (!clientAssignments)
    throw new Error('No assignments associated with clients.');

  const completeUsers = users.reduce((acc: Set<User>, user) => {
    const geopoint = geopoints.find(geopoint => geopoint.id === user.geopoint_id) ?? initGeopoint();
    const assignments = user.role === 'employee'
      ? employeeAssignments.filter(assignment => assignment.employee_id === user.id)
      : clientAssignments.filter(assignment => assignment.client_id === user.id);

    acc.add({
      ...user,
      geopoint,
      assignments,
    });

    return acc;
  }, new Set<User>());

  return Array.from(completeUsers);
}
