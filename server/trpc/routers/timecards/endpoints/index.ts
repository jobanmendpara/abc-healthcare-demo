import { list } from './list';
import { clockIn } from './clockIn';
import { clockOut } from './clockOut';
import { deleteTimecard } from './delete';
import { getActive } from './getActive';
import { update } from './update';
import { verifyClockIn } from './verifyClockIn';

export default {
  clockIn,
  clockOut,
  delete: deleteTimecard,
  getActive,
  list,
  update,
  verifyClockIn,
};
