import { create } from './create';
import { deleteUser } from './delete';
import { getAll } from './getAll';
import { getById } from './getById';
import { list } from './list';
import { updateEmployee } from './updateEmployee';
import { updateClient } from './updateClient';
import { updateSelf } from './updateSelf';

export default {
  create,
  delete: deleteUser,
  list,
  getAll,
  getById,
  updateEmployee,
  updateClient,
  updateSelf,
};
