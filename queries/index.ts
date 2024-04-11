import { queries as app } from './app';
import { queries as assignments } from './assignments';
import { queries as invites } from './invites';
import { queries as timecards } from './timecards';
import { queries as users } from './users';

export default {
  ...app,
  ...assignments,
  ...invites,
  ...timecards,
  ...users,
};
