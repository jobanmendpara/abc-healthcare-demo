import { create } from './create';
import { deleteUser } from './delete';
import { getById } from './getById';
import { list } from './list';
import { updateClient } from './updateClient';
import { updateSelf } from './updateSelf';

export default {
  create,
  delete: deleteUser,
  list,
  getById,
  updateClient,
  updateSelf,
};
