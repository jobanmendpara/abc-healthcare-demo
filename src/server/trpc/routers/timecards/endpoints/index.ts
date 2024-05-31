import { clockIn } from './clockIn';
import { clockOut } from './clockOut';
import { deleteTimecard } from './delete';
import { getActive } from './getActive';
import { list } from './list';
import { pending } from './pending';
import { update } from './update';
import { verifyClockIn } from './verifyClockIn';

export default {
  clockIn,
  clockOut,
  delete: deleteTimecard,
  getActive,
  list,
  pending,
  update,
  verifyClockIn,
};
